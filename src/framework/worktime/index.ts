import * as Prisma from '@prisma/sdk'
import chalk from 'chalk'
import { stripIndent } from 'common-tags'
import * as dotenv from 'dotenv'
import * as fs from 'fs-jetpack'
import { WorktimeLens, WorktimePlugin } from 'nexus/plugin'
import * as os from 'os'
import * as Path from 'path'
import { withDefaults } from '../lib/defaults'
import { Settings } from '../settings'
import * as Scaffolders from './scaffolders'
import { getGenerators } from './utils'
import { copyGlobalInterface } from '../lib/typegen'

export const plugin: WorktimePlugin<Settings> = (userSettings) => (p) => {
  const settings = withDefaults(userSettings, {
    migrations: true,
  })

  p.hooks.build.onStart = async () => {
    await runPrismaGenerators(p)
  }

  p.hooks.create.onAfterBaseSetup = async (hctx) => {
    if (hctx.database === undefined) {
      throw new Error(
        'Should never happen. Prisma plugin should not be installed if no database were chosen in the create workflow'
      )
    }
    copyGlobalInterface()
    const datasource = renderDatasource(hctx.database)
    await Promise.all([
      fs.appendAsync(
        '.gitignore',
        os.EOL +
          stripIndent`
                # Prisma
                failed-inferMigrationSteps*
              `
      ),
      fs.writeAsync(
        'prisma/schema.prisma',
        datasource +
          os.EOL +
          stripIndent`
              generator prisma_client {
                provider = "prisma-client-js"
              }
     
              model World {
                id         Int    @id @default(autoincrement())
                name       String @unique
                population Float
              }
            `
      ),
      fs.writeAsync(
        'prisma/.env',
        stripIndent`
          DATABASE_URL="${renderConnectionURI(
            { database: hctx.database, connectionURI: hctx.connectionURI },
            p.layout.project.name
          )}"
        `
      ),
      fs.writeAsync(
        'prisma/seed.ts',
        stripIndent`
          import { PrismaClient } from '@prisma/client'

          const db = new PrismaClient()
          
          main()
          
          async function main() {
            const worlds = [
              {
                name: 'Earth',
                population: 6_000_000_000,
              },
              {
                name: 'Mars',
                population: 0,
              },
            ]

            // Could use Promise.all
            // Sequential here so that world IDs match the array order above

            let results = []

            for (const world of worlds) {
              results.push(await db.world.create({ data: world }))
            }

            console.log('Seeded: %j', results)
          
            db.disconnect()
          }
        `
      ),
      fs.writeAsync(
        p.layout.sourcePath('graphql.ts'),
        stripIndent`
              import { schema } from "nexus"
      
              schema.objectType({
                name: "World",
                definition(t) {
                  t.model.id()
                  t.model.name()
                  t.model.population()
                }
              })
      
              schema.queryType({
                definition(t) {
                  t.field("hello", {
                    type: "World",
                    args: {
                      world: schema.stringArg({ required: false })
                    },
                    async resolve(_root, args, ctx) {
                      const worldToFindByName = args.world ?? 'Earth'
                      const world = await ctx.db.world.findOne({
                        where: {
                          name: worldToFindByName
                        }
                      })
      
                      if (!world) throw new Error(\`No such world named "\${args.world}"\`)
      
                      return world
                    }
                  })
  
                  t.list.field('worlds', {
                    type: 'World',
                    resolve(_root, _args, ctx) { 
                      return ctx.db.world.findMany()
                    }
                  })
                }
              })
            `
      ),
      fs.writeAsync(
        p.layout.sourcePath('app.ts'),
        stripIndent`
          import { use } from 'nexus'
          import { prisma } from 'nexus-plugin-prisma'

          use(prisma())
        `
      ),
    ])
    if (hctx.connectionURI || hctx.database === 'SQLite') {
      p.log.info('Initializing development database...')
      // TODO expose run on nexus
      await p.packageManager.runBin('prisma migrate save --create-db --name init --experimental', {
        require: true,
      })
      await p.packageManager.runBin('prisma migrate up -c --experimental', {
        require: true,
      })
      p.log.info('Generating Prisma Client JS...')
      await p.packageManager.runBin('prisma generate', { require: true })
      p.log.info('Seeding development database...')
      await p.packageManager.runBin('ts-node prisma/seed', {
        require: true,
      })
    } else {
      p.log.info(stripIndent`
            1. Please setup your ${
              hctx.database
            } and fill in the connection uri in your \`${chalk.greenBright('prisma/.env')}\` file.
          `)
      p.log.info(stripIndent`
              2. Run \`${chalk.greenBright(
                p.packageManager.renderRunBin('prisma migrate save --experimental')
              )}\` to create your first migration file.
          `)
      p.log.info(stripIndent`
            3. Run \`${chalk.greenBright(
              p.packageManager.renderRunBin('prisma migrate up --experimental')
            )}\` to migrate your database.
          `)
      p.log.info(stripIndent`
          4. Run \`${chalk.greenBright(
            p.packageManager.renderRunBin('prisma generate')
          )}\` to generate the Prisma Client.
        `)
      p.log.info(stripIndent`
            5. Run \`${chalk.greenBright(
              p.packageManager.renderRunBin('ts-node prisma/seed.ts')
            )}\` to seed your database.
          `)
      p.log.info(stripIndent`
            6. Run \`${chalk.greenBright(p.packageManager.renderRunScript('dev'))}\` to start working.
          `)
    }
  }
  // dev
  p.hooks.dev.onStart = async () => {
    await runPrismaGenerators(p)
  }

  p.hooks.dev.onFileWatcherEvent = async (_event, file, _stats, watcher) => {
    p.log.info('settings', { settings })
    if (file.match(/.*schema\.prisma$/)) {
      if (settings.migrations === true) {
        await promptForMigration(p, watcher, file)
      } else {
        await runPrismaGenerators(p)
        watcher.restart(file)
      }
    }
  }

  p.hooks.dev.addToWatcherSettings = {
    // TODO preferably we allow schema.prisma to be anywhere but they show up in
    // migrations folder too and we don't know how to achieve semantic "anywhere
    // but migrations folder"
    watchFilePatterns: ['./schema.prisma', './prisma/schema.prisma'],
    listeners: {
      app: {
        ignoreFilePatterns: ['./prisma/**', './schema.prisma'],
      },
      plugin: {
        allowFilePatterns: ['./schema.prisma', './prisma/schema.prisma'],
      },
    },
  }

  return plugin
}

/**
 * Compute the resolved settings of a generator which has its baked in manifest
 * but also user-provided overrides. This computes the merger of the two.
 */
function getGeneratorResolvedSettings(
  g: Prisma.Generator
): {
  name: string
  instanceName: string
  output: string
} {
  return {
    name: g.manifest?.prettyName ?? '',
    instanceName: g.options?.generator.name ?? '',
    output: g.options?.generator.output ?? g.manifest?.defaultOutput ?? '',
  }
}

type Database = 'SQLite' | 'MySQL' | 'PostgreSQL'
type ConnectionURI = string | undefined

const DATABASE_TO_PRISMA_PROVIDER: Record<Database, 'sqlite' | 'postgresql' | 'mysql'> = {
  SQLite: 'sqlite',
  MySQL: 'mysql',
  PostgreSQL: 'postgresql',
}

function renderDatasource(database: Database): string {
  const provider = DATABASE_TO_PRISMA_PROVIDER[database]

  return (
    stripIndent`
      datasource db {
        provider = "${provider}"
        url      = env("DATABASE_URL")
      }
    ` + os.EOL
  )
}

const DATABASE_TO_CONNECTION_URI: Record<Database, (projectName: string) => string> = {
  SQLite: (_) => 'file:./dev.db',
  PostgreSQL: (projectName) => `postgresql://postgres:postgres@localhost:5432/${projectName}`,
  MySQL: (projectName) => `mysql://root:<password>@localhost:3306/${projectName}`,
}

function renderConnectionURI(
  db: {
    database: Database
    connectionURI: ConnectionURI
  },
  projectName: string
): string {
  if (db.connectionURI) {
    return db.connectionURI
  }

  return DATABASE_TO_CONNECTION_URI[db.database](projectName)
}

/**
 * Execute all the generators in the user's PSL file.
 */
async function runPrismaGenerators(
  p: WorktimeLens,
  options: { silent: boolean } = { silent: false }
): Promise<void> {
  if (!options.silent) {
    p.log.info('Running generators')
  }

  const schemaPath = await findOrScaffoldPrismaSchema(p)

  loadEnv(p, schemaPath)

  p.log.trace('loading generators...')
  const generators = await getGenerators(p, schemaPath)
  p.log.trace('generators loaded.')

  for (const generator of generators) {
    const resolvedSettings = getGeneratorResolvedSettings(generator)
    p.log.trace('generating', resolvedSettings)
    await generator.generate()
    generator.stop()
    p.log.trace('done generating', resolvedSettings)
  }
}

export function loadEnv(p: WorktimeLens, schemaPath: string): void {
  const schemaDir = Path.dirname(schemaPath)
  let envPath: string | null = Path.join(schemaDir, '.env')

  // Look next to `schema.prisma`, other look in project root
  if (!fs.exists(envPath)) {
    envPath = Path.join(p.layout.projectRoot, '.env')
  }

  if (!fs.exists(envPath)) {
    p.log.trace(`No .env file found. Looked at: ${envPath}`)
    return
  }

  p.log.trace(`.env file found. Looked at: ${envPath}`)
  dotenv.config({ path: envPath })
}

/**
 * Find the PSL file in the project.
 */
async function findOrScaffoldPrismaSchema(p: WorktimeLens): Promise<string> {
  const projectRoot = p.layout.projectRoot
  const rootSchemaPath = Path.join(projectRoot, 'schema.prisma')
  const prismaSchemaPath = Path.join(projectRoot, 'prisma', 'schema.prisma')
  const [rootSchemaPathExists, prismaSchemaPathExists] = await Promise.all([
    fs.existsAsync(rootSchemaPath),
    fs.existsAsync(prismaSchemaPath),
  ])

  // todo warn when multiple found
  // todo what are the rules of where a prisma schema can be?
  // todo what if user has prisma schema in 4 different places? Shouldn't we
  // warn about all?

  if (prismaSchemaPathExists) return prismaSchemaPath
  if (rootSchemaPathExists) return rootSchemaPath

  // Scaffold an empty prisma schema

  await Scaffolders.emptySchema(prismaSchemaPath)

  const message = `An empty Prisma Schema has been created for you at ${chalk.bold(
    p.layout.projectRelative(prismaSchemaPath)
  )}`

  p.log.warn(message)

  return prismaSchemaPath
}

async function promptForMigration(
  p: WorktimeLens,
  watcher: {
    restart: (file: string) => void
    pause: () => void
    resume: () => void
  },
  file: string
) {
  watcher.pause()
  p.log.info('We detected a change in your Prisma Schema file.')
  p.log.info("If you're using Prisma Migrate, follow the step below:")
  p.log.info(
    `1. Run ${chalk.greenBright(
      p.packageManager.renderRunBin('prisma migrate save --experimental')
    )} to create a migration file.`
  )
  p.log.info(
    `2. Run ${chalk.greenBright(
      p.packageManager.renderRunBin('prisma migrate up --experimental')
    )} to apply your migration.`
  )
  await p.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'Press Y to restart once your migration is applied',
    initial: true,
    yesOption: '(Y)',
    noOption: '(Y)',
    yes: 'Restarting...',
    no: 'Restarting...',
  } as any)

  await runPrismaGenerators(p)
  watcher.restart(file)
}

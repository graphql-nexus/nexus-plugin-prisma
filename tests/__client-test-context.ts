import { LiftEngine } from '@prisma/migrate'
import { getGenerator } from '@prisma/sdk'
import * as fs from 'fs'
import getPort from 'get-port'
import { GraphQLClient } from 'graphql-request'
import { GraphQLServer } from 'graphql-yoga'
import { Server } from 'http'
import * as path from 'path'
import rimraf from 'rimraf'
import { getEngineVersion, getEnginePath } from './__ensure-engine'
import { generateSchemaAndTypes } from './__utils'

type RuntimeTestContext = {
  getContext: (args: {
    datamodel: string
    types: any[]
  }) => Promise<{
    graphqlClient: GraphQLClient
    dbClient: any
  }>
}

type GeneratedClient = {
  client: any
  teardown: () => Promise<void>
}

export function createRuntimeTestContext(): RuntimeTestContext {
  let generatedClient: GeneratedClient | null = null
  let httpServer: Server | null = null

  const teardownCtx = async () => {
    await generatedClient?.teardown()
    httpServer?.close()
  }

  /**
   * Teardown context after each test (stop client and graphql server)
   */
  afterEach(teardownCtx)

  return {
    async getContext({ datamodel, types }) {
      try {
        const prismaClient = await generateClientFromDatamodel(datamodel)
        generatedClient = prismaClient

        const serverAndClient = await getGraphQLServerAndClient(
          datamodel,
          types,
          prismaClient,
        )
        httpServer = serverAndClient.httpServer

        return {
          dbClient: prismaClient.client,
          graphqlClient: serverAndClient.client,
        }
      } catch (e) {
        await teardownCtx()
        throw e
      }
    },
  }
}

async function getGraphQLServerAndClient(
  datamodel: string,
  types: any[],
  prismaClient: { client: any; teardown(): Promise<void> },
) {
  const { schema } = await generateSchemaAndTypes(datamodel, types, {})
  const port = await getPort()
  const endpoint = '/graphql'
  const graphqlServer = new GraphQLServer({
    context: { prisma: prismaClient.client },
    schema: schema as any,
  })
  const client = new GraphQLClient(`http://localhost:${port}${endpoint}`)

  const httpServer = await graphqlServer.start({ port, endpoint })

  return { client, httpServer }
}

async function generateClientFromDatamodel(datamodelString: string) {
  const uniqId = Math.random().toString().slice(2)
  const tmpDir = path.join(__dirname, `nexus-prisma-tmp-${uniqId}`)

  fs.mkdirSync(tmpDir, { recursive: true })

  const clientDir = path.join(tmpDir, 'client')
  const projectDir = path.join(__dirname, '..')
  const datamodel = `
datasource db {
  provider = "sqlite"
  url      = "file:${tmpDir}/dev.db"
}

generator client {
  provider = "prisma-client-js"
  output   = "${clientDir}"
}

${datamodelString}
`
  const schemaPath = path.join(tmpDir, 'schema.prisma')

  fs.writeFileSync(schemaPath, datamodel)

  await migrateLift({
    projectDir,
    schemaPath,
    migrationId: 'init',
    datamodel,
  })

  const generator = await getGenerator({
    schemaPath,
    printDownloadProgress: false,
    baseDir: tmpDir,
    version: getEngineVersion(),
  })

  await generator.generate()
  generator.stop()

  const { PrismaClient } = require(path.join(clientDir, 'index.js'))
  const client = new PrismaClient()

  return {
    client,
    async teardown() {
      rimraf.sync(tmpDir)
      await client.disconnect()
    },
  }
}

async function migrateLift({
  projectDir,
  schemaPath,
  migrationId,
  datamodel,
}: {
  projectDir: string
  schemaPath: string
  migrationId: string
  datamodel: string
}): Promise<void> {
  /* Init Lift. */
  const lift = new LiftEngine({
    projectDir,
    schemaPath,
    binaryPath: await getEnginePath('migration'),
  })

  /* Get migration. */
  const {
    datamodelSteps,
    errors: stepErrors,
  } = await lift.inferMigrationSteps({
    migrationId,
    datamodel,
    assumeToBeApplied: [],
    sourceConfig: datamodel,
  })

  if (stepErrors.length > 0) {
    throw stepErrors
  }

  const { errors } = await lift.applyMigration({
    force: true,
    migrationId,
    steps: datamodelSteps,
    sourceConfig: datamodel,
  })

  if (errors.length > 0) {
    throw errors
  }

  const progress = () =>
    lift.migrationProgess({
      migrationId,
      sourceConfig: datamodel,
    })

  while ((await progress()).status !== 'MigrationSuccess') {
    /* Just wait */
  }

  lift.stop()
}

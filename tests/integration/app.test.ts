import * as cp from 'child_process'
import * as path from 'path'
import * as nexusBuilder from 'nexus/dist/builder'
import * as nexusPrisma from '../../src'
import * as fs from 'fs-extra'

beforeAll(async () => {
  await fs.mkdirp(relative('generated/nexus-types'))
})

afterAll(async () => {
  // NOTE
  // Comment out this line if you want to play around with the integration
  // test app in VSCode with actual IDE TS type check feedback.
  await fs.remove(relative('generated'))
})

// IDEA Future tests?
// - show we gracefully handle case of photon import failing

it('integrates together', async () => {
  // Run Prisma generation:
  // - Photon JS Client
  cp.execSync('../../node_modules/.bin/prisma2 generate', {
    cwd: __dirname,
  })

  // Run Nexus generation:
  // - Core TypeScript Declaration
  // - Prisma TypeScript Declaration
  // - GraphQL Schema
  //
  // NOTE
  // This also acts as a bootstrap phase, producing types that
  // enable subsequent type checks. A user currently has to figure
  // this part out on their own more or less.
  //
  await nexusPrisma.generateTypes({
    typegenPath: generatedPath(`nexus-types/prisma.d.ts`),
  })

  await nexusBuilder.generateSchema({
    types: [
      require('./app'),
      nexusPrisma.nexusPrismaPlugin({ photon: ctx => ctx.photon }),
    ],
    outputs: {
      typegen: generatedPath(`nexus-types/core.d.ts`),
      schema: generatedPath(`schema.graphql`),
    },
  })

  // Assert the app type checks. In effect this is testing that our
  // typegen works. Snapshot our generated files for manual correctness
  // tracking.
  //
  expect(relative('tsconfig.json')).toTypeCheck()
  expect(await getGenerated('schema.graphql')).toMatchSnapshot()
  expect(await getGenerated('nexus-types/prisma.d.ts')).toMatchSnapshot()
  expect(await getGenerated('nexus-types/core.d.ts')).toMatchSnapshot()
})

async function getGenerated(relPath: string): Promise<string> {
  return fs.readFile(path.join(generatedPath(relPath))).then(b => b.toString())
}

async function getRelative(relPath: string): Promise<string> {
  return fs.readFile(path.join(relative(relPath))).then(b => b.toString())
}

function generatedPath(relPath: string): string {
  return path.join(relative('generated'), relPath)
}

function relative(relPath: string): string {
  return path.join(__dirname, relPath)
}

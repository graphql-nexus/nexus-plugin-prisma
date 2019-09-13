import * as cp from 'child_process'
import * as path from 'path'
import * as nexusBuilder from 'nexus/dist/builder'
import * as nexusPrisma from '../../src'
import * as fs from 'fs-extra'

beforeAll(async () => {
  await fs.mkdirp(relative('generated/nexus-types'))
})

afterAll(async () => {
  // NOTE:
  // Comment out this line if you want to play around with the integration
  // test app in VSCode with actual IDE TS type check feedback.
  await fs.remove(relative('generated'))
})

it('integrates together', async () => {
  // Run Prisma generation:
  // - Photon JS Client
  await prismaGenerate()

  // Bootstrap Nexus generation that enables subsequent compilation
  // - Core TypeScript Declaration
  // - Prisma TypeScript Declaration
  // TODO

  // Run Nexus generation:
  // - Core TypeScript Declaration
  // - Prisma TypeScript Declaration
  // - GraphQL Schema
  await nexusGenerate()

  // Assert the app type checks. In effect this is testing that our
  // typegen works.
  expect(relative('tsconfig.json')).toTypeCheck()

  // Snapshot our generated results
  // - snapshot Nexus core TSD
  // - snapshot Nexus prisma TSD
  // - snapshot graphql schema
  // TODO
})

async function nexusGenerate() {
  await nexusPrisma.generateTypes({
    typegenPath: relative(`generated/nexus-types/prisma.d.ts`),
  })
  await nexusBuilder.generateSchema({
    types: [
      require('./app'),
      nexusPrisma.nexusPrismaPlugin({ photon: ctx => ctx.photon }),
    ],
    outputs: {
      typegen: relative(`generated/nexus-types/core.d.ts`),
      schema: relative(`generated/schema.graphql`),
    },
  })
}

async function prismaGenerate() {
  cp.execSync('../../node_modules/.bin/prisma2 generate', {
    cwd: __dirname,
  })
}

function relative(relPath: string): string {
  return path.join(__dirname, relPath)
}

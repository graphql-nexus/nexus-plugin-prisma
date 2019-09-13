import * as cp from 'child_process'
import * as path from 'path'
import * as nexusBuilder from 'nexus/dist/builder'
import * as nexusPrisma from '../../src'
import * as fs from 'fs-extra'

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
  // typegen works. Snapshot generated files for manual correctness
  // tracking. Generated files from deps are tracked too, for easier
  // debugging, learning, and detecting unexpected changes.
  //
  expect(relative('.')).toTypeCheck()
  expect(await getGenerated('schema.graphql')).toMatchSnapshot()
  expect(await getGenerated('nexus-types/prisma.d.ts')).toMatchSnapshot()
  expect(await getGenerated('nexus-types/core.d.ts')).toMatchSnapshot()
  expect(
    await getRelative('../../node_modules/@generated/photon/index.d.ts'),
  ).toMatchSnapshot()
  expect(
    await getRelative('../../node_modules/@generated/photon/index.js'),
  ).toMatchSnapshot()
})

beforeAll(async () => {
  // The idea here is as follows:
  //
  //   - We commit the generated files so that we can navigate the integration test
  //     fixture project like a real one
  //   - Upon a test, we want to start from scratch, though
  //   - The test will produce something identical to what was there before
  //   - If it does not, the snapshots will fail
  //
  // Yes, its a bit like having snapshots twice. But the files on disk and the snapshots
  // serve different purposes:
  //
  //   - Snapshots automate test suite failure on diff, great for CI, has purpose-built
  //     workflow to accept changes.
  //   - Committed generated files in fixture make it navigable and maintaining it more
  //     realisitc to a real app.

  await fs.emptyDir(relative('generated'))
  await fs.mkdirp(relative('generated/nexus-types'))
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

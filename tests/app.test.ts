import * as cp from 'child_process'
import * as path from 'path'
import * as nexusBuilder from 'nexus/dist/builder'
import * as nexusPrisma from '../src'
import * as fs from 'fs-extra'
import * as typeDefs from './__app/main'

// IDEA Future tests?
// - show we gracefully handle case of photon import failing

it('integrates together', async () => {
  // Setup file system vars & helpers
  //
  const projectRoot = path.join(__dirname, '/__app')

  async function projectReadFile(relPath: string): Promise<string> {
    return fs.readFile(path.join(projectRoot, relPath)).then(b => b.toString())
  }

  function projectPath(...paths: string[]): string {
    return path.join(projectRoot, ...paths)
  }

  // Remove generated files before test run. The idea here is as follows:
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
  //
  await fs.emptyDir(projectPath('/generated'))
  await fs.mkdirp(projectPath('/generated/nexus-types'))

  // Run Prisma generation:
  // - Photon JS Client
  //
  cp.execSync('../../node_modules/.bin/prisma2 generate', {
    cwd: projectRoot,
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
  const nexusPrismaTypeDefs = nexusPrisma.nexusPrismaPlugin({
    shouldGenerateArtifacts: true,
    outputs: {
      typegen: projectPath(`/generated/nexus-types/prisma.d.ts`),
    },
  })
  await nexusBuilder.generateSchema({
    types: [typeDefs, nexusPrismaTypeDefs],
    outputs: {
      typegen: projectPath(`/generated/nexus-types/core.d.ts`),
      schema: projectPath(`/generated/schema.graphql`),
    },
  })

  // Assert the app type checks. In effect this is testing that our
  // typegen works.
  //
  expect(projectRoot).toTypeCheck()

  // Snapshot generated files for manual correctness tracking.
  // Generated files from deps are tracked too, for easier debugging,
  // learning, and detecting unexpected changes.
  //
  const graphqlSchema = await projectReadFile('/generated/schema.graphql')
  const nexusPrismaTypeGen = await projectReadFile(
    '/generated/nexus-types/prisma.d.ts',
  )
  const nexusCoreTypegen = await projectReadFile(
    '/generated/nexus-types/core.d.ts',
  )
  const photonTSD = await projectReadFile(
    '../../node_modules/@generated/photon/index.d.ts',
  )
  const photonSource = (await projectReadFile(
    '../../node_modules/@generated/photon/index.js',
  ))
    .replace(/(path\.join\(__dirname, 'runtime\/).*('\);)/, '$1__STRIPPED__$2')
    .replace(/"output": ".*",/, '"output": "__STRIPPED__"')

  expect(graphqlSchema).toMatchSnapshot('graphql schema')
  expect(nexusPrismaTypeGen).toMatchSnapshot('nexus prisma typegen')
  expect(nexusCoreTypegen).toMatchSnapshot('nexus core typegen')
  expect(photonTSD).toMatchSnapshot('photon typescript declaration')
  expect(photonSource).toMatchSnapshot('photon source code')
})

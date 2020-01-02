import * as cp from 'child_process'
import * as path from 'path'
import * as nexusBuilder from 'nexus/dist/builder'
import * as NexusPrisma from '../src'
import * as fs from 'fs-extra'
import * as types from './__app/main'
import { mockConsoleLog } from './__utils'

// IDEA Future tests?
// - show we gracefully handle case of photon import failing

it('integrates together', async () => {
  // Setup file system vars & helpers
  //
  const projectRoot = path.join(__dirname, '/__app')

  const projectReadFile = (relPath: string): Promise<string> =>
    fs.readFile(path.join(projectRoot, relPath)).then(b => b.toString())

  const projectPath = (...paths: string[]): string =>
    path.join(projectRoot, ...paths)

  // Remove generated files before test run. The idea here is as follows:
  //
  //   - We commit the generated files so that we can easily inspect them
  //   - Upon a test, we want to start from scratch, though
  //   - The test will produce something identical to what was there before
  //   - If it does not, the snapshots will fail + git diff (redundant, though)
  //
  await Promise.all([
    fs.emptyDir(projectPath('/generated')),
    fs.emptyDir(projectPath('../../node_modules/@generated')),
  ])

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
  const nexusPrisma = NexusPrisma.nexusPrismaPlugin({
    shouldGenerateArtifacts: true,
    outputs: {
      typegen: projectPath(`/generated/nexus-prisma-typegen.d.ts`),
    },
  })

  process.env.NODE_ENV = 'development'

  const { $output } = await mockConsoleLog(async () => {
    await nexusBuilder.generateSchema({
      types,
      plugins: [nexusPrisma],
      shouldGenerateArtifacts: true,
      outputs: {
        typegen: projectPath(`/generated/nexus-typegen.d.ts`),
        schema: projectPath(`/generated/schema.graphql`),
      },
    })
  })

  // Snapshot generated files for manual correctness tracking.
  // Generated files from deps are tracked too, for easier debugging,
  // learning, and detecting unexpected changes.
  //
  const graphqlSchema = await projectReadFile('/generated/schema.graphql')
  const nexusPrismaTypeGen = await projectReadFile(
    '/generated/nexus-prisma-typegen.d.ts',
  )
  const nexusCoreTypegen = await projectReadFile(
    '/generated/nexus-typegen.d.ts',
  )
  const photonTSD = await projectReadFile(
    '../../node_modules/@prisma/photon/index.d.ts',
  )
  const photonSource = (
    await projectReadFile('../../node_modules/@prisma/photon/index.js')
  )
    .replace(
      /(path\.join\(__dirname, 'runtime\/).*('\);)/,
      '$1__NON_DETERMINISTIC_CONTENT__$2',
    )
    .replace(/"output": ".*",/, '"output": "__NON_DETERMINISTIC_CONTENT__"')

  expect(graphqlSchema).toMatchSnapshot('graphql schema')
  expect(nexusPrismaTypeGen).toMatchSnapshot('nexus prisma typegen')

  // For convenience
  expect(nexusCoreTypegen).toMatchSnapshot('nexus core typegen')
  expect(photonTSD).toMatchSnapshot('photon typescript declaration')
  expect(photonSource).toMatchSnapshot('photon source code')
  expect(require('@prisma/photon').dmmf).toMatchSnapshot('photon dmmf')
  expect($output).toMatchSnapshot('console.log output')

  // Assert the app type checks. In effect this is testing that our
  // typegen works.
  //
  expect(projectRoot).toTypeCheck()
})

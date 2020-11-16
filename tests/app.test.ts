import * as cp from 'child_process'
import * as fsjp from 'fs-jetpack'
import * as path from 'path'
import * as nexusBuilder from '@nexus/schema/dist/builder'
import { getImportPathRelativeToOutput } from '../src/utils'
import * as types from './__app/main'
import {
  createNexusPrismaInternal,
  mockConsoleLog
} from './__utils'

// IDEA Future tests?
// - show we gracefully handle case of Prisma Client JS import failing

it('integrates together', async () => {
  const fs = fsjp.cwd(path.join(__dirname, '__app'))

  // Remove generated files before test run. The idea here is as follows:
  //
  //   - We commit the generated files so that we can easily inspect them
  //   - Upon a test, we want to start from scratch, though
  //   - The test will produce something identical to what was there before
  //   - If it does not, the snapshots will fail + git diff (redundant, though)
  //
  fs.remove('generated')
  fs.remove('../node_modules/@generated')

  // Run Prisma generation:
  // - Prisma Client JS
  //
  cp.execSync('../../node_modules/.bin/prisma generate', {
    cwd: fs.cwd(),
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

  const nexusPrismaTypegenPath = fs.path(`generated/nexus-plugin-prisma-typegen.d.ts`)
  const typegenFacadePath = require.resolve('../src/typegen/static')
  const nexusPrisma = createNexusPrismaInternal({
    shouldGenerateArtifacts: true,
    outputs: {
      typegen: nexusPrismaTypegenPath,
    },
    experimentalCRUD: true,
    /**
     * Import nexus-prisma from the local typegen.d.ts file, as nexus-prisma is not installed
     */
    nexusPrismaImportId: getImportPathRelativeToOutput(
      path.dirname(nexusPrismaTypegenPath),
      typegenFacadePath
    ),
  })

  process.env.NODE_ENV = 'development'

  await mockConsoleLog(async () => {
    await nexusBuilder.generateSchema({
      types,
      plugins: [nexusPrisma],
      shouldGenerateArtifacts: true,
      outputs: {
        typegen: fs.path(`generated/nexus-typegen.d.ts`),
        schema: fs.path(`generated/schema.graphql`),
      },
    })
  })

  // Snapshot generated files for manual correctness tracking.
  // Generated files from deps are tracked too, for easier debugging,
  // learning, and detecting unexpected changes.
  //
  const graphqlSchema = fs.read('generated/schema.graphql')
  const nexusPrismaTypeGen = fs.read('generated/nexus-plugin-prisma-typegen.d.ts')

  expect(graphqlSchema).toMatchSnapshot('graphql schema')
  expect(nexusPrismaTypeGen).toMatchSnapshot('nexus prisma typegen')

  // For convenience
  expect(require('@prisma/client').dmmf).toMatchSnapshot('prisma client dmmf')

  // Assert the app type checks. In effect this is testing that our
  // typegen works.
  //
  expect(fs.cwd()).toTypeCheck()
})

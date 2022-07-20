import execa from 'execa'
import * as FS from 'fs-jetpack'
import { generateSchema } from 'nexus/dist/core'
import * as Path from 'path'
import { getImportPathRelativeToOutput } from '../src/utils'
import * as types from './__app/main'
import { createNexusPrismaInternal, mockConsoleLog } from './__utils'

// IDEA Future tests?
// - show we gracefully handle case of Prisma Client JS import failing

it('integrates together', async () => {
  const fs = FS.cwd(Path.join(__dirname, '__app'))

  // console.log(`running prisma generate in ${fs.cwd()}`);

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
  execa.sync('npx', ['prisma', 'generate'], {
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

  // console.log(`running nexus generate to ${nexusPrismaTypegenPath}`);
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
      Path.dirname(nexusPrismaTypegenPath),
      typegenFacadePath
    ),
  })

  process.env.NODE_ENV = 'development'

  await mockConsoleLog(async () => {
    await generateSchema({
      types,
      plugins: [nexusPrisma],
      shouldGenerateArtifacts: true,
      sourceTypes: {
        modules: [
          {
            module: require.resolve('@prisma/client/index.d.ts'),
            alias: "prisma",
          }
        ]
      },
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

  expect(removeNexusHeader(graphqlSchema)).toMatchSnapshot('graphql schema')
  expect(nexusPrismaTypeGen).toMatchSnapshot('nexus prisma typegen')

  // For convenience
  expect(require('@prisma/client').dmmf).toMatchSnapshot('prisma client dmmf')

  // Assert the app type checks. In effect this is testing that our
  // typegen works.
  //
  expect(fs.cwd()).toTypeCheck()
})

function removeNexusHeader(schema: string | undefined) {
  if (!schema) {
    return schema
  }

  return schema
    .split('\n')
    .filter((line) => line.startsWith('###') === false)
    .join('\n')
}

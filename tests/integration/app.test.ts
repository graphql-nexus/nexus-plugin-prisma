import * as cp from 'child_process'
import * as path from 'path'
import * as nexusBuilder from 'nexus/dist/builder'
import * as nexusPrisma from '../../src'

it('integrates together', async () => {
  await integrationTest()
})

function prismaGenerate() {
  cp.execSync('../../node_modules/.bin/prisma2 generate', {
    cwd: __dirname,
  })
}

async function integrationTest() {
  // Run Prisma generation: Photon JS Client
  prismaGenerate()

  // Bootstrap Nexus generation: TypeScript Declarations that enable subsequent compilation
  // TODO

  // Run Nexus generation: TypeScript Declaration, GraphQL Schema
  const nexusPrismaTypegenPath = path.join(
    __dirname,
    `generated/nexus-types/prisma.d.ts`,
  )
  const nexusTypegenPath = path.join(
    __dirname,
    `generated/nexus-types/core.d.ts`,
  )
  const graphqlSchemaPath = path.join(__dirname, `generated/schema.graphql`)
  await nexusPrisma.generateTypes({
    typegenPath: nexusPrismaTypegenPath,
  })
  await nexusBuilder.generateSchema({
    types: require('./graphql'),
    outputs: {
      typegen: nexusTypegenPath,
      schema: graphqlSchemaPath,
    },
  })
  // 2. snapshot nexus-core and nexus-prisma typegen
  // 3. snapshot graphql schema
  // 4. assert app Type check
  // 5. assert (manually) typegen snap
  // 6. assert (manually) graphql schema snap
}

// import * as join from 'path'
// import { generateSchema } from '../../src/builder'
// import ts from 'typescript'

// export const testSchema = (name: string) => {
//   it(`can compile ${name} app with its typegen`, async () => {
//     expect([appFilePath]).toTypeCheck({
//       sourceMap: false,
//       noEmitOnError: true,
//       esModuleInterop: true,
//       strict: true,
//       target: ts.ScriptTarget.ES5,
//       outDir: `/tmp/nexus-integration-test-${Date.now()}`,
//       noErrorTruncation: false,
//     })
//   })
// }

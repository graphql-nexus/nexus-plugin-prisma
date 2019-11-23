import { GraphQLServer } from 'graphql-yoga'
import * as cp from 'child_process'
import * as path from 'path'
import * as nexusBuilder from 'nexus/dist/builder'
import * as NexusPrisma from '../src'
import * as fs from 'fs-extra'
import * as types from './__app/main'
import { Photon } from '@generated/photon'

// IDEA Future tests?
// - show we gracefully handle case of photon import failing
const serve = async () => {
  // Setup file system vars & helpers
  //
  const projectRoot = path.join(__dirname, '/__app')

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

  const schema = await nexusBuilder.generateSchema({
    types,
    plugins: [nexusPrisma],
    shouldGenerateArtifacts: true,
    outputs: {
      typegen: projectPath(`/generated/nexus-typegen.d.ts`),
      schema: projectPath(`/generated/schema.graphql`),
    },
  })

  const server = new GraphQLServer({
    schema,
    context: { photon: new Photon() },
  })

  server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))
}

serve()

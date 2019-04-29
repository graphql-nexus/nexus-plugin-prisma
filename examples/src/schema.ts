import { makePrismaSchema } from 'nexus-prisma'
import * as path from 'path'
import datamodelInfo from './generated/nexus-prisma'
import { prisma } from './generated/prisma-client'
import * as allTypes from './resolvers'

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
export const schema = makePrismaSchema({
  types: allTypes,

  prisma: {
    datamodelInfo,
    client: prisma,
  },

  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },

  nonNullDefaults: {
    input: true,
    output: true,
  },

  typegenAutoConfig: {
    sources: [
      {
        source: path.join(__dirname, './context.ts'),
        alias: 'ctx',
      },
    ],
    contextType: 'ctx.Context',
  },
})

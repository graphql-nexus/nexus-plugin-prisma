import * as path from 'path'
import * as allTypes from './resolvers'
import { makePrismaSchema } from 'nexus-prisma'

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */

export const schema = makePrismaSchema({
  types: allTypes,

  prisma: {
    schemaPath: path.join(__dirname, './generated/prisma.graphql'),
    contextClientName: 'prisma',
  },

  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },

  nullability: {
    input: false,
    inputList: false,
  },

  typegenAutoConfig: {
    sources: [
      {
        module: path.join(__dirname, './generated/prisma-client/index.ts'),
        alias: 'prisma',
      },
      {
        module: path.join(__dirname, './context.ts'),
        alias: 'ctx',
      },
    ],
    contextType: 'ctx.Context',
  },
})

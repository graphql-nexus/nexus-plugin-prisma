import * as path from 'path'
import * as allTypes from './resolvers'
import { buildPrismaSchema } from '../../../src'

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */

export const schema = buildPrismaSchema({
  types: allTypes,

  prisma: {
    schemaPath: '__PRISMA__SCHEMA__PATH__',
    contextClientName: 'prisma',
  },

  outputs: {
    schema: path.join(__dirname, '../schema.graphql'),
    typegen: path.join(__dirname, './generated/gqliteral.ts'),
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

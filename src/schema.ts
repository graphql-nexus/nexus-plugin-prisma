import { makeSchema } from 'gqliteral'
import * as path from 'path'
import * as allTypes from './resolvers'

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */

// interface PrismaSchemaConfig<GenTypes = any>
//   extends core.Types.SchemaConfig<GenTypes> {
//   prismaSchemaPath: string
// }

// function buildPrismaSchema<GenTypes = GraphQLiteralGen>(
//   options: PrismaSchemaConfig<GenTypes>,
// ) {
//   return makeSchema(options)
// }

// export const prismaSchema = buildPrismaSchema({
//   types: allTypes,

//   prismaSchemaPath: '__PRISMA__SCHEMA__PATH__',

//   outputs: {
//     schema: path.join(__dirname, '../../schema.graphql'),
//     typegen: path.join(__dirname, '../generated/gqliteral.ts'),
//   },

//   typegen: {
//     imports: {
//       prisma: path.join(__dirname, '../generated/prisma-client/index.ts'),
//       ctx: path.join(__dirname, '../context.ts'),
//     },

//     contextType: 'ctx.Context',

//     rootTypes: {},
//   },
// })

export const schema = makeSchema({
  types: allTypes,

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

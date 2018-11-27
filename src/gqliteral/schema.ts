import { buildSchema, core } from 'gqliteral'
import * as path from 'path'
import * as allTypes from './types'

/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */

interface PrismaSchemaConfig<GenTypes = any> extends core.Types.SchemaConfig<GenTypes> {
  prismaSchemaPath: string
}

// class PrismaSchemaBuilder extends core.SchemaBuilder {
  
// }

// const buildPrismaSchema = ({ prismaSchemaPath }) => {


//   return buildSchema()
// }



export const prismaSchema = buildSchema({
  types: allTypes,

  outputs: {
    schema: path.join(__dirname, '../../schema.graphql'),
    typegen: path.join(__dirname, '../generated/gqliteral.ts'),
  },

  typegen: {
    imports: {
      prisma: path.join(__dirname, '../generated/prisma-client/index.ts'),
      ctx: path.join(__dirname, '../context.ts'),
    },

    contextType: 'ctx.Context',

    rootTypes: {
      User: 'prisma.User',
      //Post: 'prisma.Post',
    }, 
  },

  // plugins: [prismaPlugin],
})

export const schema = buildSchema({
  types: allTypes,

  outputs: {
    schema: path.join(__dirname, '../../schema.graphql'),
    typegen: path.join(__dirname, '../generated/gqliteral.ts'),
  },

  typegen: {
    imports: {
      prisma: path.join(__dirname, '../generated/prisma-client/index.ts'),
      ctx: path.join(__dirname, '../context.ts'),
    },

    contextType: 'ctx.Context',

    rootTypes: {
      User: 'prisma.User',
      //Post: 'prisma.Post',
    },


  },



  // plugins: [prismaPlugin],
})

import { makeSchema, mutationType, objectType, queryType } from '@nexus/schema'
import { PrismaClient } from '@prisma/client'
import { GraphQLServer } from 'graphql-yoga'
import { nexusPrismaPlugin } from 'nexus-prisma'
import * as path from 'path'

const prisma = new PrismaClient()

new GraphQLServer({
  context: () => ({ prisma }),
  schema: makeSchema({
    typegenAutoConfig: {
      contextType: '{ prisma: PrismaClient.PrismaClient }',
      sources: [{ source: '@prisma/client', alias: 'PrismaClient' }],
    },
    outputs: {
      typegen: path.join(
        __dirname,
        'node_modules/@types/nexus-typegen/index.d.ts',
      ),
    },
    plugins: [nexusPrismaPlugin()],
    types: [
      queryType({
        definition(t) {
          t.crud.user()
          t.crud.users({ ordering: true })
          t.crud.post()
          t.crud.posts({ filtering: true })
        },
      }),
      mutationType({
        definition(t) {
          t.crud.createOneUser()
          t.crud.createOnePost()
          t.crud.deleteOneUser()
          t.crud.deleteOnePost()
        },
      }),
      objectType({
        name: 'User',
        definition(t) {
          t.model.id()
          t.model.email()
          t.model.birthDate()
          t.model.posts()
        },
      }),
      objectType({
        name: 'Post',
        definition(t) {
          t.model.id()
          t.model.author()
        },
      }),
    ],
  }),
}).start(() => console.log(`🚀 GraphQL service ready at http://localhost:4000`))

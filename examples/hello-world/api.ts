import {
  asNexusMethod,
  makeSchema,
  mutationType,
  objectType,
  queryType,
  subscriptionType,
} from '@nexus/schema'
import { PrismaClient } from '@prisma/client'
import { ApolloServer, PubSub } from 'apollo-server-express'
import express from 'express'
import { DateTimeResolver, JSONObjectResolver } from 'graphql-scalars'
import * as HTTP from 'http'
import { nexusPrisma } from 'nexus-plugin-prisma'
import * as path from 'path'

const pubsub = new PubSub()

const prisma = new PrismaClient()

const apollo = new ApolloServer({
  context: () => ({ prisma }),
  schema: makeSchema({
    typegenAutoConfig: {
      contextType: '{ prisma: PrismaClient.PrismaClient }',
      sources: [{ source: '.prisma/client', alias: 'PrismaClient' }],
    },
    outputs: {
      typegen: path.join(__dirname, 'node_modules/@types/nexus-typegen/index.d.ts'),
      schema: path.join(__dirname, './api.graphql'),
    },
    plugins: [
      nexusPrisma({
        experimentalCRUD: true,
      }),
    ],
    types: [
      asNexusMethod(JSONObjectResolver, 'json'),
      asNexusMethod(DateTimeResolver, 'date'),
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
          t.crud.createOneUser({
            async resolve(root, args, ctx, info, originalResolve) {
              const data = originalResolve(root, args, ctx, info)
              await pubsub.publish('user_added', { data })
              return data
            },
          })
          t.crud.createOnePost()
          t.crud.deleteOneUser()
          t.crud.deleteOnePost()
        },
      }),
      objectType({
        name: 'User',
        definition(t) {
          t.model.id()
          t.model.metadata()
          t.model.email()
          t.model.birthDate()
          t.model.posts()
        },
      }),
      objectType({
        name: 'Post',
        definition(t) {
          t.model.id()
          t.model.authors()
        },
      }),
      subscriptionType({
        definition(t) {
          t.field('createOneUserEvents', {
            type: 'User',
            subscribe() {
              return pubsub.asyncIterator('user_added')
            },
            async resolve(userPromise) {
              const user = await userPromise.data
              return user
            },
          })
        },
      }),
    ],
  }),
})

const app = express()
const http = HTTP.createServer(app)

apollo.applyMiddleware({ app })
apollo.installSubscriptionHandlers(http)

http.listen(4000, () => {
  console.log(`🚀 GraphQL service ready at http://localhost:4000/graphql`)
})

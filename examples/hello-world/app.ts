import { GraphQLServer } from 'graphql-yoga'
import { makeSchema, queryType, mutationType, objectType } from 'nexus'
import { nexusPrismaPlugin } from 'nexus-prisma'
import { Photon } from '@generated/photon'

const photon = new Photon()

new GraphQLServer({
  context: () => ({ photon }),
  schema: makeSchema({
    typegenAutoConfig: {
      contextType: '{ photon: Photon.Photon }',
      sources: [{ source: '@generated/photon', alias: 'Photon' }],
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
}).start(() => console.log(`🚀 GraphQL server ready at http://localhost:4000`))

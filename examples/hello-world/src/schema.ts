import { queryType, mutationType, objectType, makeSchema } from 'nexus'
import { nexusPrismaPlugin } from 'nexus-prisma'

const Query = queryType({
  definition(t) {
    t.crud.user()
    t.crud.users({ ordering: true })
    // t.crud.post()
    // t.crud.posts({ filtering: true })
  },
})

const Mutation = mutationType({
  definition(t) {
    // t.crud.createOneUser()
    // t.crud.createOnePost()
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.handle()
    t.model.posts({ alias: 'articles', type: 'Article' })
  },
})

const Post = objectType({
  name: 'Article',
  definition(t) {
    t.model('Post').id()
    t.model('Post').author()
  },
})

const schema = makeSchema({
  outputs: true,
  types: [
    Query,
    Mutation,
    User,
    Post,
    nexusPrismaPlugin({ types: [Query, Mutation, User, Post] }),
  ],
  typegenAutoConfig: {
    contextType: 'Context.Context',
    sources: [
      {
        source: '@generated/photon',
        alias: 'photon',
      },
      {
        source: require.resolve('./context'),
        alias: 'Context',
      },
    ],
  },
})

export { schema }

import { mutationType, objectType, queryType } from '@nexus/schema'

export const Query = queryType({
  definition(t) {
    // ASSERT findOne & findMany
    t.crud.user()
    t.crud.users()
  },
})

export const Mutation = mutationType({
  definition: (t) => {
    t.crud.createOnePost()
    t.crud.updateManyPost()
  },
})

export const User = objectType({
  name: 'User',
  definition(t) {
    // ASSERT CUID maps to GQL ID
    t.model.id()
    t.model.firstName()
    // ASSERT pagination automatically enabled
    // ASSERT exposes filtering if true
    // ASSERT exposes ordering if true
    t.model.posts({ filtering: true, ordering: true })
    t.model.location()
  },
})

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    // ASSERT pagination disabled
    t.model.authors({ pagination: false })
    // ASSERT enums on models
    t.model.status()
  },
})

export const Bubble = objectType({
  name: 'Bubble',
  definition(t) {
    // ASSERT UUID custom scalar
    t.model.id()
    t.model.createdAt()
    // ASSERT filtering & ordering & pagination for only certain properties
    t.model.members({
      pagination: { after: true, first: false },
      filtering: { id: true, location: true },
      ordering: { firstName: true, locationId: true },
    })
  },
})

export const Location = objectType({
  name: 'Location',
  definition(t) {
    t.model.id()
    t.model.city()
    t.model.country()
  },
})

export const allTypes = [Query, Mutation, User, Post, Bubble, Location]

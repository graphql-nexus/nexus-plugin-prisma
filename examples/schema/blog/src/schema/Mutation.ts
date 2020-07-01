import { mutationType } from '@nexus/schema'

export const Mutation = mutationType({
  definition(t) {
    t.crud.createOneBlog()
    t.crud.updateManyBlog()
  },
})

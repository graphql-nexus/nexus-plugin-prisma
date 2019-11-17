import { mutationType } from 'nexus'

export const Mutation = mutationType({
  definition(t) {
    t.crud.createOneBlog()
    t.crud.updateManyBlog()
    t.crud.createOneComment()
  },
})

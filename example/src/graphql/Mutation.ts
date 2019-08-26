import { objectType } from 'nexus'

export const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.crud.createOneBlog()
  },
})

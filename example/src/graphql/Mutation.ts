import { objectType } from '@prisma/nexus'

export const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.crud.createOneBlog()
  },
})

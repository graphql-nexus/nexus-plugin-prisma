import { objectType } from 'nexus'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.blog()
    t.model.posts({ type: 'CustomPost' })
    t.model.role()
  },
})

import { objectType } from 'nexus'

export const A = objectType({
  name: 'A',
  definition(t) {
    t.string('f1')
    t.model.id()
  },
})

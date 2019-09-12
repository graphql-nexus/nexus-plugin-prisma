import { objectType } from 'nexus'

export const A = objectType({
  name: 'A',
  definition(t) {
    t.string('hash')
    // t.model.id()
  },
})

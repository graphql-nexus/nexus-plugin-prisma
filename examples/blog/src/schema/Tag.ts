import { objectType } from '@nexus/schema'

export const Tag = objectType({
  name: 'Tag',
  definition(t) {
    t.model.id()
    t.model.value()
  },
})

import { objectType } from 'nexus'

export const Comment = objectType({
  name: 'Comment',
  definition: t => {
    t.model.id()
    t.model.content()
  },
})

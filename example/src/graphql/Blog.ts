import { objectType } from '@prisma/nexus'

export const Blog = objectType({
  name: 'Blog',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.createdAt()
    t.model.updatedAt()
    t.model.posts({ type: 'CustomPost', pagination: false, ordering: true })
    t.model.viewCount()
    t.model.authors()
  },
})

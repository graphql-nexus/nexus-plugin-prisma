import { stringArg } from 'nexus'
import { prismaObjectType } from 'nexus-prisma'

export const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    /**
     * - use `t.prismaFields(['*'])` to expose all the underlying object type fields
     * - use `t.primaFields(['fieldName', ...])` to pick and/or customize specific fields
     * - use `t.prismaFields({ filter: ['fieldName', ...] })` to filter and/or customize specific fields
     */

    // An empty array removes all fields from the underlying object type
    t.prismaFields([])

    t.list.field('feed', {
      type: 'Post',
      resolve: (parent, args, ctx) => {
        return ctx.prisma.posts({
          where: { published: true },
        })
      },
    })

    t.list.field('filterPosts', {
      type: 'Post',
      args: {
        searchString: stringArg(),
      },
      resolve: (parent, { searchString }, ctx) => {
        return ctx.prisma.posts({
          where: {
            OR: [
              { title_contains: searchString },
              { content_contains: searchString },
            ],
          },
        })
      },
    })
  },
})

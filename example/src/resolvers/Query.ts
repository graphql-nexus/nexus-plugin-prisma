import { stringArg, extendType, scalarType } from 'nexus'
import { prismaObjectType } from 'nexus-prisma'
import { GraphQLObjectType } from 'graphql'

export const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.prismaFields(['posts'])

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

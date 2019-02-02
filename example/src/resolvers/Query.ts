import { objectType, stringArg } from 'nexus'
import { Post } from '.'

export const Query = objectType({
  name: 'Query',
  nonNullDefaults: {
    input: true,
    output: true,
  },
  definition(t) {
    t.list.field('feed', {
      type: Post,
      resolve: (parent, args, ctx) => {
        return ctx.prisma.posts({
          where: { published: true },
        })
      },
    })

    t.list.field('filterPosts', {
      type: Post,
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

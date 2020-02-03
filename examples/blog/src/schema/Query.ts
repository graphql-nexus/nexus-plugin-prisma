import { queryType, intArg, stringArg } from 'nexus'

export const Query = queryType({
  definition(t) {
    t.crud.blogs({
      pagination: false,
    })
    t.crud.users({ filtering: true, alias: 'people' })
    t.crud.posts({ type: 'CustomPost', ordering: true, filtering: true })

    //
    // Examples showing custom resolvers
    //

    t.field('blog', {
      type: 'Blog',
      args: {
        id: intArg({ required: true }),
      },
      resolve(_root, args, ctx) {
        return ctx.prisma.blog
          .findOne({
            where: {
              id: args.id,
            },
          })
          .then(result => {
            if (result === null) {
              throw new Error(`No blog with id of "${args.id}"`)
            }
            return result
          })
      },
    })

    t.field('blogsLike', {
      type: 'Blog',
      list: true,
      args: {
        name: stringArg(),
        viewCount: intArg(),
      },
      resolve(_root, args, ctx) {
        return ctx.prisma.blog.findMany({
          where: {
            name: args.name,
            viewCount: args.viewCount,
          },
        })
      },
    })
  },
})

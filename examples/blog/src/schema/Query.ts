import { queryType, idArg, intArg, stringArg } from 'nexus'

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
        return ctx.photon.blogs
          .findOne({
            where: {
              id: args.id,
            },
          })
          .then()
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
        return ctx.photon.blogs.findMany({
          where: {
            name: args.name,
            viewCount: args.viewCount,
          },
        })
      },
    })
  },
})

import { queryType, idArg, intArg } from 'nexus'

export const Query = queryType({
  definition(t) {
    t.crud.blogs({
      pagination: false,
    })
    t.crud.users({ filtering: true, alias: 'people' })
    t.crud.posts({ type: 'CustomPost', ordering: true, filtering: true })
    t.field('blog', {
      type: 'Blog',
      args: {
        id: intArg({ required: true }),
      },
      resolve(root, args, ctx) {
        return ctx.photon.blogs.findOne({
          where: {
            id: args.id,
          },
        })
      },
    })
  },
})

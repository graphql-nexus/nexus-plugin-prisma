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
            // FIXME arg required but typing suggests it is not
            // This is a bug with nexus: https://github.com/prisma-labs/nexus/issues/249
            id: (args as any).id,
          },
        })
      },
    })
  },
})

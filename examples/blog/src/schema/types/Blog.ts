import { intArg, objectType, queryField, stringArg } from '@nexus/schema'

export const Blog = objectType({
  name: 'Blog',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.createdAt()
    t.model.updatedAt()
    t.model.posts({
      type: 'CustomPost',
      pagination: false,
      ordering: true,
      filtering: { title: true },
    })
    t.model.viewCount()
    t.model.authors()
  },
})

export const Query = queryField((t) => {
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
        .then((result) => {
          if (result === null) {
            throw new Error(`No blog with id of "${args.id}"`)
          }
          return result
        })
    },
  })

  t.list.field('blogsLike', {
    type: 'Blog',
    args: {
      name: stringArg(),
      viewCount: intArg(),
    },
    resolve(_root, args, ctx) {
      return ctx.prisma.blog.findMany({
        where: {
          name: args.name ?? undefined,
          viewCount: args.viewCount ?? undefined,
        },
      })
    },
  })
})

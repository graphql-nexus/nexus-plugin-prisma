import { prismaObjectType } from 'nexus-prisma'
import { idArg, stringArg } from 'nexus'

export const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.field('deletePost', {
      ...t.prismaType.deletePost,
      type: 'Post',
      args: {
        id: idArg(),
      },
      resolve: (parent, args, ctx) => {
        return t.prismaType.deletePost.resolve(
          parent,
          { where: { id: args.id } },
          ctx,
        )
      },
    })

    t.field('signupUser', {
      type: 'User',
      args: {
        name: stringArg(),
        email: stringArg(),
      },
      resolve: (parent, { name, email }, ctx) => {
        return ctx.prisma.createUser({ name, email })
      },
    })

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        content: stringArg(),
        authorEmail: stringArg(),
      },
      resolve: (parent, { title, content, authorEmail }, ctx) => {
        return ctx.prisma.createPost({
          title,
          content,
          author: { connect: { email: authorEmail } },
        })
      },
    })

    t.field('publish', {
      type: 'Post',
      args: {
        id: idArg(),
      },
      resolve: (parent, { id }, ctx) => {
        return ctx.prisma.updatePost({
          where: { id },
          data: { published: true },
        })
      },
    })
  },
})

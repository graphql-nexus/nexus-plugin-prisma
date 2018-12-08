import { prismaObjectType } from 'nexus-prisma'
import { idArg, stringArg } from 'gqliteral'

export const Mutation = prismaObjectType('Mutation', t => {
  t.field('deletePost', 'Post', {
    ...t.prismaType.deletePost,
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

  t.field('signupUser', 'User', {
    args: {
      name: stringArg(),
      email: stringArg(),
    },
    resolve: (parent, { name, email }, ctx) => {
      return ctx.prisma.createUser({ name, email })
    },
  })

  t.field('createDraft', 'Post', {
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

  t.field('publish', 'Post', {
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
})

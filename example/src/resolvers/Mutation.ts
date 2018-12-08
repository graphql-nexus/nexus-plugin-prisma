import { prismaObjectType } from 'nexus-prisma'
import { idArg, stringArg } from 'gqliteral'

export const Mutation = prismaObjectType('Mutation', t => {
  t.field('deletePost', 'Post', {
    ...t.prismaType.deletePost,
    args: {
      id: idArg({ required: true }),
    },
    resolve: (parent, args, ctx) => {
      // TODO: this is not working
      // "Variable '$where' expected value of type 'PostWhereUniqueInput!' but value is undefined.
      // Reason: Expected non-null value, found null. (line 1, column 11):\nmutation ($where: PostWhereUniqueInput!)
      return t.prismaType.deletePost.resolve(
        parent,
        { where: { id: args.id } } as any,
        ctx,
      )
    },
  })

  t.field('signupUser', 'User', {
    args: {
      name: stringArg({ required: true }),
      email: stringArg({ required: true }),
    },
    resolve: (parent, { name, email }, ctx) => {
      return ctx.prisma.createUser({ name, email })
    },
  })

  t.field('createDraft', 'Post', {
    args: {
      title: stringArg({ required: true }),
      content: stringArg({ required: true }),
      authorEmail: stringArg({ required: true }),
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
      id: idArg({ required: true }),
    },
    resolve: (parent, { id }, ctx) => {
      return ctx.prisma.updatePost({
        where: { id },
        data: { published: true },
      })
    },
  })
})

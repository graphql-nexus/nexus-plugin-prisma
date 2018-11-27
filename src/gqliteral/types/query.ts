import { objectType } from 'gqliteral'
import { prisma } from '../../plugin/prisma'

export const Query = objectType('Query', t => {
  prisma.addFields(t, [{ name: 'users', args: ['first', 'last'] }])
  prisma.addFields(t, [{ name: 'user', args: ['where'] }])
})

export const User = objectType('User', t => {
  prisma.addFields(t, ['id', 'name', { name: 'posts', alias: 'blogPosts' }])
})

export const Post = objectType('Post', t => {
  prisma.addFields(t, ['id', 'title', 'content', 'comments'])
})

export const Comment = objectType('Comment', t => {
  prisma.addFields(t, ['id', 'content'])
})

// export const Schema = extendSchema(prismaSchema, t => {
//   t.includeTypes('')
// })

// export const Query = objectType('Query', t => {
//   // 1
//   // prisma.addFields(t, [{ name: 'posts', alias: 'blogPosts', args: ['where'] }])
//   // prisma.addFields(t, [{ name: 'users', args: ['where'] }])
//   // prisma.addFields(t, [{ name: 'user', args: ['where'] }])

//   // Expose everything
//   prisma.addFields(t)

//   // Expose one fields (whitelist based)
//   prisma.addFields(t, ['usersConnection'])

//   //prisma.addFields(t, ['user', 'users'])

//   // 2
//   //  prisma.addFields(t, { expose: ['user', 'users'] })

//   // 3
//   // prisma.addFields(t, { hide: ['user', 'users'] })
// })

// class PrismaObjectType extends core.GQLiteralObjectType {
//   makeConnection() {}
//   prismaFields() {}
//   buildSchema(schema: core.PrismaSchemaBuilder) {
//     return th
//   }
// }

// const objectTypes = {}

// type ConnectionArr = [PrismaObjectType, PrismaObjectType, PrismaObjectType]

// function prismaObjectType<
//   GenTypes = GQLiteralGen,
//   TypeName extends string = any,
//   HasConnection extends boolean = any
// >(
//   name: string,
//   fn: (arg: PrismaObjectType) => void,
//   hasConnection?: HasConnection,
// ): HasConnection extends true
//   ? [PrismaObjectType, ConnectionArr]
//   : [PrismaObjectType] {
//   const obj = new PrismaObjectType()
//   fn(obj)
//   if (hasConnection) {
//     return [obj, connection]
//   }
//   return [obj]
// }

// const [User, UserConnection, SomeUserWherINnp]
// const User = prismaObjectType('User', t => {
//   myRestObjectType(t)
// })

// export const UserConnection = prisma.relayConnection('User')

// export const Toto = [
//   objectType('1', (t) => {}),
//   objectType('2', (t) => {}),
//   objectType('3', (t) => {}),
// ]

// export const User = objectType('User', t => {
//   // prisma.addFields(t, [
//   //   'id',
//   //   'name',
//   //   { name: 'posts', alias: 'blogPosts', args: ['first', 'last'] },
//   // ])

//   // prisma.addFields(t, 'Customer2', ['items'])
// })

// export const UserConnection = objectType('UserConnection', t => {
//   prisma.addFields(t)
// })

// export const CommentConnection = objectType('CommentConnection', t => {
//   prisma.addFields(t)
// })

// export const PostConnection = objectType('PostConnection', t => {
//   prisma.addFields(t)
// })

// export const Post = objectType('Post', t => {
//   prisma.addFields(t)
//   prisma.addFields(t, [{ name: 'comments', alias: 'postComments' }])
// })

// export const Comment = objectType('Comment', t => {
//   prisma.addFields(t)
// })

// /**
//  *
//  * If we expose a field which doesn't have its type defined on the schema, then => filter these fields
//  * How to do that?
//  *
//  */

// // export const User = prismaProxyType('User', p => {
// //   p.exposeFields('id', 'name', {
// //     name: 'posts',
// //     args: ['first', 'last'],
// //     alias: 'blogPosts',
// //   })
// // })

// // export const Post = objectType('Post', t => {
// //   prismaExposeFields(t, 'Post', ['title', 'content'])
// // })

// // export const User = objectType('User', t => {
// //   t.id('id')
// //   t.string('name')
// //   t.field('posts', 'Post', {
// //     list: true,
// //     resolve: (root, args, ctx) => {
// //       return ctx.prisma.user({ id: root.id }).posts()
// //     },
// //   })
// // })

// // export const Post = objectType('Post', t => {
// //   t.id('id')
// //   t.string('title')
// //   t.string('content')
// // })

// // export const Query = objectType('Query', t => {
// //   prismaExposeFields(t, 'Query', [
// //     { name: 'users', alias: 'customers', args: ['where'] },
// //     { name: 'posts' },
// //     { name: 'post' },
// //   ])
// // })

// // export const User = prismaProxyType('User', p => {
// //   p.exposeFields('id', 'name', { name: 'posts', args: ['first'] })
// // })

// // export const Post = prismaProxyType('Post')

// // export const Query = prismaProxyType('Query', p => {
// //   p.exposeFields({ name: 'users', args: ['where'] });
// // });

// // export const User = prismaProxyType('User', p => {
// //   p.exposeFields('id', 'name', { name: 'posts', args: ['where'] });
// // });

// // export const Post = prismaProxyType('Post');

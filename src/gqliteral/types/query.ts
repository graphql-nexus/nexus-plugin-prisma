import { prismaObjectType } from '../../plugin/prisma'

export const Query = prismaObjectType('Query', t => {
  t.prismaFields([{ name: 'posts', alias: 'blogPosts', args: ['where'] }])
  t.prismaFields([{ name: 'users', args: ['where'] }])
  t.prismaFields([{ name: 'user', args: ['where'] }])
})

export const User = prismaObjectType('User', t => {
  t.prismaFields({ pick: ['name'] })
  t.prismaFields({
    aliases: [{ name: 'id', alias: 'identifier' }],
  })
})

export const Post = prismaObjectType('Post', t => {
  t.prismaFields({ pick: ['id', 'title', 'content'] })
})

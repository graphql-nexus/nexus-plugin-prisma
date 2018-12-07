import { idArg } from 'gqliteral'
import { prismaObjectType } from '../../../src'

/**
 * type Query {
 *   products(...): [Product!]!
 *   options(...): [Option!]!
 *   brands(...): [Brand!]!
 *   collection(...): Collection!
 * }
 */
export const Query = prismaObjectType('Query', t => {
  t.prismaFields({ pick: ['products', 'options', 'brands'] })

  t.field('collection', 'Collection', {
    args: {
      collectionId: idArg({ required: true }),
    },
    resolve: (root, args, ctx) => {
      return ctx.prisma.collection({ id: args.collectionId })
    },
  })
})

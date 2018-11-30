import { prismaObjectType } from '../../../plugin'
import * as ProductVariant from '../../fragments'
import { optionsFromVariants } from '../utils'

export const Product = prismaObjectType('Product', t => {
  t.prismaFields()

  t.field('options', 'Option', {
    list: true,
    resolve: async (parent, args, ctx) => {
      const { variants } = await ctx.prisma
        .product({ id: parent.id })
        .$fragment<ProductVariant.Type>(ProductVariant.fragment)

      return optionsFromVariants(variants)
    },
  })
})

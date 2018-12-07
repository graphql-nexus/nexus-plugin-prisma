import { arg, idArg, inputObjectType } from 'gqliteral'
import { prismaObjectType } from 'nexus-prisma'
import { VariantCreateInput } from '../../generated/prisma-client'

export const UniqueInput = inputObjectType('UniqueInput', t => {
  t.id('id', { required: true })
})

export const CreateVariantInput = inputObjectType('CreateVariantInput', t => {
  t.field('optionsValueIds', 'UniqueInput', { list: true, required: true })
  t.boolean('availableForSale', { required: true })
  t.int('price', { required: true })
})

export const CreateProductInput = inputObjectType('CreateProductInput', t => {
  t.string('name', { required: true })
  t.field('brand', 'UniqueInput', { required: true })
  t.field('attributesIds', 'UniqueInput', { required: true, list: true })
  t.field('variants', 'CreateVariantInput', { required: true, list: true })
})

export const UpdateVariantInput = inputObjectType('UpdateVariantInput', t => {
  t.id('id', { required: true })
  t.field('optionsValueIds', 'UniqueInput', { list: true, required: true })
  t.boolean('availableForSale', { required: true })
  t.int('price', { required: true })
})

export const UpdateProductInput = inputObjectType('UpdateProductInput', t => {
  t.id('id', { required: true })
  t.string('name', { required: true })

  t.field('brand', 'UniqueInput', { required: true })
  t.field('attributesIds', 'UniqueInput', { required: true, list: true })
  t.field('variants', 'UpdateVariantInput', { required: true, list: true })
})

export const Mutation = prismaObjectType('Mutation', t => {
  t.field('addProductsToCollection', 'Collection', {
    args: {
      productIds: idArg({ required: true, list: true }),
      collectionId: idArg({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      const collection = await ctx.prisma.updateCollection({
        where: { id: args.collectionId },
        data: { products: { connect: args.productIds.map(id => ({ id })) } },
      })

      return collection
    },
  })

  t.field('removeProductsFromCollection', 'Collection', {
    args: {
      productIds: idArg({ required: true, list: true }),
      collectionId: idArg({ required: true }),
    },
    resolve: async (_, args, ctx) => {
      const collection = await ctx.prisma.updateCollection({
        where: { id: args.collectionId },
        data: { products: { disconnect: args.productIds.map(id => ({ id })) } },
      })

      return collection
    },
  })

  t.field('createProduct', 'Product', {
    args: {
      data: arg('CreateProductInput', { required: true }),
    },
    resolve: async (parent, { data }, ctx) => {
      return ctx.prisma.createProduct({
        name: data.name,
        brand: { connect: { id: data.brand.id } },
        attributes: {
          connect: data.attributesIds,
        },
        variants: {
          create: data.variants.map(
            variant =>
              ({
                optionValues: {
                  connect: variant.optionsValueIds,
                },
              } as VariantCreateInput),
          ),
        },
      })
    },
  })

  t.field('updateProduct', 'Product', {
    args: {
      data: arg('UpdateProductInput', { required: true }),
    },
    resolve: async () => {
      throw new Error('updateProduct resolve not implemented yet')
    },
  })
})

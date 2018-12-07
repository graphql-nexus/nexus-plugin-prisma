import { prismaObjectType } from 'nexus-prisma'

export const Brand = prismaObjectType('Brand')
export const Variant = prismaObjectType('Variant')
export const Attribute = prismaObjectType('Attribute')
export const Option = prismaObjectType('Option')
export const OptionValue = prismaObjectType('OptionValue')

export * from './Collection'
export * from './Product'

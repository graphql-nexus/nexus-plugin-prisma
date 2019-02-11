import { GraphQLNamedType, isInputObjectType, isObjectType } from 'graphql/type'
import { PrismaSchemaBuilder } from '../builder'
import { inputObjectTypeToNexus } from './inputObjectType'
import { objectTypeToNexus } from './objectType'
import { PrismaClientInput } from '../types'

export function graphqlTypeToNexus(
  builder: PrismaSchemaBuilder,
  type: GraphQLNamedType,
  prismaClient: PrismaClientInput,
  uniqueFieldsByModel: Record<string, string[]>,
): GraphQLNamedType {
  if (isObjectType(type)) {
    return objectTypeToNexus(builder, type, prismaClient, uniqueFieldsByModel)
  }

  if (isInputObjectType(type)) {
    return inputObjectTypeToNexus(builder, type)
  }

  return type
}

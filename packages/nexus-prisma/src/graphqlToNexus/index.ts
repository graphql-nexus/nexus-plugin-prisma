import { GraphQLNamedType, isInputObjectType, isObjectType } from 'graphql/type'
import { PrismaSchemaBuilder } from '../builder'
import { inputObjectTypeToNexus } from './inputObjectType'
import { objectTypeToNexus } from './objectType'

export function graphqlTypeToNexus(
  builder: PrismaSchemaBuilder,
  type: GraphQLNamedType,
  contextClientName: string,
  uniqueFieldsByModel: Record<string, string[]>,
): GraphQLNamedType {
  if (isObjectType(type)) {
    return objectTypeToNexus(
      builder,
      type,
      contextClientName,
      uniqueFieldsByModel,
    )
  }

  if (isInputObjectType(type)) {
    return inputObjectTypeToNexus(builder, type)
  }

  return type
}

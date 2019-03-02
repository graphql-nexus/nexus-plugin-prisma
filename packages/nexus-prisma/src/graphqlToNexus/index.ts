import { GraphQLNamedType, isInputObjectType, isObjectType } from 'graphql/type'
import { PrismaSchemaBuilder } from '../builder'
import { inputObjectTypeToNexus } from './inputObjectType'
import { objectTypeToNexus } from './objectType'
import { PrismaClientInput, InternalDatamodelInfo } from '../types'

export function graphqlTypeToNexus(
  builder: PrismaSchemaBuilder,
  type: GraphQLNamedType,
  prismaClient: PrismaClientInput,
  datamodelInfo: InternalDatamodelInfo,
): GraphQLNamedType {
  if (isObjectType(type)) {
    return objectTypeToNexus(builder, type, prismaClient, datamodelInfo)
  }

  if (isInputObjectType(type)) {
    return inputObjectTypeToNexus(builder, type)
  }

  return type
}

import { GraphQLField, GraphQLFieldResolver, isScalarType } from 'graphql'
import { getFinalType } from './graphql'
import { throwIfNoUniqFieldName, throwIfUnknownClientFunction } from './throw'
import { PrismaClient, PrismaClientInput, InternalDatamodelInfo } from './types'
import {
  isConnectionTypeName,
  isCreateMutation,
  isDeleteMutation,
  isNotArrayOrConnectionType,
} from './utils'
import { camelCase } from './camelcase'

export function shouldRelyOnDefaultResolver(
  typeName: string,
  fieldToResolve: GraphQLField<any, any>,
  datamodelInfo: InternalDatamodelInfo,
) {
  const fieldName = fieldToResolve.name

  if (isScalarType(getFinalType(fieldToResolve.type))) {
    return true
  }

  // Embedded types are handled just like scalars
  if (datamodelInfo.embeddedTypes.includes(typeName)) {
    return true
  }

  if (isConnectionTypeName(typeName) && fieldName !== 'aggregate') {
    // returns `pageInfo` and `edges` queries by the client
    return true
  }

  // fields inside `edges` are queried as well, we can simply return them
  if (
    typeName.endsWith('Edge') &&
    typeName !== 'Edge' &&
    (fieldName === 'node' || fieldName === 'cursor')
  ) {
    return true
  }

  return false
}

function getPrismaClient(
  prismaClient: PrismaClientInput,
  ctx: any,
): PrismaClient {
  if (typeof prismaClient === 'function') {
    return prismaClient(ctx)
  }

  return prismaClient
}

export function generateDefaultResolver(
  typeName: string,
  fieldToResolve: GraphQLField<any, any>,
  prismaClientInput: PrismaClientInput,
  datamodelInfo: InternalDatamodelInfo,
): GraphQLFieldResolver<any, any> | undefined {
  const fieldName = fieldToResolve.name

  /**
   * If we know the prisma-client returns these fields, then let's just return undefined and let nexus handle it with a default resolver
   * We need to do this to make the typings working without having to provide a typegenAutoconfig.source to the the prisma-client
   * becase Nexus does not generate types from the schema for fields that have a resolve property
   */
  if (shouldRelyOnDefaultResolver(typeName, fieldToResolve, datamodelInfo)) {
    return undefined
  }

  const isTopLevel = ['Query', 'Mutation', 'Subscription'].includes(typeName)
  const parentName = camelCase(typeName)

  if (typeName === 'Subscription') {
    throw new Error('Subscription are not supported yet')
  }

  return (root, args, ctx, info) => {
    const prismaClient = getPrismaClient(prismaClientInput, ctx)

    // Resolve top-level fields
    if (isTopLevel) {
      throwIfUnknownClientFunction(prismaClient, fieldName, typeName, info)

      if (isCreateMutation(typeName, fieldName)) {
        args = args.data
      } else if (isDeleteMutation(typeName, fieldName)) {
        args = args.where
      } else if (
        // If is "findOne" query (eg: `user`, or `post`)
        isNotArrayOrConnectionType(fieldToResolve) &&
        (typeName !== 'Node' && fieldName !== 'node') &&
        typeName !== 'Mutation'
      ) {
        args = args.where
      }

      return prismaClient[fieldName](args)
    }

    throwIfUnknownClientFunction(prismaClient, parentName, typeName, info)

    const uniqFieldName = datamodelInfo.uniqueFieldsByModel[typeName].find(
      uniqFieldName => root[uniqFieldName] !== undefined,
    )

    throwIfNoUniqFieldName(uniqFieldName, parentName)

    return prismaClient[parentName]({
      [uniqFieldName!]: root[uniqFieldName!],
    })[fieldName](args)
  }
}

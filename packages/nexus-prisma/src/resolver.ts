import { GraphQLField, GraphQLFieldResolver, isScalarType } from 'graphql'
import { getFinalType } from './graphql'
import { throwIfNoUniqFieldName, throwIfUnknownClientFunction } from './throw'
import {
  isConnectionTypeName,
  isCreateMutation,
  isDeleteMutation,
  isNotArrayOrConnectionType,
} from './utils'
const camelCase = require('camelcase')

function shouldRelyOnDefaultResolver(
  typeName: string,
  fieldToResolve: GraphQLField<any, any>,
) {
  const fieldName = fieldToResolve.name

  if (isScalarType(getFinalType(fieldToResolve.type))) {
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

export function generateDefaultResolver(
  typeName: string,
  fieldToResolve: GraphQLField<any, any>,
  contextClientName: string,
  uniqFieldsByModel: Record<string, string[]>,
): GraphQLFieldResolver<any, any> | undefined {
  const fieldName = fieldToResolve.name

  /**
   * If we know the prisma-client returns these fields, then let's just return undefined and let nexus handle it with a default resolver
   * We need to do this to make the typings working without having to provide a typegenAutoconfig.source to the the prisma-client
   * becase Nexus does not generate types from the schema for fields that have a resolve property
   */
  if (shouldRelyOnDefaultResolver(typeName, fieldToResolve)) {
    return undefined
  }

  const isTopLevel = ['Query', 'Mutation', 'Subscription'].includes(typeName)
  const parentName = camelCase(typeName)

  if (typeName === 'Subscription') {
    throw new Error('Subscription are not supported yet')
  }

  return (root, args, ctx, info) => {
    // Resolve top-level fields
    if (isTopLevel) {
      throwIfUnknownClientFunction(
        fieldName,
        typeName,
        ctx,
        contextClientName,
        info,
      )

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

      return ctx[contextClientName][fieldName](args)
    }

    throwIfUnknownClientFunction(
      parentName,
      typeName,
      ctx,
      contextClientName,
      info,
    )

    const uniqFieldName = uniqFieldsByModel[typeName].find(
      uniqFieldName => root[uniqFieldName] !== undefined,
    )

    throwIfNoUniqFieldName(uniqFieldName, parentName)

    return ctx[contextClientName][parentName]({
      [uniqFieldName!]: root[uniqFieldName!],
    })[fieldName](args)
  }
}

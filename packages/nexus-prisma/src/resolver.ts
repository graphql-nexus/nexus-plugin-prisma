import { GraphQLFieldResolver } from 'graphql'
import { GraphQLTypeField } from './source-helper'
import { throwIfUnknownClientFunction } from './throw'
import {
  isConnectionTypeName,
  isCreateMutation,
  isDeleteMutation,
  isNotArrayOrConnectionType,
} from './utils'
const camelCase = require('camelcase')

export function generateDefaultResolver(
  typeName: string,
  fieldToResolve: GraphQLTypeField,
  contextClientName: string,
): GraphQLFieldResolver<any, any> {
  return (root, args, ctx, info) => {
    const isTopLevel = ['Query', 'Mutation', 'Subscription'].includes(typeName)

    if (typeName === 'Subscription') {
      throw new Error('Subscription not supported yet')
    }

    const fieldName = fieldToResolve.name

    if (fieldToResolve.type.isScalar) {
      return root[fieldName]
    }

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
      } else if ( // If is "findOne" query (eg: `user`, or `post`)
        isNotArrayOrConnectionType(fieldToResolve) &&
        (typeName !== 'Node' && fieldName !== 'node')
      ) {
        args = args.where
      }

      return ctx[contextClientName][fieldName](args)
    }

    if (isConnectionTypeName(typeName)) {
      // returns `pageInfo` and `edges` queries by the client
      return root[fieldName]
    }

    // fields inside `edges` are queried as well, we can simply return them
    if (
      typeName.endsWith('Edge') &&
      typeName !== 'Edge' &&
      (fieldName === 'node' || fieldName === 'cursor')
    ) {
      return root[fieldName]
    }

    const parentName = camelCase(typeName)

    throwIfUnknownClientFunction(
      parentName,
      typeName,
      ctx,
      contextClientName,
      info,
    )

    // FIXME: It can very well be something else than `id` (depending on the @unique field)
    return ctx[contextClientName][parentName]({ id: root.id })[fieldName](args)
  }
}

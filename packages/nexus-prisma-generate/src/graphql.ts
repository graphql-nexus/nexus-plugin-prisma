import {
  GraphQLNamedType,
  GraphQLType,
  isListType,
  isNonNullType,
} from 'graphql'

export function isRequired(type: GraphQLType): boolean {
  if (isListType(type)) {
    return isRequired(type.ofType)
  }

  return isNonNullType(type)
}

export function isList(type: GraphQLType): boolean {
  if (isNonNullType(type)) {
    return isList(type.ofType)
  }

  return isListType(type)
}

export function getFinalType(type: GraphQLType): GraphQLNamedType {
  if (isListType(type) || isNonNullType(type)) {
    return getFinalType(type.ofType)
  }

  return type
}

export function getTypeName(type: GraphQLType): string {
  return getFinalType(type).name
}

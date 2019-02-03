import {
  GraphQLField,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  isListType,
  isNonNullType,
} from 'graphql'

export function isRequired(type: GraphQLType): boolean {
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

export function findObjectType(
  typeName: string,
  schema: GraphQLSchema,
): GraphQLObjectType {
  const graphQLType = schema.getType(typeName)

  if (!graphQLType) {
    throw new Error(`Type '${typeName}' not found in Prisma API`)
  }

  return graphQLType as GraphQLObjectType
}

export function findGraphQLTypeField(
  typeName: string,
  fieldName: string,
  schema: GraphQLSchema,
): GraphQLField<any, any> {
  const objectType = findObjectType(typeName, schema)

  const objectField = Object.values(objectType.getFields()).find(
    field => field.name === fieldName,
  )

  if (!objectField) {
    throw new Error(`Field ${typeName}.${fieldName} not found in Prisma API`)
  }

  return objectField
}

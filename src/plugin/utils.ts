import { arg } from 'gqliteral'
import { GQLiteralInputObjectType } from 'gqliteral/dist/core'
import { ArgDefinition, ArgOpts, FieldOpts } from 'gqliteral/dist/types'
import { TypesMap } from './prisma'
import {
  GraphQLScalarType,
  GraphQLType,
  GraphQLTypeField,
} from './source-helper'
import { throwIfUnknownFields } from './throw'
import { AnonymousField, ObjectField } from './types'

export interface ScalarToObjectInputArg {
  String: (arg: GQLiteralInputObjectType, name: string, opts: ArgOpts) => void
  Boolean: (arg: GQLiteralInputObjectType, name: string, opts: ArgOpts) => void
  Float: (arg: GQLiteralInputObjectType, name: string, opts: ArgOpts) => void
  Int: (arg: GQLiteralInputObjectType, name: string, opts: ArgOpts) => void
  ID: (arg: GQLiteralInputObjectType, name: string, opts: ArgOpts) => void
}

const scalarToObjectInputArg: ScalarToObjectInputArg = {
  String: (arg, name, opts) => arg.string(name, opts),
  Boolean: (arg, name, opts) => arg.boolean(name, opts),
  Float: (arg, name, opts) => arg.float(name, opts),
  Int: (arg, name, opts) => arg.int(name, opts),
  ID: (arg, name, opts) => arg.id(name, opts),
}

export interface ScalarToLiteralArg {
  String: (opts: ArgOpts) => ArgDefinition
  Boolean: (opts: ArgOpts) => ArgDefinition
  Float: (opts: ArgOpts) => ArgDefinition
  Int: (opts: ArgOpts) => ArgDefinition
  ID: (opts: ArgOpts) => ArgDefinition
}

const scalarToLiteralArg: ScalarToLiteralArg = {
  String: opts => arg('String', opts),
  Boolean: opts => arg('Boolean', opts),
  Float: opts => arg('Float', opts),
  Int: opts => arg('Int', opts),
  ID: opts => arg('ID', opts),
}

export function getObjectInputArg(
  arg: GQLiteralInputObjectType,
  field: GraphQLTypeField,
  opts: ArgOpts,
) {
  const scalarTypeName = field.type.name as GraphQLScalarType

  return scalarToObjectInputArg[scalarTypeName](arg, field.name, opts)
}

export function getLiteralArg(typeName: string, opts: ArgOpts) {
  const scalarTypeName = typeName as GraphQLScalarType

  return scalarToLiteralArg[scalarTypeName](opts)
}

export function typeToFieldOpts(type: GraphQLType): FieldOpts {
  let output: FieldOpts = {}

  if (!type.isRequired) {
    output.nullable = true
  }

  if (type.isArray) {
    output.list = true
  }

  return output
}

export function getAllFields(
  typeName: string,
  typesMap: TypesMap,
): ObjectField[] {
  return getGraphQLType(typeName, typesMap).fields.map(
    field =>
      ({
        name: field.name,
      } as ObjectField),
  )
}

export function getFields(
  inputFields: AnonymousField[] | undefined,
  typeName: string,
  typesMap: TypesMap,
): ObjectField[] {
  const fields =
    inputFields === undefined || inputFields.length === 0
      ? getAllFields(typeName, typesMap)
      : normalizeFields(inputFields)

  const graphqlType = getGraphQLType(typeName, typesMap)

  // Make sure all the fields exists
  throwIfUnknownFields(graphqlType, fields, typeName)

  return fields
}

export function normalizeFields(fields: AnonymousField[]): ObjectField[] {
  return fields.map(f => {
    if (typeof f === 'string') {
      return {
        name: f,
      }
    }

    return f as ObjectField
  })
}

export function getGraphQLType(typeName: string, typesMap: TypesMap) {
  const graphQLType = typesMap.types[typeName]

  if (graphQLType === undefined) {
    throw new Error(`Type ${typeName} not found`)
  }

  return graphQLType
}

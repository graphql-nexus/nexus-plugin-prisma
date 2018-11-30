import { arg } from 'gqliteral'
import { InputObjectTypeDef } from 'gqliteral/dist/core'
import { ArgDefinition, ArgOpts, FieldOpts } from 'gqliteral/dist/types'
import { TypesMap } from './prisma'
import {
  GraphQLScalarType,
  GraphQLType,
  GraphQLTypeField,
} from './source-helper'
import { throwIfUnknownFields } from './throw'
import {
  AnonymousAliases,
  AnonymousField,
  AnonymousInputFields,
  AnonymousPickOmitField,
  ObjectField,
} from './types'

export interface ScalarToObjectInputArg {
  String: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  Boolean: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  Float: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  Int: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  ID: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
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
  arg: InputObjectTypeDef,
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

function isDefaultInput(
  inputFields: AnonymousInputFields | undefined,
): boolean {
  return (
    inputFields === undefined ||
    (Array.isArray(inputFields) && inputFields.length === 0)
  )
}

export function getFields(
  inputFields: AnonymousInputFields | undefined,
  typeName: string,
  typesMap: TypesMap,
): ObjectField[] {
  const fields = isDefaultInput(inputFields)
    ? getAllFields(typeName, typesMap)
    : normalizeFields(inputFields as AnonymousInputFields)

  const graphqlType = getGraphQLType(typeName, typesMap)

  // Make sure all the fields exists
  throwIfUnknownFields(graphqlType, fields, typeName)

  return fields
}

function isPickOmitField(
  arg: AnonymousInputFields,
): arg is AnonymousPickOmitField {
  return (
    (arg as AnonymousPickOmitField).pick !== undefined ||
    (arg as AnonymousPickOmitField).omit !== undefined
  )
}

function isAliasField(arg: AnonymousInputFields): arg is AnonymousAliases {
  return (arg as AnonymousAliases).aliases !== undefined
}

export function normalizeFields(fields: AnonymousInputFields): ObjectField[] {
  let fieldsToMap: AnonymousField[] = []

  if (Array.isArray(fields)) {
    fieldsToMap = fields
  } else {
    if (isPickOmitField(fields) && fields.omit) {
      throw new Error('Omit not yet implemented')
    }
    if (isPickOmitField(fields) && fields.pick) {
      fieldsToMap = fields.pick
    } else if (isAliasField(fields)) {
      fieldsToMap = fields.aliases
    }
  }

  return fieldsToMap.map(f => {
    if (typeof f === 'string') {
      return {
        name: f,
      }
    }

    return f
  })
}

export function getGraphQLType(typeName: string, typesMap: TypesMap) {
  const graphQLType = typesMap.types[typeName]

  if (graphQLType === undefined) {
    throw new Error(`Type ${typeName} not found`)
  }

  return graphQLType
}

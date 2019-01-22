import { arg } from 'nexus'
import { InputObjectTypeDef } from 'nexus/dist/core'
import { ArgDefinition, ArgOpts, FieldOpts } from 'nexus/dist/types'
import {
  GraphQLScalarType,
  GraphQLType,
  GraphQLTypeField,
  TypesMap,
} from './source-helper'
import { throwIfUnknownFields } from './throw'
import {
  AddFieldInput,
  AnonymousField,
  ObjectField,
  PickInputField,
} from './types'

export interface ScalarToObjectInputArg {
  String: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  Boolean: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  Float: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  Int: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  ID: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
  DateTime: (arg: InputObjectTypeDef, name: string, opts: ArgOpts) => void
}

const scalarToObjectInputArg: ScalarToObjectInputArg = {
  String: (arg, name, opts) => arg.string(name, opts),
  Boolean: (arg, name, opts) => arg.boolean(name, opts),
  Float: (arg, name, opts) => arg.float(name, opts),
  Int: (arg, name, opts) => arg.int(name, opts),
  ID: (arg, name, opts) => arg.id(name, opts),
  DateTime: (arg, name, opts) => arg.field(name, 'DateTime' as any, opts),
}

export interface ScalarToLiteralArg {
  String: (opts: ArgOpts) => ArgDefinition
  Boolean: (opts: ArgOpts) => ArgDefinition
  Float: (opts: ArgOpts) => ArgDefinition
  Int: (opts: ArgOpts) => ArgDefinition
  ID: (opts: ArgOpts) => ArgDefinition
  DateTime: (opts: ArgOpts) => ArgDefinition
}

const scalarToLiteralArg: ScalarToLiteralArg = {
  String: opts => arg('String', opts),
  Boolean: opts => arg('Boolean', opts),
  Float: opts => arg('Float', opts),
  Int: opts => arg('Int', opts),
  ID: opts => arg('ID', opts),
  DateTime: opts => arg('DateTime' as any, opts),
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
  return {
    list: type.isArray,
    nullable: !type.isRequired,
  }
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

function isDefaultInput<GenTypes, TypeName extends string>(
  inputFields: AddFieldInput<GenTypes, TypeName> | undefined,
): boolean {
  return (
    inputFields === undefined ||
    (Array.isArray(inputFields) && inputFields.length === 0)
  )
}

export function getFields<GenTypes, TypeName extends string>(
  inputFields: AddFieldInput<GenTypes, TypeName> | undefined,
  typeName: string,
  typesMap: TypesMap,
): ObjectField[] {
  const fields = isDefaultInput(inputFields)
    ? getAllFields(typeName, typesMap)
    : extractFields(
        inputFields as AddFieldInput<GenTypes, TypeName>,
        typeName,
        typesMap,
      )
  const normalizedFields = normalizeFields(fields)

  const graphqlType = getGraphQLType(typeName, typesMap)

  // Make sure all the fields exists
  throwIfUnknownFields(graphqlType, normalizedFields, typeName)

  return normalizedFields
}

function isPickInputField<
  GenTypes = GraphQLNexusGen,
  TypeName extends string = any
>(arg: any): arg is PickInputField<GenTypes, TypeName> {
  return (arg as PickInputField<GenTypes, TypeName>).pick !== undefined
}

function extractFields<
  GenTypes = GraphQLNexusGen,
  TypeName extends string = any
>(
  fields: AddFieldInput<GenTypes, TypeName>,
  typeName: string,
  typesMap: TypesMap,
): AnonymousField[] {
  if (Array.isArray(fields)) {
    return fields as AnonymousField[]
  }

  if (isPickInputField<GenTypes>(fields)) {
    return fields.pick as AnonymousField[]
  }

  const prismaFieldsNames = getAllFields(typeName, typesMap).map(f => f.name) // typeName = "Product"

  if (Array.isArray(fields.filter)) {
    const fieldsToFilter = fields.filter as ObjectField[]
    const fieldsNamesToFilter = fieldsToFilter.map(f =>
      typeof f === 'string' ? f : f.name,
    )

    return prismaFieldsNames.filter(
      fieldName => !fieldsNamesToFilter.includes(fieldName),
    )
  } else {
    return fields.filter(prismaFieldsNames)
  }
}

export function normalizeFields(fields: AnonymousField[]): ObjectField[] {
  return fields.map(f => {
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

export function isDeleteMutation(typeName: string, fieldName: string): boolean {
  return typeName === 'Mutation' && fieldName.startsWith('delete')
}

export function isCreateMutation(typeName: string, fieldName: string): boolean {
  return typeName === 'Mutation' && fieldName.startsWith('create')
}

export function isNotArrayOrConnectionType(
  fieldToResolve: GraphQLTypeField,
): boolean {
  return (
    !fieldToResolve.type.isArray &&
    !isConnectionTypeName(fieldToResolve.type.name)
  )
}

export function isConnectionTypeName(typeName: string): boolean {
  return typeName.endsWith('Connection') && typeName !== 'Connection'
}

export const isObject = (obj: any): boolean =>
  obj !== null && typeof obj === 'object'

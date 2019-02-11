import { GraphQLField, GraphQLSchema } from 'graphql'
import { core } from 'nexus'
import { findObjectType, getTypeName, isList } from './graphql'
import { throwIfUnknownFields } from './throw'
import {
  AddFieldInput,
  AnonymousField,
  ObjectField,
  PickInputField,
} from './types'

export function getAllFields(
  typeName: string,
  schema: GraphQLSchema,
): ObjectField[] {
  return Object.keys(findObjectType(typeName, schema).getFields()).map(
    fieldName =>
      ({
        name: fieldName,
      } as ObjectField),
  )
}

function isDefaultInput<TypeName extends string>(
  inputFields:
    | AddFieldInput<'objectTypes' | 'inputTypes', TypeName>
    | undefined,
): boolean {
  return inputFields === undefined
}

export function getFields<TypeName extends string>(
  inputFields:
    | AddFieldInput<'objectTypes' | 'inputTypes', TypeName>
    | undefined,
  typeName: string,
  schema: GraphQLSchema,
): ObjectField[] {
  const fields = isDefaultInput(inputFields)
    ? getAllFields(typeName, schema)
    : extractFields(
        inputFields as AddFieldInput<'objectTypes' | 'inputTypes', TypeName>,
        typeName,
        schema,
      )
  const normalizedFields = normalizeFields(fields)

  const objectType = findObjectType(typeName, schema)

  // Make sure all the fields exists
  throwIfUnknownFields(objectType, normalizedFields, typeName)

  return normalizedFields
}

function isPickInputField<TypeName extends string = any>(
  arg: any,
): arg is PickInputField<'objectTypes' | 'inputTypes', TypeName> {
  return (
    (arg as PickInputField<'objectTypes' | 'inputTypes', TypeName>).pick !==
    undefined
  )
}

function extractFields<TypeName extends string = any>(
  fields: AddFieldInput<'objectTypes' | 'inputTypes', TypeName>,
  typeName: string,
  schema: GraphQLSchema,
): AnonymousField[] {
  if (Array.isArray(fields)) {
    return fields as AnonymousField[]
  }

  if (isPickInputField(fields)) {
    return fields.pick as AnonymousField[]
  }

  const prismaFieldsNames = getAllFields(typeName, schema).map(f => f.name)

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

export function isDeleteMutation(typeName: string, fieldName: string): boolean {
  return (
    typeName === 'Mutation' &&
    fieldName.startsWith('delete') &&
    fieldName !== 'delete'
  )
}

export function isCreateMutation(typeName: string, fieldName: string): boolean {
  return (
    typeName === 'Mutation' &&
    fieldName.startsWith('create') &&
    fieldName !== 'create'
  )
}

export function isNotArrayOrConnectionType(
  fieldToResolve: GraphQLField<any, any>,
): boolean {
  return (
    !isList(fieldToResolve.type) &&
    !isConnectionTypeName(getTypeName(fieldToResolve.type))
  )
}

export function isConnectionTypeName(typeName: string): boolean {
  return typeName.endsWith('Connection') && typeName !== 'Connection'
}

export function flatMap<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => U[],
): U[] {
  return Array.prototype.concat(...array.map(callbackfn))
}

export function whitelistArgs(
  args: Record<string, core.NexusArgDef<string>>,
  whitelist: string[] | false | undefined,
) {
  if (
    whitelist === false ||
    (Array.isArray(whitelist) && whitelist.length === 0)
  ) {
    return undefined
  }

  if (whitelist === undefined) {
    return args
  }

  return Object.keys(args).reduce<Record<string, core.NexusArgDef<string>>>(
    (acc, argName) => {
      if (whitelist.includes(argName)) {
        return {
          ...acc,
          [argName]: args[argName],
        }
      }

      return acc
    },
    {},
  )
}

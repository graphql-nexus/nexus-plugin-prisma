import {
  GraphQLField,
  GraphQLNamedType,
  GraphQLSchema,
  isEnumType,
  isInputObjectType,
  isObjectType,
  isScalarType,
} from 'graphql'
import { core } from 'nexus'
import { findObjectType, getTypeName, isList, isRequired } from './graphql'
import { throwIfUnknownFields } from './throw'
import {
  AddFieldInput,
  AnonymousField,
  ObjectField,
  PickInputField,
} from './types'
import { PrismaSchemaBuilder } from './builder'
import { generateDefaultResolver } from './resolver'

export function getAllInputEnumTypes(
  schema: GraphQLSchema,
): GraphQLNamedType[] {
  const types = Object.values(schema.getTypeMap())

  const inputTypes = types.filter(isInputObjectType)
  const enumTypes = types.filter(isEnumType)
  const scalarTypes = types.filter(isScalarType)

  const pageInfoType = schema.getType('PageInfo')!
  const batchPayloadType = schema.getType('BatchPayload')!
  const nodeType = schema.getType('Node')!

  return [
    ...inputTypes,
    ...enumTypes,
    ...scalarTypes,
    batchPayloadType,
    nodeType,
    pageInfoType,
  ]
}

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
  inputFields: AddFieldInput<TypeName> | undefined,
): boolean {
  return inputFields === undefined
}

export function getFields<TypeName extends string>(
  inputFields: AddFieldInput<TypeName> | undefined,
  typeName: string,
  schema: GraphQLSchema,
): ObjectField[] {
  const fields = isDefaultInput(inputFields)
    ? getAllFields(typeName, schema)
    : extractFields(inputFields as AddFieldInput<TypeName>, typeName, schema)
  const normalizedFields = normalizeFields(fields)

  const objectType = findObjectType(typeName, schema)

  // Make sure all the fields exists
  throwIfUnknownFields(objectType, normalizedFields, typeName)

  return normalizedFields
}

function isPickInputField<TypeName extends string = any>(
  arg: any,
): arg is PickInputField<TypeName> {
  return (arg as PickInputField<TypeName>).pick !== undefined
}

function extractFields<TypeName extends string = any>(
  fields: AddFieldInput<TypeName>,
  typeName: string,
  schema: GraphQLSchema,
): AnonymousField[] {
  if (Array.isArray(fields)) {
    return fields as AnonymousField[]
  }

  if (isPickInputField(fields)) {
    return fields.pick as AnonymousField[]
  }

  const prismaFieldsNames = getAllFields(typeName, schema).map(f => f.name) // typeName = "Product"

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
  if (!whitelist) {
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

export function graphqlTypeToNexusType(
  builder: PrismaSchemaBuilder,
  type: GraphQLNamedType,
  contextClientName: string,
): GraphQLNamedType {
  if (isObjectType(type)) {
    return builder.buildObjectType({
      name: type.name,
      definition(t) {
        Object.values(type.getFields()).forEach(f => {
          t.field(f.name, {
            type: getTypeName(f.type),
            list: isList(f.type) ? true : undefined,
            nullable: !isRequired(f.type),
            resolve: generateDefaultResolver(type.name, f, contextClientName),
          })
        })
        type.getInterfaces().forEach(interfaceType => {
          t.implements(interfaceType.name)
        })
      },
    })
  }

  return type
}

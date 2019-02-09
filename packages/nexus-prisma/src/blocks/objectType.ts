import { GraphQLObjectType, GraphQLSchema, isObjectType } from 'graphql'
import { core } from 'nexus'
import { PrismaObjectTypeConfig } from '../definitions/objectType'
import { findGraphQLTypeField, getTypeName } from '../graphql'
import { objectTypeFieldsToNexus } from '../graphqlToNexus/objectType'
import {
  AddFieldInput,
  FilterInputField,
  InputField,
  ObjectTypeDetails,
  PickInputField,
  PrismaSchemaConfig,
} from '../types'
import { getFields, whitelistArgs } from '../utils'

export interface PrismaObjectDefinitionBlock<TypeName extends string>
  extends core.ObjectDefinitionBlock<TypeName> {
  prismaType: ObjectTypeDetails<TypeName>
  prismaFields(inputFields?: InputField<'objectTypes', TypeName>[]): void
  prismaFields(pickFields: PickInputField<'objectTypes', TypeName>): void
  prismaFields(filterFields: FilterInputField<'objectTypes', TypeName>): void
  prismaFields(inputFields?: AddFieldInput<'objectTypes', TypeName>): void
}

export function prismaObjectDefinitionBlock<TypeName extends string>(
  typeName: string,
  t: core.ObjectDefinitionBlock<TypeName>,
  prismaType: Record<string, core.NexusOutputFieldConfig<string, string>>,
  prismaSchema: GraphQLSchema,
): PrismaObjectDefinitionBlock<TypeName> {
  const prismaBlock = t as PrismaObjectDefinitionBlock<TypeName>

  prismaBlock.prismaType = prismaType
  prismaBlock.prismaFields = (inputFields: any) => {
    const graphqlType = prismaSchema.getType(typeName) as GraphQLObjectType
    const fields = getFields(inputFields, typeName, prismaSchema)

    graphqlType.getInterfaces().forEach(interfaceType => {
      prismaBlock.implements(interfaceType.name)
    })
    fields.forEach(field => {
      const aliasName = field.alias ? field.alias : field.name
      const fieldType = findGraphQLTypeField(typeName, field.name, prismaSchema)
      const { list, ...rest } = prismaType[fieldType.name]
      const args = whitelistArgs(rest.args!, field.args)
      prismaBlock.field(aliasName, {
        ...rest,
        type: getTypeName(fieldType.type),
        list: list ? true : undefined,
        args,
      })
    })
  }

  return prismaBlock
}

export function prismaTypeObject(
  prismaSchema: {
    uniqueFieldsByModel: Record<string, string[]>
    schema: GraphQLSchema
  },
  objectConfig: PrismaObjectTypeConfig<any>,
  builderConfig: PrismaSchemaConfig,
) {
  const typeName = objectConfig.name
  const graphqlType = prismaSchema.schema.getType(typeName)

  if (!isObjectType(graphqlType)) {
    throw new Error(
      `Must select a GraphQLObjectType, saw ${typeName} which is ${graphqlType}`,
    )
  }

  return objectTypeFieldsToNexus(
    graphqlType,
    builderConfig.prisma.contextClientName,
    prismaSchema.uniqueFieldsByModel,
  )
}

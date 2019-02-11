import { GraphQLSchema, isObjectType } from 'graphql'
import { core } from 'nexus'
import { PrismaExtendTypeConfig } from '../definitions/extendType'
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

export interface PrismaExtendTypeBlock<TypeName extends string>
  extends core.OutputDefinitionBlock<TypeName> {
  prismaType: ObjectTypeDetails<TypeName>
  prismaFields(inputFields?: InputField<'objectTypes', TypeName>[]): void
  prismaFields(pickFields: PickInputField<'objectTypes', TypeName>): void
  prismaFields(filterFields: FilterInputField<'objectTypes', TypeName>): void
  prismaFields(inputFields?: AddFieldInput<'objectTypes', TypeName>): void
}

export function prismaExtendTypeBlock<TypeName extends string>(
  typeName: string,
  t: core.OutputDefinitionBlock<TypeName>,
  prismaType: Record<string, core.NexusOutputFieldConfig<string, string>>,
  prismaSchema: GraphQLSchema,
): PrismaExtendTypeBlock<TypeName> {
  const block = t as PrismaExtendTypeBlock<TypeName>

  block.prismaType = prismaType
  block.prismaFields = (inputFields: any) => {
    const fields = getFields(inputFields, typeName, prismaSchema)

    fields.forEach(field => {
      const aliasName = field.alias ? field.alias : field.name
      const fieldType = findGraphQLTypeField(typeName, field.name, prismaSchema)
      const { list, ...rest } = prismaType[fieldType.name]
      const args = whitelistArgs(rest.args!, field.args)
      block.field(aliasName, {
        ...rest,
        type: getTypeName(fieldType.type),
        list: list ? true : undefined,
        args,
      })
    })
  }

  return block
}

export function prismaTypeExtend(
  prismaSchema: {
    uniqueFieldsByModel: Record<string, string[]>
    schema: GraphQLSchema
  },
  objectConfig: PrismaExtendTypeConfig<any>,
  builderConfig: PrismaSchemaConfig,
) {
  const typeName = objectConfig.type
  const graphqlType = prismaSchema.schema.getType(typeName)

  if (!isObjectType(graphqlType)) {
    throw new Error(
      `Must select a GraphQLObjectType, saw ${typeName} which is ${graphqlType}`,
    )
  }

  return objectTypeFieldsToNexus(
    graphqlType,
    builderConfig.prisma.client,
    prismaSchema.uniqueFieldsByModel,
  )
}

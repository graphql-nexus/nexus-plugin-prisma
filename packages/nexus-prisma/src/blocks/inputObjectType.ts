import { core } from 'nexus'
import {
  InputField,
  PickInputField,
  FilterInputField,
  AddFieldInput,
} from '../types'
import { GraphQLSchema, isInputObjectType } from 'graphql'
import { PrismaInputObjectTypeConfig } from '../definitions/inputObjectType'
import { inputObjectTypeFieldsToNexus } from '../graphqlToNexus/inputObjectType'
import { getFields } from '../utils'
import { findGraphQLTypeField, getTypeName } from '../graphql'

export interface PrismaInputDefinitionBlock<TypeName extends string>
  extends core.InputDefinitionBlock<TypeName> {
  //prismaType: PrismaOutputOptsMap
  prismaFields(inputFields?: InputField<'inputTypes', TypeName>[]): void
  prismaFields(pickFields: PickInputField<'inputTypes', TypeName>): void
  prismaFields(filterFields: FilterInputField<'inputTypes', TypeName>): void
  prismaFields(inputFields?: AddFieldInput<'inputTypes', TypeName>): void
}

export function prismaInputDefinitionBlock<TypeName extends string>(
  typeName: string,
  t: core.InputDefinitionBlock<TypeName> | core.OutputDefinitionBlock<TypeName>,
  prismaType: Record<string, core.NexusInputFieldConfig>,
  prismaSchema: GraphQLSchema,
): PrismaInputDefinitionBlock<TypeName> {
  const block = t as PrismaInputDefinitionBlock<TypeName>
  block.prismaFields = (inputFields: any) => {
    const fields = getFields(inputFields, typeName, prismaSchema)

    fields.forEach(field => {
      const aliasName = field.alias ? field.alias : field.name
      const fieldType = findGraphQLTypeField(typeName, field.name, prismaSchema)
      const { list, ...rest } = prismaType[field.name]

      block.field(aliasName, {
        ...rest,
        type: getTypeName(fieldType.type),
      })
    })
  }

  return block
}

export function prismaTypeInputObject(
  prismaSchema: GraphQLSchema,
  inputObjectConfig: PrismaInputObjectTypeConfig<any>,
) {
  const typeName = inputObjectConfig.name
  const graphqlType = prismaSchema.getType(typeName)

  if (!isInputObjectType(graphqlType)) {
    throw new Error(
      `Must select a GraphQLInputObjectType, saw ${typeName} which is ${graphqlType}`,
    )
  }

  return inputObjectTypeFieldsToNexus(graphqlType)
}

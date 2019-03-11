import { GraphQLSchema, isInputObjectType } from 'graphql'
import { core } from 'nexus'
import { PrismaInputObjectTypeConfig } from '../definitions/inputObjectType'
import { findGraphQLTypeField, getTypeName } from '../graphql'
import { inputObjectTypeFieldsToNexus } from '../graphqlToNexus/inputObjectType'
import {
  AddFieldInput,
  FilterInputField,
  InputFieldsWithStar,
  PickInputField,
} from '../types'
import { getFields } from '../utils'

export interface PrismaInputDefinitionBlock<TypeName extends string>
  extends core.InputDefinitionBlock<TypeName> {
  prismaFields(inputFields: InputFieldsWithStar<'inputTypes', TypeName>[]): void
  prismaFields(pickFields: PickInputField<'inputTypes', TypeName>): void
  prismaFields(filterFields: FilterInputField<'inputTypes', TypeName>): void
  /**
   * Pick, filter or customize the fields of the underlying input object type
   * @param inputFields The fields you want to pick/filter or customize
   *
   * @example Exposes all fields
   *
   * t.prismaField(['*'])
   *
   * @example Exposes only the `first` and `last` field
   *
   * t.prismaField(['first', 'last'])
   *
   * @example Exposes only the `first` and `last` field (idem-potent with above example)
   *
   * t.prismaFields({ pick: ['first', 'last'] })
   *
   * @example Exposes all fields but the `first` and `last`
   *
   * t.prismaFields({ filter: ['first', 'last'] })
   *
   */
  prismaFields(inputFields: AddFieldInput<'inputTypes', TypeName>): void
}

export function prismaInputDefinitionBlock<TypeName extends string>(
  typeName: string,
  t: core.InputDefinitionBlock<TypeName> | core.OutputDefinitionBlock<TypeName>,
  prismaType: Record<string, core.NexusInputFieldConfig<string, string>>,
  prismaSchema: GraphQLSchema,
): PrismaInputDefinitionBlock<TypeName> {
  const prismaBlock = t as PrismaInputDefinitionBlock<TypeName>

  prismaBlock.prismaFields = (inputFields: any) => {
    const fields = getFields(inputFields, typeName, prismaSchema)

    fields.forEach(field => {
      const aliasName = field.alias ? field.alias : field.name
      const fieldType = findGraphQLTypeField(typeName, field.name, prismaSchema)
      const { list, ...rest } = prismaType[field.name]

      prismaBlock.field(aliasName, {
        ...rest,
        type: getTypeName(fieldType.type),
        list: list ? true : undefined,
      })
    })
  }

  return prismaBlock
}

export function prismaTypeInputObject(
  prismaSchema: GraphQLSchema,
  inputObjectConfig: PrismaInputObjectTypeConfig<any>,
) {
  const typeName = inputObjectConfig.name
  const graphqlType = prismaSchema.getType(typeName)

  if (!isInputObjectType(graphqlType)) {
    throw new Error(
      `\
Must select a GraphQLInputObjectType, saw ${typeName} which is ${graphqlType}.
Are you trying to create a new type? Use \`inputObjectType\` instead of \`prismaInputObjectType\`
`,
    )
  }

  return inputObjectTypeFieldsToNexus(graphqlType)
}

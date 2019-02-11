import { GraphQLSchema, isInputObjectType } from 'graphql'
import { core } from 'nexus'
import { PrismaInputObjectTypeConfig } from '../definitions/inputObjectType'
import { findGraphQLTypeField, getTypeName } from '../graphql'
import { inputObjectTypeFieldsToNexus } from '../graphqlToNexus/inputObjectType'
import {
  AddFieldInput,
  FilterInputField,
  InputField,
  PickInputField,
} from '../types'
import { getFields } from '../utils'

export interface PrismaInputDefinitionBlock<TypeName extends string>
  extends core.InputDefinitionBlock<TypeName> {
  prismaFields(inputFields: InputField<'inputTypes', TypeName>[]): void
  prismaFields(pickFields: PickInputField<'inputTypes', TypeName>): void
  prismaFields(filterFields: FilterInputField<'inputTypes', TypeName>): void
  /**
   * Omit/customize the fields of the underlying input object type
   * @param inputFields The fields you want to omit/customize
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

interface InternalPrismaInputDefinitionBlock<TypeName extends string>
  extends PrismaInputDefinitionBlock<TypeName> {
  __calledPrismaFields: boolean
}

export function prismaInputDefinitionBlock<TypeName extends string>(
  typeName: string,
  t: core.InputDefinitionBlock<TypeName> | core.OutputDefinitionBlock<TypeName>,
  prismaType: Record<string, core.NexusInputFieldConfig>,
  prismaSchema: GraphQLSchema,
): InternalPrismaInputDefinitionBlock<TypeName> {
  const prismaBlock = t as InternalPrismaInputDefinitionBlock<TypeName>

  prismaBlock.prismaFields = (inputFields: any) => {
    prismaBlock.__calledPrismaFields = true
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

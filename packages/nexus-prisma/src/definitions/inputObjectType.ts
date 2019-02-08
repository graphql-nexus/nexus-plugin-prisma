import { GraphQLSchema, isInputObjectType } from 'graphql'
import { core, inputObjectType } from 'nexus'
import { isPrismaSchemaBuilder } from '../builder'
import { findGraphQLTypeField, getTypeName } from '../graphql'
import { inputObjectTypeFieldsToNexus } from '../graphqlToNexus/inputObjectType'
import {
  AddFieldInput,
  FilterInputField,
  GetGen2,
  InputField,
  Omit,
  PickInputField,
} from '../types'
import { getFields } from '../utils'

export type PrismaInputObjectTypeNames = Extract<
  keyof GetGen2<'inputTypes', 'fields'>,
  string
>

export interface PrismaInputDefinitionBlock<TypeName extends string>
  extends core.InputDefinitionBlock<TypeName> {
  //prismaType: PrismaOutputOptsMap
  prismaFields(inputFields?: InputField<'inputTypes', TypeName>[]): void
  prismaFields(pickFields: PickInputField<'inputTypes', TypeName>): void
  prismaFields(filterFields: FilterInputField<'inputTypes', TypeName>): void
  prismaFields(inputFields?: AddFieldInput<'inputTypes', TypeName>): void
}

export interface PrismaInputObjectTypeConfig<TypeName extends string>
  extends Omit<core.NexusInputObjectTypeConfig<TypeName>, 'definition'> {
  definition?: (t: PrismaInputDefinitionBlock<TypeName>) => void
}

export function prismaInputObjectType<
  TypeName extends PrismaInputObjectTypeNames
>(
  typeConfig: PrismaInputObjectTypeConfig<TypeName>,
): core.NexusWrappedType<core.NexusInputObjectTypeDef<TypeName>> {
  return core.nexusWrappedType(typeConfig.name, builder => {
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error(
        'prismaInputObjectType can only be used by `makePrismaSchema`',
      )
    }
    const prismaSchema = builder.getPrismaSchema().schema

    return generateInputObjectType(typeConfig, prismaSchema)
  })
}

export function generatePrismaObjectTypes(
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

export function generatePrismaInputObjectTypeBlock<TypeName extends string>(
  typeName: string,
  t: core.InputDefinitionBlock<TypeName> | core.OutputDefinitionBlock<TypeName>,
  prismaType: Record<string, core.NexusInputFieldConfig>,
  prismaSchema: GraphQLSchema,
) {
  const prismaBlock = t as PrismaInputDefinitionBlock<TypeName>
  //prismaBlock.prismaType = prismaType
  prismaBlock.prismaFields = (inputFields: any) => {
    const fields = getFields(inputFields, typeName, prismaSchema)

    fields.forEach(field => {
      const aliasName = field.alias ? field.alias : field.name
      const fieldType = findGraphQLTypeField(typeName, field.name, prismaSchema)
      const { list, ...rest } = prismaType[field.name]

      prismaBlock.field(aliasName, {
        ...rest,
        type: getTypeName(fieldType.type),
      })
    })
  }

  return prismaBlock
}

function generateInputObjectType<TypeName extends string>(
  typeConfig: PrismaInputObjectTypeConfig<TypeName>,
  prismaSchema: GraphQLSchema,
): core.NexusInputObjectTypeDef<TypeName> {
  let { definition, ...rest } = typeConfig
  const prismaType = generatePrismaObjectTypes(prismaSchema, typeConfig)

  return inputObjectType({
    ...rest,
    definition(t) {
      const prismaBlock = generatePrismaInputObjectTypeBlock(
        typeConfig.name,
        t,
        prismaType,
        prismaSchema,
      )
      if (!definition) {
        definition = t => {
          t.prismaFields()
        }
      }

      definition(prismaBlock)
    },
  })
}

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
  definition(t: PrismaInputDefinitionBlock<TypeName>): void
}

export function prismaInputObjectType<
  TypeName extends PrismaInputObjectTypeNames = string
>(
  typeConfig: PrismaInputObjectTypeConfig<TypeName>,
): core.NexusWrappedType<core.NexusInputObjectTypeDef<TypeName>> {
  return core.nexusWrappedType(typeConfig.name, builder => {
    const { definition, ...rest } = typeConfig
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error(
        'prismaInputObjectType can only be used by `makePrismaSchema`',
      )
    }
    const prismaSchema = builder.getPrismaSchema()
    const prismaType = generatePrismaTypes(prismaSchema, typeConfig)
    return inputObjectType({
      ...rest,
      definition(t) {
        const prismaBlock = t as PrismaInputDefinitionBlock<TypeName>
        //prismaBlock.prismaType = prismaType
        prismaBlock.prismaFields = (inputFields: any) => {
          const typeName = typeConfig.name
          const fields = getFields(inputFields, typeName, prismaSchema)

          fields.forEach(field => {
            const fieldType = findGraphQLTypeField(
              typeName,
              field.name,
              prismaSchema,
            )
            const { list, ...rest } = prismaType[field.name]
            t.field(field.name, {
              ...rest,
              type: getTypeName(fieldType.type),
            })
          })
        }
        definition(prismaBlock)
      },
    })
  })
}

function generatePrismaTypes(
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

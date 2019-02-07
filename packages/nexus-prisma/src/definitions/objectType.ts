import { GraphQLObjectType, GraphQLSchema, isObjectType } from 'graphql'
import { core, objectType } from 'nexus'
import { isPrismaSchemaBuilder } from '../builder'
import { findGraphQLTypeField, getTypeName } from '../graphql'
import { objectTypeFieldsToNexus } from '../graphqlToNexus/objectType'
import {
  AddFieldInput,
  FilterInputField,
  GetGen2,
  GetGen3,
  InputField,
  Omit,
  PickInputField,
  PrismaSchemaConfig,
} from '../types'
import { getFields, whitelistArgs } from '../utils'

export type PrismaObjectTypeNames = Extract<
  keyof GetGen2<'objectTypes', 'fields'>,
  string
>

type TypeDetails<TypeName extends string> = GetGen3<
  'objectTypes',
  'fieldsDetails',
  TypeName
>

export interface PrismaObjectDefinitionBlock<TypeName extends string>
  extends core.ObjectDefinitionBlock<TypeName> {
  prismaType: TypeDetails<TypeName>
  prismaFields(inputFields?: InputField<'objectTypes', TypeName>[]): void
  prismaFields(pickFields: PickInputField<'objectTypes', TypeName>): void
  prismaFields(filterFields: FilterInputField<'objectTypes', TypeName>): void
  prismaFields(inputFields?: AddFieldInput<'objectTypes', TypeName>): void
}

export interface PrismaObjectTypeConfig<TypeName extends string>
  extends Omit<core.NexusObjectTypeConfig<TypeName>, 'definition'> {
  definition?: (t: PrismaObjectDefinitionBlock<TypeName>) => void
}

export function prismaObjectType<
  TypeName extends PrismaObjectTypeNames = string
>(
  typeConfig: PrismaObjectTypeConfig<TypeName>,
): core.NexusWrappedType<core.NexusObjectTypeDef<TypeName>> {
  return core.nexusWrappedType(typeConfig.name, builder => {
    let { definition, ...rest } = typeConfig
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error('prismaObjectType can only be used by `makePrismaSchema`')
    }
    const prismaSchema = builder.getPrismaSchema().schema
    const prismaType = generatePrismaTypes(
      builder.getPrismaSchema(),
      typeConfig,
      builder.getConfig(),
    )
    return objectType({
      ...rest,
      definition(t) {
        const prismaBlock = t as PrismaObjectDefinitionBlock<TypeName>
        prismaBlock.prismaType = prismaType
        prismaBlock.prismaFields = (inputFields: any) => {
          const typeName = this.name
          const graphqlType = prismaSchema.getType(
            typeName,
          ) as GraphQLObjectType
          const fields = getFields(inputFields, typeName, prismaSchema)

          graphqlType.getInterfaces().forEach(interfaceType => {
            t.implements(interfaceType.name)
          })
          fields.forEach(field => {
            const fieldType = findGraphQLTypeField(
              typeName,
              field.name,
              prismaSchema,
            )
            const { list, ...rest } = prismaType[fieldType.name]
            const args = whitelistArgs(rest.args!, field.args)
            t.field(field.name, {
              ...rest,
              type: getTypeName(fieldType.type),
              list: list ? true : undefined,
              args,
            })
          })
        }
        if (!definition) {
          definition = t => {
            t.prismaFields()
          }
        }
        definition(prismaBlock)
      },
    })
  })
}

function generatePrismaTypes(
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

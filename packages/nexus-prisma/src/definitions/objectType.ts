import { GraphQLObjectType, GraphQLSchema, isObjectType } from 'graphql'
import { core, objectType } from 'nexus'
import { isPrismaSchemaBuilder, PrismaSchemaBuilder } from '../builder'
import { findGraphQLTypeField, getTypeName } from '../graphql'
import { objectTypeFieldsToNexus } from '../graphqlToNexus/objectType'
import {
  AddFieldInput,
  FilterInputField,
  GetGen3,
  InputField,
  Omit,
  PickInputField,
  PrismaSchemaConfig,
  PrismaObjectTypeNames,
} from '../types'
import { getFields, whitelistArgs } from '../utils'

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
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error('prismaObjectType can only be used by `makePrismaSchema`')
    }

    return generateObjectType(typeConfig, builder)
  })
}

function generatePrismaInputObjectTypes(
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

export function generatePrismaObjectTypeBlock<TypeName extends string>(
  typeName: string,
  t:
    | core.ObjectDefinitionBlock<TypeName>
    | core.OutputDefinitionBlock<TypeName>,
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

function generateObjectType<TypeName extends string>(
  typeConfig: PrismaObjectTypeConfig<TypeName>,
  builder: PrismaSchemaBuilder,
) {
  let { definition, ...rest } = typeConfig
  const nexusPrismaSchema = builder.getPrismaSchema()
  const prismaType = generatePrismaInputObjectTypes(
    nexusPrismaSchema,
    typeConfig,
    builder.getConfig(),
  )
  const prismaSchema = nexusPrismaSchema.schema
  return objectType({
    ...rest,
    definition(t) {
      const prismaBlock = generatePrismaObjectTypeBlock(
        typeConfig.name,
        t as PrismaObjectDefinitionBlock<TypeName>,
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

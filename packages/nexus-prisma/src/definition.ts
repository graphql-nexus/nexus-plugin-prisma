import { GraphQLObjectType, GraphQLSchema, isObjectType } from 'graphql'
import { core, objectType } from 'nexus'
import { isPrismaSchemaBuilder } from './builder'
import { findObjectTypeField, getTypeName } from './graphql'
import { graphqlFieldsToNexusFields } from './graphqlToNexus'
import {
  AddFieldInput,
  FilterInputField,
  InputField,
  Omit,
  PickInputField,
  PrismaObjectTypeNames,
  PrismaOutputOptsMap,
  PrismaSchemaConfig,
} from './types'
import { getFields, whitelistArgs } from './utils'

export interface PrismaObjectDefinitionBlock<TypeName extends string>
  extends core.ObjectDefinitionBlock<TypeName> {
  prismaType: PrismaOutputOptsMap
  prismaFields(inputFields?: InputField<TypeName>[]): void
  prismaFields(pickFields: PickInputField<TypeName>): void
  prismaFields(filterFields: FilterInputField<TypeName>): void
  prismaFields(inputFields?: AddFieldInput<TypeName>): void
}

export interface PrismaObjectTypeConfig<TypeName extends string>
  extends Omit<core.NexusObjectTypeConfig<TypeName>, 'definition' | 'name'> {
  name: TypeName
  definition(t: PrismaObjectDefinitionBlock<TypeName>): void
}

export function prismaObjectType<
  TypeName extends PrismaObjectTypeNames = string
>(
  typeConfig: PrismaObjectTypeConfig<TypeName>,
): core.NexusWrappedType<core.NexusObjectTypeDef<TypeName>> {
  return core.nexusWrappedType(typeConfig.name, builder => {
    const { definition, ...rest } = typeConfig
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error('prismaObjectType can only be used by `makePrismaSchema`')
    }
    const prismaSchema = builder.getPrismaSchema()
    const prismaType = generatePrismaTypes(
      prismaSchema,
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
            const fieldType = findObjectTypeField(
              typeName,
              field.name,
              prismaSchema,
            )
            const { list, ...rest } = prismaType[fieldType.name]
            const args = whitelistArgs(rest.args, field.args)
            t.field(field.name, {
              ...rest,
              type: getTypeName(fieldType.type),
              list: list ? true : undefined,
              args,
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
  objectConfig: PrismaObjectTypeConfig<any>,
  builderConfig: PrismaSchemaConfig,
): PrismaOutputOptsMap {
  const typeName = objectConfig.name
  const graphqlType = prismaSchema.getType(typeName)
  if (!isObjectType(graphqlType)) {
    throw new Error(
      `Must select a GraphQLObjectType, saw ${typeName} which is ${graphqlType}`,
    )
  }

  return graphqlFieldsToNexusFields(
    graphqlType,
    builderConfig.prisma.contextClientName,
  )
}

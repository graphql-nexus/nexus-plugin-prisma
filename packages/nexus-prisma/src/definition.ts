import { core, objectType, arg } from 'nexus'
import { isPrismaSchemaBuilder } from './builder'
import {
  InputField,
  PickInputField,
  FilterInputField,
  AddFieldInput,
  PrismaOutputOpts,
  PrismaOutputOptsMap,
  PrismaSchemaConfig,
  PrismaObjectTypeNames,
} from './types'
import { isObjectType, GraphQLSchema } from 'graphql'
import { getTypeName, isListOrRequired, findObjectTypeField } from './graphql'
import { generateDefaultResolver } from './resolver'
import { getFields, whitelistArgs } from './utils'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

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
>(typeConfig: PrismaObjectTypeConfig<TypeName>) {
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
          const fields = getFields(inputFields, typeName, prismaSchema)
          fields.forEach(field => {
            const fieldName =
              field.alias === undefined ? field.name : field.alias
            const fieldType = findObjectTypeField(
              typeName,
              field.name,
              prismaSchema,
            )
            const { list, ...rest } = prismaType[fieldType.name]
            const args = whitelistArgs(rest.args, field.args)
            t.field(fieldName, {
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
): Record<string, PrismaOutputOpts> {
  const typeName = objectConfig.name
  const graphqlType = prismaSchema.getType(typeName)
  if (!isObjectType(graphqlType)) {
    throw new Error(
      `Must select a GraphQLObjectType, saw ${typeName} which is ${graphqlType}`,
    )
  }
  return Object.values(graphqlType.getFields()).reduce<PrismaOutputOptsMap>(
    (acc, field) => {
      acc[field.name] = {
        ...isListOrRequired(field.type),
        description: field.description,
        args: field.args.reduce<Record<string, any>>((acc, fieldArg) => {
          acc[fieldArg.name] = arg({
            type: getTypeName(fieldArg.type),
            ...isListOrRequired(fieldArg.type),
            description: fieldArg.description,
          })
          return acc
        }, {}),
        resolve: generateDefaultResolver(
          typeName,
          field,
          builderConfig.prisma.contextClientName,
        ),
      }
      return acc
    },
    {},
  )
}

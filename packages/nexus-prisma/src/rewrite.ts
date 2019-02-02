import { core, arg } from 'nexus'
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNamedType,
  isInputObjectType,
  isEnumType,
  isScalarType,
  GraphQLType,
} from 'graphql'
import { isListOrRequired, getTypeName, findObjectTypeField } from './graphql'
import { generateDefaultResolver } from './resolver'
import { PrismaSchemaBuilder } from './builder'
import {
  InputField,
  PickInputField,
  FilterInputField,
  AddFieldInput,
  PrismaOutputOpts,
  PrismaSchemaConfig,
  PrismaOutputOptsMap,
  PrismaTypeNames,
} from './rewrite_types'
import { getFields, whitelistArgs } from './utils'

export class PrismaObjectDefinitionBlock<
  TypeName extends string
> extends core.ObjectDefinitionBlock<TypeName> {
  public prismaType: Record<string, PrismaOutputOpts>
  private config: PrismaSchemaConfig
  private prismaSchema: GraphQLSchema
  public typesToExport: GraphQLType[]

  constructor(
    protected typeBuilder: core.ObjectDefinitionBuilder<TypeName>,
    protected name: string,
    protected schemaBuilder: PrismaSchemaBuilder,
  ) {
    super(typeBuilder)

    this.config = schemaBuilder.getConfig()
    this.prismaSchema = schemaBuilder.getPrismaSchema()

    this.prismaType = this.generatePrismaTypes()
    this.typesToExport = []
  }

  public prismaFields(inputFields?: InputField<TypeName>[]): void
  public prismaFields(pickFields: PickInputField<TypeName>): void
  public prismaFields(filterFields: FilterInputField<TypeName>): void
  public prismaFields(inputFields?: AddFieldInput<TypeName>): void {
    const typeName = this.name
    const fields = getFields(inputFields, typeName, this.prismaSchema)

    fields.forEach(field => {
      const fieldName = field.alias === undefined ? field.name : field.alias
      const fieldType = findObjectTypeField(
        typeName,
        field.name,
        this.prismaSchema,
      )
      const { list, ...rest } = this.prismaType[fieldType.name]
      const args = whitelistArgs(rest.args, field.args)

      this.typeBuilder.addField({
        name: fieldName,
        type: getTypeName(fieldType.type),
        list: list ? true : undefined,
        args,
        ...rest,
      })
    })
  }

  protected generatePrismaTypes(): PrismaOutputOptsMap {
    const typeName = this.name
    const graphqlType = this.prismaSchema.getType(typeName) as GraphQLObjectType

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
            this.config.prisma.contextClientName,
          ),
        }

        return acc
      },
      {},
    )
  }
}

interface NexusPrismaObjectTypeConfig<
  TypeName extends string = PrismaTypeNames
> extends core.NexusObjectTypeConfig<TypeName> {
  definition(t: PrismaObjectDefinitionBlock<TypeName>): void
}

export function prismaObjectType<TypeName extends string>(
  config: NexusPrismaObjectTypeConfig<TypeName>,
) {
  return new core.NexusObjectTypeDef(config.name, config)
}

function getAllInputEnumTypes(schema: GraphQLSchema): GraphQLNamedType[] {
  const types = Object.values(schema.getTypeMap())

  const inputTypes = types.filter(isInputObjectType)
  const enumTypes = types.filter(isEnumType)
  const scalarTypes = types.filter(isScalarType)

  const pageInfoType = schema.getType('PageInfo')!
  const batchPayloadType = schema.getType('BatchPayload')!
  const nodeType = schema.getType('Node')!

  return [
    ...inputTypes,
    ...enumTypes,
    ...scalarTypes,
    batchPayloadType,
    nodeType,
    pageInfoType,
  ]
}

/**
 * Add all the scalar/enums/input types from prisma to `types`
 * @param types The `makeSchema.types` option
 */
export function withPrismaTypes(types: any) {
  return new core.NexusWrappedFn(schemaBuilder => {
    const schema = schemaBuilder as PrismaSchemaBuilder
    const typesMap = schema.getPrismaSchema()

    return [types, ...getAllInputEnumTypes(typesMap)] as any
  })
}

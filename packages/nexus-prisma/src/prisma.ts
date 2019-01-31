import {
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLSchema,
  isEnumType,
  isInputObjectType,
  isScalarType,
} from 'graphql'
import { arg, core } from 'nexus'
import { ArgDefinition, FieldDef, OutputFieldConfig } from 'nexus/dist/types'
import { PrismaSchemaBuilder } from '.'
import { findObjectTypeField, getTypeName, isListOrNullable } from './graphql'
import { generateDefaultResolver } from './resolver'
import {
  AddFieldInput,
  FilterInputField,
  InputField,
  PickInputField,
  PrismaEnumTypeNames,
  PrismaObject,
  PrismaOutputOpts,
  PrismaOutputOptsMap,
  PrismaSchemaConfig,
  PrismaTypeNames,
} from './types'
import { flatMap, getFields, isConnectionTypeName } from './utils'

function whitelistArgs(
  args: Record<string, ArgDefinition>,
  whitelist: string[] | false | undefined,
) {
  if (!whitelist) {
    return args
  }

  return Object.keys(args).reduce<Record<string, ArgDefinition>>(
    (acc, argName) => {
      if (whitelist.includes(argName)) {
        return {
          ...acc,
          [argName]: args[argName],
        }
      }

      return acc
    },
    {},
  )
}

class PrismaObjectType<
  GenTypes,
  TypeName extends string
> extends core.ObjectTypeDef<GenTypes, TypeName> {
  public prismaType: PrismaObject<GenTypes, TypeName>

  constructor(
    protected typeName: string,
    protected config: PrismaSchemaConfig,
    protected schema: GraphQLSchema,
  ) {
    super(typeName)

    this.prismaType = this.generatePrismaTypes() as any
  }

  public prismaFields(inputFields?: InputField<GenTypes, TypeName>[]): void
  public prismaFields(pickFields: PickInputField<GenTypes, TypeName>): void
  public prismaFields(filterFields: FilterInputField<GenTypes, TypeName>): void
  public prismaFields(inputFields?: AddFieldInput<GenTypes, TypeName>): void {
    const typeName = this.name

    const fields = getFields(inputFields, typeName, this.schema)

    fields.forEach(field => {
      const fieldName = field.alias === undefined ? field.name : field.alias
      const fieldType = findObjectTypeField(this.name, field.name, this.schema)
      const opts: PrismaOutputOpts = this.prismaType[fieldType.name]
      const args = whitelistArgs(opts.args, field.args)

      // Same as this.field(fieldName, fieldType.type.name, { ...opts, args })
      // But typings are too strict
      this.typeConfig.fields.push({
        item: core.Types.NodeType.FIELD,
        config: {
          name: fieldName,
          type: getTypeName(fieldType.type),
          ...opts,
          args,
        },
      })
    })
  }

  public getTypeConfig(): core.Types.ObjectTypeConfig {
    return this.typeConfig
  }

  protected generatePrismaTypes(): PrismaOutputOptsMap {
    const typeName = this.name
    const graphqlType = this.schema.getType(typeName) as GraphQLObjectType

    return Object.values(graphqlType.getFields()).reduce<PrismaOutputOptsMap>(
      (acc, field) => {
        const { list, nullable } = isListOrNullable(field.type)
        acc[field.name] = {
          list,
          nullable,
          description: field.description ? field.description : undefined,
          args: field.args.reduce<Record<string, ArgDefinition>>(
            (acc, fieldArg) => {
              acc[fieldArg.name] = arg(
                getTypeName(fieldArg.type) as any,
                isListOrNullable(field.type),
              )
              return acc
            },
            {},
          ),
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

function isFieldDef(field: any): field is FieldDef {
  return field.item && field.item === 'FIELD'
}

function isOutputFieldConfig(config: any): config is OutputFieldConfig {
  return config && config.args !== undefined
}

function createRelayConnectionType(typeName: string) {
  const [normalTypeName] = typeName.split('Connection')
  const edgeTypeName = `${normalTypeName}Edge`

  return [
    prismaObjectType(typeName, t => {
      t.prismaFields(['edges', 'pageInfo']) // Do not expose aggregate field
    }),
    prismaObjectType(edgeTypeName),
  ]
}

function getRelayConnectionTypesToExport(
  typeConfig: core.Types.ObjectTypeConfig,
) {
  const connectionTypes = typeConfig.fields.filter(
    field =>
      isFieldDef(field) &&
      isOutputFieldConfig(field.config) &&
      isConnectionTypeName(field.config.type),
  )

  return flatMap(connectionTypes, (field: any) =>
    createRelayConnectionType(field.config.type),
  )
}

function getAllInputEnumTypes(
  schema: GraphQLSchema,
): (core.WrappedType | GraphQLNamedType)[] {
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
  return new core.WrappedType((schemaBuilder: any) => {
    const schema = schemaBuilder as PrismaSchemaBuilder
    const typesMap = schema.getPrismaSchema()

    return [types, ...getAllInputEnumTypes(typesMap)] as any
  })
}

export function prismaObjectType<
  GenTypes = GraphQLNexusGen,
  TypeName extends PrismaTypeNames<GenTypes> = PrismaTypeNames<GenTypes>
>(
  typeName:
    | TypeName
    | {
        prismaTypeName: TypeName
        objectTypeName?: string
      },
  fn?: (t: PrismaObjectType<GenTypes, TypeName>) => void,
): core.WrappedType {
  return new core.WrappedType((schemaBuilder: any) => {
    const schema = schemaBuilder as PrismaSchemaBuilder
    // TODO refactor + make use of `objectTypeName`
    const realTypeName =
      typeof typeName === 'string' ? typeName : typeName.prismaTypeName
    const objectType = new PrismaObjectType<GenTypes, TypeName>(
      realTypeName,
      schema.getConfig(),
      schema.getPrismaSchema(),
    )

    // mutate objectType
    if (fn === undefined) {
      objectType.prismaFields()
    } else {
      fn(objectType)
    }

    const typeConfig = objectType.getTypeConfig()
    const connectionTypesToExport = getRelayConnectionTypesToExport(typeConfig)

    const output = [
      new core.WrappedType(objectType),
      ...connectionTypesToExport,
    ]

    return output as any
  })
}

export function prismaEnumType<GenTypes = GraphQLNexusGen>(
  typeName: PrismaEnumTypeNames<GenTypes>,
): core.WrappedType {
  return new core.WrappedType((schemaBuilder: any) => {
    const schema = schemaBuilder as PrismaSchemaBuilder

    const graphqlEnumType = schema.getPrismaSchema().getType(typeName as string)

    if (graphqlEnumType === undefined) {
      throw new Error(`Unknown enum '${typeName}' in Prisma API`)
    }

    return graphqlEnumType as any
  })
}

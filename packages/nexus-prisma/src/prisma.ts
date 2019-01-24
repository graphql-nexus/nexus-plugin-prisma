import {
  arg,
  enumType,
  inputObjectType,
  objectType,
  scalarType,
  core,
} from 'nexus'
import { ArgDefinition, FieldDef, OutputFieldConfig } from 'nexus/dist/types'
import { PrismaSchemaBuilder } from '.'
import { generateDefaultResolver } from './resolver'
import { GraphQLEnumObject, GraphQLTypeField, TypesMap } from './source-helper'
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
import {
  getFields,
  isConnectionTypeName,
  typeToFieldOpts,
  flatMap,
} from './utils'

function findPrismaFieldType(
  typesMap: TypesMap,
  typeName: string,
  fieldName: string,
): GraphQLTypeField {
  const graphqlType = typesMap.types[typeName]

  if (graphqlType === undefined) {
    throw new Error(`Type '${typeName}' not found in Prisma API`)
  }

  const graphqlField = graphqlType.fields.find(
    field => field.name === fieldName,
  )

  if (graphqlField === undefined) {
    throw new Error(`Field ${typeName}.${fieldName} not found in Prisma API`)
  }

  return graphqlField
}

function exportEnumType(enumObject: GraphQLEnumObject) {
  return enumType(enumObject.name, enumObject.values)
}

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
    protected typesMap: TypesMap,
  ) {
    super(typeName)

    this.prismaType = this.generatePrismaTypes() as any
  }

  public prismaFields(inputFields?: InputField<GenTypes, TypeName>[]): void
  public prismaFields(pickFields: PickInputField<GenTypes, TypeName>): void
  public prismaFields(filterFields: FilterInputField<GenTypes, TypeName>): void
  public prismaFields(inputFields?: AddFieldInput<GenTypes, TypeName>): void {
    const typeName = this.name

    const fields = getFields(inputFields, typeName, this.typesMap)

    fields.forEach(field => {
      const fieldName = field.alias === undefined ? field.name : field.alias
      const fieldType = findPrismaFieldType(
        this.typesMap,
        this.name,
        field.name,
      )
      const opts: PrismaOutputOpts = this.prismaType[fieldType.name]
      const args = whitelistArgs(opts.args, field.args)

      // Same as this.field(fieldName, fieldType.type.name, { ...opts, args })
      // But typings are too strict
      this.typeConfig.fields.push({
        item: core.Types.NodeType.FIELD,
        config: {
          name: fieldName,
          type: fieldType.type.name,
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

    const graphqlType = this.typesMap.types[typeName]

    return graphqlType.fields.reduce<PrismaOutputOptsMap>((acc, field) => {
      acc[field.name] = {
        list: field.type.isArray,
        nullable: !field.type.isRequired,
        description: field.description,
        args: field.arguments.reduce<Record<string, ArgDefinition>>(
          (acc, fieldArg) => {
            acc[fieldArg.name] = arg(
              fieldArg.type.name as any,
              typeToFieldOpts(fieldArg.type),
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
    }, {})
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

function getAllInputEnumTypes(typesMap: TypesMap): core.WrappedType[] {
  const types = Object.values(typesMap.types)
  const enums = Object.values(typesMap.enums)

  const inputTypes = types
    .filter(t => t.type.isInput)
    .map(inputType => {
      return inputObjectType(inputType.name, t => {
        inputType.fields.forEach(field => {
          t.field(
            field.name,
            field.type.name as any,
            typeToFieldOpts(field.type),
          )
        })
      })
    })

  const enumTypes = enums.map(enumObject => exportEnumType(enumObject))
  const pageInfoType = objectType('PageInfo', t => {
    t.boolean('hasNextPage' as any)
    t.boolean('hasPreviousPage' as any)
    t.string('startCursor' as any)
    t.string('endCursor' as any)
  })
  const longScalarType = scalarType('Long', {
    serialize(value) {
      return value
    },
  })
  const dateTimeScalarType = scalarType('DateTime', {
    serialize(value) {
      return value
    },
  })
  const batchPayloadType = objectType('BatchPayload', t => {
    t.field('count' as any, 'Long' as any)
  })
  const nodeType = objectType('Node', t => {
    t.id('id' as any)
  })

  return [
    ...inputTypes,
    ...enumTypes,
    dateTimeScalarType,
    longScalarType,
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
    const typesMap = schema.getPrismaTypesMap()

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
      schema.getPrismaTypesMap(),
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
    const typesMap = schema.getPrismaTypesMap()

    const graphqlEnumType = typesMap.enums[typeName as string]

    if (graphqlEnumType === undefined) {
      throw new Error(`Unknown enum '${typeName}' in Prisma API`)
    }

    return enumType(typeName as string, graphqlEnumType.values)
  })
}

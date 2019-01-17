import { existsSync, readFileSync } from 'fs'
import { arg, enumType, inputObjectType, scalarType } from 'nexus'
import { ObjectTypeDef, Types, WrappedType } from 'nexus/dist/core'
import { ArgDefinition, FieldDef, OutputFieldConfig } from 'nexus/dist/types'
import { GraphQLFieldResolver } from 'graphql'
import * as _ from 'lodash'
import {
  extractTypes,
  GraphQLEnumObject,
  GraphQLType,
  GraphQLTypeField,
  GraphQLTypeObject,
} from './source-helper'
import { throwIfUnknownClientFunction } from './throw'
import {
  AddFieldInput,
  FilterInputField,
  InputField,
  PickInputField,
  PrismaObject,
  PrismaOutputOpts,
  PrismaOutputOptsMap,
  PrismaTypeNames,
  PrismaSchemaConfig,
  PrismaEnumTypeNames,
} from './types'
import {
  getFields,
  getObjectInputArg,
  isCreateMutation,
  isDeleteMutation,
  isNotArrayOrConnectionType,
  typeToFieldOpts,
  isConnectionTypeName,
} from './utils'

interface Dictionary<T> {
  [key: string]: T
}

export interface TypesMap {
  types: Dictionary<GraphQLTypeObject>
  enums: Dictionary<GraphQLEnumObject>
}

const BASE_SCALARS = ['String', 'Boolean', 'Int', 'Float', 'ID']

function buildTypesMap(schemaPath: string): TypesMap {
  const typeDefs = readFileSync(schemaPath).toString()
  const gqlTypes = extractTypes(typeDefs)

  const types = gqlTypes.types.reduce<Dictionary<GraphQLTypeObject>>(
    (acc, type) => {
      acc[type.name] = type

      return acc
    },
    {},
  )

  const enums = gqlTypes.enums.reduce<Dictionary<GraphQLEnumObject>>(
    (acc, enumObject) => {
      acc[enumObject.name] = enumObject

      return acc
    },
    {},
  )

  return { types, enums }
}

function generateDefaultResolver(
  typeName: string,
  fieldToResolve: GraphQLTypeField,
  contextClientName: string,
): GraphQLFieldResolver<any, any, Dictionary<any>> {
  return (root, args, ctx, info) => {
    const isTopLevel = ['Query', 'Mutation', 'Subscription'].includes(typeName)

    if (typeName === 'Subscription') {
      throw new Error('Subscription not supported yet')
    }

    const fieldName = fieldToResolve.name

    if (fieldToResolve.type.isScalar) {
      return root[fieldName]
    }

    if (isTopLevel) {
      throwIfUnknownClientFunction(
        fieldName,
        typeName,
        ctx,
        contextClientName,
        info,
      )

      if (
        isNotArrayOrConnectionType(fieldToResolve) ||
        isCreateMutation(typeName, fieldName)
      ) {
        args = args.where
      }

      if (isDeleteMutation(typeName, fieldName)) {
        args = args.where
      }

      return ctx[contextClientName][fieldName](args)
    }

    if (isConnectionTypeName(typeName)) {
      // returns `pageInfo` and `edges` queries by the client
      return root[fieldName]
    }

    // fields inside `edges` are queried as well, we can simply return them
    if (
      typeName.endsWith('Edge') &&
      typeName !== 'Edge' &&
      (fieldName === 'node' || fieldName === 'cursor')
    ) {
      return root[fieldName]
    }

    const parentName = _.camelCase(typeName)

    throwIfUnknownClientFunction(
      parentName,
      typeName,
      ctx,
      contextClientName,
      info,
    )

    // FIXME: It can very well be something else than `id` (depending on the @unique field)
    return ctx[contextClientName][parentName]({ id: root.id })[fieldName](args)
  }
}

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

function exportInputObjectType(
  inputType: GraphQLTypeObject,
  typesMap: TypesMap,
  seen: Dictionary<boolean>,
): WrappedType[] {
  seen[inputType.name] = true

  const typesToExport: WrappedType[] = []

  const inputObject = inputObjectType(inputType.name, arg => {
    inputType.fields.forEach(field => {
      if (isBaseScalar(field.type)) {
        return getObjectInputArg(arg, field, typeToFieldOpts(field.type))
      }

      if (!seen[field.type.name]) {
        if (field.type.isScalar && field.type.name === 'DateTime') {
          typesToExport.push(exportDateTimeScalar())
        } else if (field.type.isEnum) {
          typesToExport.push(exportEnumType(typesMap.enums[field.type.name]))
        } else {
          typesToExport.push(
            ...exportInputObjectType(
              typesMap.types[field.type.name],
              typesMap,
              seen,
            ),
          )
        }
      }

      arg.field(field.name, field.type.name as any, typeToFieldOpts(field.type))
    })
  })

  return [...typesToExport, inputObject]
}

function exportEnumType(enumObject: GraphQLEnumObject) {
  return enumType(enumObject.name, enumObject.values)
}

function exportDateTimeScalar(): WrappedType {
  return scalarType('DateTime', {
    serialize(value) {
      return value
    },
  })
}

function isBaseScalar(type: GraphQLType) {
  return type.isScalar && BASE_SCALARS.includes(type.name)
}

function filterArgsToExpose(
  allArgs: Record<string, ArgDefinition>,
  argsToExpose: string[] | false | undefined,
) {
  if (!argsToExpose) {
    return allArgs
  }

  return Object.keys(allArgs).reduce<Record<string, ArgDefinition>>(
    (acc, argName) => {
      if (argsToExpose.includes(argName)) {
        return {
          ...acc,
          [argName]: allArgs[argName],
        }
      }

      return acc
    },
    {},
  )
}

// TODO: Fix this
let __typesMapCache: TypesMap | null = null
let __exportedTypesMap: Dictionary<boolean> = {}

function getTypesMap(schemaPath: string) {
  if (__typesMapCache === null) {
    __typesMapCache = buildTypesMap(schemaPath)
  }

  return __typesMapCache
}

function getExportedTypesMap(): Dictionary<boolean> {
  return __exportedTypesMap
}

export function invalidateCache() {
  __typesMapCache = null
  __exportedTypesMap = {}
}

// Prevent from exporting the same type twice
function addExportedTypesToGlobalCache(types: WrappedType[]): void {
  if (types.length === 0) {
    return
  }

  __exportedTypesMap = {
    ...__exportedTypesMap,
    ...types.reduce<Dictionary<boolean>>((acc, t) => {
      acc[t.type.name] = true

      return acc
    }, {}),
  }
}

class PrismaObjectType<GenTypes, TypeName extends string> extends ObjectTypeDef<
  GenTypes,
  TypeName
> {
  protected typesMap: TypesMap
  public prismaType: PrismaObject<GenTypes, TypeName>

  constructor(
    protected typeName: string,
    protected config: PrismaSchemaConfig,
  ) {
    super(typeName)

    if (!existsSync(config.prisma.schemaPath)) {
      throw new Error('Prisma GraphQL API not found')
    }

    this.typesMap = getTypesMap(config.prisma.schemaPath)
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
      const args = filterArgsToExpose(opts.args, field.args)

      this.field(fieldName, fieldType.type.name as any, {
        ...opts,
        args,
      })
    })
  }

  public getTypeConfig(): Types.ObjectTypeConfig {
    return this.typeConfig
  }

  public getTypesMap() {
    return this.typesMap
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

// TODO: Optimize this heavy function
function getInputTypesToExport(
  typeConfig: Types.ObjectTypeConfig,
  typesMap: TypesMap,
): WrappedType[] {
  const exportedTypesMap = getExportedTypesMap()

  return _(typeConfig.fields)
    .filter(
      field =>
        isFieldDef(field) &&
        isOutputFieldConfig(field.config) &&
        field.config.args !== undefined,
    )
    .flatMap(field => {
      return Object.values(((<FieldDef>field).config as any).args).map(
        (arg: any) => arg.type,
      ) as string[]
    })
    .filter(typeName => {
      const graphqlType = typesMap.types[typeName]

      return (
        graphqlType !== undefined &&
        (!exportedTypesMap[typeName] || !isBaseScalar(graphqlType.type as any))
      )
    })
    .uniq()
    .flatMap(typeName => {
      const graphqlType = typesMap.types[typeName]

      if (graphqlType.type.isInput) {
        return exportInputObjectType(
          graphqlType as GraphQLTypeObject,
          typesMap,
          {},
        )
      }

      if (graphqlType.type.isEnum) {
        return exportEnumType(typesMap.enums[typeName])
      }

      if (graphqlType.type.isScalar && graphqlType.type.name === 'DateTime') {
        return exportDateTimeScalar()
      }

      throw new Error('Unsupported type')
    })
    .filter(t => exportedTypesMap[t.type.name] === undefined)
    .uniqBy(t => t.type.name) // TODO: Optimize by sharing the `seen` typeMap in `exportInputObjectType`
    .value()
}

function createRelayConnectionType(typeName: string) {
  const [normalTypeName] = typeName.split('Connection')
  const edgeTypeName = `${normalTypeName}Edge`

  return [
    prismaObjectType(typeName, t => {
      t.prismaFields(['edges', 'pageInfo'])
    }),
    prismaObjectType(edgeTypeName),
  ]
}

function getRelayConnectionTypesToExport(typeConfig: Types.ObjectTypeConfig) {
  const exportedTypesMap = getExportedTypesMap()

  const connectionTypes = _(typeConfig.fields)
    .filter(
      field =>
        isFieldDef(field) &&
        isOutputFieldConfig(field.config) &&
        isConnectionTypeName(field.config.type) &&
        exportedTypesMap[field.config.type] === undefined,
    )
    .flatMap((field: any) => createRelayConnectionType(field.config.type))
    .value()

  if (
    connectionTypes.length > 0 &&
    exportedTypesMap['PageInfo'] === undefined
  ) {
    connectionTypes.push(prismaObjectType('PageInfo'))
  }

  return connectionTypes
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
): WrappedType {
  return new WrappedType((schema: any) => {
    // TODO refactor + make use of `objectTypeName`
    const realTypeName =
      typeof typeName === 'string' ? typeName : typeName.prismaTypeName
    const objectType = new PrismaObjectType<GenTypes, TypeName>(
      realTypeName,
      schema.getConfig(),
    )

    // mutate objectType
    if (fn === undefined) {
      objectType.prismaFields()
    } else {
      fn(objectType)
    }

    const typesMap = objectType.getTypesMap()
    const typeConfig = objectType.getTypeConfig()
    const inputTypesToExport = getInputTypesToExport(typeConfig, typesMap)
    const connectionTypesToExport = getRelayConnectionTypesToExport(typeConfig)

    addExportedTypesToGlobalCache([
      ...inputTypesToExport,
      ...connectionTypesToExport,
    ])

    return [
      new WrappedType(objectType),
      ...inputTypesToExport,
      ...connectionTypesToExport,
    ] as any
  })
}

export function prismaEnumType<GenTypes = GraphQLNexusGen>(
  typeName: PrismaEnumTypeNames<GenTypes>,
): WrappedType {
  return new WrappedType((schema: any) => {
    const typesMap = getTypesMap(schema.getConfig().prisma.schemaPath)

    const graphqlEnumType = typesMap.enums[typeName as string]

    if (graphqlEnumType === undefined) {
      throw new Error(`Unknown enum '${typeName}' in Prisma API`)
    }

    const exportedTypesMap = getExportedTypesMap()

    if (exportedTypesMap[typeName as string]) {
      return
    }

    return enumType(typeName as string, graphqlEnumType.values) as any
  })
}

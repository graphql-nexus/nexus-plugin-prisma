import { arg, enumType, inputObjectType, scalarType, objectType } from 'nexus'
import { ObjectTypeDef, Types, WrappedType } from 'nexus/dist/core'
import { ArgDefinition, FieldDef, OutputFieldConfig } from 'nexus/dist/types'
import { GraphQLFieldResolver } from 'graphql'
import * as _ from 'lodash'
import { GraphQLEnumObject, GraphQLTypeField, TypesMap } from './source-helper'
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
  isCreateMutation,
  isDeleteMutation,
  isNotArrayOrConnectionType,
  typeToFieldOpts,
  isConnectionTypeName,
} from './utils'
import { PrismaSchemaBuilder } from '.'
import { isObject } from 'util'

interface Dictionary<T> {
  [key: string]: T
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
        args = args.data
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

function exportEnumType(enumObject: GraphQLEnumObject) {
  return enumType(enumObject.name, enumObject.values)
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

class PrismaObjectType<GenTypes, TypeName extends string> extends ObjectTypeDef<
  GenTypes,
  TypeName
> {
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
      t.prismaFields(['edges', 'pageInfo'])
    }),
    prismaObjectType(edgeTypeName),
  ]
}

function getRelayConnectionTypesToExport(typeConfig: Types.ObjectTypeConfig) {
  const connectionTypes = _(typeConfig.fields)
    .filter(
      field =>
        isFieldDef(field) &&
        isOutputFieldConfig(field.config) &&
        isConnectionTypeName(field.config.type),
    )
    .flatMap((field: any) => createRelayConnectionType(field.config.type))
    .value()

  return connectionTypes
}

function getAllInputEnumTypes(typesMap: TypesMap): WrappedType[] {
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
  const pageInfo = objectType('PageInfo', t => {
    t.boolean('hasNextPage')
    t.boolean('hasPreviousPage')
    t.string('startCursor')
    t.string('endCursor')
  })
  const longScalar = scalarType('Long', {
    serialize(value) {
      return value
    },
  })
  const dateTimeScalar = scalarType('DateTime', {
    serialize(value) {
      return value
    },
  })
  const batchPayload = objectType('BatchPayload', t => {
    t.field('count', 'Long' as any)
  })
  const node = objectType('Node', t => {
    t.id('id')
  })

  return [
    ...inputTypes,
    ...enumTypes,
    dateTimeScalar,
    longScalar,
    batchPayload,
    node,
    pageInfo,
  ]
}

/**
 * Add all the scalar/enums/input types from prisma to `types`
 * @param types The `makeSchema.types` option
 */
export function withPrismaTypes(types: any) {
  return new WrappedType((schemaBuilder: any) => {
    const schema = schemaBuilder as PrismaSchemaBuilder
    const typesMap = schema.getPrismaTypesMap()

    if (!types) {
      return [] as any
    }

    if (Array.isArray(types)) {
      return [...types, ...getAllInputEnumTypes(typesMap)]
    }

    if (isObject(types)) {
      return [...Object.values(types), ...getAllInputEnumTypes(typesMap)]
    }

    return [types, ...getAllInputEnumTypes(typesMap)]
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
): WrappedType {
  return new WrappedType((schemaBuilder: any) => {
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

    const output = [new WrappedType(objectType), ...connectionTypesToExport]

    return output as any
  })
}

export function prismaEnumType<GenTypes = GraphQLNexusGen>(
  typeName: PrismaEnumTypeNames<GenTypes>,
): WrappedType {
  return new WrappedType((schemaBuilder: any) => {
    const schema = schemaBuilder as PrismaSchemaBuilder
    const typesMap = schema.getPrismaTypesMap()

    const graphqlEnumType = typesMap.enums[typeName as string]

    if (graphqlEnumType === undefined) {
      throw new Error(`Unknown enum '${typeName}' in Prisma API`)
    }

    return enumType(typeName as string, graphqlEnumType.values) as any
  })
}

import { readFileSync } from 'fs';
import { arg, enumType, inputObjectType, objectType } from 'gqliteral';
import { ObjectTypeDef, WrappedType } from 'gqliteral/dist/core';
import { ArgDefinition } from 'gqliteral/dist/types';
import { GraphQLFieldResolver } from 'graphql';
import * as _ from 'lodash';
import { join } from 'path';
import { extractTypes, GraphQLEnumObject, GraphQLTypeArgument, GraphQLTypeField, GraphQLTypeObject } from './source-helper';
import { throwIfUnknownClientFunction, throwIfUnkownArgsName } from './throw';
import { AddFieldInput, AnonymousInputFields, InputField, ObjectField, PrismaTypeNames } from './types';
import { getFields, getLiteralArg, getObjectInputArg, typeToFieldOpts } from './utils';

interface Dictionary<T> {
  [key: string]: T
}

export interface TypesMap {
  types: Dictionary<GraphQLTypeObject>
  enums: Dictionary<GraphQLEnumObject>
}

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

function hidePrismaFields<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
>(
  t: ObjectTypeDef<GenTypes, TypeName>,
  typesMap: TypesMap,
  inputFields?: InputField<GenTypes, TypeName>[],
) {
  // const typeName = t.name
  // const graphqlType = getGraphQLType(typeName, typesMap)
  // const fields = getFields(inputFields, typeName, typesMap)
  // const fieldsNamesToHide = fields.map(f => f.name)
  // const fieldsToHide = graphqlType.fields
  //   .filter(f => !fieldsNamesToHide.includes(f.name))
  //   .map(field => field.name)
  //  addFieldsTo(t, typesMap, fieldsToHide as InputField<GenTypes, TypeName>[])
}

function addFieldsTo(
  t: ObjectTypeDef<any, any>,
  typesMap: TypesMap,
  aliasesMap: AliasMap,
  fields: ObjectField[],
): WrappedType[] {
  const typeName = t.name
  const graphqlType = typesMap.types[typeName]

  t.defaultResolver(
    generateDefaultResolver(typeName, aliasesMap[typeName], graphqlType),
  )

  const typesToExport = _.flatMap(fields, field =>
    addToGQLiteral(t, typesMap, typeName, aliasesMap, field),
  )

  return typesToExport
}

function generateDefaultResolver(
  typeName: string,
  aliasesToFieldName: Dictionary<string>,
  graphqlType: GraphQLTypeObject,
): GraphQLFieldResolver<any, any, Dictionary<any>> {
  return (root, args, ctx, info) => {
    if (typeName === 'Subscription') {
      throw new Error('Subscription not supported yet')
    }

    const fieldName = aliasesToFieldName[info.fieldName]

    if (fieldName === undefined) {
      throw new Error(`Unknown field name in ${typeName}.${info.fieldName}`)
    }

    const fieldToResolve = graphqlType.fields.find(f => f.name === fieldName)

    if (fieldToResolve === undefined) {
      throw new Error(`Unknown field name in ${typeName}.${info.fieldName}`)
    }

    if (fieldToResolve.type.isScalar) {
      return root[fieldName]
    }

    // Resolve top-level
    if (typeName === 'Query' || typeName === 'Mutation') {
      throwIfUnknownClientFunction(fieldName, typeName, ctx, info)

      // FIXME: FIND A BETTER/SAFER WAY TO HANDLE THAT
      if (
        !fieldToResolve.type.isArray &&
        !fieldToResolve.type.name.endsWith('Connection') &&
        fieldToResolve.type.name !== 'Connection' &&
        typeName === 'Query'
      ) {
        args = args.where
      }

      // FIXME: FIND A BETTER/SAFER WAY TO HANDLE THAT
      if (
        typeName === 'Mutation' &&
        (fieldName.startsWith('create') || fieldName.startsWith('delete'))
      ) {
        args = args.data
      }

      return ctx.prisma[fieldName](args)
    }

    const parentName = info.parentType.toString().toLowerCase()

    throwIfUnknownClientFunction(parentName, typeName, ctx, info)

    // FIXME: It can very well be something else than `id` (depending on the @unique field)
    return ctx.prisma[parentName]({ id: root.id })[fieldName](args)
  }
}

function addToGQLiteral<GenTypes = GraphQLiteralGen, TypeName extends string = any>(
  t: ObjectTypeDef<GenTypes, TypeName>,
  typesMap: TypesMap,
  typeName: string,
  aliasesMap: AliasMap,
  field: ObjectField,
): WrappedType[] {
  const fieldName = field.alias === undefined ? field.name : field.alias
  const isRelayConnectionField = typeName.endsWith('Connection')
  const graphqlField = findPrismaType(typesMap, typeName, field.name)

  if (isRelayConnectionField) {
    exportRelayConnectionTypes(typeName, typesMap, aliasesMap)
  }

  const { args, typesToExport } = exposeArgs({
    typeName,
    fieldName: graphqlField.name,
    args: graphqlField.arguments,
    argsNameToExpose: field.args as string[] | undefined,
    typesMap,
  })

  t.field(fieldName, graphqlField.type.name as any, {
    ...typeToFieldOpts(graphqlField.type),
    args: field.args === false ? undefined : args,
  })

  return typesToExport
}

function findPrismaType(
  typesMap: TypesMap,
  typeName: string,
  fieldName: string,
): GraphQLTypeField {
  const graphqlType = typesMap.types[typeName]

  if (graphqlType === undefined) {
    throw new Error('Type not found in Prisma API')
  }

  const graphqlField = graphqlType.fields.find(
    field => field.name === fieldName,
  )

  if (graphqlField === undefined) {
    throw new Error(`Field ${fieldName} not found in type ${typeName}`)
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
      if (field.type.isScalar) {
        return getObjectInputArg(arg, field, typeToFieldOpts(field.type))
      }

      if (!seen[field.type.name]) {
        typesToExport.push(
          ...exportInputObjectType(
            typesMap.types[field.type.name],
            typesMap,
            seen,
          ),
        )
      }

      arg.field(field.name, field.type.name as any, typeToFieldOpts(field.type))
    })
  })

  return [...typesToExport, inputObject]
}

function exportEnumType(enumObject: GraphQLEnumObject) {
  return enumType(enumObject.name, enumObject.values)
}

interface ExposeArgsOutput {
  args: Dictionary<ArgDefinition>
  typesToExport: WrappedType[]
}

interface ExposerArgsInput {
  typeName: string
  fieldName: string
  args: GraphQLTypeArgument[]
  argsNameToExpose: string[] | undefined
  typesMap: TypesMap
}

function exposeArgs(input: ExposerArgsInput): ExposeArgsOutput {
  const { typeName, fieldName, args, argsNameToExpose, typesMap } = input
  let fieldArguments = []

  if (argsNameToExpose !== undefined && argsNameToExpose.length > 0) {
    throwIfUnkownArgsName(typeName, fieldName, args, argsNameToExpose)

    fieldArguments = args.filter(arg => argsNameToExpose.includes(arg.name))
  } else {
    fieldArguments = args
  }

  const typesToExport: WrappedType[] = []

  const gqliteralArgs = fieldArguments.reduce<Dictionary<ArgDefinition>>(
    (acc, fieldArg) => {
      if (fieldArg.type.isScalar) {
        acc[fieldArg.name] = getLiteralArg(
          fieldArg.type.name,
          typeToFieldOpts(fieldArg.type),
        )
        return acc
      }

      if (fieldArg.type.isInput) {
        typesToExport.push(
          ...exportInputObjectType(
            typesMap.types[fieldArg.type.name],
            typesMap,
            {},
          ),
        )
      } else if (fieldArg.type.isEnum) {
        typesToExport.push(exportEnumType(typesMap.enums[fieldArg.type.name]))
      }

      acc[fieldArg.name] = arg(
        fieldArg.type.name as any,
        typeToFieldOpts(fieldArg.type),
      )

      return acc
    },
    {},
  )

  return {
    args: gqliteralArgs,
    typesToExport,
  }
}

const PageInfo = objectType('PageInfo', t => {
  t.boolean('hasSomething')
})

// function relayConnection(field: string) {
//   const Edge = objectType(`${field}Edge`, t => {
//     t.id('id')
//     t.field('node', field)
//   })
//   const Connection = objectType(`${field}Connection`, t => {
//     t.field('edges', `${field}Edge`)
//   })

//   return [PageInfo, Edge, Connection]
// }

function exportRelayConnectionTypes(
  connectionTypeName: string,
  typesMap: TypesMap,
  aliasesMap: AliasMap,
) {
  const connectionType = typesMap.types[connectionTypeName]
  const edgeTypeName = connectionType.fields.find(f => f.name === 'edges')!.type
    .name
  const aggregateTypeName = connectionType.fields.find(
    f => f.name === 'aggregate',
  )!.type.name

  module.exports['PageInfo'] = PageInfo

  module.exports[edgeTypeName] = objectType(edgeTypeName, t => {
    addFieldsTo(t, typesMap, aliasesMap, getFields(undefined, t.name, typesMap))
  })

  module.exports[aggregateTypeName] = objectType(aggregateTypeName, t => {
    addFieldsTo(t, typesMap, aliasesMap, getFields(undefined, t.name, typesMap))
  })
}

interface AliasMap {
  [typeName: string]: {
    [fieldName: string]: string
  }
}

// TODO: Fix this
let __typesMapCache: TypesMap | null = null
let __aliasesMapCache = {}
let __exportedTypesMap: Dictionary<string> = {}

function getTypesMap() {
  if (__typesMapCache === null) {
    const schemaPath = join(__dirname, '../src/generated/prisma.graphql')
    __typesMapCache = buildTypesMap(schemaPath)
  }

  return __typesMapCache
}

function getAliasesMap() {
  return __aliasesMapCache
}

function getExportedTypesMap(): Dictionary<string> {
  return __exportedTypesMap
}

// Prevent from exporting the same type twice
function addExportedTypesToGlobalCache(types: WrappedType[]): void {
  __exportedTypesMap = {
    ...__exportedTypesMap,
    ...types.reduce<Dictionary<string>>((acc, t) => {
      acc[t.type.name] = t.type.name

      return acc
    }, {}),
  }
}

class PrismaObjectType<
  GenTypes,
  TypeName extends string
> extends ObjectTypeDef<GenTypes, TypeName> {
  protected typesMap: TypesMap
  protected aliasesMap: AliasMap

  protected typesToExport: WrappedType[]

  constructor(typeName: string) {
    super(typeName)

    this.typesMap = getTypesMap()
    this.aliasesMap = getAliasesMap()
    this.typesToExport = []
  }

  // TODO: Decide if we use overloads or XOR
  // public prismaFields(
  //   inputFields?: InputField<GenTypes, TypeName>[],
  // ): GQLiteralNamedType[]
  // public prismaFields(
  //   aliasesField: AliasesField<GenTypes, TypeName>,
  // ): GQLiteralNamedType[]
  // public prismaFields(
  //   pickOmitField: PickOmitField<GenTypes, TypeName>,
  // ): GQLiteralNamedType[]
  public prismaFields(
    inputFields?: AddFieldInput<GenTypes, TypeName>,
  ): WrappedType[] {
    const typeName = this.name

    const fields = getFields(
      inputFields as AnonymousInputFields,
      typeName,
      this.typesMap,
    )

    this.addFieldsToAliasMap(typeName, fields)

    const exportedTypesMap = getExportedTypesMap()

    const typesToExport = addFieldsTo(
      this,
      this.typesMap,
      this.aliasesMap,
      fields,
    )

    const uniqTypesToExport = _(typesToExport)
      .uniqBy(t => t.type.name)
      .filter(t => exportedTypesMap[t.type.name] === undefined)
      .value()

    // /!\ Dirty function: set to global cache
    addExportedTypesToGlobalCache(uniqTypesToExport)

    this.addToTypesToExport(uniqTypesToExport)

    return uniqTypesToExport
  }

  protected addToTypesToExport(typesToExport: WrappedType[]) {
    this.typesToExport.push(...typesToExport)
  }

  public getTypesToExport() {
    return this.typesToExport
  }

  protected addFieldsToAliasMap(typeName: string, fields: ObjectField[]) {
    const aliasesToFieldName = fields.reduce<Dictionary<string>>(
      (acc, field) => {
        const aliasName = field.alias !== undefined ? field.alias : field.name

        acc[aliasName] = field.name

        return acc
      },
      {},
    )

    this.aliasesMap[typeName] = {
      ...this.aliasesMap[typeName],
      ...aliasesToFieldName,
    }
  }
}

export function prismaObjectType<
  GenTypes = GraphQLiteralGen,
  TypeName extends PrismaTypeNames<GenTypes> = any
>(
  typeName: TypeName,
  fn?: (t: PrismaObjectType<GenTypes, TypeName>) => void,
): WrappedType[] {
  const objectType = new PrismaObjectType<GenTypes, TypeName>(typeName)

  if (fn === undefined) {
    return [new WrappedType(objectType), ...objectType.prismaFields()]
  }

  // mutate objectType
  fn(objectType)

  return [new WrappedType(objectType), ...objectType.getTypesToExport()]
}

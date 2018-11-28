import { readFileSync } from 'fs'
import { arg, core, enumType, inputObjectType, objectType } from 'gqliteral'
import { GQLiteralObjectType } from 'gqliteral/dist/core'
import { ArgDefinition } from 'gqliteral/dist/types'
import { GraphQLFieldResolver } from 'graphql'
import { join } from 'path'
import { Context } from '../context'
import {
  extractTypes,
  GraphQLEnumObject,
  GraphQLTypeArgument,
  GraphQLTypeField,
  GraphQLTypeObject,
} from './source-helper'
import { throwIfUnknownClientFunction, throwIfUnkownArgsName } from './throw'
import {
  AddFieldInput,
  AnonymousInputFields,
  InputField,
  ObjectField,
} from './types'
import {
  getFields,
  getLiteralArg,
  getObjectInputArg,
  typeToFieldOpts,
} from './utils'

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
  GenTypes = GQLiteralGen,
  TypeName extends string = any
>(
  t: GQLiteralObjectType<GenTypes, TypeName>,
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
  t: GQLiteralObjectType<any, any>,
  typesMap: TypesMap,
  aliasesMap: AliasMap,
  fields: ObjectField[],
): void {
  const typeName = t.name
  const graphqlType = typesMap.types[typeName]

  t.defaultResolver(
    generateDefaultResolver(typeName, aliasesMap[typeName], graphqlType),
  )

  fields.forEach(field =>
    addToGQLiteral(t, typesMap, typeName, aliasesMap, field),
  )
}

function generateDefaultResolver(
  typeName: string,
  aliasesToFieldName: Dictionary<string>,
  graphqlType: GraphQLTypeObject,
): GraphQLFieldResolver<any, Context, Dictionary<any>> {
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

      // @ts-ignore
      return ctx.prisma[fieldName](args)
    }

    const parentName = info.parentType.toString().toLowerCase()

    throwIfUnknownClientFunction(parentName, typeName, ctx, info)

    // @ts-ignore
    return ctx.prisma[parentName]({ id: root.id })[fieldName](args)
  }
}

function addToGQLiteral<GenTypes = GQLiteralGen, TypeName extends string = any>(
  t: GQLiteralObjectType<GenTypes, TypeName>,
  typesMap: TypesMap,
  typeName: string,
  aliasesMap: AliasMap,
  field: ObjectField,
): void {
  const fieldName = field.alias === undefined ? field.name : field.alias
  const isRelayConnectionField = typeName.endsWith('Connection')
  const graphqlField = prismaLookupType(typesMap, typeName, field.name)

  if (isRelayConnectionField) {
    exportRelayConnectionTypes(typeName, typesMap, aliasesMap)
  }

  // FIXME: as any
  t.field(fieldName, graphqlField.type.name as any, {
    ...typeToFieldOpts(graphqlField.type),
    args:
      field.args === false
        ? {}
        : exposeArgs(
            typeName,
            graphqlField.name,
            graphqlField.arguments,
            field.args as string[] | undefined,
            typesMap,
          ),
  })
}

// Prisma layer on top of GQLiteral:
function prismaLookupType(
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
) {
  //console.log('Expose input type', inputType.name)
  seen[inputType.name] = true

  module.exports[inputType.name] = inputObjectType(inputType.name, arg => {
    inputType.fields.forEach(field => {
      if (field.type.isScalar) {
        return getObjectInputArg(arg, field, typeToFieldOpts(field.type))
      }

      if (!seen[field.type.name]) {
        exportInputObjectType(typesMap.types[field.type.name], typesMap, seen)
      }
      // FIXME: as any
      arg.field(field.name, field.type.name as any, typeToFieldOpts(field.type))
    })
  })
}

function exportEnumType(enumObject: GraphQLEnumObject) {
  module.exports[enumObject.name] = enumType(enumObject.name, enumObject.values)
}

function exposeArgs(
  typeName: string,
  fieldName: string,
  args: GraphQLTypeArgument[],
  argsNameToExpose: string[] | undefined,
  typesMap: TypesMap,
): Dictionary<ArgDefinition> {
  let fieldArguments = []

  if (argsNameToExpose !== undefined && argsNameToExpose.length > 0) {
    throwIfUnkownArgsName(typeName, fieldName, args, argsNameToExpose)

    fieldArguments = args.filter(arg => argsNameToExpose.includes(arg.name))
  } else {
    fieldArguments = args
  }

  return fieldArguments.reduce<Dictionary<ArgDefinition>>((acc, fieldArg) => {
    if (fieldArg.type.isScalar) {
      acc[fieldArg.name] = getLiteralArg(
        fieldArg.type.name,
        typeToFieldOpts(fieldArg.type),
      )
      return acc
    }

    if (fieldArg.type.isInput) {
      exportInputObjectType(typesMap.types[fieldArg.type.name], typesMap, {})
    } else if (fieldArg.type.isEnum) {
      exportEnumType(typesMap.enums[fieldArg.type.name])
    }

    acc[fieldArg.name] = arg(
      fieldArg.type.name as any,
      typeToFieldOpts(fieldArg.type),
    )

    return acc
  }, {})
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
let typesMapCache: TypesMap | null = null
let aliasesMapCache = {}

function getTypesMap() {
  if (typesMapCache === null) {
    const schemaPath = join(__dirname, '../generated/prisma.graphql')
    typesMapCache = buildTypesMap(schemaPath)
  }

  return typesMapCache
}

function getAliasesMap() {
  return aliasesMapCache
}

class ObjectTypeWithPrisma<
  GenTypes = GQLiteralGen,
  TypeName extends string = any
> extends core.GQLiteralObjectType<GenTypes, TypeName> {
  protected typesMap: TypesMap
  protected aliasesMap: AliasMap

  constructor(typeName: string) {
    super(typeName)
    this.typesMap = getTypesMap()
    this.aliasesMap = getAliasesMap()
  }

  prismaFields(inputFields?: AddFieldInput<GenTypes, TypeName>) {
    const typeName = this.name

    const fields = getFields(
      inputFields as AnonymousInputFields,
      typeName,
      this.typesMap,
    )

    this.addFieldsToAliasMap(typeName, fields)

    addFieldsTo(this, this.typesMap, this.aliasesMap, fields)
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
  GenTypes = GQLiteralGen,
  TypeName extends string = any
>(
  typeName: TypeName,
  fn?: (t: ObjectTypeWithPrisma<GenTypes, TypeName>) => void,
) {
  const objectType = new ObjectTypeWithPrisma<GenTypes, TypeName>(typeName)

  if (fn === undefined) {
    objectType.prismaFields()
  } else {
    fn(objectType)
  }

  return objectType
}

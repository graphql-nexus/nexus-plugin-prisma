import { readFileSync } from 'fs'
import { arg, enumType, inputObjectType } from 'gqliteral'
import { ObjectTypeDef, Types, WrappedType } from 'gqliteral/dist/core'
import { ArgDefinition, FieldDef } from 'gqliteral/dist/types'
import { GraphQLFieldResolver } from 'graphql'
import * as _ from 'lodash'
import { join } from 'path'
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
  AnonymousFieldDetails,
  InputField,
  ObjectField,
  PrismaObject,
  PrismaTypeNames,
  AnonymousFieldDetail,
  PickInputField,
  FilterInputField,
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

function addFieldsTo(
  t: ObjectTypeDef<any, any>,
  fields: ObjectField[],
  typesMap: TypesMap,
  aliasesMap: AliasMap,
): void {
  const typeName = t.name
  const graphqlType = typesMap.types[typeName]

  t.defaultResolver(
    generateDefaultResolver(typeName, aliasesMap[typeName], graphqlType),
  )

  fields.forEach(field => addToGQLiteral(t, typesMap, typeName, field))
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

function addToGQLiteral<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
>(
  t: ObjectTypeDef<GenTypes, TypeName>,
  typesMap: TypesMap,
  typeName: string,
  field: ObjectField,
): void {
  const fieldName = field.alias === undefined ? field.name : field.alias
  const graphqlField = findPrismaType(typesMap, typeName, field.name)

  const { args } = exposeArgs({
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
  const { typeName, fieldName, args, argsNameToExpose } = input
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

interface AliasMap {
  [typeName: string]: {
    [fieldName: string]: string
  }
}

// TODO: Fix this
let __typesMapCache: TypesMap | null = null
let __aliasesMapCache = {}
let __exportedTypesMap: Dictionary<boolean> = {}

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

function getExportedTypesMap(): Dictionary<boolean> {
  return __exportedTypesMap
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

function isAnonymousFieldDetails(
  options: any,
): options is AnonymousFieldDetail {
  return (options as AnonymousFieldDetail).$prismaFieldName !== undefined
}

class PrismaObjectType<GenTypes, TypeName extends string> extends ObjectTypeDef<
  GenTypes,
  TypeName
> {
  protected typesMap: TypesMap
  protected aliasesMap: AliasMap
  public prismaType: PrismaObject<GenTypes, TypeName>

  constructor(typeName: string) {
    super(typeName)

    this.typesMap = getTypesMap()
    this.aliasesMap = getAliasesMap()
    this.prismaType = this.genPrismaType() as any
  }

  field<FieldName extends string>(
    name: FieldName,
    type: Types.AllOutputTypes<GenTypes> | Types.BaseScalars,
    options?: Types.OutputFieldOpts<GenTypes, TypeName, FieldName>,
  ): void {
    if (!isAnonymousFieldDetails(options)) {
      return super.field(name, type, options)
    }
    const typeName = this.name
    const graphqlType = this.typesMap.types[typeName]

    const prismaOptions = {
      ...options,
      resolve: generateDefaultResolver(
        typeName,
        { [name]: options.$prismaFieldName },
        graphqlType,
      ),
    }

    return super.field(name, type, prismaOptions)
  }

  public getTypeConfig(): Types.ObjectTypeConfig {
    return this.typeConfig
  }

  public genPrismaType(): AnonymousFieldDetails {
    const typeName = this.name

    const graphqlType = this.typesMap.types[typeName]

    return graphqlType.fields.reduce<AnonymousFieldDetails>((acc, field) => {
      acc[field.name] = {
        $prismaFieldName: field.name,
        list: field.type.isArray,
        resolve: () => {},
        description: field.description,
        args: field.arguments.reduce<Record<string, ArgDefinition>>(
          (acc, fieldArg) => {
            acc[fieldArg.name] = arg(fieldArg.type.name as any, {
              ...typeToFieldOpts(fieldArg.type),
            })
            return acc
          },
          {},
        ),
      }

      return acc
    }, {})
  }

  public prismaFields(inputFields?: InputField<GenTypes, TypeName>[]): void
  public prismaFields(pickFields: PickInputField<GenTypes, TypeName>): void
  public prismaFields(filterFields: FilterInputField<GenTypes, TypeName>): void
  public prismaFields(inputFields?: AddFieldInput<GenTypes, TypeName>): void {
    const typeName = this.name

    const fields = getFields(inputFields, typeName, this.typesMap)

    this.addFieldsToAliasMap(typeName, fields)

    addFieldsTo(this, fields, this.typesMap, this.aliasesMap)
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

function isFieldDef(field: any): field is FieldDef {
  return (
    field.item &&
    field.item === 'FIELD' &&
    field.config &&
    field.config.args !== undefined
  )
}

// TODO: Optimize this heavy function
function getTypesToExport(typeConfig: Types.ObjectTypeConfig): WrappedType[] {
  return _(typeConfig.fields)
    .filter(field => isFieldDef(field))
    .flatMap(field => {
      return Object.values(((<FieldDef>field).config as any).args).map(
        (arg: any) => arg.type,
      ) as string[]
    })
    .filter(typeName => {
      return (
        getTypesMap().types[typeName] !== undefined &&
        !getExportedTypesMap()[typeName]
      )
    })
    .uniq()
    .flatMap(typeName => {
      const isInput = getTypesMap().types[typeName].type.isInput
      const type = isInput
        ? getTypesMap().types[typeName]
        : getTypesMap().enums[typeName]
      return isInput
        ? exportInputObjectType(type as GraphQLTypeObject, getTypesMap(), {})
        : exportEnumType(type as GraphQLEnumObject)
    })
    .filter(t => getExportedTypesMap()[t.type.name] === undefined)
    .uniqBy(t => t.type.name) // TODO: Optimize by sharing the `seen` typeMap in `exportInputObjectType`
    .value()
}

export function prismaObjectType<
  GenTypes = GraphQLiteralGen,
  TypeName extends PrismaTypeNames<GenTypes> = PrismaTypeNames<GenTypes>
>(
  typeName:
    | TypeName
    | {
        prismaTypeName: TypeName
        objectTypeName?: string
      },
  fn?: (t: PrismaObjectType<GenTypes, TypeName>) => void,
): WrappedType[] {
  // TODO refactor + make use of `objectTypeName`
  const realTypeName =
    typeof typeName === 'string' ? typeName : typeName.prismaTypeName
  const objectType = new PrismaObjectType<GenTypes, TypeName>(realTypeName)

  // mutate objectType
  if (fn === undefined) {
    objectType.prismaFields()
  } else {
    fn(objectType)
  }

  const typeConfig = objectType.getTypeConfig()
  const typesToExport = getTypesToExport(typeConfig)

  addExportedTypesToGlobalCache(typesToExport)

  return [new WrappedType(objectType), ...typesToExport]
}

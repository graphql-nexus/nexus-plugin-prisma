import { readFileSync, existsSync } from 'fs'
import * as path from 'path'
import { arg, enumType, inputObjectType } from 'gqliteral'
import { ObjectTypeDef, Types, WrappedType } from 'gqliteral/dist/core'
import { ArgDefinition, FieldDef } from 'gqliteral/dist/types'
import { GraphQLFieldResolver } from 'graphql'
import * as _ from 'lodash'
import {
  extractTypes,
  GraphQLEnumObject,
  GraphQLTypeField,
  GraphQLTypeObject,
} from './source-helper'
import { throwIfUnknownClientFunction } from './throw'
import {
  AddFieldInput,
  AnonymousFieldDetails,
  InputField,
  PrismaObject,
  PrismaTypeNames,
  AnonymousFieldDetail,
  PickInputField,
  FilterInputField,
} from './types'
import { getFields, getObjectInputArg, typeToFieldOpts } from './utils'

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

function generateDefaultResolver(
  typeName: string,
  aliasesToFieldName: Dictionary<string>,
  graphqlType: GraphQLTypeObject,
  contextClientName: string,
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
      throwIfUnknownClientFunction(fieldName, typeName, ctx, contextClientName, info)

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

      return ctx[contextClientName][fieldName](args)
    }

    const parentName = info.parentType.toString().toLowerCase()

    throwIfUnknownClientFunction(parentName, typeName, ctx, contextClientName, info)

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

interface PrismaConfig {
  schemaPath: string
  contextClientName: string
}

class PrismaObjectType<GenTypes, TypeName extends string> extends ObjectTypeDef<
  GenTypes,
  TypeName
> {
  protected typesMap: TypesMap
  protected config: PrismaConfig
  public prismaType: PrismaObject<GenTypes, TypeName>

  constructor(typeName: string) {
    super(typeName)

    // TODO: Fix this once we have access to the config
    const schemaPath = path.join(process.cwd(), './src/generated/prisma.graphql')

    if (!existsSync(schemaPath)) {
      throw new Error('prisma.graphql should be located in ./src/generated/prisma.graphql')
    }

    this.config = {
      schemaPath,
      contextClientName: 'prisma',
    }
    this.typesMap = getTypesMap(this.config.schemaPath)
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
      const opts: AnonymousFieldDetail = this.prismaType[fieldType.name]
      const args = filterArgsToExpose(opts.args, field.args)

      this.field(fieldName, fieldType.type.name as any, {
        ...opts,
        args,
      })
    })
  }

  public field<FieldName extends string>(
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
        this.config.contextClientName,
      ),
    }

    super.field(name, type, prismaOptions)
  }

  public getTypeConfig(): Types.ObjectTypeConfig {
    return this.typeConfig
  }

  public getTypesMap() {
    return this.typesMap
  }

  protected generatePrismaTypes(): AnonymousFieldDetails {
    const typeName = this.name

    const graphqlType = this.typesMap.types[typeName]

    return graphqlType.fields.reduce<AnonymousFieldDetails>((acc, field) => {
      acc[field.name] = {
        $prismaFieldName: field.name,
        list: field.type.isArray,
        resolve: generateDefaultResolver(
          typeName,
          { [field.name]: field.name },
          graphqlType,
          this.config.contextClientName,
        ),
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
function getTypesToExport(
  typeConfig: Types.ObjectTypeConfig,
  typesMap: TypesMap,
): WrappedType[] {
  const exportedTypesMap = getExportedTypesMap()

  return _(typeConfig.fields)
    .filter(field => isFieldDef(field))
    .flatMap(field => {
      return Object.values(((<FieldDef>field).config as any).args).map(
        (arg: any) => arg.type,
      ) as string[]
    })
    .filter(typeName => {
      return (
        typesMap.types[typeName] !== undefined && !exportedTypesMap[typeName]
      )
    })
    .uniq()
    .flatMap(typeName => {
      const isInput = typesMap.types[typeName].type.isInput
      const type = isInput ? typesMap.types[typeName] : typesMap.enums[typeName]
      return isInput
        ? exportInputObjectType(type as GraphQLTypeObject, typesMap, {})
        : exportEnumType(type as GraphQLEnumObject)
    })
    .filter(t => exportedTypesMap[t.type.name] === undefined)
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

  const typesMap = objectType.getTypesMap()
  const typeConfig = objectType.getTypeConfig()
  const typesToExport = getTypesToExport(typeConfig, typesMap)

  addExportedTypesToGlobalCache(typesToExport)

  return [new WrappedType(objectType), ...typesToExport]
}

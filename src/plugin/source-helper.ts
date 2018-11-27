import {
  buildASTSchema,
  GraphQLArgument,
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  parse,
} from 'graphql'

/** Our own GraphQL schema/types abstraction. */
export type GraphQLTypes = {
  types: GraphQLTypeObject[]
  enums: GraphQLEnumObject[]
  // unions: GraphQLUnionObject[];
}

/** Converts typeDefs, e.g. the raw SDL string, into our `GraphQLTypes`. */
export function extractTypes(typeDefs: string): GraphQLTypes {
  const schema = buildASTSchema(parse(typeDefs))

  return {
    types: extractGraphQLTypes(schema),
    enums: extractGraphQLEnums(schema),
  }
}

type GraphQLTypeDefinition = {
  name: string
  isScalar: boolean
  isEnum: boolean
  isUnion: boolean
  isInput: boolean
  isObject: boolean
  isInterface: boolean
}

export type GraphQLType = GraphQLTypeDefinition & {
  isArray: boolean
  isRequired: boolean
}

export type GraphQLTypeArgument = {
  name: string
  type: GraphQLType
}

export type GraphQLTypeField = {
  name: string
  type: GraphQLType
  arguments: GraphQLTypeArgument[]
}

export type GraphQLTypeObject = {
  name: string
  type: GraphQLTypeDefinition
  fields: GraphQLTypeField[]
}

export type GraphQLEnumObject = {
  name: string
  type: GraphQLTypeDefinition
  values: string[]
}

export type GraphQLUnionObject = {
  name: string
  type: GraphQLTypeDefinition
  types: GraphQLTypeDefinition[]
}

interface FinalType {
  isRequired: boolean
  isArray: boolean
  type: GraphQLInputType | GraphQLOutputType
}

export const GraphQLScalarTypeArray = [
  'Boolean',
  'Int',
  'Float',
  'String',
  'ID',
]
export type GraphQLScalarType = 'Boolean' | 'Float' | 'Int' | 'String' | 'ID'

function extractTypeDefinition(
  schema: GraphQLSchema,
  fromNode: GraphQLType,
): GraphQLTypeDefinition {
  let typeLike: GraphQLTypeDefinition = {
    isObject: false,
    isInput: false,
    isEnum: false,
    isUnion: false,
    isScalar: false,
    isInterface: false,
  } as GraphQLTypeDefinition
  const node = schema.getType(fromNode.name)
  if (node instanceof GraphQLObjectType) {
    typeLike.isObject = true
  }
  if (node instanceof GraphQLInputObjectType) {
    typeLike.isInput = true
  }
  if (node instanceof GraphQLEnumType) {
    typeLike.isEnum = true
  }
  if (node instanceof GraphQLUnionType) {
    typeLike.isUnion = true
  }
  if (node instanceof GraphQLScalarType) {
    typeLike.isScalar = true
  }
  if (node instanceof GraphQLInterfaceType) {
    typeLike.isInterface = true
  }
  // Handle built-in scalars
  if (GraphQLScalarTypeArray.indexOf(fromNode.name) > -1) {
    typeLike.isScalar = true
  }
  return typeLike
}

const getFinalType = (
  type: GraphQLInputType | GraphQLOutputType,
  acc: FinalType = { isArray: false, isRequired: false, type },
): FinalType => {
  if (type instanceof GraphQLNonNull) {
    acc.isRequired = true
  }
  if (type instanceof GraphQLList) {
    acc.isArray = true
  }

  if (type instanceof GraphQLNonNull || type instanceof GraphQLList) {
    return getFinalType(
      (type as GraphQLNonNull<any> | GraphQLList<any>).ofType,
      acc,
    )
  }

  return {
    ...acc,
    type,
  }
}

function extractTypeLike(
  schema: GraphQLSchema,
  type: GraphQLInputType | GraphQLOutputType,
): GraphQLType {
  const typeLike: GraphQLType = {} as GraphQLType
  const { isArray, isRequired, type: finalType } = getFinalType(type)
  if (isRequired) {
    typeLike.isRequired = true
  }
  if (isArray) {
    typeLike.isArray = true
  }
  if (
    finalType instanceof GraphQLObjectType ||
    finalType instanceof GraphQLInterfaceType ||
    finalType instanceof GraphQLEnumType ||
    finalType instanceof GraphQLUnionType ||
    finalType instanceof GraphQLInputObjectType ||
    finalType instanceof GraphQLScalarType
  ) {
    typeLike.name = finalType.name
  }
  const typeDefinitionLike = extractTypeDefinition(schema, typeLike)
  return {
    ...typeLike,
    ...typeDefinitionLike,
  }
}

function extractTypeFieldsFromObjectType(
  schema: GraphQLSchema,
  node: GraphQLObjectType,
) {
  const fields: GraphQLTypeField[] = []
  Object.values(node.getFields()).forEach(
    (fieldNode: GraphQLField<any, any>) => {
      const fieldType: GraphQLType = extractTypeLike(schema, fieldNode.type)
      const fieldArguments: GraphQLTypeArgument[] = []
      fieldNode.args.forEach((arg: GraphQLArgument) => {
        fieldArguments.push({
          name: arg.name,
          type: extractTypeLike(schema, arg.type),
        })
      })
      fields.push({
        name: fieldNode.name,
        type: fieldType,
        arguments: fieldArguments,
      })
    },
  )
  return fields
}

function extractTypeFieldsFromInputType(
  schema: GraphQLSchema,
  node: GraphQLInputObjectType,
) {
  const fields: GraphQLTypeField[] = []
  Object.values(node.getFields()).forEach((input: GraphQLInputField) => {
    fields.push({
      name: input.name,
      type: extractTypeLike(schema, input.type),
      arguments: [],
    })
  })
  return fields
}

function extractGraphQLTypes(schema: GraphQLSchema) {
  const types: GraphQLTypeObject[] = []
  Object.values(schema.getTypeMap()).forEach((node: GraphQLNamedType) => {
    // Ignore meta types like __Schema and __TypeKind
    if (node.name.startsWith('__')) {
      return
    }
    if (node instanceof GraphQLEnumType) {
      types.push({
        name: node.name,
        type: {
          name: node.name,
          isObject: false,
          isInput: false,
          isEnum: true,
          isUnion: false,
          isScalar: false,
          isInterface: false,
        },
        fields: [], // extractTypeFields(schema, node),
      })
    } else if (node instanceof GraphQLObjectType) {
      types.push({
        name: node.name,
        type: {
          name: node.name,
          isObject: true,
          isInput: false,
          isEnum: false,
          isUnion: false,
          isScalar: false,
          isInterface: false,
        },
        fields: extractTypeFieldsFromObjectType(schema, node),
      })
    } else if (node instanceof GraphQLInputObjectType) {
      types.push({
        name: node.name,
        type: {
          name: node.name,
          isObject: false,
          isInput: true,
          isEnum: false,
          isUnion: false,
          isScalar: false,
          isInterface: false,
        },
        fields: extractTypeFieldsFromInputType(schema, node),
      })
    }
  })
  return types
}

function extractGraphQLEnums(schema: GraphQLSchema) {
  const types: GraphQLEnumObject[] = []
  Object.values(schema.getTypeMap())
    .filter(
      (node: GraphQLNamedType) =>
        node.name !== '__TypeKind' && node.name !== '__DirectiveLocation',
    )
    .forEach((node: GraphQLNamedType) => {
      if (node instanceof GraphQLEnumType) {
        types.push({
          name: node.name,
          type: {
            name: node.name,
            isObject: false,
            isInput: false,
            isEnum: true,
            isUnion: false,
            isScalar: false,
            isInterface: false,
          },
          values: node.getValues().map(v => v.name),
        })
      }
    })
  return types
}

function extractGraphQLUnions(schema: GraphQLSchema) {
  const types: GraphQLUnionObject[] = []
  Object.values(schema.getTypeMap()).forEach((node: GraphQLNamedType) => {
    if (node instanceof GraphQLUnionType) {
      const unionTypes = node.getTypes().map((t: GraphQLObjectType) => {
        return extractTypeLike(schema, t)
      })
      types.push({
        name: node.name,
        type: {
          name: node.name,
          isObject: false,
          isInput: false,
          isEnum: false,
          isUnion: true,
          isScalar: false,
          isInterface: false,
        },
        types: unionTypes,
      })
    }
  })
  return types
}

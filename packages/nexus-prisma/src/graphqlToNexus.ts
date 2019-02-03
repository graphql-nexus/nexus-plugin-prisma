import { core } from 'nexus'
import {
  GraphQLArgument,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLNamedType,
  GraphQLObjectType,
  isObjectType,
} from 'graphql/type'
import { PrismaSchemaBuilder } from './builder'
import { getTypeName, isList, isListOrRequired, isRequired } from './graphql'
import { generateDefaultResolver } from './resolver'
import { PrismaOutputOptsMap } from './types'

function graphqlArgsToNexusArgs(args: GraphQLArgument[]) {
  return args.reduce<Record<string, any>>((acc, arg) => {
    acc[arg.name] = core.arg({
      ...isListOrRequired(arg.type),
      type: getTypeName(arg.type),
      description: arg.description,
    })
    return acc
  }, {})
}

function graphqlFieldToNexusField(
  typeName: string,
  field: GraphQLField<any, any>,
  contextClientName: string,
): core.FieldOutConfig<string, string> {
  return {
    type: getTypeName(field.type),
    description: field.description,
    list: isList(field.type) ? true : undefined,
    nullable: !isRequired(field.type),
    resolve: generateDefaultResolver(typeName, field, contextClientName),
    args: graphqlArgsToNexusArgs(field.args),
  }
}

export function graphqlFieldsToNexusFields(
  type: GraphQLObjectType | GraphQLInputObjectType,
  contextClientName: string,
): PrismaOutputOptsMap {
  return Object.values(type.getFields()).reduce((acc, field) => {
    const nexusField = graphqlFieldToNexusField(
      getTypeName(type),
      field,
      contextClientName,
    )
    acc[field.name] = nexusField

    return acc
  }, {})
}

function objectTypeToNexus(
  builder: PrismaSchemaBuilder,
  type: GraphQLObjectType<any, any>,
  contextClientName: string,
) {
  const nexusFieldsConfig = graphqlFieldsToNexusFields(type, contextClientName)

  return builder.buildObjectType({
    name: type.name,
    definition(t) {
      Object.entries(nexusFieldsConfig).forEach(([name, config]) => {
        t.field(name, config)
      })
      type.getInterfaces().forEach(interfaceType => {
        t.implements(interfaceType.name)
      })
    },
  })
}

export function graphqlTypeToNexusType(
  builder: PrismaSchemaBuilder,
  type: GraphQLNamedType,
  contextClientName: string,
): GraphQLNamedType {
  if (isObjectType(type)) {
    return objectTypeToNexus(builder, type, contextClientName)
  }

  return type
}

import { GraphQLField, GraphQLObjectType } from 'graphql/type'
import { core } from 'nexus'
import { PrismaSchemaBuilder } from '../builder'
import { getTypeName } from '../graphql'
import { generateDefaultResolver } from '../resolver'
import { graphqlArgsToNexusArgs, graphqlTypeToCommonNexus } from './common'

export function objectTypeToNexus(
  builder: PrismaSchemaBuilder,
  type: GraphQLObjectType<any, any>,
  contextClientName: string,
) {
  const nexusFieldsConfig = objectTypeFieldsToNexus(type, contextClientName)

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

function objectTypeFieldToNexus(
  typeName: string,
  field: GraphQLField<any, any>,
  contextClientName: string,
): core.NexusOutputFieldConfig<any, any> {
  return {
    ...graphqlTypeToCommonNexus(field),
    type: getTypeName(field.type),
    resolve: generateDefaultResolver(typeName, field, contextClientName),
    args: graphqlArgsToNexusArgs(field.args),
  }
}

export function objectTypeFieldsToNexus(
  type: GraphQLObjectType,
  contextClientName: string,
) {
  return Object.values(type.getFields()).reduce<
    Record<string, core.FieldOutConfig<string, string>>
  >((acc, field) => {
    acc[field.name] = objectTypeFieldToNexus(
      getTypeName(type),
      field,
      contextClientName,
    )

    return acc
  }, {})
}

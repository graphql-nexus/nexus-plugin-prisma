import { GraphQLInputField, GraphQLInputObjectType } from 'graphql/type'
import { core } from 'nexus'
import { PrismaSchemaBuilder } from '../builder'
import { getTypeName } from '../graphql'
import { graphqlTypeToCommonNexus } from './common'

export function inputObjectTypeToNexus(
  builder: PrismaSchemaBuilder,
  type: GraphQLInputObjectType,
) {
  const nexusFieldsConfig = inputObjectTypeFieldsToNexus(type)

  return builder.buildInputObjectType({
    name: type.name,
    definition(t) {
      Object.entries(nexusFieldsConfig).forEach(([fieldName, config]) => {
        t.field(fieldName, config)
      })
    },
  })
}

function inputObjectTypeFieldToNexus(
  field: GraphQLInputField,
): core.NexusInputFieldConfig {
  return {
    ...graphqlTypeToCommonNexus(field),
    type: getTypeName(field.type),
  }
}

export function inputObjectTypeFieldsToNexus(
  type: GraphQLInputObjectType,
): Record<string, core.NexusInputFieldConfig> {
  return Object.values(type.getFields()).reduce<
    Record<string, core.NexusInputFieldConfig>
  >((acc, field) => {
    acc[field.name] = inputObjectTypeFieldToNexus(field)

    return acc
  }, {})
}

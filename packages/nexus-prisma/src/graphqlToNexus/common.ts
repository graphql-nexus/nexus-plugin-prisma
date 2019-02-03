import { GraphQLArgument, GraphQLField, GraphQLInputField } from 'graphql/type'
import { core } from 'nexus'
import { getTypeName, isList, isListOrRequired, isRequired } from '../graphql'

export function graphqlArgsToNexusArgs(args: GraphQLArgument[]) {
  return args.reduce<Record<string, any>>((acc, arg) => {
    acc[arg.name] = core.arg({
      ...isListOrRequired(arg.type),
      type: getTypeName(arg.type),
      description: arg.description,
    })
    return acc
  }, {})
}

export function graphqlTypeToCommonNexus(
  field: GraphQLField<any, any> | GraphQLInputField,
): core.CommonFieldConfig {
  return {
    description: field.description,
    list: isList(field.type) ? true : undefined,
    nullable: !isRequired(field.type),
  }
}

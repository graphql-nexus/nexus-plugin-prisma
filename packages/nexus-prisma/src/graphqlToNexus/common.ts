import { GraphQLArgument, GraphQLField, GraphQLInputField } from 'graphql/type'
import { core } from 'nexus'
import { getTypeName, isList, isRequired } from '../graphql'

export function graphqlArgsToNexusArgs(args: GraphQLArgument[]) {
  return args.reduce<Record<string, core.NexusArgDef<any>>>((acc, arg) => {
    acc[arg.name] = core.arg({
      type: getTypeName(arg.type),
      description: arg.description,
      list: isList(arg.type) ? true : undefined,
      nullable: !isRequired(arg.type),
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

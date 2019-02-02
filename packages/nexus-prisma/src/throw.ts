import { GraphQLResolveInfo, GraphQLObjectType } from 'graphql'
import { ObjectField } from './types'

export function throwIfUnknownFields(
  graphqlType: GraphQLObjectType,
  fields: ObjectField[],
  typeName: string,
): void {
  const fieldsName = Object.values(graphqlType.getFields()).map(f => f.name)

  const unknownFields = fields
    .filter(f => !fieldsName.includes(f.name))
    .map(f => f.name)

  if (unknownFields.length > 0) {
    throw new Error(
      `Field ${unknownFields.join(', ')} not found in type ${typeName}`,
    )
  }
}

export function throwIfUnknownClientFunction(
  fieldName: string,
  typeName: string,
  ctx: any,
  contextClientName: string,
  info: GraphQLResolveInfo,
) {
  // @ts-ignore
  if (ctx[contextClientName][fieldName] === undefined) {
    throw new Error(
      `Unknown prisma-client function for field ${typeName}.${info.fieldName}`,
    )
  }
}

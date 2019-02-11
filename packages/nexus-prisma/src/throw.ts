import { GraphQLResolveInfo, GraphQLObjectType } from 'graphql'
import { ObjectField, PrismaClient } from './types'

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
  prismaClient: PrismaClient,
  fieldName: string,
  typeName: string,
  info: GraphQLResolveInfo,
) {
  // @ts-ignore
  if (prismaClient[fieldName] === undefined) {
    throw new Error(
      `Unknown prisma-client function for field ${typeName}.${info.fieldName}`,
    )
  }
}

export function throwIfNoUniqFieldName(
  uniqFieldName: string | undefined,
  parentName: any,
) {
  if (uniqFieldName === undefined) {
    throw new Error(
      `ERROR: No uniq field were found to resolve \`${parentName.fieldName}\``,
    )
  }
}

import { GraphQLResolveInfo } from 'graphql'
import { Context } from '../context'
import { TypesMap } from './prisma'
import { GraphQLTypeArgument, GraphQLTypeObject } from './source-helper'
import { ObjectField } from './types'

export function throwIfUnkownArgsName(
  typeName: string,
  fieldName: string,
  args: GraphQLTypeArgument[],
  argsNameToExpose: string[],
) {
  const graphqlArgNames = args.map(a => a.name)
  const unknownArgsToExpose = argsNameToExpose.filter(
    argName => !graphqlArgNames.includes(argName),
  )

  if (unknownArgsToExpose.length > 0) {
    throw new Error(
      `Input args \`${unknownArgsToExpose.join(
        ', ',
      )}\` does not exist on \`${typeName}.${fieldName}\``,
    )
  }
}

export function throwIfUnknownType(typesMap: TypesMap, typeName: string): void {
  if (typesMap.types[typeName] === undefined) {
    throw new Error(`Type ${typeName} not found in Prisma API`)
  }
}

export function throwIfUnknownFields(
  graphqlType: GraphQLTypeObject,
  fields: ObjectField[],
  typeName: string,
): void {
  const fieldsName = graphqlType.fields.map(f => f.name)
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
  ctx: Context,
  info: GraphQLResolveInfo,
) {
  // @ts-ignore
  if (ctx.prisma[fieldName] === undefined) {
    throw new Error(
      `Unknown prisma-client function for field ${typeName}.${info.fieldName}`,
    )
  }
}

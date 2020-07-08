import * as Lo from 'lodash'
import { DmmfDocument, DmmfTypes } from './dmmf'

/**
 * Take the incoming GraphQL args of a resolver and replaces all `null` values
 * that maps to a non-nullable field in the Prisma Schema, by `undefined` values.
 *
 * In Prisma, a `null` value has a specific meaning for the underlying database.
 * Therefore, `undefined` is used instead to express the optionality of a field.
 *
 * In GraphQL however, no difference is made between `null` and `undefined`.
 * This is the reason why we need to convert all `null` values that were assigned to `non-nullable` fields to `undefined`.
 */
export function transformNullsToUndefined(
  graphqlArgs: Record<string, any>,
  prismaArgs: Record<string, DmmfTypes.SchemaArg>,
  dmmf: DmmfDocument
) {
  const keys = Object.keys(graphqlArgs)

  for (const key of keys) {
    const val = graphqlArgs[key]
    const prismaArg = prismaArgs[key]

    if (!prismaArg) {
      throw new Error(`Could not find schema arg with name: ${key}`)
    }

    const shouldConvertNullToUndefined = val === null && prismaArg.inputType.isNullable === false

    if (shouldConvertNullToUndefined) {
      graphqlArgs[key] = undefined
    } else if (Lo.isPlainObject(val)) {
      const nestedPrismaArgs = dmmf.getInputTypeWithIndexedFields(prismaArg.inputType.type).fields

      graphqlArgs[key] = transformNullsToUndefined(graphqlArgs[key], nestedPrismaArgs, dmmf)
    }
  }

  return graphqlArgs
}


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
  args: Record<string, any>,
  schemaArgs: Record<string, DmmfTypes.SchemaArg>,
  dmmf: DmmfDocument,
) {
  const keys = Object.keys(args)
  for (const key of keys) {
    const val = args[key]
    const schemaArg = schemaArgs[key]

    if (!schemaArg) {
      throw new Error(`Could not find schema arg with name: ${key}`)
    }

    const shouldConvertNullToUndefined =
      val === null && schemaArg.inputType.isNullable === false

    if (shouldConvertNullToUndefined) {
      args[key] = undefined
    } else if (isObject(val)) {
      const newSchemaArgs = dmmf.getInputTypeWithIndexedFields(
        schemaArg.inputType.type,
      ).fields

      args[key] = transformNullsToUndefined(args[key], newSchemaArgs, dmmf)
    }
  }

  return args
}

function isObject(obj: any): boolean {
  return obj && typeof obj === 'object'
}

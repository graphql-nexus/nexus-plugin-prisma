import { DmmfDocument } from './dmmf'

/**
 * Find the unique identifiers necessary to indentify a field
 *
 * Unique fields for a model can be one of (in this order):
 * 1. One (and only one) field with an @id annotation
 * 2. Multiple fields with @@id clause
 * 3. One (and only one) field with a @unique annotation (if there are multiple, use the first one)
 * 4. Multiple fields with a @@unique clause
 */
export function resolveUniqueIdentifiers(typeName: string, dmmf: DmmfDocument): string[] {
  const model = dmmf.getModelOrThrow(typeName)

  // Try finding 1.
  const singleIdField = model.fields.find((f) => f.isId)

  if (singleIdField) {
    return [singleIdField.name]
  }

  // Try finding 2.
  if (model.primaryKey && model.primaryKey.fields.length > 0) {
    return model.primaryKey.fields
  }

  const singleUniqueField = model.fields.find((f) => f.isUnique)

  if (singleUniqueField) {
    return [singleUniqueField.name]
  }

  if (model.uniqueFields && model.uniqueFields.length > 0) {
    return model.uniqueFields[0]
  }

  throw new Error(`Unable to resolve a unique identifier for the Prisma model: ${model.name}`)
}

export function findMissingUniqueIdentifiers(
  data: Record<string, any>,
  uniqueIdentifiers: string[]
): string[] | null {
  const missingIdentifiers: string[] = []

  for (const identifier of uniqueIdentifiers) {
    if (!data[identifier]) {
      missingIdentifiers.push(identifier)
    }
  }

  if (missingIdentifiers.length > 0) {
    return missingIdentifiers
  }

  return null
}

export function buildWhereUniqueInput(data: Record<string, any>, uniqueIdentifiers: string[]) {
  if (uniqueIdentifiers.length === 1) {
    return pickFromRecord(data, uniqueIdentifiers)
  }

  const compoundName = uniqueIdentifiers.join('_')

  return {
    [compoundName]: pickFromRecord(data, uniqueIdentifiers),
  }
}

function pickFromRecord(record: Record<string, any>, keys: string[]) {
  const output: Record<string, any> = {}

  for (const identifier of keys) {
    if (record[identifier]) {
      output[identifier] = record[identifier]
    }
  }

  return output
}

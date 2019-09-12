import { ExternalDMMF as DMMF } from './dmmf/types'

export function getSupportedQueries(mapping: DMMF.Mapping): string[] {
  return [mapping.findOne, mapping.findMany].filter(Boolean) as string[]
}

export function getSupportedMutations(mapping: DMMF.Mapping): string[] {
  return [
    mapping.create,
    mapping.update,
    mapping.updateMany,
    mapping.delete,
    mapping.deleteMany,
    mapping.upsert,
  ].filter(Boolean) as string[]
}

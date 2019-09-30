import * as DMMF from './dmmf'

export function getSupportedQueries(mapping: DMMF.Data.Mapping): string[] {
  return [mapping.findOne, mapping.findMany].filter(Boolean) as string[]
}

export function getSupportedMutations(mapping: DMMF.Data.Mapping): string[] {
  return [
    mapping.create,
    mapping.update,
    mapping.updateMany,
    mapping.delete,
    mapping.deleteMany,
    mapping.upsert,
  ].filter(Boolean) as string[]
}

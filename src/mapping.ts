import { DmmfDocument, DmmfTypes } from './dmmf'
import { defaultFieldNamingStrategy, FieldNamingStrategy, OperationName } from './naming-strategies'
import { flatMap, lowerFirst } from './utils'

interface BaseMappedField {
  field: string
  operation: OperationName
  model: string
  photonAccessor: string
}

export interface MappedField extends Omit<BaseMappedField, 'field'> {
  field: DmmfTypes.SchemaField
}

const buildField = (mapping: DmmfTypes.Mapping, operation: OperationName): BaseMappedField | null => {
  if (mapping[operation] === undefined) {
    return null
  }

  return {
    operation,
    field: mapping[operation]!,
    model: mapping.model,
    photonAccessor: lowerFirst(mapping.model),
  }
}

const CRUD_MAPPED_FIELDS: Record<string, (m: DmmfTypes.Mapping) => (BaseMappedField | null)[]> = {
  Query: (m) => [buildField(m, 'findOne'), buildField(m, 'findMany')],
  Mutation: (m) => [
    buildField(m, 'create'),
    buildField(m, 'update'),
    buildField(m, 'updateMany'),
    buildField(m, 'delete'),
    buildField(m, 'deleteMany'),
    buildField(m, 'upsert'),
  ],
}

export const getCrudMappedFields = (
  typeName: 'Query' | 'Mutation',
  dmmf: DmmfDocument,
  namingStrategy: FieldNamingStrategy = defaultFieldNamingStrategy
): MappedField[] => {
  const mappedFields = flatMap(dmmf.mappings, (m) => CRUD_MAPPED_FIELDS[typeName](m)).filter(
    (mappedField) => mappedField !== null
  ) as BaseMappedField[]

  return mappedFields.map((mappedField) => ({
    ...mappedField,
    field: {
      ...dmmf.getOutputType(typeName).getField(mappedField.field),
      name: namingStrategy[mappedField.operation](mappedField.field, mappedField.model),
    },
  }))
}

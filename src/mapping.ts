import { DmmfDocument, InternalDMMF } from './dmmf'
import { defaultFieldNamingStrategy, FieldNamingStrategy, OperationName } from './naming-strategies'
import { flatMap, lowerFirst } from './utils'

interface BaseMappedField {
  field: string
  operation: OperationName
  model: string
  prismaClientAccessor: string
}

export interface MappedField extends Omit<BaseMappedField, 'field'> {
  field: InternalDMMF.SchemaField
}

const buildField = (mapping: InternalDMMF.Mapping, operation: OperationName): BaseMappedField | null => {
  if (mapping[operation] === undefined) {
    return null
  }

  return {
    operation,
    field: mapping[operation]!,
    model: mapping.model,
    prismaClientAccessor: lowerFirst(mapping.model),
  }
}

const CRUD_MAPPED_FIELDS: Record<string, (m: InternalDMMF.Mapping) => (BaseMappedField | null)[]> = {
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
  const mappedFields = flatMap(dmmf.operations, (m) => CRUD_MAPPED_FIELDS[typeName](m)).filter(
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

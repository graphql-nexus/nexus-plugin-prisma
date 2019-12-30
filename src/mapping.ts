import { DmmfDocument, DmmfTypes } from './dmmf'
import {
  defaultFieldNamingStrategy,
  FieldNamingStrategy,
  OperationName,
} from './naming-strategies'
import { flatMap } from './utils'

interface BaseMappedField {
  field: string
  operation: OperationName
  model: string
  photonAccessor: string
}

export interface MappedField extends Omit<BaseMappedField, 'field'> {
  field: DmmfTypes.SchemaField
}

const buildField = (
  mapping: DmmfTypes.Mapping,
  operation: OperationName,
): BaseMappedField => ({
  operation,
  field: mapping[operation],
  model: mapping.model,
  photonAccessor: mapping.plural,
})

const CRUD_MAPPED_FIELDS: Record<
  string,
  (m: DmmfTypes.Mapping) => BaseMappedField[]
> = {
  Query: m => [buildField(m, 'findOne'), buildField(m, 'findMany')],
  Mutation: m => [
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
  namingStrategy: FieldNamingStrategy = defaultFieldNamingStrategy,
): MappedField[] =>
  flatMap(dmmf.mappings, m => CRUD_MAPPED_FIELDS[typeName](m)).map(
    mappedField => ({
      ...mappedField,
      field: {
        ...dmmf.getOutputType(typeName).getField(mappedField.field),
        name: namingStrategy[mappedField.operation](
          mappedField.field,
          mappedField.model,
        ),
      },
    }),
  )

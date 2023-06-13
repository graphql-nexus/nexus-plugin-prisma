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
  // appendFileSync('tmp.output.log.txt', `mapping::buildField(${operation}) as res=${mapping[operation]}\n`);

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
  Query: (m) => [
    buildField(m, 'aggregate'),
    // buildField(m, 'findFirst'),
    buildField(m, 'findMany'),
    buildField(m, 'findUnique'),
    buildField(m, 'groupBy'),
  ],
  Mutation: (m) => [
    buildField(m, 'create'),
    buildField(m, 'createMany'),
    buildField(m, 'delete'),
    buildField(m, 'deleteMany'),
    buildField(m, 'update'),
    buildField(m, 'updateMany'),
    buildField(m, 'upsert'),
  ],
}

export const getCrudMappedFields = (
  typeName: 'Query' | 'Mutation',
  dmmf: DmmfDocument,
  namingStrategy: FieldNamingStrategy = defaultFieldNamingStrategy
): MappedField[] => {
  const mappedFields = flatMap(dmmf.operations, (m) => {
    const res = CRUD_MAPPED_FIELDS[typeName](m)
    // appendFileSync('tmp.output.log.txt', `mapping::getCrudMappedFields() - [${typeName}][${JSON.stringify(m)}] as res=${JSON.stringify(res)}\n`);
    return res
  }).filter((mappedField) => {
    const res = mappedField !== null
    // appendFileSync('tmp.output.log.txt', `mapping::getCrudMappedFields() - [${typeName}] field ${JSON.stringify(mappedField)} - res=${res}\n`);
    return res
  }) as BaseMappedField[]

  const result = mappedFields.map((mappedField) => ({
    ...mappedField,
    field: {
      ...dmmf.getOutputType(typeName).getField(mappedField.field),
      name: namingStrategy[mappedField.operation](mappedField.field, mappedField.model),
    },
  }))

  return result
}

import { DMMF, ExternalDMMF } from './types'

export function transformDMMF(document: DMMF.Document): ExternalDMMF.Document {
  return {
    datamodel: transformDatamodel(document.datamodel),
    mappings: document.mappings as ExternalDMMF.Mapping[],
    schema: transformSchema(document.schema),
  }
}

function transformMappings(mappings: DMMF.Mapping[]) {
  return mappings.map(mapping => ({
    ...mapping,
    findOne: mapping.model.toLowerCase(),
  }))
}

function transformDatamodel(datamodel: DMMF.Datamodel): ExternalDMMF.Datamodel {
  return {
    enums: datamodel.enums,
    models: datamodel.models.map(model => ({
      ...model,
      fields: model.fields.map(field => ({
        ...field,
        kind: field.kind === 'object' ? 'relation' : field.kind,
      })),
    })),
  }
}

function transformSchema(schema: DMMF.Schema): ExternalDMMF.Schema {
  return {
    enums: schema.enums,
    inputTypes: schema.inputTypes.map(transformInputType),
    outputTypes: schema.outputTypes.map(o => ({
      ...o,
      fields: o.fields.map(f => ({
        ...f,
        args: transformArgs(f.args),
        outputType: {
          ...f.outputType,
          type: getReturnTypeName(f.outputType.type),
        },
      })),
    })),
  }
}

function transformArgs(args: DMMF.SchemaArg[]): ExternalDMMF.SchemaArg[] {
  return args.map(transformArg)
}

function transformArg(arg: DMMF.SchemaArg): ExternalDMMF.SchemaArg {
  let inputType = arg.inputType.find(a => a.kind === 'object')!

  if (!inputType) {
    inputType = arg.inputType[0]
  }

  return {
    name: arg.name,
    inputType: {
      ...inputType,
      type: getReturnTypeName(inputType.type),
    },
    isRelationFilter: undefined,
  }
}

function transformInputType(inputType: DMMF.InputType): ExternalDMMF.InputType {
  return {
    ...inputType,
    fields: transformArgs(inputType.fields),
  }
}

function getReturnTypeName(type: any) {
  if (typeof type === 'string') {
    return type
  }

  return type.name
}

function isWhereOrOrderByArgOrFilter(typeName: string) {
  if (typeName.endsWith('WhereInput') && typeName !== 'WhereInput') {
    return true
  }

  if (isRelationFilterArg(typeName)) {
    return true
  }

  return typeName.endsWith('OrderByInput') && typeName !== 'OrderByInput'
}

function isRelationFilterArg(type: string) {
  return (
    type.endsWith('Filter') &&
    ![
      'IntFilter',
      'StringFilter',
      'BooleanFilter',
      'NullableStringFilter',
      'FloatFilter',
    ].includes(type) &&
    type !== 'Filter'
  )
}

function argTypeName(modelName: string, typeName: string) {
  if (isWhereOrOrderByArgOrFilter(typeName)) {
    return `${modelName}${typeName}`
  }

  return typeName
}

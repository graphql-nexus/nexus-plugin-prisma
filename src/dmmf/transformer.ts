import { DMMF, ExternalDMMF } from './types'

export function transform(document: DMMF.Document): ExternalDMMF.Document {
  return {
    datamodel: transformDatamodel(document.datamodel),
    mappings: document.mappings as ExternalDMMF.Mapping[],
    schema: transformSchema(document.schema),
  }
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
        args: f.args.map(transformArg),
        outputType: {
          ...f.outputType,
          type: getReturnTypeName(f.outputType.type),
        },
      })),
    })),
  }
}

function transformArg(arg: DMMF.SchemaArg): ExternalDMMF.SchemaArg {
  // FIXME: *Enum*Filter are currently empty
  let inputType = arg.inputType.some(a => a.kind === 'enum')
    ? arg.inputType[0]
    : arg.inputType.find(a => a.kind === 'object')!

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
    fields: inputType.fields.map(transformArg),
  }
}

function getReturnTypeName(type: any) {
  if (typeof type === 'string') {
    return type
  }

  return type.name
}

import * as Nexus from 'nexus'
import { DMMF } from '@prisma/photon'

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

/**
 * Conversion from a Photon arg type to a GraphQL arg type using
 * heuristics. A conversion is needed becuase GraphQL does not
 * support union types on args, but Photon does.
 */
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
    // FIXME Why?
    isRelationFilter: undefined,
  }
}

function transformInputType(inputType: DMMF.InputType): ExternalDMMF.InputType {
  return {
    ...inputType,
    fields: inputType.fields.map(transformArg),
  }
}

/**
 * Make the "return type" property type always be a string. In Photon
 * it is allowed to be a nested structured object but we want only the
 * reference-by-name form.
 *
 */
//
// TODO _why_ is the dmmf like this?
//
// FIXME `any` type becuase this is used by both outputType and inputType
// and there is currently no generic capturing both ideas.
//
function getReturnTypeName(type: any) {
  if (typeof type === 'string') {
    return type
  }

  return type.name
}

export declare namespace ExternalDMMF {
  interface Document {
    datamodel: Datamodel
    schema: Schema
    mappings: Mapping[]
  }
  interface Enum {
    name: string
    values: string[]
    dbName?: string | null
  }
  interface Datamodel {
    models: Model[]
    enums: Enum[]
  }
  interface Model {
    name: string
    isEmbedded: boolean
    dbName: string | null
    fields: Field[]
  }
  type FieldKind = 'scalar' | 'object' | 'enum'
  type DatamodelFieldKind = 'scalar' | 'relation' | 'enum'
  interface Field {
    kind: DatamodelFieldKind
    name: string
    isRequired: boolean
    isList: boolean
    isUnique: boolean
    isId: boolean
    type: string
    dbName: string | null
    isGenerated: boolean
    relationToFields?: any[]
    relationOnDelete?: string
    relationName?: string
  }
  interface Schema {
    inputTypes: InputType[]
    outputTypes: OutputType[]
    enums: Enum[]
  }
  interface QueryOutput {
    name: string
    isRequired: boolean
    isList: boolean
  }
  type ArgType = string
  interface SchemaArg {
    name: string
    inputType: {
      isRequired: boolean
      isList: boolean
      type: ArgType
      kind: FieldKind
    }
    isRelationFilter?: boolean
  }
  interface OutputType {
    name: string
    fields: SchemaField[]
    isEmbedded?: boolean
  }
  interface SchemaField {
    name: string
    outputType: {
      type: Nexus.core.AllOutputTypes
      isList: boolean
      isRequired: boolean
      kind: FieldKind
    }
    args: SchemaArg[]
  }
  interface InputType {
    name: string
    isWhereType?: boolean
    isOrderType?: boolean
    atLeastOne?: boolean
    atMostOne?: boolean
    fields: SchemaArg[]
  }
  interface Mapping {
    model: string
    plural: string
    findOne: string
    findMany: string
    create: string
    update: string
    updateMany: string
    upsert: string
    delete: string
    deleteMany: string
  }
  enum ModelAction {
    findOne = 'findOne',
    findMany = 'findMany',
    create = 'create',
    update = 'update',
    updateMany = 'updateMany',
    upsert = 'upsert',
    delete = 'delete',
    deleteMany = 'deleteMany',
  }
}

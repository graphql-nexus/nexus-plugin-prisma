import { core } from 'nexus'
import { ComputeInput } from '../utils'

export declare namespace DmmfTypes {
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
    dbNames: string[] | null
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
  type BaseSchemaArg = {
    name: string
    inputType: {
      isRequired: boolean
      isList: boolean
      type: ArgType
      kind: FieldKind
    }
    relateBy?: 'any'
  }
  type ComputedSchemaArg = BaseSchemaArg & {
    computeFrom: ComputeInput
  }
  type RelatedSchemaArg = BaseSchemaArg & {
    relateBy: 'create' | 'connect'
  }
  type SchemaArg = BaseSchemaArg | ComputedSchemaArg | RelatedSchemaArg

  interface OutputType {
    name: string
    fields: SchemaField[]
    isEmbedded?: boolean
  }
  interface SchemaField {
    name: string
    outputType: {
      type: core.AllOutputTypes
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
    isRelation: boolean
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

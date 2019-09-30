import * as Nexus from 'nexus'

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
  interface Field {
    kind: FieldKind
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
  interface SchemaArg {
    name: string
    inputType: {
      isRequired: boolean
      isList: boolean
      type: string
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
    plural?: string
    findOne?: string
    findMany?: string
    create?: string
    update?: string
    updateMany?: string
    upsert?: string
    delete?: string
    deleteMany?: string
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

export declare namespace InternalDMMF {
  interface Document {
    datamodel: Datamodel
    schema: Schema
    mappings: Mapping[]
  }
  interface SchemaEnum {
    name: string
    values: string[]
    dbName?: string | null
  }
  interface Datamodel {
    models: Model[]
    enums: SchemaEnum[]
  }
  interface Model {
    name: string
    isEmbedded: boolean
    dbName: string | null
    fields: Field[]
    [key: string]: any
  }
  type FieldKind = 'scalar' | 'object' | 'enum'
  interface Field {
    kind: FieldKind
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
    [key: string]: any
  }
  interface Schema {
    rootQueryType?: string
    rootMutationType?: string
    inputTypes: InputType[]
    outputTypes: OutputType[]
    enums: SchemaEnum[]
  }
  interface Query {
    name: string
    args: SchemaArg[]
    output: QueryOutput
  }
  interface QueryOutput {
    name: string
    isRequired: boolean
    isList: boolean
  }
  interface SchemaArgInputType {
    isRequired: boolean
    isList: boolean
    type: string | InputType | SchemaEnum
    kind: FieldKind
  }
  interface SchemaArg {
    name: string
    inputType: SchemaArgInputType[]
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
      type: string
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
    findOne?: string | null
    findMany?: string | null
    create?: string | null
    update?: string | null
    updateMany?: string | null
    upsert?: string | null
    delete?: string | null
    deleteMany?: string | null
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

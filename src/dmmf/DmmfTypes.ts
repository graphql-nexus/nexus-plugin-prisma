import { GlobalComputedInputs } from '../utils'

export declare namespace InternalDMMF {
  interface Document {
    datamodel: Datamodel
    schema: Schema
    operations: Mapping[]
  }
  interface DatamodelEnum {
    name: string
    values: EnumValue[]
    dbName?: string | null
    documentation?: string
  }
  interface EnumValue {
    name: string
  }
  interface SchemaEnum {
    name: string
    values: string[]
  }
  interface Datamodel {
    models: Model[]
    enums: DatamodelEnum[]
  }
  interface PrimaryKey {
    name: string | null
    fields: string[]
  }
  interface Model {
    name: string
    dbName: string | null
    documentation?: string
    fields: Field[]
    primaryKey: PrimaryKey | null
    isEmbedded: boolean
    uniqueFields: Array<string[]>
  }
  export type FieldKind = 'scalar' | 'object' | 'enum'
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
    enums: SchemaEnum[]
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
      type: ArgType
      kind: FieldKind
      isList: boolean
      isNullable: boolean
      isRequired: boolean
    }
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
      isRequired: boolean
      isNullable?: boolean
      isList: boolean
      kind: FieldKind
    }
    args: SchemaArg[]
  }
  interface InputType {
    name: string
    constraints: {
      maxNumFields: number | null
      minNumFields: number | null
    }
    fields: SchemaArg[]
    computedInputs: GlobalComputedInputs
  }
  interface Mapping {
    model: string
    plural: string
    aggregate?: string | null;
    groupBy?: string | null;
    // findFirst?: string | null;
    findUnique?: string | null
    findMany?: string | null
    create?: string | null
    createMany?: string | null
    update?: string | null
    updateMany?: string | null
    upsert?: string | null
    delete?: string | null
    deleteMany?: string | null
  }
  enum ModelAction {
    findOne = 'findUnique',
    findMany = 'findMany',
    create = 'create',
    update = 'update',
    updateMany = 'updateMany',
    upsert = 'upsert',
    delete = 'delete',
    deleteMany = 'deleteMany',
  }
}

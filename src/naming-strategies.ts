import pluralize from 'pluralize'
import * as DMMF from './dmmf'
import { upperFirst } from './utils'

export interface ArgsNamingStrategy {
  whereInput: (typeName: string, fieldName: string) => string
  orderByInput: (typeName: string, fieldName: string) => string
  relationFilterInput: (typeName: string, fieldName: string) => string
}

export const defaultArgsNamingStrategy: ArgsNamingStrategy = {
  whereInput(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}WhereInput`
  },
  orderByInput(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}OrderByInput`
  },
  relationFilterInput(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}Filter`
  },
}

export type OperationName = Exclude<keyof DMMF.Data.Mapping, 'model' | 'plural'>

export type FieldNamingStrategy = Record<
  OperationName,
  (fieldName: string, modelName: string) => string
>

export const defaultFieldNamingStrategy: FieldNamingStrategy = {
  findOne: (_, modelName) => modelName.toLowerCase(),
  findMany: (_, modelName) => pluralize(modelName).toLowerCase(),
  create: fieldName => fieldName,
  update: fieldName => fieldName,
  delete: fieldName => fieldName,
  deleteMany: fieldName => fieldName,
  updateMany: fieldName => fieldName,
  upsert: fieldName => fieldName,
}

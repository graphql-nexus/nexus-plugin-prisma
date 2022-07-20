import camelCase from 'camelcase'
import pluralize from 'pluralize'
import { InternalDMMF } from './dmmf'
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

export type OperationName = Exclude<keyof InternalDMMF.Mapping, 'model' | 'plural'>

export type FieldNamingStrategy = Record<OperationName, (fieldName: string, modelName: string) => string>

export const defaultFieldNamingStrategy: FieldNamingStrategy = {
  // findFirst: (_, modelName) => camelCase(modelName),
  aggregate: (fieldName) => fieldName,
  findUnique: (_, modelName) => camelCase(modelName),
  findMany: (_, modelName) => camelCase(pluralize(modelName)),
  groupBy: (fieldName) => fieldName,
  create: (fieldName) => fieldName,
  createMany: (fieldName) => fieldName,
  delete: (fieldName) => fieldName,
  deleteMany: (fieldName) => fieldName,
  update: (fieldName) => fieldName,
  updateMany: (fieldName) => fieldName,
  upsert: (fieldName) => fieldName,
}

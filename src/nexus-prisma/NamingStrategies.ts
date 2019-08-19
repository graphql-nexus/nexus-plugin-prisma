import pluralize from 'pluralize'
import { ExternalDMMF as DMMF } from '../dmmf/dmmf-types'
import { upperFirst } from '../utils'

export interface IArgsNamingStrategy {
  whereInput: (typeName: string, fieldName: string) => string
  orderByInput: (typeName: string, fieldName: string) => string
  relationFilterInput: (typeName: string, fieldName: string) => string
}

export const defaultArgsNamingStrategy: IArgsNamingStrategy = {
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

export type OperationName = Exclude<keyof DMMF.Mapping, 'model' | 'plural'>

export type IFieldNamingStrategy = Record<
  OperationName,
  (fieldName: string, modelName: string) => string
>

export const defaultFieldNamingStrategy: IFieldNamingStrategy = {
  findOne: (_, modelName) => modelName.toLowerCase(),
  findMany: (_, modelName) => pluralize(modelName).toLowerCase(),
  create: fieldName => fieldName,
  update: fieldName => fieldName,
  delete: fieldName => fieldName,
  deleteMany: fieldName => fieldName,
  updateMany: fieldName => fieldName,
  upsert: fieldName => fieldName,
}

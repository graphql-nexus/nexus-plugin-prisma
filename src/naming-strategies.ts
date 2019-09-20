import pluralize from 'pluralize'
import * as DMMF from './dmmf'
import { upperFirst } from './utils'

export interface ArgsNamingStrategy {
  where: (typeName: string, fieldName: string) => string
  orderBy: (typeName: string, fieldName: string) => string
  relationFilter: (typeName: string, fieldName: string) => string
}

export const defaultArgsNamingStrategy: ArgsNamingStrategy = {
  where(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}Where`
  },
  orderBy(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}OrderBy`
  },
  relationFilter(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}Filter`
  },
}

export type OperationName = Exclude<
  keyof DMMF.External.Mapping,
  'model' | 'plural'
>

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

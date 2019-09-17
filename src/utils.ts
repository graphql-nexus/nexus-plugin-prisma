import { relative } from 'path'
import { ExternalDMMF as DMMF } from './dmmf/dmmf-types'
import {
  OperationName,
  IFieldNamingStrategy,
} from './nexus-prisma/NamingStrategies'
import { core } from 'nexus'

export const keyBy: <T>(
  collection: T[],
  iteratee: (value: T) => string,
) => Record<string, T> = (collection, iteratee) => {
  return collection.reduce<any>((acc, curr) => {
    acc[iteratee(curr)] = curr
    return acc
  }, {})
}

export function partition<T>(
  arr: T[],
  iteratee: (val: T) => boolean,
): [T[], T[]] {
  const partitioned: [T[], T[]] = [[], []]

  for (const val of arr) {
    const partitionIndex: 0 | 1 = iteratee(val) ? 0 : 1
    partitioned[partitionIndex].push(val)
  }

  return partitioned
}

export const upperFirst = (s: string): string => {
  return s.replace(/^\w/, c => c.toUpperCase())
}

export function flatMap<T, U>(
  array: T[],
  callbackfn: (value: T, index: number, array: T[]) => U[],
): U[] {
  return Array.prototype.concat(...array.map(callbackfn))
}

export function nexusOpts(param: {
  type: core.AllInputTypes | core.AllNexusInputTypeDefs<string>
  isList: boolean
  isRequired: boolean
}): {
  type: any
  list: true | undefined
  nullable: boolean
} {
  return {
    type: param.type,
    list: param.isList ? true : undefined,
    nullable: !param.isRequired,
  }
}

export function assertPhotonInContext(photon: any) {
  if (!photon) {
    throw new Error('Could not find photon in context')
  }
}

export function trimIfInNodeModules(path: string) {
  if (path.includes('node_modules')) {
    return path.substring(
      path.lastIndexOf('node_modules') + 'node_modules'.length + 1,
    )
  }

  return path
}

export function getImportPathRelativeToOutput(
  from: string,
  to: string,
): string {
  if (to.includes('node_modules')) {
    return trimIfInNodeModules(to)
  }

  let relativePath = relative(from, to)

  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath
  }

  // remove .ts or .js file extension
  relativePath = relativePath.replace(/\.(ts|js)$/, '')

  // remove /index
  relativePath = relativePath.replace(/\/index$/, '')

  // replace \ with /
  relativePath = relativePath.replace(/\\/g, '/')

  return relativePath
}

export function getCRUDFieldName(
  modelName: string,
  fieldName: string,
  mapping: DMMF.Mapping,
  namingStrategy: IFieldNamingStrategy,
) {
  const operationName = Object.keys(mapping).find(
    key => (mapping as any)[key] === fieldName,
  ) as OperationName | undefined

  if (!operationName || !namingStrategy[operationName]) {
    throw new Error(`Could not find mapping for field ${fieldName}`)
  }

  return namingStrategy[operationName](fieldName, modelName)
}

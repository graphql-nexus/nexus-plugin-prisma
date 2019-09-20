import { isNamedType } from 'graphql'
import { core } from 'nexus'
import { relative } from 'path'
import * as DMMF from './dmmf'
import { OperationName, FieldNamingStrategy } from './naming-strategies'

// TODO `any` should be `unknown` but there is a bug (?)
// preventing that from working, see:
// https://github.com/microsoft/TypeScript/issues/33521

/**
 * TODO
 */
export const indexBy = <X extends Record<string, any>>(
  indexer: ((x: X) => string) | keyof X,
  xs: X[],
): Index<X> => {
  const seed: Index<X> = {}
  if (typeof indexer === 'function') {
    return xs.reduce((index, x) => {
      const address = indexer(x)
      index[address] = x
      return index
    }, seed)
  } else {
    return xs.reduce((index, x) => {
      const address = x[indexer]
      index[address] = x
      return index
    }, seed)
  }
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

export function nexusFieldOpts(param: {
  type: string | object
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
  mapping: DMMF.External.Mapping,
  namingStrategy: FieldNamingStrategy,
) {
  const operationName = Object.keys(mapping).find(
    key => (mapping as any)[key] === fieldName,
  ) as OperationName | undefined

  if (!operationName || !namingStrategy[operationName]) {
    throw new Error(`Could not find mapping for field ${fieldName}`)
  }

  return namingStrategy[operationName](fieldName, modelName)
}

/**
 * Unwrap nexus user-defined types and convert them to a map<TypeName, boolean>
 */
export function unwrapTypes(types: any): Record<string, boolean> {
  let output: Record<string, boolean> = {}

  if (!types) {
    return {}
  }

  if (core.isNexusNamedTypeDef(types) || isNamedType(types)) {
    output[types.name] = true
  } else if (Array.isArray(types)) {
    types.forEach(typeDef => {
      output = {
        ...output,
        ...unwrapTypes(typeDef),
      }
    })
  } else if (core.isObject(types)) {
    Object.keys(types).forEach(key => {
      output = {
        ...output,
        ...unwrapTypes(types[key]),
      }
    })
  }

  return output
}

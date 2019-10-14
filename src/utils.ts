import { isNamedType } from 'graphql'
import { core } from 'nexus'
import { relative } from 'path'
import * as fs from 'fs-extra'
import * as path from 'path'
import { thisExpression } from '@babel/types'

/**
 * Write file contents but first delete the file off disk if present. This is a
 * useful function when the effect of file delete is needed to trigger some file
 * watch/refresh mechanism, such as is the case with VSCode TS declaration files
 * inside `@types/` packages.
 *
 * For more details that motivated this utility refer to the originating issue
 * https://github.com/prisma-labs/nexus-prisma/issues/453.
 */
export const hardWriteFile = (filePath: string, data: string): Promise<void> =>
  fs
    .unlink(filePath)
    .catch(error => {
      return error.code === 'ENOENT' ? Promise.resolve() : Promise.reject(error)
    })
    .then(() => fs.mkdirp(path.dirname(filePath)))
    .then(() => fs.writeFile(filePath, data))

/**
 * Write file contents but first delete the file off disk if present. This is a
 * useful function when the effect of file delete is needed to trigger some file
 * watch/refresh mechanism, such as is the case with VSCode TS declaration files
 * inside `@types/` packages.
 *
 * For more details that motivated this utility refer to the originating issue
 * https://github.com/prisma-labs/nexus-prisma/issues/453.
 */
export const hardWriteFileSync = (filePath: string, data: string): void => {
  fs.mkdirpSync(path.dirname(filePath))
  try {
    fs.unlinkSync(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  fs.writeFileSync(filePath, data)
}

// TODO `any` should be `unknown` but there is a bug (?)
// preventing that from working, see:
// https://github.com/microsoft/TypeScript/issues/33521
// https://stackoverflow.com/questions/58030413/calculate-union-type-of-key-names-in-object-whose-values-are-indexable

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

export function dmmfFieldToNexusFieldConfig(param: {
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

export function proxifier<T extends Record<string, any>>(
  target: T,
  typeName: string,
): T {
  return new Proxy(target, {
    get(target, key) {
      if (key in target) {
        return target[key as string]
      }

      const accessor =
        typeName === 'Query' || typeName === 'Mutation' ? 'crud' : 'model'

      console.warn(`\
Error: Field '${typeName}'.${String(key)} does not exist.

objectType({
  name: '${typeName}',
  definition(t) {
    ...
    t.${accessor}.${String(key)}(...) <-- '${String(
        key,
      )}' is not a valid field name.'
  }
})`)

      return () => {}
    },
  })
}

/**
 * Index types are just an alias for Records
 * whose keys are of type `string`. The name
 * of this type, `Index`, signifies its canonical
 * use-case for data indexed by some property, e.g.
 * a list of users indexed by email.
 */
export type Index<T> = Record<string, T>

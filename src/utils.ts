import * as fs from 'fs-extra'
import * as path from 'path'

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

  let relativePath = path.relative(from, to)

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
 * Index types are just an alias for Records
 * whose keys are of type `string`. The name
 * of this type, `Index`, signifies its canonical
 * use-case for data indexed by some property, e.g.
 * a list of users indexed by email.
 */
export type Index<T> = Record<string, T>

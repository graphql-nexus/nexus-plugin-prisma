import { core } from '@nexus/schema'
import { writeFileSync } from 'fs'
import * as fs from 'fs-jetpack'
import { GraphQLResolveInfo } from 'graphql'
import * as path from 'path'
import { inspect, isDeepStrictEqual } from 'util'

export function dump(x: any, name?: string) {
  const fence = (name ?? '') + '---------------------------------------------------------'
  console.error(fence + '\n' + inspect(x, { depth: 20 }) + '\n' + fence)
}

/**
 * Dump JSONified representation of the data to a debug.json file (or named to what you give as the second parameter).
 */
export function dumpToFile(x: any, name?: string) {
  writeFileSync(`debug${name ? '-' + name : ''}.json`, JSON.stringify(x, null, 2))
}

/**
 * Write file contents but first delete the file off disk if present. This is a
 * useful function when the effect of file delete is needed to trigger some file
 * watch/refresh mechanism, such as is the case with VSCode TS declaration files
 * inside `@types/` packages.
 *
 * For more details that motivated this utility refer to the originating issue
 * https://github.com/graphql-nexus/nexus-plugin-prisma/issues/453.
 */
export const hardWriteFile = (filePath: string, data: string): Promise<void> =>
  fs
    .removeAsync(filePath)
    .catch((error) => {
      return error.code === 'ENOENT' ? Promise.resolve() : Promise.reject(error)
    })
    .then(() => fs.writeAsync(filePath, data))

/**
 * Write file contents but first delete the file off disk if present. This is a
 * useful function when the effect of file delete is needed to trigger some file
 * watch/refresh mechanism, such as is the case with VSCode TS declaration files
 * inside `@types/` packages.
 *
 * For more details that motivated this utility refer to the originating issue
 * https://github.com/graphql-nexus/nexus-plugin-prisma/issues/453.
 */
export const hardWriteFileSync = (filePath: string, data: string): void => {
  try {
    fs.remove(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  fs.write(filePath, data)
}

// TODO `any` should be `unknown` but there is a bug (?)
// preventing that from working, see:
// https://github.com/microsoft/TypeScript/issues/33521
// https://stackoverflow.com/questions/58030413/calculate-union-type-of-key-names-in-object-whose-values-are-indexable

/**
 * TODO
 */
export const indexBy = <X extends Record<string, any>>(
  xs: X[],
  indexer: ((x: X) => string) | keyof X
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
  return s.replace(/^\w/, (c) => c.toUpperCase())
}

export function lowerFirst(s: string): string {
  if (s.length === 0) return s
  return s[0].toLowerCase() + s.slice(1)
}

export function flatMap<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => U[]): U[] {
  return Array.prototype.concat(...array.map(callbackfn))
}

export function assertPrismaClientInContext(prismaClient: any) {
  if (!prismaClient) {
    throw new Error('Could not find Prisma Client JS in context (ctx.prisma)')
  }
}

export function trimIfInNodeModules(path: string) {
  if (path.includes('node_modules')) {
    return path.substring(path.lastIndexOf('node_modules') + 'node_modules'.length + 1)
  }

  return path
}

export function getImportPathRelativeToOutput(from: string, to: string): string {
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

/** TODO: Copy these types into computedInputs section of docs as part of
 * docs build process. The same should be done for other areas where code
 * has been copy pasted into our README.
 **/
/**
 *  Represents arguments required by Prisma Client JS that will
 *  be derived from a request's input (args, context, and info)
 *  and omitted from the GraphQL API. The object itself maps the
 *  names of these args to a function that takes an object representing
 *  the request's input and returns the value to pass to the prisma
 *  arg of the same name.
 */
export type LocalComputedInputs<MethodName extends string> = Record<
  string,
  (params: LocalMutationResolverParams<MethodName>) => unknown
>

export type GlobalComputedInputs = Record<string, (params: GlobalMutationResolverParams) => unknown>

type BaseMutationResolverParams = {
  info: GraphQLResolveInfo
  ctx: Context
}

export type GlobalMutationResolverParams = BaseMutationResolverParams & {
  args: Record<string, any> & { data: unknown }
}

export type LocalMutationResolverParams<MethodName extends string> = BaseMutationResolverParams & {
  args: MethodName extends keyof core.GetGen2<'argTypes', 'Mutation'>
    ? core.GetGen3<'argTypes', 'Mutation', MethodName>
    : any
}

export type Context = core.GetGen<'context'>

export const isEmptyObject = (o: any) => isDeepStrictEqual(o, {})

export function keys<A extends object>(a: A): (keyof A)[] {
  return Object.keys(a) as any
}

export function apply<T, F extends Function = (x: T) => any>(val: T, fn: F): any {
  return fn(val)
}

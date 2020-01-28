import {
  unlink,
  mkdirp,
  writeFile,
  mkdirpSync,
  unlinkSync,
  writeFileSync,
} from 'fs-extra'
import { dirname, relative } from 'path'
import { core } from 'nexus'
import { isDeepStrictEqual } from 'util'
import { GraphQLResolveInfo } from 'graphql'
import { type } from 'os'
import { WithRequiredKeys } from '@re-do/utils'

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
  unlink(filePath)
    .catch(error => {
      return error.code === 'ENOENT' ? Promise.resolve() : Promise.reject(error)
    })
    .then(() => mkdirp(dirname(filePath)))
    .then(() => writeFile(filePath, data))

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
  mkdirpSync(dirname(filePath))
  try {
    unlinkSync(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  writeFileSync(filePath, data)
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

export function assertPhotonInContext(prismaClient: any) {
  if (!prismaClient) {
    throw new Error('Could not find Prisma Client JS in context (ctx.prisma)')
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
export type ComputedInputs<
  MethodName extends MutationMethodName = string
> = Record<string, (params: MutationResolverParams<MethodName>) => unknown>

export type MutationResolverParams<
  MethodName extends MutationMethodName = string
> = {
  info: GraphQLResolveInfo
  ctx: Context
  args: core.GetGen<'argTypes'>['Mutation'][MethodName]
}

export type MutationMethodName = Extract<
  keyof core.GetGen<'argTypes'>['Mutation'],
  string
>

export type Context = core.GetGen<'context'>

export const isEmptyObject = (o: any) => isDeepStrictEqual(o, {})

type NestedKeys<T> = { [K in keyof T]: keyof T[K] }[keyof T]

export type InputFieldName = NestedKeys<
  core.GetGen<'inputTypes'>
> extends string
  ? NestedKeys<core.GetGen<'inputTypes'>>
  : string

// type InputFieldName = 'a' | 'b' | 'c'

//On a related note, this type determines which fields are always 'created' or always 'connected'
export type RelatedFields<IllegalKeys extends string | null = null> = Record<
  Exclude<InputFieldName, IllegalKeys>,
  boolean
>

export type RelationsConfig<
  CreateFields extends { [K in InputFieldName]?: boolean },
  ConnectFields extends {
    [K in Exclude<InputFieldName, keyof CreateFields>]?: boolean
  }
> = {
  create?: CreateFields
  connect?: ConnectFields
  defaultRelation?: 'create' | 'connect' | 'unset'
}

const createRelation = <
  CreateFields extends { [K in InputFieldName]?: CreateFields[K] },
  ConnectFields extends {
    [K in Exclude<InputFieldName, keyof CreateFields>]?: ConnectFields[K]
  }
>(
  a: CreateFields,
  b: ConnectFields,
) => {}

createRelation({ a: true, b: true }, { b: true })

export type ResolvedRelationsConfig = Required<RelationsConfig>

export type ScopableConfig = {
  computedInputs?: ComputedInputs
  relations?: RelationsConfig
}

export type ResolvedScopableConfig = {
  computedInputs: ComputedInputs
  relations: ResolvedRelationsConfig
}

import { DMMF } from '@prisma/client/runtime'
import { DmmfTypes, getReturnTypeName } from './dmmf'

interface PaginationResult {
  cursor?: object
  skip?: string | number
  take?: string | number
  orderBy?: { [x: string]: 'asc' | 'desc' }
  [x: string]: any
}

export interface PaginationStrategy<T = object> {
  paginationArgNames: string[]
  transformDmmfArgs(params: {
    args: DmmfTypes.SchemaArg[]
    paginationArgNames: string[]
    field: DMMF.SchemaField
  }): DmmfTypes.SchemaArg[]
  resolve(args: T): PaginationResult
}

const relayLikePaginationArgs: Record<
  'first' | 'last' | 'before' | 'after',
  (typeName: string) => DmmfTypes.SchemaArg
> = {
  first: () => ({
    name: 'first',
    inputType: {
      type: 'Int',
      kind: 'scalar',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
  last: () => ({
    name: 'last',
    inputType: {
      type: 'Int',
      kind: 'scalar',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
  before: (typeName: string) => ({
    name: 'before',
    inputType: {
      type: `${typeName}WhereUniqueInput`,
      kind: 'object',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
  after: (typeName: string) => ({
    name: 'after',
    inputType: {
      type: `${typeName}WhereUniqueInput`,
      kind: 'object',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
}

interface RelayLikePaginationArgs {
  first?: number
  last?: number
  before?: object
  after?: object
}

interface PaginationStrategies {
  relay: PaginationStrategy<RelayLikePaginationArgs>
  prisma: PaginationStrategy<PrismaPaginationArgs>
}

const prismaPaginationArgs: Record<'take' | 'skip' | 'cursor', (typeName: string) => DmmfTypes.SchemaArg> = {
  take: () => ({
    name: 'take',
    inputType: {
      type: 'Int',
      kind: 'scalar',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
  skip: () => ({
    name: 'skip',
    inputType: {
      type: 'Int',
      kind: 'scalar',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
  cursor: (typeName: string) => ({
    name: 'cursor',
    inputType: {
      type: `${typeName}WhereUniqueInput`,
      kind: 'object',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
}

interface PrismaPaginationArgs {
  cursor?: object
  take?: number
  skip?: number
}

const PaginationStrategies: PaginationStrategies = {
  relay: {
    paginationArgNames: Object.keys(relayLikePaginationArgs),
    transformDmmfArgs({ args, paginationArgNames, field }) {
      const fieldOutputTypeName = getReturnTypeName(field.outputType.type)

      // Remove old pagination args
      args = args.filter((a) => !paginationArgNames.includes(a.name))

      // Push new pagination args
      args.push(
        relayLikePaginationArgs.first(fieldOutputTypeName),
        relayLikePaginationArgs.last(fieldOutputTypeName),
        relayLikePaginationArgs.before(fieldOutputTypeName),
        relayLikePaginationArgs.after(fieldOutputTypeName)
      )

      return args
    },
    resolve(args) {
      const { first, last, before, after } = args

      // If no pagination set, don't touch the args
      if (!first && !last && !before && !after) {
        return args
      }

      /**
       * This is currently only possible with js transformation on the result. eg:
       * after: 1, last: 1
       * ({
       *   cursor: { id: $before },
       *   take: Number.MAX_SAFE_INTEGER,
       *   skip: 1
       * }).slice(length - $last, length)
       */
      if (after && last) {
        throw new Error(`after and last can't be set simultaneously`)
      }

      /**
       * This is currently only possible with js transformation on the result. eg:
       * before: 4, first: 1
       * ({
       *   cursor: { id: $before },
       *   take: Number.MIN_SAFE_INTEGER,
       *   skip: 1
       * }).slice(0, $first)
       */
      if (before && first) {
        throw new Error(`before and first can't be set simultaneously`)
      }

      // Edge-case: simulates a single `before` with a hack
      if (before && !first && !last && !after) {
        return {
          cursor: before,
          skip: 1,
          take: Number.MIN_SAFE_INTEGER,
        }
      }

      const take = resolveTake(first, last, before)
      const cursor = resolveCursor(before, after)
      const skip = resolveSkip(cursor)

      delete args.first
      delete args.last
      delete args.before
      delete args.after

      const newArgs = {
        take,
        cursor,
        skip,
        ...args,
      }

      return newArgs
    },
  },
  prisma: {
    paginationArgNames: Object.keys(prismaPaginationArgs),
    transformDmmfArgs({ args, paginationArgNames, field }) {
      return args
    },
    resolve(args) {
      return args
    },
  },
}

function resolveTake(
  first: number | undefined,
  last: number | undefined,
  before: object | undefined
): number | undefined {
  if (first && last) {
    throw new Error(`first and last can't be set simultaneously`)
  }

  if (first) {
    if (first < 0) {
      throw new Error(`first can't be negative`)
    }
    return first
  }

  if (last) {
    if (last < 0) {
      throw new Error(`last can't be negative`)
    }

    if (last === 0) {
      return 0
    }

    return last * -1
  }

  return undefined
}

function resolveCursor(before: object | undefined, after: object | undefined) {
  if (before && after) {
    throw new Error(`before and after can't be set simultaneously`)
  }

  return before ?? after
}

function resolveSkip(cursor: object | undefined) {
  if (cursor) {
    return 1
  }

  return undefined
}

export default PaginationStrategies

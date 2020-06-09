import { DmmfTypes, getReturnTypeName } from './dmmf'
import { DMMF } from '@prisma/client/runtime'

export interface PaginationStrategy<T = object> {
  transformDmmfArgs: (params: {
    args: DmmfTypes.SchemaArg[]
    paginationArgNames: string[]
    field: DMMF.SchemaField
  }) => DmmfTypes.SchemaArg[]
  paginationArgNames: string[]
  resolve: (
    args: T,
  ) => { cursor?: object; skip?: string | number; take?: string | number } & {
    [x: string]: any
  }
}

const relayLikePaginationArgs: Record<
  'first' | 'last' | 'skip' | 'before' | 'after',
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
  skip?: number
  before?: object
  after?: object
}

export const relayLikePaginationStrategy: PaginationStrategy<RelayLikePaginationArgs> = {
  paginationArgNames: Object.keys(relayLikePaginationArgs),
  transformDmmfArgs({ args, paginationArgNames, field }) {
    const fieldOutputTypeName = getReturnTypeName(field.outputType.type)

    // Remove old pagination args
    args = args.filter(a => !paginationArgNames.includes(a.name))

    // Push new pagination args
    args.push(
      relayLikePaginationArgs.first(fieldOutputTypeName),
      relayLikePaginationArgs.last(fieldOutputTypeName),
      relayLikePaginationArgs.before(fieldOutputTypeName),
      relayLikePaginationArgs.after(fieldOutputTypeName),
      relayLikePaginationArgs.skip(fieldOutputTypeName),
    )

    return args
  },
  resolve(args) {
    const { first, last, before, after, skip: originalSkip } = args

    if (!first && !last && !before && !after) {
      return args
    }

    const take = resolveTake(first, last)
    const cursor = resolveCursor(before, after)
    const skip = resolveSkip(originalSkip, cursor)

    delete args.first
    delete args.last
    delete args.before
    delete args.after

    const newArgs = {
      ...args,
      take,
      cursor,
      skip,
    }

    console.log('pagination args', newArgs)

    return newArgs
  },
}

function resolveSkip(skip: number | undefined, cursor: object | undefined) {
  if (!skip) {
    return undefined
  }

  if (cursor) {
    return skip + 1
  }

  return skip
}

function resolveTake(
  first: number | undefined,
  last: number | undefined,
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

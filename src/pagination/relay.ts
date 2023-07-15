import { PaginationStrategy } from '.'
import { Helpers as DMMFHelpers, InternalDMMF } from '../dmmf'
import { keys } from '../utils'

interface RelayPaginationArgs {
  first?: number
  last?: number
  before?: object
  after?: object
}

const relayPaginationArgsToDmmfArgs: Record<
  'first' | 'last' | 'before' | 'after',
  (typeName: string) => InternalDMMF.SchemaArg
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

export const relayStrategy: PaginationStrategy<RelayPaginationArgs> = {
  paginationArgNames: keys(relayPaginationArgsToDmmfArgs),
  transformDmmfArgs({ paginationArgNames, args, field }) {
    // todo why not using internal dmmf here?
    const fieldOutputTypeName = DMMFHelpers.getTypeName(field.outputType.type)

    // Remove old pagination args
    args = args.filter((dmmfArg) => !paginationArgNames.includes(dmmfArg.name))

    // Push new pagination args
    args.push(
      relayPaginationArgsToDmmfArgs.first(fieldOutputTypeName),
      relayPaginationArgsToDmmfArgs.last(fieldOutputTypeName),
      relayPaginationArgsToDmmfArgs.before(fieldOutputTypeName),
      relayPaginationArgsToDmmfArgs.after(fieldOutputTypeName)
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

    const take = resolveTake(first, last)
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
}

function resolveTake(first: number | undefined, last: number | undefined): number | undefined {
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

// cSpell:word DMMF
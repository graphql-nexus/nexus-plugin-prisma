import { DMMF } from '@prisma/client/runtime/library'
import { InternalDMMF } from '../dmmf'
import { prismaStrategy } from './prisma'
import { relayStrategy } from './relay'

interface NormalizedPaginationArgs {
  cursor?: object
  skip?: string | number
  take?: string | number
  orderBy?: { [x: string]: 'asc' | 'desc' }
  [x: string]: any
}

export interface PaginationStrategy<GraphQLPaginationArgs extends object = object> {
  paginationArgNames: (keyof GraphQLPaginationArgs)[]
  transformDmmfArgs(params: {
    args: InternalDMMF.SchemaArg[]
    paginationArgNames: string[]
    field: DMMF.SchemaField
  }): InternalDMMF.SchemaArg[]
  resolve(args: GraphQLPaginationArgs): NormalizedPaginationArgs
}

// todo remove, but TS error if we do, dont' understand the error message
interface PaginationStrategies {
  relay: typeof relayStrategy
  prisma: typeof prismaStrategy
}

export const paginationStrategies: PaginationStrategies = {
  relay: relayStrategy,
  prisma: prismaStrategy,
}

export type PaginationStrategyTypes = typeof relayStrategy | typeof prismaStrategy

// cSpell:word DMMF
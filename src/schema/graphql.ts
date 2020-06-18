//
// GraphQL root types data & helpers
//

export type RootName = 'Query' | 'Mutation' | 'Subscription'

export const rootNames = {
  Query: 'Query',
  Mutation: 'Mutation',
  Subscription: 'Subscription',
} as const

export const rootNameValues: RootName[] = Object.values(rootNames)

export const isRootName = (x: any): x is RootName => rootNameValues.includes(x)

//
// GraphQL scalar types data & helpers
//

export type ScalarName = 'Int' | 'Float' | 'String' | 'ID' | 'Boolean'

export const scalarsNameValues: ScalarName[] = ['Int', 'Float', 'String', 'ID', 'Boolean']

export const isScalarType = (name: string): boolean => scalarsNameValues.includes(name as any)

import * as Nexus from 'nexus'

export type GQL_SCALAR_NAME = 'Int' | 'Float' | 'String' | 'ID' | 'Boolean'

export const GQL_SCALARS_NAMES: GQL_SCALAR_NAME[] = [
  'Int',
  'Float',
  'String',
  'ID',
  'Boolean',
]

export const dateTimeScalar = Nexus.scalarType({
  name: 'DateTime',
  serialize: value => value,
})

export const uuidScalar = Nexus.scalarType({
  name: 'UUID',
  serialize: value => value,
})

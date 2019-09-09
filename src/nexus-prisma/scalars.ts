import { scalarType } from 'nexus'

export const GQL_SCALARS_NAMES = ['Int', 'Float', 'String', 'ID', 'Boolean']

export const dateTimeScalar = scalarType({
  name: 'DateTime',
  serialize(value) {
    return value
  },
})

export const uuidScalar = scalarType({
  name: 'UUID',
  serialize(value) {
    return value
  },
})

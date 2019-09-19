import * as Nexus from 'nexus'

export const dateTimeScalar = Nexus.scalarType({
  name: 'DateTime',
  serialize: value => value,
})

export const uuidScalar = Nexus.scalarType({
  name: 'UUID',
  serialize: value => value,
})

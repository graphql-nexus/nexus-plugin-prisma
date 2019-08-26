import { scalarType } from 'nexus';

export const GQL_SCALARS_NAMES = ['Int', 'Float', 'String', 'ID', 'Boolean'];

export const dateTimeScalar = scalarType({
  name: 'DateTime',
  asNexusMethod: 'date',
  description: 'DateTime',
  parseLiteral(value) {
    return value;
  },
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
});

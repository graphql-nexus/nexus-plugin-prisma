import { upperFirst } from '../utils';

export interface INamingStrategy {
  whereInput: (typeName: string, fieldName: string) => string;
  orderByInput: (typeName: string, fieldName: string) => string;
  relationFilterInput: (typeName: string, fieldName: string) => string;
}

export const defaultNamingStrategy: INamingStrategy = {
  whereInput(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}WhereInput`;
  },
  orderByInput(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}OrderByInput`;
  },
  relationFilterInput(typeName, fieldName) {
    return `${upperFirst(typeName)}${upperFirst(fieldName)}Filter`;
  }
};

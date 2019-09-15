/**
 * @type {jest.InitialOptions}
 */
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/__setup.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  globals: {
    'ts-jest': {
      tsConfig: 'tests/tsconfig.json',
    },
  },
}

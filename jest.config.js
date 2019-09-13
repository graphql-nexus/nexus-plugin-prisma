/**
 * @type {ts-jest/types.TsJestGlobalOptions} FIXME <-- make this work :(
 */
const tsJestConfig = {
  diagnostics: {
    warnOnly: !process.env.CI,
  },
}

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
    'ts-jest': tsJestConfig,
  },
}

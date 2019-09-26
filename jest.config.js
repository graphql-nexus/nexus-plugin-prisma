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
  // FIXME https://github.com/kulshekhar/ts-jest/issues/1240
  moduleFileExtensions: ['js', 'ts', 'd.ts'],
  globals: {
    'ts-jest': {
      diagnostics: {
        // During development, updating the integration test can require
        // allowing the app to enter an invalid type state until following
        // typegen.
        warnOnly: !process.env.CI,
      },
      tsConfig: 'tests/tsconfig.json',
    },
  },
}

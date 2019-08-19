/**
 * @type {jest.InitialOptions}
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: !process.env.CI
      }
    }
  }
};

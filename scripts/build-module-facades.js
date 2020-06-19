/**
 * Module Facades
 *
 * This script builds the modules that will be consumed publicly. They front
 * the actual code inside ./dist. The problem being solved here is that it
 * allows consumers to do e.g. this:
 *
 *    import { ... } from 'nexus-plugin-prisma/schema'
 *
 * Instead of:
 *
 *    import { ... } from 'nexus-plugin-prisma/dist/schema'
 *
 * Whatever modules are written here should be:
 *
 *    1. ignored in .gitignore.
 *    2. added to the package.json files array
 */

const fs = require('fs-jetpack')
const os = require('os')
const path = require('path')

// prettier-ignore
const facades = [
  ['client.d.ts',  "export * from '@prisma/client'"  + os.EOL],
  ['client.js',    "module.exports = require('@prisma/client')" + os.EOL],
  ['schema.d.ts',  "export * from './dist/schema-entrypoint'"  + os.EOL],
  ['schema.js',    "module.exports = require('./dist/schema-entrypoint')" + os.EOL],
  ['typegen.js',   "module.exports = require('./dist/schema/typegen/static')" + os.EOL],
  ['typegen.d.ts', "export * from './dist/schema/typegen/static'" + os.EOL],
]

// Write facade files

for (const facade of facades) {
  fs.write(facade[0], facade[1])
}

// Handle package.json files array

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = fs.read(packageJsonPath, 'json')

packageJson.files = [...new Set([...packageJson.files, ...facades.map((facade) => facade[0])])]

const packageJsonString = JSON.stringify(packageJson, null, 2) + os.EOL

fs.write(packageJsonPath, packageJsonString)

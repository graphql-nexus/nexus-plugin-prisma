const chalk = require('chalk')
const fs = require('fs-jetpack')
const path = require('path')

if (process.env.INIT_CWD) {
  // necessary, because npm chooses __dirname as process.cwd() in the postinstall hook
  process.chdir(process.env.INIT_CWD)
}

const pwd = process.cwd()
const nodeModulesFolder = path.join(pwd, 'node_modules')
const from = path.resolve(nodeModulesFolder, 'nexus-plugin-prisma/global-type.d.ts')

// Prevent from crashing if the typings can't be found for whatever reason
if (fs.exists(from)) {
  const destDir = path.resolve(nodeModulesFolder, '@types/nexus-plugin-prisma')

  fs.dir(destDir)
  fs.copy(from, path.join(destDir, 'index.d.ts'), { overwrite: true })
}

require('./prisma-deps-check')

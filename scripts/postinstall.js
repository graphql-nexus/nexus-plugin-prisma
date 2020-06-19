const chalk = require('chalk')
const jetpack = require('fs-jetpack')
const path = require('path')

if (process.env.INIT_CWD) {
  // necessary, because npm chooses __dirname as process.cwd() in the postinstall hook
  process.chdir(process.env.INIT_CWD)
}

const pwd = process.cwd()
const nodeModulesFolder = path.join(pwd, 'node_modules')
const from = path.resolve(nodeModulesFolder, 'nexus-plugin-prisma', 'global-type.d.ts')

if (jetpack.exists(from)) {
  const destDir = path.resolve(nodeModulesFolder, '@types', 'nexus-plugin-prisma')

  jetpack.dir(destDir)
  jetpack.copy(from, path.join(destDir, 'index.d.ts'), { overwrite: true })
}

console.log(chalk.bold.yellowBright('----------------------------------'))
console.log(
  chalk.bold.yellowBright(
    `If you want to learn more about the ${chalk.reset.greenBright(`\`nexus-plugin-prisma\``)}`
  )
)
console.log(
  chalk.bold.yellowBright(`Follow this link: ${chalk.reset.greenBright(`http://nxs.li/nexus-plugin-prisma`)}`)
)
console.log(chalk.bold.yellowBright('----------------------------------'))

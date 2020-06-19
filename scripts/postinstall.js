const chalk = require('chalk')
const jetpack = require('fs-jetpack')
const path = require('path')
// proccess.env.PWD is undifined on Windows https://github.com/mrblueblue/gettext-loader/issues/18
const pwd = process.cwd()
const destDir = path.join(pwd, '..', '@types', 'nexus-plugin-prisma')

jetpack.dir(destDir)
jetpack.copy(path.join(pwd, 'global-type.d.ts'), path.join(destDir, 'index.d.ts'), { overwrite: true })

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

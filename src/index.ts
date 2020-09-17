import chalk from 'chalk'

function ensureDepIsInstalled(depName: string) {
  try {
    require(depName)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.error(
        `${chalk.redBright('ERROR:')} ${chalk.greenBright(
          depName
        )} must be installed as a dependency. Please run \`${chalk.greenBright(`npm install ${depName}`)}\`.`
      )
      process.exit(1)
    } else {
      throw err
    }
  }
}

ensureDepIsInstalled('@nexus/schema')
ensureDepIsInstalled('graphql')
ensureDepIsInstalled('@prisma/client')

export * from './plugin'

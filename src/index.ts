import { colors } from './colors'

function ensureDepIsInstalled(depName: string) {
  try {
    require(depName)
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.error(
        `${colors.red('ERROR:')} ${colors.green(
          depName
        )} must be installed as a dependency. Please run \`${colors.green(`npm install ${depName}`)}\`.`
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
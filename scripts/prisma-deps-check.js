const boldWhite = '\u001b[37;1m'
const reset = '\u001b[0m'
const green = '\u001b[32;1m'
const purple = '\u001b[35;1m'
const CR = '\u001b[31;1m'
const blue = '\u001b[36;1m'
const red = '\u001b[1;31m'
const yellow = '\u001b[33;1m'
const gray = '\u001b[30;1m'

const path = require('path')

let foundPrismaDeps = []

const pj = getPackageJson()

const deps = pj.dependencies || []
foundPrismaDeps.push(...Object.keys(deps).filter(isPrismaDep))

const devDeps = pj.devDependencies || []
foundPrismaDeps.push(
  ...Object.keys(devDeps)
    .filter(isPrismaDep)
    // dedupe
    .filter((name) => !foundPrismaDeps.includes(name))
)

const message = `
${red}│${reset}  ${red}WARNING${reset} from ${boldWhite}nexus-plugin-prisma${reset}
${red}│${reset}  ${red}WARNING${reset} from ${boldWhite}nexus-plugin-prisma${reset}
${red}│${reset}  ${red}WARNING${reset} from ${boldWhite}nexus-plugin-prisma${reset}
${red}│${reset} 
${red}│${reset}  ${yellow}nexus-plugin-prisma${reset} bundles ${yellow}@prisma${reset} dependencies. So
${red}│${reset}  please uninstall the ones you have installed or you may
${red}│${reset}  encounter problems.
${red}│${reset}  
${red}│${reset}  Run the following command to fix this issue:
${red}│${reset} 
${red}│${reset}  ${green}${getPackageManagerBinName()} remove ${foundPrismaDeps.join(' ')}${reset}
${red}│${reset} 
${red}│${reset}  If you absolutely need to control the versions of your
${red}│${reset}  ${yellow}@prisma${reset} dependencies then use yarn and its ${yellow}resolutions${reset}
${red}│${reset}  feature:
${red}│${reset} 
${red}│${reset}  ${boldWhite}https://classic.yarnpkg.com/en/docs/selective-version-resolutions${reset}
${red}│${reset} 
${red}│${reset}  If you are curious why ${yellow}nexus-plugin-prisma${reset} bundles
${red}│${reset}  the ${yellow}@prisma${reset} dependencies then take a look at the Nexus
${red}│${reset}  doc explaining this strategy.
${red}│${reset} 
${red}│${reset}  ${boldWhite}https://nxs.li/why/bundle-dependencies${reset}
`

if (foundPrismaDeps.length > 0) console.log(message)

/**
 * Helpers
 */

function isPrismaDep(name) {
  return name.startsWith('@prisma/')
}

function getPackageManagerBinName() {
  const userAgent = process.env.npm_config_user_agent || ''

  const packageManagerBinName = userAgent.includes('yarn') ? 'yarn' : 'npm'
  return packageManagerBinName
}

function getPackageJson() {
  let data = {}
  try {
    data = require(path.join(process.cwd(), 'package.json'))
  } catch (error) {
    // ignore
  }

  if (typeof data !== 'object') {
    // invalid package json like null
    // force object for downstream property access
    data = {}
  }

  return data
}

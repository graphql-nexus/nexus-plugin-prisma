const semver = require('semver')
const packageJson = require('../package.json')

const prismaDeps = [
  ...Object.entries(packageJson.dependencies),
  ...Object.entries(packageJson.devDependencies),
].filter(([depName]) => depName.startsWith('@prisma/'))

const versionRange = packageJson.peerDependencies['@prisma/client']

const invalidDeps = prismaDeps.filter(([, version]) => semver.satisfies(version, versionRange) === false)

if (invalidDeps.length > 0) {
  console.log('Some of your prisma dependencies are not in sync. ', invalidDeps.join(', '))
  process.exit(1)
} else {
  console.log('All prisma deps are in sync')
}

function stripCaret(version) {
  if (version.startsWith('^')) {
    return version.substring(1)
  }

  return version
}

const packageJson = require('../package.json')

const prismaDeps = [
  ...Object.entries(packageJson.dependencies),
  ...Object.entries(packageJson.devDependencies),
  ...Object.entries(packageJson.peerDependencies),
].filter(([depName]) => depName.startsWith('@prisma/'))
const versionReference = stripCaret(prismaDeps[0][1])

const invalidDeps = prismaDeps.filter(([, version]) => stripCaret(version) !== versionReference)

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

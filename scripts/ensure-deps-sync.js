const packageJson = require('../package.json')

const prismaDeps = [
  ...Object.entries(packageJson.dependencies),
  ...Object.entries(packageJson.devDependencies),
].filter(([depName]) => depName.startsWith('@prisma/'))
const versionReference = prismaDeps[0][1]

const invalidDeps = prismaDeps.filter(([, version]) => version !== versionReference)

if (invalidDeps.length > 0) {
  console.log('Some of your prisma dependencies are not in sync. ', invalidDeps.join(', '))
  process.exit(1);
} else {
  console.log('All prisma deps are in sync')
}

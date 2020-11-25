const semver = require('semver')
const packageJson = require('../package.json')

const prismaDeps = [
  ...Object.entries(packageJson.dependencies),
  ...Object.entries(packageJson.devDependencies),
]
  .filter(([depName]) => depName.startsWith('@prisma/'))
  .filter(([depName]) => depName !== '@prisma/engines')

const validVersionRange = packageJson.peerDependencies['@prisma/client']

const invalidDeps = prismaDeps.filter(
  ([, prismaDepVersion]) => !semver.satisfies(prismaDepVersion, validVersionRange)
)

if (invalidDeps.length > 0) {
  console.log(
    `Some of your Prisma dependencies are not in sync with the supported version range ${validVersionRange}\n\n`,
    invalidDeps.map(([name, ver]) => `${name}@${ver}`).join(', ')
  )
  process.exit(1)
}

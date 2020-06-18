const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const prettier = require('prettier')

/**
 * Update the binary version hash based on @prisma/client version
 */
async function main() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json')
  const localPackageJson = require(packageJsonPath)
  const prismaClientVersion = localPackageJson.dependencies['@prisma/client']
  const prismaCLIPackageJson = await fetch(
    `https://unpkg.com/@prisma/cli@${prismaClientVersion}/package.json`
  )
  const hash = (await prismaCLIPackageJson.json()).prisma.version

  if (localPackageJson.prisma.version === hash) {
    return
  }

  console.log('Updated Prisma binary hash to:', hash)

  localPackageJson.prisma.version = hash

  const updatedPackageJson = prettier.format(JSON.stringify(localPackageJson), {
    parser: 'json-stringify',
    ...localPackageJson.prettier,
  })

  fs.writeFileSync(packageJsonPath, updatedPackageJson)
}

main().catch((e) => console.error(e))

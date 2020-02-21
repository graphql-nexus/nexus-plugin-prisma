/**
 * Update the binary version hash based on @prisma/client version
 */
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import prettier from 'prettier'
import manifest from '../package.json'

const prismaClientVersion = manifest.peerDependencies['@prisma/client']

fetch(`https://unpkg.com/prisma2@${prismaClientVersion}/package.json`)
  .then(result => result.json())
  .then(prisma2Package => {
    if (manifest.prisma.version === prisma2Package.prisma.version) {
      console.log(
        'Local binary pin is already in sync with @prisma/client version',
        prisma2Package.prisma.version,
      )
      return
    }

    console.log('Syncing local binary pin to:', prisma2Package.prisma.version)

    manifest.prisma.version = prisma2Package.prisma.version

    const updatedPackageJson = prettier.format(JSON.stringify(manifest), {
      parser: 'json-stringify',
      ...(manifest.prettier as any),
    })

    fs.writeFileSync(
      path.join(__dirname, '../package.json'),
      updatedPackageJson,
    )
  })
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

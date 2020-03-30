/**
 * Ensure the prisma2 and @prisma/client versions are in sync
 */

const manifest = require('../package.json')

const peerPrismaClientVersion = manifest.peerDependencies['@prisma/client']
const prisma2Version = manifest.devDependencies['@prisma/cli']

const devPrismaClientVersion = manifest.devDependencies['@prisma/client']

if (devPrismaClientVersion !== peerPrismaClientVersion) {
  throw new Error(
    'Your dev @prisma/client version must be equal to your peer @prisma/client version',
  )
}

if (peerPrismaClientVersion !== prisma2Version) {
  throw new Error(
    'Your @prisma/cli version must be equal to your @prisma/client version',
  )
}

console.log('Versions are all in sync.')

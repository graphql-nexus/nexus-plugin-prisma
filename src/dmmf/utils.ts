import { DMMF } from '@prisma/client/runtime'
import { colors } from '../colors'

export const getPhotonDmmf = (packagePath: string): DMMF.Document => {
  let dmmf: undefined | DMMF.Document = undefined

  try {
    dmmf = require(packagePath).dmmf
  } catch (error) {
    throw new Error(
      `Failed to import prisma client package at ${packagePath}. The following error occured while trying:
        ${error.stack}`,
    )
  }

  if (!dmmf) {
    throw new Error(`\
You most likely forgot to initialize the Prisma Client. Please run \`prisma2 generate\` and try to run it again.
If that does not solve your problem, please open an issue.`)
  }

  return dmmf
}

//TODO: Remove this code after a couple version. (Added on version `0.7.0-next.1`)
export function fatalIfOldPhotonIsInstalled(
  photonPackagePath: string,
): boolean {
  try {
    require(photonPackagePath)

    console.log(
      colors.red(
        'Error: `@prisma/photon` was renamed to `@prisma/client`. Please uninstall `@prisma/photon` and install `@prisma/client` instead',
      ),
    )
    console.log(
      colors.red(
        'Error: More information at https://github.com/prisma/prisma2/releases/tag/2.0.0-preview020',
      ),
    )
    process.exit(1)
  } catch {
    return false
  }
}

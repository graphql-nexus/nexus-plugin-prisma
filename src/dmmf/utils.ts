import { DMMF } from '@prisma/client/runtime'
import { colors } from '../colors'

export const getPhotonDmmf = (packagePath: string): DMMF.Document => {
  try {
    return require(packagePath).dmmf
  } catch (error) {
    throw new Error(
      `Failed to import photon package at ${packagePath}. The following error occured while trying:
        ${error.stack}`,
    )
  }
}

export function warnIfOldPhotonIsUsed(): boolean {
  try {
    require('@prisma/photon')

    console.log(
      colors.yellow(
        'Warning: `@prisma/photon` was renamed to `@prisma/client`. Please use `@prisma/client` instead',
      ),
    )
    console.log(
      colors.yellow(
        'Warning: More information at https://github.com/prisma/prisma2/releases/tag/2.0.0-preview020',
      ),
    )
    return true
  } catch {
    return false
  }
}

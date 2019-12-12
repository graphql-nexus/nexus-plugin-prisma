import { DMMF } from '@prisma/photon/runtime'

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

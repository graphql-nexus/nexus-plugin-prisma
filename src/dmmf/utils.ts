import * as Photon from '@prisma/photon'
import { transform } from './transformer'
import { DMMFClass } from './DMMFClass'

export function fromPhotonDMMF(photonDMMF: Photon.DMMF.Document): DMMFClass {
  return new DMMFClass(transform(photonDMMF))
}

export const get = (photonClientPackagePath: string): DMMFClass => {
  let photonClientPackage
  try {
    photonClientPackage = require(photonClientPackagePath)
  } catch (error) {
    throw new Error(
      `Failed to import photon package at ${photonClientPackagePath}. The following error occured while trying:

        ${error.stack}`,
    )
  }
  return fromPhotonDMMF(photonClientPackage.dmmf)
}

import * as Photon from '@prisma/photon'
import { transform, TransformOptions } from './transformer'
import { DMMFClass } from './DMMFClass'

export function fromPhotonDMMF(
  photonDMMF: Photon.DMMF.Document,
  options?: TransformOptions,
): DMMFClass {
  return new DMMFClass(transform(photonDMMF, options))
}

export const get = (
  photonClientPackagePath: string,
  options?: TransformOptions,
): DMMFClass => {
  let photonClientPackage
  try {
    photonClientPackage = require(photonClientPackagePath)
  } catch (error) {
    throw new Error(
      `Failed to import photon package at ${photonClientPackagePath}. The following error occured while trying:

        ${error.stack}`,
    )
  }
  return fromPhotonDMMF(photonClientPackage.dmmf, options)
}

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
      `Could not find photon package at ${photonClientPackagePath}. Check that you have configured your Photon generator block in schema.prisma correctly and run prisma generate.`,
    )
  }
  return fromPhotonDMMF(photonClientPackage.dmmf, options)
}

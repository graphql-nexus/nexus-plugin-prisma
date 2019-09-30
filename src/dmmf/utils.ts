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
      `Could not find photon package at ${photonClientPackagePath}. Check that you have configured your Photon generator block in schema.prisma correctly and run prisma generate.`,
    )
  }
  return fromPhotonDMMF(photonClientPackage.dmmf)
}

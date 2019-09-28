import { transform } from './transformer'
import { DMMFClass } from './DMMFClass'

export const get = (photonPackagePath: string): DMMFClass => {
  let Photon
  try {
    Photon = require(photonPackagePath)
  } catch (error) {
    throw new Error(
      `Could not find photon package at ${photonPackagePath}. Check that you have configured your Photon generator block in schema.prisma correctly and run prisma generate.`,
    )
  }
  const nexusPrismaDMMF = transform(Photon.dmmf)
  return new DMMFClass(nexusPrismaDMMF)
}

import * as Photon from '@prisma/photon'
import { transform, ExternalDMMF } from './transformer'
import { DMMFClass } from './DMMFClass'

export type DmmfDocumentTransform = (
  document: ExternalDMMF.Document,
) => ExternalDMMF.Document

export type GetDmmfClassOptions = {
  transform?: DmmfDocumentTransform
}

export function fromPhotonDMMF(
  photonDMMF: Photon.DMMF.Document,
  options?: GetDmmfClassOptions,
): DMMFClass {
  const document =
    options && options.transform
      ? options.transform(transform(photonDMMF))
      : transform(photonDMMF)
  return new DMMFClass(document)
}

export const get = (
  photonClientPackagePath: string,
  options?: GetDmmfClassOptions,
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

import { getDMMF } from '@prisma/photon'
import * as Nexus from 'nexus'
import { SchemaBuilder } from '../src/builder'
import * as DMMF from '../src/dmmf'
import { render as renderTypegen } from '../src/typegen'
import { printSchema } from 'graphql'

export async function generateSchemaAndTypes(datamodel: string, types: any) {
  const dmmf = DMMF.fromPhotonDMMF(await getDMMF({ datamodel }))

  const nexusPrisma = new SchemaBuilder({
    types,
    dmmf,
  }).build()

  const schema = Nexus.makeSchema({
    types: [types, nexusPrisma],
    outputs: false,
  })

  const typegen = renderTypegen(dmmf, '@generated/photon')

  return { schema: printSchema(schema), typegen }
}

export async function generateSchemaAndTypesWithoutThrowing(
  datamodel: string,
  types: any,
) {
  const dmmf = DMMF.fromPhotonDMMF(await getDMMF({ datamodel }))
  const nexusPrisma = new SchemaBuilder({
    types,
    dmmf,
  }).build()
  const schemaAndMissingTypes = Nexus.core.makeSchemaInternal({
    types: [types, nexusPrisma],
    outputs: false,
  })
  const typegen = renderTypegen(dmmf, '@generated/photon')

  return {
    schema: printSchema(schemaAndMissingTypes.schema),
    missingTypes: schemaAndMissingTypes.missingTypes,
    typegen,
  }
}

import * as Photon from '@prisma/photon'
import * as GQL from 'graphql'
import * as Nexus from 'nexus'
import * as NexusPrismaBuilder from '../src/builder'
import * as DMMF from '../src/dmmf'
import { render as renderTypegen } from '../src/typegen'

export const createNexusPrismaInternal = (
  options: Omit<NexusPrismaBuilder.InternalOptions, 'nexusBuilder'>,
) =>
  Nexus.createPlugin({
    name: 'nexus-prisma-internal',
    onInstall: nexusBuilder => ({
      types: NexusPrismaBuilder.build({ ...options, nexusBuilder }),
    }),
  })

export async function generateSchemaAndTypes(datamodel: string, types: any[]) {
  const dmmf = DMMF.fromPhotonDMMF(await Photon.getDMMF({ datamodel }))
  const nexusPrisma = createNexusPrismaInternal({
    dmmf,
    types,
  })
  const schema = Nexus.makeSchema({
    types,
    plugins: [nexusPrisma],
    shouldGenerateArtifacts: false,
  })

  return {
    schema: GQL.printSchema(schema),
    typegen: renderTypegen(dmmf, '@generated/photon'),
  }
}

export async function generateSchemaAndTypesWithoutThrowing(
  datamodel: string,
  types: any,
) {
  const dmmf = DMMF.fromPhotonDMMF(await Photon.getDMMF({ datamodel }))
  const nexusPrisma = new NexusPrismaBuilder.SchemaBuilder({
    nexusBuilder: { hasType: () => false },
    types,
    dmmf,
  }).build()
  const schemaAndMissingTypes = Nexus.core.makeSchemaInternal({
    types: [types, nexusPrisma],
    outputs: {
      schema: false,
      typegen: false,
    },
  })
  const typegen = renderTypegen(dmmf, '@generated/photon')

  return {
    schema: GQL.printSchema(schemaAndMissingTypes.schema),
    missingTypes: schemaAndMissingTypes.missingTypes,
    typegen,
  }
}

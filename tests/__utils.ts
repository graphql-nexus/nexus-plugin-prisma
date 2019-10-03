import * as Photon from '@prisma/photon'
import * as GQL from 'graphql'
import * as Nexus from 'nexus'
import * as NexusPrismaBuilder from '../src/builder'
import * as DMMF from '../src/dmmf'
import { render as renderTypegen } from '../src/typegen'
import { NexusAcceptedTypeDef } from 'nexus/dist/core'

export const createNexusPrismaInternal = (
  options: Omit<NexusPrismaBuilder.InternalOptions, 'nexusBuilder'>,
): Nexus.Plugin => ({
  onInstall: nexusBuilder => ({
    types: NexusPrismaBuilder.build({ ...options, nexusBuilder }),
  }),
})

export async function generateSchemaAndTypes(
  datamodel: string,
  types: NexusAcceptedTypeDef[],
) {
  const dmmf = DMMF.fromPhotonDMMF(await Photon.getDMMF({ datamodel }))
  const nexusPrisma = createNexusPrismaInternal({
    dmmf,
    shouldGenerateArtifacts: false,
  })
  const schema = Nexus.makeSchema({
    types,
    plugins: [nexusPrisma],
    outputs: false,
  })

  return {
    schema: GQL.printSchema(schema),
    typegen: renderTypegen(dmmf, '@generated/photon'),
  }
}

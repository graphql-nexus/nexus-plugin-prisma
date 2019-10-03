import { getDMMF } from '@prisma/photon'
import * as GQL from 'graphql'
import * as Nexus from 'nexus'
import * as NexusPrisma from '../src'
import * as DMMF from '../src/dmmf'
import { render as renderTypegen } from '../src/typegen'

export async function generateSchemaAndTypes(datamodel: string, types: any) {
  const dmmf = DMMF.fromPhotonDMMF(await getDMMF({ datamodel }))
  const nexusPrisma = NexusPrisma.create({
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

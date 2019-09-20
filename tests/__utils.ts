import { getDMMF } from '@prisma/photon'
import { makeSchema } from 'nexus'
import { SchemaBuilder } from '../src/builder'
import * as DMMF from '../src/dmmf'
import { render as renderTypegen } from '../src/typegen'
import { printSchema } from 'graphql'

export async function generateSchemaAndTypes(datamodel: string, types: any) {
  const dmmf = await getDMMF({ datamodel })
  const transformedDmmf = DMMF.transform(dmmf)
  const dmmfClass = new DMMF.DMMF(transformedDmmf)

  const nexusPrisma = new SchemaBuilder({
    photon: (ctx: any) => ctx.photon,
    types,
    dmmf: dmmfClass,
  }).build()

  const schema = makeSchema({
    types: [types, nexusPrisma],
    outputs: false,
  })

  const typegen = renderTypegen(dmmfClass, '@generated/photon')

  return { schema: printSchema(schema), typegen }
}

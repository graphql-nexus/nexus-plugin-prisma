import * as Photon from '@prisma/photon/runtime'
import * as GQL from 'graphql'
import * as Nexus from 'nexus'
import * as NexusPrismaBuilder from '../src/builder'
import { DmmfDocument } from '../src/dmmf'
import { render as renderTypegen } from '../src/typegen'
import stripAnsi from 'strip-ansi'
import { TransformOptions, transform } from '../src/dmmf/transformer'

export const createNexusPrismaInternal = (
  options: Omit<NexusPrismaBuilder.InternalOptions, 'nexusBuilder'>,
) =>
  Nexus.createPlugin({
    name: 'nexus-prisma-internal',
    onInstall: nexusBuilder => ({
      types: NexusPrismaBuilder.build({ ...options, nexusBuilder }),
    }),
  })

export async function getDmmf(datamodel: string, options?: TransformOptions) {
  return new DmmfDocument(
    transform(await Photon.getDMMF({ datamodel }), options),
  )
}

export async function generateSchemaAndTypes(
  datamodel: string,
  types: any[],
  options?: TransformOptions,
) {
  const dmmf = await getDmmf(datamodel, options)
  const nexusPrisma = createNexusPrismaInternal({
    dmmf,
  })
  const schema = Nexus.makeSchema({
    types,
    plugins: [nexusPrisma],
    outputs: false,
  })

  return {
    schema: GQL.printSchema(schema),
    typegen: renderTypegen(dmmf, '@prisma/photon'),
  }
}

export async function generateSchemaAndTypesWithoutThrowing(
  datamodel: string,
  types: any[],
  options?: TransformOptions,
) {
  const dmmf = await getDmmf(datamodel, options)
  const nexusPrisma = new NexusPrismaBuilder.SchemaBuilder({
    nexusBuilder: {
      addType: () => false,
      hasType: () => false,
      getConfigOption: () => undefined,
      hasConfigOption: () => false,
      setConfigOption: () => false,
    },
    dmmf,
  }).build()
  const schemaAndMissingTypes = Nexus.core.makeSchemaInternal({
    types: [types, nexusPrisma],
    outputs: false,
  })
  const typegen = renderTypegen(dmmf, '@prisma/photon')

  return {
    schema: GQL.printSchema(schemaAndMissingTypes.schema),
    missingTypes: schemaAndMissingTypes.missingTypes,
    typegen,
  }
}

export async function mockConsoleLog(
  func: (...args: any) => any | Promise<any>,
) {
  const oldLog = console.log
  let outputData = ''
  const storeLog = (inputs: string) => (outputData += '\n' + inputs)

  console.log = jest.fn(storeLog)
  await func()
  console.log = oldLog

  return stripAnsi(outputData)
}

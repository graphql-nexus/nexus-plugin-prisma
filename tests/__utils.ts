const PrismaClientGenerator = require('@prisma/client/generator-build')
import * as SDK from '@prisma/sdk'
import * as GQL from 'graphql'
import * as Nexus from 'nexus'
import stripAnsi from 'strip-ansi'
import * as NexusPrismaBuilder from '../src/builder'
import { DmmfDocument } from '../src/dmmf'
import { transform, TransformOptions } from '../src/dmmf/transformer'
import { render as renderTypegen } from '../src/typegen'
import { getQueryEnginePath } from './__ensure-engine'

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
    transform(
      await PrismaClientGenerator.getDMMF({
        datamodel,
        prismaPath: await getQueryEnginePath(),
      }),
      options,
    ),
  )
}

export async function getPinnedDmmfFromSchemaPath(datamodelPath: string) {
  return SDK.getDMMF({
    datamodelPath,
    prismaPath: await getQueryEnginePath(),
  })
}

export async function getPinnedDmmfFromSchema(datamodel: string) {
  return SDK.getDMMF({
    datamodel,
    prismaPath: await getQueryEnginePath(),
  })
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
    schemaString: GQL.printSchema(schema),
    schema,
    typegen: renderTypegen(dmmf, '@prisma/client'),
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
  const typegen = renderTypegen(dmmf, '@prisma/client')

  return {
    schema: GQL.printSchema(schemaAndMissingTypes.schema),
    missingTypes: schemaAndMissingTypes.missingTypes,
    typegen,
  }
}

type UnPromisify<T> = T extends Promise<infer U> ? U : T

export async function mockConsoleLog<T extends (...args: any) => any>(
  func: T,
): Promise<{ $output: string } & UnPromisify<ReturnType<T>>> {
  const oldLog = console.log
  let outputData = ''
  const storeLog = (inputs: string) => (outputData += '\n' + inputs)

  console.log = jest.fn(storeLog)
  const ret = await func()
  console.log = oldLog

  return {
    ...ret,
    $output: stripAnsi(outputData),
  }
}

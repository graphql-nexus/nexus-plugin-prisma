import * as PrismaClientGenerator from '@prisma/client/generator-build'
import * as GQL from 'graphql'
import * as Nexus from 'nexus'
import stripAnsi from 'strip-ansi'
import * as NexusPrismaBuilder from '../src/builder'
import { DmmfDocument } from '../src/dmmf'
import { transform } from '../src/dmmf/transformer'
import { render as renderTypegen } from '../src/typegen'
import { queryType, mutationType, objectType } from 'nexus'

type CreateNexusPrismaInternalOptions = Omit<
  NexusPrismaBuilder.InternalOptions,
  'nexusBuilder'
>

export const createNexusPrismaInternal = (
  options: CreateNexusPrismaInternalOptions,
) =>
  Nexus.createPlugin({
    name: 'nexus-prisma-internal',
    onInstall: nexusBuilder => ({
      types: NexusPrismaBuilder.build({ ...options, nexusBuilder }),
    }),
  })

export async function getDmmf(datamodel: string) {
  return new DmmfDocument(
    transform(
      await PrismaClientGenerator.getDMMF({
        datamodel,
        // prismaPath: Path.join(
        //   __dirname,
        //   '../node_modules/@prisma/client/runtime/query-engine-darwin',
        // ),
      }),
    ),
  )
}

export async function generateSchemaAndTypes(
  datamodel: string,
  types: any[],
  options?: CreateNexusPrismaInternalOptions,
) {
  const dmmf = await getDmmf(datamodel)
  const nexusPrisma = createNexusPrismaInternal({
    dmmf,
    ...options,
  })
  const schema = Nexus.makeSchema({
    types,
    plugins: [nexusPrisma],
    outputs: false,
  })

  return {
    dmmf,
    schema,
    schemaString: GQL.printSchema(schema),
    // Only check generated portion of types to prevent tests from breaking on unrelated changes
    typegen: renderTypegen(dmmf, '@prisma/client').split('// Generated')[1],
  }
}

export async function generateSchemaAndTypesWithoutThrowing(
  datamodel: string,
  types: any[],
) {
  const dmmf = await getDmmf(datamodel)
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

export const defaultDataModel = `
model User {
  id  Int @id @default(autoincrement())
  name String
  nested Nested[]
  createdWithBrowser String
}

model Nested {
  id Int @id @default(autoincrement())
  name String
  createdWithBrowser String
}
`

export const defaultDefinitions = {
  query: queryType({
    definition(t: any) {
      t.crud.user()
    },
  }),
  mutation: mutationType({
    definition(t: any) {
      t.crud.createOneUser()
      t.crud.createOneNested()
    },
  }),
  user: objectType({
    name: 'User',
    definition: (t: any) => {
      t.model.id()
      t.model.name()
      t.model.nested()
      t.model.createdWithBrowser()
    },
  }),
  nested: objectType({
    name: 'Nested',
    definition: (t: any) => {
      t.model.id()
      t.model.createdWithBrowser()
      t.model.name()
    },
  }),
}

export const defaultDefinitionValues = Object.values(defaultDefinitions)

type GetTestDataOptions = {
  dataModel?: string
  definitions?: Record<string, any>
  pluginOptions?: CreateNexusPrismaInternalOptions
}

export const getTestData = async (options?: GetTestDataOptions) => {
  const {
    dataModel = defaultDataModel,
    definitions = defaultDefinitions,
    pluginOptions,
  } = options ?? {}
  const builderHook = {} as { builder: NexusPrismaBuilder.SchemaBuilder }
  const { dmmf, schema, typegen } = await generateSchemaAndTypes(
    dataModel,
    Object.values(definitions),
    { builderHook, ...pluginOptions },
  )
  const { publisher } = builderHook.builder
  return {
    dmmf,
    schema,
    typegen,
    publisher,
  }
}

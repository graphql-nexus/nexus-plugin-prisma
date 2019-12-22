import { makeSchema, queryType, mutationType, objectType } from 'nexus'
import {
  getDmmf,
  generateSchemaAndTypes,
  createNexusPrismaInternal,
} from './__utils'
import { printSchema } from 'graphql'
import { transformArgs } from '../src/dmmf/transformer'
import { Publisher } from '../src/publisher'
import { SchemaBuilder } from '../src/builder'

const fakeNexusBuilder: any = {
  hasType: (_: string) => false,
}

const getTestData = async () => {
  const testData = {
    dataModel: `
  model User {
    id  Int @id
    name String
    nested Nested[]
  }

  model Nested {
    id Int @id
    name String
  }
`,
    resolvers: {
      query: queryType({
        definition(t: any) {
          t.crud.user()
        },
      }),
      mutation: mutationType({
        definition(t: any) {
          t.crud.createOneUser({
            upfilteredKey: 'create',
          })
        },
      }),
      user: objectType({
        name: 'User',
        definition: (t: any) => {
          t.model.id()
          t.model.name()
          t.model.nested()
        },
      }),
      nested: objectType({
        name: 'Nested',
        definition: (t: any) => {
          t.model.id()
          t.model.name()
        },
      }),
    },
  }
  const dmmf = await getDmmf(testData.dataModel)
  const builderHook = {} as { builder: SchemaBuilder }
  const nexusPrisma = createNexusPrismaInternal({
    dmmf,
    builderHook,
  })
  const schema = printSchema(
    makeSchema({
      types: Object.values(testData.resolvers),
      plugins: [nexusPrisma],
      outputs: false,
    }),
  )
  const { publisher } = builderHook.builder
  return {
    ...testData,
    schema,
    publisher,
    globallyComputedInputs: {},
    locallyComputedInputs: {},
  }
}

describe('upfilteredKeys', () => {
  it('generates new types without upfilteredKeys', async () => {
    const { schema } = await getTestData()
    expect(schema).toMatchSnapshot('upfilteredKeys')
  })
  it('replaces upfilteredKeys at runtime', async () => {
    const {
      publisher,
      globallyComputedInputs,
      locallyComputedInputs,
    } = await getTestData()
    expect(
      transformArgs({
        params: {
          root: null,
          args: {
            data: { name: 'New User', nested: [{ name: 'New Nested' }] },
          },
          ctx: {},
        },
        inputType: publisher.getInputType('UserCreateCreateOnlyInput'),
        publisher,
        locallyComputedInputs,
        globallyComputedInputs,
      }),
    ).toStrictEqual({
      data: {
        name: 'New User',
        nested: { create: [{ name: 'New Nested' }] },
      },
    })
  })
})
// TODO: Add more complex tests for nested types

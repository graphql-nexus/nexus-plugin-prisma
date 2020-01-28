import * as Nexus from 'nexus'
import { getDmmf, generateSchemaAndTypes } from '../__utils'
import { transformArgs } from '../../src/dmmf/transformer'
import { ComputedInputs } from '../../src/utils'
import { Publisher } from '../../src/publisher'

const fakeNexusBuilder: any = {
  hasType: (_: string) => false,
}

const getGlobalTestData = async (pluginLevelComputedInputs: ComputedInputs) => {
  const testData = {
    dataModel: `
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
`,
    resolvers: {
      query: Nexus.queryType({
        definition(t: any) {
          t.crud.user()
        },
      }),
      mutation: Nexus.mutationType({
        definition(t: any) {
          t.crud.createOneUser()
          t.crud.createOneNested()
        },
      }),
      user: Nexus.objectType({
        name: 'User',
        definition: (t: any) => {
          t.model.id()
          t.model.name()
          t.model.nested()
          t.model.createdWithBrowser()
        },
      }),
      nested: Nexus.objectType({
        name: 'Nested',
        definition: (t: any) => {
          t.model.id()
          t.model.createdWithBrowser()
          t.model.name()
        },
      }),
    },
  }
  const dmmf = await getDmmf(testData.dataModel, {
    computedInputs: pluginLevelComputedInputs,
  })
  return {
    ...testData,
    publisher: new Publisher(dmmf, fakeNexusBuilder),
    computedInputs: {},
    relations: {
      create: {},
      connect: {},
      defaultRelation: 'unset' as const,
    },
  }
}

describe('pluginComputedInputs', () => {
  it('removes global computedInputs from all input types', async () => {
    const { dataModel, resolvers, computedInputs } = await getGlobalTestData({
      createdWithBrowser: ({ ctx }) => ctx.browser,
    })
    const result = await generateSchemaAndTypes(
      dataModel,
      Object.values(resolvers),
      {
        computedInputs,
      },
    )
    expect(result).toMatchSnapshot('globallyComputedInputs')
  })

  it('values are inferred at runtime', async () => {
    const { computedInputs, publisher, relations } = await getGlobalTestData({
      createdWithBrowser: ({ ctx }) => ctx.browser,
    })
    expect(
      transformArgs({
        params: {
          info: {} as any,
          args: {
            data: {
              name: 'New User',
              nested: { create: { name: 'Nested Name' } },
            },
          },
          ctx: { browser: 'firefox' },
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        computedInputs,
        relations,
      }),
    ).toStrictEqual({
      data: {
        name: 'New User',
        createdWithBrowser: 'firefox',
        nested: {
          create: { createdWithBrowser: 'firefox', name: 'Nested Name' },
        },
      },
    })
  })

  it('handles arrays when recursing for computedInputs', async () => {
    const { computedInputs, publisher, relations } = await getGlobalTestData({
      createdWithBrowser: ({ ctx }) => ctx.browser,
    })
    expect(
      transformArgs({
        params: {
          info: {} as any,
          args: {
            data: {
              name: 'New User',
              nested: {
                create: [{ name: 'Nested Name' }, { name: 'Nested Name' }],
              },
            },
          },
          ctx: { browser: 'firefox' },
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        computedInputs,
        relations,
      }),
    ).toStrictEqual({
      data: {
        name: 'New User',
        createdWithBrowser: 'firefox',
        nested: {
          create: [
            { createdWithBrowser: 'firefox', name: 'Nested Name' },
            { createdWithBrowser: 'firefox', name: 'Nested Name' },
          ],
        },
      },
    })
  })
})

describe('globalComputedInputs', () => {
  it('can use a combination of root, args, and context to compute values', async () => {
    const { computedInputs, publisher, relations } = await getGlobalTestData({
      // Nonsense example, but ensures args, ctx and info values are being passed everywhere :)
      createdWithBrowser: ({ args, ctx, info }) =>
        `${ctx.browser.slice(1, 2)} ${info} ${
          (args.data as any).nested.create.name
        }`,
    })
    expect(
      transformArgs({
        params: {
          // Normally this would be GraphQLResolveInfo but using a string for simplicity
          info: 'Yam' as any,
          args: { data: { nested: { create: { name: 'Sam' } } } },
          ctx: { browser: 'firefox' },
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        locallyComputedInputs: ({
          name: ({ args, ctx, info }) =>
            `${args.data.nested.create.name} ${ctx.browser.slice(
              1,
              2,
            )} ${info}`,
        } as ComputedInputs,
        computedInputs,
        relations,
      }),
    ).toStrictEqual({
      data: {
        name: 'Sam i Yam',
        createdWithBrowser: 'i Yam Sam',
        nested: {
          create: { createdWithBrowser: 'i Yam Sam', name: 'Sam' },
        },
      },
    })
  })
})

import * as Nexus from 'nexus'
import { getDmmf, generateSchemaAndTypes } from './__utils'
import { transformArgs } from '../src/dmmf/transformer'
import { ComputedInputs } from '../src/utils'
import { Publisher } from '../src/publisher'

const fakeNexusBuilder: any = {
  hasType: (_: string) => false,
}

const getLocalTestData = async () => {
  const testData = {
    dataModel: `
  model User {
    id  Int @id
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
          t.crud.createOneUser({
            computedInputs: {
              createdWithBrowser: ({ ctx }) => ctx.browser,
            } as ComputedInputs,
          })
        },
      }),
      user: Nexus.objectType({
        name: 'User',
        definition: (t: any) => {
          t.model.id()
          t.model.name()
          t.model.createdWithBrowser()
        },
      }),
    },
  }
  const dmmf = await getDmmf(testData.dataModel)
  return {
    ...testData,
    publisher: new Publisher(dmmf, fakeNexusBuilder),
    globallyComputedInputs: {},
  }
}

const getGlobalTestData = async (globallyComputedInputs: ComputedInputs) => {
  const testData = {
    dataModel: `
  model User {
    id  Int @id
    name String
    nested Nested[]
    createdWithBrowser String
  }

  model Nested {
    id Int @id
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
  const dmmf = await getDmmf(testData.dataModel, { globallyComputedInputs })
  return {
    ...testData,
    publisher: new Publisher(dmmf, fakeNexusBuilder),
    locallyComputedInputs: {},
    globallyComputedInputs,
  }
}

describe('locallyComputedInputs', () => {
  it('are removed from their corresponding input type', async () => {
    const { dataModel, resolvers } = await getLocalTestData()
    const result = await generateSchemaAndTypes(
      dataModel,
      Object.values(resolvers),
    )
    expect(result).toMatchSnapshot('locallyComputedInputs')
  })
  it('values are inferred at runtime', async () => {
    const { publisher, globallyComputedInputs } = await getLocalTestData()
    expect(
      transformArgs({
        params: {
          root: null,
          args: { data: { name: 'New User' } },
          ctx: { browser: 'firefox' },
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        locallyComputedInputs: {
          createdWithBrowser: ({ ctx }) => ctx.browser,
        },
        globallyComputedInputs,
      }),
    ).toStrictEqual({
      data: { name: 'New User', createdWithBrowser: 'firefox' },
    })
  })
})

describe('globallyComputedInputs', () => {
  it('removes global computedInputs from all input types', async () => {
    const {
      dataModel,
      resolvers,
      globallyComputedInputs,
    } = await getGlobalTestData({
      createdWithBrowser: ({ ctx }) => ctx.browser,
    })
    const result = await generateSchemaAndTypes(
      dataModel,
      Object.values(resolvers),
      {
        globallyComputedInputs,
      },
    )
    expect(result).toMatchSnapshot('globallyComputedInputs')
  })

  it('values are inferred at runtime', async () => {
    const {
      globallyComputedInputs,
      publisher,
      locallyComputedInputs,
    } = await getGlobalTestData({
      createdWithBrowser: ({ ctx }) => ctx.browser,
    })
    expect(
      transformArgs({
        params: {
          root: null,
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
        locallyComputedInputs,
        globallyComputedInputs,
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
    const {
      globallyComputedInputs,
      publisher,
      locallyComputedInputs,
    } = await getGlobalTestData({
      createdWithBrowser: ({ ctx }) => ctx.browser,
    })
    expect(
      transformArgs({
        params: {
          root: null,
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
        locallyComputedInputs,
        globallyComputedInputs,
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

describe('combination of locallyComputedInputs and globallyComputedInputs', () => {
  it('can combine resolver-level (shallow) and global (deep) computed inputs', async () => {
    const { globallyComputedInputs, publisher } = await getGlobalTestData({
      createdWithBrowser: ({ ctx }) => ctx.browser,
    })
    expect(
      transformArgs({
        params: {
          root: null,
          // name should be required when creating Nested since the computedInput providing
          // it is specific to UserCreateInput and therefore shallow
          args: { data: { nested: { create: { name: 'Nested Name' } } } },
          ctx: { browser: 'firefox', name: 'autopopulated' },
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        // These are applied only to UserCreateInput
        locallyComputedInputs: { name: ({ ctx }) => ctx.name },
        globallyComputedInputs,
      }),
    ).toStrictEqual({
      data: {
        name: 'autopopulated',
        createdWithBrowser: 'firefox',
        nested: {
          create: { createdWithBrowser: 'firefox', name: 'Nested Name' },
        },
      },
    })
  })

  it('can use a combination of root, args, and context to compute values', async () => {
    const { globallyComputedInputs, publisher } = await getGlobalTestData({
      // Nonsense example, but ensures root, args and ctx values are being passed everywhere :)
      createdWithBrowser: ({ root, args, ctx }) =>
        `${ctx.browser.slice(1, 2)} ${root} ${args.data.nested.create.name}`,
    })
    expect(
      transformArgs({
        params: {
          root: 'Yam',
          args: { data: { nested: { create: { name: 'Sam' } } } },
          ctx: { browser: 'firefox' },
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        locallyComputedInputs: {
          name: ({ root, args, ctx }) =>
            `${args.data.nested.create.name} ${ctx.browser.slice(
              1,
              2,
            )} ${root}`,
        },
        globallyComputedInputs,
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

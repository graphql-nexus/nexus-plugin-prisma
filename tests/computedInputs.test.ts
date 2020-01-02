import * as Nexus from 'nexus'
import { getDmmf, generateSchemaAndTypes } from './__utils'

// TODO: Split local and global computedInputs into their own suites

const resolverTestData = {
  datamodel: `
  model User {
    id  Int @id @default(autoincrement())
    name String
    createdWithBrowser String
  }
`,
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
        } as GlobalComputedInputs,
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
}

const globalTestData = {
  datamodel: `
  model User {
    id  Int @id @default(autoincrement())
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
}

it('removes resolver-level computedInputs from the corresponding input type', async () => {
  const { datamodel, ...resolvers } = resolverTestData
  const result = await generateSchemaAndTypes(
    datamodel,
    Object.values(resolvers),
  )

  expect(result).toMatchSnapshot('locallyComputedInputs')
})

import { addComputedInputs } from '../src/dmmf/transformer'
import { GlobalComputedInputs } from '../src/utils'

it('infers the value of resolver-level computedInputs at runtime', async () => {
  const { datamodel } = resolverTestData
  const dmmf = await getDmmf(datamodel)
  expect(
    addComputedInputs({
      params: {
        info: {} as any,
        args: { data: { name: 'New User' } },
        ctx: { browser: 'firefox' },
      },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      locallyComputedInputs: {
        createdWithBrowser: ({ ctx }) => ctx.browser,
      },
    }),
  ).toStrictEqual({ data: { name: 'New User', createdWithBrowser: 'firefox' } })
})

it('removes global computedInputs from all input types', async () => {
  const { datamodel, ...resolvers } = globalTestData
  const result = await generateSchemaAndTypes(
    datamodel,
    Object.values(resolvers),
    {
      globallyComputedInputs: { createdWithBrowser: ({ ctx }) => ctx.browser },
    },
  )

  expect(result).toMatchSnapshot('globallyComputedInputs')
})

it('infers the value of global computedInputs at runtime', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    globallyComputedInputs: { createdWithBrowser: ({ ctx }) => ctx.browser },
  })
  expect(
    addComputedInputs({
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
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      locallyComputedInputs: {},
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
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    globallyComputedInputs: { createdWithBrowser: ({ ctx }) => ctx.browser },
  })

  expect(
    addComputedInputs({
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
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      locallyComputedInputs: {},
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

it('can combine resolver-level (shallow) and global (deep) computed inputs', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    // These are applied globally
    globallyComputedInputs: { createdWithBrowser: ({ ctx }) => ctx.browser },
  })
  expect(
    addComputedInputs({
      params: {
        info: {} as any,
        // name should be required when creating Nested since the computedInput providing
        // it is specific to UserCreateInput and therefore shallow
        args: { data: { nested: { create: { name: 'Nested Name' } } } },
        ctx: { browser: 'firefox', name: 'autopopulated' },
      },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      // These are applied only to UserCreateInput
      locallyComputedInputs: { name: ({ ctx }) => ctx.name },
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

it('can use a combination of args, context and info to compute values', async () => {
  const { datamodel } = globalTestData
  // Nonsense example, but ensures args, ctx and info values are being passed everywhere :)
  const dmmf = await getDmmf(datamodel, {
    globallyComputedInputs: {
      createdWithBrowser: ({ args, ctx, info }) =>
        `${ctx.browser.slice(1, 2)} ${info} ${
          (args.data as any).nested.create.name
        }`,
    },
  })
  expect(
    addComputedInputs({
      params: {
        // Normally this would be GraphQLResolveInfo but using a string for simplicity
        info: 'Yam' as any,
        args: { data: { nested: { create: { name: 'Sam' } } } },
        ctx: { browser: 'firefox' },
      },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      locallyComputedInputs: {
        name: ({ args, ctx, info }) =>
          `${args.data.nested.create.name} ${ctx.browser.slice(1, 2)} ${info}`,
      },
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

import * as Nexus from 'nexus'
import {
  generateSchemaAndTypesWithoutThrowing,
  getDmmf,
  generateSchemaAndTypes,
} from './__utils'

const resolverTestData = {
  datamodel: `
  model User {
    id  Int @id
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
        contextArgs: {
          createdWithBrowser: (ctx: any) => ctx.browser,
        },
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

it('removes resolver-level contextArgs from the corresponding input type', async () => {
  const { datamodel, ...resolvers } = resolverTestData
  const result = await generateSchemaAndTypes(
    datamodel,
    Object.values(resolvers),
  )

  expect(result).toMatchSnapshot('resolverContextArgs')
})

import { addContextArgs } from '../src/dmmf/transformer'

it('infers the value of resolver-level contextArgs at runtime', async () => {
  const { datamodel } = resolverTestData
  const dmmf = await getDmmf(datamodel)
  expect(
    addContextArgs({
      baseArgs: { data: { name: 'New User' } },
      ctx: { browser: 'firefox' },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      contextArgs: {
        createdWithBrowser: (ctx: any) => ctx.browser,
      },
    }),
  ).toStrictEqual({ data: { name: 'New User', createdWithBrowser: 'firefox' } })
})

it('removes global contextArg fields from all input types', async () => {
  const { datamodel, ...resolvers } = globalTestData
  const result = await generateSchemaAndTypes(
    datamodel,
    Object.values(resolvers),
    {
      contextArgs: { createdWithBrowser: (ctx: any) => ctx.browser },
    },
  )

  expect(result).toMatchSnapshot('globalContextArgs')
})

it('infers the value of global contextArgs at runtime', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    contextArgs: { createdWithBrowser: (ctx: any) => ctx.browser },
  })
  expect(
    addContextArgs({
      baseArgs: {
        data: { name: 'New User', nested: { create: { name: 'Nested Name' } } },
      },
      ctx: { browser: 'firefox' },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      contextArgs: {},
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

it('handles arrays when recursing for contextArgs', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    contextArgs: { createdWithBrowser: (ctx: any) => ctx.browser },
  })
  expect(
    addContextArgs({
      baseArgs: {
        data: {
          name: 'New User',
          nested: {
            create: [{ name: 'Nested Name' }, { name: 'Nested Name' }],
          },
        },
      },
      ctx: { browser: 'firefox' },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      contextArgs: {},
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

it('can combine resolver-level (shallow) and global (deep) context args', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    // These are applied globally
    contextArgs: { createdWithBrowser: (ctx: any) => ctx.browser },
  })
  expect(
    addContextArgs({
      // name should be required when creating Nested since the contextArg providing
      // it is specific to UserCreateInput and therefore shallow
      baseArgs: { data: { nested: { create: { name: 'Nested Name' } } } },
      ctx: { browser: 'firefox', name: 'autopopulated' },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      // These are applied only to UserCreateInput
      contextArgs: { name: ctx => ctx.name },
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

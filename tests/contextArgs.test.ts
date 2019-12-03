import * as Nexus from 'nexus'
import { generateSchemaAndTypesWithoutThrowing } from './__utils'

const resolverTestData = {
  datamodel: `
  model User {
    id  Int @id
    name String
    browser String
  }
`,
  query: Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.user()
    },
  }),
  mutation: Nexus.objectType({
    name: 'Mutation',
    definition(t: any) {
      t.crud.createOneUser({
        contextArgs: { browser: (ctx: any) => ctx.browser },
      })
    },
  }),
  user: Nexus.objectType({
    name: 'User',
    definition: (t: any) => {
      t.model.id()
      t.model.name()
      t.model.browser()
    },
  }),
}

it('removes resolver-level contextArgs from the corresponding input type', async () => {
  const { datamodel, ...resolvers } = resolverTestData
  const result = await generateSchemaAndTypesWithoutThrowing(
    datamodel,
    Object.values(resolvers),
  )

  expect(result).toMatchSnapshot('resolverContextArgs')
})

it('infers the value of resolver-level contextArgs at runtime', () => {})

const globalTestData = {
  datamodel: `
  model User {
    id  Int @id
    name String
    nested Nested[]
    browser String
  }

  model Nested {
    id Int @id
    browser String
  }
`,
  query: Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.user()
    },
  }),
  mutation: Nexus.objectType({
    name: 'Mutation',
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
      t.model.browser()
    },
  }),
  nested: Nexus.objectType({
    name: 'Nested',
    definition: (t: any) => {
      t.model.id()
      t.model.browser()
    },
  }),
}

it('removes global contextArg fields from all input types', async () => {
  const { datamodel, ...resolvers } = resolverTestData
  const result = await generateSchemaAndTypesWithoutThrowing(
    datamodel,
    Object.values(resolvers),
    { contextArgs: { browser: (ctx: any) => ctx.browser } },
  )

  expect(result).toMatchSnapshot('globalContextArgs')
})

it('infers the value of resolver-level contextArgs at runtime', async () => {})

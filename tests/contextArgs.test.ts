import * as Nexus from 'nexus'
import { generateSchemaAndTypesWithoutThrowing, getDmmf } from './__utils'

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

it('removes resolver-level contextArgs from the corresponding input type', async () => {
  const { datamodel, ...resolvers } = resolverTestData
  const result = await generateSchemaAndTypesWithoutThrowing(
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
      contextArgs: { browser: (ctx: any) => ctx.browser },
    }),
  ).toStrictEqual({ data: { name: 'New User', browser: 'firefox' } })
})

it('removes global contextArg fields from all input types', async () => {
  const { datamodel, ...resolvers } = globalTestData
  const result = await generateSchemaAndTypesWithoutThrowing(
    datamodel,
    Object.values(resolvers),
    { contextArgs: { browser: (ctx: any) => ctx.browser } },
  )

  expect(result).toMatchSnapshot('globalContextArgs')
})

it('infers the value of global contextArgs at runtime', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    contextArgs: { browser: (ctx: any) => ctx.browser },
  })
  expect(
    addContextArgs({
      baseArgs: { data: { name: 'New User', nested: { create: {} } } },
      ctx: { browser: 'firefox' },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      contextArgs: {},
    }),
  ).toStrictEqual({
    data: {
      name: 'New User',
      browser: 'firefox',
      nested: { create: { browser: 'firefox' } },
    },
  })
})

it('handles arrays when recursing for contextArgs', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    contextArgs: { browser: (ctx: any) => ctx.browser },
  })
  expect(
    addContextArgs({
      baseArgs: { data: { name: 'New User', nested: { create: [{}, {}] } } },
      ctx: { browser: 'firefox' },
      inputType: dmmf.getInputType('UserCreateInput'),
      dmmf,
      contextArgs: {},
    }),
  ).toStrictEqual({
    data: {
      name: 'New User',
      browser: 'firefox',
      nested: { create: [{ browser: 'firefox' }, { browser: 'firefox' }] },
    },
  })
})

it('Works on Redo', async () => {
  const dmmf = await getDmmf(
    `model Tag {
  id   Int    @id
  user User
  name String
  @@unique([name, user])
}

model Selector {
  id   Int    @id
  user User
  css  String
}

model Step {
  id       Int      @id
  user     User
  action   String
  selector Selector
  value    String
}

model Test {
  id    Int    @id
  user  User
  name  String
  steps Step[]
  tags  Tag[]
  @@unique([name, user])
}

model User {
  id       Int    @id
  email    String @unique
  password String
  first    String
  last     String
}`,
    { contextArgs: { user: (ctx: any) => ({ connect: { id: ctx.userId } }) } },
  )
  expect(
    addContextArgs({
      baseArgs: {
        data: {
          name: 'Test 1',
          steps: { create: [{ action: 'click', value: 'something' }] },
        },
      },
      ctx: { userId: 1 },
      inputType: dmmf.getInputType('TestCreateInput'),
      dmmf,
      contextArgs: {},
    }),
  ).toStrictEqual({
    data: {
      name: 'Test 1',
      steps: {
        create: [
          { action: 'click', value: 'something', user: { connect: { id: 1 } } },
        ],
      },
      user: { connect: { id: 1 } },
    },
  })
})

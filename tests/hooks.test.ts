import { objectType } from 'nexus'
import { generateSchemaAndTypes, mockConsoleLog } from './__utils'

it('in dev stage, warns when wrong projected field or crud', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
  model User {
    id  Int @id
    username String
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.userName() // wrong projected field
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.userss({ filtering: true }) // wrong crud field
    },
  })

  const outputData = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [Query, User])
  })

  expect(outputData).toMatchInlineSnapshot(`
    "
    Warning: Your GraphQL \`Query\` object definition is attempting to expose a Prisma model field called \`userss\`, but your Prisma model \`Query\` has no such field

    Warning: Your GraphQL \`User\` object definition is attempting to expose a Prisma model field called \`userName\`, but your Prisma model \`User\` has no such field
    "
  `)
})

it('in undefined stages, warns when wrong projected field or crud', async () => {
  delete process.env.NODE_ENV

  const datamodel = `
  model User {
    id  Int @id
    username String
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.userName() // wrong projected field
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.userss({ filtering: true }) // wrong crud field
    },
  })

  const outputData = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [Query, User])
  })

  expect(outputData).toMatchInlineSnapshot(`
    "
    Warning: Your GraphQL \`Query\` object definition is attempting to expose a Prisma model field called \`userss\`, but your Prisma model \`Query\` has no such field

    Warning: Your GraphQL \`User\` object definition is attempting to expose a Prisma model field called \`userName\`, but your Prisma model \`User\` has no such field
    "
  `)
})

it('in other stages, throws error when wrong projected field or crud', async () => {
  process.env.NODE_ENV = 'production'

  const datamodel = `
  model User {
    id  Int @id
    username String
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.userName() // wrong projected field
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.userss({ filtering: true }) // wrong crud field
    },
  })

  try {
    await generateSchemaAndTypes(datamodel, [Query, User])
  } catch (e) {
    expect(e).toMatchInlineSnapshot(
      `[TypeError: t.crud.userss is not a function]`,
    )
  }
})

it('in production, throws if a wrong arg named is passed to filtering', async () => {
  process.env.NODE_ENV = 'production'

  const datamodel = `
  model User {
    id  Int @id
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ filtering: { unknownField: true } })
    },
  })

  try {
    await generateSchemaAndTypes(datamodel, [Query, User])
  } catch (e) {
    expect(e).toMatchInlineSnapshot(
      `[Error: Your GraphQL \`Query\` object definition is projecting a relational field \`users\`. On it, you are declaring that clients be able to filter by Prisma \`User\` model field \`unknownField\`. However, your Prisma model \`User\` model has no such field \`unknownField\`]`,
    )
  }
})

it('in dev stage, warns if a wrong arg named is passed to filtering', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
  model User {
    id  Int @id
    name String
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ filtering: { unknownField: true } })
    },
  })

  const outputData = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [Query, User])
  })

  expect(outputData).toMatchInlineSnapshot(`
    "
    Warning: Your GraphQL \`Query\` object definition is projecting a relational field \`users\`. On it, you are declaring that clients be able to filter by Prisma \`User\` model field \`unknownField\`. However, your Prisma model \`User\` model has no such field \`unknownField\`
    "
  `)
})

it('in production, throws if a wrong arg named is passed to ordering', async () => {
  process.env.NODE_ENV = 'production'

  const datamodel = `
  model User {
    id  Int @id
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ ordering: { unknownField: true } })
    },
  })

  try {
    await generateSchemaAndTypes(datamodel, [Query, User])
  } catch (e) {
    expect(e).toMatchInlineSnapshot(
      `[Error: Your GraphQL \`Query\` object definition is projecting a relational field \`users\`. On it, you are declaring that clients be able to order by Prisma \`User\` model field \`unknownField\`. However, your Prisma model \`User\` model has no such field \`unknownField\`]`,
    )
  }
})

it('in dev stage, warns if a wrong arg named is passed to ordering', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
  model User {
    id  Int @id
    name String
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ ordering: { unknownField: true } })
    },
  })

  const outputData = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [Query, User])
  })

  expect(outputData).toMatchInlineSnapshot(`
    "
    Warning: Your GraphQL \`Query\` object definition is projecting a relational field \`users\`. On it, you are declaring that clients be able to order by Prisma \`User\` model field \`unknownField\`. However, your Prisma model \`User\` model has no such field \`unknownField\`
    "
  `)
})

import { objectType } from '@nexus/schema'
import { generateSchemaAndTypes, mockConsoleLog } from '../__utils'

it('in dev stage, warns when wrong projected field or crud', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
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

  const { $output } = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [Query, User])
  })

  expect($output).toMatchInlineSnapshot(`
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
    id  Int @id @default(autoincrement())
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

  const { $output } = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [Query, User])
  })

  expect($output).toMatchInlineSnapshot(`
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
    id  Int @id @default(autoincrement())
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
    expect(e).toMatchInlineSnapshot(`[TypeError: t.crud.userss is not a function]`)
  }
})

it('in production, throws if a wrong arg named is passed to filtering', async () => {
  process.env.NODE_ENV = 'production'

  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
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
      `[Error: Your GraphQL \`Query\` object definition is projecting a relational field \`users\`. On it, you are declaring that clients be able to filter by Prisma \`User\` model field \`unknownField\`. However, your Prisma model \`User\` model has no such field \`unknownField\`]`
    )
  }
})

it('in dev stage, warns if a wrong arg named is passed to filtering', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
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

  const { $output } = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [Query, User])
  })

  expect($output).toMatchInlineSnapshot(`
    "
    Warning: Your GraphQL \`Query\` object definition is projecting a relational field \`users\`. On it, you are declaring that clients be able to filter by Prisma \`User\` model field \`unknownField\`. However, your Prisma model \`User\` model has no such field \`unknownField\`
    "
  `)
})

it('in production, throws if a wrong arg named is passed to ordering', async () => {
  process.env.NODE_ENV = 'production'

  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
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
      `[Error: Your GraphQL \`Query\` object definition is projecting a relational field \`users\`. On it, you are declaring that clients be able to order by Prisma \`User\` model field \`unknownField\`. However, your Prisma model \`User\` model has no such field \`unknownField\`]`
    )
  }
})

it('in dev stage, warns if a wrong arg named is passed to ordering', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
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

  const { $output } = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [Query, User])
  })

  expect($output).toMatchInlineSnapshot(`
    "
    Warning: Your GraphQL \`Query\` object definition is projecting a relational field \`users\`. On it, you are declaring that clients be able to order by Prisma \`User\` model field \`unknownField\`. However, your Prisma model \`User\` model has no such field \`unknownField\`
    "
  `)
})

it('in dev stage, warns if a graphql typename does not map to a prisma name but t.model.field() was used', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
  model User {
    id   Int @id @default(autoincrement())
    name String
    age  Int
  }
`

  const User = objectType({
    name: 'GraphQLTypeNameNotMappingToAPrismaModelName',
    definition(t: any) {
      t.model.id()
      t.model.name()
      t.model.age()
    },
  })

  const { schemaString: schema, $output } = await mockConsoleLog(() =>
    generateSchemaAndTypes(datamodel, [User])
  )

  expect(schema).toMatchInlineSnapshot(`
    "type GraphQLTypeNameNotMappingToAPrismaModelName

    type Query {
      ok: Boolean!
    }
    "
  `)
  expect($output).toMatchInlineSnapshot(`
    "
    Warning: Your GraphQL \`GraphQLTypeNameNotMappingToAPrismaModelName\` object definition is attempting to expose some Prisma model fields named \`\\"id\\", \\"name\\", \\"age\\"\`, but there is no such Prisma model called \`GraphQLTypeNameNotMappingToAPrismaModelName\`
    Warning: If this is not intentional, make sure you don't have a typo in your GraphQL type name \`GraphQLTypeNameNotMappingToAPrismaModelName\`
    Warning: If this is intentional, pass the mapped Prisma model name as parameter like so \`t.model('<PrismaModelName>').<FieldName>()\`
    "
  `)
})

it('in prod stage, throw error if a graphql typename does not map to a prisma name but t.model.field() was used', async () => {
  process.env.NODE_ENV = 'production'

  const datamodel = `
  model User {
    id   Int @id @default(autoincrement())
    name String
    age  Int
  }
`

  const User = objectType({
    name: 'GraphQLTypeNameNotMappingToAPrismaModelName',
    definition(t: any) {
      t.model.id()
      t.model.name()
      t.model.age()
    },
  })

  try {
    const { schemaString: schema } = await generateSchemaAndTypes(datamodel, [User])

    expect(schema).toMatchInlineSnapshot()
  } catch (e) {
    expect(e.message).toMatchInlineSnapshot(`
      "Your GraphQL \`GraphQLTypeNameNotMappingToAPrismaModelName\` object definition is attempting to expose some Prisma model fields named \`\\"id\\", \\"name\\", \\"age\\"\`, but there is no such Prisma model called \`GraphQLTypeNameNotMappingToAPrismaModelName\`
      If this is not intentional, make sure you don't have a typo in your GraphQL type name \`GraphQLTypeNameNotMappingToAPrismaModelName\`
      If this is intentional, pass the mapped Prisma model name as parameter like so \`t.model('<PrismaModelName>').<FieldName>()\`"
    `)
  }
})

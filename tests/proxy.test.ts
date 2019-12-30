import { objectType } from 'nexus'
import { generateSchemaAndTypes, mockConsoleLog } from './__utils'

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
    id  Int @id @default(autoincrement())
    username String
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
      t.crud.wrongCrudField({ filtering: true })
    },
  })

  try {
    await generateSchemaAndTypes(datamodel, [Query, User])
  } catch (e) {
    expect(e.message).toMatchInlineSnapshot(
      `"t.crud.wrongCrudField is not a function"`,
    )
  }
})

it('in dev stage, warns when typename does not match prisma model name', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
    name String
  }
`

  const User = objectType({
    name: 'WrongTypeName',
    definition(t: any) {
      t.model.id()
      t.model.name()
    },
  })

  const outputData = await mockConsoleLog(async () => {
    await generateSchemaAndTypes(datamodel, [User])
  })

  expect(outputData).toMatchInlineSnapshot(`
    "
    Warning: Your GraphQL \`WrongTypeName\` object definition is attempting to expose some Prisma model fields named \`\\"id\\", \\"name\\"\`, but there is no such Prisma model called \`WrongTypeName\`
    Warning: If this is not intentional, make sure you don't have a typo in your GraphQL type name \`WrongTypeName\`
    Warning: If this is intentional, pass the mapped Prisma model name as parameter like so \`t.model('<PrismaModelName>').<FieldName>()\`
    "
  `)
})

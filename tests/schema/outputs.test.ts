import * as Nexus from 'nexus'
import { generateSchemaAndTypes } from '../__utils'

it('only publishes output types that do not map to prisma models', async () => {
  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
    name String
  }
`
  const Query = Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.user()
    },
  })

  const Mutation = Nexus.objectType({
    name: 'Mutation',
    definition(t: any) {
      t.crud.updateManyUser({ filtering: true })
    },
  })

  try {
    await generateSchemaAndTypes(datamodel, [Query, Mutation])
  } catch (e) {
    expect(e).toMatchInlineSnapshot(
      `[RangeError: Maximum call stack size exceeded]`,
    )
  }
})

it('publishes scalars from input types', async () => {
  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
    date DateTime
  }
  `

  const User = Nexus.objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const Query = Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ filtering: true })
    },
  })

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [
    Query,
    User,
  ])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

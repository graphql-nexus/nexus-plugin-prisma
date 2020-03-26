import { enumType, inputObjectType, objectType } from '@nexus/schema'
import { generateSchemaAndTypes } from '../__utils'

it('publishes enum even as output type', async () => {
  const datamodel = `
    model User {
      id  Int @id @default(autoincrement())
      favouriteColor  Color
    }

    enum Color {
      Red
      Green
      Blue
    }
  `

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.favouriteColor()
    },
  })

  const {
    schemaString: schema,
    typegen,
  } = await generateSchemaAndTypes(datamodel, [User])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

it('does not publish enum twice (from input/output type)', async () => {
  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
    favouriteColor  Color
  }

  enum Color {
    Red
    Green
    Blue
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.favouriteColor()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ filtering: true })
    },
  })

  const {
    schemaString: schema,
    typegen,
  } = await generateSchemaAndTypes(datamodel, [Query, User])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

it('does not automatically publish input/enum type if already created by user', async () => {
  const datamodel = `
  model User {
    id  Int @id @default(autoincrement())
    favouriteColor  Color
  }

  enum Color {
    Red
    Green
    Blue
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.favouriteColor()
    },
  })

  const Color = enumType({
    name: 'Color',
    members: ['Something', 'Else'],
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ filtering: true })
    },
  })

  const UserWhereInput = inputObjectType({
    name: 'UserWhereInput',
    definition(t) {
      t.string('customField')
    },
  })

  const {
    schemaString: schema,
    typegen,
  } = await generateSchemaAndTypes(datamodel, [
    Query,
    User,
    Color,
    UserWhereInput,
  ])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

import * as Nexus from '@nexus/schema'
import { generateSchemaAndTypes } from '../__utils'

it('only publishes output types that do not map to prisma models', async () => {
  const datamodel = `
datasource db {
  provider = "postgresql"
  url      = "postgresql://"
}

model User {
  id  Int @id @default(autoincrement())
  name String
}
`
  const Query = Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.findOneUser()
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
      `[Error: Your GraphQL \`Query\` object definition is projecting a field \`user\` with \`User\` as output type, but \`User\` is not defined in your GraphQL Schema]`
    )
  }
})

it('publishes scalars from input types', async () => {
  const datamodel = `
datasource db {
  provider = "postgresql"
  url      = "postgresql://"
}

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
      t.crud.findManyUser({ filtering: true })
    },
  })

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [Query, User])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

import { objectType } from '@nexus/schema'
import { generateSchemaAndTypes, getDmmf } from '../__utils'
import paginationStrategies from '../../src/pagination'

it('support relay pagination (default)', async () => {
  const datamodel = `
  model User {
    id Int @id @default(autoincrement())
    posts  Post[]
  }

  model Post {
    id Int @id @default(autoincrement())
    title String
    author  User @relation(fields: [authorId], references: [id])
    authorId Int
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.posts({
        pagination: true,
      })
    },
  })

  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
      t.model.title()
    },
  })

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [User, Post])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

it('support native pagination', async () => {
  const datamodel = `
  model User {
    id Int @id @default(autoincrement())
    posts  Post[]
  }

  model Post {
    id Int @id @default(autoincrement())
    title String
    author User @relation(fields: [authorId], references: [id])
    authorId Int
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.posts({
        pagination: true,
      })
    },
  })

  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
      t.model.title()
    },
  })

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [User, Post], {
    paginationType: 'native',
    paginationStrategy: paginationStrategies.native,
  })

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

import { objectType } from 'nexus'
import { paginationStrategies } from '../../src/pagination'
import { generateSchemaAndTypes } from '../__utils'

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

it('support prisma pagination', async () => {
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
    paginationType: 'prisma',
    paginationStrategy: paginationStrategies.prisma,
  })

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

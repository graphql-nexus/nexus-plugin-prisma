import { objectType } from '@nexus/schema'
import { createRuntimeTestContext } from '../__client-test-context'

let ctx = createRuntimeTestContext()

it('supports @id fields named "id"', async () => {
  const datamodel = `
  model User {
    id    Int    @default(autoincrement()) @id
    posts Post[]
  }
  
  model Post {
    id     Int    @default(autoincrement()) @id
    title  String
    userId Int
    user   User   @relation(fields: [userId], references: [id])
  }
`
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.posts()
    },
  })

  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
      t.model.title()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users()
    },
  })

  const { graphqlClient, dbClient } = await ctx.getContext({
    datamodel,
    types: [Query, User, Post],
  })

  await dbClient.user.create({
    data: {
      posts: {
        create: [
          {
            title: 'post_a',
          },
          {
            title: 'post_b',
          },
        ],
      },
    },
  })

  const result = await graphqlClient.request(`{
  users {
    id
    posts {
      id
      title          
    }
  }
}`)

  expect(result).toMatchInlineSnapshot(`
    Object {
      "users": Array [
        Object {
          "id": 1,
          "posts": Array [
            Object {
              "id": 1,
              "title": "post_a",
            },
            Object {
              "id": 2,
              "title": "post_b",
            },
          ],
        },
      ],
    }
  `)
})

it('supports @id fields with custom name', async () => {
  const datamodel = `
    model User {
      custom_id  Int @id @default(autoincrement())
      posts Post[]
    }

    model Post {
      custom_id  Int @id @default(autoincrement())
      title      String
      userId     Int
      user       User   @relation(fields: [userId], references: [custom_id])
    }
  `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.custom_id()
      t.model.posts()
    },
  })

  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.custom_id()
      t.model.title()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users()
    },
  })

  const { graphqlClient, dbClient } = await ctx.getContext({
    datamodel,
    types: [Query, User, Post],
  })

  await dbClient.user.create({
    data: {
      posts: {
        create: [
          {
            title: 'post_a',
          },
          {
            title: 'post_b',
          },
        ],
      },
    },
  })

  const result = await graphqlClient.request(`{
    users {
      custom_id
      posts {
        custom_id
        title          
      }
    }
  }`)

  expect(result).toMatchInlineSnapshot(`
    Object {
      "users": Array [
        Object {
          "custom_id": 1,
          "posts": Array [
            Object {
              "custom_id": 1,
              "title": "post_a",
            },
            Object {
              "custom_id": 2,
              "title": "post_b",
            },
          ],
        },
      ],
    }
  `)
})

it('supports camel-cased model name', async () => {
  const datamodel = `
    model CamelCasedModel {
      id  Int @id @default(autoincrement())
      camelCasedField String
    }
  `
  const CamelCasedModel = objectType({
    name: 'CamelCasedModel',
    definition(t: any) {
      t.model.id()
      t.model.camelCasedField()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.camelCasedModels()
    },
  })

  const { graphqlClient, dbClient } = await ctx.getContext({
    datamodel,
    types: [Query, CamelCasedModel],
  })

  await dbClient.camelCasedModel.create({
    data: {
      camelCasedField: 'something',
    },
  })

  const result = await graphqlClient.request(`{
    camelCasedModels {
      camelCasedField
    }
  }`)

  expect(result).toMatchInlineSnapshot(`
Object {
  "camelCasedModels": Array [
    Object {
      "camelCasedField": "something",
    },
  ],
}
`)
})

import { objectType } from 'nexus'
import { createRuntimeTestContext } from './__client-test-context'

let ctx = createRuntimeTestContext()

it('supports @id fields with custom name', async () => {
  const datamodel = `
    model User {
      custom_id  Int @id @default(autoincrement())
      posts Post[]
    }

    model Post {
      custom_id  Int @id @default(autoincrement())
      title String
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

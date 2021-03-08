import * as Nexus from 'nexus'
import { generateSchemaAndTypes } from '../__utils'

it('forwards description & deprecation on all field types', async () => {
  const datamodel = `
    model User {
      id  Int @id @default(autoincrement())

      name String
      emailConfirmed Boolean
      birthYear Int
      heightM Float

      favouriteColor  Color

      latestPostId Int?
      latestPost Post?  @relation("latestPost", fields: [latestPostId], references: [id])
      posts Post[] @relation("posts")
    }

    enum Color {
      Red
      Green
      Blue
    }

    model Post {
      id  Int @id @default(autoincrement())
      title String
      body String
      userId Int
      user User @relation("posts", fields: [userId], references: [id])
      latestPostUsers User[] @relation("latestPost")
    }
  `

  const Post = Nexus.objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
    },
  })

  const User = Nexus.objectType({
    name: 'User',
    definition(t: any) {
      t.model.id({ description: 'The unique id', deprecation: 'never' })
      t.model.name({ description: "The user's full name", deprecation: 'who needs names' })
      t.model.heightM({ description: "The user's height, in meters", deprecation: "size doesn't matter" })
      t.model.favouriteColor({ description: "The user's favorite color", deprecation: 'no longer required' })
      t.model.posts({ description: "All the user's blog posts", deprecation: 'no more blog' })
      t.model.latestPost({ description: "The user's last blog post", deprecation: 'not here anymore' })
    },
  })

  const { schemaString: schema } = await generateSchemaAndTypes(datamodel, [User, Post])

  expect(schema).toMatchSnapshot('commonFieldsOutput')
})

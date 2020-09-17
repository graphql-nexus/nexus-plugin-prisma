import { fieldAuthorizePlugin, objectType } from '@nexus/schema'
import { createRuntimeTestContext } from '../__client-test-context'

let ctx = createRuntimeTestContext()

it('forwards plugins to t.model', async () => {
  const datamodel = `
    model User {
      id    Int     @id @default(autoincrement())
      name  String
    }
  `
  const types = [
    objectType({
      name: 'User',
      definition(t: any) {
        t.model.id({
          authorize() {
            return new Error('nope')
          },
        })
      },
    }),
    objectType({
      name: 'Query',
      definition(t: any) {
        t.crud.users()
      },
    }),
  ]

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types,
    plugins: [fieldAuthorizePlugin()],
  })

  await dbClient.user.create({
    data: {
      name: 'Foo',
    },
  })

  try {
    await graphqlClient.request(`{
      users {
        id
      }
    }`)
  } catch (e) {
    expect(e).toMatchSnapshot()
  }
})

it('forwards plugins to t.crud', async () => {
  const datamodel = `
    model User {
      id    Int     @id @default(autoincrement())
      name  String
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
      t.crud.users({
        authorize() {
          return new Error('nope')
        },
      })
    },
  })

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types: [Query, User],
    plugins: [fieldAuthorizePlugin()],
  })

  await dbClient.user.create({
    data: {
      name: 'Foo',
    },
  })

  try {
    await graphqlClient.request(`{
      users {
        id
      }
    }`)
  } catch (e) {
    expect(e).toMatchSnapshot()
  }
})

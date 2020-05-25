import { objectType } from '@nexus/schema'
import { createRuntimeTestContext } from '../__client-test-context'

let ctx = createRuntimeTestContext()

it('supports crud middleware', async () => {
  const datamodel = `
    model User {
      id    Int    @default(autoincrement()) @id
    }
  `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const before = jest.fn()
  const after = jest.fn()

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({
        middleware: async (
          _r: unknown,
          _a: unknown,
          _c: unknown,
          _i: unknown,
          next: () => Promise<any>,
        ) => {
          before()
          const res = [...(await next()), { id: 2 }]
          after()
          return res
        },
      })
    },
  })

  const { graphqlClient, dbClient } = await ctx.getContext({
    datamodel,
    types: [Query, User],
  })
  await dbClient.user.create()

  const result = await graphqlClient.request(`{
    users {
      id
    }
  }`)

  expect(before).toBeCalled()
  expect(after).toBeCalled()
  expect(result).toMatchInlineSnapshot(`
    Object {
      "users": Array [
        Object {
          "id": 1,
        },
        Object {
          "id": 2,
        },
      ],
    }
  `)
})

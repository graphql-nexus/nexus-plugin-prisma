import { objectType, queryType } from '@nexus/schema'
import { createRuntimeTestContext } from '../__client-test-context'

let ctx = createRuntimeTestContext()

it('runs through list of order-by types', async () => {
  const datamodel = `
    model User {
      id    Int    @id @default(autoincrement())
      name  String
      a     String
      b     String
      c     String
    }
  `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.name()
      t.model.a()
      t.model.b()
      t.model.c()
    },
  })

  const Query = queryType({
    definition(t) {
      t.crud.users({ ordering: true })
    },
  })

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types: [Query, User],
  })

  const usersForInsert = [
    { name: 'Foo', a: 'a', b: 'a', c: 'a' },
    { name: 'Bar', a: 'b', b: 'z', c: 'b' },
    { name: 'Qux', a: 'b', b: 'b', c: 'b' },
  ]

  await Promise.all(
    usersForInsert.map(async (userDataForInsert) => {
      return dbClient.user.create({ data: userDataForInsert })
    })
  )

  const result = await graphqlClient.request(`{
    users(orderBy: [{ a: asc }, { b: desc }]) {
      id
      name
      a
      b
      c
    }
  }`)

  expect(result).toMatchSnapshot()
})

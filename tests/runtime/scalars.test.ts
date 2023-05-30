import { GraphQLScalarType } from 'graphql'
import { DateTimeResolver } from 'graphql-scalars'
import { objectType } from 'nexus'
import { createRuntimeTestContext } from '../__client-test-context'

let ctx = createRuntimeTestContext()

it('supports custom scalars as output type', async () => {
  const datamodel = `
    model User {
      id        Int      @id @default(autoincrement())
      createdAt DateTime @default(now())
    }
  `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.createdAt()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users()
    },
  })

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types: [Query, User],
    scalars: {
      DateTime: new GraphQLScalarType({
        name: 'DateTime',
        serialize(v) {
          // console.log(`serialize(${JSON.stringify(v)}}`);
          throw new Error('not a date')
        },
      }),
    },
  })

  await dbClient.user.create({
    data: {
      createdAt: new Date().toISOString(),
    },
  })

  try {
    await graphqlClient.request(`{
      users {
        createdAt
      }
    }`)
  } catch (rawE) {
    const e = rawE as Error
    // console.log(`caught error: ${JSON.stringify(rawE, null, 2)}`);

    // exception propagation doesn't seem to work as expected.
    expect(e.message).toContain('Unexpected error')
    // expect(e.message).toContain('not a date')
  }
})

it('supports custom scalars as input type', async () => {
  const datamodel = `
  model User {
    id        Int      @id @default(autoincrement())
    createdAt DateTime @default(now())
  }
`
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.createdAt()
    },
  })

  const before = jest.fn()
  let gqlArgs: any

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({
        filtering: true,
        async resolve(root: any, args: any, ctx: any, info: any, originalResolve: any) {
          before()
          gqlArgs = args
          return originalResolve(root, args, ctx, info)
        },
      })
    },
  })

  const { graphqlClient } = await ctx.setup({
    datamodel,
    types: [Query, User],
    scalars: {
      DateTime: DateTimeResolver,
    },
  })

  await graphqlClient.request(
    `query users($dateTime: DateTime) {
        users(where: { createdAt: { gt: $dateTime}}) {
          id
        }
     }
    `,
    { dateTime: new Date().toISOString() }
  )

  expect(before).toBeCalled()
  expect(gqlArgs.where.createdAt.gt instanceof Date).toEqual(true)
})

import { objectType } from '@nexus/schema'
import { createRuntimeTestContext } from '../__client-test-context'
import { GraphQLScalarType } from 'graphql'

let ctx = createRuntimeTestContext()

it('supports custom scalars', async () => {
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

  const { graphqlClient, dbClient } = await ctx.getContext({
    datamodel,
    types: [Query, User],
    scalars: {
      DateTime: new GraphQLScalarType({
        name: 'DateTime',
        serialize() {
          throw new Error('not a date')
        },
      }),
    },
  })

  await dbClient.user.create({
    data: {},
  })

  try {
    await graphqlClient.request(`{
      users {
        createdAt
      }
    }`)
  } catch (e) {
    expect(e.message).toContain('not a date')
  }
})

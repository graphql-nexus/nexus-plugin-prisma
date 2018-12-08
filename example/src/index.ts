import { ApolloServer } from 'apollo-server'
import { Context } from './types'
import { prisma } from './generated/prisma-client'
import { schema } from './schema'

const server = new ApolloServer({
  schema,
  context: {
    prisma,
  } as Context,
})

const port = 4000

server.listen({ port }, () =>
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`,
  ),
)

import { GraphQLServer } from 'graphql-yoga'
import { prisma } from './generated/prisma-client'
import { schema } from './schema'

const server = new GraphQLServer({
  schema,
  context: { prisma },
})

server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))

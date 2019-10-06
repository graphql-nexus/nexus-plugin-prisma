import { GraphQLServer } from 'graphql-yoga'
import schema from './schema'
import { createContext } from './context'

const server = new GraphQLServer({
  schema,
  context: createContext(),
})

server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))

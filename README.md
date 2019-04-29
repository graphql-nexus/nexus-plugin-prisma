<p align="center"><img src="https://i.imgur.com/8qvElTM.png" width="300" /></p>

<p><h1 align="center">nexus-prisma</h1></p>

<p align="center">
  <a href="#features">Features</a> • <a href="#motivation">Motivation</a> • <a href="https://nexus.js.org/docs/database-access-with-prisma">Docs</a> • <a href="#examples">Examples</a> • <a href="https://nexus.js.org/docs/database-access-with-prisma#getting-started">Get started</a> • <a href="https://www.youtube.com/watch?v=1qB8vQwWwIc">Video</a> 
</p>

<p align="center">
  <a href="https://circleci.com/gh/prisma/nexus-prisma"><img src="https://circleci.com/gh/prisma/prisma.svg?style=shield"></img></a>
  <a href="https://spectrum.chat/prisma/graphql"><img src="https://withspectrum.github.io/badge/badge.svg"></img></a>
</p>

`nexus-prisma` offers a [code-first](https://www.prisma.io/blog/introducing-graphql-nexus-code-first-graphql-server-development-ll6s1yy5cxl5) approach for building GraphQL servers with a database. It auto-generates CRUD operations/resolvers that can be exposed and customized in your own GraphQL schema. Check out this [15min tutorial video](https://www.youtube.com/watch?v=1qB8vQwWwIc) to learn how to get started with `nexus-prisma`.

## Features

- **No boilerplate**: Auto-generated CRUD operations for Prisma models
- **Full type-safety**: Coherent set of types for GraphQL schema and database
- **Customize Prisma models**: Easily hide fields or add computed fields
- **Best practices**: Generated GraphQL schema follows best practices (e.g. `input` types for mutations) 
- **Code-first**: Programmatically define your GraphQL schema in JavaScript/TypeScript
- **Compatible with GraphQL ecosystem**: Works with (`graphql-yoga`, `apollo-server`, ...)
- **Incrementally adoptable**: Gradually migrate your app to `nexus-prisma`

## Motivation

`nexus-prisma` provides CRUD building blocks based on the Prisma datamodel. When implementing your GraphQL server, you build upon these building blocks and expose/customize them to your own API needs. 

![](https://imgur.com/dbEMHd5.png)

When using `nexus-prisma`, you're using a _code-first_ (instead of an _SDL-first_) approach for GraphQL server development. Read more about the benefits of code-first in this article series:

1. [The Problems of "Schema-First" GraphQL Server Development](https://www.prisma.io/blog/the-problems-of-schema-first-graphql-development-x1mn4cb0tyl3)
1. [Introducing GraphQL Nexus: Code-First GraphQL Server Development](https://www.prisma.io/blog/introducing-graphql-nexus-code-first-graphql-server-development-ll6s1yy5cxl5/)
1. [Using GraphQL Nexus with a Database](https://www.prisma.io/blog/using-graphql-nexus-with-a-database-pmyl3660ncst/)

## Documentation

You can find the docs [here](https://nexus.js.org/docs/database-access-with-prisma). They also include a [**Getting started**](https://nexus.js.org/docs/database-access-with-prisma#getting-started)-section.

## Examples

Here's a minimal example for using `nexus-prisma`:

**Prisma datamodel**:

```graphql
type Todo {
  id: ID! @id
  title: String!
  done: Boolean! @default(value: false)
}
```

**GraphQL server code** (based on `graphql-yoga`):

```ts
import { prismaObjectType, makePrismaSchema } from 'nexus-prisma'
import { idArg } from 'nexus'
import { GraphQLServer } from 'graphql-yoga'
import { prisma } from './generated/prisma-client'
import datamodelInfo from './generated/nexus-prisma'

// Expose the full "Query" building block
const Query = prismaObjectType({ 
  name: 'Query',
   // Expose all generated `Todo`-queries
  definition: t => t.prismaFields(['*'])
})

// Customize the "Mutation" building block
const Mutation = prismaObjectType({ 
  name: 'Mutation',
  definition(t) {
    // Expose only the `createTodo` mutation (`updateTodo` and `deleteTodo` not exposed)
    t.prismaFields(['createTodo'])

    // Add a custom `markAsDone` mutation
    t.field('markAsDone', {
      type: 'Todo',
      args: { id: idArg() },
      nullable: true,
      resolve: (_, { id }, ctx) => {
        return ctx.prisma.updateTodo({
          where: { id },
          data: { done: true }
        })
      }
    })
  }
})

const schema = makePrismaSchema({
  types: [Query, Mutation],

  prisma: {
    client: prisma,
    datamodelInfo
  },

  outputs: {
    schema: './generated/schema.graphql',
    typegen: './generated/nexus'
  }
})

const server = new GraphQLServer({
  schema,
  context: { prisma }
})
server.start(() => console.log('Server is running on http://localhost:4000'))
```

**Generated GraphQL schema**:

```graphql
# The fully exposed "Query" building block
type Query {
  todo(where: TodoWhereUniqueInput!): Todo
  todoes(after: String, before: String, first: Int, last: Int, orderBy: TodoOrderByInput, skip: Int, where: TodoWhereInput): [Todo!]!
  todoesConnection(after: String, before: String, first: Int, last: Int, orderBy: TodoOrderByInput, skip: Int, where: TodoWhereInput): TodoConnection!
}

# The customized "Mutation" building block
type Mutation {
  createTodo(data: TodoCreateInput!): Todo!
  markAsDone(id: ID): Todo
}

# The Prisma model
type Todo {
  done: Boolean!
  id: ID!
  title: String!
}

# More of the generated building blocks:
# e.g. `TodoWhereUniqueInput`, `TodoCreateInput`, `TodoConnection`, ...
```

You can find some easy-to-run example projects based on `nexus-prisma` in the [`prisma-examples`](https://github.com/prisma/prisma-examples/):

- [GraphQL](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql): Simple setup keeping the entire schema in a single file.
- [GraphQL (Apollo Server)](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql): Simple setup keeping the entire schema in a single file using `apollo-server`.
- [GraphQL CRUD](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-crud): Full CRUD operations with minimal boilerplate.
- [GraphQL + Auth](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-auth): Advanced setup including authentication and authorization and a modularized schema. 

You can also check out this quick demo on CodeSandbox:

[![Edit example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/6w7581x05k)

<p align="center"><img src="https://i.imgur.com/8qvElTM.png" width="300" /></p>

<p><h1 align="center">nexus-prisma</h1></p>

<p align="center">
  <a href="#features">Features</a> • <a href="#motivation">Motivation</a> • <a href="https://nexus.js.org/docs/database-access-with-prisma">Docs</a> • <a href="#examples">Examples</a> • <a href="#usage">Usage</a> 
</p>

<br />

`nexus-prisma` offers a [code-first](https://www.prisma.io/blog/introducing-graphql-nexus-code-first-graphql-server-development-ll6s1yy5cxl5) approach for building GraphQL servers with a database. It auto-generates CRUD operations/resolvers that can be exposed and customized in your own GraphQL schema.

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

<Details><Summary>Expand to view the generated SDL for the final GraphQL API</Summary>

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

</Details>

You can find some easy-to-run example projects based on `nexus-prisma` in the [`prisma-examples`](https://github.com/prisma/prisma-examples/):

- [GraphQL](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql): Simple setup keeping the entire schema in a single file.
- [GraphQL + Auth](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-auth): Advanced setup including authentication and authorization and a modularized schema. 

You can also check out this quick demo on CodeSandbox:

[![Edit example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/6w7581x05k)

## Usage

### Prerequisites

You need to have a running Prisma project in order to use `nexus-prisma`. Learn how to get started with Prisma [here](https://www.prisma.io/docs/-t002/).

### Install

Install dependencies:

```bash
npm install --save nexus-prisma
```

Other required dependencies:

```
npm install --save nexus graphql prisma-client-lib
```

### Generate CRUD building blocks

The CRUD building blocks are generated using the `nexus-prisma-generate` CLI:

```bash
npx nexus-prisma-generate --output ./src/generated/nexus-prisma
```

It is recommended to add this command as a `post-deploy` hook to your `prisma.yml`, e.g.:

```yml
hooks:
  post-deploy:
    - npx nexus-prisma-generate --output ./src/generated/nexus-prisma # Runs the codegen tool from nexus-prisma
```

As an example, assume you have a `User` type in your Prisma datamodel. `nexus-prisma-generate` will generate the following building blocks for it:

- Queries
  - `user(...): User!`: Returns a single record
  - `users(...): [User!]!`: Returns a list of records
  - `usersConnection(...): UserConnection!`: [Relay connections](https://graphql.org/learn/pagination/#complete-connection-model) & aggregations

- Mutations
  - `createUser(...): User!`: Creates a new record
  - `updateUser(...): User`: Updates a record
  - `deleteUser(...): User`: Deletes a record
  - `updatesManyUsers(...): BatchPayload!`: Updates many records in bulk
  - `deleteManyUsers(...): BatchPayload!`: Deletes many records in bulk

- [GraphQL input types](https://graphql.org/graphql-js/mutations-and-input-types/)
  - `UserCreateInput`: Wraps all fields of the record
  - `UserUpdateInput`: Wraps all fields of the record
  - `UserWhereInput`: Provides filters for all fields of the record
  - `UserWhereUniqueInput`: Provides filters for unique fields of the record
  - `UserUpdateManyMutationInput`: Wraps fields that can be updated in bulk
  - `UserOrderByInput`: Specifies ascending or descending orders by field

> `UserCreateInput` and `UserUpdateInput` differ in the way relation fields are treated.

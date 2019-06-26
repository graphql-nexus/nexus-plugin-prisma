<p align="center"><img src="https://i.imgur.com/8qvElTM.png" width="300" /></p>
<p><h1 align="center">nexus-prisma</h1></p>
<p align="center">
  <a href="#features">Features</a> • <a href="#motivation">Motivation</a> • <a href="https://nexus.js.org/docs/database-access-with-prisma-v2">Docs</a> • <a href="#examples">Examples</a> • <a href="https://nexus.js.org/docs/database-access-with-prisma#getting-started-v2">Get started</a>
</p>

<p align="center">
  <a href="https://circleci.com/gh/prisma/nexus-prisma"><img src="https://circleci.com/gh/prisma/prisma.svg?style=shield"></img></a>
  <a href="https://spectrum.chat/prisma/graphql"><img src="https://withspectrum.github.io/badge/badge.svg"></img></a>
</p>

`nexus-prisma` offers a [code-first](https://www.prisma.io/blog/introducing-graphql-nexus-code-first-graphql-server-development-ll6s1yy5cxl5) approach for building GraphQL servers with a database. It auto-generates CRUD operations/resolvers that can be exposed and customized in your own GraphQL schema.

Thanks to its unique appoach for constructing GraphQL schemas and generating resolvers, `nexus-prisma` removes the need for a traditional ORM or query builder (such as TypeORM, Sequelize, knex.js....).

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
2. [Introducing GraphQL Nexus: Code-First GraphQL Server Development](https://www.prisma.io/blog/introducing-graphql-nexus-code-first-graphql-server-development-ll6s1yy5cxl5/)
3. [Using GraphQL Nexus with a Database](https://www.prisma.io/blog/using-graphql-nexus-with-a-database-pmyl3660ncst/)

## Documentation

You can find the docs [here](https://nexus.js.org/docs/database-access-with-prisma-v2). They also include a [**Getting started**](https://nexus.js.org/docs/database-access-with-prisma-v2#getting-started)-section.

## Examples

Here's a minimal example for using `nexus-prisma`:

**Prisma schema**:

```groovy
datasource db {
  provider = "sqlite"
  url      = "file:db/next.db"
  default  = true
}

generator photon {
  provider = "photonjs"
}

generator nexus_prisma {
  provider = "nexus-prisma"
}

model Todo {
  id		ID @id
  title	String
  done	Boolean @default(false)
}
```

**GraphQL server code** (based on `graphql-yoga`):

```ts
import { nexusPrismaPlugin } from '@generated/nexus-prisma';
import { Photon } from '@generated/photon';
import { objectType, makeSchema, idArg } from '@prisma/nexus';
import { GraphQLServer } from 'graphql-yoga';

// Expose some CRUD operations
const Query = objectType({
  name: 'Query',
  definition(t) {
    t.crud.findOneTodo();
    t.crud.findManyTodo();
  }
});

// Customize the "Mutation" building block
const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    // Expose only the `createTodo` mutation (`updateTodo` and `deleteTodo` not exposed)
    t.crud.createTodo();

    // Add a custom `markAsDone` mutation
    t.field('markAsDone', {
      type: 'Todo',
      args: { id: idArg() },
      nullable: true,
      resolve: (_, { id }, ctx) => {
        return ctx.photon.todos.updateTodo({
          where: { id },
          data: { done: true }
        });
      }
    });
  }
});

const Todo = objectType({
  name: 'Todo',
  definition(t) {
    t.model.id();
    t.model.title();
    t.model.done();
  }
});

const photon = new Photon();

const nexusPrisma = nexusPrismaPlugin({
  photon: ctx => photon
});

const schema = makeSchema({
  types: [Query, Mutation, nexusPrisma],
  outputs: {
    schema: './generated/schema.graphql',
    typegen: './generated/nexus'
  }
});

const server = new GraphQLServer({
  schema,
  context: { photon }
});
server.start(() => console.log('Server is running on http://localhost:4000'));
```

**Generated GraphQL schema**:

```graphql
# The fully exposed "Query" building block
type Query {
  findOneTodo(where: TodoWhereUniqueInput!): Todo
  findManyTodo(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
  ): [Todo!]!
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
# e.g. `TodoWhereUniqueInput`, `TodoCreateInput`, ...
```

- You can find some easy-to-run example projects based on `nexus-prisma` in the [`photonjs repository`](https://github.com/prisma/photonjs/tree/master/examples):

  \- [GraphQL](https://github.com/prisma/photonjs/tree/master/examples/typescript/graphql): Simple setup keeping the entire schema in a single file.

  \- [GraphQL + Auth](https://github.com/prisma/photonjs/tree/master/examples/typescript/graphql-auth): Advanced setup including authentication and authorization and a modularized schema.

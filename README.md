<p align="center"><img src="https://i.imgur.com/8qvElTM.png" width="300" /></p>

# nexus-prisma

Prisma plugin for [GraphQL Nexus](https://nexus.js.org/), a code first GraphQL schema construction library

## Motivation

The `nexus-prisma` plugin provides CRUD building blocks based on the Prisma datamodel. When implementing your GraphQL server, you build upon these building blocks and expose/customize them to your own API needs. 

When using `nexus-prisma`, you're using a code-first (instead of an SDL-first) approach for GraphQL server development. Read more about the benefits of code-first in this article series:

1. [The Problems of "Schema-First" GraphQL Server Development](https://www.prisma.io/blog/the-problems-of-schema-first-graphql-development-x1mn4cb0tyl3)
1. [Introducing GraphQL Nexus: Code-First GraphQL Server Development](https://www.prisma.io/blog/introducing-graphql-nexus-code-first-graphql-server-development-ll6s1yy5cxl5/)
1. [Using GraphQL Nexus with a Database](https://www.prisma.io/blog/using-graphql-nexus-with-a-database-pmyl3660ncst/)

You can also check out a quick demo on CodeSandbox:

[![Edit example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/6w7581x05k)

## Features

- CRUD operations for your Prisma models in GraphQL (easier than [`forwardTo`](https://github.com/prisma/prisma-binding#forwardto))
- Customize your Prisma models, e.g. _hide certain fields_ or _add computed fields_
- Full type-safety: Coherent set of types for GraphQL schema and database
- Compatible with the GraphQL ecosystem (e.g. `apollo-server`, `graphql-yoga`, ...)
- Incrementally adoptable
- Compatible both with TypeScript and JavaScript

## Documentation

You can find the docs for `nexus-prisma` [here](https://nexus.js.org/docs/database-access-with-prisma). The docs also include a [**Getting started**](https://nexus.js.org/docs/database-access-with-prisma#getting-started)-section.

## Examples

Here's a minimal example for using `nexus-prisma`:

**Prisma datamodel**:

```graphql
type Todo {
  id: ID! @unique
  title: String!
  done: Boolean! @default(value: "false")
}
```

**GraphQL server code**::

```ts
import { prismaObjectType } from 'nexus-prisma'
import { idArg } from 'nexus-prisma'

// Expose the full "Query" building block
const Query = prismaObjectType({ 
  name: 'Query',
   // Expose all generated `Todo`-queries
  definition(t) => t.prismaFields(['*'])
})

// Customize the "Mutation" building block
const Mutation = prismaObjectType({ 
  name: 'Mutation',
  definition(t) {
    // Keep only the `createTodo` mutation
    t.prismaFields(['createTodo'])

    // Add a custom `markAsDone` mutation
    t.field('markAsDone', {
      args: { id: idArg() },
      nullable: true,
      resolve: (_, { id }, ctx) {
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

  // More config stuff, e.g. where to put the generated SDL
})

// Feed the `schema` into your GraphQL server, e.g. `apollo-server, `graphql-yoga` 
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
<br />

You can find some easy-to-run example projects based on `nexus-prisma` in the [`prisma-examples`](https://github.com/prisma/prisma-examples/):

- [GraphQL](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql): Simple setup keeping the entire schema in a single file.
- [GraphQL + Auth](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-auth): Advanced setup including authentication and authorization and a modularized schema. 


## The `nexus-prisma` workflow

The `nexus-prisma` plugin is the glue between the Prisma client and GraphQL Nexus. It generates CRUD building blocks based for your Prisma models.

When constructing your GraphQL schema with GraphQL Nexus, you build upon these building blocks and expose/customize them to your own API needs.

#### Generated CRUD building blocks

Assume you have a `User` type in your Prisma datamodel. `nexus-prisma-generate` will generate the following building blocks for it:

- **Queries**
  - **`user(...): User!`**: Fetches a single record
  - **`users(...): [User!]!`**: Fetches a list of records
  - **`usersConnection(...): UserConnection!`**: [Relay connections](https://graphql.org/learn/pagination/#complete-connection-model) & aggregations

- **Mutations**
  - **`createUser(...): User!`**: Creates a new record
  - **`updateUser(...): User`**: Updates a record
  - **`deleteUser(...): User`**: Deletes a record
  - **`updatesManyUsers(...): BatchPayload!`**: Updates many records in bulk
  - **`deleteManyUsers(...): BatchPayload!`**: Deletes many records in bulk

- [**GraphQL input types**](https://graphql.org/graphql-js/mutations-and-input-types/)
  - **`UserCreateInput`**: Wraps all fields of the record
  - **`UserUpdateInput`**: Wraps all fields of the record
  - **`UserWhereInput`**: Provides filters for all fields of the record
  - **`UserWhereUniqueInput`**: Provides filters for unique fields of the record
  - **`UserUpdateManyMutationInput`**: Wraps fields that can be updated in bulk
  - **`UserOrderByInput`**: Specifies ascending or descending orders by field

> `UserCreateInput` and `UserUpdateInput` differ in the way relation fields are treated.


## Usage

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

Teh CRUD building blocks are generated using the `nexus-prisma-generate` CLI:

```bash
npx nexus-prisma-generate --client PRISMA_CLIENT_DIR --output ./src/generated/nexus-prisma
```

It is recommended to add this command as a `post-deploy` hook to your `prisma.yml`, e.g.:

```yml
hooks:
  post-deploy:
    - prisma generate
    - npx nexus-prisma-generate --client prisma-client-dir --output ./src/generated/nexus-prisma # Runs the codegen tool from nexus-prisma
```

## Reference 

### `prismaObjectType()`

`prismaObjectType` is a wrapper around Nexus' `objectType`. It provides two additional methods to the model: `prismaType()` and `prismaFields()`. These two methods simplify the coupling between a Prisma schema and a Nexus schema and provide a straightforward mechanism to customize the Prisma models, fields, and input-arguments which are included in the Nexus schema.

It expects an object with the following properties:

#### Required

- `name` (string): The name of the Prisma model or generated CRUD GraphQL type you want to expose in your API, e.g. `Query`, `Mutation`, `User`, `Todo`, `UserWhereUniqueInput`, `TodoConnection`, ...
- `definition(t) => {}` (function): A function to customize the Prisma model or generated CRUD GraphQL type `t`. To expose the entire type, call: `t.prismaFields(['*'])`. See the documentation of `prismaFields()` below for more info.

#### Optional

- `nonNullDefaults` (boolean or object): Specifies whether the [nullability](https://graphql.org/learn/schema/#lists-and-non-null) behaviour for field arguments and field types. **All input arguments and return types of fields are non-null by default**. If you want the behaviour to differ for input arguments and field (outout) types, you can pass an object with these properties: 
  - `input` (boolean): Specifies whether input arguments should be required. Default: `true`.
  - `output` (boolean): Specifies whether return values of fields should be required. Default: `true`.
- `description`: A string that shows up in the generated SDL schema definition to describe the type. It is also picked up by tools like the GraphQL Playground or graphiql.
- `defaultResolver`

### `prismaExtendType()`

`prismaExtendType` wraps the Nexus [`extendType`](https://nexus.js.org/docs/api-extendtype) function and adds two utility methods to the model `t`: `prismaFields()` and `prismaType()`. Like `extendType`, `prismaExtendType` is primarily useful in incrementally defining the fields of a type (i.e. defining the fields of a type from multiple locations within a project). Such type extension is commonly used to co-locate (within in a single file) type definitions for a specific domain with relevant additions to the root `Query` and `Mutation` types. 

It expects an object with the following properties:

#### Required

- `type` (string): The name of the Prisma model or generated CRUD GraphQL type you want to *augment* with additional fields.
- `definition(t) => {}` (function): A function to customize the Prisma model or generated CRUD GraphQL type `t` by adding new fields to the specified `type`. The type of the argument `t` matches its analog in `prismaObjectType`.

### `prismaFields()`

`prismaFields()` is called on the type `t` that's passed into the `definition` function. All the fields exposed using `prismaFields()` are automatically resolved. The `prismaFields()` function expects an array of Prisma fields where each field can either be provided:

- as a simple string to indicate that it should be exposed in the same way it was defined in the datamodel
- as a configuration object in case you want to rename the field or adjust its arguments

#### Signature

```ts
/**
 * Pick, or customize the fields of the underlying object type
 */
t.prismaFields(fieldsToExpose: string[] | Field[])
/**
 * Pick, or customize the fields of the underlying object type
 * (Equivalent to the above)
 */
t.prismaFields({ pick: string[] | Field[] })
/**
 * Filter or customize the fields of the underlying object type
 */
t.prismaFields({ filter: (string[] | Field[]) | (fields: string[]) => string[] })

interface Field {
  name: string    // Name of the field you want to expose
  alias: string   // Name of the alias of you want to give the field
  args: string[]  // Arguments of the field you want to expose
}
```

#### Examples

**Expose all fields**

```ts
const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields(['*'])
  },
})
```

**Expose only the `id` and `name` field**

```ts
const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields(['id', 'name'])
  },
})
```

or

```ts
const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields({ pick: ['id', 'name'] })
  },
})
```

**Expose all fields but the `id` and `name`**

```ts
const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields({ filter: ['id', 'name'] })
  },
})
```

**Expose only the `users` field, and renames it to `customers`**

```ts
const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.prismaFields([{ name: 'users', alias: 'customers' }])
  },
})
```

**Expose only the `users` field, and only the `first` and `last` args**

```ts
const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.prismaFields([{ name: 'users', args: ['first', 'last'] }])
  },
})
```

### `t.prismaType()`

Contains all the options to use native `nexus` default methods with `nexus-prisma` generated schema.

#### Examples

**Pass in all the options as-is**

```ts
const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.field('users', t.prismaType.users)
  },
})
```

**Use all the options, but override the resolver**

```ts
const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.field('users', {
      ...t.prismaType.users,
      resolve(root, args, ctx) {
        // Custom implementation
      },
    })
  },
})
```

**Use all the options, add more arguments with a custom resolver**

```ts
const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.field('users', {
      ...t.prismaType.users,
      args: {
        ...t.prismaType.users.args,
        newArg: stringArg(),
      },
      resolve(root, args, ctx) {
        // Custom implementation
      },
    })
  },
})
```

## Typings

By default, `nexus` will infer the `root` types from your schema. In some cases, you might need the `root`s to be the actual types return by the `prisma-client` (eg: You want to use a hidden field from your Prisma datamodel to expose a computed one)

In that case, you need to add the `prisma-client` types to the `typegenAutoConfig.sources` config:

```ts
import { join } from 'path'
import { makePrismaSchema } from 'nexus-prisma'

const schema = makePrismaSchema({
  // ... other configs,
  typegenAutoConfig: {
    sources: [
      source: path.join(__dirname, './relative/path/to/prisma/client'),
      alias: 'prisma'
    ]
  }
})
```

`nexus` will match the types name of your schema with the TS interfaces contained in the `prisma-client` file, and use these types instead of the inferred one from your schema. If needed, you can also input your own types.

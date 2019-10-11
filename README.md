<p align="center">
  <img src="https://i.imgur.com/8qvElTM.png" width="300" align="center" />
  <h1 align="center">nexus-prisma</h1>
</p>

[![CircleCI](https://circleci.com/gh/prisma-labs/nexus-prisma.svg?style=svg)](https://circleci.com/gh/prisma-labs/nexus-prisma)

`nexus-prisma` is a plugin for bridging [Prisma](https://www.prisma.io) and [Nexus](https://nexus.js.org). It extends the Nexus DSL `t` with `.model` and `.crud` making it easy to expose Prisma models and operations against them in your GraphQL API. The resolvers for these operations (pagination, filtering, ordering, and more), are dynamically created for you removing the need for traditional ORMs/query builders like TypeORM, Sequelize, or Knex. And when you do need to drop down into custom resolvers a [`Photon`](https://photonjs.prisma.io) instance on `ctx` will be ready to serve you, the same great tool `nexus-prisma` itself bulids upon.

### Contents <!-- omit in toc -->

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Example](#example)
- [API Reference](#api-reference)
  - [`t.model`](#tmodel)
    - [`alias` Option](#alias-option)
    - [`type` Option](#type-option)
    - [`ordering` `pagination` `filtering` Options](#ordering-pagination-filtering-options)
  - [`t.crud`](#tcrud)
    - [One-Create Operation](#one-create-operation)
    - [One-Read Operation](#one-read-operation)
    - [One-Update Operation](#one-update-operation)
    - [One-Upsert Operation](#one-upsert-operation)
    - [One-Delete Operation](#one-delete-operation)
    - [Many-Create Operation](#many-create-operation)
    - [Many-Read Operation](#many-read-operation)
    - [Many-Update Operation](#many-update-operation)
    - [Many-Upsert Operation](#many-upsert-operation)
    - [Many-Delete Operation](#many-delete-operation)
    - [`type` Option](#type-option-1)
    - [`alias` Option](#alias-option-1)
    - [`ordering` `pagination` `filtering` options](#ordering-pagination-filtering-options)
  - [Configuration](#configuration)
- [Guide](#guide)
    - [Query](#query)
      - [Pagination](#pagination)
      - [Ordering](#ordering)
- [<User field name>: OrderByDir](#user-field-name-orderbydir)
      - [Filtering](#filtering)
- [assume user has these Scalar fields, to illustrate example](#assume-user-has-these-scalar-fields-to-illustrate-example)
- [<User field name>: <Scalar name>Filter](#user-field-name-scalar-namefilter)
- [...](#)
- [assume user has these Object (aka. relation) fields, to illustrate example](#assume-user-has-these-object-aka-relation-fields-to-illustrate-example)
- [<User field name>: <Object name>Filter](#user-field-name-object-namefilter)
- [...](#-1)
- [Defined once for each Scalar filter](#defined-once-for-each-scalar-filter)
- [Foo is a Scalar name](#foo-is-a-scalar-name)
- [Defined once for each Object filter](#defined-once-for-each-object-filter)
- [Foo is an Object name](#foo-is-an-object-name)
- [Recipes](#recipes)
    - [Exposed Prisma Model](#exposed-prisma-model)
    - [Simple Computed Fields](#simple-computed-fields)
    - [Complex Computed Fields](#complex-computed-fields)
    - [Renamed Prisma Model Fields](#renamed-prisma-model-fields)
    - [Exposed Reads on Model](#exposed-reads-on-model)
    - [Exposed Writes on Model](#exposed-writes-on-model)
    - [Exposed Customized Reads on Model](#exposed-customized-reads-on-model)
    - [Exposed Model Writes Along Side Photon-Resolved Fields](#exposed-model-writes-along-side-photon-resolved-fields)
  - [Links](#links)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

```
npm install nexus-prisma
```

# Example

Given a [Prisma schema](https://github.com/prisma/prisma2/blob/master/docs/prisma-schema-file.md) like:

```prisma
// schema.prisma

generator photonjs {
  provider = "photonjs"
}

model User {
  id     String @id @default(cuid())
  handle String
  posts  Post[]
}

model Post {
  id     String @id @default(cuid())
  author User[]
}
```

You will be able to project these Prisma models onto your GraphQL API and expose operations against them:

```ts
// src/types.ts

export const Query = queryType({
  definition(t) {
    t.crud.user()
    t.crud.users({ ordering: true })
    t.crud.post()
    t.crud.posts({ filtering: true })
  },
})

export const Mutation = mutationType({
  definition(t) {
    t.crud.createUser()
    t.crud.createPost()
  },
})

export const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.handle()
    t.model.posts()
  },
})

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.author()
  },
})
```

Setup your schema:

```ts
// src/schema.ts

import { createNexusPlugin } from 'nexus-prisma'
import { makeSchema } from 'nexus'
import * as types from './types'

export const schema = makeSchema({
  types: [...types, createNexusPlugin({ types })],
  outputs: true,
})
```

Generate your Photon.js database client:

```
prisma2 generate
```

Run your app:

```
ts-node --transpile-only  src/main
```

```ts
// src/main.ts

import { GraphQLServer } from 'graphql-yoga'
import { createContext } from './context'
import { schema } from './schema'

new GraphQLServer({ schema }).start()
```

And get the resulting GraphQL API:

TODO need to regenerate this schema

<details>
<summary>(toggle me)</summary>

```gql
input IntFilter {
  equals: Int
  gt: Int
  gte: Int
  in: [Int!]
  lt: Int
  lte: Int
  not: Int
  notIn: [Int!]
}

type Mutation {
  createOnePost(data: PostCreateInput!): Post!
  createOneUser(data: UserCreateInput!): User!
}

enum OrderByArg {
  asc
  desc
}

type Post {
  author(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
  ): [User!]
  id: Int!
}

input PostCreateInput {
  author: UserCreateManyWithoutAuthorInput
}

input PostCreateManyWithoutPostsInput {
  connect: [PostWhereUniqueInput!]
  create: [PostCreateWithoutAuthorInput!]
}

input PostCreateWithoutAuthorInput

input PostFilter {
  every: PostWhereInput
  none: PostWhereInput
  some: PostWhereInput
}

input PostWhereInput {
  AND: [PostWhereInput!]
  author: UserFilter
  id: IntFilter
  NOT: [PostWhereInput!]
  OR: [PostWhereInput!]
}

input PostWhereUniqueInput {
  id: Int
}

type Query {
  post(where: PostWhereUniqueInput!): Post
  posts(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
    where: PostWhereInput
  ): [Post!]
  user(where: UserWhereUniqueInput!): User
  users(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: UserOrderByInput
    skip: Int
  ): [User!]
}

input StringFilter {
  contains: String
  endsWith: String
  equals: String
  gt: String
  gte: String
  in: [String!]
  lt: String
  lte: String
  not: String
  notIn: [String!]
  startsWith: String
}

type User {
  handle: String!
  id: ID!
  posts(
    after: String
    before: String
    first: Int
    last: Int
    skip: Int
  ): [Post!]
}

input UserCreateInput {
  handle: String!
  id: ID
  posts: PostCreateManyWithoutPostsInput
}

input UserCreateManyWithoutAuthorInput {
  connect: [UserWhereUniqueInput!]
  create: [UserCreateWithoutPostsInput!]
}

input UserCreateWithoutPostsInput {
  handle: String!
  id: ID
}

input UserFilter {
  every: UserWhereInput
  none: UserWhereInput
  some: UserWhereInput
}

input UserOrderByInput {
  handle: OrderByArg
  id: OrderByArg
}

input UserWhereInput {
  AND: [UserWhereInput!]
  handle: StringFilter
  id: StringFilter
  NOT: [UserWhereInput!]
  OR: [UserWhereInput!]
  posts: PostFilter
}

input UserWhereUniqueInput {
  id: ID
}
```

</details>

<br>

You can find a runnable version of this and other examples at [prisma-labs/nexus-examples](/TODO).

# API Reference

## `t.model`

Only available within [`Nexus.objectType`](https://nexus.js.org/docs/api-objecttype) definitions.

`t.model` contains configurable _field projectors_ that you use for projecting fields of your [Prisma models](https://github.com/prisma/prisma2/blob/master/docs/data-modeling.md#models) onto your [GraphQL Objects](https://graphql.github.io/graphql-spec/June2018/#sec-Objects).

`t.model` will either have field projectors for the Prisma model whose name matches that of the GraphQL `Object`, or if the GraphQL `Object` is of a name that does not match any of your Prisma models then `t.model` becomes a function allowing you to specify the mapping, after which the Field Projectors become available.

**Example**

```gql
type User {
  id: ID!
}

type Person {
  id: ID!
}
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.id()
  },
})

objectType({
  name: 'Person',
  definition(t) {
    t.model('User').id()
  },
})
```

```prisma
model User {
  id String @id @default(cuid())
}
```

### `alias` Option

Use `alias` to change the name of the field projected onto the `Object`.

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.name({ alias: 'handle' })
  },
})
```

```gql
type User {
  handle: String
}
```

### `type` Option

This option is only available for relational fields.

Use `type` to change the projected GraphQL field type which by default is the related Prisma model name. This is necessary when the related Prisma model has itself been projected onto a differently named GraphQL `Object`.

**Example**

```gql
type Article {
  title: String!
}

type User {
  articles: [Article]
}
```

```ts
objectType({
  name: 'Article',
  definition(t) {
    t.model('Post').id()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.posts({ alias: 'articles', type: 'Article' })
  },
})
```

```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

modle Post {
  id String @id @default(cuid())
}
```

### `ordering` `pagination` `filtering` Options

Only available for list type model fields. Please refer to TODO for details.

## `t.crud`

Only available within `Query` and `Mutation` definitions.

`t.crud` contains configurable _operation publishers_ that you use for exposing create, read, update, and delete mutations against your projected Prisma models.

There are 10 kinds of operations (reflecting a subset of [Photon.js](https://photonjs.prisma.io)'s capabilities). An _operation publisher_ is the combination of some operation kind and a particular Prisma model. Thus the number of operation publishers on `t.crud` is `Prisma model count × operation kind count`. So for example if you defined 20 Prisma models then you would see 200 operation publishers on `t.crud`.

**Example**

```ts
queryType({
  definition(t) {
    t.crud.user()
    t.crud.users()
  },
})

mutationType({
  definition(t) {
    t.crud.createOneUser()
    t.crud.udpateOneUser()
    t.crud.upsertOneUser()
    t.crud.deleteOneUser()

    t.crud.createManyUser()
    t.crud.updateManyUser()
    t.crud.upsertManyUser()
    t.crud.deleteManyUser()
  },
})
```

```prisma
model User {
  id Int @id
}
```

<br>
<p>In the following operation kind documentation, each entry uses this format:</p>

```
> Overview

> GraphQL schema contributions

> Example
  > GraphQL client operations
  > GraphQL schema
  > Nexus type definitions
  > Prisma models
```

<br>

### One-Create Operation

<!-- prettier-ignore -->
```ts
(options: { type?: string; alias?: string }) => CRUD

t.crud.createOne<ModelName>
```

Allow clients to create one record at at time of the respective Prisma model.

Relation fields may be connected with an existing record or a sub-create may be inlined (generally referred to as _nested mutations_). If the relation is a `List` then multiple connections or sub-creates are permitted.

**GraphQL Schema Contributions**

```
input <ModelName>CreateInput {
  <scalar field>: <scalar type> [!]
  <relation field>: <RelationModelName>CreateManyWithout<ModelName>Input [!]
}

input <RelationModelName>CreateManyWithout<ModelName> {
  connect: [<RelationModelName>WhereUniqueInput!]
  create: [<RelationModelName>CreateWithout<ModelName>Input!]
}

input <RelationModelName>WhereUniqueInput {
  <RelationModel @unique field>: <scalar type>
}

input <RelationModelName>CreateWithout<ModelName>Input {
  <RelationModelName>CreateInput - <ModelName> relation field
}
```

```gql
input <ModelName>CreateInput {
  <scalar field>: <scalar type> [!]
  <relation field>: <RelationModelName>CreateManyWithout<ModelName>Input [!]
}

input <RelationModelName>CreateManyWithout<ModelName> {
  connect: [<RelationModelName>WhereUniqueInput!]
  create: [<RelationModelName>CreateWithout<ModelName>Input!]
}

input <RelationModelName>WhereUniqueInput {
  <RelationModel @unique field>: <scalar type>
}

input <RelationModelName>CreateWithout<ModelName>Input {
  <RelationModelName>CreateInput - <ModelName> relation field
}
```

```gql
input __MODEL_NAME__CreateInput {
  __MODEL_SCALAR_FIELD__: SCALAR_TYPE # ! <> @default
  __MODEL_RELATION_FIELD__: __RELATION_MODEL_NAME__CreateManyWithout__MODEL_NAME__ # ! <> @default
}

input __RELATION_MODEL_NAME__CreateManyWithout__MODEL_NAME__ {
  connect: [__RELATION_MODEL_NAME__WhereUniqueInput!]
  create: [__RELATION_MODEL_NAME__CreateWithout__MODEL_NAME__Input!]
}

input __RELATION_MODEL_NAME__WhereUniqueInput {
  __RELATION_MODEL_@unique_FIELD__: SCALAR_TYPE
}

input __RELATION_MODEL_NAME__CreateWithout__MODEL_NAME__Input {
  __RELATION_MODEL_NAME__CreatInput - __MODEL__RELATION_FIELD
}
```

Inlined creates are very similar to top-level ones but have the important difference that the sub-create has excluded the field where supplying its relation to the type of parent `Object` being created would _normally be_. This is because a sub-create forces the record being created to relate to the record being created at the top-level.

**Example**

Client Mutations

```gql
mutation simple {
  createOneUser(data: { email: "newton@prisma.io" }) {
    id
  }
}

mutation connectRelation {
  createOneUser(
    data: { email: "newton@prisma.io", posts: { connect: [1643] } }
  ) {
    id
  }
}

mutation createRelation {
  createOneUser(
    data: {
      email: "newton@prisma.io"
      posts: { create: [{ title: "On How The Prism Came To Be", body: "..." }] }
    }
  ) {
    id
    posts {
      title
    }
  }
}
```

GraphQL Schema (generated)

```gql
type Mutation {
  createOneUser(data: UserCreateInput!): User!
}

type Post {
  author: User!
  id: Int!
  title: String!
  body: String!
}

input PostCreateManyWithoutPostsInput {
  connect: [PostWhereUniqueInput!]
  create: [PostCreateWithoutAuthorInput!]
}

input PostCreateWithoutAuthorInput {
  title: String!
  body: String!
}

input PostWhereUniqueInput {
  id: Int
  title: String
}

type User {
  email: String!
  id: Int!
  posts: [Post!]!
}

input UserCreateInput {
  email: String!
  posts: PostCreateManyWithoutPostsInput
}
```

Your Nexus Type Defs

```ts
mutationType({
  definition(t) {
    t.crud.createOneUser()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.posts()
  },
})

objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.body()
    t.model.author()
  },
})
```

Your Prisma Schema

```prisma
model User {
  id    Int    @id @unique
  email String @unique
  posts Post[]
}

model Post {
  id     Int    @id
  title  String @unique
  body   String
  author User
}
```

### One-Read Operation

<!-- prettier-ignore -->
```ts
(options: { type?: string, alias?: string }) => CRUD

t.crud.<ModelName>
```

Allow clients to find one particular record of the respective Prisma model. They may search by any Prisma model field that has been marked with `@unique` attribute.

The ability for relation fields to be filtered ordered or paginted depends upon if those features have been enabled for those `Object`s [via `t.model`](/TODO).

**GraphQL Schema Contributions**

- ×1 `InputObject` `<ModelName>WhereUniqueInput`. Its fields mirror the Prisma model's `@unique` fields.

**Example**

```gql
query simple {
  user(where: { email: "newton@prisma.io" }) {
    id
  }
}
```

```gql
type Query {
  user(where: UserWhereUniqueInput!): User
}

type User {
  id: Int!
  email: String!
}

input UserWhereUniqueInput {
  id: Int
  email: String
}
```

```ts
queryType({
  definition(t) {
    t.user()
  },
})
```

```prisma
model User {
  id    Int    @id @unique
  email String @unique
}
```

### One-Update Operation

<!-- prettier-ignore -->
```ts
(options: { type?: string, alias?: string }) => CRUD

t.crud.updateOne<ModelName>
```

Allow clients to update one particular record at a time of the respective Prisma model.
TODO

- powerful update semantics on relations
- many InputObjects created

**GraphQL Schema Contributions**

**Example**

```gql
mutation simple {
  updateOneUser(data: { email: "locke@prisma.io" }, where: { id: 1643 }) {
    id
    email
  }
}
```

```gql
input IntFilter {
  equals: Int
  gt: Int
  gte: Int
  in: [Int!]
  lt: Int
  lte: Int
  not: Int
  notIn: [Int!]
}

type Mutation {
  updateOneUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
}

type Post {
  author: User!
  id: Int!
  title: String!
}

input PostCreateWithoutAuthorInput {
  body: String!
  title: String!
}

input PostScalarWhereInput {
  AND: [PostScalarWhereInput!]
  body: StringFilter
  id: IntFilter
  NOT: [PostScalarWhereInput!]
  OR: [PostScalarWhereInput!]
  title: StringFilter
}

input PostUpdateManyDataInput {
  body: String
  id: Int
  title: String
}

input PostUpdateManyWithoutAuthorInput {
  connect: [PostWhereUniqueInput!]
  create: [PostCreateWithoutAuthorInput!]
  delete: [PostWhereUniqueInput!]
  deleteMany: [PostScalarWhereInput!]
  disconnect: [PostWhereUniqueInput!]
  set: [PostWhereUniqueInput!]
  update: [PostUpdateWithWhereUniqueWithoutAuthorInput!]
  updateMany: [PostUpdateManyWithWhereNestedInput!]
  upsert: [PostUpsertWithWhereUniqueWithoutAuthorInput!]
}

input PostUpdateManyWithWhereNestedInput {
  data: PostUpdateManyDataInput!
  where: PostScalarWhereInput!
}

input PostUpdateWithoutAuthorDataInput {
  body: String
  id: Int
  title: String
}

input PostUpdateWithWhereUniqueWithoutAuthorInput {
  data: PostUpdateWithoutAuthorDataInput!
  where: PostWhereUniqueInput!
}

input PostUpsertWithWhereUniqueWithoutAuthorInput {
  create: PostCreateWithoutAuthorInput!
  update: PostUpdateWithoutAuthorDataInput!
  where: PostWhereUniqueInput!
}

input PostWhereUniqueInput {
  id: Int
  title: String
}

type Query {
  ok: Boolean!
}

input StringFilter {
  contains: String
  endsWith: String
  equals: String
  gt: String
  gte: String
  in: [String!]
  lt: String
  lte: String
  not: String
  notIn: [String!]
  startsWith: String
}

type User {
  email: String!
  id: Int!
  posts: [Post!]!
}

input UserUpdateInput {
  email: String
  id: Int
  posts: PostUpdateManyWithoutAuthorInput
}

input UserWhereUniqueInput {
  email: String
  id: Int
}
```

```ts
mutationType({
  definition(t) {
    t.crud.updateOneUser()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.posts()
  },
})

objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.author()
  },
})
```

```prisma
model User {
  id    Int    @id @unique
  email String @unique
  posts Post[]
}

model Post {
  id     Int    @id
  title  String @unique
  body   String
  author User
}
```

### One-Upsert Operation

<!-- prettier-ignore -->
```ts
(options: { type?: string, alias?: string }) => CRUD

t.crud.upsertOne<ModelName>
```

Allow clients to update-or-create (aka. insert) one particular record at a time of the respective Prisma model.

**GraphQL Schema Contributions**

**Example**

TODO

- a combination of create and update
- only difference from upsert is that there is a create arg like with the create one operation.

### One-Delete Operation

<!-- prettier-ignore -->
```ts
(options: { type?: string, alias?: string }) => CRUD

t.crud.deleteOne<ModelName>
```

Allow clients to delete one particular record at a time of the respective Prisma model.

Of all operation kinds this has the smallest footprint on your GraphQL schema.

**GraphQL Schema Contributions**

**Example**

```gql
mutation simple {
  deleteOneUser(where: { id: 1643 }) {
    id
    email
    posts {
      id
      title
    }
  }
}
```

```gql
type Mutation {
  deleteOneUser(where: UserWhereUniqueInput!): User
}

type Post {
  author: User!
  id: Int!
  title: String!
}

type User {
  email: String!
  id: Int!
  posts: [Post!]!
}

input UserWhereUniqueInput {
  email: String
  id: Int
}
```

```ts
mutationType({
  definition(t) {
    t.crud.deleteOneUser()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.posts({ pagination: false })
  },
})

objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.author()
  },
})
```

```prisma
model User {
  id    Int    @id @unique
  email String @unique
  posts Post[]
}

model Post {
  id     Int    @id
  title  String @unique
  body   String
  author User
}

```

### Many-Create Operation

TODO

### Many-Read Operation

TODO

### Many-Update Operation

TODO

### Many-Upsert Operation

TODO

### Many-Delete Operation

TODO

### `type` Option

Refer to [`t.model` `type` option](/todo).

### `alias` Option

Refer to [`t.model` `alias` option](/todo).

### `ordering` `pagination` `filtering` options

Only available on `Query` crud for operations that return `List`s.

Refer to [model options](/todo).

## Configuration

TODO

# Guide

### Query

When exposing read operations against a list of model (on `Query`) or publishing relational fields of a model (on an `Object`) you have several options to customize the generated GraphQL schema: `pagination`, `ordering`, `filtering`. For example:

```ts
// a User model's relational field published on a User Object
objectType({
  name: 'User',
  definition(t) {
    t.model.friends({ pagination: true, ordering: true, filtering: true })
  },
})
```

```ts
// a read operation to get multiple users exposed on Query
queryType({
  definition(t) {
    t.crud.users({ pagination: true, ordering: true, filtering: true })
  },
})
```

The ways that these options affect your GraphQL schema are explained below.

#### Pagination

`pagination` introduces:

- 5 field args

  ```gql
  after: String
  before: String
  first: Int
  last: Int
  skip: Int
  ```

Example query:

```gql
query {
  users(skip: 50, first: 50) {
    id
    name
  }
}
```

#### Ordering

`ordering` introduces:

- 1 field arg
- 1 global `Enum`
- 1 `InputObject` specialized to an Object

Note it is currently not possible to orderBy relations.

```gql
orderBy: UserOrderBy # <field type>OrderBy

input UserOrderBy {
  # <User field name>: OrderByDir
  a: OrderByDir
  b: OrderByDir
}

enum OrderByDir { asc desc }
```

Example query:

```gql
query {
  users(orderBy: { b: asc }) {
    id
    name
  }
}
```

#### Filtering

`filtering` is the most complex of the three. It introduces:

- 1 field arg
- up to 1:1 InputObject per Scalar
- up to 1:1 InputObject per Object

The possibility for `InputObject per Object` comes from the relation filter aspect wherein: relation fields → filters → relation fields relational fields → filter → ... . There is the possibility for cycles in this graph too.

```gql
where: UserWhere # <field type>Where

type UserWhere {
  AND: [UserWhere!]!
  OR: [UserWhere!]!
  NOT: [UserWhere!]!
  # assume user has these Scalar fields, to illustrate example
  # <User field name>: <Scalar name>Filter
  a: FloatFilter
  b: StringFilter
  c: BooleanFilter
  #  ...
  # assume user has these Object (aka. relation) fields, to illustrate example
  # <User field name>: <Object name>Filter
  posts: PostFilter
  # ...
}

# Defined once for each Scalar filter
# Foo is a Scalar name
input FooFilter {
  equals: Foo
  gt: Foo
  gte: Foo
  in: [Foo!]
  lt: Foo
  lte: Foo
  not: Foo
  notIn: [Foo!]
}

# Defined once for each Object filter
# Foo is an Object name
input FooFilter {
  every: FooWhere
  some: FooWhere
  none: FooWhere
}
```

Example query:

```gql
query {
  users(where: {
    AND: [
      NOT: [
        { a: { gt: 5 } }
      ],
      posts: {
        every: {
          publishedOn: {
            gte: "2015-01-01T00:00:00"
          }
        },
        none: {
          comments: {
            none: {
              user: {
                status: BANNED
              }
            }
          }
        }
      }
    ]
  }) {
    id
    name
  }
}
```

# Recipes

### Exposed Prisma Model

Exposing one of your Prisma models in your GraphQL API

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.content()
  },
})
```

### Simple Computed Fields

You can add (computed) fields to a Prisma model using the standard GraphQL Nexus API.

```ts
objectType({
  name: "Post",
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.content()
    t.string("uppercaseTitle", {
      resolve({ title }, args, ctx) {
        return title.toUpperCase(),
      }
    })
  },
})
```

### Complex Computed Fields

If you need more complicated logic for your computed field (e.g. have access to some information from the database), you can use the `photon` instance that's attached to the context and implement your resolver based on that.

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.content()
    t.string('anotherComputedField', {
      async resolve({ title }, args, ctx) {
        const databaseInfo = await ctx.photon.someModel.someOperation(...)
        const result = doSomething(databaseInfo)
        return result
      }
    })
  }
})
```

### Renamed Prisma Model Fields

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.content({ alias: 'body' })
  },
})
```

### Exposed Reads on Model

By default we expose only pagination. Ordering and filtering must be explicitely enabled because of the performance overhead that they might cause.

```ts
queryType({
  definition(t) {
    t.crud.post()
    t.crud.posts({ ordering: true, filtering: true })
  },
})
```

### Exposed Writes on Model

```ts
queryType({
  definition(t) {
    t.crud.createPost()
    t.crud.updatePost()
    t.crud.deletePost()
  },
})
```

### Exposed Customized Reads on Model

If you wish to only expose some filters or orders, you can specify so on the model.

```ts
queryType({
  definition(t) {
    t.model.posts({
      filtering: { id: true, title: true },
      ordering: { title: true },
    })
  },
})
```

### Exposed Model Writes Along Side Photon-Resolved Fields

```ts
mutationType({
  definition(t) {
    t.crud.createUser()
    t.crud.updateUser()
    t.crud.deleteUser()
    t.crud.deletePost()

    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        content: stringArg({ nullable: true }),
      },
      resolve: (parent, { title, content }, ctx) => {
        return ctx.photon.posts.createPost({ title, content })
      },
    })

    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: {
        id: idArg(),
      },
      resolve(parent, { id }, ctx) {
        return ctx.photon.posts.updatePost({
          where: { id },
          data: { published: true },
        })
      },
    })
  },
})
```

## Links

- [Examples](/todo)
- [Nexus](/todo)
- [Prisma](/todo)

<p align="center">
  <img src="https://i.imgur.com/8qvElTM.png" width="300" align="center" />
  <h1 align="center">nexus-prisma</h1>
</p>

[![CircleCI](https://circleci.com/gh/prisma-labs/nexus-prisma.svg?style=svg)](https://circleci.com/gh/prisma-labs/nexus-prisma)

`nexus-prisma` is a Nexus plugin for bridging [Prisma](https://www.prisma.io) and [Nexus](https://nexus.js.org). It extends the Nexus DSL `t` with `.model` and `.crud` making it easy to project Prisma models and operations against them in your GraphQL API. The resolvers for these operations (pagination, filtering, ordering, and more), are dynamically created for yo u removing the need for traditional ORMs/query builders like TypeORM, Sequelize, or Knex. And when you do need to drop down into custom resolvers a [`Photon`](https://photonjs.prisma.io) instance on `ctx` will be ready to serve you, the same great tool `nexus-prisma` itself bulids upon.

### Contents <!-- omit in toc -->

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Example](#example)
- [Reference](#reference)
  - [`t.model`](#tmodel)
    - [Model-Object Mapping](#model-object-mapping)
    - [Enum](#enum)
    - [Scalar](#scalar)
    - [Relation](#relation)
    - [List Enum](#list-enum)
    - [List Scalar](#list-scalar)
    - [List Relation](#list-relation)
  - [`t.crud`](#tcrud)
    - [Create](#create)
    - [Read](#read)
    - [Update](#update)
    - [Upsert](#upsert)
    - [Delete](#delete)
    - [Batch Read](#batch-read)
    - [Batch Update](#batch-update)
    - [Batch Delete](#batch-delete)
  - [Options](#options)
    - [`alias`](#alias)
    - [`type`](#type)
    - [`ordering`](#ordering)
    - [`pagination`](#pagination)
    - [`filtering`](#filtering)
  - [GraphQL Schema Contributions](#graphql-schema-contributions)
    - [How to Read](#how-to-read)
    - [Lookup](#lookup)
    - [Batch Filtering](#batch-filtering)
    - [Batch Operations](#batch-operations)
  - [System Behaviours](#system-behaviours)
    - [Null-Free Lists](#null-free-lists)
  - [Configuration](#configuration)
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

# Reference

## `t.model`

Only available within [`Nexus.objectType`](https://nexus.js.org/docs/api-objecttype) definitions.

`t.model` contains configurable _field projectors_ that you use for projecting fields of your [Prisma models](https://github.com/prisma/prisma2/blob/master/docs/data-modeling.md#models) onto your [GraphQL Objects](https://graphql.github.io/graphql-spec/June2018/#sec-Objects). The precise behaviour of field projectors vary by the Prisma type being projected. Refer to the respective sub-sections for details.

<br>

### Model-Object Mapping

`t.model` will either have field projectors for the Prisma model whose name matches that of the GraphQL `Object`, or if the GraphQL `Object` is of a name that does not match any of your Prisma models then `t.model` becomes a function allowing you to specify the mapping, after which the field projectors become available.

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

<br>

### Enum

_Auto-Projection_

When a Prisma enum field is projected, the coressponding enum type will be automatically projected too (added to the GraphQL schema).

_Member Customization_

You can customize the projected enum members by defining the enum yourself in Nexus. `nexus-prisma` will treat the name collision as an intent to override and so disable auto-projection.

_Option Notes_

Currently Prisma enums cannot be [aliased](#alias) ([issue](https://github.com/prisma-labs/nexus-prisma/issues/474)). They also cannot be [type mapped](#type) since enum types cannot be mapped yet ([issue](https://github.com/prisma-labs/nexus-prisma/issues/473)).

**Options**

n/a

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
type M {
  MEF: E # ! <-- if not ? or @default
}

# if not defined by user
enum E {
  EV
}
```

**Example**

```gql
enum Mood {
  HAPPY
  SAD
  CONFUSED
}

enum Role {
  AUTHOR
  EDITOR
}

type User {
  role: Role
  mood: Mood
}
```

```ts
enumType({
  name: 'Role',
  members: ['MEMBER', 'EDITOR'],
})

objectType({
  name: 'User',
  definition(t) {
    t.model.role()
    t.model.mood()
  },
})
```

```prisma
model User {
  role Role
  mood Mood
}

enum Mood {
  HAPPY
  SAD
  COMFUSED
}

enum Role {
  MEMBER
  EDITOR
  ADMIN
}
```

<br>

### Scalar

_Scalar Mapping_

[Prisma scalars](https://github.com/prisma/prisma2/blob/master/docs/data-modeling.md#scalar-types) are mapped to [GraphQL scalars](https://graphql.org/learn/schema/#scalar-types) as follows:

```
Prisma       GraphQL
------       -------
Boolean   <>  Boolean
String    <>  String
Int       <>  Int
Float     <>  Float
cuid()    <>  ID
DateTime  <>  DateTime (custom scalar)
uuid()    <>  UUID (custom scalar)
```

_Auto-Projection_

When a Prisma scalar is encountered that does not map to the standard GraphQL scalar types, it will be automatically projected (custom scalar added to the GraphQL schema). Examples include `DateTime` and `UUID`.

_Option Notes_

It is not possible to use [`type`](#type) because there is currently no way for a Prisma scalar to map to a differntly named GraphQL scalar.

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
type M {
  MSF: S # ! <-- if not ? or @default
}

scalar S # if not matching a standard GQL scalar
```

**Options**

[`alias`](#alias)

**Example**

```gql
type Post {
  id: Int!
  email: String!
  scheduledPublish: DateTime
  rating: Float!
  active: Boolean!
}

scalar DateTime
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
    t.model.scheduledPublish()
    t.model.rating()
    t.model.active()
  },
})
```

```prisma

model User {
  id               String     @id @default(cuid())
  email            String
  scheduledPublish DateTime?
  rating           Float
  active           Boolean
}
```

<br>

### Relation

Projecting relational fields only affects the current GraphQL object being defined. That is, the model that the field relates to is not auto-projected. This is a design choice intended to keep the `nexus-prisma` system predictable for you. If you forget to project a relation you will receive feedback at build/boot time letting you know.

**Options**

[`type`](#type) [`alias`](#alias)

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
type M {
  MRF: RM # ! <-- if not ?
}
```

**Example**

```gql
type User {
  latestPost: Post
}
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.latestPost()
  },
})
```

```prisma
model User {
  latestPost Post?
}

model Post {
  title String
  body String
}
```

<br>

### List Enum

Like [enums](#enum). It is not possible to order ([issue](https://github.com/prisma-labs/nexus-prisma/issues/466)) paginate ([issue](https://github.com/prisma-labs/nexus-prisma/issues/468)) or filter ([issue](https://github.com/prisma-labs/nexus-prisma/issues/467)) enum lists.

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
type M {
  MLEF: [E!]!
}

# if not defined by user
enum E {
  EV
}
```

<br>

### List Scalar

Like [scalars](#scalar). It is not possible to order ([issue](https://github.com/prisma-labs/nexus-prisma/issues/470)) paginate ([issue](https://github.com/prisma-labs/nexus-prisma/issues/471)) or filter ([issue](https://github.com/prisma-labs/nexus-prisma/issues/469)) scalar lists.

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
type M {
  MLSF: [S!]!
}
```

<br>

### List Relation

Like [relations](#relation) but also supports batch related options.

**Options**

[`type`](#type) [`alias`](#alias) [`filtering`](#filtering) [`pagiantion`](#pagiantion) [`ordering`](#ordering)

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
type M {
  MLRF: [RM!]!
}
```

<br>

## `t.crud`

Only available within GraphQL `Query` and `Mutation` definitions.

`t.crud` contains configurable _operation publishers_ that you use for exposing create, read, update, and delete mutations against your projected Prisma models.

There are 8 kinds of operations (reflecting a subset of [Photon.js](https://photonjs.prisma.io)'s capabilities). An _operation publisher_ is the combination of some operation kind and a particular Prisma model. Thus the number of operation publishers on `t.crud` is `Prisma model count × operation kind count`. So for example if you defined 20 Prisma models then you would see 160 operation publishers on `t.crud`.

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
  ...
}
```

<br>

### Create

```
t.crud.createOne<M>
```

Allow clients to create one record at at time of the respective Prisma model.

Relation fields may be connected with an existing record or a sub-create may be inlined (generally referred to as _nested mutations_). If the relation is a `List` then multiple connections or sub-creates are permitted.

Inlined creates are very similar to top-level ones but have the important difference that the sub-create has excluded the field where supplying its relation to the type of parent `Object` being created would _normally be_. This is because a sub-create forces its record to relate to the parent one.

**Underlying Photon Function**

[`create`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#create)

**Options**

[`type`](#type) [`alias`](#alias)

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
mutation {
  createOne_M(data: M_CreateInput): M!
}

input M_CreateInput {
  MSF: S                       # ! <-- if not ? or @default
  MRF: RM_CreateManyWithout_M  # ! <-- if not ? or @default
}

input RM_CreateManyWithout_M {
  connect: [RM_WhereUniqueInput!]
  create: [RM_CreateWithout_M_Input!]
}

input RM_WhereUniqueInput {
  RMF@unique: S
}

input RM_CreateWithout_M_Input = RM_CreateInput - RMRF: M
```

**Example**

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

<br>

### Read

```
t.crud.<M>
```

Allow clients to find one particular record of the respective Prisma model. They may search by any Prisma model field that has been marked with `@unique` attribute.

The ability for list fields to be [filtered](#filtering) [ordered](#ordering) or [paginted](#pagination) depends upon if those features have been enabled for those GraphQL objects via [`t.model.<ListRelation>`](#list-relation).

**Underlying Photon Function**

[`findOne`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#findone)

**Options**

[`type`](#type) [`alias`](#alias)

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
mutation {
  M(where: M_WhereUniqueInput): M!
}

input M_WhereUniqueInput {
  MF: S # if @unique
}
```

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

<br>

### Update

```
t.crud.updateOne<M>
```

Allow clients to update one particular record at a time of the respective Prisma model.

**Underlying Photon Function**

[`update`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#update)

**Options**

[`type`](#type) [`alias`](#alias)

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
mutation {
  updateOne_M(data: M_UpdateInput!, where: M_WhereUniqueInput!): M
}

input M_WhereUniqueInput {
  MF: S # if @unique
}

input M_UpdateInput {
  MSF: S
  MRF: RM_UpdateManyWithout_M_Input
}

input RM_UpdateManyWithout_M_Input {
  connect: [RM_WhereUniqueInput!]
  create: [RM_CreateWithout_M_Input!]
  delete: [RM_WhereUniqueInput!]
  deleteMany: [RM_ScalarWhereInput!]
  disconnect: [RM_WhereUniqueInput!]
  set: [RM_WhereUniqueInput!]
  update: [RM_UpdateWithWhereUniqueWithout_M_Input!]
  updateMany: [RM_UpdateManyWithWhereNestedInput!]
  upsert: [RM_UpsertWithWhereUniqueWithout_M_Input!]
}

input RM_WhereUniqueInput {} # pattern like M_WhereUniqueInput

input RM_CreateWithout_M_Input {} # RM_CreateInput - RMRF: M

input RM_ScalarWhereInput {
  AND: [RM_ScalarWhereInput!]
  NOT: [RM_ScalarWhereInput!]
  OR: [RM_ScalarWhereInput!]
  RMSF: S_Filter # StringFilter | IntFilter | ... TODO
}

input RM_UpdateWithWhereUniqueWithout_M_Input {
  data: RM_UpdateWithout_M_DataInput!
  where: RM_WhereUniqueInput!
}
input RM_UpdateWithout_M_DataInput {
  RMSF: S
}

input RM_UpdateManyWithWhereNestedInput {
  data: RM_UpdateManyDataInput!
  where: RM_ScalarWhereInput!
}

input RM_UpsertWithWhereUniqueWithout_M_Input {
  create: RM_CreateWithout_M_Input!
  update: RM_UpdateWithout_M_DataInput!
  where: RM_WhereUniqueInput!
}

# TODO StringFilter ...

input IntFilter {
  equals: S
  gt: S
  gte: S
  in: [S!]
  lt: S
  lte: S
  not: S
  notIn: [S!]
}
```

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

<br>

### Upsert

```
t.crud.upsertOne<M>
```

Allow clients to update or create (aka. insert) one particular record at a time of the respective Prisma model. This operation is a combination of [create](#create) and [update](#update). The generated GraphQL mutation matches `data` and `where` args to those of update, and `create` to that of `data` arg in create. Unlike update, upsert guarantees a return value.

**Underlying Photon Function**

[`upsert`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#upsert)

**Options**

[`type`](#type) [`alias`](#alias)

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
mutation {
  upsertOne_M(
    create: M_CreateInput!      # like createOne(data ...)
    data: M_UpdateInput!        # like updateOne(data ...)
    where: M_WhereUniqueInput!  # like updateOne(where ...)
  ): M!
}
```

**Example**

Refer to [update](#update) and [create](#create).

<br>

### Delete

```
t.crud.deleteOne<M>
```

Allow clients to delete one particular record at a time of the respective Prisma model.

**Underlying Photon Function**

[`delete`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#delete)

**Options**

[`type`](#type) [`alias`](#alias)

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
mutation {
  deleteOne_M(where: M_WhereUniqueInput): M
}

input M_WhereUniqueInput {
  MF@unique: S
}
```

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

<br>

### Batch Read

```
t.crud.<M Pluralized>
```

Allow clients to fetch multiple records at once of the respective Prisma model.

**Underlying Photon Function**

[`findMany`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#findMany)

**Options**

[`type`](#type) [`alias`](#alias) [`filtering`](#filtering) [`pagiantion`](#pagiantion) [`ordering`](#ordering)

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
type Query {
  M_s: [M!]!
}
```

**Example**

```gql
type Query {
  users: [User!]!
}

type Post {
  author: User!
  id: Int!
  title: String!
}

type User {
  email: String!
  id: ID!
  posts: [Post!]!
}
```

```ts
queryType({
  definition(t) {
    t.users()
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

<br>

### Batch Update

```
t.crud.updateMany<M>
```

Allow clients to update multiple records of the respective Prisma model at once. Clients get back a `BatchPayload` object letting them know the number of affected records, but not access to the fields of affected records.

**Underlying Photon Function**

[`updateMany`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#updateMany)

**Options**

[`type`](#type) [`alias`](#alias)

**Example**

TODO

Like [`t.crud.<update>`](#update).

<br>

### Batch Delete

```
t.crud.deleteMany<M>
```

Allow clients to delete multiple records of the respective Prisma model at once. Clients get back a `BatchPayload` object letting them know the number of affected records, but not access to the fields of affected records.

**Underlying Photon Function**

[`deleteMany`](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#deleteMany)

**Options**

[`type`](#type) [`alias`](#alias)

**Example**

TODO

Like [`t.crud.<delete>`](#delete).

<br>

## Options

### `alias`

```
undefined | String
```

**Applies To**

`t.crud.<*>` `t.model.<* - enum, list enum>`

**About**

- `undefined` (default) By default Prisma model fields project onto GraphQL object fields of the same name.
- `string` Change which GraphQL object field the Prisma model field projects onto.

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

n/a

**Example**

```gql
type Post {
  content: String!
}
```

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.body({ alias: 'content' })
  },
})
```

```prisma
model Post  {
  body String
}
```

<br>

### `type`

```
undefined | String
```

**Applies To**

`t.crud.<*>` [`t.model.<Relation>`](#relation-field) [`t.model.<ListRelation>`](#list-field)

**About**

- `undefined` (default) Point Prisma field to a GraphQL object whose name matches that of the Prisma field model type.

- `string` Point Prisma field to the given GraphQL object. This option can become necessary when you've have done [model-object mapping](#model-object-mapping) and other Prisma models in your schema have relations to the name-mapped Prisma model. We are interested in devloping further the model-object mapping API so that it automates this better ([issue](https://github.com/prisma-labs/nexus-prisma/issues/461)).

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

n/a

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

<br>

### `ordering`

```
undefined | true | false | Whitelist
```

**Applies To**

[`t.crud.<BatchRead>`](#batch-read) [`t.model.<ListRelation>`](#list-relation)

**About**

Allow clients to order the records in a list field. Records can be ordered by their projected scalar fields in ascending or descending order. Ordering by fields on relations is not currently possible ([issue](https://github.com/prisma/photonjs/issues/249)).

- `undefined` (default) Like `false`
- `false` Disable ordering
- `true` Enable ordering by all scalar fields
- `Whitelist` (`Record<string, true>`) Enable ordering by just scalar fields appearing in the given whitelist.

**GraphQL Schema Contributions** [`?`](graphql-schema-contributions 'How to read this')

```gql
# t.crud.<BatchRead>
M(orderBy: M_OrderByInput)

# t.model.<ListRelation>
type M {
  MF(orderBy: M_OrderByInput)
}

input M_OrderByInput {
  MSF: OrderByArg
  # It is not possible to order by relations
}

enum OrderByArg {
  asc
  desc
}
```

**Example**

```gql
query entrypointOrdering {
  users(orderBy: { name: asc }) {
    id
    name
  }
}

query relationOrdering {
  user(where: { id: 1643 }) {
    posts(orderBy: { title: dsc }) {
      title
      body
    }
  }
}
```

```gql
type Query {
  user(where: UserWhereUniqueInput!): User
  users(orderBy: UserOrderByInput): [User!]!
}

type Post {
  body: String!
  id: Int!
  title: String!
}

type User {
  id: Int!
  name: String!
  posts(orderBy: UserPostsOrderByInput): [Post!]!
}

input UserOrderByInput {
  id: OrderByArg
  name: OrderByArg
}

input UserPostsOrderByInput {
  title: OrderByArg
}

input UserWhereUniqueInput {
  id: Int
}

enum OrderByArg {
  asc
  desc
}
```

```ts
objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.title()
    t.model.body()
  },
})

objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.posts({ ordering: { title: true } })
  },
})

queryType({
  definition(t) {
    t.crud.user()
    t.crud.users({ ordering: true })
  },
})
```

```prisma
model User {
  id    Int @id
  name  String
  posts Post[]
}

model Post {
  id    Int @id
  title String
  body  String
}
```

<br>

### `pagination`

```
undefined | true | false
```

**Applies To**

[`t.crud.<BatchRead>`](#batch-read) [`t.model.<ListRelation>`](#list-relation)

**About**

Powered by [Photon pagination](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#findmany).

- `undefined` (default) Like `true`
- `true` Enable pagination
- `false` Disable paginaton

**GraphQL Schema Contribuations**

```gql
# t.crud.<BatchRead>
Ms(
  # The starting object for the list (typically ID or other unique value).
  after: String

  # The last object for the list (typically ID or other unique value)
  before: String

  # How many elements, forwards from `after` otherwise head
  first: Int

  # How many elements, backwards from `before` otherwise tail
  last: Int

  # The offset, if `first` used then forwards from `after` (otherwise head), if `last` used then backwrads from `before` (otherwie tail)
  skip: Int
)

# t.model.<ListRelation>
type M {
  RF(after: String, before: String, first: Int, last: Int, skip: Int)
}
```

**Example**

todo

```gql
query batchRead {
  users(skip: 50, first: 50) {
    id
    name
  }
}

query batchReadRelation {
  user(where: { id: 1643 }) {
    posts(last: 10) {
      title
      body
    }
  }
}
```

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.friends({ pagination: true })
  },
})

queryType({
  definition(t) {
    t.crud.users({ pagination: true })
  },
})
```

<br>

### `filtering`

```
true | false | Whitelist
```

Powered by [Photon filtering](https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#filtering).

**Applies To**

[`t.crud.<BatchRead>`](#batch-read) [`t.model.<ListRelation>`](#list-relation)

**About**

https://github.com/prisma/prisma2/blob/master/docs/photon/api.md#filtering

**GraphQL Contributions**

Refer to [Batch Filtering](#batch-filtering)

**Example**

todo

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

```ts
objectType({
  name: 'User',
  definition(t) {
    t.model.friends({ filtering: true })
  },
})

queryType({
  definition(t) {
    t.crud.users({ filtering: true })
  },
})
```

<br>

## GraphQL Schema Contributions

### How to Read

```
M = model   F = field   L = list   S = scalar   E = enum   R = relation  V = value
```

todo

### Lookup

### Batch Filtering

**Entrypoints**

```gql
query {
  Ms(where: M_WhereInput, ...)
}

mutation {
  updateMany_M(where: M_WhereInput, ...)
  deleteMany_M(where: M_WhereInput, ...)
}
```

**Types**

```gql
input M_WhereInput {
  AND: [M_WhereInput!]
  NOT: [M_WhereInput!]
  OR: [M_WhereInput!]
  MSF: S_Filter
  MRF: RM_Filter
}

input RM_Filter {
  every: RM_WhereInput # recurse pattern -> M_WhereInput
  none: RM_WhereInput # recurse pattern -> M_WhereInput
  some: RM_WhereInput # recurse pattern -> M_WhereInput
}

input M_Filter {
  every: M_WhereInput
  none: M_WhereInput
  some: M_WhereInput
}

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
```

### Batch Operations

```gql
type BatchPayload {
  count: Int!
}
```

<br>

## System Behaviours

### Null-Free Lists

Projection for Prisma list types always project as a fully non-nullable GraphQL type. This is because Prisma list fields (and list member type) can themselves never be null, and because Prisma does not support `@default` on list types.

For consistentcy we also apply the same pattern for `t.crid.<BatchRead>`.

```gql
type Query {
  users: [User!]!
}

type User {
  posts: [Post!]!
}
```

```ts
queryType({
  definition(t) {
    t.crud.users()
  },
})
objectType({
  name: 'User',
  definition(t) {
    t.crud.posts()
  },
})
```

```Prisma
model User {
  posts Post[]
}
```

## Configuration

TODO

<br>

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

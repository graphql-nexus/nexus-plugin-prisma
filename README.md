<p align="center">
  <img src="https://i.imgur.com/8qvElTM.png" width="300" align="center" />
  <h1 align="center">nexus-prisma</h1>
</p>

[![CircleCI](https://circleci.com/gh/prisma-labs/nexus-prisma.svg?style=svg)](https://circleci.com/gh/prisma-labs/nexus-prisma)

`nexus-prisma` is a plugin for bridging [Prisma](https://www.prisma.io) and [Nexus](https://nexus.js.org). It extends the Nexus DSL `t` with `.model` and `.crud` making it easy to expose Prisma models and operations against them in your GraphQL API. The resolvers for these operations (pagination, filtering, ordering, and more), are dynamically created for you removing the need for traditional ORMs/query builders like TypeORM, Sequelize, or Knex. And when you do need to drop down into custom resolvers a [Photon](https://photonjs.prisma.io) instance on `ctx` will be ready to serve you, the same great tool `nexus-prisma` itself bulids upon.

**Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Example](#example)
- [Guide](#guide)
  - [Query](#query)
    - [Pagination](#pagination)
    - [Ordering](#ordering)
    - [Filtering](#filtering)
- [Reference](#reference)
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

## Installation

```
npm install nexus-prisma
```

## Example

Given a prisma schema like:

```prisma
model User {
  id     String @id @default(cuid())
  handle String
  posts  Post[]
}

model Post {
  id     Int    @id
  author User[]
}
```

You will be able to work with your models and expose operations against them like so:

```ts
const Query = queryType({
  definition(t) {
    t.crud.user()
    t.crud.users({ ordering: true })
    t.crud.post()
    t.crud.posts({ filtering: true })
  },
})

const Mutation = mutationType({
  definition(t) {
    t.crud.createUser()
    t.crud.createPost()
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.handle()
    t.model.posts()
  },
})

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.model.id()
    t.model.author()
  },
})
```

<br>

<details>
<summary>Resulting in a GraphQL Schema like this (toggle me)</summary>

```graphql
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

You can find a runnable version of this and other examples [here](/TODO).

## Guide

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

  ```graphql
  after: String
  before: String
  first: Int
  last: Int
  skip: Int
  ```

Example query:

```graphql
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

```graphql
orderBy: UserOrderBy # <field type>OrderBy

input UserOrderBy {
  # <User field name>: OrderByDir
  a: OrderByDir
  b: OrderByDir
}

enum OrderByDir { asc desc }
```

Example query:

```graphql
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

```graphql
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

```graphql
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

## Reference

## Recipes

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

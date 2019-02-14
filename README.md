<p align="center"><img src="https://i.imgur.com/8qvElTM.png" width="300" /></p>

# nexus-prisma

Prisma Plugin for Nexus

## Motivation

**nexus-prisma** generates a working CRUD GraphQL schema based on your prisma datamodel. It leverages [`nexus`](https://github.com/prisma/nexus) code-first power to easily expose/hide/customise types from the generated schema and solve most of the common problems previously faced while using the SDL-first paradigm.

If you want to give it a quick look, check it out here:

[![Edit example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/v3wrqz7445)

## Features

- Great DX with built-in (and almost invisible) type-safety
- Easily expose and customise types from your Prisma API
- Automatically resolve queries of Prisma types
- Incrementally adoptable
- Compatible both with TypeScript and JavaScript
- Compatible with any GraphQL Server

## Usage

This assumes you are already using `prisma`.

Install `nexus-prisma`

```bash
yarn add nexus nexus-prisma
```

Edit your `prisma.yml` file, and add the following:

```yml
hooks:
  post-deploy:
    - prisma generate
    - npx nexus-prisma-generate --client prisma-client-dir --output ./src/generated/nexus-prisma # Runs the codegen tool from nexus-prisma
```

Then run `prisma deploy` or `npx nexus-prisma-generate`. This will generate TS types based on the Prisma GraphQL API.

Once done, you can start using the library as so:

```ts
import { GraphQLServer } from 'graphql-yoga'
import { makePrismaSchema, prismaObjectType } from 'nexus-prisma'
import * as path from 'path'
import { prisma } from '__PRISMA_CLIENT_DIR__'
import datamodelInfo from './generated/nexus-prisma'

const Query = prismaObjectType({ name: 'Query' })
const Mutation = prismaObjectType({ name: 'Mutation' })

const schema = makePrismaSchema({
  // Generated CRUD Query and Mutation types
  types: [Query, Mutation],
  prisma: {
    // Prisma's datamodel information
    datamodelInfo,
    // The prisma-client instance
    client: prisma,
  },
  outputs: {
    schema: path.join(__dirname, './schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },
})

const server = new GraphQLServer({
  schema,
  context: { prisma },
})

server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))
```

That's it. You can now enjoy a fully working CRUD GraphQL API.

## API

## `prismaObjectType`

`prismaObjectType` is a wrapper around nexus' `objectType`. It adds special methods to the `t` object for you to expose fields of your Prisma GraphQL types.

**All the fields exposed using `nexus-prisma` are automatically resolved. No code is needed besides which fields you want to expose.**

### `t.prismaFields`

**Signature** (simplified types)

```ts
interface Field {
  name: string // Name of the field you want to expose
  alias: string // Name of the alias of you want to give the field
  args: string[] // Arguments of the field you want to expose
}

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
```

### Examples

**Exposes all fields**

```ts
const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields(['*'])
  },
})
```

**Exposes only the `id` and `name` field**

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

**Exposes all fields but the `id` and `name`**

```ts
const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields({ filter: ['id', 'name'] })
  },
})
```

**Exposes only the `users` field, and alias it to `customers`**

```ts
const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.prismaFields([{ name: 'users', alias: 'customers' }])
  },
})
```

**Exposes only the `users` field, and only the `first` and `last` args**

```ts
const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.prismaFields([{ name: 'users', args: ['first', 'last'] }])
  },
})
```

### `t.prismaType`

Contains all the options to use native `nexus` methods with `nexus-prisma` generated schema

### Examples

Pass in all the options as-is

```ts
const Query = prismaObjectType({
  name: 'Query',
  definition(t) {
    t.field('users', t.prismaType.users)
  },
})
```

Use all the options, but overide the resolver

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

Use all the options, add more arguments with a custom resolver

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

# nexus-prisma

Prisma Plugin for Nexus

## Motivation

[Nexus](https://graphql-nexus.com/) is a library that helps you build your GraphQL schema in a programmatic way versus using the SDL syntax. While SDL might seem more concise at first, defining your schema in a programmatic way allows you to leverage the power of the language to solve lots of common problems faced with SDL.

At Prisma, we think that approach (named _"resolver-first"_ instead of _"schema-first"_) gives lots of benefits while using Prisma as well, solving many problems users were facing while using the SDL approach (like importing types...)

If you want to give it a quick look, check it out here:

[![Edit example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/prisma/nexus-prisma/tree/master/example)

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

    yarn add nexus-prisma

Edit your `prisma.yml` file, and add the following:

```yml
hooks:
  post-deploy:
    - npx nexus-prisma-generate # Runs the codegen tool from nexus-prisma
```

Then run `prisma deploy` or `npx nexus-prisma-generate`. This will generate TS types based on the Prisma GraphQL API.

Once done, you can start using the library as so (assuming you have a `User` type in your datamodel):

```ts
import { prismaObjectType } from 'nexus-prisma'

export const User = prismaObjectType('User') // Or any other type exposed in your Prisma GraphQL API
```

- _NOTE_: When passing no function as second parameter, `prismaObjectType` will expose **all the fields** of your type.

## API

`prismaObjectType` is a wrapper around `objectType`. Therefore, everything doable with `objectType` can also be done with `prismaObjectType`

```ts
import { prismaObjectType } from 'nexus-prisma'

export const Query = prismaObjectType('Query', t => {
  t.string('hello')
})
```

### Exposing types from your Prisma API

However, `prismaObjectType` adds a special method to the `t` object for you to expose fields of your Prisma GraphQL types.

**All the fields exposed using `nexus-prisma` are automatically resolved. No code is needed besides which fields you want to expose.**

**Signature** (simplified types)

```ts
interface Field {
  name: string // Name of the field you want to expose
  alias: string // Name of the alias of you want to give the field
  args: string[] // Arguments of the field you want to expose
}

/**
 * Exposes fields of a Prisma GraphQL object type
 * Usage: t.prismaFields(['id', { name: 'name', alias: 'firstName' }])
 */
t.prismaFields(fieldsToExpose: string[] | Field[] | undefined)
/**
 * Exposes fields of a Prisma GraphQL object type
 * Usage: t.prismaFields({ pick: ['id', { name: 'name', alias: 'firstName' }] })
 * (Equivalent to the above)
 */
t.prismaFields({ pick: string[] | Field[] })
/**
 * Hides fields of a Prisma GraphQL object type
 * Usage: t.prismaFields({ hide: ['age'] })
 * Usage: t.prismaFields({ hide: (fields) => !fields.includes(['age']) })
 */
t.prismaFields({ filter: (string[] | Field[]) | (fields: string[]) => string[] })
```

**Examples**

In its simplest usage, `t.prismaFields()` expects as input the list of name of fields you want to expose.

```ts
import { prismaObjectType } from 'nexus-prisma'

export const Mutation = prismaObjectType('Mutation', t => {
  t.prismaFields(['createUser', 'deleteUser']) // Expose 'createUser' and 'deleteUser' mutation from your Prisma GraphQL API
  t.string('hello') // Add other custom fields
})
```

Alternatively, you can also customise the way you want them exposed using objects:

```ts
import { prismaObjectType } from 'nexus-prisma'

export const Query = prismaObjectType('Query', t => {
  t.prismaFields(['createUser', { name: 'deleteUser', alias: 'removeUser' }]) // Expose 'createUser' and 'deleteUser' ( as 'removeUser') mutations from your Prisma GraphQL API
  t.int('age') // Expose other custom fields
})
```

To expose all fields from a type without having to enumerate them, you can also do the following

```ts
import { prismaObjectType } from 'nexus-prisma'

export const User = prismaObjectType('User', t => {
  t.prismaFields() // Exposes all fields of 'User' object type
})

// Or the following
export const User = prismaObjectType('User')
```

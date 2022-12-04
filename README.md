<p align="center">
  <img src="https://i.imgur.com/8qvElTM.png" width="300" align="center" />
  <h1 align="center">@morgothulhu/nexus-plugin-prisma</h1>
</p>

This plugin has been upgraded to support **Prisma 4.0+**. Latest version of prisma supported: [Prisma 4.7.1](https://github.com/prisma/prisma/releases/tag/4.7.1)

---

**Note:** A [replacement](https://github.com/prisma/nexus-prisma/) for this library is under development and available in early preview. More details in [#1039](https://github.com/graphql-nexus/nexus-plugin-prisma/issues/1039). Since the Prisma team is no longer keeping this library up to date with new Prisma versions, we have forked it.

This plugin integrates [Prisma](https://www.prisma.io/) into [Nexus](https://nexusjs.org/). It gives you an API you to project fields from models defined in your Prisma schema into your GraphQL API. It also gives you an API to build GraphQL root fields that allow your API clients to query and mutate data.

You can find the [documentation on the Nexus website](https://nexusjs.org/docs/plugins/prisma/overview).

**Note2:** This package is a fork from [kenchi's](https://github.com/kenchi/nexus-plugin-prisma). Thank you for your support pre-prisma 4.0.

## Usage notes

### AWS Lambda packaging

Make sure to include `@prisma/internals` in your AWS Lambda packaged `node_modules` folder, in addition to the `@prisma/client` package.

To mitigate overall package size issues, remove all `libquery_engine-debian-openssl-1.1.x.so.node` files under `node_modules/@prisma` as they are not leveraged by AWS Lambda.

## Installation

```
npm install @morgothulhu/nexus-plugin-prisma
# OR
yarn add @morgothulhu/nexus-plugin-prisma
```

## Package management

### Build, test

> build

```
yarn
yarn build
```

> test

`yarn test`

If tests need snapshot updates, run `yarn test:run:rebaseSnapshots`

### Windows pre-requisites

> Install SQLite3

(follow instructions from [here](http://sqlitetutorials.com/sqlite-installation.html))

## Interactive test run

> Windows 32 (as an example)

`.\node_modules\.bin\jest --forceExit --verbose=true --useStderr=true --silent=false -t "supports nested query with one id field" --watch`

`.\node_modules\.bin\jest --forceExit --verbose=true --useStderr=true --silent=false --watch ./tests/app.test.ts`

> validate sqlite install

```
[System.Environment]::SetEnvironmentVariable("DEBUG", "*")
cls ; .\node_modules\.bin\jest --forceExit --verbose --useStderr -t "supports custom resolver for t.crud" custom-
```

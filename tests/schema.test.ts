import { objectType } from 'nexus'
import { printSchema } from 'graphql'
import { generateSchema } from './__utils'

test('simple schema', async () => {
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.name()
    },
  })
  const datamodel = `
    model User {
      id    Int @id
      name  String
    }
    `

  const schema = await generateSchema(datamodel, [User])

  expect(printSchema(schema)).toMatchSnapshot()
})

test('it exposes only pagination on relations by default', async () => {
  const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int @id
    }
    `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.posts()
    },
  })
  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
    },
  })

  const schema = await generateSchema(datamodel, [User, Post])

  expect(printSchema(schema)).toMatchSnapshot()
})

test('it exposes filtering only if filtering: true', async () => {
  const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int @id
    }
    `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.posts({ filtering: true })
    },
  })
  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
    },
  })

  const schema = await generateSchema(datamodel, [User, Post])

  expect(printSchema(schema)).toMatchSnapshot()
})

test('it exposes only id filters', async () => {
  const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int     @id
      name  String
    }
    `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.posts({ filtering: { id: true } })
    },
  })

  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
      t.model.name()
    },
  })

  const schema = await generateSchema(datamodel, [User, Post])

  expect(printSchema(schema)).toMatchSnapshot()
})

test('it exposes ordering only if ordering: true', async () => {
  const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int     @id
      name  String
    }
    `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.posts({ ordering: true })
    },
  })

  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
      t.model.name()
    },
  })

  const schema = await generateSchema(datamodel, [User, Post])

  expect(printSchema(schema)).toMatchSnapshot()
})

test('it exposes id ordering', async () => {
  const datamodel = `
    model User {
      id    Int @id
      posts Post[]
    }

    model Post {
      id    Int     @id
      name  String
    }
    `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.posts({ ordering: { id: true } })
    },
  })

  const Post = objectType({
    name: 'Post',
    definition(t: any) {
      t.model.id()
      t.model.name()
    },
  })

  const schema = await generateSchema(datamodel, [User, Post])

  expect(printSchema(schema)).toMatchSnapshot()
})

test('it exposes findOne and findMany', async () => {
  const datamodel = `
    model User {
      id    Int @id
    }
    `
  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.user()
      t.crud.users()
    },
  })
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const schema = await generateSchema(datamodel, [User, Query])

  expect(printSchema(schema)).toMatchSnapshot()
})

test('it exposes prisma scalars', async () => {
  const datamodel = `
  model A {
    id  String  @default(uuid()) @id @unique
    createdAt DateTime @default(now())
  }
  model B {
    id  String  @default(cuid()) @id @unique
  }
  `
  // uuid scalar + datetime
  const A = objectType({
    name: 'A',
    definition(t: any) {
      t.model.id()
      t.model.createdAt()
    },
  })

  // cuid scalar (should map to graphql's 'ID' scalar)
  const B = objectType({
    name: 'B',
    definition(t: any) {
      t.model.id()
    },
  })

  const schema = await generateSchema(datamodel, [A, B])

  expect(printSchema(schema)).toMatchSnapshot()
})

test("it only exposes pagination 'first' parameter", async () => {
  const datamodel = `
  model User {
    id    Int @id
  }
  `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ pagination: { first: true, skip: false } })
    },
  })

  const schema = await generateSchema(datamodel, [Query, User])

  expect(printSchema(schema)).toMatchSnapshot()
})

test('it does not expose pagination', async () => {
  const datamodel = `
  model User {
    id    Int @id
  }
  `
  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ pagination: false })
    },
  })

  const schema = await generateSchema(datamodel, [Query, User])

  expect(printSchema(schema)).toMatchSnapshot()
})

import { objectType } from '@nexus/schema'
import { createRuntimeTestContext } from '../__client-test-context'
import { generateSchemaAndTypes } from '../__utils'

let ctx = createRuntimeTestContext()

it('supports nested query with one id field', async () => {
  const datamodel = `
  model Parent {
    idField Int     @id
    child       Child
  }
  
  model Child {
    idField Int    @id
    parent      Parent @relation(fields: [parentId], references: [idField])
  
    parentId Int
  }
`

  const Parent = objectType({
    name: 'Parent',
    definition(t: any) {
      t.model.idField()
      t.model.child()
    },
  })

  const Child = objectType({
    name: 'Child',
    definition(t: any) {
      t.model.idField()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.parent()
    },
  })

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types: [Query, Parent, Child],
  })

  await dbClient.parent.create({
    data: {
      idField: 1,
      child: {
        create: {
          idField: 1,
        },
      },
    },
  })

  const result = await graphqlClient.request(`{
    parent(where: { idField: 1 }) {
      idField
      child {
        idField
      }
    }
  }`)

  expect(result).toMatchSnapshot()
})

it('supports nested query with compound ids', async () => {
  const datamodel = `
  model Parent {
    idField1 Int
    idField2 Int
    child        Child
  
    @@id([idField1, idField2])
  }
  
  model Child {
    idField1 Int
    idField2 Int
  
    parent        Parent @relation(fields: [parentId1, parentId2], references: [idField1, idField2])
    parentId1 Int
    parentId2 Int
  
    @@id([idField1, idField2])
  }
`

  const Parent = objectType({
    name: 'Parent',
    definition(t: any) {
      t.model.idField1()
      t.model.idField2()
      t.model.child()
    },
  })

  const Child = objectType({
    name: 'Child',
    definition(t: any) {
      t.model.idField1()
      t.model.idField2()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.parent()
    },
  })

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types: [Query, Parent, Child],
  })

  await generateSchemaAndTypes(datamodel, [Query, Parent, Child])

  await dbClient.parent.create({
    data: {
      idField1: 1,
      idField2: 2,
      child: {
        create: {
          idField1: 1,
          idField2: 2,
        },
      },
    },
  })

  const result = await graphqlClient.request(`{
    parent(
      where: {
        idField1_idField2: {
          idField1: 1,
          idField2: 2
        }
      }
    ) {
      idField1
      idField2
      child {
        idField1
        idField2
      }
    }
  }`)

  expect(result).toMatchSnapshot()
})

it('supports nested query without id but one unique', async () => {
  const datamodel = `
  model Parent {
    uniqueField Int     @unique
    child       Child
  }
  
  model Child {
    uniqueField Int    @unique
    parent      Parent @relation(fields: [parentId], references: [uniqueField])
  
    parentId Int
  }
`

  const Parent = objectType({
    name: 'Parent',
    definition(t: any) {
      t.model.uniqueField()
      t.model.child()
    },
  })

  const Child = objectType({
    name: 'Child',
    definition(t: any) {
      t.model.uniqueField()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.parent()
    },
  })

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types: [Query, Parent, Child],
  })

  await dbClient.parent.create({
    data: {
      uniqueField: 1,
      child: {
        create: {
          uniqueField: 1,
        },
      },
    },
  })

  const result = await graphqlClient.request(`{
    parent(where: { uniqueField: 1 }) {
      uniqueField
      child {
        uniqueField
      }
    }
  }`)

  expect(result).toMatchSnapshot()
})

it('supports nested query without id but multiple uniques', async () => {
  const datamodel = `
  model Parent {
    uniqueField1 Int   @unique
    uniqueField2 Int   @unique
    child        Child
  }
  
  model Child {
    uniqueField1 Int @unique
    uniqueField2 Int @unique
  
    parent   Parent @relation(fields: [parentId], references: uniqueField1)
    parentId Int
  }
`

  const Parent = objectType({
    name: 'Parent',
    definition(t: any) {
      t.model.uniqueField1()
      t.model.uniqueField2()
      t.model.child()
    },
  })

  const Child = objectType({
    name: 'Child',
    definition(t: any) {
      t.model.uniqueField1()
      t.model.uniqueField2()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.parent()
    },
  })

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types: [Query, Parent, Child],
  })

  await dbClient.parent.create({
    data: {
      uniqueField1: 1,
      uniqueField2: 2,
      child: {
        create: {
          uniqueField1: 1,
          uniqueField2: 2,
        },
      },
    },
  })

  const result = await graphqlClient.request(`{
    parent(where: { uniqueField2: 2 }) {
      uniqueField1
      uniqueField2
      child {
        uniqueField1
        uniqueField2
      }
    }
  }`)

  expect(result).toMatchSnapshot()
})

it('supports nested query without id but compound uniques', async () => {
  const datamodel = `
  model Parent {
    uniqueField1 Int
    uniqueField2 Int
    child        Child
  
    @@unique([uniqueField1, uniqueField2])
  }
  
  model Child {
    uniqueField1 Int
    uniqueField2 Int
  
    parent        Parent @relation(fields: [parentUnique1, parentUnique2], references: [uniqueField1, uniqueField2])
    parentUnique1 Int
    parentUnique2 Int
  
    @@unique([uniqueField1, uniqueField2])
  }
`

  const Parent = objectType({
    name: 'Parent',
    definition(t: any) {
      t.model.uniqueField1()
      t.model.uniqueField2()
      t.model.child()
    },
  })

  const Child = objectType({
    name: 'Child',
    definition(t: any) {
      t.model.uniqueField1()
      t.model.uniqueField2()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.parent()
    },
  })

  const { graphqlClient, dbClient } = await ctx.setup({
    datamodel,
    types: [Query, Parent, Child],
  })

  await generateSchemaAndTypes(datamodel, [Query, Parent, Child])

  await dbClient.parent.create({
    data: {
      uniqueField1: 1,
      uniqueField2: 2,
      child: {
        create: {
          uniqueField1: 1,
          uniqueField2: 2,
        },
      },
    },
  })

  const result = await graphqlClient.request(`{
    parent(
      where: {
        uniqueField1_uniqueField2: {
          uniqueField1: 1,
          uniqueField2: 2
        }
      }
    ) {
      uniqueField1
      uniqueField2
      child {
        uniqueField1
        uniqueField2
      }
    }
  }`)

  expect(result).toMatchSnapshot()
})

import { objectType } from '@nexus/schema'
import { createRuntimeTestContext } from '../__client-test-context'

let ctx = createRuntimeTestContext()

it('supports camel-cased model name', async () => {
  const datamodel = `
  datasource db {
    provider = "postgresql"
    url      = "postgresql://"
  }
  
  model CamelCasedModel {
    id  Int @id @default(autoincrement())
    camelCasedField String
  }
  `
  const CamelCasedModel = objectType({
    name: 'CamelCasedModel',
    definition(t: any) {
      t.model.id()
      t.model.camelCasedField()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.camelCasedModels()
    },
  })

  const { graphqlClient, dbClient } = await ctx.getContext({
    datamodel,
    types: [Query, CamelCasedModel],
  })

  await dbClient.camelCasedModel.create({
    data: {
      camelCasedField: 'something',
    },
  })

  const result = await graphqlClient.request(`{
    camelCasedModels {
      camelCasedField
    }
  }`)

  expect(result).toMatchInlineSnapshot(`
Object {
  "camelCasedModels": Array [
    Object {
      "camelCasedField": "something",
    },
  ],
}
`)
})

it('supports aliased model fields', async () => {
  const datamodel = `
    model AliasedFieldModel {
      id  Int @id @default(autoincrement())
      full_name String
    }
  `

  const AliasedFieldModel = objectType({
    name: 'AliasedFieldModel',
    definition(t: any) {
      t.model.id()
      t.model.full_name({ alias: 'fullName' })
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.aliasedFieldModels()
    },
  })

  const { graphqlClient, dbClient } = await ctx.getContext({
    datamodel,
    types: [Query, AliasedFieldModel],
  })

  await dbClient.aliasedFieldModel.create({
    data: {
      full_name: 'Jane Smith',
    },
  })

  const result = await graphqlClient.request(`{
    aliasedFieldModels {
      fullName
    }
  }`)

  expect(result).toMatchInlineSnapshot(`
Object {
  "aliasedFieldModels": Array [
    Object {
      "fullName": "Jane Smith",
    },
  ],
}
`)
})

import { objectType } from 'nexus'
import { generateSchemaAndTypes } from '../__utils'

it('support atomic operations (default)', async () => {
  const datamodel = `
  model ModelName {
    id      Int @id @default(autoincrement())
    name    String
    amount  Int
  }
`
  const ModelName = objectType({
    name: 'ModelName',
    definition(t: any) {
      t.model.id()
    },
  })

  const Mutation = objectType({
    name: 'Mutation',
    definition(t: any) {
      t.crud.createOneModelName()
      t.crud.deleteOneModelName()
      t.crud.updateOneModelName()
      t.crud.upsertOneModelName()
      t.crud.updateManyModelName()
    },
  })

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [Mutation, ModelName])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

it('disable atomic operations', async () => {
  const datamodel = `
  model ModelName {
    id      Int @id @default(autoincrement())
    name    String
    amount  Int
  }
`
  const ModelName = objectType({
    name: 'ModelName',
    definition(t: any) {
      t.model.id()
    },
  })

  const Mutation = objectType({
    name: 'Mutation',
    definition(t: any) {
      t.crud.createOneModelName()
      t.crud.deleteOneModelName()
      t.crud.updateOneModelName()
      t.crud.upsertOneModelName()
      t.crud.updateManyModelName()
    },
  })

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [Mutation, ModelName], {
    atomicOperations: false,
  })

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

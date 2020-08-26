import * as Nexus from '@nexus/schema'
import { generateSchemaAndTypes } from '../__utils'

it('generates publishers findOne and findMany', async () => {
  const datamodel = `
datasource db {
  provider = "postgresql"
  url      = "postgresql://"
}

model ModelName {
  id    Int @id @default(autoincrement())
  name  String
}
`

  const ModelName = Nexus.objectType({
    name: 'ModelName',
    definition(t: any) {
      t.model.id()
    },
  })
  const Query = Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.findOneModelName()
      t.crud.findManyModelName()
    },
  })

  const Mutation = Nexus.objectType({
    name: 'Mutation',
    definition(t: any) {
      t.crud.createOneModelName()
      t.crud.deleteOneModelName()
      t.crud.updateOneModelName()
      t.crud.upsertOneModelName()
      t.crud.updateManyModelName()
    },
  })

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [
    Query,
    Mutation,
    ModelName,
  ])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

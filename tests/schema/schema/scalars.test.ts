import * as Nexus from '@nexus/schema'
import { generateSchemaAndTypes } from '../__utils'

it('publishes date and json scalar output types', async () => {
  // datasource defined to postgres to enable Json type
  const datamodel = `
  datasource db {
    provider = "postgresql"
    url      = "postgresql://"
  }

  model User {
    id  Int @id @default(autoincrement())
    date DateTime
    json Json
    optionalJson Json?
  }
  `

  const User = Nexus.objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.date()
      t.model.json()
      t.model.optionalJson()
    },
  })

  const { schemaString, schema, typegen } = await generateSchemaAndTypes(datamodel, [User])

  expect(schema.getType('Json')).not.toEqual(undefined)
  expect(schema.getType('DateTime')).not.toEqual(undefined)
  expect(schemaString).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

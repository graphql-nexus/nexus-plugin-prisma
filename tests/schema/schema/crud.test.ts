import { objectType } from '@nexus/schema'
import { generateSchemaAndTypes } from '../__utils'

it('support models with only one id field (some crud operations are removed)', async () => {
  const datamodel = `
  datasource db {
    provider = "postgresql"
    url      = "postgresql://"
  }

  model User {
    id  Int @id @default(autoincrement())
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [User])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

import * as Nexus from '@nexus/schema'
import { generateSchemaAndTypes } from '../__utils'

it('orderby fields can be allow-listed', async () => {
  const datamodel = `
    model Foo {
      id  Int @id @default(autoincrement())
      a   String
      b   String
      c   String
    }
  `

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [
    Nexus.objectType({
      name: 'Foo',
      definition(t: any) {
        t.model.id()
      },
    }),
    Nexus.objectType({
      name: 'Query',
      definition(t: any) {
        t.crud.foos({ ordering: { b: true } })
      },
    }),
  ])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

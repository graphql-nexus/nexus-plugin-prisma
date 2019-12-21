import * as Nexus from 'nexus'
import { generateSchemaAndTypes } from './__utils'

const testData = {
  datamodel: `
  model User {
    id  Int @id
    name String
    nested Nested
  }

  model Nested {
    id Int @id
    name String
  }
`,
  query: Nexus.queryType({
    definition(t: any) {
      t.crud.user()
    },
  }),
  mutation: Nexus.mutationType({
    definition(t: any) {
      t.crud.createOneUser({
        upfilteredKey: 'create',
      })
    },
  }),
  user: Nexus.objectType({
    name: 'User',
    definition: (t: any) => {
      t.model.id()
      t.model.name()
      t.model.nested()
    },
  }),
  nested: Nexus.objectType({
    name: 'Nested',
    definition: (t: any) => {
      t.model.id()
      t.model.name()
    },
  }),
}

it('filters upfilteredKeys', async () => {
  const { datamodel, ...resolvers } = testData
  const { schema } = await generateSchemaAndTypes(
    datamodel,
    Object.values(resolvers),
  )
  expect(schema).toMatchSnapshot('upfilteredKeys')
})

import { objectType } from 'nexus'
import { generateSchemaAndTypes } from './__utils'

it('warns when wrong projected field or crud', async () => {
  const datamodel = `
  model User {
    id  Int @id
    username String
  }
`

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.userName() // wrong projected field
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.userss({ filtering: true }) // wrong crud field
    },
  })

  let outputData = ''
  const storeLog = (inputs: string) => (outputData += '\n' + inputs)
  console.log = jest.fn(storeLog)

  await generateSchemaAndTypes(datamodel, [Query, User])

  expect(outputData).toMatchInlineSnapshot(`
    "
    Warning: t.crud.userss() is not a valid CRUD field given your Prisma Schema.
    Warning: t.model.userName() does not map to a field in your Prisma Schema."
  `)
})

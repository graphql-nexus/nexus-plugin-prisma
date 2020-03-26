import { objectType } from '@nexus/schema'
import { generateSchemaAndTypes, mockConsoleLog } from '../__utils'

it('in dev stage, removes filtering or ordering entirely if no arg or wrong args are passed and log error', async () => {
  process.env.NODE_ENV = 'development'

  const datamodel = `
    model User {
      id  Int @id @default(autoincrement())
      name String
    }
  `

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.name()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({
        filtering: { somethingWrong: true },
        ordering: { somethingWrong: true },
      })
    },
  })

  const { schemaString: schema, $output, typegen } = await mockConsoleLog(
    async () => {
      return generateSchemaAndTypes(datamodel, [Query, User])
    },
  )

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
  expect($output).toMatchSnapshot('output')
})

it('in prod stage, throw error if no arg or wrong args are passed', async () => {
  process.env.NODE_ENV = 'production'

  const datamodel = `
    model User {
      id  Int @id @default(autoincrement())
      name String
    }
  `

  const User = objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
      t.model.name()
    },
  })

  const Query = objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({
        filtering: { somethingWrong: true },
        ordering: { somethingWrong: true },
      })
    },
  })

  try {
    const {
      schemaString: schema,
      typegen,
    } = await generateSchemaAndTypes(datamodel, [Query, User])

    expect(schema).toMatchSnapshot('schema')
    expect(typegen).toMatchSnapshot('typegen')
  } catch (e) {
    expect(e.message).toMatchSnapshot('output')
  }
})

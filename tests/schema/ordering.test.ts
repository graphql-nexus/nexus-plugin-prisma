import { objectType } from 'nexus'
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
    objectType({
      name: 'Foo',
      definition(t: any) {
        t.model.id()
      },
    }),
    objectType({
      name: 'Query',
      definition(t: any) {
        t.crud.foos({ ordering: { b: true } })
      },
    }),
  ])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

it('finds correct ordering types if fullTextSearch preview feature is enabled', async () => {
  const datamodel = `
    generator prisma_client {
      provider = "prisma-client-js"
      output   = "../../node_modules/.prisma/client"
      previewFeatures = ["fullTextSearch"]
    }

    datasource db {
      provider = "postgres"
      url      = env("DB_URL")
    }

    model Foo {
      id    Int @id @default(autoincrement())
      a     String
      bars  Bar[]
    }

    model Bar {
      id    Int @id @default(autoincrement())
      fooId Int?
      foo   Foo? @relation(fields: [fooId], references: [id])
    }
  `

  const { schemaString: schema, typegen } = await generateSchemaAndTypes(datamodel, [
    objectType({
      name: 'Foo',
      definition(t: any) {
        t.model.id()
        t.model.a()
        t.model.bars({ ordering: true })
      },
    }),
    objectType({
      name: 'Bar',
      definition(t: any) {
        t.model.id()
        t.model.foo()
      },
    }),
    objectType({
      name: 'Query',
      definition(t: any) {
        t.crud.foos({
          ordering: true,
        })
      },
    }),
  ])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

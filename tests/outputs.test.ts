import * as Nexus from 'nexus'
import {
  generateSchemaAndTypes,
  generateSchemaAndTypesWithoutThrowing,
} from './__utils'

it('only publishes output types that do not map to prisma models', async () => {
  const datamodel = `
  model User {
    id  Int @id
    name String
  }
`
  const Query = Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.user()
    },
  })

  const Mutation = Nexus.objectType({
    name: 'Mutation',
    definition(t: any) {
      t.crud.updateManyUser({ filtering: true })
    },
  })

  const { missingTypes } = await generateSchemaAndTypesWithoutThrowing(
    datamodel,
    [Query, Mutation],
  )

  expect(Object.keys(missingTypes)).toEqual(['User'])
})

it('transforms model before generating output', async () => {
  const datamodel = `
  model User {
    id  Int @id
    name String
    ignoredField String
  }
`
  const Query = Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.user()
    },
  })

  const Mutation = Nexus.objectType({
    name: 'Mutation',
    definition(t: any) {
      t.crud.createOneUser()
    },
  })

  const User = Nexus.objectType({
    name: 'User',
    definition: (t: any) => {
      t.model.id()
      t.model.name()
    },
  })

  const result = await generateSchemaAndTypesWithoutThrowing(
    datamodel,
    [Query, Mutation, User],
    {
      transform: document => ({
        ...document,
        schema: {
          ...document.schema,
          inputTypes: document.schema.inputTypes.map(input => ({
            ...input,
            fields: input.fields.filter(({ name }) => name !== 'ignoredField'),
          })),
        },
      }),
    },
  )
  expect(result.schema.includes('ignoredField')).toBeFalsy()
  expect(result).toMatchSnapshot('transform')
})

it('publishes scalars from input types', async () => {
  const datamodel = `
  model User {
    id  Int @id
    date DateTime
  }
  `

  const User = Nexus.objectType({
    name: 'User',
    definition(t: any) {
      t.model.id()
    },
  })

  const Query = Nexus.objectType({
    name: 'Query',
    definition(t: any) {
      t.crud.users({ filtering: true })
    },
  })

  const { schema, typegen } = await generateSchemaAndTypes(datamodel, [
    Query,
    User,
  ])

  expect(schema).toMatchSnapshot('schema')
  expect(typegen).toMatchSnapshot('typegen')
})

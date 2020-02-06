import { queryType, mutationType, objectType } from 'nexus'
import { getDmmf, generateSchemaAndTypes } from '../__utils'
import { transformArgs } from '../../src/dmmf/transformer'
import { ComputedInputs } from '../../src/utils'
import { Publisher } from '../../src/publisher'

const dataModel = `
model User {
  id  Int @id @default(autoincrement())
  name String
  nested Nested[]
  createdWithBrowser String
}

model Nested {
  id Int @id @default(autoincrement())
  name String
  createdWithBrowser String
}
`

const resolvers = {
  query: queryType({
    definition(t: any) {
      t.crud.user()
    },
  }),
  mutation: mutationType({
    definition(t: any) {
      t.crud.createOneUser()
      t.crud.createOneNested()
    },
  }),
  user: objectType({
    name: 'User',
    definition: (t: any) => {
      t.model.id()
      t.model.name()
      t.model.nested()
      t.model.createdWithBrowser()
    },
  }),
  nested: objectType({
    name: 'Nested',
    definition: (t: any) => {
      t.model.id()
      t.model.createdWithBrowser()
      t.model.name()
    },
  }),
}

const fakeNexusBuilder: any = {
  hasType: (_: string) => false,
}

const getTestData = async (pluginLevelComputedInputs?: ComputedInputs) => {
  const dmmf = await getDmmf(dataModel)
  return {
    publisher: new Publisher(dmmf, fakeNexusBuilder),
    computedInputs: {},
    relations: {
      create: {},
      connect: {},
      defaultRelation: 'unset' as const,
    },
  }
}

describe('computedInputs args', () => {
  it('values are inferred', async () => {
    const { publisher, relations } = await getTestData()
    expect(
      transformArgs({
        params: {
          info: {} as any,
          args: {
            data: {
              name: 'New User',
              nested: { create: { name: 'Nested Name' } },
            },
          },
          ctx: { browser: 'firefox' },
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        computedInputs: {
          createdWithBrowser: ({ ctx }) => ctx.browser,
        },
        relations,
      }),
    ).toStrictEqual({
      data: {
        name: 'New User',
        createdWithBrowser: 'firefox',
        nested: {
          create: { createdWithBrowser: 'firefox', name: 'Nested Name' },
        },
      },
    })
  }),
    it('array values are inferred', async () => {
      const { publisher, relations } = await getTestData()
      expect(
        transformArgs({
          params: {
            info: {} as any,
            args: {
              data: {
                name: 'New User',
                nested: {
                  create: [{ name: 'Nested Name' }, { name: 'Nested Name' }],
                },
              },
            },
            ctx: { browser: 'firefox' },
          },
          inputType: publisher.getInputType('UserCreateInput'),
          publisher,
          computedInputs: {
            createdWithBrowser: ({ ctx }) => ctx.browser,
          },
          relations,
        }),
      ).toStrictEqual({
        data: {
          name: 'New User',
          createdWithBrowser: 'firefox',
          nested: {
            create: [
              { createdWithBrowser: 'firefox', name: 'Nested Name' },
              { createdWithBrowser: 'firefox', name: 'Nested Name' },
            ],
          },
        },
      })
    }),
    it('values are inferred from root, args, and context', async () => {
      const { publisher, relations } = await getTestData()
      expect(
        transformArgs({
          params: {
            // Normally this would be GraphQLResolveInfo but using a string for simplicity
            info: 'Yam' as any,
            args: { data: { nested: { create: { name: 'Sam' } } } },
            ctx: { browser: 'firefox' },
          },
          inputType: publisher.getInputType('UserCreateInput'),
          publisher,
          relations,
          computedInputs: {
            // Nonsense example, but ensures args, ctx and info values are being passed everywhere :)
            name: ({ args, ctx, info }) =>
              `${args.data.nested.create.name} ${ctx.browser.slice(
                1,
                2,
              )} ${info}`,
          } as ComputedInputs,
        }),
      ).toStrictEqual({
        data: {
          name: 'Sam i Yam',
          nested: {
            create: { name: 'Sam i Yam' },
          },
        },
      })
    })
})

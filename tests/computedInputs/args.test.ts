import { transformArgs } from '../../src/dmmf/transformer'
import { ComputedInputs } from '../../src/utils'
import { getTestData, defaultRelationsConfig } from '../__utils'

describe('computedInputs args', () => {
  it('values are inferred', async () => {
    const { publisher } = await getTestData()
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
        relations: defaultRelationsConfig,
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
      const { publisher } = await getTestData()
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
          relations: defaultRelationsConfig,
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
      const { publisher } = await getTestData()
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
          relations: defaultRelationsConfig,
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

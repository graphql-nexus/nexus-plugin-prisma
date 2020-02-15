import { transformArgs } from '../../src/transformArgs'
import { InputsConfig } from '../../src/utils'
import { getTestData } from '../__utils'

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
            } as any,
          },
          ctx: { browser: 'firefox' },
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        inputs: {
          createdWithBrowser: { computeFrom: ({ ctx }: any) => ctx.browser },
        } as InputsConfig,
        relateBy: 'any',
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
              } as any,
            },
            ctx: { browser: 'firefox' },
          },
          inputType: publisher.getInputType('UserCreateInput'),
          publisher,
          inputs: {
            createdWithBrowser: { computeFrom: ({ ctx }: any) => ctx.browser },
          } as InputsConfig,
          relateBy: 'any',
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
          } as any,
          inputType: publisher.getInputType('UserCreateInput'),
          publisher,
          inputs: {
            name: {
              computeFrom: ({ args, ctx, info }: any) =>
                `${args.data.nested.create.name} ${ctx.browser.slice(
                  1,
                  2,
                )} ${info}`,
            },
          } as InputsConfig,
          relateBy: 'any',
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

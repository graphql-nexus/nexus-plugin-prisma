import { transformArgs } from '../../src/transformArgs'
import { InputsConfig } from '../../src/utils'
import { getTestData } from '../__utils'

const inputsConfig = {
  createdWithBrowser: { computeFrom: ({ ctx }: any) => ctx.browser },
} as InputsConfig

describe('computeFrom args', () => {
  it('shallow values are inferred', async () => {
    const { publisher, argTypes } = await getTestData({
      pluginOptions: { inputs: inputsConfig },
    })
    expect(
      transformArgs({
        params: {
          info: {} as any,
          args: {
            data: {
              name: 'New User',
              nests: { create: { name: 'Nest Name' } },
            } as any,
          },
          ctx: { browser: 'firefox' },
        },
        argTypes,
        publisher,
        inputs: inputsConfig,
        collapseTo: null,
      }),
    ).toStrictEqual({
      data: {
        name: 'New User',
        createdWithBrowser: 'firefox',
        nests: {
          create: { createdWithBrowser: 'firefox', name: 'Nest Name' },
        },
      },
    })
  }),
    it('array values are inferred', async () => {
      const { publisher, argTypes } = await getTestData({
        pluginOptions: { inputs: inputsConfig },
      })
      expect(
        transformArgs({
          params: {
            info: {} as any,
            args: {
              data: {
                name: 'New User',
                nests: {
                  create: [{ name: 'Nest Name' }, { name: 'Nest Name' }],
                },
              } as any,
            },
            ctx: { browser: 'firefox' },
          },
          argTypes,
          publisher,
          inputs: inputsConfig,
          collapseTo: null,
        }),
      ).toStrictEqual({
        data: {
          name: 'New User',
          createdWithBrowser: 'firefox',
          nests: {
            create: [
              { createdWithBrowser: 'firefox', name: 'Nest Name' },
              { createdWithBrowser: 'firefox', name: 'Nest Name' },
            ],
          },
        },
      })
    }),
    it('values are inferred from root, args, and context', async () => {
      const complexInputsConfig = {
        name: {
          computeFrom: ({ args, ctx, info }: any) =>
            `${args.data.createdWithBrowser} ${ctx.browser.slice(
              1,
              2,
            )} ${info}`,
        },
      } as InputsConfig
      const { publisher, argTypes } = await getTestData({
        pluginOptions: { inputs: complexInputsConfig },
      })
      expect(
        transformArgs({
          params: {
            // Normally this would be GraphQLResolveInfo but using a string for simplicity
            info: 'Yam' as any,
            args: {
              data: {
                createdWithBrowser: 'Sam',
                nests: { create: { createdWithBrowser: 'i Yam Sam' } },
              },
            },
            ctx: { browser: 'firefox' },
          } as any,
          argTypes,
          publisher,
          inputs: complexInputsConfig,
          collapseTo: null,
        }),
      ).toStrictEqual({
        data: {
          name: 'Sam i Yam',
          createdWithBrowser: 'Sam',
          nests: {
            create: { name: 'Sam i Yam', createdWithBrowser: 'i Yam Sam' },
          },
        },
      })
    })
})

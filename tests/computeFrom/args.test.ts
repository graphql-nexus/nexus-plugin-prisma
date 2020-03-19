import { transformArgs } from '../../src/transformArgs'
import { InputsConfig } from '../../src/utils'
import { getTestData } from '../__utils'

const inputsConfig = {
  createdWithBrowser: { computeFrom: ({ ctx }: any) => ctx.browser },
} as InputsConfig

const userCreateInputTypeName = 'UserCreateInput'

describe('computeFrom args', () => {
  it('values are inferred', async () => {
    const { publisher } = await getTestData({
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
        inputType: publisher.getInputType(userCreateInputTypeName),
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
      const { publisher } = await getTestData({
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
          inputType: publisher.getInputType(userCreateInputTypeName),
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
            `${args.data.nests.create.name} ${ctx.browser.slice(1, 2)} ${info}`,
        },
      } as InputsConfig
      const { publisher } = await getTestData({
        pluginOptions: { inputs: complexInputsConfig },
      })
      expect(
        transformArgs({
          params: {
            // Normally this would be GraphQLResolveInfo but using a string for simplicity
            info: 'Yam' as any,
            args: { data: { nests: { create: { name: 'Sam' } } } },
            ctx: { browser: 'firefox' },
          } as any,
          inputType: publisher.getInputType(userCreateInputTypeName),
          publisher,
          inputs: complexInputsConfig,
          collapseTo: null,
        }),
      ).toStrictEqual({
        data: {
          name: 'Sam i Yam',
          nests: {
            create: { name: 'Sam i Yam' },
          },
        },
      })
    })
})

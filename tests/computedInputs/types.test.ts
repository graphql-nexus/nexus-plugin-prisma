import { getTestData, defaultDefinitions } from '../__utils'
import { mutationType } from 'nexus'
import { InputsConfig } from '../../src/utils'

describe('computedInputs typegen', () => {
  it('works at plugin-level', async () => {
    const { schema, typegen } = await getTestData({
      pluginOptions: {
        inputs: {
          createdWithBrowser: { computeFrom: ({ ctx }: any) => ctx.browser },
        } as InputsConfig,
      },
    })
    expect(schema).toMatchSnapshot('plugin-level-schema')
    expect(typegen).toMatchSnapshot('plugin-level-typegen')
  })
  it('works at resolver-level', async () => {
    const { schema, typegen } = await getTestData({
      definitions: {
        ...defaultDefinitions,
        mutation: mutationType({
          definition(t: any) {
            t.crud.createOneUser({
              inputs: {
                createdWithBrowser: {
                  computeFrom: ({ ctx }: any) => ctx.browser,
                },
              },
            })
            t.crud.createOneNested()
          },
        }),
      },
    })
    expect(schema).toMatchSnapshot('resolver-level-schema')
    expect(typegen).toMatchSnapshot('resolver-level-typegen')
  })
})

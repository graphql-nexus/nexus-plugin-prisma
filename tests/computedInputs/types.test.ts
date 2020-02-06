import { getTestData, defaultDefinitions } from '../__utils'
import { mutationType } from 'nexus'
import { ComputedInputs } from '../../src/utils'

describe('computedInputs typegen', () => {
  it('works at plugin-level', async () => {
    const { schema, typegen } = await getTestData({
      pluginOptions: {
        computedInputs: { createdWithBrowser: ({ ctx }) => ctx.browser },
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
              computedInputs: {
                createdWithBrowser: ({ ctx }) => ctx.browser,
              } as ComputedInputs,
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

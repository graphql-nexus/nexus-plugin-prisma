import { getTestData, defaultDefinitions } from '../__utils'
import { mutationType } from 'nexus'
import { InputsConfig } from '../../src/utils'
import { printSchema } from 'graphql'

const inputsConfig = {
  createdWithBrowser: { computeFrom: ({ ctx }: any) => ctx.browser },
} as InputsConfig

describe('computeFrom typegen', () => {
  it('works at plugin-level', async () => {
    const { schema, typegen } = await getTestData({
      pluginOptions: {
        inputs: inputsConfig,
      },
    })
    expect(printSchema(schema)).toMatchSnapshot('plugin-level-schema')
    expect(typegen).toMatchSnapshot('plugin-level-typegen')
  })
  it('works at resolver-level', async () => {
    const { schema, typegen } = await getTestData({
      definitions: {
        ...defaultDefinitions,
        mutation: mutationType({
          definition(t: any) {
            t.crud.createOneUser({
              inputs: inputsConfig,
            })
            t.crud.createOneNested()
          },
        }),
      },
    })
    expect(printSchema(schema)).toMatchSnapshot('resolver-level-schema')
    expect(typegen).toMatchSnapshot('resolver-level-typegen')
  })
})

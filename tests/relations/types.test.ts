import { mutationType } from 'nexus'
import { printSchema } from 'graphql'
import { getTestData, defaultDefinitions } from '../__utils'
import { InputsConfig } from '../../src/utils'

describe('relations typegen', () => {
  it('works at plugin-level', async () => {
    const { schema, typegen } = await getTestData({
      pluginOptions: {
        inputs: {
          nested: {
            relateBy: 'create',
          },
        } as InputsConfig,
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
              inputs: {
                nested: {
                  relateBy: 'create',
                },
              } as InputsConfig,
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

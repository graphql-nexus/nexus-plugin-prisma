import { mutationType } from 'nexus'
import {
  getTestData,
  defaultDefinitions,
  defaultRelationsConfig,
} from '../__utils'

describe('relations typegen', () => {
  it('works at plugin-level', async () => {
    const { schema, typegen } = await getTestData({
      pluginOptions: {
        relations: { ...defaultRelationsConfig, create: { nested: true } },
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
              relations: {
                ...defaultRelationsConfig,
                create: { nested: true },
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

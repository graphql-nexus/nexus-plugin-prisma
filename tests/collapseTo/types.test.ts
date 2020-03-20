import { mutationType } from 'nexus'
import { printSchema } from 'graphql'
import { getTestData, defaultDefinitions, mockConsoleLog } from '../__utils'
import { InputsConfig, PrismaInputFieldName } from '../../src/utils'
import { NexusGraphQLSchema } from 'nexus/dist/core'

describe('collapseTo typegen', () => {
  it('works at plugin-level', async () => {
    const { schema, typegen } = await getTestData({
      pluginOptions: {
        inputs: {
          nests: {
            collapseTo: 'create',
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
                nests: {
                  collapseTo: 'create',
                },
              } as InputsConfig,
            })
            t.crud.createOneNest()
          },
        }),
      },
    })
    expect(printSchema(schema)).toMatchSnapshot('resolver-level-schema')
    expect(typegen).toMatchSnapshot('resolver-level-typegen')
  })
  it('works for queries', async () => {
    const { schema, typegen } = await getTestData({
      pluginOptions: {
        inputs: {
          createdAt: {
            collapseTo: 'equals',
          },
        } as InputsConfig,
      },
    })
    expect(printSchema(schema)).toMatchSnapshot('query-schema')
    expect(typegen).toMatchSnapshot('query-typegen')
  })
  it('avoids collapsing required fields', async () => {
    let schema: NexusGraphQLSchema
    let typegen: string
    const { $output } = await mockConsoleLog(async () => {
      const data = await getTestData({
        pluginOptions: {
          collapseTo: 'name' as PrismaInputFieldName,
        },
      })
      schema = data.schema
      typegen = data.typegen
    })
    expect(printSchema(schema!)).toMatchSnapshot('avoid-required-schema')
    expect(typegen!).toMatchSnapshot('avoid-required-typegen')
    expect($output).toContain('Not collapsing field "name"')
  })
})

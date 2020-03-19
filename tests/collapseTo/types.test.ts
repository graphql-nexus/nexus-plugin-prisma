import { mutationType } from 'nexus'
import { printSchema } from 'graphql'
import { getTestData, defaultDefinitions, mockConsoleLog } from '../__utils'
import { InputsConfig, InputFieldName } from '../../src/utils'
import { NexusGraphQLSchema } from 'nexus/dist/core'

describe('collapseTo typegen', () => {
  it('works at plugin-level', async () => {
    const { schema, typegen } = await getTestData({
      pluginOptions: {
        inputs: {
          nested: {
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
                nested: {
                  collapseTo: 'create',
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
  it('avoids collapsing required fields', async () => {
    let schema: NexusGraphQLSchema
    let typegen: string
    const { $output } = await mockConsoleLog(async () => {
      const data = await getTestData({
        pluginOptions: {
          collapseTo: 'name' as InputFieldName,
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

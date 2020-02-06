import { mutationType } from 'nexus'
import { transformArgs } from '../../src/dmmf/transformer'
import {
  getTestData,
  defaultDefinitions,
  defaultRelationsConfig,
} from '../__utils'

describe('relations', () => {
  it('omitted relation keys are injected into args', async () => {
    const { publisher } = await getTestData({
      definitions: {
        ...defaultDefinitions,
        mutation: mutationType({
          definition(t: any) {
            t.crud.createOneUser({
              relations: {
                create: {
                  nested: true,
                },
              },
            })
          },
        }),
      },
    })
    const result = transformArgs({
      params: {
        info: {} as any,
        args: {
          data: { name: 'New User', nested: [{ name: 'New Nested' }] },
        },
        ctx: {},
      },
      inputType: publisher.getInputType('UserCreateCreateNestedInput'),
      publisher,
      computedInputs: {},
      relations: {
        ...defaultRelationsConfig,
        create: {
          nested: true,
        },
      },
    })
    expect(result).toStrictEqual({
      data: {
        name: 'New User',
        nested: { create: [{ name: 'New Nested' }] },
      },
    })
  })
})
// TODO: Add more complex tests for nested types

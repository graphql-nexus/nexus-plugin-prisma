import { mutationType } from 'nexus'
import { transformArgs } from '../../src/transformArgs'
import { getTestData, defaultDefinitions } from '../__utils'
import { InputsConfig } from '../../src/utils'

describe('collapseTo', () => {
  it('injects collapsed keys specified by a default value', async () => {
    const { publisher } = await getTestData({
      pluginOptions: {
        collapseTo: 'connect',
      },
    })
    expect(
      transformArgs({
        params: {
          info: {} as any,
          args: {
            data: { name: 'New User', nested: [{ id: 1 }] },
          } as any,
          ctx: {},
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        inputs: {},
        collapseTo: 'connect',
      }),
    ).toStrictEqual({
      data: {
        name: 'New User',
        nested: { connect: [{ id: 1 }] },
      },
    })
  }),
    it('injects relation keys specified by an object', async () => {
      const inputs = {
        nested: {
          collapseTo: 'create',
        },
      } as InputsConfig
      const { publisher } = await getTestData({
        definitions: {
          ...defaultDefinitions,
          mutation: mutationType({
            definition(t: any) {
              t.crud.createOneUser({
                inputs,
              })
            },
          }),
        },
      })
      expect(
        transformArgs({
          params: {
            info: {} as any,
            args: {
              data: { name: 'New User', nested: [{ name: 'New Nested' }] },
            } as any,
            ctx: {},
          },
          inputType: publisher.getInputType(
            'UserCreateCollapseNestedToCreateInput',
          ),
          publisher,
          inputs,
          collapseTo: null,
        }),
      ).toStrictEqual({
        data: {
          name: 'New User',
          nested: { create: [{ name: 'New Nested' }] },
        },
      })
    })
})

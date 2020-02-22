import { mutationType } from 'nexus'
import { transformArgs } from '../../src/transformArgs'
import { getTestData, defaultDefinitions } from '../__utils'
import { InputsConfig } from '../../src/utils'

describe('relations', () => {
  it('injects relation keys specified by a default relation', async () => {
    const { publisher } = await getTestData({
      pluginOptions: {
        relateBy: 'connect',
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
        relateBy: 'connect',
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
          relateBy: 'create',
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
          inputType: publisher.getInputType('UserCreateCreateNestedInput'),
          publisher,
          inputs,
          relateBy: 'any',
        }),
      ).toStrictEqual({
        data: {
          name: 'New User',
          nested: { create: [{ name: 'New Nested' }] },
        },
      })
    })
})

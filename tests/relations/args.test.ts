import { mutationType } from 'nexus'
import { transformArgs } from '../../src/dmmf/transformer'
import {
  getTestData,
  defaultDefinitions,
  defaultRelationsConfig,
} from '../__utils'

describe('relations', () => {
  it('injects relation keys specified by a default relation', async () => {
    const { publisher } = await getTestData({
      pluginOptions: {
        relations: {
          defaultRelation: 'connect',
        },
      },
    })
    expect(
      transformArgs({
        params: {
          info: {} as any,
          args: {
            data: { name: 'New User', nested: [{ id: 1 }] },
          },
          ctx: {},
        },
        inputType: publisher.getInputType('UserCreateInput'),
        publisher,
        computedInputs: {},
        relations: {
          ...defaultRelationsConfig,
          defaultRelation: 'connect',
        },
      }),
    ).toStrictEqual({
      data: {
        name: 'New User',
        nested: { connect: [{ name: 'New Nested' }] },
      },
    })
  }),
    it('injects relation keys specified by an object', async () => {
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
      expect(
        transformArgs({
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
        }),
      ).toStrictEqual({
        data: {
          name: 'New User',
          nested: { create: [{ name: 'New Nested' }] },
        },
      })
    })
})

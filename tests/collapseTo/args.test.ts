import { mutationType } from 'nexus'
import { transformArgs } from '../../src/transformArgs'
import { getTestData, defaultDefinitions } from '../__utils'
import { InputsConfig } from '../../src/utils'

describe('collapseTo args', () => {
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
            data: { name: 'User Name', nests: [{ id: 1 }] },
          } as any,
          ctx: {},
        },
        paramInputs: {
          data: { name: 'UserCreateInput' } as any,
        },
        publisher,
        inputs: {},
        collapseTo: 'connect',
      }),
    ).toStrictEqual({
      data: {
        name: 'User Name',
        nests: { connect: [{ id: 1 }] },
      },
    })
  }),
    it('injects collapsed keys specified by an input config', async () => {
      const inputs = {
        nests: {
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
              data: { name: 'User Name', nests: [{ name: 'Nest Name' }] },
            } as any,
            ctx: {},
          },
          paramInputs: {
            data: {
              name: 'UserCreateCollapseNestsToCreateInput',
            } as any,
          },
          publisher,
          inputs,
          collapseTo: null,
        }),
      ).toStrictEqual({
        data: {
          name: 'User Name',
          nests: { create: [{ name: 'Nest Name' }] },
        },
      })
    }),
    it('injects collapsed keys into query inputs', async () => {
      const inputs = {
        createdAt: {
          collapseTo: 'equals',
        },
      } as InputsConfig
      const { publisher } = await getTestData({
        pluginOptions: {
          inputs,
        },
      })
      expect(
        transformArgs({
          params: {
            info: {} as any,
            args: {
              where: {
                createdAt: 'DateTime',
              },
            } as any,
            ctx: {},
          },
          paramInputs: { where: { name: 'UserWhereInput' } as any },
          publisher,
          inputs,
          collapseTo: 'equals',
        }),
      ).toStrictEqual({
        where: {
          createdAt: { equals: 'DateTime' },
        },
      })
    })
})

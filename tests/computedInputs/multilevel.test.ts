import * as Nexus from 'nexus'
import { getDmmf, generateSchemaAndTypes } from '../__utils'
import { transformArgs } from '../../src/dmmf/transformer'
import { ComputedInputs } from '../../src/utils'
import { Publisher } from '../../src/publisher'

it('can combine resolver-level (shallow) and global (deep) computed inputs', async () => {
  const { globallyComputedInputs, publisher } = await getGlobalTestData({
    createdWithBrowser: ({ ctx }) => ctx.browser,
  })
  expect(
    transformArgs({
      params: {
        info: {} as any,
        // name should be required when creating Nested since the computedInput providing
        // it is specific to UserCreateInput and therefore shallow
        args: { data: { nested: { create: { name: 'Nested Name' } } } },
        ctx: { browser: 'firefox', name: 'autopopulated' },
      },
      inputType: publisher.getInputType('UserCreateInput'),
      publisher,
      // These are applied only to UserCreateInput
      locallyComputedInputs: ({
        name: ({ ctx }) => ctx.name,
      } as LocalComputedInputs) as ComputedInputs<any>,
      globallyComputedInputs,
    }),
  ).toStrictEqual({
    data: {
      name: 'autopopulated',
      createdWithBrowser: 'firefox',
      nested: {
        create: { createdWithBrowser: 'firefox', name: 'Nested Name' },
      },
    },
  })
})

import * as Nexus from 'nexus'
import { addComputedInputs, addComputedWhereInputs } from '../../src/dmmf/transformer'
import { GlobalComputedInputs, GlobalComputedWhereInputs } from '../../src/utils'
import { generateSchemaAndTypes, getDmmf } from '../__utils'

// TODO: Split local and global computedInputs into their own suites

const resolverTestData = {
  datamodel: `
  model User {
    id  Int @id @default(autoincrement())
    organizationId Int
    name String
    createdWithBrowser String
  }
`,
  query: Nexus.queryType({
    definition(t: any) {
      t.crud.user()
      t.crud.users({
        computedWhereInputs: {
          organizationId: ({ ctx }) => ctx.organizationId,
        } as GlobalComputedWhereInputs,
      })
    },
  }),
  mutation: Nexus.mutationType({
    definition(t: any) {
      t.crud.createOneUser({
        computedInputs: {
          createdWithBrowser: ({ ctx }) => ctx.browser,
        } as GlobalComputedInputs,
      })
    },
  }),
  user: Nexus.objectType({
    name: 'User',
    definition: (t: any) => {
      t.model.id()
      t.model.name()
      t.model.createdWithBrowser()
    },
  }),
}

const globalTestData = {
  datamodel: `
  model User {
    id  Int @id @default(autoincrement())
    organizationId Int
    name String
    nested Nested[]
    createdWithBrowser String
  }

  model Nested {
    id Int @id @default(autoincrement())
    name String
    createdWithBrowser String
    userId Int
    user User @relation(fields: [userId], references: [id])
  }
`,
  query: Nexus.queryType({
    definition(t: any) {
      t.crud.user()
      t.crud.users()
    },
  }),
  mutation: Nexus.mutationType({
    definition(t: any) {
      t.crud.createOneUser()
      t.crud.createOneNested()
    },
  }),
  user: Nexus.objectType({
    name: 'User',
    definition: (t: any) => {
      t.model.id()
      t.model.name()
      t.model.nested()
      t.model.createdWithBrowser()
    },
  }),
  nested: Nexus.objectType({
    name: 'Nested',
    definition: (t: any) => {
      t.model.id()
      t.model.createdWithBrowser()
      t.model.name()
    },
  }),
}

it('removes resolver-level computedWhereInputs from the corresponding input type', async () => {
  const { datamodel, ...resolvers } = resolverTestData
  const result = await generateSchemaAndTypes(datamodel, Object.values(resolvers))

  expect({
    schema: result.schemaString,
    typegen: result.typegen,
  }).toMatchSnapshot('locallyComputedWhereInputs')
})

it('infers the value of resolver-level computedWhereInputs at runtime', async () => {
  const { datamodel } = resolverTestData
  const dmmf = await getDmmf(datamodel)
  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        args: {},
        ctx: { organizationId: 1 },
      },
      argType: 'UserWhereInput',
      inputType: dmmf.getInputType('UserWhereInput'),
      dmmf,
      locallyComputedWhereInputs: {
        organizationId: ({ ctx }) => ({ equals: ctx.organizationId }),
      },
    })
  ).toStrictEqual({ where: { organizationId: { equals: 1 } } })
})

it('removes global computedWhereInputs from all input types', async () => {
  const { datamodel, ...resolvers } = globalTestData
  const result = await generateSchemaAndTypes(datamodel, Object.values(resolvers), {
    globallyComputedWhereInputs: { organizationId: ({ ctx }) => ({ equals: ctx.organizationId }) },
  })

  expect({
    schema: result.schemaString,
    typegen: result.typegen,
  }).toMatchSnapshot('globallyComputedWhereInputs')
})

it('infers the value of global computedWhereInputs at runtime', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    globallyComputedWhereInputs: { id: ({ ctx }) => ({ equals: ctx.organizationId }) },
  })

  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        args: {
          where: {
            id: 1,
          },
        },
        ctx: { organizationId: 1 },
      },
      argType: 'UserWhereUniqueInput',
      inputType: dmmf.getInputType('UserWhereUniqueInput'),
      dmmf,
      locallyComputedWhereInputs: {},
    })
  ).toStrictEqual({
    where: {
      id: 1,
    },
  })
})

it('does not add the value to args whose schema does not have key.', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    globallyComputedWhereInputs: { organizationId: ({ ctx }) => ({ equals: ctx.organizationId }) },
  })

  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        args: {
          where: {
            name: { contains: 'a' },
            nested: {
              some: {
                name: {
                  contains: 'a',
                },
              },
            },
          },
        },
        ctx: { organizationId: 1 },
      },
      argType: 'UserWhereInput',
      inputType: dmmf.getInputType('UserWhereInput'),
      dmmf,
      locallyComputedWhereInputs: {},
    })
  ).toStrictEqual({
    where: {
      name: {
        contains: 'a',
      },
      organizationId: { equals: 1 },
      nested: {
        some: {
          name: {
            contains: 'a',
          },
        },
      },
    },
  })
})

it('infers the value of global computedWhereInputs at runtime and override original args that has same key', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    globallyComputedWhereInputs: { organizationId: ({ ctx }) => ({ equals: ctx.organizationId }) },
  })

  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        args: {
          where: {
            organizationId: { equals: 2 }, // If args specified some value with the same key. It should override by computedInput
            name: { contains: 'a' },
            nested: {
              some: {
                name: {
                  contains: 'a',
                },
              },
            },
          },
        },
        ctx: { organizationId: 1 },
      },
      argType: 'UserWhereInput',
      inputType: dmmf.getInputType('UserWhereInput'),
      dmmf,
      locallyComputedWhereInputs: {},
    })
  ).toStrictEqual({
    where: {
      name: {
        contains: 'a',
      },
      organizationId: { equals: 1 },
      nested: {
        some: {
          name: {
            contains: 'a',
          },
        },
      },
    },
  })
})

it('infers the nested value of global computedInputs at runtime', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    globallyComputedWhereInputs: { nested: ({ ctx }) => ({ some: { name: { contains: ctx.contains } } }) },
  })

  // console.log(JSON.stringify(dmmf.getInputType('NestedWhereInput'),null,1))
  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        args: {
          where: {
            name: {
              contains: 'a',
            },
          },
        },
        ctx: { contains: 'a' },
      },
      argType: 'UserWhereInput',
      inputType: dmmf.getInputType('UserWhereInput'),
      dmmf,
      locallyComputedWhereInputs: {},
    })
  ).toStrictEqual({
    where: {
      name: {
        contains: 'a',
      },
      nested: {
        some: {
          name: {
            contains: 'a',
          },
        },
      },
    },
  })
})

it('override original args that has same key with the nested global computed input', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    globallyComputedWhereInputs: { nested: ({ ctx }) => ({ some: { name: { contains: 'a' } } }) },
  })

  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        args: {
          where: {
            name: {
              contains: 'a',
            },
            nested: {
              every: {
                name: {
                  contains: 'b',
                },
              },
            },
          },
        },
        ctx: { organizationId: 1 },
      },
      argType: 'UserWhereInput',
      inputType: dmmf.getInputType('UserWhereInput'),
      dmmf,
      locallyComputedWhereInputs: {},
    })
  ).toStrictEqual({
    where: {
      name: {
        contains: 'a',
      },
      nested: {
        some: {
          name: {
            contains: 'a',
          },
        },
      },
    },
  })
})

it('override original all nested args that has same key with global computed inputs.', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    globallyComputedWhereInputs: { name: () => ({ contains: 'c' }) },
  })

  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        args: {
          where: {
            name: {
              contains: 'a',
            },
            nested: {
              some: {
                name: {
                  contains: 'b',
                },
              },
            },
          },
        },
        ctx: { organizationId: 1 },
      },
      argType: 'UserWhereInput',
      inputType: dmmf.getInputType('UserWhereInput'),
      dmmf,
      locallyComputedWhereInputs: {},
    })
  ).toStrictEqual({
    where: {
      name: {
        contains: 'c',
      },
      nested: {
        some: {
          name: {
            contains: 'c',
          },
        },
      },
    },
  })
})

it('can combine resolver-level (shallow) and global (deep) computed where inputs', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    // These are applied globally
    globallyComputedWhereInputs: { createdWithBrowser: ({ ctx }) => ctx.browser },
  })
  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        // name should be required when querying Nested since the computedWhereInput providing
        // it is specific to UserWhereInput and therefore shallow
        args: {
          where: {
            nested: {
              some: {
                name: {
                  contains: 'b',
                },
              },
            },
          },
        },
        ctx: { browser: 'firefox', name: 'autopopulated' },
      },
      argType: 'UserWhereInput',
      inputType: dmmf.getInputType('UserWhereInput'),
      dmmf,
      // These are applied only to UserWhereInput
      locallyComputedWhereInputs: { name: ({ ctx }) => ctx.name },
    })
  ).toStrictEqual({
    where: {
      name: 'autopopulated',
      createdWithBrowser: 'firefox',
      nested: {
        some: {
          createdWithBrowser: 'firefox',
          name: {
            contains: 'b',
          },
        },
      },
    },
  })
})

it('can use a combination of args, context and info to compute values', async () => {
  const { datamodel } = globalTestData
  // Nonsense example, but ensures args, ctx and info values are being passed everywhere :)
  const dmmf = await getDmmf(datamodel, {
    globallyComputedWhereInputs: {
      createdWithBrowser: ({ args, ctx, info }) =>
        `${ctx.browser.slice(1, 2)} ${info} ${(args.where as any).nested.some.name}`,
    },
  })
  expect(
    await addComputedWhereInputs({
      params: {
        // Normally this would be GraphQLResolveInfo but using a string for simplicity
        info: 'Yam' as any,
        args: { where: { nested: { some: { name: 'Sam' } } } },
        ctx: { browser: 'firefox' },
      },
      inputType: dmmf.getInputType('UserWhereInput'),
      dmmf,
      argType: 'UserWhereInput',
      locallyComputedWhereInputs: {
        name: ({ args, ctx, info }) => `${args.where.nested.some.name} ${ctx.browser.slice(1, 2)} ${info}`,
      },
    })
  ).toStrictEqual({
    where: {
      name: 'Sam i Yam',
      createdWithBrowser: 'i Yam Sam',
      nested: {
        some: { createdWithBrowser: 'i Yam Sam', name: 'Sam' },
      },
    },
  })
})

it('supports async functions on both global and local computed where input', async () => {
  const { datamodel } = globalTestData
  const dmmf = await getDmmf(datamodel, {
    // These are applied globally
    globallyComputedWhereInputs: {
      createdWithBrowser: async ({ ctx }) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(ctx.browser)
          }, 0)
        })
      },
    },
  })
  expect(
    await addComputedWhereInputs({
      params: {
        info: {} as any,
        // name should be required when creating Nested since the computedInput providing
        // it is specific to UserCreateInput and therefore shallow
        args: { where: { nested: { some: { name: 'Nested Name' } } } },
        ctx: { browser: 'firefox', name: 'autopopulated' },
      },
      inputType: dmmf.getInputType('UserWhereInput'),
      argType: 'UserWhereInput',
      dmmf,
      // These are applied only to UserCreateInput
      locallyComputedWhereInputs: {
        name: async ({ ctx }) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(ctx.name)
            }, 0)
          })
        },
      },
    })
  ).toStrictEqual({
    where: {
      name: 'autopopulated',
      createdWithBrowser: 'firefox',
      nested: {
        some: { createdWithBrowser: 'firefox', name: 'Nested Name' },
      },
    },
  })
})

process.env.FORCE_COLOR = '3'
import { stripIndent } from 'common-tags'
import { WorktimeLens } from 'nexus/plugin'
import * as os from 'os'
import * as Path from 'path'
import * as TC from '../../../tests/__helpers/test-context'
import { getGenerators } from './utils'

const ctx = TC.create(TC.tmpDir(), TC.fs(), (ctx) => {
  const nexus = ({
    log: {
      warn: jest.fn(),
    },
    layout: {
      projectRelative: (x: string) => Path.relative(ctx.tmpDir, x),
    },
  } as any) as WorktimeLens

  const schemaPath = ctx.fs.path('prisma/schema.prisma')

  return {
    schemaPath,
    nexus,
  }
})

describe('getGenerators', () => {
  it('scaffolds a prisma client block if not present already', async () => {
    const content =
      stripIndent`
        model Foo {
          id Int @id
        }
      ` + os.EOL
    ctx.fs.write(ctx.schemaPath, content)
    await getGenerators(ctx.nexus, ctx.schemaPath)
    expect(ctx.fs.read(ctx.schemaPath)).toMatchInlineSnapshot(`
      "model Foo {
        id Int @id
      }

      generator prisma_client {
        provider = \\"prisma-client-js\\"
      }
      "
    `)
    const warn = ctx.nexus.log.warn as jest.Mock
    expect(warn.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "A Prisma Client generator block has been scaffolded for you in [1mprisma/schema.prisma[22m",
        ],
      ]
    `)
  })

  it('scaffolds a model if none present', async () => {
    const content =
      stripIndent`
        generator prisma_client {
          provider = "prisma-client-js"
        }
      ` + os.EOL
    ctx.fs.write(ctx.schemaPath, content)
    await getGenerators(ctx.nexus, ctx.schemaPath)
    expect(ctx.fs.read(ctx.schemaPath)).toMatchInlineSnapshot(`
      "generator prisma_client {
        provider = \\"prisma-client-js\\"
      }

      // This \\"Example\\" model has been generated for you by Nexus.
      // Nexus does this when you do not have any models defined.
      // For more detail and examples of working with your Prisma
      // Schema, refer to its complete docs at https://pris.ly/d/prisma-schema.

      model Example {
        id    Int     @id @default(autoincrement())
        email String  @unique
        name  String?
      }
      "
    `)
    const warn = ctx.nexus.log.warn as jest.Mock
    expect(warn.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "An example model has been scaffolded for you in [1mprisma/schema.prisma[22m",
        ],
      ]
    `)
  })

  it('scaffolds both model and generator if none present', async () => {
    ctx.fs.write(ctx.schemaPath, '')
    await getGenerators(ctx.nexus, ctx.schemaPath)
    expect(ctx.fs.read(ctx.schemaPath)).toMatchInlineSnapshot(`
      "
      // This \\"Example\\" model has been generated for you by Nexus.
      // Nexus does this when you do not have any models defined.
      // For more detail and examples of working with your Prisma
      // Schema, refer to its complete docs at https://pris.ly/d/prisma-schema.

      model Example {
        id    Int     @id @default(autoincrement())
        email String  @unique
        name  String?
      }

      generator prisma_client {
        provider = \\"prisma-client-js\\"
      }
      "
    `)
  })
})

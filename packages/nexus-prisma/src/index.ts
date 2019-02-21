import { GraphQLSchema } from 'graphql'
import { core } from 'nexus'
import { PrismaSchemaBuilder } from './builder'
import { PrismaSchemaConfig } from './types'

export * from './definitions'

interface PrismaSchemaConfigRequiredTypes extends PrismaSchemaConfig {
  types: any
}

function validateOptions(options: PrismaSchemaConfig): void {
  if (!options.prisma) {
    throw new Error(
      'Missing `prisma` property in `makePrismaSchema({ prisma: { ... } })`',
    )
  }

  if (!options.prisma.datamodelInfo) {
    throw new Error(
      'Missing `prisma.datamodelInfo` property in `makePrismaSchema({ prisma: { datamodelInfo: ... } })`',
    )
  }

  if (
    !options.prisma.datamodelInfo.uniqueFieldsByModel ||
    !options.prisma.datamodelInfo.clientPath ||
    !options.prisma.datamodelInfo.schema
  ) {
    throw new Error(
      'Invalid `prisma.datamodelInfo` property. This should be imported from the `nexus-prisma-generate` output directory',
    )
  }

  if (!options.prisma.client) {
    throw new Error(
      'Missing `prisma.client` property in `makePrismaSchema({ prisma: { client: ... } })`',
    )
  }

  if (
    typeof options.prisma.client !== 'function' &&
    (!options.prisma.client.$exists || !options.prisma.client.$graphql)
  ) {
    throw new Error(
      `\
Invalid \`prisma.client\` property in \`makePrismaSchema({ prisma: { client: ... } })\`.
This should either be an instance of the generated prisma-client, or a function that returns the prisma-client instance from your GraphQL server context
`,
    )
  }
}

export function makePrismaSchema(options: PrismaSchemaConfig): GraphQLSchema {
  validateOptions(options)

  const builder = new PrismaSchemaBuilder(options)

  if (!options.types) {
    options.types = []
  }

  const { schema } = core.makeSchemaInternal(
    options as PrismaSchemaConfigRequiredTypes,
    builder,
  )

  // Only in development envs do we want to worry about regenerating the
  // schema definition and/or generated types.
  const {
    shouldGenerateArtifacts = Boolean(
      !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    ),
  } = options

  if (shouldGenerateArtifacts) {
    // Generating in the next tick allows us to use the schema
    // in the optional thunk for the typegen config
    new core.TypegenMetadata(options).generateArtifacts(schema).catch(e => {
      console.error(e)
    })
  }

  return schema
}

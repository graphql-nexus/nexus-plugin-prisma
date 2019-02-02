import { GraphQLSchema } from 'graphql'
import { core } from 'nexus'
import { PrismaSchemaBuilder } from './builder'
import { withPrismaTypes } from './definition'
import { PrismaSchemaConfig } from './types'
import { removeUnusedTypesFromSchema } from './unused-types'

export { /*prismaEnumType, */ prismaObjectType } from './definition'

export function makePrismaSchema(options: PrismaSchemaConfig): GraphQLSchema {
  options.types = withPrismaTypes(options.types)

  const { schema } = core.makeSchemaInternal(options, PrismaSchemaBuilder)

  // Only in development envs do we want to worry about regenerating the
  // schema definition and/or generated types.
  const {
    shouldGenerateArtifacts = Boolean(
      !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    ),
  } = options

  if (shouldGenerateArtifacts) {
    // Remove all unused types to keep the generated schema clean
    const filteredSchema = removeUnusedTypesFromSchema(schema)

    // Generating in the next tick allows us to use the schema
    // in the optional thunk for the typegen config
    new core.TypegenMetadata(options)
      .generateArtifacts(filteredSchema)
      .catch(e => {
        console.error(e)
      })
  }

  return schema
}

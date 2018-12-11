import { makeSchemaWithMetadata } from 'nexus'
import { PrismaSchemaConfig } from './types'
import { SchemaBuilder, Metadata } from 'nexus/dist/core'

export { prismaObjectType } from './prisma'

class PrismaSchemaBuilder extends SchemaBuilder {
  constructor(metadata: Metadata, config: PrismaSchemaConfig) {
    super(metadata, config)
  }

  public getConfig() {
    return this.config
  }
}

export function buildPrismaSchema(options: PrismaSchemaConfig) {
  const { schema, metadata } = makeSchemaWithMetadata(
    options,
    PrismaSchemaBuilder,
  )

  // Only in development envs do we want to worry about regenerating the
  // schema definition and/or generated types.
  const {
    shouldGenerateArtifacts = process.env.NODE_ENV !== 'production',
  } = options

  if (shouldGenerateArtifacts) {
    // Generating in the next tick allows us to use the schema
    // in the optional thunk for the typegen config
    metadata.generateArtifacts(schema)
  }

  return schema
}

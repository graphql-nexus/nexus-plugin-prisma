import { existsSync } from 'fs'
import { makeSchemaWithMetadata, core } from 'nexus'
import { withPrismaTypes } from './prisma'
import { extractTypes, TypesMap } from './source-helper'
import { PrismaSchemaConfig } from './types'
import { removeUnusedTypesFromSchema } from './unused-types'
import { GraphQLSchema } from 'graphql'

export { prismaEnumType, prismaObjectType } from './prisma'

export class PrismaSchemaBuilder extends core.SchemaBuilder {
  private prismaTypesMap: TypesMap | null = null

  constructor(
    protected metadata: core.Metadata,
    protected config: PrismaSchemaConfig,
  ) {
    super(metadata, config)

    if (!this.config.prisma) {
      throw new Error('Required `prisma` object in config was not provided')
    }

    if (
      !this.config.prisma.schemaPath ||
      !existsSync(this.config.prisma.schemaPath)
    ) {
      throw new Error(
        `No valid \`prisma.schemaPath\` was found at ${
          this.config.prisma.schemaPath
        }`,
      )
    }
  }

  public getConfig() {
    return this.config
  }

  public getPrismaTypesMap() {
    if (!this.prismaTypesMap) {
      this.prismaTypesMap = extractTypes(this.config.prisma.schemaPath)
    }

    return this.prismaTypesMap
  }
}

export function makePrismaSchema(options: PrismaSchemaConfig): GraphQLSchema {
  options.types = withPrismaTypes(options.types)

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
    // Remove all unused types to keep the generated schema clean
    const filteredSchema = removeUnusedTypesFromSchema(schema)

    // Generating in the next tick allows us to use the schema
    // in the optional thunk for the typegen config
    metadata.generateArtifacts(filteredSchema)
  }

  return schema
}

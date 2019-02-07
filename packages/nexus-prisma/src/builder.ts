import { buildClientSchema, GraphQLNamedType, GraphQLSchema } from 'graphql'
import { core } from 'nexus'
import { graphqlTypeToNexus } from './graphqlToNexus'
import { PrismaSchemaConfig } from './types'

export class PrismaSchemaBuilder extends core.SchemaBuilder {
  private prismaSchema: GraphQLSchema | null = null

  constructor(protected config: PrismaSchemaConfig) {
    super(config)

    if (!this.config.prisma) {
      throw new Error(
        'ERROR: Missing `prisma` property in `makePrismaSchema({ prisma: { ... } })`',
      )
    }

    if (!this.config.prisma.schemaConfig) {
      throw new Error(
        'Missing `prisma.schemaConfig` property in `makePrismaSchema({ prisma: { ... } })`',
      )
    }

    if (
      !this.config.prisma.schemaConfig.uniqueFieldsByModel ||
      !this.config.prisma.schemaConfig.schema
    ) {
      throw new Error(
        'Invalid `prisma.schemaConfig` property. This should be imported from the `nexus-prisma-generate` output directory',
      )
    }
  }

  protected missingType(typeName: string): GraphQLNamedType {
    const type = this.getPrismaSchema().getType(typeName)

    if (type) {
      return graphqlTypeToNexus(
        this,
        type,
        this.config.prisma.contextClientName,
      )
    }

    return super.missingType(typeName)
  }

  public getConfig() {
    return this.config
  }

  public getPrismaSchema() {
    if (!this.prismaSchema) {
      this.prismaSchema = buildClientSchema(
        this.config.prisma.schemaConfig.schema,
      )
    }

    return this.prismaSchema
  }
}

export function isPrismaSchemaBuilder(obj: any): obj is PrismaSchemaBuilder {
  return obj && obj instanceof PrismaSchemaBuilder
}

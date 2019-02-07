import { buildClientSchema, GraphQLNamedType, GraphQLSchema } from 'graphql'
import { core } from 'nexus'
import { graphqlTypeToNexus } from './graphqlToNexus'
import { PrismaSchemaConfig } from './types'

export class PrismaSchemaBuilder extends core.SchemaBuilder {
  private prismaSchema: {
    uniqueFieldsByModel: Record<string, string[]>
    schema: GraphQLSchema
  }

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

    this.prismaSchema = {
      uniqueFieldsByModel: this.config.prisma.schemaConfig.uniqueFieldsByModel,
      schema: buildClientSchema(this.config.prisma.schemaConfig.schema),
    }
  }

  protected missingType(typeName: string): GraphQLNamedType {
    const type = this.getPrismaSchema().schema.getType(typeName)

    if (type) {
      return graphqlTypeToNexus(
        this,
        type,
        this.config.prisma.contextClientName,
        this.config.prisma.schemaConfig.uniqueFieldsByModel,
      )
    }

    return super.missingType(typeName)
  }

  public getConfig() {
    return this.config
  }

  public getPrismaSchema() {
    return this.prismaSchema
  }
}

export function isPrismaSchemaBuilder(obj: any): obj is PrismaSchemaBuilder {
  return obj && obj instanceof PrismaSchemaBuilder
}

import { buildClientSchema, GraphQLNamedType, GraphQLSchema } from 'graphql'
import { core } from 'nexus'
import { graphqlTypeToNexus } from './graphqlToNexus'
import { PrismaSchemaConfig } from './types'

export class PrismaSchemaBuilder extends core.SchemaBuilder {
  private nexusPrismaSchema: {
    uniqueFieldsByModel: Record<string, string[]>
    schema: GraphQLSchema
  }

  constructor(protected config: PrismaSchemaConfig) {
    super(config)

    this.nexusPrismaSchema = {
      uniqueFieldsByModel: this.config.prisma.datamodelInfo.uniqueFieldsByModel,
      schema: buildClientSchema(this.config.prisma.datamodelInfo.schema),
    }
  }

  protected missingType(typeName: string): GraphQLNamedType {
    const type = this.getNexusPrismaSchema().schema.getType(typeName)

    if (type) {
      return graphqlTypeToNexus(
        this,
        type,
        this.config.prisma.client,
        this.config.prisma.datamodelInfo.uniqueFieldsByModel,
      )
    }

    return super.missingType(typeName)
  }

  public getConfig() {
    return this.config
  }

  public getNexusPrismaSchema() {
    return this.nexusPrismaSchema
  }
}

export function isPrismaSchemaBuilder(obj: any): obj is PrismaSchemaBuilder {
  return obj && obj instanceof PrismaSchemaBuilder
}

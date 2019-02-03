import { existsSync, readFileSync } from 'fs'
import { buildSchema, GraphQLNamedType, GraphQLSchema } from 'graphql'
import { core } from 'nexus'
import { graphqlTypeToNexus } from './graphqlToNexus'
import { PrismaSchemaConfig } from './types'

export class PrismaSchemaBuilder extends core.SchemaBuilder {
  private prismaTypesMap: GraphQLSchema | null = null

  constructor(protected config: PrismaSchemaConfig) {
    super(config)

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
    if (!this.prismaTypesMap) {
      const typeDefs = readFileSync(this.config.prisma.schemaPath).toString()

      this.prismaTypesMap = buildSchema(typeDefs)
    }

    return this.prismaTypesMap
  }
}

export function isPrismaSchemaBuilder(obj: any): obj is PrismaSchemaBuilder {
  return obj && obj instanceof PrismaSchemaBuilder
}

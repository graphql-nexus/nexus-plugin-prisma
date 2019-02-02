import { existsSync, readFileSync } from 'fs'
import {
  buildSchema,
  GraphQLSchema,
  GraphQLNamedType,
  isObjectType,
} from 'graphql'
import { core } from 'nexus'
import { PrismaSchemaConfig } from './types'
import { getTypeName, isList, isRequired } from './graphql'
import { generateDefaultResolver } from './resolver'

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
      const finalType = graphqlTypeToNexusType(
        this,
        type,
        this.config.prisma.contextClientName,
      )
      this.finalTypeMap[typeName] = finalType
      return finalType
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

function graphqlTypeToNexusType(
  builder: PrismaSchemaBuilder,
  type: GraphQLNamedType,
  contextClientName: string,
): GraphQLNamedType {
  if (isObjectType(type)) {
    return builder.objectType({
      name: type.name,
      definition(t) {
        Object.values(type.getFields()).forEach(f => {
          t.field(f.name, {
            type: getTypeName(f.type),
            list: isList(f.type) ? true : undefined,
            nullable: isRequired(f.type),
            resolve: generateDefaultResolver(type.name, f, contextClientName),
          })
        })
      },
    })
  }

  return type
}

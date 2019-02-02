import { existsSync, readFileSync } from 'fs'
import {
  buildSchema,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
  GraphQLFieldConfigArgumentMap,
} from 'graphql'
import { core } from 'nexus'
import { PrismaSchemaConfig } from './types'
import { PrismaObjectDefinitionBlock } from './definition'

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

  /**
   * Override `objectType` to pass a custom DefinitionBlock
   */
  objectType(config: core.NexusObjectTypeConfig<any>) {
    const fields: core.NexusOutputFieldDef[] = []
    const interfaces: core.Implemented[] = []
    const modifications: Record<
      string,
      core.FieldModificationDef<string, string>[]
    > = {}
    const definitionBlock = new PrismaObjectDefinitionBlock(
      {
        addField: fieldDef => fields.push(fieldDef),
        addInterfaces: interfaceDefs => interfaces.push(...interfaceDefs),
        addFieldModifications(mods) {
          modifications[mods.field] = modifications[mods.field] || []
          modifications[mods.field].push(mods)
        },
      },
      config.name,
      this,
    )
    config.definition(this.withScalarMethods(definitionBlock))

    const extensions = this.typeExtensionMap[config.name]
    if (extensions) {
      extensions.forEach(extension => {
        extension.definition(definitionBlock)
      })
    }
    return new GraphQLObjectType({
      name: config.name,
      interfaces: () => interfaces.map(i => this.getInterface(i)),
      description: config.description,
      fields: () => {
        const allFieldsMap: GraphQLFieldConfigMap<any, any> = {}
        const allInterfaces = interfaces.map(i => this.getInterface(i))
        allInterfaces.forEach(i => {
          const interfaceFields = i.getFields()
          // We need to take the interface fields and reconstruct them
          // this actually simplifies things becuase if we've modified
          // the field at all it needs to happen here.
          Object.keys(interfaceFields).forEach(iFieldName => {
            const { isDeprecated, args, ...rest } = interfaceFields[iFieldName]
            allFieldsMap[iFieldName] = {
              ...rest,
              args: args.reduce(
                (result: GraphQLFieldConfigArgumentMap, arg) => {
                  const { name, ...argRest } = arg
                  result[name] = argRest
                  return result
                },
                {},
              ),
            }
            const mods = modifications[iFieldName]
            if (mods) {
              mods.map(mod => {
                if (typeof mod.description !== 'undefined') {
                  allFieldsMap[iFieldName].description = mod.description
                }
                if (typeof mod.resolve !== 'undefined') {
                  allFieldsMap[iFieldName].resolve = mod.resolve
                }
              })
            }
          })
        })
        return this.buildObjectFields(fields, config, allFieldsMap)
      },
    })
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

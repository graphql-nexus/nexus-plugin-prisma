import { core, objectType } from 'nexus'
import {
  PrismaObjectDefinitionBlock,
  prismaObjectDefinitionBlock,
  prismaTypeObject,
} from '../blocks/objectType'
import { isPrismaSchemaBuilder, PrismaSchemaBuilder } from '../builder'
import { PrismaObjectTypeNames } from '../types'

export interface PrismaObjectTypeConfig<TypeName extends string>
  extends core.Omit<core.NexusObjectTypeConfig<TypeName>, 'definition'> {
  /**
   * **Exposes all fields of the underliying object type by default**.
   * Omit/customize fields by explicitely calling t.prismaFields()
   *
   * @optional When not provided, all fields will also be exposed
   */
  definition?: (t: PrismaObjectDefinitionBlock<TypeName>) => void
}

export function prismaObjectType<TypeName extends PrismaObjectTypeNames>(
  typeConfig: PrismaObjectTypeConfig<TypeName>,
): core.NexusWrappedType<core.NexusObjectTypeDef<TypeName>> {
  return core.nexusWrappedType(typeConfig.name, builder => {
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error('prismaObjectType can only be used by `makePrismaSchema`')
    }

    return nexusObjectType(typeConfig, builder)
  })
}

function nexusObjectType<TypeName extends string>(
  typeConfig: PrismaObjectTypeConfig<TypeName>,
  builder: PrismaSchemaBuilder,
): core.NexusObjectTypeDef<TypeName> {
  let { definition, ...rest } = typeConfig
  const nexusPrismaSchema = builder.getNexusPrismaSchema()
  const prismaType = prismaTypeObject(
    nexusPrismaSchema,
    typeConfig,
    builder.getConfig(),
  )
  const prismaSchema = nexusPrismaSchema.schema

  return objectType({
    ...rest,
    definition(block) {
      const prismaBlock = prismaObjectDefinitionBlock(
        typeConfig.name,
        block as PrismaObjectDefinitionBlock<TypeName>,
        prismaType,
        prismaSchema,
      )

      if (!definition) {
        definition = t => t.prismaFields()
      }

      definition(prismaBlock)

      if (!prismaBlock.__calledPrismaFields) {
        prismaBlock.prismaFields()
      }
    },
  })
}

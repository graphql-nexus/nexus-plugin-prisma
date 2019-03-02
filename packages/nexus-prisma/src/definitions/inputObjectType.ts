import { GraphQLSchema } from 'graphql'
import { core, inputObjectType } from 'nexus'
import {
  PrismaInputDefinitionBlock,
  prismaInputDefinitionBlock,
  prismaTypeInputObject,
} from '../blocks/inputObjectType'
import { isPrismaSchemaBuilder } from '../builder'
import { PrismaInputObjectTypeNames } from '../types'

export interface PrismaInputObjectTypeConfig<TypeName extends string>
  extends core.Omit<core.NexusInputObjectTypeConfig<TypeName>, 'definition'> {
  definition: (t: PrismaInputDefinitionBlock<TypeName>) => void
}

/**
 * Exposes an input object type based on the datamodel
 */
export function prismaInputObjectType<
  TypeName extends PrismaInputObjectTypeNames
>(
  typeConfig: PrismaInputObjectTypeConfig<TypeName>,
): core.NexusWrappedType<core.NexusInputObjectTypeDef<TypeName>> {
  return core.nexusWrappedType(typeConfig.name, builder => {
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error(
        'prismaInputObjectType can only be used by `makePrismaSchema`',
      )
    }
    const prismaSchema = builder.getDatamodelInfo().schema

    return nexusInputObjectType(typeConfig, prismaSchema)
  })
}

function nexusInputObjectType<TypeName extends string>(
  typeConfig: PrismaInputObjectTypeConfig<TypeName>,
  prismaSchema: GraphQLSchema,
): core.NexusInputObjectTypeDef<TypeName> {
  let { definition, ...rest } = typeConfig
  const prismaType = prismaTypeInputObject(prismaSchema, typeConfig)

  return inputObjectType({
    ...rest,
    definition(block) {
      const prismaBlock = prismaInputDefinitionBlock(
        typeConfig.name,
        block,
        prismaType,
        prismaSchema,
      )
      definition(prismaBlock)
    },
  })
}

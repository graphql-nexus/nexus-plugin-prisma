import { GraphQLSchema, isInputObjectType, isObjectType } from 'graphql'
import { core, extendType } from 'nexus'
import { isPrismaSchemaBuilder } from '../builder'
import { inputObjectTypeFieldsToNexus } from '../graphqlToNexus/inputObjectType'
import { objectTypeFieldsToNexus } from '../graphqlToNexus/objectType'
import {
  Omit,
  PrismaInputObjectTypeNames,
  PrismaObjectTypeNames,
  PrismaSchemaConfig,
} from '../types'
import {
  generatePrismaInputObjectTypeBlock,
  PrismaInputDefinitionBlock,
} from './inputObjectType'
import {
  generatePrismaObjectTypeBlock,
  PrismaObjectDefinitionBlock,
} from './objectType'

type PrismaExtendDefinitionBlock<
  TypeName extends string
> = TypeName extends PrismaObjectTypeNames
  ? PrismaObjectDefinitionBlock<TypeName>
  : PrismaInputDefinitionBlock<TypeName>

export interface PrismaExtendTypeConfig<TypeName extends string>
  extends Omit<core.NexusExtendTypeConfig<TypeName>, 'definition'> {
  definition: (t: PrismaExtendDefinitionBlock<TypeName>) => void
}

export function prismaExtendType<
  TypeName extends string = PrismaObjectTypeNames | PrismaInputObjectTypeNames
>(
  typeConfig: PrismaExtendTypeConfig<TypeName>,
): core.NexusWrappedType<core.NexusObjectTypeDef<TypeName>> {
  // @ts-ignore
  return core.nexusWrappedType(typeConfig.type, builder => {
    let { definition, ...rest } = typeConfig
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error('prismaExtendType can only be used by `makePrismaSchema`')
    }
    const typeName = typeConfig.type
    const prismaSchema = builder.getPrismaSchema().schema
    const prismaType = generatePrismaTypes(
      typeConfig.type,
      builder.getPrismaSchema(),
      builder.getConfig(),
    )
    const graphqlType = prismaSchema.getType(typeName)

    return extendType({
      ...rest,
      definition(t) {
        const prismaBlock = isObjectType(graphqlType)
          ? generatePrismaObjectTypeBlock(typeName, t, prismaType, prismaSchema)
          : generatePrismaInputObjectTypeBlock(
              typeName,
              t,
              prismaType,
              prismaSchema,
            )

        // @ts-ignore
        definition(prismaBlock)
      },
    })
  })
}

function generatePrismaTypes(
  typeName: string,
  nexusPrismaSchema: {
    uniqueFieldsByModel: Record<string, string[]>
    schema: GraphQLSchema
  },
  builderConfig: PrismaSchemaConfig,
):
  | Record<string, core.NexusOutputFieldConfig<string, string>>
  | Record<string, core.NexusInputFieldConfig> {
  const graphqlType = nexusPrismaSchema.schema.getType(typeName)

  if (!isObjectType(graphqlType) && !isInputObjectType(graphqlType)) {
    throw new Error(
      `Must select a GraphQLObjectType | GraphQLInputObjectType, saw ${typeName} which is ${graphqlType}`,
    )
  }

  if (isObjectType(graphqlType)) {
    return objectTypeFieldsToNexus(
      graphqlType,
      builderConfig.prisma.contextClientName,
      nexusPrismaSchema.uniqueFieldsByModel,
    )
  } else {
    return inputObjectTypeFieldsToNexus(graphqlType)
  }
}

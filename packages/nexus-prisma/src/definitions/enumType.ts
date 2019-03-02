import { GraphQLEnumValue, GraphQLNamedType, isEnumType } from 'graphql'
import { core } from 'nexus'
import { isPrismaSchemaBuilder, PrismaSchemaBuilder } from '../builder'
import { PrismaEnumTypeNames, PrismaEnumTypeValues } from '../types'

interface PrismaEnumTypeConfig<TypeName extends string>
  extends core.Omit<core.EnumTypeConfig<TypeName>, 'members'> {
  members: PrismaEnumTypeValues<TypeName>[]
}

export function prismaEnumType<TypeName extends PrismaEnumTypeNames>(
  typeConfig: PrismaEnumTypeConfig<TypeName>,
): core.NexusWrappedType<core.NexusEnumTypeDef<TypeName>> {
  return core.nexusWrappedType(typeConfig.name, builder => {
    if (!isPrismaSchemaBuilder(builder)) {
      throw new Error('prismaEnumType can only be used by `makePrismaSchema`')
    }

    return nexusEnumType(typeConfig, builder)
  })
}

function nexusEnumType<TypeName extends string>(
  typeConfig: PrismaEnumTypeConfig<TypeName>,
  builder: PrismaSchemaBuilder,
): core.NexusEnumTypeDef<TypeName> {
  const typeName = typeConfig.name
  const prismaSchema = builder.getDatamodelInfo().schema
  const graphqlType = prismaSchema.getType(typeName)
  const members = getEnumTypeMembers(typeName, typeConfig.members, graphqlType)
  const description = typeConfig.description
    ? typeConfig.description
    : graphqlType!.description

  return core.enumType({
    name: typeName,
    description,
    members,
  })
}

export function getEnumTypeMembers(
  typeName: string,
  members: string[],
  graphqlType: GraphQLNamedType | null | undefined,
): GraphQLEnumValue[] {
  if (!isEnumType(graphqlType)) {
    throw new Error(
      `Must select a GraphQLEnumType, saw ${typeName} which is ${graphqlType}`,
    )
  }

  return members.map(member => {
    const value = graphqlType.getValue(member)

    if (!value) {
      throw new Error(
        `Could not find ${graphqlType.name}.${member} in Prisma API`,
      )
    }

    return value
  })
}

import { GraphQLField, GraphQLObjectType } from 'graphql/type'
import { core } from 'nexus'
import { PrismaSchemaBuilder } from '../builder'
import { getTypeName } from '../graphql'
import { generateDefaultResolver } from '../resolver'
import { PrismaClientInput, InternalDatamodelInfo } from '../types'
import { graphqlArgsToNexusArgs, graphqlTypeToCommonNexus } from './common'

export function objectTypeToNexus(
  builder: PrismaSchemaBuilder,
  type: GraphQLObjectType<any, any>,
  prismaClient: PrismaClientInput,
  datamodelInfo: InternalDatamodelInfo,
) {
  const nexusFieldsConfig = objectTypeFieldsToNexus(
    type,
    prismaClient,
    datamodelInfo,
  )

  return builder.buildObjectType({
    name: type.name,
    definition(t) {
      Object.entries(nexusFieldsConfig).forEach(([name, config]) => {
        t.field(name, config)
      })
      type.getInterfaces().forEach(interfaceType => {
        t.implements(interfaceType.name)
      })
    },
  })
}

function objectTypeFieldToNexus(
  typeName: string,
  field: GraphQLField<any, any>,
  prismaClient: PrismaClientInput,
  datamodelInfo: InternalDatamodelInfo,
): core.NexusOutputFieldConfig<any, any> {
  return {
    ...graphqlTypeToCommonNexus(field),
    type: getTypeName(field.type),
    resolve: generateDefaultResolver(
      typeName,
      field,
      prismaClient,
      datamodelInfo,
    ),
    args: graphqlArgsToNexusArgs(field.args),
  }
}

export function objectTypeFieldsToNexus(
  type: GraphQLObjectType,
  prismaClient: PrismaClientInput,
  datamodelInfo: InternalDatamodelInfo,
) {
  let fields = Object.values(type.getFields())

  // TODO: Remove that once `node` is removed from the Prisma API
  if (type.name === 'Query') {
    fields = fields.filter(f => f.name !== 'node')
  }

  return fields.reduce<Record<string, core.FieldOutConfig<string, string>>>(
    (acc, field) => {
      acc[field.name] = objectTypeFieldToNexus(
        getTypeName(type),
        field,
        prismaClient,
        datamodelInfo,
      )

      return acc
    },
    {},
  )
}

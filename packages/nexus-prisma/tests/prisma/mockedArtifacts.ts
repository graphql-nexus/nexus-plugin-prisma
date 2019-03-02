import { prisma } from './prisma-client'
import datamodelInfo from './nexus-prisma'
import { makePrismaSchema } from '../../src'
import { buildClientSchema } from 'graphql'
import { InternalDatamodelInfo } from '../../src/types'

export function mockSchema(types: any) {
  return makePrismaSchema({
    types,
    outputs: {
      schema: false,
      typegen: false,
    },
    prisma: {
      client: prisma,
      datamodelInfo,
    },
  })
}

export const mockedDatamodelInfo: InternalDatamodelInfo = {
  ...datamodelInfo,
  schema: buildClientSchema(datamodelInfo.schema as any),
}

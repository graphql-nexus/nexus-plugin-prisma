import { prisma } from './prisma-client'
import datamodelInfo from './nexus-prisma'
import { makePrismaSchema } from '../../src'

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

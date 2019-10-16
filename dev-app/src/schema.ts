import { makeSchema } from 'nexus'
import { nexusPrismaPlugin } from 'nexus-prisma'
import * as types from './types'

export const schema = makeSchema({
  types: [types, nexusPrismaPlugin({ types })],
})

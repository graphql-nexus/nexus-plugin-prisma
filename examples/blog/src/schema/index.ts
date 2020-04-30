import * as NexusSchema from '@nexus/schema'
import { nexusPrismaPlugin } from 'nexus-prisma'
import * as path from 'path'
import * as Blog from './Blog'
import * as Mutation from './Mutation'
import * as Post from './Post'
import * as Query from './Query'
import * as Tag from './Tag'
import * as User from './User'

export default NexusSchema.makeSchema({
  types: [Query, Mutation, Blog, Post, User, Tag],
  plugins: [nexusPrismaPlugin()],
  outputs: {
    typegen: path.join(
      __dirname,
      '../../node_modules/@types/nexus-typegen/index.d.ts',
    ),
  },
  typegenAutoConfig: {
    contextType: 'Context.Context',
    sources: [
      {
        source: '.prisma/client',
        alias: 'prisma',
      },
      {
        source: require.resolve('../context'),
        alias: 'Context',
      },
    ],
  },
})

import * as NexusSchema from '@nexus/schema'
import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'
import * as path from 'path'
import * as Blog from './Blog'
import * as Mutation from './Mutation'
import * as Post from './Post'
import * as Query from './Query'
import * as Tag from './Tag'
import * as User from './User'

export default NexusSchema.makeSchema({
  types: [Query, Mutation, Blog, Post, User, Tag],
  plugins: [
    nexusSchemaPrisma({
      experimentalCRUD: true,
    }),
  ],
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

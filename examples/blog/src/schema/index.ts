import * as Nexus from 'nexus'
import { nexusPrismaPlugin } from 'nexus-prisma'
import * as Query from './Query'
import * as Mutation from './Mutation'
import * as Blog from './Blog'
import * as Post from './Post'
import * as User from './User'
import * as path from 'path'

export default Nexus.makeSchema({
  types: [Query, Mutation, Blog, Post, User],
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
        source: '@generated/photon',
        alias: 'photon',
      },
      {
        source: require.resolve('../context'),
        alias: 'Context',
      },
    ],
  },
})

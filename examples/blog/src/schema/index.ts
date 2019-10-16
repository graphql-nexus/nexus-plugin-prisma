import * as Nexus from 'nexus'
import * as NexusPrisma from 'nexus-prisma'
import * as Query from './Query'
import * as Mutation from './Mutation'
import * as Blog from './Blog'
import * as Post from './Post'
import * as User from './User'

const types = [Query, Mutation, Blog, Post, User]

export default Nexus.makeSchema({
  types,
  plugins: [NexusPrisma.nexusPrismaPlugin()],
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

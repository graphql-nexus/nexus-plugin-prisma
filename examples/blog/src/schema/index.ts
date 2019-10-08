import * as Nexus from 'nexus'
import * as NexusPrisma from 'nexus-prisma'
import * as Query from './Query'
import * as Mutation from './Mutation'
import * as Blog from './Blog'
import * as Post from './Post'
import * as User from './User'

const appTypes = [Query, Mutation, Blog, Post, User]
const nexusPrismaTypes = NexusPrisma.nexusPrismaPlugin({ types: appTypes })
const allTypes = [appTypes, nexusPrismaTypes]

export default Nexus.makeSchema({
  types: allTypes,
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

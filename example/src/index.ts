import * as Path from 'path'
import * as Yoga from 'graphql-yoga'
import * as Nexus from 'nexus'
import * as NexusPrisma from 'nexus-prisma'
import * as allTypes from './graphql'
import Photon from '@generated/photon'

const photon = new Photon()
const nexusPrisma = NexusPrisma.nexusPrismaPlugin({
  types: allTypes,
  // FIXME: Because nexus-prisma is required from parent folder, it requires photon from the parent node_modules
  inputs: {
    photon: Path.join(__dirname, '../node_modules/@generated/photon'),
  },
})

const schema = Nexus.makeSchema({
  types: [allTypes, nexusPrisma],
  outputs: {
    typegen: Path.join(
      __dirname,
      '../node_modules/@types/__nexus-typegen__nexus-core/index.d.ts',
    ),
    schema: Path.join(__dirname, '../schema.graphql'),
  },
  typegenAutoConfig: {
    sources: [
      {
        source: '@generated/photon',
        alias: 'photon',
      },
    ],
  },
})

const server = new Yoga.GraphQLServer({
  schema,
  context: () => ({ photon }),
})

server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))

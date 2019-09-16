import Photon from '@generated/photon'
import * as Yoga from 'graphql-yoga'
import * as Nexus from 'nexus'
import * as Path from 'path'
import * as NexusPrisma from 'nexus-prisma'
import * as allTypes from './graphql'

type Context = {
  photon: Photon
}

const photon = new Photon()

const nexusPrisma = NexusPrisma.nexusPrismaPlugin({
  photon: (ctx: Context) => ctx.photon,
})

const schema = Nexus.makeSchema({
  types: [allTypes, nexusPrisma],
  outputs: {
    typegen: Path.join(__dirname, '/generated/nexus.d.ts'),
    schema: Path.join(__dirname, '/generated/schema.graphql'),
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
  context: (): Context => ({ photon }),
})

server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))

import Photon from '@generated/photon'
import * as Yoga from 'graphql-yoga'
import * as Nexus from 'nexus'
import * as Path from 'path'
import * as NexusPrisma from 'nexus-prisma'
import * as allTypes from './graphql'

main()

async function main() {
  const photon = new Photon()

  await photon.connect()

  const nexusPrisma = NexusPrisma.nexusPrismaPlugin({
    photon: ctx => ctx.photon,
  })

  NexusPrisma.generateTypes()

  const schema: any = Nexus.makeSchema({
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
    context: () => ({ photon }),
  })

  server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))
}

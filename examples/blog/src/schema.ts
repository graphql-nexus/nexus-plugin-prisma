import * as Path from 'path'
import * as Nexus from 'nexus'
import * as NexusPrisma from 'nexus-prisma'
import * as types from './types'

const nexusPrisma = NexusPrisma.nexusPrismaPlugin({ types })

export default Nexus.makeSchema({
  types: [types, nexusPrisma],
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

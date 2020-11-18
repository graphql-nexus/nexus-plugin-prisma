import * as NexusSchema from '@nexus/schema'
import { nexusPrisma } from 'nexus-plugin-prisma'
import * as path from 'path'
import * as types from './types'

export default NexusSchema.makeSchema({
  types,
  plugins: [
    nexusPrisma({
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

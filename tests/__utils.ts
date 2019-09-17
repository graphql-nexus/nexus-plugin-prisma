import * as Nexus from 'nexus'
import * as Photon from '@prisma/photon'
import tmp from 'tmp'
import * as NexusPrisma from '../src'

export async function generateSchema(datamodel: string, types: any[]) {
  const photonPath = tmp.dirSync()
  await Photon.generateClient({
    datamodel,
    outputDir: photonPath.name,
    cwd: __dirname,
    transpile: true,
  })
  const nexusPrisma = NexusPrisma.nexusPrismaPlugin({
    inputs: {
      photon: photonPath.name,
    },
  })
  const schema = Nexus.makeSchema({
    types: [types, nexusPrisma],
    outputs: false,
  })
  return schema
}

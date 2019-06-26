import { makeSchema } from '@prisma/nexus';
import { generateClient as generatePhoton } from '@prisma/photon';
import tmp from 'tmp';
import { getNexusPrismaRuntime } from '../src';

export async function generateSchema(datamodel: string, types: any[]) {
  const photonOutput = tmp.dirSync();

  await generatePhoton({
    datamodel,
    outputDir: photonOutput.name,
    cwd: __dirname,
    transpile: true
  });

  const { nexusPrismaRuntime } = getNexusPrismaRuntime(photonOutput.name);
  const { nexusPrismaPlugin } = eval(nexusPrismaRuntime);

  const nexusPrisma = nexusPrismaPlugin({ photon: (ctx: any) => ctx.photon });

  const schema = makeSchema({
    types: [types, nexusPrisma],
    outputs: false
  });

  return schema;
}

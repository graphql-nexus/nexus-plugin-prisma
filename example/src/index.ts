import Photon from '@generated/photon';
import { GraphQLServer } from 'graphql-yoga';
import { makeSchema } from '@prisma/nexus';
import { join } from 'path';
import { nexusPrismaPlugin } from '@generated/nexus-prisma';
import * as allTypes from './graphql';

main();

async function main() {
  const photon = new Photon();

  await photon.connect();

  const nexusPrisma = nexusPrismaPlugin({
    photon: ctx => ctx.photon
  });

  const schema = makeSchema({
    types: [allTypes, nexusPrisma],
    outputs: {
      typegen: join(__dirname, './nexus-typegen.ts'),
      schema: join(__dirname, '/schema.graphql')
    },
    typegenAutoConfig: {
      sources: [
        {
          source: '@generated/photon',
          alias: 'photon'
        }
      ]
    }
  });

  const server = new GraphQLServer({
    schema,
    context: () => ({ photon })
  });

  server.start(() => console.log(`🚀 Server ready at http://localhost:4000`));
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_yoga_1 = require("graphql-yoga");
const nexus_1 = require("nexus");
const nexus_prisma_1 = require("nexus-prisma");
const photon_1 = require("@generated/photon");
const photon = new photon_1.Photon();
new graphql_yoga_1.GraphQLServer({
    context: () => ({ photon }),
    schema: nexus_1.makeSchema({
        typegenAutoConfig: {
            contextType: '{ photon: Photon.Photon }',
            sources: [{ source: '@generated/photon', alias: 'Photon' }],
        },
        plugins: [nexus_prisma_1.nexusPrismaPlugin()],
        types: [
            nexus_1.queryType({
                definition(t) {
                    t.crud.user();
                    t.crud.users({ ordering: true });
                    t.crud.post();
                    t.crud.posts({ filtering: true });
                },
            }),
            nexus_1.mutationType({
                definition(t) {
                    t.crud.createOneUser();
                    t.crud.createOnePost();
                    t.crud.deleteOneUser();
                    t.crud.deleteOnePost();
                },
            }),
            nexus_1.objectType({
                name: 'User',
                definition(t) {
                    t.model.id();
                    t.model.email();
                    t.model.birthDate();
                    t.model.posts();
                },
            }),
            nexus_1.objectType({
                name: 'Post',
                definition(t) {
                    t.model.id();
                    t.model.author();
                },
            }),
        ],
    }),
}).start(() => console.log(`🚀 GraphQL server ready at http://localhost:4000`));

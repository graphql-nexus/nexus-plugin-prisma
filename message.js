const boldWhite = "\u001b[37;1m";
const reset = "\u001b[0m";
const green = "\u001b[32;1m";
const purple = "\u001b[35;1m";
const CR = "\u001b[31;1m";
const blue = "\u001b[36;1m";
const red = "\u001b[1;31m";
const yellow = "\u001b[33;1m";
const gray = "\u001b[30;1m";

exports.content = `
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│   ${purple}nexus-prisma has migrated!${reset}                                      │
│   ${purple}nexus-prisma has migrated!${reset}                                      │
│   ${purple}nexus-prisma has migrated!${reset}                                      │
│                                                                   │
│   ${boldWhite}Please change your dependencies:${reset}                                │
│                                                                   │
│   npm remove nexus-prisma @prisma/client @prisma/cli              │
│   npm add nexus-plugin-prisma@TODO                                     │
│                                                                   │
│   ${boldWhite}Please change your imports:${reset}                                     │
│                                                                   │
│   import { nexusPluginPrisma } from ${red}'nexus-prisma'${reset}                │
│   import { nexusPluginPrisma } from ${green}'nexus-plugin-prisma/schema'${reset}  │
│                                                                   │
│-------------------------------------------------------------------│
│                                                                   │
│   ${boldWhite}Learn about the transition:${reset}	                                    │
│   https://nxs.li/nexus-prisma-to-nexus-plugin-prisma/about        │
│                                                                   │
│   ${boldWhite}Learn about the framework plugin:${reset}                               │
│   https://nxs.li/plugins/prisma                                   │
│                                                                   │
│   ${boldWhite}Learn how to migrate to the framework:${reset}                          │
│   https://nxs.li/schema-to-framework/migrate                      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

`;

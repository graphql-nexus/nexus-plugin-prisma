# `nexus-prisma` has migrated!

### Please Change These Things

#### Your Dependencies

```
npm remove nexus-prisma @prisma/client @prisma/cli
npm add nexus-plugin-prisma
```

#### Your Imports

```diff
- import { nexusPluginPrisma } from 'nexus-prisma'
+ import { nexusSchemaPrisma } from 'nexus-plugin-prisma/schema'
```

### Learn More

- [About the transition](https://nxs.li/nexus-prisma-to-nexus-plugin-prisma/about)
- [About the Prisma plugin for Nexus framework](https://nxs.li/plugins/prisma)
- [About how to migrate from `@nexus/schema` to Neuxs ](https://nxs.li/schema-to-framework/migrate)

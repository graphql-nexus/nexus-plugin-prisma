# Development

## `@nexus/schema` & `graphql`

- Dependend upon because `nexus-plugin-prisma/schema` has them as peer deps
- While `nexus` brings them, relying on that would be relying on their being hoisting, which we should not
- For more detail see https://github.com/graphql-nexus/nexus/issues/514#issuecomment-604668904

## Running e2e tests locally

- Set `NEXUS_VERSION` as you wish
- Set `NEXUS_PLUGIN_PRISMA_VERSION` as you wish
- have docker running on your machine
- `docker-compose up -d`
- `yarn test:fw:e2e:<name>`

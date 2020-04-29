# Blog

### Try It

```
docker run --detach --publish 5432:5432 -e POSTGRES_PASSWORD=postgres --name 'nexus-schema-plugin-prisma' postgres:10.12
```

```
yarn -s prisma migrate save --experimental
yarn -s prisma migrate up --experimental
yarn -s prisma generate
yarn -s ts-node prisma/seed.ts
```

```
yarn && yarn dev
```

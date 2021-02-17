# Hello World

### Try It

```
docker run --detach --publish 5432:5432 -e POSTGRES_PASSWORD=postgres --name 'nexus-schema-plugin-prisma-hello-world' postgres:10.12
```

```
yarn -s prisma generate
yarn -s prisma migrate reset --preview-feature
```

```
yarn && yarn dev
```

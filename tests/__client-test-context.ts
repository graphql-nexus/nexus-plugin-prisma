const MigratePackage = require('@prisma/migrate')
import { getGenerator } from '@prisma/internals'
import * as fs from 'fs-jetpack'
import getPort from 'get-port'
import { GraphQLScalarType, GraphQLSchema } from 'graphql'
import { GraphQLClient } from 'graphql-request'
import { createSchema, createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { Server } from 'http'
import * as Nexus from 'nexus'
import * as path from 'path'
import { tryDelete } from '../src/utils'
import { generateSchemaAndTypes } from './__utils'

type RuntimeTestContext = {
  setup: (args: {
    datamodel: string
    types: any[]
    plugins?: Nexus.core.NexusPlugin[]
    scalars?: Record<string, GraphQLScalarType>
    previewFeatures?: string[]
  }) => Promise<{
    graphqlClient: GraphQLClient
    dbClient: any
    schema: GraphQLSchema
    schemaString: string
  }>
}

type GeneratedClient = {
  client: any
  teardown: () => Promise<void>
}

export function createRuntimeTestContext(): RuntimeTestContext {
  let generatedClient: GeneratedClient | null = null
  let httpServer: Server | null = null

  const teardownCtx = async () => {
    await generatedClient?.teardown()
    httpServer?.close()
  }

  /**
   * Teardown context after each test (stop client and graphql server)
   */
  afterEach(teardownCtx)

  return {
    async setup({ datamodel, types, plugins, scalars, previewFeatures }) {
      try {
        const metadata = getTestMetadata(datamodel, previewFeatures)

        await fs.dirAsync(metadata.tmpDir)

        const prismaClient = await generateClientFromDatamodel(metadata)
        generatedClient = prismaClient

        const serverAndClient = await getGraphQLServerAndClient({
          datamodel: metadata.datamodel,
          types,
          prismaClient,
          plugins,
          scalars,
        })
        httpServer = serverAndClient.httpServer

        return {
          dbClient: prismaClient.client,
          graphqlClient: serverAndClient.client,
          schema: serverAndClient.schema,
          schemaString: serverAndClient.schemaString,
        }
      } catch (e: any) {
        console.log(`❌ failed ${e.stack}. If P1003, make sure sqlite3 is in the PATH`)
        await teardownCtx()
        throw e
      }
    },
  }
}

async function getGraphQLServerAndClient(params: {
  datamodel: string
  types: any[]
  plugins?: Nexus.core.NexusPlugin[]
  scalars?: Record<string, GraphQLScalarType>
  prismaClient: {
    client: any
    teardown(): Promise<void>
  }
}) {
  const { schema, schemaString } = await generateSchemaAndTypes(params.datamodel, params.types, {
    plugins: params.plugins,
    scalars: params.scalars,
  })
  const port = await getPort()
  const graphqlEndpoint = '/graphql'
  const url = `http://localhost:${port}${graphqlEndpoint}`

  const yoga = createYoga({
    schema: schema as any,
    context: { prisma: params.prismaClient.client },
    graphqlEndpoint,
    // port,
  })

  const httpServer = createServer(yoga)
  await new Promise((resolve) => {
    httpServer.listen(port, () => {
      console.log(`🕸️ listening on ${url}`)
      resolve(null)
    })
  })

  const client = new GraphQLClient(url)

  return { client, httpServer, schema, schemaString }
}

async function generateClientFromDatamodel(metadata: Metadata) {
  await fs.writeAsync(metadata.schemaPath, metadata.datamodel)

  await migrateLift(metadata.schemaPath)

  const generator = await getGenerator({
    schemaPath: metadata.schemaPath,
    printDownloadProgress: false,
    baseDir: metadata.tmpDir,
    dataProxy: false,
  })

  await generator.generate()
  generator.stop()

  const { PrismaClient } = require(path.join(metadata.clientDir, 'index.js'))
  const client = new PrismaClient()

  return {
    client,
    async teardown() {
      await client.$disconnect()
      await tryDelete(metadata.tmpDir)
    },
  }
}

async function migrateLift(schemaPath: string): Promise<void> {
  try {
    // console.log(`migrateLift(${schemaPath})   started >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`);

    // ref: https://github.com/prisma/prisma/issues/10306
    const devMigrate = new MigratePackage.MigrateDev()
    await devMigrate.parse([`--name=init`, '--skip-seed', `--schema=${schemaPath}`])

    // const migrate = new MigratePackage.Migrate(schemaPath)
    // console.log(`migrateLift(${schemaPath}) - init`);
    // console.log(`migrateLift(${schemaPath}) - getPrismaSchema() = ${migrate.getPrismaSchema()}`);
    // migrate.reset();
    // await migrate.push({ force: true })

    // console.log(`migrateLift(${schemaPath}) completed <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`);
  } catch (e: any) {
    console.log(`❌ failed during migration - ${e}`)
    throw e
  }
}

type Metadata = {
  tmpDir: string
  clientDir: string
  projectDir: string
  schemaPath: string
  datamodel: string
}

function getTestMetadata(datamodelString: string, previewFeatures?: string[]): Metadata {
  const uniqId = Math.random().toString().slice(2)
  const tmpDir = path.join(__dirname, `tmp/${uniqId}`)
  const shortTempDir = path.join('tests', `tmp/${uniqId}`) // absolute paths not working on WIN32 - https://github.com/prisma/prisma/issues/1732
  const shortClientDir = path.join(tmpDir, 'client')
  const clientDir = path.join(tmpDir, 'client')
  const projectDir = path.join(__dirname, '..')
  const schemaPath = path.join(tmpDir, 'schema.prisma')
  const datamodel = `
datasource db {
  provider = "sqlite"
  url      = "file:${path.join(tmpDir, 'dev.db').replace(/\\/g, '\\\\')}"
}

generator client {
  provider = "prisma-client-js"
  output   = "${shortClientDir.replace(/\\/g, '\\\\')}"
  ${previewFeatures ? `previewFeatures = ${JSON.stringify(previewFeatures)}` : ''}
}

${datamodelString}
`

  return {
    tmpDir,
    clientDir,
    projectDir,
    schemaPath,
    datamodel,
  }
}

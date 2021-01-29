import { Migrate } from '@prisma/migrate'
import { getGenerator } from '@prisma/sdk'
import endent from 'endent'
import * as fs from 'fs-jetpack'
import getPort from 'get-port'
import { GraphQLScalarType, GraphQLSchema } from 'graphql'
import { GraphQLClient } from 'graphql-request'
import { GraphQLServer } from 'graphql-yoga'
import { Server } from 'http'
import * as Nexus from 'nexus'
import * as path from 'path'
import { generateSchemaAndTypes } from './__utils'

type RuntimeTestContext = {
  setup: (args: {
    datamodel: string
    types: any[]
    plugins?: Nexus.core.NexusPlugin[]
    scalars?: Record<string, GraphQLScalarType>
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
    async setup({ datamodel, types, plugins, scalars }) {
      try {
        const metadata = getTestMetadata(datamodel)

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
      } catch (e) {
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
  const endpoint = '/graphql'
  const graphqlServer = new GraphQLServer({
    context: { prisma: params.prismaClient.client },
    schema: schema as any,
  })
  const client = new GraphQLClient(`http://localhost:${port}${endpoint}`)

  const httpServer = await graphqlServer.start({ port, endpoint })

  return { client, httpServer, schema, schemaString }
}

async function generateClientFromDatamodel(metadata: Metadata) {
  await fs.writeAsync(metadata.schemaPath, metadata.datamodel)

  await migrateLift(metadata.schemaPath)

  const generator = await getGenerator({
    schemaPath: metadata.schemaPath,
    printDownloadProgress: false,
    baseDir: metadata.tmpDir,
  })

  await generator.generate()
  generator.stop()

  const { PrismaClient } = require(path.join(metadata.clientDir, 'index.js'))
  const client = new PrismaClient()

  return {
    client,
    async teardown() {
      await fs.removeAsync(metadata.tmpDir)
      await client.$disconnect()
    },
  }
}

async function migrateLift(schemaPath: string): Promise<void> {
  const migrate = new Migrate(schemaPath)

  await migrate.push({ force: true })
}

type Metadata = {
  tmpDir: string
  clientDir: string
  projectDir: string
  schemaPath: string
  datamodel: string
}

function getTestMetadata(datamodelString: string): Metadata {
  const uniqId = Math.random().toString().slice(2)
  const tmpDir = path.join(__dirname, `tmp/${uniqId}`)
  const clientDir = path.join(tmpDir, 'client')
  const projectDir = path.join(__dirname, '..')
  const schemaPath = path.join(tmpDir, 'schema.prisma')
  const datamodel = endent`
    datasource db {
      provider = "sqlite"
      url      = "file:${tmpDir}/dev.db"
    }

    generator client {
      provider = "prisma-client-js"
      output   = "${clientDir}"
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

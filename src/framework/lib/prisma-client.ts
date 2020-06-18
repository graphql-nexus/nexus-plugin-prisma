import { PrismaClient } from '@prisma/client'
import { RuntimeLens } from 'nexus/plugin'
import * as Path from 'path'
import { PrismaClientOptions, Settings } from '../settings'
import { linkableRequire, linkableResolve } from './linkable'
/**
 * Makes sure `@prisma/client` is copied to ZEIT Now by statically requiring `@prisma/client`
 * We do not use this import because we need to require the Prisma Client using `linkableRequire`.
 */
require('@prisma/client')

let prismaClientInstance: PrismaClient | null = null

function isPrismaClient(clientInstance: any): clientInstance is PrismaClient {
  const hasConnect = clientInstance && typeof clientInstance.connect === 'function'
  const hasDisconnect = clientInstance && typeof clientInstance.disconnect === 'function'

  return hasConnect && hasDisconnect
}

function isPrismaClientOptions(clientOrOptions: any): clientOrOptions is PrismaClientOptions {
  return clientOrOptions && clientOrOptions.options !== null && typeof clientOrOptions.options === 'object'
}

function instantiatePrismaClient(clientOrOptions: Settings['client'], log: RuntimeLens['log']): PrismaClient {
  if (!clientOrOptions) {
    const { PrismaClient } = linkableRequire('@prisma/client')

    return new PrismaClient()
  }

  if (isPrismaClientOptions(clientOrOptions)) {
    const { PrismaClient } = linkableRequire('@prisma/client')

    return new PrismaClient(clientOrOptions.options)
  }

  if (!isPrismaClient(clientOrOptions.instance)) {
    log.fatal('The Prisma Client instance you passed is not valid. Make sure it was generated.')
    process.exit(1)
  }

  return clientOrOptions.instance
}

export function getPrismaClientInstance(clientOrOptions: Settings['client'], log: RuntimeLens['log']) {
  if (!prismaClientInstance) {
    prismaClientInstance = instantiatePrismaClient(clientOrOptions, log)
  }

  return prismaClientInstance
}

// HACK
// 1. https://prisma-company.slack.com/archives/C8AKVD5HU/p1574267904197600
// 2. https://prisma-company.slack.com/archives/CEYCG2MCN/p1574267824465700
export function getPrismaClientDir() {
  return Path.dirname(linkableResolve('.prisma/client'))
}

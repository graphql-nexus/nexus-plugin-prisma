import { PrismaClient } from '@prisma/client'
import { Options as NexusSchemaPrismaOptions } from '../schema'

export type PrismaClientOptions = {
  /**
   * Options to pass to the Prisma Client instantiated by the plugin.
   * If you want to instantiate your own Prisma Client, use `instance` instead.
   */
  options: any // todo https://prisma-company.slack.com/archives/CUXLS0Z6K/p1600349593041500
}

export type PrismaClientInstance = {
  /**
   * Instance of your own Prisma Client. You can import it from 'nexus-plugin-prisma/client'.
   * If you just want to pass some settings to the Prisma Client, use `options` instead.
   */
  instance: PrismaClient
}

export type Settings = {
  /**
   * Use this to pass some settings to the Prisma Client instantiated by the plugin or to pass your own Prisma Client
   */
  client?: PrismaClientOptions | PrismaClientInstance
  /**
   * Enable or disable migrations run by the plugin when editing your schema.prisma file
   *
   * @default true
   */
  migrations?: boolean
  /**
   * Features that require opting into. These are all disabled by default.
   */
  features?: {
    /**
     * Enable **experimental** CRUD capabilities.
     * Add a `t.crud` method in your definition block to generate CRUD resolvers in your `Query` and `Mutation` GraphQL Object Type.
     *
     * @default false
     */
    crud?: boolean
  }
  /**
   * Select the pagination strategy.
   *
   * 'prisma' strategy results in GraphQL pagination arguments mirroring those of Prisma: skip, cursor, take
   *
   * 'relay' strategy results in GraphQL pagination arguments matching those of the [GraphQL Relay specification](https://relay.dev/graphql/connections.htm): before, after, first, last.
   *
   * @default 'relay'
   */
  paginationStrategy?: NexusSchemaPrismaOptions['paginationStrategy']
}

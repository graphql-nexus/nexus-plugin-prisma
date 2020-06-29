import { PrismaClient } from '@prisma/client'
import { PrismaClientOptions as ClientOptions } from '@prisma/client/runtime/getPrismaClient'

export type PrismaClientOptions = {
  /**
   * Options to pass to the Prisma Client instantiated by the plugin.
   * If you want to instantiate your own Prisma Client, use `instance` instead.
   */
  options: ClientOptions
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
}

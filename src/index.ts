import { Plugin } from 'nexus'
import * as Builder from './builder'

// TODO this should be called NexusPrismaOptions
export type NexusPrismaParams = Builder.Options

/**
 * Create a nexus-prisma plugin to be passed into the Nexus plugins array.
 */
export const create = (options: NexusPrismaParams): Plugin => {
  return hooks => {
    hooks.onInstall(nexusBuilder => {
      return {
        types: Builder.build({ ...options, nexusBuilder }),
      }
    })
  }
}

export const nexusPrismaPlugin = create

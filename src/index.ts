import { Plugin } from 'nexus'
import * as Builder from './builder'

/**
 * Create a nexus-prisma plugin to be passed into the Nexus plugins array.
 */
export const create = (options?: Builder.Options): Plugin => {
  return {
    onInstall: nexusBuilder => {
      return {
        types: Builder.build({ ...options, nexusBuilder }),
      }
    },
  }
}

export const nexusPrismaPlugin = create

export type Options = Builder.Options

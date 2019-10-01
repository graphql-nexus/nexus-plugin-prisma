// import { Plugin } from 'nexus'
import * as Builder from './builder'

// TODO this should be called NexusPrismaOptions
export type NexusPrismaParams = Builder.Options

// export const create = (): Plugin => {
export const create = (options: Builder.Options) => {
  return {
    // TODO type these `any`s
    onBeforeBuild: (types: any) => {
      // mutate for performance
      types.push(...Builder.build({ ...options, types }))
      return types
    },
  }
}

export const nexusPrismaPlugin = create

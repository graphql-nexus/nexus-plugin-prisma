// import { Plugin } from 'nexus'
import * as Builder from './builder'

// TODO this should be called NexusPrismaOptions
export type NexusPrismaParams = Builder.Options

// export const create = (): Plugin => {
export const create = (options: Builder.Options) => {
  return {
    // TODO type these `any`s
    onBuild: function*(types: any, builder: any) {
      Builder.build({ ...options, types }).forEach(
        builder.addType.bind(builder),
      )
    },
  }
}

export const nexusPrismaPlugin = create

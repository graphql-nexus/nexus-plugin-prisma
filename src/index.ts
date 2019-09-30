// import { Plugin } from 'nexus'
import * as Builder from './builder'

export type NexusPrismaParams = Builder.Options
export const nexusPrismaPlugin = Builder.build

// export const create = (): Plugin => {
export const create = () => {
  return {
    onBuild: function*(types: any, builder: any) {
      Builder.build({ types }).forEach(builder.addType.bind(builder))
    },
  }
}

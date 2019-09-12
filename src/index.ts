import * as Builder from './builder'
import * as Typegen from './typegen'

export type NexusPrismaParams = Builder.Options
export const nexusPrismaPlugin = Builder.build
export const generateTypes = Typegen.generate

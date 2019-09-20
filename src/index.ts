// FIXME removing this global types import causes the tests to fail.
// But there should be a way for the tests to work just like the
// actual build, lib, etc. work...
import './global.d.ts'
import * as Builder from './builder'

export type NexusPrismaParams = Builder.Options
export const nexusPrismaPlugin = Builder.build

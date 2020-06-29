import * as FS from 'fs-jetpack'
import { FSJetpack } from 'fs-jetpack/types'
import { createContributor } from './compose-create'

export type FsDeps = {
  tmpDir: string
}

export type FsContribution = {
  fs: FSJetpack
}

/**
 * - Creates a temporary directory
 * - Adds `fs` to `context`, an fs-jetpack instance with its cwd set to the tmpdir
 */
export const fs = () =>
  createContributor<FsDeps, FsContribution>((ctx) => {
    return {
      fs: FS.cwd(ctx.tmpDir),
    }
  })

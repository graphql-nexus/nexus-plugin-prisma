import * as fs from 'fs-jetpack'
import * as path from 'path'
import { linkableProjectDir } from './linkable'

export function copyGlobalInterface() {
  const pwd = linkableProjectDir()
  const destDir = path.join(pwd, 'node_modules', '@types', 'nexus-plugin-prisma')

  fs.copy(path.join(pwd, 'global-type.d.ts'), path.join(destDir, 'index.d.ts'), { overwrite: true })
}

import { download } from '@prisma/fetch-engine'
import { getPlatform } from '@prisma/get-platform'
import fs from 'fs'
import Path from 'path'

type EngineType = 'query' | 'migration' | 'introspection'

export async function getEngineFileName(engineType: EngineType) {
  const platform = await getPlatform()
  const extension = platform === 'windows' ? '.exe' : ''
  const binaryName = `${engineType}-engine-${platform}${extension}`

  return binaryName
}

export async function getEnginePath(engineType: EngineType) {
  const binaryName = await getEngineFileName(engineType)

  return Path.join(Path.dirname(require.resolve('@prisma/cli/package.json')), binaryName)
}

export function getEngineVersion() {
  return require('@prisma/cli/package.json').prisma.version
}

async function main() {
  const cliEnginePath = await getEnginePath('query')
  const cliEngineDir = Path.dirname(cliEnginePath)

  // Download binary in prisma
  if (fs.existsSync(cliEngineDir)) {
    download({
      binaries: {
        'query-engine': cliEngineDir,
        'introspection-engine': cliEngineDir,
        'migration-engine': cliEngineDir,
      },
      version: getEngineVersion(),
      showProgress: true,
    })
  }
}

main()

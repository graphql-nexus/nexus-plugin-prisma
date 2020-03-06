import { download } from '@prisma/fetch-engine'
import fs from 'fs'
import Path from 'path'
import { getPlatform } from '@prisma/get-platform'

export async function getQueryEngineFileName() {
  const platform = await getPlatform()
  const extension = platform === 'windows' ? '.exe' : ''
  const binaryName = `query-engine-${platform}${extension}`

  return binaryName
}

export async function getQueryEnginePath() {
  const binaryName = await getQueryEngineFileName()

  return Path.join(
    Path.dirname(require.resolve('prisma2/package.json')),
    binaryName,
  )
}

export function getQueryEngineVersion() {
  return require('prisma2/package.json').prisma.version
}

async function main() {
  const cliEnginePath = await getQueryEnginePath()
  const cliEngineDir = Path.dirname(cliEnginePath)

  // Download binary in prisma2
  if (fs.existsSync(cliEngineDir)) {
    download({
      binaries: {
        'query-engine': cliEngineDir,
      },
      version: getQueryEngineVersion(),
      showProgress: true,
    })
  }
}

main()

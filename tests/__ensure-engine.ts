import { download } from '@prisma/fetch-engine'
import fs from 'fs'
import Path from 'path'
import { getPlatform } from '@prisma/get-platform'

export async function getQueryEnginePath() {
  const platform = await getPlatform()
  const extension = platform === 'windows' ? '.exe' : ''
  const binaryName = `query-engine-${platform}${extension}`

  return Path.join(
    Path.dirname(require.resolve('prisma2/package.json')),
    binaryName,
  )
}

export function getQueryEngineVersion() {
  return require('prisma2/package.json').prisma.version
}

async function main() {
  const enginePath = await getQueryEnginePath()

  if (fs.existsSync(enginePath)) {
    download({
      binaries: {
        'query-engine': Path.dirname(enginePath),
      },
      version: getQueryEngineVersion(),
      showProgress: true,
    })
  }
}

main()

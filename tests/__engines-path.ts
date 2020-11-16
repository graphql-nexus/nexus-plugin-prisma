import { getEnginesPath, enginesVersion } from '@prisma/engines'
import { getPlatform } from '@prisma/get-platform'
import { join } from 'path'

type EngineType = 'query' | 'migration' | 'introspection'

export async function getEngineFileName(engineType: EngineType) {
  const platform = await getPlatform()
  const extension = platform === 'windows' ? '.exe' : ''
  const binaryName = `${engineType}-engine-${platform}${extension}`

  return binaryName
}

export async function getEnginePath(engineType: EngineType) {
  const enginesPath = getEnginesPath()

  return join(enginesPath, await getEngineFileName(engineType))
}

export function getEngineVersion() {
  return enginesVersion
}

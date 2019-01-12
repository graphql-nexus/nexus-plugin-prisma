import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'
import generateCRUDSchemaString from 'prisma-generate-schema'

export function findDatamodelAndComputeSchema(): string {
  const configPath = findPrismaConfigFile()

  if (!configPath) {
    throw new Error('Could not find `prisma.yml` file')
  }

  let definition: null | any = null

  try {
    const file = fs.readFileSync(configPath, 'utf-8')
    definition = yaml.safeLoad(file)
  } catch (e) {
    throw new Error(`Yaml parsing error in ${configPath}: ${e.message}`)
  }

  if (!definition.datamodel) {
    throw new Error('Missing `datamodel` property in prisma.yml file')
  }

  const typeDefs = getTypesString(
    definition.datamodel,
    path.dirname(configPath),
  )

  return generateCRUDSchemaString(typeDefs)
}

function findPrismaConfigFile(): string | null {
  let definitionPath: string | null = path.join(process.cwd(), 'prisma.yml')

  if (fs.existsSync(definitionPath)) {
    return definitionPath
  }

  definitionPath = path.join(process.cwd(), 'prisma', 'prisma.yml')

  if (fs.existsSync(definitionPath)) {
    return definitionPath
  }

  return null
}

function getTypesString(datamodel: string | string[], definitionDir: string) {
  const typesPaths = datamodel
    ? Array.isArray(datamodel)
      ? datamodel
      : [datamodel]
    : []

  let allTypes = ''

  typesPaths.forEach(unresolvedTypesPath => {
    const typesPath = path.join(definitionDir, unresolvedTypesPath!)
    if (fs.existsSync(typesPath)) {
      const types = fs.readFileSync(typesPath, 'utf-8')
      allTypes += types + '\n'
    } else {
      throw new Error(
        `The types definition file "${typesPath}" could not be found.`,
      )
    }
  })

  return allTypes
}

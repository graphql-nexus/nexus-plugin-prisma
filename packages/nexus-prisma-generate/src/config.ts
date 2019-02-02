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

export function findRootDirectory(): string {
  const cwd = process.cwd()
  const tsConfig = findConfigFile(cwd, 'tsconfig.json')

  if (tsConfig) {
    return path.dirname(tsConfig)
  }

  const packageJson = findConfigFile(cwd, 'package.json')

  if (packageJson) {
    return path.dirname(packageJson)
  }

  return cwd
}

function findConfigFile(
  searchPath: string,
  configName = 'package.json',
): string | undefined {
  return forEachAncestorDirectory(searchPath, ancestor => {
    const fileName = path.join(ancestor, configName)
    return fs.existsSync(fileName) ? fileName : undefined
  })
}

/** Calls `callback` on `directory` and every ancestor directory it has, returning the first defined result. */
function forEachAncestorDirectory<T>(
  directory: string,
  callback: (directory: string) => T | undefined,
): T | undefined {
  while (true) {
    const result = callback(directory)
    if (result !== undefined) {
      return result
    }

    const parentPath = path.dirname(directory)
    if (parentPath === directory) {
      return undefined
    }

    directory = parentPath
  }
}

export function getImportPathRelativeToOutput(
  importPath: string,
  outputDir: string,
): string {
  let relativePath = path.relative(path.dirname(outputDir), importPath)

  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath
  }

  // remove .ts or .js file extension
  relativePath = relativePath.replace(/\.(ts|js)$/, '')

  // remove /index
  relativePath = relativePath.replace(/\/index$/, '')

  // replace \ with /
  relativePath = relativePath.replace(/\\/g, '/')

  return relativePath
}

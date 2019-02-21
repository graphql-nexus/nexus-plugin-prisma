import * as Ajv from 'ajv'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import * as path from 'path'
import { DatabaseType, DefaultParser, ISDL } from 'prisma-datamodel'
import { PrismaDefinition } from 'prisma-json-schema'
const schema = require('prisma-json-schema/dist/schema.json')

const ajv = new Ajv().addMetaSchema(
  require('ajv/lib/refs/json-schema-draft-06.json'),
)

const validate = ajv.compile(schema)

export function findDatamodelAndComputeSchema(
  configPath: string,
  config: PrismaDefinition,
): {
  datamodel: ISDL
  databaseType: DatabaseType
} {
  const typeDefs = getTypesString(config.datamodel!, path.dirname(configPath))
  const databaseType = getDatabaseType(config)
  const ParserInstance = DefaultParser.create(databaseType)

  return {
    datamodel: ParserInstance.parseFromSchemaString(typeDefs),
    databaseType,
  }
}

export function readPrismaYml() {
  const configPath = findPrismaConfigFile()

  if (!configPath) {
    throw new Error('Could not find `prisma.yml` file')
  }

  try {
    const file = fs.readFileSync(configPath, 'utf-8')
    const config = yaml.safeLoad(file) as PrismaDefinition

    const valid = validate(config)

    if (!valid) {
      let errorMessage =
        `Invalid prisma.yml file` + '\n' + ajv.errorsText(validate.errors)
      throw new Error(errorMessage)
    }

    if (!config.datamodel) {
      throw new Error('Invalid prisma.yml file: Missing `datamodel` property')
    }

    if (!config.generate) {
      throw new Error(
        'Invalid prisma.yml file: Missing `generate` property for a `prisma-client`',
      )
    }

    return { config, configPath }
  } catch (e) {
    throw new Error(`Yaml parsing error in ${configPath}: ${e.message}`)
  }
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

export function getPrismaClientDir(
  prismaClientDir: string | undefined,
  prisma: { config: PrismaDefinition; configPath: string },
  rootPath: string,
) {
  if (prismaClientDir) {
    return prismaClientDir.startsWith('/')
      ? prismaClientDir
      : path.resolve(rootPath, prismaClientDir)
  }

  const clientGenerators = prisma.config.generate!.filter(gen =>
    ['typescript-client', 'javascript-client'].includes(gen.generator),
  )

  if (clientGenerators.length === 0) {
    throw new Error(
      'No prisma-client generators were found in your prisma.yml file',
    )
  }
  if (clientGenerators.length > 1) {
    throw new Error(
      'Several prisma-client generators are defined in your prisma.yml file. If all are needed, use the `--client` option to point to the right one.',
    )
  }

  return path.relative(
    rootPath,
    path.resolve(path.dirname(prisma.configPath), clientGenerators[0].output),
  )
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

function getDatabaseType(definition: PrismaDefinition): DatabaseType {
  if (!definition.databaseType) {
    return DatabaseType.postgres
  }

  return definition.databaseType === 'document'
    ? DatabaseType.mongo
    : DatabaseType.postgres
}

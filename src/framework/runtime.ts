import chalk from 'chalk'
import { RuntimePlugin } from 'nexus/plugin'
import * as Path from 'path'
import { nexusSchemaPrisma, Options as NexusSchemaPrismaOptions } from '../schema'
import { suggestionList } from './lib/levenstein'
import { linkableProjectDir } from './lib/linkable'
import { printStack } from './lib/print-stack'
import { getPrismaClientDir, getPrismaClientInstance } from './lib/prisma-client'
import { Settings } from './settings'

interface UnknownFieldName {
  error: Error
  unknownFieldName: string
  validFieldNames: string[]
  typeName: string
}

interface UnknownFieldType {
  unknownFieldType: string
  error: Error
  typeName: string
  fieldName: string
}

interface OptionsWithHook extends NexusSchemaPrismaOptions {
  onUnknownFieldName: (params: UnknownFieldName) => void
  onUnknownFieldType: (params: UnknownFieldType) => void
}

export const plugin: RuntimePlugin<Settings> = (settings) => (project) => {
  const prismaClientInstance = getPrismaClientInstance(settings?.client, project.log)
  const prismaClientDir = getPrismaClientDir()
  const nexusPrismaTypegenOutput = Path.join(
    linkableProjectDir(),
    'node_modules',
    '@types',
    'typegen-nexus-prisma',
    'index.d.ts'
  )

  return {
    context: {
      create: (_req) => {
        return {
          db: prismaClientInstance,
        }
      },
      typeGen: {
        fields: {
          db: 'Prisma.PrismaClient',
        },
        /**
         * Prisma import is needed both here and below in typegenAutoConfig.
         * That's because @nexus/schema removes the import when no types match the source.
         * This import guarantees that the prisma client import is always there, for the context type.
         * If both the imports from the plugin and from typegenAutoConfig are present, Nexus will ignore the plugin one
         *
         * TODO: This is bad and needs a refactor.
         * Either @nexus/schema should support a `force` boolean to always have the import there
         * Or it should support dynamic contexts
         */
        imports: [
          {
            as: 'Prisma',
            from: Path.join(prismaClientDir, 'index.d.ts'),
          },
        ],
      },
    },
    schema: {
      typegenAutoConfig: {
        // https://github.com/prisma-labs/nexus-plugin-prisma/blob/master/examples/hello-world/app.ts#L14
        sources: [
          {
            source: Path.join(prismaClientDir, 'index.d.ts'),
            alias: 'Prisma',
          },
        ],
      },
      plugins: [
        nexusSchemaPrisma({
          experimentalCRUD: settings?.features?.crud ?? false,
          paginationStrategy: settings?.paginationStrategy ?? 'relay',
          inputs: {
            prismaClient: prismaClientDir,
          },
          outputs: {
            typegen: nexusPrismaTypegenOutput,
          },
          prismaClient: (ctx) => ctx.db,
          shouldGenerateArtifacts: project.shouldGenerateArtifacts,
          onUnknownFieldName: (params) => renderUnknownFieldNameError(params),
          onUnknownFieldType: (params) => renderUnknownFieldTypeError(params),
          scalars: project.scalars,
          nexusPrismaImportId: 'nexus-plugin-prisma/typegen',
        } as OptionsWithHook),
      ],
    },
  }
}

/**
 * TODO ...
 */
function renderUnknownFieldNameError(params: UnknownFieldName) {
  const { stack, fileLineNumber } = printStack({
    callsite: params.error.stack,
  })
  const suggestions = suggestionList(params.unknownFieldName, params.validFieldNames).map((s) =>
    chalk.green(s)
  )
  const suggestionMessage =
    suggestions.length === 0
      ? ''
      : chalk`{yellow Warning:} Did you mean ${suggestions.map((s) => `"${s}"`).join(', ')} ?`
  const intro = chalk`{yellow Warning:} ${params.error.message}\n{yellow Warning:} in ${fileLineNumber}\n${suggestionMessage}`

  // todo use logger once "pretty" api done
  console.log(`${intro}${stack}`)
}

/**
 * TODO ...
 */
function renderUnknownFieldTypeError(params: UnknownFieldType) {
  const { stack, fileLineNumber } = printStack({
    callsite: params.error.stack,
  })

  const intro = chalk`{yellow Warning:} ${params.error.message}\n{yellow Warning:} in ${fileLineNumber}`

  // todo use logger once "pretty" api done
  console.log(`${intro}${stack}`)
}

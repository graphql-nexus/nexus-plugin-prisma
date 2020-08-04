import * as Prisma from '@prisma/sdk'
import chalk from 'chalk'
import { WorktimeLens } from 'nexus/plugin'
import stripAnsi from 'strip-ansi'
import * as Scaffolders from './scaffolders'

/**
 * Pinned query-engine version. Calculated at build time and based on `@prisma/cli` version
 */
export const PRISMA_QUERY_ENGINE_VERSION: string = require('@prisma/cli/package.json').prisma.version

/**
 * Get the declared generator blocks in the user's PSL file.
 *
 * If Prisma SDK throws a no-models-found error then it is caught, a model is
 * scaffolded, and this function is re-run.
 */
export async function getGenerators(nexus: WorktimeLens, schemaPath: string): Promise<Prisma.Generator[]> {
  return Prisma.getGenerators({
    schemaPath,
    printDownloadProgress: false,
    version: PRISMA_QUERY_ENGINE_VERSION,
  })
    .catch(async (e: Error) => {
      if (isNoModelsDefinedError(e)) {
        await Scaffolders.exampleModelBlock(schemaPath)
        nexus.log.warn(
          `An example model has been scaffolded for you in ${chalk.bold(
            nexus.layout.projectRelative(schemaPath)
          )}`
        )
        return getGenerators(nexus, schemaPath)
      }
      return Promise.reject(e)
    })
    .then(async (generators) => {
      const hasClientGenerator = generators.find((g) => g.options?.generator.provider === 'prisma-client-js')
      if (!hasClientGenerator) {
        await Scaffolders.prismaClientGeneratorBlock(schemaPath)
        nexus.log.warn(
          `A Prisma Client generator block has been scaffolded for you in ${chalk.bold(
            nexus.layout.projectRelative(schemaPath)
          )}`
        )
        // TODO: Generate it programmatically instead for performance reason
        return getGenerators(nexus, schemaPath)
      } else {
        return generators
      }
    })
}

/**
 * Check if the thrown error is of NoModelsDefined type.
 */
function isNoModelsDefinedError(e: Error): boolean {
  return Boolean(stripAnsi(e.message).match(/.*You don't have any models defined.*/))
}

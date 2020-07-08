import { plugin } from '@nexus/schema'
import { build as buildNexusPrismaTypes, Options, InternalPublicOptions } from './builder'
import { CRUD_NOT_ENABLED } from './warnings'

/**
 * Create a nexus-plugin-prisma instance to be passed into the Nexus plugins array.
 *
 * The nexus plugin extends the Nexus DSL with `t.model` and `t.crud`. These
 * allow you to expose data from your Prisma layer and operations against that
 * data. Once this plugin is installed, you can do things such as:
 *
 * ```ts
 * objectType({
 *   name: 'User',
 *   definition(t) {
 *     t.model.id()
 *     t.model.email()
 *   }
 * })
 *
 * queryType({
 *   definition (t) {
 *      t.crud.user()
 *      t.crud.users({ filtering: true, ordering: true })
 *    }
 * })
 * ```
 *
 * You must ensure the Prisma Client JS has been generated prior as it provides a
 * data representation of the available models and CRUD operations against them.
 *
 * Like Nexus, NexusPrisma has its own Typegen. By default It will be generated
 * synchronously when Nexus runs the plugin, _if_ `process.env.NODE_ENV` is
 * `undefined` or `"development"`. Typegen can be explicitly enabled or disabled
 * via the shouldGenerateArtifacts option. This mirrors Nexus' own typegen
 * approach. This system will change once the Nexus plugin system has first
 * class support for typegen.
 */
export function nexusSchemaPrisma(options?: Options) {
  const allOptions: InternalPublicOptions = options ?? {}
  let wasCrudUsedButDisabled: null | (() => boolean) = null

  return plugin({
    name: 'nexus-plugin-prisma',
    onInstall: (nexusBuilder) => {
      const { types, wasCrudUsedButDisabled: wasCrudUsed } = buildNexusPrismaTypes({
        ...allOptions,
        nexusBuilder,
      })

      wasCrudUsedButDisabled = wasCrudUsed

      return {
        types,
      }
    },
    onBeforeBuild() {
      if (wasCrudUsedButDisabled?.() === true) {
        if (allOptions.initializedByFramework === true) {
          CRUD_NOT_ENABLED.framework()
        } else {
          CRUD_NOT_ENABLED.schema()
        }
      }
    },
  })
}

export { Options } from './builder'

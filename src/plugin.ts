import { plugin } from 'nexus'
import { build as buildNexusPrismaTypes, InternalPublicOptions, Options } from './builder'
import { colors } from './colors'

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
export function nexusPrisma(options?: Options) {
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

      types.forEach(nexusBuilder.addType)
    },
    onBeforeBuild() {
      if (wasCrudUsedButDisabled?.() === true) {
        console.log(`\
${colors.yellow('Warning')}: ${colors.green('t.crud')} ${colors.yellow(
          'is an experimental feature with many practical limitations. You must explicitly enable it before using.'
        )}
Please add ${colors.green(`experimentalCRUD: true`)} in the ${colors.green(
          'nexusSchemaPrisma()'
        )} constructor if you still wish to enable it.`)
      }
    },
  })
}

export { Options } from './builder'

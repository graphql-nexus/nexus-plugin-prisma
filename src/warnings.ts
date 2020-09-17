import { colors } from './colors'

export const CRUD_NOT_ENABLED = {
  schema: () => {
    console.log(`\
${colors.yellow('Warning')}: ${colors.green('t.crud')} ${colors.yellow(
      'is an experimental feature with many practical limitations. You must explicitly enable it before using.'
    )}
Please add ${colors.green(`experimentalCRUD: true`)} in the ${colors.green(
      'nexusSchemaPrisma()'
    )} constructor if you still wish to enable it.`)
  },
  framework: () => {
    console.log(`\
${colors.yellow('Warning')}: ${colors.green('t.crud')} ${colors.yellow(
      'is an experimental feature with many practical limitations. You must explicitly enable it before using.'
    )}
Please add ${colors.green(`features: { crud: true }`)} in the ${colors.green(
      'prisma()'
    )} constructor if you still wish to enable it.`)
  },
}

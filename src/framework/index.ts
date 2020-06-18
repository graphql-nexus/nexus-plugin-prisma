import { PluginEntrypoint } from 'nexus/plugin'
import { Settings } from './settings'

export const prisma: PluginEntrypoint<Settings> = (settings) => ({
  settings,
  packageJsonPath: require.resolve('../package.json'),
  runtime: {
    module: require.resolve('./runtime'),
    export: 'plugin',
  },
  worktime: {
    module: require.resolve('./worktime'),
    export: 'plugin',
  },
  testtime: {
    module: require.resolve('./testtime'),
    export: 'plugin',
  },
})

export default prisma

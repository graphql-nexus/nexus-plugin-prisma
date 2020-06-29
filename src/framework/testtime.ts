import { TesttimePlugin } from 'nexus/plugin'
import { getPrismaClientInstance } from './lib/prisma-client'
import { Settings } from './settings'

export const plugin: TesttimePlugin<Settings> = (settings) => (project) => {
  return {
    app: {
      db: {
        client: getPrismaClientInstance(settings?.client, project.log),
      },
    },
  }
}

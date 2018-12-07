import { PluginTypes } from './generated/plugins'

declare global {
  interface GraphQLiteralGen extends PluginTypes {}
}

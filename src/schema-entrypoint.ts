import { ensureDepIsInstalled } from './schema/utils'

ensureDepIsInstalled('@nexus/schema')
ensureDepIsInstalled('graphql')

export * from './schema'

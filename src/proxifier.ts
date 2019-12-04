import * as Nexus from 'nexus'
import { OnUnknownFieldName } from './hooks'
import { isDevMode } from './is-dev-mode'

export function proxify<T extends object>(
  publishers: T,
  typeName: string,
  stage: Nexus.core.OutputFactoryConfig<any>['stage'],
  modelOrCrud: 'model' | 'crud',
  onUnknownFieldName?: OnUnknownFieldName,
) {
  return new Proxy(publishers, {
    get(target: any, key) {
      if (target[key]) {
        return target[key]
      }

      if (stage === 'build') {
        const unknownFieldName = String(key)
        const message =
          modelOrCrud === 'model'
            ? `t.model.${unknownFieldName}() does not map to a field in your Prisma Schema.`
            : `t.crud.${unknownFieldName}() is not a valid CRUD field given your Prisma Schema.`
        if (onUnknownFieldName) {
          onUnknownFieldName({
            unknownFieldName,
            typeName,
            error: new Error(message),
            validFieldNames: Object.keys(publishers),
          })
        } else {
          if (isDevMode()) {
            console.log(`Warning: ${message}`)
          } else {
            throw new Error(message)
          }
        }
      }

      return () => {}
    },
  })
}

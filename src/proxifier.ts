import * as Nexus from 'nexus'
import { OnUnknownFieldName, registerHook } from './hooks'
import { isDevMode } from './is-dev-mode'

export function proxify<T extends object>(
  publishers: T,
  typeName: string,
  stage: Nexus.core.OutputFactoryConfig<any>['stage'],
  onUnknownFieldName?: OnUnknownFieldName,
) {
  if (!isDevMode()) {
    return publishers
  }

  return new Proxy(publishers, {
    get(target: any, key) {
      if (target[key]) {
        return target[key]
      }
      const unknownFieldName = String(key)
      const message = `Your GraphQL \`${typeName}\` object definition is attempting to expose a Prisma model field called \`${unknownFieldName}\`, but your Prisma model \`${typeName}\` has no such field`

      registerHook(
        onUnknownFieldName,
        [
          {
            unknownFieldName,
            typeName,
            error: new Error(message),
            validFieldNames: Object.keys(publishers),
          },
        ],
        message,
        stage,
      )

      return () => {}
    },
  })
}

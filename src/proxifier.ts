import * as Nexus from 'nexus'
import { OnUnknownFieldName, OnUnknownPrismaModelName, raiseErrorOrTriggerHook } from './hooks'
import { isDevMode } from './is-dev-mode'
import { Index } from './utils'

export function proxifyPublishers<T extends object>(
  publishers: T,
  typeName: string,
  stage: Nexus.core.OutputFactoryConfig<any>['stage'],
  onUnknownFieldName: OnUnknownFieldName | undefined
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

      raiseErrorOrTriggerHook(
        onUnknownFieldName,
        {
          unknownFieldName,
          typeName,
          error: new Error(message),
          validFieldNames: Object.keys(publishers),
        },
        message,
        stage
      )

      return () => {}
    },
  })
}

export function proxifyModelFunction(
  modelFunc: (modelName: string) => any,
  modelName: string,
  stage: Nexus.core.OutputFactoryConfig<any>['stage'],
  onUnknownPrismaModelName: OnUnknownPrismaModelName | undefined,
  unknownFieldsByModel: Index<string[]>
) {
  if (stage === 'build' && unknownFieldsByModel[modelName]?.length > 0) {
    const wrongFieldsFormatted = unknownFieldsByModel[modelName].map((field) => `"${field}"`).join(', ')
    const message = `\
Your GraphQL \`${modelName}\` object definition is attempting to expose some Prisma model fields named \`${wrongFieldsFormatted}\`, but there is no such Prisma model called \`${modelName}\`
If this is not intentional, make sure you don't have a typo in your GraphQL type name \`${modelName}\`
If this is intentional, pass the mapped Prisma model name as parameter like so \`t.model('<PrismaModelName>').<FieldName>()\``

    raiseErrorOrTriggerHook(
      onUnknownPrismaModelName,
      { unknownPrismaModelName: modelName, error: new Error() },
      message,
      stage
    )

    /**
     * Reset fields index to prevent from adding the hook several times
     */
    unknownFieldsByModel[modelName] = []
  }

  return new Proxy(modelFunc, {
    get(_target, key) {
      /**
       * Hack: Use the 'walk' stage to gather all wrong fields to batch the error into one console.log during the 'build' stage
       */
      if (stage === 'walk') {
        const fieldName = String(key)

        if (!unknownFieldsByModel[modelName]) {
          unknownFieldsByModel[modelName] = []
        }
        unknownFieldsByModel[modelName].push(fieldName)
      }

      return () => {}
    },
  })
}

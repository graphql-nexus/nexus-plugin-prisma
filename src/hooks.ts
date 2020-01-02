import { colors } from './colors'
import { isDevMode } from './is-dev-mode'

export type OnUnknownFieldName = (info: {
  unknownFieldName: string
  error: Error
  validFieldNames: string[]
  typeName: string
}) => void

export type OnUnknownFieldType = (info: {
  unknownFieldType: string
  error: Error
  typeName: string
  fieldName: string
}) => void

export type OnUnknownArgName = (info: {
  unknownArgNames: string[]
  error: Error
  typeName: string
  fieldName: string
}) => void

type Hooks =
  | OnUnknownFieldType
  | OnUnknownFieldName
  | OnUnknownArgName
  | undefined

export function registerHook<T extends Hooks>(
  hook: T,
  params: Parameters<Exclude<T, undefined>>,
  message: string,
  stage: 'build' | 'walk',
) {
  if (stage === 'build') {
    if (isDevMode()) {
      if (hook) {
        ;(hook as any)(...params)
      } else {
        const formattedMessage = message
          .split('\n')
          .filter(m => m.trim().length > 0)
          .map(m => `${colors.yellow('Warning:')} ${m}`)
          .join('\n')
        console.log(formattedMessage + '\n')
      }
    } else {
      throw new Error(message)
    }
  }
}

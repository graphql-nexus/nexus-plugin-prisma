import { DeepPartial } from 'nexus/dist/lib/utils'

/**
 * Small utils to deal with options that have default values.
 * To get the best out of typings, do not explicitely type the `inputDefaults` to let type inference do its magic
 *
 * @example
 *
 * type Settings = {
 *   foo?: string
 *   bar?: string
 * }
 *
 * const defaultSettings = {
 *   foo: 'abc'
 * }
 *
 * function processSettings(inputSettings: Settings) {
 *   const settings = withDefaults(inputSettings, defaultSettings)
 *
 *   settings.foo // <== typed as non-optional field
 *   settings.bar // <== typed as optional field
 * }
 */
export function withDefaults<T extends Record<string, any>, U extends DeepPartial<T>>(
  inputOptions: T | undefined,
  inputDefaults: U
): U & T {
  if (!isObject(inputDefaults)) {
    throw new Error('defaults must be an object')
  }

  const result = Object.assign({}, inputDefaults) as Record<string, any>
  const options = inputOptions ?? ({} as T)

  if (!isObject(options)) {
    throw new Error('options must be an object')
  }

  const optionKeys = Object.keys(options)

  for (const key of optionKeys) {
    if (!inputDefaults[key]) {
      continue
    }

    // Do not merge options to the defaults if it's undefined
    if (options[key] === undefined) {
      continue
    }

    if (isObject(options[key])) {
      result[key] = withDefaults(options[key], inputDefaults[key])
    } else {
      result[key] = options[key]
    }
  }

  return result as U & T
}

function isObject(obj: any): boolean {
  return obj && typeof obj === 'object'
}

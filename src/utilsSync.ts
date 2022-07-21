import { execSync } from 'child_process'
import { randomUUID } from 'crypto'
import { unlinkSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import escapeStringRegex from 'escape-string-regexp'

/**
 * Run a given JS async code synchronously.
 */
export function runSync(params: {
  code: string
  tagOpenWrappers?: [string, string]
  tagCloseWrappers?: [string, string]
  tmpFilePath?: string
  cwd?: string
  nodeExecutable?: string
  maxBufferSize?: number
}) {
  // inspired by https://github.com/tannerntannern/node-force-sync/blob/master/src/index.ts
  const { code, cwd, tagOpenWrappers, tagCloseWrappers, tmpFilePath, nodeExecutable, maxBufferSize } = {
    tagOpenWrappers: ['!!!', '!!!'] as [string, string],
    tagCloseWrappers: ['!!!/', '!!!'] as [string, string],
    tmpFilePath: process.cwd(),
    nodeExecutable: 'node',
    maxBufferSize: 1024 * 1024,
    cwd: process.cwd(),
    ...params,
  }

  if (!code?.trim()) {
    throw new Error('invalid code')
  }

  const makeTag = (middle: string, [beginning, ending]: [string, string]) => beginning + middle + ending

  const extractOutput = (rawOutput: string, openTag: string, closeTag: string) =>
    new RegExp(`${escapeStringRegex(openTag)}([\\s\\S]*)${escapeStringRegex(closeTag)}`).exec(
      rawOutput
    )?.[1] ?? null

  const outputOpener = makeTag('OUTPUT', tagOpenWrappers)
  const outputCloser = makeTag('OUTPUT', tagCloseWrappers)
  const errorOpener = makeTag('ERROR', tagOpenWrappers)
  const errorCloser = makeTag('ERROR', tagCloseWrappers)

  return (...args: any[]) => {
    const argsString = args.map((arg) => JSON.stringify(arg)).join(', ')
    const codeString = `(${code})(${argsString})
    .then(function(output) {
      console.log('${outputOpener}' + JSON.stringify(output) + '${outputCloser}');
    })
    .catch(function(error) {
      var message = (error instanceof Error) ? error.message : error;
      console.log('${errorOpener}' + JSON.stringify(message) + '${errorCloser}');
    });`

    const tmpFile = resolve(tmpFilePath, `tmp${Date.now()}_${randomUUID()}.js`)

    writeFileSync(tmpFile, codeString, 'utf8')
    let rawOutput = '';

    try {
      rawOutput = execSync(`${nodeExecutable} ${tmpFile}`, { maxBuffer: maxBufferSize, cwd }).toString()
    } finally {
      unlinkSync(tmpFile)
    }

    const output = extractOutput(rawOutput, outputOpener, outputCloser)
    let error: string | null = null
    if (output === null) error = extractOutput(rawOutput, errorOpener, errorCloser)

    const isError = error !== null || (output === null && error === null)
    if (isError) throw new Error('' + error)

    if (output === 'undefined') return

    return JSON.parse(output as string) as any
  }
}

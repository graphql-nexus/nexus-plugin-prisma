import chalk from 'chalk'
import { stripIndents } from 'common-tags'
import * as stackTraceParser from 'stacktrace-parser'
import { highlightTS } from './highlight-ts'

function renderN(n: number, max: number): string {
  const wantedLetters = String(max).length
  const hasLetters = String(n).length
  if (hasLetters >= wantedLetters) {
    return String(n)
  }

  return String(' '.repeat(wantedLetters - hasLetters) + n)
}

export interface ErrorArgs {
  callsite: string | undefined
}

export interface PrintStackResult {
  stack: string
  indent: number
  lastErrorHeight: number
  afterLines: string
  fileLineNumber: string
}

export const printStack = ({ callsite }: ErrorArgs): PrintStackResult => {
  const lastErrorHeight = 20
  let fileLineNumber = ':'
  let prevLines = '\n'
  let afterLines = ''
  let indentValue = 0

  // @ts-ignore
  if (callsite && typeof window === 'undefined') {
    const stack = stackTraceParser.parse(callsite)
    // TODO: more resilient logic to find the right trace
    // TODO: should not have hard-coded knowledge of prisma here
    const trace = stack.find((t) => t.file && !t.file.includes('nexus-plugin-prisma/src/'))
    if (process.env.NODE_ENV !== 'production' && trace && trace.file && trace.lineNumber && trace.column) {
      const fileName = trace.file
      const lineNumber = trace.lineNumber
      fileLineNumber = callsite
        ? `${chalk.underline(`${trace.file}:${trace.lineNumber}:${trace.column}`)}`
        : ''
      const start = Math.max(0, lineNumber - 5)
      const fs = require('fs')
      if (fs.existsSync(fileName)) {
        const file = fs.readFileSync(fileName, 'utf-8')
        const slicedFile = file.split('\n').slice(start, lineNumber).join('\n')
        const lines = stripIndents(slicedFile).split('\n')

        const theLine = lines[lines.length - 1]
        //const slicePoint = theLine.indexOf('{')
        const highlightedLines = highlightTS(lines.join('\n')).split('\n')
        prevLines =
          '\n' +
          highlightedLines
            .map(
              (l, i) => chalk.grey(renderN(i + start + 1, lineNumber + start + 1) + ' ') + chalk.reset() + l
            )
            .map((l, i, arr) => (i === arr.length - 1 ? `${chalk.red.bold('→')} ${l}` : chalk.dim('  ' + l)))
            .join('\n')
        afterLines = ')'
        indentValue = String(lineNumber + start + 1).length + getIndent(theLine) + 1
      }
    }
  }

  function getIndent(line: string) {
    let spaceCount = 0
    for (let i = 0; i < line.length; i++) {
      if (line.charAt(i) !== ' ') {
        return spaceCount
      }
      spaceCount++
    }

    return spaceCount
  }

  const stackStr = `\n${prevLines}${chalk.reset()}\n`
  return {
    indent: indentValue,
    stack: stackStr,
    afterLines,
    lastErrorHeight,
    fileLineNumber,
  }
}

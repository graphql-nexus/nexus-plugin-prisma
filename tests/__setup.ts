import ts from 'typescript'
;(global as any).TS_FORMAT_PROJECT_ROOT = 'src/'
import * as tsm from 'ts-morph'
import * as path from 'path'

jest.setTimeout(20000)

const formatTSDiagonsticsForJest = (
  diagnostics: readonly tsm.Diagnostic[],
): string => {
  const tsDiagnostics = diagnostics.map(d => d.compilerObject)
  const formatHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  }

  const tsReport = ts.formatDiagnosticsWithColorAndContext(
    tsDiagnostics as any,
    formatHost,
  )

  const sourcePath =
    process.cwd() +
    '/' +
    (((global as any).TS_FORMAT_PROJECT_ROOT as string) || '')

  const summaryReport = `${
    tsDiagnostics.length
  } Type Error(s):\n\n${tsDiagnostics
    .map(d =>
      d.file ? d.file.fileName.replace(sourcePath, '') : '<unknown file>',
    )
    .join('\n')}`

  const jestReport = `${summaryReport}\n\n${tsReport}`

  return jestReport
}

expect.extend({
  toTypeCheck(projectRootPath: string) {
    const project = new tsm.Project({
      tsConfigFilePath: path.join(projectRootPath, 'tsconfig.json'),
    })
    if (project.getSourceFiles().length === 0) {
      throw new Error(
        'Cannot expect type check assertion to work because no source files matched.',
      )
    }
    const diagnostics = project.getPreEmitDiagnostics()
    const pass = diagnostics.length === 0
    return {
      message: () =>
        pass
          ? 'expected program to not typecheck'
          : formatTSDiagonsticsForJest(diagnostics),
      pass,
    }
  },
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toTypeCheck(): R
    }
  }
}

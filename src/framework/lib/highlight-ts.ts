import * as Prism from 'prismjs'
import { identity, Theme, theme } from './theme'

Prism.languages.typescript = Prism.languages.extend('javascript', {
  // From JavaScript Prism keyword list and TypeScript language spec: https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md#221-reserved-words
  keyword: /\b(?:abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|namespace|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/,
  builtin: /\b(?:string|Function|any|number|boolean|Array|symbol|console|Promise|unknown|never)\b/,
})

export function highlightTS(str: string) {
  return highlightForTerminal(str, Prism.languages.typescript)
}

function stringifyToken(t: string | Prism.Token, language?: any): any {
  if (typeof t == 'string') {
    return t
  }

  if (Array.isArray(t)) {
    return t
      .map(function (element) {
        return stringifyToken(element, language)
      })
      .join('')
  }

  return getColorForSyntaxKind(t.type as any)(t.content.toString())
}

function getColorForSyntaxKind(syntaxKind: keyof Theme) {
  return theme[syntaxKind] || identity
}

function highlightForTerminal(str: string, grammar: Prism.Grammar) {
  const tokens = Prism.tokenize(str, grammar)
  return tokens.map((t) => stringifyToken(t)).join('')
}

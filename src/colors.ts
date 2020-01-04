const ansiColors = {
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  reset: '\u001b[39m',
}

function logColor(str: string, color: keyof typeof ansiColors) {
  return `${ansiColors[color]}${str}${ansiColors.reset}`
}

export const colors = {
  yellow: (str: string) => logColor(str, 'yellow'),
  red: (str: string) => logColor(str, 'red'),
  green: (str: string) => logColor(str, 'green'),
  blue: (str: string) => logColor(str, 'blue'),
  magenta: (str: string) => logColor(str, 'magenta'),
  cyan: (str: string) => logColor(str, 'cyan'),
}

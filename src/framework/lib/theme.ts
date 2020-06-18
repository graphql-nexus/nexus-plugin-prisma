const chalk = require('chalk')

export interface Theme {
  comment: (str: string) => string
  variable?: (str: string) => string
  string?: (str: string) => string
  function?: (str: string) => string
  keyword?: (str: string) => string
  boolean?: (str: string) => string
  number?: (str: string) => string
  operator?: (str: string) => string
  punctuation?: (str: string) => string
  directive?: (str: string) => string
  entity?: (str: string) => string
  value?: (str: string) => string
}

export const orange = chalk.rgb(246, 145, 95)
export const darkBrightBlue = chalk.rgb(107, 139, 140)
export const blue = chalk.cyan
export const brightBlue = chalk.rgb(127, 155, 155)
export const identity = (str: any) => str

export const theme: Theme = {
  keyword: blue,
  entity: blue,
  value: brightBlue,
  punctuation: darkBrightBlue,
  directive: blue,
  function: blue,
  variable: brightBlue,
  string: chalk.greenBright,
  boolean: orange,
  number: chalk.cyan,
  comment: chalk.grey,
}

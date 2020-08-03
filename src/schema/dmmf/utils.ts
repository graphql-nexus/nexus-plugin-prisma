import { DMMF } from '@prisma/client/runtime'

export const getPrismaClientDmmf = (packagePath: string): DMMF.Document => {
  let dmmf: undefined | DMMF.Document = undefined

  try {
    dmmf = require(packagePath).dmmf
  } catch (error) {
    throw new Error(
      `Failed to import prisma client package at ${packagePath}. The following error occured while trying:
        ${error.stack}`
    )
  }

  if (!dmmf) {
    throw new Error(`\
You most likely forgot to initialize the Prisma Client. Please run \`prisma generate\` and try to run it again.
If that does not solve your problem, please open an issue.`)
  }

  return dmmf
}

/**
 * Helpers for working with the Prisma DMMF data type
 */
import { DMMF } from '@prisma/client/runtime/library'

export function getTypeName(type: DMMF.ArgType | DMMF.InputType | DMMF.OutputType): string {
  if (typeof type === 'string') {
    return type
  }

  return type.name
}

// cSpell:word DMMF
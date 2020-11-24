/**
 * Helpers for working with the Prisma DMMF data type
 */
import { DMMF } from '@prisma/client/runtime'

export function isInputObject(x: any): x is DMMF.InputType {
  return typeof x.name === 'string' && Array.isArray(x.fields) && typeof x.constraints === 'object'
}

export function isEnumValue(x: any): x is DMMF.EnumValue {
  return typeof x.name === 'string' && Array.isArray(x.values)
}

export function isOutputType(x: any): x is DMMF.OutputType {
  return typeof x.name === 'string' && Array.isArray(x.fields) && x.constraints === undefined
}

export function getTypeName(type: DMMF.ArgType | DMMF.InputType | DMMF.OutputType): string {
  if (typeof type === 'string') {
    return type
  }

  return type.name
}

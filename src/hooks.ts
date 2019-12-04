export type OnUnknownFieldName = (info: {
  unknownFieldName: string
  error: Error
  validFieldNames: string[]
  typeName: string
}) => void

export type OnUnknownFieldType = (info: {
  unknownFieldType: string
  error: Error
  typeName: string
  fieldName: string
}) => void

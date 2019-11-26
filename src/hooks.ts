export type OnUnknownFieldName = (info: {
  unknownFieldName: string
  error: Error
  validFieldNames: string[]
  typeName: string
}) => void

export type OnUnknownOutputType = (info: {
  unknownOutputType: string
  error: Error
  typeName: string
  fieldName: string,
}) => void

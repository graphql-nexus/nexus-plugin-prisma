import { isEmpty, fromEntries } from '@re-do/utils'
import {
  MutationResolverParams,
  InputsConfig,
  relationKeys,
  RelateByValue,
  isRelationKey,
} from './utils'
import { DmmfTypes } from './dmmf/DmmfTypes'
import { Publisher } from './publisher'

type TransformArgsParams = {
  inputType: DmmfTypes.InputType
  params: MutationResolverParams
  publisher: Publisher
  inputs: InputsConfig
  relateBy: RelateByValue
}

const computeInputs = (
  inputType: DmmfTypes.InputType,
  params: MutationResolverParams,
) =>
  inputType.computedFields
    ? fromEntries(
        Object.entries(
          inputType.computedFields,
        ).map(([fieldName, computeFrom]) => [fieldName, computeFrom!(params)]),
      )
    : {}

function deepTransformArgData(params: TransformArgsParams, data: unknown): any {
  const { inputType, publisher } = params
  let transformedData = data as Record<string, any> | any[]
  // Recurse to handle nested inputTypes
  transformedData = fromEntries(
    Object.entries(transformedData).map(([fieldName, fieldData]) => {
      if (!fieldData || typeof fieldData !== 'object') {
        return [fieldName, fieldData]
      }
      const field = inputType.fields.find(_ => _.name === fieldName)
      if (!field) {
        throw new Error(
          `Couldn't find field '${fieldName}' on input type '${
            inputType.name
          }' which was expected based on your data (${JSON.stringify(
            data,
            null,
            4,
          )}). Found fields ${inputType.fields.map(_ => _.name)}`,
        )
      }
      const fieldInputType = publisher.getInputType(field.inputType.type)
      const fieldParams = {
        ...params,
        inputType: fieldInputType,
      }
      let deepTransformedFieldValue = fieldData
      if (Array.isArray(fieldData)) {
        deepTransformedFieldValue = fieldData.map(value =>
          deepTransformArgData(fieldParams, value),
        )
      } else if (field.inputType.kind === 'object') {
        deepTransformedFieldValue = deepTransformArgData(fieldParams, fieldData)
      }
      if (isRelationKey(fieldInputType.relatedBy)) {
        // Inject relation key into data if one was omitted based on the field type
        deepTransformedFieldValue = {
          [fieldInputType.relatedBy!]: deepTransformedFieldValue,
        }
      }
      return [fieldName, deepTransformedFieldValue]
    }),
  )
  const computedInputs = computeInputs(inputType, params.params)
  transformedData = {
    ...transformedData,
    ...computedInputs,
  }
  return transformedData
}

export const isTransformRequired = (
  inputs: InputsConfig | undefined,
  relateBy: RelateByValue | undefined,
) =>
  !!(
    (relateBy && isRelationKey(relateBy)) ||
    (inputs &&
      Object.values(inputs).find(
        inputConfig =>
          inputConfig &&
          (isRelationKey(inputConfig.relateBy) || inputConfig.computeFrom),
      ))
  )

export const transformArgs = ({
  inputType,
  params,
  publisher,
  inputs,
  relateBy,
}: TransformArgsParams) =>
  isTransformRequired(inputs, relateBy)
    ? {
        ...params.args,
        data: deepTransformArgData(
          {
            inputType,
            publisher,
            params,
            inputs,
            relateBy,
          },
          params.args.data,
        ),
      }
    : params.args

export const isRelationType = (inputType: DmmfTypes.InputType) =>
  inputType.fields.length === 2 &&
  inputType.fields.every(
    field => field.name === 'create' || field.name === 'connect',
  )

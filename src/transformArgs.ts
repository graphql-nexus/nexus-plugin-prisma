import { fromEntries } from '@re-do/utils'
import { MutationResolverParams, InputsConfig, CollapseToValue } from './utils'
import { DmmfTypes } from './dmmf/DmmfTypes'
import { Publisher } from './publisher'

type TransformArgsParams = {
  inputType: DmmfTypes.InputType
  params: MutationResolverParams
  publisher: Publisher
  inputs: InputsConfig
  collapseTo: CollapseToValue
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
      if (fieldInputType.collapsedTo) {
        // Inject relation key into data if one was omitted based on the field type
        deepTransformedFieldValue = {
          [fieldInputType.collapsedTo]: deepTransformedFieldValue,
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
  collapseTo: CollapseToValue,
) =>
  !!(
    collapseTo ||
    (inputs &&
      Object.values(inputs).find(
        inputConfig => inputConfig?.collapseTo || inputConfig?.computeFrom,
      ))
  )

export const transformArgs = ({
  inputType,
  params,
  publisher,
  inputs,
  collapseTo,
}: TransformArgsParams) =>
  isTransformRequired(inputs, collapseTo)
    ? {
        ...params.args,
        data: deepTransformArgData(
          {
            inputType,
            publisher,
            params,
            inputs,
            collapseTo,
          },
          params.args.data,
        ),
      }
    : params.args

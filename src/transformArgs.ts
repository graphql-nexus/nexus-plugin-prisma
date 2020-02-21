import { isEmpty, fromEntries } from '@re-do/utils'
import {
  MutationResolverParams,
  InputsConfig,
  relationKeys,
  RelateByValue,
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
  inputType.fields
    .filter(field => 'computeFrom' in field)
    .map(field => (field as DmmfTypes.ComputedSchemaArg).computeFrom(params))

function deepTransformArgData(params: TransformArgsParams, data: unknown): any {
  const { inputType, publisher } = params
  if (!data || typeof data !== 'object') {
    return data
  }
  let transformedData = data as Record<string, any>
  // Recurse to handle nested inputTypes
  transformedData = fromEntries(
    Object.entries(transformedData).map(([fieldName, fieldData]) => {
      if (Array.isArray(fieldData)) {
        return [
          fieldName,
          fieldData.map(value => deepTransformArgData(params, value)),
        ]
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
      let deepTransformedFieldValue =
        field.inputType.kind === 'object'
          ? deepTransformArgData(
              {
                ...params,
                inputType: publisher.getInputType(field.inputType.type),
              },
              fieldData,
            )
          : fieldData
      const relateBy = field.relateBy ?? params.relateBy
      if (relationKeys.includes(relateBy)) {
        // Inject relation key into data if one was omitted based on the field type
        deepTransformedFieldValue = {
          [relateBy]: deepTransformedFieldValue,
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
  inputs: InputsConfig,
  relateBy: RelateByValue,
) =>
  relationKeys.includes(relateBy) ||
  Object.values(inputs).find(
    inputConfig =>
      inputConfig && !isEmpty(inputConfig) && inputConfig.relateBy !== 'any',
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

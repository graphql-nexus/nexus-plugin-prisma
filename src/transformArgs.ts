import { transform, isEmpty } from '@re-do/utils'
import {
  MutationResolverParams,
  InputsConfig,
  CollapseToValue,
  ComputeInput,
  PrismaInputFieldName,
  ComputedFields,
} from './utils'
import { DmmfTypes } from './dmmf/DmmfTypes'
import { Publisher } from './publisher'

type ShallowTransformDataParams = {
  computedFields: ComputedFields
  collapsedTo: CollapseToValue
  resolverParams: MutationResolverParams
  data: unknown
}

const shallowTransformData = ({
  computedFields,
  collapsedTo,
  resolverParams,
  data,
}: ShallowTransformDataParams) => {
  let shallowTransformedData = data
  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    computedFields &&
    !isEmpty(computedFields)
  ) {
    shallowTransformedData = {
      ...(shallowTransformedData as Record<string, any>),
      ...transform(
        computedFields as Record<PrismaInputFieldName, ComputeInput>,
        ([fieldName, computeFrom]) => [fieldName, computeFrom(resolverParams)],
      ),
    }
  }
  if (collapsedTo) {
    // Inject relation key into data if one was omitted based on the field type
    shallowTransformedData = {
      [collapsedTo]: shallowTransformedData,
    }
  }
  return shallowTransformedData
}

type DeepTransformDataParams = Omit<
  TransformArgsParams,
  'argTypes' | 'collapseTo'
> & {
  arg: DmmfTypes.SchemaArg
}

const deepTransformData = (
  params: DeepTransformDataParams,
  data: unknown,
): any => {
  const { arg, publisher } = params
  let deepTransformedData = data
  if (Array.isArray(data)) {
    deepTransformedData = data.map(value =>
      deepTransformData(
        { ...params, arg: { ...arg, collapsedTo: null } },
        value,
      ),
    )
  } else if (
    data &&
    typeof data === 'object' &&
    publisher.isPublished(arg.inputType.type)
  ) {
    const inputType = publisher.getInputType(arg.inputType.type)
    deepTransformedData = transform(
      data as Record<string, any>,
      ([fieldName, fieldValue]) => [
        fieldName,
        deepTransformData(
          { ...params, arg: getFieldArg(inputType.fields, fieldName) },
          fieldValue,
        ),
      ],
    )
  }
  return shallowTransformData({
    data: deepTransformedData,
    resolverParams: params.params,
    computedFields: arg.computedFields,
    collapsedTo: arg.collapsedTo,
  })
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

type TransformArgsParams = {
  argTypes: DmmfTypes.SchemaArg[]
  params: MutationResolverParams
  publisher: Publisher
  inputs: InputsConfig
  collapseTo: CollapseToValue
}

export const transformArgs = ({
  argTypes,
  params,
  publisher,
  inputs,
  collapseTo,
}: TransformArgsParams) =>
  params.args && isTransformRequired(inputs, collapseTo)
    ? transform(params.args, ([argName, argValue]) => {
        return [
          argName,
          deepTransformData(
            {
              arg: getFieldArg(argTypes, argName),
              publisher,
              params,
              inputs,
            },
            argValue,
          ),
        ]
      })
    : params.args

function getFieldArg(args: DmmfTypes.SchemaArg[], name: string) {
  const fieldArg = args.find(arg => arg.name === name)
  if (!fieldArg) {
    throw new Error(
      `Couldn't find field '${name}' among args ${args.map(arg => arg.name)}`,
    )
  }
  return fieldArg
}

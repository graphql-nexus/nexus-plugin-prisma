import { fromEntries } from '@re-do/utils'
import { MutationResolverParams, InputsConfig, CollapseToValue } from './utils'
import { DmmfTypes } from './dmmf/DmmfTypes'
import { Publisher } from './publisher'
import { core } from 'nexus'
import { transform } from '@re-do/utils'

type DeepTransformArgDataParams = Omit<
  TransformArgsParams,
  'paramInputs' | 'collapseTo'
> & {
  arg: DmmfTypes.SchemaArg
}

function deepTransformArgData(
  params: DeepTransformArgDataParams,
  data: unknown,
): any {
  const { arg, publisher } = params
  let deepTransformedData = data
  if (Array.isArray(data)) {
    deepTransformedData = data.map(value => deepTransformArgData(params, value))
  }
  if (
    data &&
    typeof data === 'object' &&
    publisher.isPublished(arg.inputType.type)
  ) {
    const inputType = publisher.getInputType(arg.inputType.type)
    deepTransformedData = fromEntries(
      Object.entries(data as Record<string, any>).map(([name, value]) => {
        const fieldArg = inputType.fields.find(_ => _.name === name)
        if (!fieldArg) {
          throw new Error(
            `Couldn't find field '${name}' on input type '${
              arg.name
            }' which was expected based on your data (${JSON.stringify(
              data,
              null,
              4,
            )}). Found fields ${inputType.fields.map(_ => _.name)}`,
          )
        }
        return [name, deepTransformArgData({ ...params, arg: fieldArg }, value)]
      }),
    )
    deepTransformedData = {
      ...(deepTransformedData as Record<string, any>),
      ...fromEntries(
        Object.entries(arg.computedFields).map(([fieldName, computeFrom]) => [
          fieldName,
          computeFrom!(params.params),
        ]),
      ),
    }
  }
  if (arg.collapsedTo) {
    // Inject relation key into data if one was omitted based on the field type
    deepTransformedData = {
      [arg.collapsedTo]: deepTransformedData,
    }
  }
  return deepTransformedData
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
  paramInputs: Record<string, core.NexusArgDef<any>>
  params: MutationResolverParams
  publisher: Publisher
  inputs: InputsConfig
  collapseTo: CollapseToValue
}

export const transformArgs = ({
  paramInputs,
  params,
  publisher,
  inputs,
  collapseTo,
}: TransformArgsParams) =>
  isTransformRequired(inputs, collapseTo)
    ? transform(params.args, ([paramName, paramValue]) => {
        const paramType = publisher.getInputType(paramInputs[paramName].name)
        fromEntries(
          paramType.fields.map(arg => [
            arg.name,
            deepTransformArgData(
              {
                arg,
                publisher,
                params,
                inputs,
              },
              paramValue[arg.name],
            ),
          ]),
        )
      })
    : params.args

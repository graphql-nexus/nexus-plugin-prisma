import { DMMF } from '@prisma/client/runtime'
import {
  GlobalComputedInputs,
  GlobalMutationResolverParams,
  LocalComputedInputs,
  isEmptyObject,
  RelatedFields,
} from '../utils'
import { getPhotonDmmf } from './utils'
import { DmmfDocument } from './DmmfDocument'
import { DmmfTypes } from './DmmfTypes'
import { Publisher } from '../publisher'

export type TransformOptions = {
  globallyComputedInputs?: GlobalComputedInputs
}

export const getTransformedDmmf = (
  photonClientPackagePath: string,
  options?: TransformOptions,
): DmmfDocument =>
  new DmmfDocument(transform(getPhotonDmmf(photonClientPackagePath), options))

const addDefaultOptions = (
  givenOptions?: TransformOptions,
): Required<TransformOptions> => ({
  globallyComputedInputs: {},
  ...givenOptions,
})

export function transform(
  document: DMMF.Document,
  options?: TransformOptions,
): DmmfTypes.Document {
  return {
    datamodel: transformDatamodel(document.datamodel),
    mappings: document.mappings as DmmfTypes.Mapping[],
    schema: transformSchema(document.schema, addDefaultOptions(options)),
  }
}

function transformDatamodel(datamodel: DMMF.Datamodel): DmmfTypes.Datamodel {
  return {
    enums: datamodel.enums,
    models: datamodel.models.map(model => ({
      ...model,
      fields: model.fields.map(field => ({
        ...field,
        kind: field.kind === 'object' ? 'relation' : field.kind,
      })),
    })),
  }
}

function transformSchema(
  schema: DMMF.Schema,
  { globallyComputedInputs }: Required<TransformOptions>,
): DmmfTypes.Schema {
  return {
    enums: schema.enums,
    inputTypes: schema.inputTypes.map(_ =>
      transformInputType(_, globallyComputedInputs),
    ),
    outputTypes: schema.outputTypes.map(o => ({
      ...o,
      fields: o.fields.map(f => ({
        ...f,
        args: f.args.map(transformArg),
        outputType: {
          ...f.outputType,
          type: getReturnTypeName(f.outputType.type),
        },
      })),
    })),
  }
}

/**
 * Conversion from a Photon arg type to a GraphQL arg type using
 * heuristics. A conversion is needed becuase GraphQL does not
 * support union types on args, but Photon does.
 */
function transformArg(arg: DMMF.SchemaArg): DmmfTypes.SchemaArg {
  // FIXME: *Enum*Filter are currently empty
  let inputType = arg.inputType.some(a => a.kind === 'enum')
    ? arg.inputType[0]
    : arg.inputType.find(a => a.kind === 'object')!

  if (!inputType) {
    inputType = arg.inputType[0]
  }

  return {
    name: arg.name,
    inputType: {
      ...inputType,
      type: getReturnTypeName(inputType.type),
    },
    // FIXME Why?
    isRelationFilter: undefined,
  }
}

type BaseTransformArgsParams = {
  inputType: DmmfTypes.InputType
  params: GlobalMutationResolverParams
  publisher: Publisher
}

type TransformArgsParams = BaseTransformArgsParams & {
  locallyComputedInputs: LocalComputedInputs<any>
  globallyComputedInputs: GlobalComputedInputs
} & {
  computedInputs: LocalComputedInputs<any>
  created: RelatedFields
  connected: RelatedFields
}

type DeepTransformArgsParams = BaseTransformArgsParams & { data: any }

function shallowComputeInputs(
  inputType: DmmfTypes.InputType,
  params: GlobalMutationResolverParams,
) {
  return Object.keys(inputType.computedInputs).reduce(
    (values, key) => ({
      ...values,
      [key]: inputType.computedInputs[key](params),
    }),
    {} as Record<string, any>,
  )
}

function shallowReplaceUpfilteredKeys(
  inputType: DmmfTypes.InputType,
  data: any,
) {
  return inputType.upfilteredKey ? { [inputType.upfilteredKey]: data } : data
}

/**
 * Recursively transforms args by:
 *   - Finding and populating values for inputs from globallyComputedInputs
 *   - Replacing upfiltered keys that were removed from corresponding types
 */
function deepTransformArgs({
  inputType,
  params,
  publisher,
  data,
}: DeepTransformArgsParams): Record<string, any> {
  const deeplyTransformedArgData = Array.isArray(data)
    ? data.map(value =>
        deepTransformArgs({
          // If the type has an upfilteredKey, we're adding it after recursing and don't want to duplicate
          inputType: { ...inputType, upfilteredKey: null },
          publisher,
          params,
          data: value,
        }),
      )
    : // If data is an object, shallow combine computedInput values with recursively transformed values provided by the user
      Object.keys(data).reduce((transformedArgs, fieldName) => {
        const field = inputType.fields.find(_ => _.name === fieldName)
        if (!field) {
          throw new Error(
            `Couldn't find field ${fieldName} on input type ${
              inputType.name
            } which was expected based on your data (${data}). Found fields ${inputType.fields.map(
              _ => _.name,
            )}`,
          )
        }
        const fieldValue =
          field.inputType.kind === 'object'
            ? deepTransformArgs({
                inputType: publisher.getInputType(field.inputType.type),
                publisher,
                params,
                data: data[fieldName],
              })
            : data[fieldName]
        return {
          ...transformedArgs,
          [fieldName]: fieldValue,
        }
      }, shallowComputeInputs(inputType, params))
  // Replace upfilterKey if there was one removed from the type
  return shallowReplaceUpfilteredKeys(inputType, deeplyTransformedArgData)
}

function addLocallyComputedInputs(
  params: GlobalMutationResolverParams,
  computedInputs: LocalComputedInputs<any>,
) {
  return {
    ...params.args,
    data: {
      ...(params.args.data as object),
      ...Object.entries(computedInputs).reduce(
        (args, [fieldName, computeValue]) => ({
          ...args,
          [fieldName]: computeValue(params),
        }),
        {} as Record<string, any>,
      ),
    },
  }
}

export function transformArgs({
  inputType,
  params,
  publisher,
  locallyComputedInputs,
  globallyComputedInputs,
}: TransformArgsParams) {
  let transformedParams = params
  if (locallyComputedInputs) {
    transformedParams.args = addLocallyComputedInputs(
      transformedParams,
      locallyComputedInputs,
    )
  }
  if (!isEmptyObject(globallyComputedInputs) || 'upfilteredKey' in inputType) {
    transformedParams.args.data = deepTransformArgs({
      inputType,
      publisher,
      params: transformedParams,
      data: transformedParams.args.data,
    })
  }
  return transformedParams.args
}

const isRelationType = (inputType: DMMF.InputType) =>
  inputType.fields.length === 2 &&
  inputType.fields.every(
    field => field.name === 'create' || field.name === 'connect',
  )

function transformInputType(
  inputType: DMMF.InputType,
  globallyComputedInputs: GlobalComputedInputs,
): DmmfTypes.InputType {
  const fieldNames = inputType.fields.map(field => field.name)
  /**
   * Only global computed inputs are removed during schema transform.
   * Resolver level computed inputs are filtered as part of the
   * projecting process. They are then passed to addComputedInputs
   * at runtime so their values can be inferred alongside the
   * global values.
   */
  const globallyComputedInputsInType = Object.keys(
    globallyComputedInputs,
  ).reduce(
    (args, key) =>
      fieldNames.includes(key)
        ? Object.assign(args, { [key]: globallyComputedInputs[key] })
        : args,
    {} as GlobalComputedInputs,
  )
  return {
    ...inputType,
    fields: inputType.fields
      .filter(field => !(field.name in globallyComputedInputs))
      .map(transformArg),
    computedInputs: globallyComputedInputsInType,
    relation: isRelationType(inputType),
  }
}

/**
 * Make the "return type" property type always be a string. In Photon
 * it is allowed to be a nested structured object but we want only the
 * reference-by-name form.
 *
 */
//
// TODO _why_ is the dmmf like this?
//
// FIXME `any` type becuase this is used by both outputType and inputType
// and there is currently no generic capturing both ideas.
//
function getReturnTypeName(type: any) {
  if (typeof type === 'string') {
    return type
  }

  return type.name
}

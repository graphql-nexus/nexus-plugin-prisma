import { DMMF } from '@prisma/client/runtime'
import {
  GlobalComputedInputs,
  GlobalMutationResolverParams,
  LocalComputedInputs,
} from '../utils'
import { getPhotonDmmf } from './utils'
import { DmmfDocument } from './DmmfDocument'
import { DmmfTypes } from './DmmfTypes'
import { PaginationStrategy, relayLikePaginationStrategy } from '../pagination'

export type TransformOptions = {
  globallyComputedInputs?: GlobalComputedInputs
  paginationStrategy?: PaginationStrategy<any>
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
  paginationStrategy: relayLikePaginationStrategy,
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
    })) as any, // TODO: Remove this once @prisma/client/runtime:DMMF contains the `uniqueFields` typed
  }
}

const paginationArgNames = ['cursor', 'take', 'skip']

function transformSchema(
  schema: DMMF.Schema,
  { globallyComputedInputs, paginationStrategy }: Required<TransformOptions>,
): DmmfTypes.Schema {
  return {
    enums: schema.enums,
    inputTypes: schema.inputTypes.map(_ =>
      transformInputType(_, globallyComputedInputs),
    ),
    outputTypes: schema.outputTypes.map(o => {
      return {
        ...o,
        fields: o.fields.map(f => {
          let args = f.args.map(transformArg)
          const argNames = args.map(a => a.name)

          // If this field has pagination
          if (
            paginationArgNames.every(paginationArgName =>
              argNames.includes(paginationArgName),
            )
          ) {
            args = paginationStrategy.transformDmmfArgs({
              args,
              paginationArgNames,
              field: f,
            })
          }

          return {
            ...f,
            args,
            outputType: {
              ...f.outputType,
              type: getReturnTypeName(f.outputType.type),
            },
          }
        }),
      }
    }),
  }
}

/**
 * Conversion from a Prisma Client arg type to a GraphQL arg type using
 * heuristics. A conversion is needed because GraphQL does not
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

type AddComputedInputParams = {
  inputType: DmmfTypes.InputType
  params: GlobalMutationResolverParams
  dmmf: DmmfDocument
  locallyComputedInputs: LocalComputedInputs<any>
}

/** Resolver-level computed inputs aren't recursive so aren't
 *  needed for deep computed inputs.
 */
type AddDeepComputedInputsArgs = Omit<
  AddComputedInputParams,
  'locallyComputedInputs'
> & { data: any } // Used to recurse through the input object

/**
 * Recursively looks for inputs that need a value from globallyComputedInputs
 * and populates them
 */
function addGloballyComputedInputs({
  inputType,
  params,
  dmmf,
  data,
}: AddDeepComputedInputsArgs): Record<string, any> {
  if (Array.isArray(data)) {
    return data.map(value =>
      addGloballyComputedInputs({
        inputType,
        dmmf,
        params,
        data: value,
      }),
    )
  }
  // Get values for computedInputs corresponding to keys that exist in inputType
  const computedInputValues = Object.keys(inputType.computedInputs).reduce(
    (values, key) => ({
      ...values,
      [key]: inputType.computedInputs[key](params),
    }),
    {} as Record<string, any>,
  )
  // Combine computedInputValues with values provided by the user, recursing to add
  // global computedInputs to nested types
  return Object.keys(data).reduce((deeplyComputedData, fieldName) => {
    const field = inputType.fields.find(_ => _.name === fieldName)!
    const fieldValue =
      field.inputType.kind === 'object'
        ? addGloballyComputedInputs({
            inputType: dmmf.getInputType(field.inputType.type),
            dmmf,
            params,
            data: data[fieldName],
          })
        : data[fieldName]
    return {
      ...deeplyComputedData,
      [fieldName]: fieldValue,
    }
  }, computedInputValues)
}

export function addComputedInputs({
  dmmf,
  inputType,
  locallyComputedInputs,
  params,
}: AddComputedInputParams) {
  return {
    ...params.args,
    data: {
      /**
       * Globally computed inputs are attached to the inputType object
       * as 'computedInputs' by the transformInputType function.
       */
      ...addGloballyComputedInputs({
        inputType,
        dmmf,
        params,
        data: params.args.data,
      }),
      ...Object.entries(locallyComputedInputs).reduce(
        (args, [fieldName, computeFieldValue]) => ({
          ...args,
          [fieldName]: computeFieldValue(params),
        }),
        {} as Record<string, any>,
      ),
    },
  }
}

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
// FIXME `any` type because this is used by both outputType and inputType
// and there is currently no generic capturing both ideas.
//
export function getReturnTypeName(type: any): string {
  if (typeof type === 'string') {
    return type
  }

  return type.name
}

import { DMMF } from '@prisma/client/runtime'
import { inspect } from 'util'
import { paginationStrategies, PaginationStrategy } from '../pagination'
import { dump, GlobalComputedInputs, GlobalMutationResolverParams, LocalComputedInputs } from '../utils'
import { DmmfDocument } from './DmmfDocument'
import { InternalDMMF } from './DmmfTypes'
import { getTypeName, isEnumValue, isInputObject, isOutputType } from './helpers'
import { getPrismaClientDmmf } from './utils'

export type TransformOptions = {
  atomicOperations?: boolean
  globallyComputedInputs?: GlobalComputedInputs
  paginationStrategy?: PaginationStrategy
}

export const getTransformedDmmf = (
  prismaClientPackagePath: string,
  options?: TransformOptions
): DmmfDocument => new DmmfDocument(transform(getPrismaClientDmmf(prismaClientPackagePath), options))

const addDefaultOptions = (givenOptions?: TransformOptions): Required<TransformOptions> => ({
  globallyComputedInputs: {},
  paginationStrategy: paginationStrategies.relay,
  atomicOperations: true,
  ...givenOptions,
})

export function transform(document: DMMF.Document, options?: TransformOptions): InternalDMMF.Document {
  dump(Object.keys(document.schema))
  return {
    datamodel: transformDatamodel(document.datamodel),
    schema: transformSchema(document.schema, addDefaultOptions(options)),
    operations: document.mappings.modelOperations,
  }
}

function transformDatamodel(datamodel: DMMF.Datamodel): InternalDMMF.Datamodel {
  return {
    enums: datamodel.enums,
    models: datamodel.models.map((model) => ({
      ...model,
      fields: model.fields.map((field) => ({
        ...field,
        kind: field.kind === 'object' ? 'relation' : field.kind,
      })),
    })) as any, // TODO: Remove this once @prisma/client/runtime:DMMF contains the `uniqueFields` typed
  }
}

const paginationArgNames = ['cursor', 'take', 'skip']

type TransformConfig = Required<TransformOptions>

function transformSchema(schema: DMMF.Schema, options: TransformConfig): InternalDMMF.Schema {
  const enums = schema.enumTypes.model ?? []

  const inputTypes =
    schema.inputObjectTypes.model?.map((type) =>
      transformInputType(type, options.globallyComputedInputs, options.atomicOperations)
    ) ?? []

  const outputTypes =
    schema.outputObjectTypes.model?.map((type) => {
      return transformOutputType(type, options)
    }) ?? []

  return {
    enums,
    inputTypes,
    outputTypes,
  }
}

function transformOutputType(type: DMMF.OutputType, options: TransformConfig) {
  return {
    ...type,
    fields: type.fields.map((field) => {
      let args = field.args.map((arg) => transformArg(arg, options.atomicOperations))
      const argNames = args.map((a) => a.name)

      // If this field has pagination
      if (paginationArgNames.every((paginationArgName) => argNames.includes(paginationArgName))) {
        args = options.paginationStrategy.transformDmmfArgs({
          args,
          paginationArgNames,
          field,
        })
      }

      return {
        name: field.name,
        args,
        outputType: {
          type: getTypeName(field.outputType.type),
          kind: getFieldKind(field.outputType.type),
          isRequired: field.isRequired,
          isNullable: field.isNullable,
          isList: field.outputType.isList,
        },
      }
    }),
  }
}

/**
 * Conversion from a Prisma Client arg type to a GraphQL arg type using
 * heuristics. A conversion is needed because GraphQL does not
 * support union types on args, but Prisma Client does.
 */
function transformArg(arg: DMMF.SchemaArg, atomicOperations: boolean): InternalDMMF.SchemaArg {
  const inputType = argTypeUnionToArgType(arg.inputTypes, atomicOperations)

  return {
    name: arg.name,
    inputType: {
      type: getTypeName(inputType.type),
      isList: inputType.isList,
      kind: getArgKind(inputType),
      isNullable: arg.isNullable,
      isRequired: arg.isRequired,
    },
    // FIXME Why?
    isRelationFilter: undefined,
  }
}

/**
 * Prisma Client supports union types but GraphQL doesn't.
 * Because of that, we need to choose a member of the union type that we'll expose on our GraphQL schema.
 *
 * Apart from some exceptions, we're generally trying to pick the broadest member type of the union.
 */
function argTypeUnionToArgType(
  argTypeContexts: DMMF.SchemaArgInputType[],
  atomicOperations: boolean
): DMMF.SchemaArgInputType {
  // Remove atomic operations if needed
  const filteredArgTypeContexts =
    atomicOperations === false
      ? argTypeContexts.filter((argTypeCtx) => !getTypeName(argTypeCtx.type).endsWith('OperationsInput'))
      : argTypeContexts

  return (
    // We're intentionally ignoring the `<Model>RelationFilter` member of some union type for now and using the `<Model>WhereInput` instead to avoid making a breaking change
    filteredArgTypeContexts.find(
      (argTypeCtx) =>
        isInputObject(argTypeCtx.type) &&
        argTypeCtx.isList &&
        getTypeName(argTypeCtx.type).endsWith('WhereInput')
    ) ??
    // Same here
    filteredArgTypeContexts.find(
      (argTypeCtx) => isInputObject(argTypeCtx.type) && getTypeName(argTypeCtx.type).endsWith('WhereInput')
    ) ??
    // [AnyType]
    filteredArgTypeContexts.find((argTypeCtx) => isInputObject(argTypeCtx.type) && argTypeCtx.isList) ??
    // AnyType
    filteredArgTypeContexts.find((argTypeCtx) => isInputObject(argTypeCtx.type)) ??
    // fallback to the first member of the union
    argTypeContexts[0]
  )
}

type AddComputedInputParams = {
  inputType: InternalDMMF.InputType
  params: GlobalMutationResolverParams
  dmmf: DmmfDocument
  locallyComputedInputs: LocalComputedInputs<any>
}

/** Resolver-level computed inputs aren't recursive so aren't
 *  needed for deep computed inputs.
 */
type AddDeepComputedInputsArgs = Omit<AddComputedInputParams, 'locallyComputedInputs'> & { data: any } // Used to recurse through the input object

/**
 * Recursively looks for inputs that need a value from globallyComputedInputs
 * and populates them
 */
async function addGloballyComputedInputs({
  inputType,
  params,
  dmmf,
  data,
}: AddDeepComputedInputsArgs): Promise<Record<string, any>> {
  if (Array.isArray(data)) {
    return Promise.all(
      data.map((value) =>
        addGloballyComputedInputs({
          inputType,
          dmmf,
          params,
          data: value,
        })
      )
    )
  }
  // Get values for computedInputs corresponding to keys that exist in inputType
  const computedInputValues = Object.keys(inputType.computedInputs).reduce(
    async (values, key) => ({
      ...(await values),
      [key]: await inputType.computedInputs[key](params),
    }),
    Promise.resolve({} as Record<string, any>)
  )
  // Combine computedInputValues with values provided by the user, recursing to add
  // global computedInputs to nested types
  return Object.keys(data).reduce(async (deeplyComputedData, fieldName) => {
    const field = inputType.fields.find((_) => _.name === fieldName)!
    const fieldValue =
      field.inputType.kind === 'object'
        ? await addGloballyComputedInputs({
            inputType: dmmf.getInputType(field.inputType.type),
            dmmf,
            params,
            data: data[fieldName],
          })
        : data[fieldName]
    return {
      ...(await deeplyComputedData),
      [fieldName]: fieldValue,
    }
  }, computedInputValues)
}

export async function addComputedInputs({
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
      ...(await addGloballyComputedInputs({
        inputType,
        dmmf,
        params,
        data: params.args.data,
      })),
      ...(await Object.entries(locallyComputedInputs).reduce(
        async (args, [fieldName, computeFieldValue]) => ({
          ...(await args),
          [fieldName]: await computeFieldValue(params),
        }),
        Promise.resolve({} as Record<string, any>)
      )),
    },
  }
}

function transformInputType(
  inputType: DMMF.InputType,
  globallyComputedInputs: GlobalComputedInputs,
  atomicOperations: boolean
): InternalDMMF.InputType {
  const fieldNames = inputType.fields.map((field) => field.name)
  /**
   * Only global computed inputs are removed during schema transform.
   * Resolver level computed inputs are filtered as part of the
   * projecting process. They are then passed to addComputedInputs
   * at runtime so their values can be inferred alongside the
   * global values.
   */
  const globallyComputedInputsInType = Object.keys(globallyComputedInputs).reduce(
    (args, key) =>
      fieldNames.includes(key) ? Object.assign(args, { [key]: globallyComputedInputs[key] }) : args,
    {} as GlobalComputedInputs
  )
  return {
    ...inputType,
    fields: inputType.fields
      .filter((field) => !(field.name in globallyComputedInputs))
      .map((_) => transformArg(_, atomicOperations)),
    computedInputs: globallyComputedInputsInType,
  }
}

function getFieldKind(type: string | DMMF.SchemaEnum | DMMF.OutputType): InternalDMMF.FieldKind {
  if (typeof type === 'string') {
    return 'scalar'
  }
  if (isEnumValue(type)) {
    return 'enum'
  }
  if (isOutputType(type)) {
    return 'object'
  }

  throw new Error(
    `Failed to transform DMMF into internal DMMF because cannot get field kind for given type because it is unknown or malformed. The type data is:\n\n${inspect(
      type
    )}`
  )
}

function getArgKind(arg: DMMF.SchemaArgInputType): InternalDMMF.FieldKind {
  const type = arg.type
  if (typeof type === 'string') {
    return 'scalar'
  }
  if (isInputObject(type)) {
    return 'object'
  }
  if (isEnumValue(type)) {
    return 'enum'
  }

  throw new Error(
    `Failed to transform DMMF into internal DMMF because cannot get arg kind for given type because it is unknown or malformed. The type data is:\n\n${inspect(
      type
    )}`
  )
}

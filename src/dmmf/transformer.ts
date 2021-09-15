import { DMMF } from '@prisma/client/runtime'
import { inspect } from 'util'
import { paginationStrategies, PaginationStrategy } from '../pagination'
import {
  GlobalComputedInputs,
  GlobalComputedWhereInputs,
  GlobalMutationResolverParams,
  GlobalQueryResolverParams,
  LocalComputedInputs,
  LocalComputedWhereInputs,
} from '../utils'
import { DmmfDocument } from './DmmfDocument'
import { InternalDMMF } from './DmmfTypes'
import { getTypeName } from './helpers'
import { getPrismaClientDmmf } from './utils'

export type TransformOptions = {
  atomicOperations?: boolean
  globallyComputedInputs?: GlobalComputedInputs
  globallyComputedWhereInputs?: GlobalComputedWhereInputs
  paginationStrategy?: PaginationStrategy
}

export const getTransformedDmmf = (
  prismaClientPackagePath: string,
  options?: TransformOptions
): DmmfDocument => new DmmfDocument(transform(getPrismaClientDmmf(prismaClientPackagePath), options))

const addDefaultOptions = (givenOptions?: TransformOptions): Required<TransformOptions> => ({
  globallyComputedInputs: {},
  globallyComputedWhereInputs: {},
  paginationStrategy: paginationStrategies.relay,
  atomicOperations: true,
  ...givenOptions,
})

export function transform(document: DMMF.Document, options?: TransformOptions): InternalDMMF.Document {
  const result = {
    datamodel: transformDatamodel(document.datamodel),
    schema: transformSchema(document.schema, addDefaultOptions(options)),
    operations: document.mappings.modelOperations,
  }
  return result
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
  const enumTypes = schema.enumTypes.model ?? []
  const inputTypes =
    schema.inputObjectTypes.model?.map((type) =>
      transformInputType(
        type,
        options.globallyComputedInputs,
        options.globallyComputedWhereInputs,
        options.atomicOperations
      )
    ) ?? []

  const outputTypes =
    schema.outputObjectTypes.model?.map((type) => {
      return transformOutputType(type, options)
    }) ?? []

  // todo review if we want to keep model & prisma separated or not
  // since Prisma 2.12

  enumTypes.push(...schema.enumTypes.prisma)

  inputTypes.push(
    ...schema.inputObjectTypes.prisma.map((type) => {
      return transformInputType(
        type,
        options.globallyComputedInputs,
        options.globallyComputedWhereInputs,
        options.atomicOperations
      )
    })
  )
  outputTypes.push(
    ...schema.outputObjectTypes.prisma.map((type) => {
      return transformOutputType(type, options)
    })
  )

  return {
    enums: enumTypes,
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
          kind: getKind(field.outputType),
          isRequired: !field.isNullable,
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
      kind: getKind(inputType),
      isNullable: arg.isNullable,
      isRequired: arg.isRequired,
    },
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

  const result =
    // We're intentionally ignoring the `<Model>RelationFilter` member of some union type for now and using the `<Model>WhereInput` instead to avoid making a breaking change
    filteredArgTypeContexts.find(
      (argTypeCtx) =>
        isInputObjectType(argTypeCtx) &&
        argTypeCtx.isList &&
        getTypeName(argTypeCtx.type).endsWith('WhereInput')
    ) ??
    // Same here
    filteredArgTypeContexts.find(
      (argTypeCtx) => isInputObjectType(argTypeCtx) && getTypeName(argTypeCtx.type).endsWith('WhereInput')
    ) ??
    // [AnyType]
    filteredArgTypeContexts.find((argTypeCtx) => isInputObjectType(argTypeCtx) && argTypeCtx.isList) ??
    // AnyType
    filteredArgTypeContexts.find((argTypeCtx) => isInputObjectType(argTypeCtx)) ??
    // fallback to the first member of the union
    argTypeContexts[0]

  return result

  function isInputObjectType(argTypeCtx: any) {
    return argTypeCtx.location === 'inputObjectTypes'
  }
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

type AddComputedWhereInputParams = {
  argType: InternalDMMF.ArgType
  inputType: InternalDMMF.InputType
  params: GlobalQueryResolverParams
  dmmf: DmmfDocument
  locallyComputedWhereInputs: LocalComputedWhereInputs<any>
}

/** Resolver-level computed inputs aren't recursive so aren't
 *  needed for deep computed inputs.
 */
type AddDeepComputedWhereInputsArgs = Omit<AddComputedWhereInputParams, 'locallyComputedWhereInputs'> & {
  where?: any
} // Used to recurse through the input object

/**
 * Recursively looks for inputs that need a value from globallyComputedInputs
 * and populates them
 */
async function addGloballyComputedWhereInputs({
  argType,
  inputType,
  params,
  dmmf,
  where = {},
}: AddDeepComputedWhereInputsArgs): Promise<Record<string, any>> {
  // Get values for computedInputs corresponding to keys that exist in inputType
  const computedInputValues = Object.keys(inputType.computedWhereInputs).reduce(async (values, key) => {
    const computedWhereInputs = await inputType.computedWhereInputs[key](params)
    if (
      !(argType.includes('Unique') && typeof computedWhereInputs !== 'object') // If Input type is ~UniqueInput. It should be scalar and object type data should be ignored
    ) {
      return {
        ...(await values),
        [key]: computedWhereInputs,
      }
    } else {
      return {
        ...(await values),
      }
    }
  }, Promise.resolve({} as Record<string, any>))

  const test = await Object.keys(where).reduce(async (deeplyComputedData, fieldName) => {
    const field = inputType.fields.find((_) => _.name === fieldName)!
    const fieldValue =
      field.inputType.kind === 'object' && typeof where[fieldName] === 'object' && where[fieldName] !== null
        ? await addGloballyComputedWhereInputs({
            argType: field.inputType.type,
            inputType: dmmf.getInputType(field.inputType.type),
            dmmf,
            params,
            where: where[fieldName],
          })
        : where[fieldName]

    return {
      [fieldName]: fieldValue,
      ...(await deeplyComputedData),
    }
  }, computedInputValues)
  // Combine computedInputValues with values provided by the user, recursing to add
  // global computedInputs to nested types
  return test
}

export async function addComputedWhereInputs({
  argType,
  dmmf,
  inputType,
  locallyComputedWhereInputs,
  params,
}: AddComputedWhereInputParams) {
  return {
    ...params.args,
    where: {
      /**
       * Globally computed inputs are attached to the inputType object
       * as 'computedInputs' by the transformInputType function.
       */
      ...(await addGloballyComputedWhereInputs({
        argType,
        inputType,
        dmmf,
        params,
        where: params.args.where,
      })),
      ...(await Object.entries(locallyComputedWhereInputs).reduce(
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
  globallyComputedWhereInputs: GlobalComputedWhereInputs,
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
  const globallyComputedWhereInputsInType = inputType.fields.find(
    (field) => !(field.name in globallyComputedWhereInputs)
  )
    ? Object.keys(globallyComputedWhereInputs).reduce(
        (args, key) =>
          fieldNames.includes(key) ? Object.assign(args, { [key]: globallyComputedWhereInputs[key] }) : args,
        {} as GlobalComputedWhereInputs
      )
    : {}

  return {
    ...inputType,
    fields: inputType.fields
      .filter((field) => !(field.name in globallyComputedInputs))
      .filter((field) => !(field.name in globallyComputedWhereInputs))
      .map((field) => transformArg(field, atomicOperations)),
    computedInputs: globallyComputedInputsInType,
    computedWhereInputs: globallyComputedWhereInputsInType,
  }
}

function getKind(arg: DMMF.SchemaArgInputType | DMMF.SchemaField['outputType']): InternalDMMF.FieldKind {
  const type = arg.type

  if (arg.location === 'scalar') {
    return 'scalar'
  }

  if (arg.location === 'enumTypes') {
    return 'enum'
  }

  if (arg.location === 'inputObjectTypes') {
    return 'object'
  }

  if (arg.location === 'outputObjectTypes') {
    return 'object'
  }

  throw new Error(
    `Failed to transform DMMF into internal DMMF because cannot get arg kind for given type because it is unknown or malformed. The type data is:\n\n${inspect(
      type
    )}`
  )
}

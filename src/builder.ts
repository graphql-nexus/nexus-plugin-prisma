import * as Nexus from 'nexus'
import { DynamicOutputPropertyDef } from 'nexus/dist/dynamicProperty'
import * as path from 'path'
import * as GraphQL from './graphql'
import {
  DmmfDocument,
  DmmfTypes,
  getTransformedDmmf,
  fatalIfOldPhotonIsInstalled,
} from './dmmf'
import {
  transformArgs,
  isTransformRequired,
  isRelationType,
} from './transformArgs'
import {
  OnUnknownArgName,
  OnUnknownFieldName,
  OnUnknownFieldType,
  OnUnknownPrismaModelName,
  raiseErrorOrTriggerHook,
} from './hooks'
import { getCrudMappedFields } from './mapping'
import {
  ArgsNamingStrategy,
  defaultArgsNamingStrategy,
  defaultFieldNamingStrategy,
  FieldNamingStrategy,
  OperationName,
} from './naming-strategies'
import { proxifyModelFunction, proxifyPublishers } from './proxifier'
import { Publisher } from './publisher'
import * as Typegen from './typegen'
import {
  assertPhotonInContext,
  Index,
  InputsConfig,
  relationKeys,
  InputConfig,
  RelateByValue,
} from './utils'
import { NexusArgDef } from 'nexus/dist/core'
import { WithRequiredKeys, capitalize, isEmpty, merge } from '@re-do/utils'

type FieldPublisherConfig = {
  alias?: string
  type?: Nexus.core.AllOutputTypes
  pagination?: boolean | Record<string, boolean>
  filtering?: boolean | Record<string, boolean>
  ordering?: boolean | Record<string, boolean>
  inputs?: InputsConfig
  relateBy?: RelateByValue
}

// Config options that are populated with defaults will not be undefined
type ResolvedFieldPublisherConfig = WithRequiredKeys<
  FieldPublisherConfig,
  'alias' | 'type' | 'inputs' | 'relateBy'
>

type FieldPublisher = (opts?: FieldPublisherConfig) => PublisherMethods // Fluent API
type PublisherMethods = Record<string, FieldPublisher>
type PublisherConfigData = {
  field: DmmfTypes.SchemaField
  givenOptions?: FieldPublisherConfig
}
type FieldConfigData = {
  field: DmmfTypes.SchemaField
  publisherConfig: ResolvedFieldPublisherConfig
  typeName: string
  operation?: OperationName | null
  resolve?: Nexus.FieldResolver<any, string>
}

/**
 * When dealing with list types we rely on the list type zero value (empty-list)
 * to represet the idea of null.
 *
 * For Prisma Client JS' part, it will never return null for list type fields nor will it
 * ever return null value list members.
 */
const dmmfListFieldTypeToNexus = (
  fieldType: DmmfTypes.SchemaField['outputType'],
) => {
  return fieldType.isList
    ? {
        list: [true],
        nullable: false,
      }
    : {
        nullable: !fieldType.isRequired,
      }
}

type PrismaClientFetcher = (ctx: Nexus.core.GetGen<'context'>) => any

export type Options = {
  // TODO return type should be Photon
  /**
   * nexus-prisma will call this to get a reference to an instance of the Prisma Client.
   * The function is passed the context object. Typically a Photon instance will
   * be available on the context to support your custom resolvers. Therefore the
   * default getter returns `ctx.prisma`.
   */
  prismaClient?: PrismaClientFetcher
  /**
   * Same purpose as for that used in `Nexus.makeSchema`. Follows the same rules
   * and permits the same environment variables. This configuration will completely
   * go away once Nexus has typeGen plugin support.
   */
  shouldGenerateArtifacts?: boolean
  paths?: {
    /**
     * Where can nexus-prisma find the Prisma Client JS package? By default looks in
     * `node_modules/@prisma/client`. This is needed because nexus-prisma
     * gets your Prisma schema AST and Prisma Client JS crud info from the generated
     * Prisma Client JS package.
     */
    prismaClient?: string
    /**
     * Where should nexus-prisma put its typegen on disk? By default matches the
     * default approach of Nexus typegen which is to emit into `node_modules/@types`.
     * This configuration will completely go away once Nexus has typeGen plugin
     * support.
     */
    typegen?: string
  }
  inputs?: InputsConfig
  relateBy?: RelateByValue
}

export type InternalOptions = Options & {
  dmmf?: DmmfDocument // For testing
  builderHook?: any // For testing
  nexusBuilder: Nexus.PluginBuilderLens
  onUnknownFieldName?: OnUnknownFieldName // For pumpkins
  onUnknownFieldType?: OnUnknownFieldType // For pumpkins
  onUnknownArgName?: OnUnknownArgName // For pumpkins
  onUnknownPrismaModelName?: OnUnknownPrismaModelName // For pumpkins
}

export function build(options: InternalOptions) {
  const builder = new SchemaBuilder(options)

  return builder.build()
}

// The @types default is based on the priviledge given to such
// packages by TypeScript. For details refer to https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types
let defaultTypegenPath: string
if (process.env.NEXUS_PRISMA_TYPEGEN_PATH) {
  defaultTypegenPath = process.env.NEXUS_PRISMA_TYPEGEN_PATH
} else if (process.env.NEXUS_PRISMA_LINK) {
  defaultTypegenPath = path.join(
    process.cwd(),
    'node_modules/@types/nexus-prisma-typegen/index.d.ts',
  )
} else {
  defaultTypegenPath = path.join(
    __dirname,
    '../../@types/nexus-prisma-typegen/index.d.ts',
  )
}

let defaultClientPath: string

if (process.env.NEXUS_PRISMA_CLIENT_PATH) {
  defaultClientPath = process.env.NEXUS_PRISMA_CLIENT_PATH
} else if (process.env.NEXUS_PRISMA_LINK) {
  defaultClientPath = path.join(process.cwd(), '/node_modules/@prisma/photon')

  if (!fatalIfOldPhotonIsInstalled(defaultClientPath)) {
    defaultClientPath = path.join(process.cwd(), '/node_modules/@prisma/client')
  }
} else {
  defaultClientPath = '@prisma/photon'

  if (!fatalIfOldPhotonIsInstalled(defaultClientPath)) {
    defaultClientPath = '@prisma/client'
  }
}

// NOTE This will be repalced by Nexus plugins once typegen integration is available.
const shouldGenerateArtifacts =
  process.env.NEXUS_SHOULD_GENERATE_ARTIFACTS === 'true'
    ? true
    : process.env.NEXUS_SHOULD_GENERATE_ARTIFACTS === 'false'
    ? false
    : Boolean(!process.env.NODE_ENV || process.env.NODE_ENV === 'development')

export interface CustomInputArg {
  arg: DmmfTypes.SchemaArg
  type: DmmfTypes.InputType | DmmfTypes.Enum | { name: string } // scalar
}

export class SchemaBuilder {
  readonly dmmf: DmmfDocument
  protected argsNamingStrategy: ArgsNamingStrategy
  protected fieldNamingStrategy: FieldNamingStrategy
  protected getPhoton: PrismaClientFetcher
  protected inputs: InputsConfig
  protected relateBy: RelateByValue
  protected unknownFieldsByModel: Index<string[]>
  publisher: Publisher

  constructor(public options: InternalOptions) {
    const { paths, ...rest } = options
    const config = {
      shouldGenerateArtifacts,
      prismaClient: (ctx: any) => ctx.prisma,
      paths: {
        prismaClient: paths?.prismaClient ?? defaultClientPath,
        typegen: paths?.typegen ?? defaultTypegenPath,
      },
      inputs: {},
      ...rest,
    }
    this.inputs = config.inputs
    this.relateBy = options.relateBy ?? 'any'
    this.dmmf = options.dmmf ?? getTransformedDmmf(config.paths.prismaClient)
    this.publisher = new Publisher(this.dmmf, config.nexusBuilder)
    if (config.builderHook) {
      config.builderHook.builder = this
    }
    this.unknownFieldsByModel = {}

    this.argsNamingStrategy = defaultArgsNamingStrategy
    this.fieldNamingStrategy = defaultFieldNamingStrategy

    this.getPhoton = (ctx: any) => {
      const photon = config.prismaClient(ctx)
      assertPhotonInContext(photon)
      return photon
    }
    if (config.shouldGenerateArtifacts) {
      Typegen.generateSync({
        prismaClientPath: config.paths.prismaClient,
        typegenPath: config.paths.typegen,
      })
    }
  }

  /**
   * The build entrypoint, bringing together sub-builders.
   */
  build() {
    return [this.buildCRUD(), this.buildModel()]
  }

  /**
   * Build `t.crud` dynamic output property
   */
  protected buildCRUD(): DynamicOutputPropertyDef<'crud'> {
    return Nexus.dynamicOutputProperty({
      name: 'crud',
      typeDefinition: `: NexusPrisma<TypeName, 'crud'>`,
      // FIXME
      // Nexus should improve the type of typeName to be AllOutputTypes
      factory: ({ typeDef: t, typeName, stage }) => {
        if (typeName === GraphQL.rootNames.Subscription) {
          // TODO Lets put a GitHub issue link in this error message
          throw new Error(
            `t.crud is not yet supported on the 'Subscription' type.`,
          )
        }

        if (
          typeName !== GraphQL.rootNames.Query &&
          typeName !== GraphQL.rootNames.Mutation
        ) {
          throw new Error(
            `t.crud can only be used on GraphQL root types 'Query' & 'Mutation' but was used on '${typeName}'. Please use 't.model' instead`,
          )
        }
        const publishers = getCrudMappedFields(typeName, this.dmmf).reduce(
          (crud, mappedField) => {
            const fieldPublisher: FieldPublisher = givenOptions => {
              const publisherConfig = this.addDefaultsToPublisherConfig({
                field: mappedField.field,
                givenOptions: givenOptions ? givenOptions : {},
              })
              const fieldConfig = this.buildFieldConfig({
                field: mappedField.field,
                publisherConfig,
                typeName,
                operation: mappedField.operation,
                resolve: (root, args, ctx, info) => {
                  const photon = this.getPhoton(ctx)
                  const inputArg = fieldConfig.args!.data as NexusArgDef<any>
                  if (typeName === 'Mutation') {
                    args = transformArgs({
                      inputType: this.publisher.getInputType(inputArg.name),
                      publisher: this.publisher,
                      params: {
                        info,
                        args,
                        ctx,
                      },
                      inputs: publisherConfig.inputs,
                      relateBy: publisherConfig.relateBy,
                    })
                  }
                  return photon[mappedField.photonAccessor][
                    mappedField.operation
                  ](args)
                },
              })
              if (
                this.assertOutputTypeIsDefined(
                  typeName,
                  mappedField.field.name,
                  publisherConfig.type,
                  stage,
                )
              ) {
                t.field(publisherConfig.alias, fieldConfig)
              }

              return crud
            }

            crud[mappedField.field.name] = fieldPublisher

            return crud
          },
          {} as PublisherMethods,
        )

        return proxifyPublishers(
          publishers,
          typeName,
          stage,
          this.options.onUnknownFieldName,
        )
      },
    })
  }

  /**
   * Build the `t.model` dynamic output property.
   */
  protected buildModel() {
    return Nexus.dynamicOutputProperty({
      name: 'model',
      typeDefinition: `: NexusPrisma<TypeName, 'model'>`,
      /**
       * This factory implements what .model will actually be.
       *
       * If the user's GQL typedef name matches a PSL model name,
       * then we infer that the user is trying to create a mapping
       * between them. This is the implicit mapping case.
       *
       * Otherwise we need the user to specify what PSL model
       * their GQL object maps to. This is the explicit mapping case.
       *
       * In the implicit case we eagerly do the .model implementation,
       * but in the explicit case we return a function in order that the
       * user may specify the mapping.
       *
       * Examples:
       *
       *    // Given PSL that contains:
       *
       *    model User {
       *      id    String @unique @id @default(uuid())
       *      email String @unique
       *    }
       *
       *    // Example of implicit mapping
       *
       *    objectType({
       *      name: 'User',
       *      definition(t) {
       *        t.model.id()
       *        t.model.email()
       *      }
       *    })
       *
       *    // Example of explicit mapping
       *
       *    objectType({
       *      name: 'Customer',
       *      definition(t) {
       *        t.model('User').id()
       *        t.model('User').email()
       *      }
       *    })
       *
       */
      factory: ({ typeDef, typeName, stage }) => {
        const hasPrismaModel = this.dmmf.hasModel(typeName)
        if (hasPrismaModel) {
          return this.internalBuildModel(typeName, typeDef, stage)
        } else {
          const accessor = (modelName: string) =>
            this.internalBuildModel(modelName, typeDef, stage)

          return proxifyModelFunction(
            accessor,
            typeName,
            stage,
            this.options.onUnknownPrismaModelName,
            this.unknownFieldsByModel,
          )
        }
      },
    })
  }

  protected internalBuildModel(
    typeName: string,
    t: Nexus.core.OutputDefinitionBlock<any>,
    stage: Nexus.core.OutputFactoryConfig<any>['stage'],
  ) {
    const model = this.dmmf.getModelOrThrow(typeName)
    const outputType = this.dmmf.getOutputType(model.name)

    const publishers = outputType.fields.reduce((acc, field) => {
      const fieldPublisher: FieldPublisher = givenOptions => {
        const publisherConfig = this.addDefaultsToPublisherConfig({
          field,
          givenOptions: givenOptions ?? {},
        })
        if (
          !this.assertOutputTypeIsDefined(
            typeName,
            publisherConfig.alias,
            publisherConfig.type,
            stage,
          )
        ) {
          return acc
        }
        this.assertFilteringOrOrderingArgNameExists(
          typeName,
          field.outputType.type,
          publisherConfig.alias,
          publisherConfig,
          stage,
        )
        const fieldConfig = this.buildFieldConfig({
          field,
          publisherConfig,
          typeName,
          resolve:
            field.outputType.kind === 'object'
              ? (root, args, ctx) => {
                  const photon = this.getPhoton(ctx)
                  const mapping = this.dmmf.getMapping(typeName)
                  return photon[mapping.plural!]
                    ['findOne']({ where: { id: root.id } })
                    [field.name](args)
                }
              : undefined,
        })

        t.field(publisherConfig.alias, fieldConfig)

        return publishers
      }

      acc[field.name] = fieldPublisher
      return acc
    }, {} as PublisherMethods)

    return proxifyPublishers(
      publishers,
      typeName,
      stage,
      this.options.onUnknownFieldName,
    )
  }

  addDefaultsToPublisherConfig({
    field,
    givenOptions: { inputs, ...otherGivenOptions },
  }: Required<PublisherConfigData>): ResolvedFieldPublisherConfig {
    return {
      pagination: true,
      type: field.outputType.type,
      alias: field.name,
      relateBy: this.relateBy,
      inputs: merge(this.inputs, inputs ?? {}),
      ...otherGivenOptions,
    }
  }

  buildFieldConfig(
    config: FieldConfigData,
  ): Nexus.core.NexusOutputFieldConfig<any, string> {
    return {
      type: this.publisher.outputType(
        config.publisherConfig.type,
        config.field,
      ),
      ...dmmfListFieldTypeToNexus(config.field.outputType),
      args: this.buildArgsFromField(config),
      resolve: config.resolve,
    }
  }

  buildArgsFromField(config: FieldConfigData) {
    return this.determineArgs(config).reduce(
      (acc, customArg) => ({
        ...acc,
        [customArg.arg.name]: this.publisher.inputType(customArg) as any,
      }),
      {} as Nexus.core.ArgsRecord,
    )
  }

  determineArgs(config: FieldConfigData): CustomInputArg[] {
    if (config.typeName === 'Mutation') {
      return this.argsFromMutationField(config)
    } else if (config.operation === 'findOne') {
      return config.field.args.map(arg => ({
        arg,
        type: this.publisher.getInputType(arg.inputType.type),
      }))
    } else {
      return this.argsFromQueryOrModelField(config)
    }
  }

  argsFromMutationField({
    publisherConfig,
    field,
  }: FieldConfigData): CustomInputArg[] {
    if (isTransformRequired(publisherConfig.inputs, publisherConfig.relateBy)) {
      return this.deepTransformInputTypes(field.args, publisherConfig)
    }
    return field.args.map(arg => {
      const photonInputType = this.publisher.getInputType(arg.inputType.type)
      return {
        arg,
        type: photonInputType,
      }
    })
  }

  deepTransformInputTypes(
    args: DmmfTypes.SchemaArg[],
    config: ResolvedFieldPublisherConfig,
  ): CustomInputArg[] {
    return args.map(arg => {
      let transformedInputType = this.publisher.getTypeFromArg(
        arg,
      ) as DmmfTypes.InputType
      if (arg.inputType.kind !== 'object') {
        return {
          arg,
          type: transformedInputType,
        }
      }
      const name = this.getTransformedTypeName(arg, config)
      const argConfig = config.inputs?.[arg.name] ?? {}
      let transformedArg = arg
      if (
        isRelationType(transformedInputType) &&
        argConfig.relateBy &&
        relationKeys.includes(argConfig.relateBy)
      ) {
        transformedArg = transformedInputType.fields.find(
          ({ name }) => name === argConfig.relateBy,
        )!
        transformedInputType = this.publisher.getTypeFromArg(
          transformedArg,
        ) as DmmfTypes.InputType
      }
      const customArg: CustomInputArg = {
        arg: {
          ...transformedArg,
          name: arg.name,
          inputType: {
            ...transformedArg.inputType,
            type: name,
          },
          relateBy: 'any',
        },
        type: {
          ...transformedInputType,
          name: this.getTransformedTypeName(arg, config),
          fields: this.deepTransformInputTypes(
            transformedInputType.fields,
            config,
          ).map(_ => _.arg),
        },
      }
      if (!this.publisher.nexusBuilder.hasType(customArg.type.name)) {
        this.publisher.nexusBuilder.addType(
          this.publisher.inputType(customArg) as any,
        )
      }
      return customArg
    })
  }

  getTransformedTypeName = (
    arg: DmmfTypes.SchemaArg,
    config: ResolvedFieldPublisherConfig,
  ) => {
    const prefix = arg.inputType.type.replace('Input', '')
    const getRelationSuffix = (relation: 'create' | 'connect') => {
      if (config.relateBy === relation) {
        return `${capitalize(relation)}All`
      }
      const affectedInputs = Object.entries(config.inputs).filter(
        ([fieldName, fieldValue]) => fieldValue?.relateBy === relation,
      )
      if (!isEmpty(affectedInputs)) {
        return `${capitalize(
          relation,
        )}${affectedInputs
          .map(([fieldName, fieldValue]) => capitalize(fieldName))
          .join('And')}`
      }
      return ''
    }
    const computedInputEntries = Object.entries(config.inputs).filter(
      ([fieldName, fieldValue]) => fieldValue && 'computeFrom' in fieldValue,
    )
    const computedInputsSuffix = isEmpty(computedInputEntries)
      ? ''
      : `Without${computedInputEntries
          .map(([fieldName]) => capitalize(fieldName))
          .join('Or')}`
    return `${prefix}${getRelationSuffix('create')}${getRelationSuffix(
      'connect',
    )}${computedInputsSuffix}Input`
  }

  argsFromQueryOrModelField({
    typeName,
    field,
    publisherConfig,
  }: FieldConfigData) {
    let args: CustomInputArg[] = []

    if (publisherConfig.filtering) {
      const inputObjectTypeDefName = `${field.outputType.type}WhereInput`
      const whereArg = field.args.find(
        arg =>
          arg.inputType.type === inputObjectTypeDefName && arg.name === 'where',
      )

      if (!whereArg) {
        throw new Error(
          `Could not find filtering argument for ${typeName}.${field.name}`,
        )
      }

      const inputType = this.handleInputObjectCustomization(
        publisherConfig.filtering,
        inputObjectTypeDefName,
        field.name,
        typeName,
      )

      if (inputType.fields.length > 0) {
        args.push({
          arg: whereArg,
          type: inputType,
        })
      }
    }

    if (publisherConfig.ordering) {
      const orderByTypeName = `${field.outputType.type}OrderByInput`
      const orderByArg = field.args.find(
        arg => arg.inputType.type === orderByTypeName && arg.name === 'orderBy',
      )

      if (!orderByArg) {
        throw new Error(
          `Could not find ordering argument for ${typeName}.${field.name}`,
        )
      }

      const inputType = this.handleInputObjectCustomization(
        publisherConfig.ordering,
        orderByTypeName,
        field.name,
        typeName,
      )

      if (inputType.fields.length > 0) {
        args.push({
          arg: orderByArg,
          type: inputType,
        })
      }
    }

    if (publisherConfig.pagination) {
      const paginationKeys = ['first', 'last', 'before', 'after', 'skip']
      const paginationsArgs =
        publisherConfig.pagination === true
          ? field.args.filter(a => paginationKeys.includes(a.name))
          : field.args.filter(
              arg => (publisherConfig.pagination as any)[arg.name] === true,
            )

      args.push(
        ...paginationsArgs.map(a => ({
          arg: a,
          type: { name: a.inputType.type },
        })),
      )
    }

    return args
  }

  /**
   * This handles "tailored field feature publishing".
   *
   * With tailord field feature publishing, users can specify that only some
   * fields of the PSL model are exposed under the given field feature. For
   * example, in the following...
   *
   * ```ts
   * t.model.friends({ filtering: { firstName: true, location: true } })
   * ```
   *
   * ...the field feature is "filtering" and the user has tailored it so that
   * only "firstName" and "location" of the field's type (e.g. "User") are
   * exposed to filtering on this field. So the resulting GQL TypeDef would look
   * something like:
   *
   * ```ts
   * ...
   * friends(where: { firstName: ..., location: ..., }): [User]
   * ...
   * ```
   */
  protected handleInputObjectCustomization(
    fieldWhitelist: Record<string, boolean> | boolean,
    inputTypeName: string,
    fieldName: string,
    graphQLTypeName: string,
  ): DmmfTypes.InputType {
    const photonObject = this.dmmf.getInputType(inputTypeName)

    // If the publishing for this field feature (filtering, ordering, ...)
    // has not been tailored then we may simply pass through the backing
    // version as-is.
    //
    if (fieldWhitelist === true) {
      return photonObject
    }

    // REFACTOR use an intersection function
    const whitelistedFieldNames = Object.keys(fieldWhitelist)
    const userExposedObjectFields = photonObject.fields.filter(field =>
      whitelistedFieldNames.includes(field.name),
    )

    const uniqueName = photonObject.isWhereType
      ? this.argsNamingStrategy.whereInput(graphQLTypeName, fieldName)
      : this.argsNamingStrategy.orderByInput(graphQLTypeName, fieldName)

    return {
      ...photonObject,
      name: uniqueName,
      fields: userExposedObjectFields,
    }
  }

  protected assertOutputTypeIsDefined(
    typeName: string,
    fieldName: string,
    outputType: string,
    stage: 'walk' | 'build',
  ): boolean {
    if (
      this.options.nexusBuilder.hasType(outputType) ||
      GraphQL.isScalarType(outputType) || // scalar types are auto-published
      !this.dmmf.hasModel(outputType) // output types that are not models are auto-published
    ) {
      return true
    }

    const message = `Your GraphQL \`${typeName}\` object definition is projecting a field \`${fieldName}\` with \`${outputType}\` as output type, but \`${outputType}\` is not defined in your GraphQL Schema`

    raiseErrorOrTriggerHook(
      this.options.onUnknownFieldType,
      {
        unknownFieldType: outputType,
        typeName,
        fieldName,
        error: new Error(message),
      },
      message,
      stage,
    )

    return false
  }

  protected assertArgNameExists(
    parentTypeName: string,
    prismaOutputTypeName: string,
    fieldName: string,
    config: FieldPublisherConfig,
    stage: 'build' | 'walk',
    configProperty: 'filtering' | 'ordering',
  ): { wrongArgNames: string[] } | true {
    if (!config[configProperty] || config[configProperty] === true) {
      return true
    }

    const argNames = Object.keys(
      config[configProperty] as Record<string, boolean>,
    )
    const typeNameFieldNames = this.dmmf
      .getModelOrThrow(prismaOutputTypeName)
      .fields.map(f => f.name)
    const wrongArgNames = argNames.filter(
      filteringFieldName => !typeNameFieldNames.includes(filteringFieldName),
    )

    if (wrongArgNames.length === 0) {
      return true
    }

    const actionWord = configProperty === 'filtering' ? 'filter' : 'order'
    const renderMessage = (argName: string) =>
      `Your GraphQL \`${parentTypeName}\` object definition is projecting a relational field \`${fieldName}\`. On it, you are declaring that clients be able to ${actionWord} by Prisma \`${prismaOutputTypeName}\` model field \`${argName}\`. However, your Prisma model \`${prismaOutputTypeName}\` model has no such field \`${argName}\``

    const message = wrongArgNames
      .map(argName => renderMessage(argName))
      .join('\n')

    raiseErrorOrTriggerHook(
      this.options.onUnknownArgName,
      {
        unknownArgNames: wrongArgNames,
        typeName: prismaOutputTypeName,
        fieldName,
        error: new Error(message),
      },
      message,
      stage,
    )

    return { wrongArgNames }
  }

  protected assertFilteringOrOrderingArgNameExists(
    parentTypeName: string,
    prismaOutputTypeName: string,
    fieldName: string,
    config: FieldPublisherConfig,
    stage: 'build' | 'walk',
  ): void {
    this.assertArgNameExists(
      parentTypeName,
      prismaOutputTypeName,
      fieldName,
      config,
      stage,
      'filtering',
    )
    this.assertArgNameExists(
      parentTypeName,
      prismaOutputTypeName,
      fieldName,
      config,
      stage,
      'ordering',
    )
  }
}

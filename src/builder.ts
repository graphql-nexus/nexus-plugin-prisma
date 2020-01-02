import * as Nexus from 'nexus'
import { DynamicOutputPropertyDef } from 'nexus/dist/dynamicProperty'
import * as path from 'path'
import * as GraphQL from './graphql'
import {
  OnUnknownArgName,
  OnUnknownFieldName,
  OnUnknownFieldType,
  registerHook,
} from './hooks'
import { getCrudMappedFields } from './mapping'
import {
  ArgsNamingStrategy,
  defaultArgsNamingStrategy,
  defaultFieldNamingStrategy,
  FieldNamingStrategy,
  OperationName,
} from './naming-strategies'
import { proxify } from './proxifier'
import { Publisher } from './publisher'
import * as Typegen from './typegen'
import {
  assertPhotonInContext,
  LocalComputedInputs,
  GlobalComputedInputs,
  isEmptyObject,
} from './utils'
import {
  addComputedInputs,
  getTransformedDmmf,
  DmmfTypes,
  DmmfDocument,
} from './dmmf'

interface FieldPublisherConfig {
  alias?: string
  type?: Nexus.core.AllOutputTypes
  pagination?: boolean | Record<string, boolean>
  filtering?: boolean | Record<string, boolean>
  ordering?: boolean | Record<string, boolean>
  computedInputs?: LocalComputedInputs<any>
}

type WithRequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
// Config options that are populated with defaults will not be undefined
type ResolvedFieldPublisherConfig = Omit<
  WithRequiredKeys<FieldPublisherConfig, 'alias' | 'type'>,
  'computedInputs'
  // Internally rename the arg passed to a resolver as 'computedInputs' to clarify scope
> & { locallyComputedInputs: LocalComputedInputs<any> }

type FieldPublisher = (opts?: FieldPublisherConfig) => PublisherMethods // Fluent API
type PublisherMethods = Record<string, FieldPublisher>
type PublisherConfigData = {
  field: DmmfTypes.SchemaField
  givenConfig?: FieldPublisherConfig
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
 * For Photon's part, it will never return null for list type fields nor will it
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

type PhotonFetcher = (ctx: Nexus.core.GetGen<'context'>) => any

export interface Options {
  // TODO return type should be Photon
  /**
   * nexus-prisma will call this to get a reference to an instance of Photon.
   * The function is passed the context object. Typically a Photon instance will
   * be available on the context to support your custom resolvers. Therefore the
   * default getter returns `ctx.photon`.
   */
  photon?: PhotonFetcher
  /**
   * Same purpose as for that used in `Nexus.makeSchema`. Follows the same rules
   * and permits the same environment variables. This configuration will completely
   * go away once Nexus has typeGen plugin support.
   */
  shouldGenerateArtifacts?: boolean
  inputs?: {
    /**
     * Where can nexus-prisma find the Photon.js package? By default looks in
     * `node_modules/@prisma/photon`. This is needed because nexus-prisma
     * gets your Prisma schema AST and Photon.js crud info from the generated
     * Photon.js package.
     */
    photon?: string
  }
  outputs?: {
    /**
     * Where should nexus-prisma put its typegen on disk? By default matches the
     * default approach of Nexus typegen which is to emit into `node_modules/@types`.
     * This configuration will completely go away once Nexus has typeGen plugin
     * support.
     */
    typegen?: string
  }
  computedInputs?: GlobalComputedInputs
}

export interface InternalOptions extends Options {
  dmmf?: DmmfDocument // For testing
  nexusBuilder: Nexus.PluginBuilderLens
  onUnknownFieldName?: OnUnknownFieldName // For pumpkins
  onUnknownFieldType?: OnUnknownFieldType // For pumpkins
  onUnknownArgName?: OnUnknownArgName
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

// Note Default should be updated once resolved:
// https://github.com/prisma/photonjs/issues/88
let defaultPhotonPath: string
if (process.env.NEXUS_PRISMA_PHOTON_PATH) {
  defaultPhotonPath = process.env.NEXUS_PRISMA_PHOTON_PATH
} else if (process.env.NEXUS_PRISMA_LINK) {
  defaultPhotonPath = path.join(process.cwd(), '/node_modules/@prisma/photon')
} else {
  defaultPhotonPath = '@prisma/photon'
}

// NOTE This will be repalced by Nexus plugins once typegen integration is available.
const shouldGenerateArtifacts =
  process.env.NEXUS_SHOULD_GENERATE_ARTIFACTS === 'true'
    ? true
    : process.env.NEXUS_SHOULD_GENERATE_ARTIFACTS === 'false'
    ? false
    : Boolean(!process.env.NODE_ENV || process.env.NODE_ENV === 'development')

const defaultOptions = {
  shouldGenerateArtifacts,
  photon: (ctx: any) => ctx.photon,
  inputs: {
    photon: defaultPhotonPath,
  },
  outputs: {
    typegen: defaultTypegenPath,
  },
}

export interface CustomInputArg {
  arg: DmmfTypes.SchemaArg
  type: DmmfTypes.InputType | DmmfTypes.Enum | { name: string } // scalar
}

export class SchemaBuilder {
  readonly dmmf: DmmfDocument
  argsNamingStrategy: ArgsNamingStrategy
  fieldNamingStrategy: FieldNamingStrategy
  getPhoton: PhotonFetcher
  publisher: Publisher
  globallyComputedInputs: GlobalComputedInputs

  constructor(public options: InternalOptions) {
    const config = {
      ...defaultOptions,
      ...options,
      inputs: { ...defaultOptions.inputs, ...options.inputs },
      outputs: { ...defaultOptions.outputs, ...options.outputs },
    }
    // Internally rename the 'computedInputs' plugin option to clarify scope
    this.globallyComputedInputs = config.computedInputs
      ? config.computedInputs
      : {}
    this.dmmf =
      options.dmmf ||
      getTransformedDmmf(config.inputs.photon, {
        globallyComputedInputs: this.globallyComputedInputs,
      })
    this.publisher = new Publisher(this.dmmf, config.nexusBuilder)

    this.argsNamingStrategy = defaultArgsNamingStrategy
    this.fieldNamingStrategy = defaultFieldNamingStrategy

    this.getPhoton = (ctx: any) => {
      const photon = config.photon(ctx)
      assertPhotonInContext(photon)
      return photon
    }
    if (config.shouldGenerateArtifacts) {
      Typegen.generateSync({
        photonPath: config.inputs.photon,
        typegenPath: config.outputs.typegen,
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
  buildCRUD(): DynamicOutputPropertyDef<'crud'> {
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
            const fieldPublisher: FieldPublisher = givenConfig => {
              const inputType = this.dmmf.getInputType(
                mappedField.field.args[0].inputType.type,
              )
              const publisherConfig = this.buildPublisherConfig({
                field: mappedField.field,
                givenConfig: givenConfig ? givenConfig : {},
              })
              let fieldConfig = this.buildFieldConfig({
                field: mappedField.field,
                publisherConfig,
                typeName,
                operation: mappedField.operation,
                resolve: (root, args, ctx, info) => {
                  const photon = this.getPhoton(ctx)
                  if (
                    typeName === 'Mutation' &&
                    (!isEmptyObject(publisherConfig.locallyComputedInputs) ||
                      !isEmptyObject(this.globallyComputedInputs))
                  ) {
                    args = addComputedInputs({
                      inputType,
                      dmmf: this.dmmf,
                      params: {
                        info,
                        args,
                        ctx,
                      },
                      locallyComputedInputs:
                        publisherConfig.locallyComputedInputs,
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

              this.assertFilteringOrOrderingArgNameExists(
                typeName,
                mappedField.field.outputType.type,
                mappedField.field.name,
                publisherConfig,
                stage,
              )

              return crud
            }

            crud[mappedField.field.name] = fieldPublisher

            return crud
          },
          {} as PublisherMethods,
        )

        return proxify(
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
  buildModel() {
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
      factory: ({ typeDef, typeName, stage }) =>
        this.dmmf.hasModel(typeName)
          ? this.internalBuildModel(typeName, typeDef, stage)
          : (modelName: string) =>
              this.internalBuildModel(modelName, typeDef, stage),
    })
  }

  internalBuildModel(
    typeName: string,
    t: Nexus.core.OutputDefinitionBlock<any>,
    stage: Nexus.core.OutputFactoryConfig<any>['stage'],
  ) {
    const model = this.dmmf.getModelOrThrow(typeName)
    const outputType = this.dmmf.getOutputType(model.name)

    const publishers = outputType.fields.reduce((acc, field) => {
      const fieldPublisher: FieldPublisher = givenConfig => {
        const publisherConfig = this.buildPublisherConfig({
          field,
          givenConfig: givenConfig ?? {},
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

    return proxify(publishers, typeName, stage, this.options.onUnknownFieldName)
  }

  buildPublisherConfig({
    field,
    givenConfig: { computedInputs, ...otherConfig },
  }: Required<PublisherConfigData>): ResolvedFieldPublisherConfig {
    return {
      pagination: true,
      type: field.outputType.type,
      alias: field.name,
      locallyComputedInputs: computedInputs ? computedInputs : {},
      ...otherConfig,
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
        type: this.dmmf.getInputType(arg.inputType.type),
      }))
    } else {
      return this.argsFromQueryOrModelField(config)
    }
  }

  argsFromMutationField({
    publisherConfig,
    field,
  }: FieldConfigData): CustomInputArg[] {
    return field.args.map(arg => {
      const photonInputType = this.dmmf.getInputType(arg.inputType.type)
      /*
      Since globallyComputedInputs were already filtered during schema transformation,
      at this point we just need to filter at the resolver-level.
      */
      return {
        arg,
        type: {
          ...photonInputType,
          fields: publisherConfig.locallyComputedInputs
            ? photonInputType.fields.filter(
                field => !(field.name in publisherConfig.locallyComputedInputs),
              )
            : photonInputType.fields,
        },
      }
    })
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
  handleInputObjectCustomization(
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

  assertOutputTypeIsDefined(
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

    registerHook(
      this.options.onUnknownFieldType,
      [
        {
          unknownFieldType: outputType,
          typeName,
          fieldName,
          error: new Error(message),
        },
      ],
      message,
      stage,
    )

    return false
  }

  assertArgNameExists(
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

    registerHook(
      this.options.onUnknownArgName,
      [
        {
          unknownArgNames: wrongArgNames,
          typeName: prismaOutputTypeName,
          fieldName,
          error: new Error(message),
        },
      ],
      message,
      stage,
    )

    return { wrongArgNames }
  }

  /**
   * Assert arg name passed to `t.crud|model.field({ filtering|ordering: { argName: ... } })` is an arg that exists
   */
  assertFilteringOrOrderingArgNameExists(
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

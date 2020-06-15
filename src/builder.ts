import * as Nexus from '@nexus/schema'
import { DynamicOutputPropertyDef } from '@nexus/schema/dist/dynamicProperty'
import { defaultFieldResolver, GraphQLFieldResolver } from 'graphql'
import * as path from 'path'
import * as Constraints from './constraints'
import { addComputedInputs, DmmfDocument, DmmfTypes, getTransformedDmmf } from './dmmf'
import * as GraphQL from './graphql'
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
import { transformNullsToUndefined } from './null'
import paginationStrategies, { PaginationStrategy } from './pagination'
import { proxifyModelFunction, proxifyPublishers } from './proxifier'
import { Publisher } from './publisher'
import * as Typegen from './typegen'
import {
  assertPhotonInContext,
  GlobalComputedInputs,
  Index,
  indexBy,
  isEmptyObject,
  LocalComputedInputs,
  lowerFirst,
} from './utils'

interface FieldPublisherConfig {
  alias?: string
  type?: Nexus.core.AllOutputTypes
  pagination?: boolean | Record<string, boolean>
  filtering?: boolean | Record<string, boolean>
  ordering?: boolean | Record<string, boolean>
  computedInputs?: LocalComputedInputs<any>
  resolve?: (
    root: object,
    args: object,
    ctx: object,
    info: object,
    originalResolve: GraphQLFieldResolver<any, any, any>
  ) => Promise<any>
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
 * to represent the idea of null.
 *
 * For Prisma Client JS' part, it will never return null for list type fields nor will it
 * ever return null value list members.
 */
const dmmfListFieldTypeToNexus = (fieldType: DmmfTypes.SchemaField['outputType']) => {
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

export interface Options {
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
  inputs?: {
    /**
     * Where can nexus-prisma find the Prisma Client JS package? By default looks in
     * `node_modules/@prisma/client`. This is needed because nexus-prisma
     * gets your Prisma schema AST and Prisma Client JS crud info from the generated
     * Prisma Client JS package.
     */
    prismaClient?: string
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
  /**
   * Select the pagination strategy.
   *
   * 'prisma' strategy results in GraphQL pagination arguments mirroring those of Prisma: skip, cursor, take
   *
   * 'relay' strategy results in GraphQL pagination arguments matching those of the [GraphQL Relay specification](https://relay.dev/graphql/connections.htm): before, after, first, last.
   *
   * @default 'relay'
   */
  paginationStrategy?: 'relay' | 'prisma'
  /**
   * Enable experimental CRUD capabilities.
   * Add a `t.crud` method in your definition block to generate CRUD resolvers in your `Query` and `Mutation` GraphQL Object Type.
   *
   * @default false
   */
  experimentalCRUD?: boolean
  computedInputs?: GlobalComputedInputs
}

export interface InternalOptions extends Options {
  dmmf?: DmmfDocument // For testing
  nexusBuilder: Nexus.PluginBuilderLens
  onUnknownFieldName?: OnUnknownFieldName // For pumpkins
  onUnknownFieldType?: OnUnknownFieldType // For pumpkins
  onUnknownArgName?: OnUnknownArgName // For pumpkins
  onUnknownPrismaModelName?: OnUnknownPrismaModelName // For pumpkins
}

export function build(options: InternalOptions) {
  const builder = new SchemaBuilder(options)

  return {
    types: builder.build(),
    wasCrudUsedButDisabled() {
      return builder.wasCrudUsedButDisabled
    },
  }
}

// The @types default is based on the privileged given to such
// packages by TypeScript. For details refer to https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types
let defaultTypegenPath: string
if (process.env.NEXUS_PRISMA_TYPEGEN_PATH) {
  defaultTypegenPath = process.env.NEXUS_PRISMA_TYPEGEN_PATH
} else if (process.env.LINK) {
  defaultTypegenPath = path.join(process.cwd(), 'node_modules/@types/nexus-prisma-typegen/index.d.ts')
} else {
  defaultTypegenPath = path.join(__dirname, '../../@types/nexus-prisma-typegen/index.d.ts')
}

let defaultClientPath: string

if (process.env.NEXUS_PRISMA_CLIENT_PATH) {
  defaultClientPath = process.env.NEXUS_PRISMA_CLIENT_PATH
} else if (process.env.LINK) {
  defaultClientPath = path.join(process.cwd(), '/node_modules/@prisma/client')
} else {
  defaultClientPath = '@prisma/client'
}

// NOTE This will be replaced by Nexus plugins once typegen integration is available.
const shouldGenerateArtifacts =
  process.env.NEXUS_SHOULD_GENERATE_ARTIFACTS === 'true'
    ? true
    : process.env.NEXUS_SHOULD_GENERATE_ARTIFACTS === 'false'
    ? false
    : Boolean(!process.env.NODE_ENV || process.env.NODE_ENV === 'development')

const defaultOptions = {
  shouldGenerateArtifacts,
  prismaClient: (ctx: any) => ctx.prisma,
  paginationStrategy: 'relay' as const,
  inputs: {
    prismaClient: defaultClientPath,
  },
  outputs: {
    typegen: defaultTypegenPath,
  },
  computedInputs: {},
}

export interface CustomInputArg {
  arg: DmmfTypes.SchemaArg
  type: DmmfTypes.InputType | DmmfTypes.Enum | { name: string } // scalar
}

export class SchemaBuilder {
  readonly dmmf: DmmfDocument
  protected argsNamingStrategy: ArgsNamingStrategy
  protected fieldNamingStrategy: FieldNamingStrategy
  protected paginationStrategy: PaginationStrategy
  protected getPrismaClient: PrismaClientFetcher
  protected publisher: Publisher
  protected globallyComputedInputs: GlobalComputedInputs
  protected unknownFieldsByModel: Index<string[]>
  public wasCrudUsedButDisabled: boolean

  constructor(public options: InternalOptions) {
    const config = {
      ...defaultOptions,
      ...options,
      inputs: { ...defaultOptions.inputs, ...options.inputs },
      outputs: { ...defaultOptions.outputs, ...options.outputs },
    }
    // Internally rename the 'computedInputs' plugin option to clarify scope
    this.globallyComputedInputs = config.computedInputs ? config.computedInputs : {}
    this.paginationStrategy = paginationStrategies[config.paginationStrategy]
    this.dmmf =
      options.dmmf ||
      getTransformedDmmf(config.inputs.prismaClient, {
        globallyComputedInputs: this.globallyComputedInputs,
        paginationStrategy: this.paginationStrategy,
      })
    this.publisher = new Publisher(this.dmmf, config.nexusBuilder)
    this.unknownFieldsByModel = {}

    this.argsNamingStrategy = defaultArgsNamingStrategy
    this.fieldNamingStrategy = defaultFieldNamingStrategy
    this.wasCrudUsedButDisabled = false

    this.getPrismaClient = (ctx: any) => {
      const photon = config.prismaClient(ctx)
      assertPhotonInContext(photon)
      return photon
    }
    if (config.shouldGenerateArtifacts) {
      Typegen.generateSync({
        prismaClientPath: config.inputs.prismaClient,
        typegenPath: config.outputs.typegen,
        paginationStrategy: this.paginationStrategy,
      })
    }
  }

  /**
   * The build entrypoint, bringing together sub-builders.
   */
  build() {
    if (this.options.experimentalCRUD === true) {
      return [this.buildCRUD(), this.buildModel()]
    }

    return [this.buildModel(), this.buildDisabledCRUD()]
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
          throw new Error(`t.crud is not yet supported on the 'Subscription' type.`)
        }

        if (typeName !== GraphQL.rootNames.Query && typeName !== GraphQL.rootNames.Mutation) {
          throw new Error(
            `t.crud can only be used on GraphQL root types 'Query' & 'Mutation' but was used on '${typeName}'. Please use 't.model' instead`
          )
        }
        const publishers = getCrudMappedFields(typeName, this.dmmf).reduce((crud, mappedField) => {
          const fieldPublisher: FieldPublisher = (givenConfig) => {
            const inputType = this.dmmf.getInputType(mappedField.field.args[0].inputType.type)
            const publisherConfig = this.buildPublisherConfig({
              field: mappedField.field,
              givenConfig: givenConfig ? givenConfig : {},
            })
            const schemaArgsIndex = indexBy(mappedField.field.args, 'name')

            const originalResolve: GraphQLFieldResolver<any, any, any> = (_root, args, ctx, info) => {
              const photon = this.getPrismaClient(ctx)
              if (
                typeName === 'Mutation' &&
                (!isEmptyObject(publisherConfig.locallyComputedInputs) ||
                  !isEmptyObject(this.globallyComputedInputs))
              ) {
                args = transformNullsToUndefined(args, schemaArgsIndex, this.dmmf)
                args = addComputedInputs({
                  inputType,
                  dmmf: this.dmmf,
                  params: {
                    info,
                    args,
                    ctx,
                  },
                  locallyComputedInputs: publisherConfig.locallyComputedInputs,
                })
              }

              args = this.paginationStrategy.resolve(args)

              return photon[mappedField.photonAccessor][mappedField.operation](args)
            }

            const fieldConfig = this.buildFieldConfig({
              field: mappedField.field,
              publisherConfig,
              typeName,
              operation: mappedField.operation,
              resolve: (root, args, ctx, info) => {
                return givenConfig?.resolve
                  ? givenConfig.resolve(root, args, ctx, info, originalResolve)
                  : originalResolve(root, args, ctx, info)
              },
            })

            if (
              this.assertOutputTypeIsDefined(typeName, mappedField.field.name, publisherConfig.type, stage)
            ) {
              t.field(publisherConfig.alias, fieldConfig)
            }

            this.assertFilteringOrOrderingArgNameExists(
              typeName,
              mappedField.field.outputType.type,
              mappedField.field.name,
              publisherConfig,
              stage
            )

            return crud
          }

          crud[mappedField.field.name] = fieldPublisher

          return crud
        }, {} as PublisherMethods)

        return proxifyPublishers(publishers, typeName, stage, this.options.onUnknownFieldName)
      },
    })
  }

  protected buildDisabledCRUD(): DynamicOutputPropertyDef<'crud'> {
    return Nexus.dynamicOutputProperty({
      name: 'crud',
      factory: () => {
        this.wasCrudUsedButDisabled = true
        return new Proxy(
          {},
          {
            get() {
              return () => {}
            },
          }
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
          const accessor = (modelName: string) => this.internalBuildModel(modelName, typeDef, stage)

          return proxifyModelFunction(
            accessor,
            typeName,
            stage,
            this.options.onUnknownPrismaModelName,
            this.unknownFieldsByModel
          )
        }
      },
    })
  }

  protected internalBuildModel(
    typeName: string,
    t: Nexus.core.OutputDefinitionBlock<any>,
    stage: Nexus.core.OutputFactoryConfig<any>['stage']
  ) {
    const model = this.dmmf.getModelOrThrow(typeName)
    const outputType = this.dmmf.getOutputType(model.name)

    const publishers = outputType.fields.reduce((acc, field) => {
      const fieldPublisher: FieldPublisher = (givenConfig) => {
        const publisherConfig = this.buildPublisherConfig({
          field,
          givenConfig: givenConfig ?? {},
        })
        if (!this.assertOutputTypeIsDefined(typeName, publisherConfig.alias, publisherConfig.type, stage)) {
          return acc
        }
        this.assertFilteringOrOrderingArgNameExists(
          typeName,
          field.outputType.type,
          publisherConfig.alias,
          publisherConfig,
          stage
        )
        const mapping = this.dmmf.getMapping(typeName)
        const uniqueIdentifiers = Constraints.resolveUniqueIdentifiers(typeName, this.dmmf)
        const schemaArgsIndex = indexBy(field.args, 'name')

        const originalResolve: GraphQLFieldResolver<any, any, any> | undefined =
          field.outputType.kind === 'object'
            ? (root, args, ctx) => {
                const missingIdentifiers = Constraints.findMissingUniqueIdentifiers(root, uniqueIdentifiers)

                if (missingIdentifiers !== null) {
                  throw new Error(
                    `Resolver ${typeName}.${
                      publisherConfig.alias
                    } is missing the following unique identifiers: ${missingIdentifiers.join(', ')}`
                  )
                }

                const photon = this.getPrismaClient(ctx)

                args = transformNullsToUndefined(args, schemaArgsIndex, this.dmmf)
                args = this.paginationStrategy.resolve(args)

                return photon[lowerFirst(mapping.model)]
                  .findOne({
                    where: Constraints.buildWhereUniqueInput(root, uniqueIdentifiers),
                  })
                  [field.name](args)
              }
            : publisherConfig.alias != field.name
            ? (root) => root[field.name]
            : undefined

        const fieldConfig = this.buildFieldConfig({
          field,
          publisherConfig,
          typeName,
          resolve: givenConfig?.resolve
            ? (root, args, ctx, info) => {
                return givenConfig.resolve!(root, args, ctx, info, originalResolve ?? defaultFieldResolver)
              }
            : originalResolve,
        })

        t.field(publisherConfig.alias, fieldConfig)

        return publishers
      }

      acc[field.name] = fieldPublisher
      return acc
    }, {} as PublisherMethods)

    return proxifyPublishers(publishers, typeName, stage, this.options.onUnknownFieldName)
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

  buildFieldConfig(config: FieldConfigData): Nexus.core.NexusOutputFieldConfig<any, string> {
    const {
      alias,
      locallyComputedInputs,
      type,
      filtering,
      ordering,
      pagination,
      ...additionalExternalPropsSuchAsPlugins
    } = config.publisherConfig

    return {
      ...additionalExternalPropsSuchAsPlugins,
      type: this.publisher.outputType(config.publisherConfig.type, config.field),
      ...dmmfListFieldTypeToNexus(config.field.outputType),
      args: this.buildArgsFromField(config),
      resolve: config.resolve,
    }
  }

  buildArgsFromField(config: FieldConfigData): Nexus.core.ArgsRecord {
    return this.determineArgs(config).reduce(
      (acc, customArg) => ({
        ...acc,
        [customArg.arg.name]: this.publisher.inputType(customArg) as any,
      }),
      {} as Nexus.core.ArgsRecord
    )
  }

  determineArgs(config: FieldConfigData): CustomInputArg[] {
    if (config.typeName === 'Mutation') {
      return this.argsFromMutationField(config)
    } else if (config.operation === 'findOne') {
      return config.field.args.map((arg) => ({
        arg,
        type: this.dmmf.getInputType(arg.inputType.type),
      }))
    } else {
      return this.argsFromQueryOrModelField(config)
    }
  }

  argsFromMutationField({ publisherConfig, field }: FieldConfigData): CustomInputArg[] {
    return field.args.map((arg) => {
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
            ? photonInputType.fields.filter((field) => !(field.name in publisherConfig.locallyComputedInputs))
            : photonInputType.fields,
        },
      }
    })
  }

  protected argsFromQueryOrModelField({ typeName, field, publisherConfig }: FieldConfigData) {
    let args: CustomInputArg[] = []

    if (publisherConfig.filtering) {
      const inputObjectTypeDefName = `${field.outputType.type}WhereInput`
      const whereArg = field.args.find(
        (arg) => arg.inputType.type === inputObjectTypeDefName && arg.name === 'where'
      )

      if (!whereArg) {
        throw new Error(`Could not find filtering argument for ${typeName}.${field.name}`)
      }

      const inputType = this.handleInputObjectCustomization(
        publisherConfig.filtering,
        inputObjectTypeDefName,
        field.name,
        typeName
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
        (arg) => arg.inputType.type === orderByTypeName && arg.name === 'orderBy'
      )

      if (!orderByArg) {
        throw new Error(`Could not find ordering argument for ${typeName}.${field.name}`)
      }

      const inputType = this.handleInputObjectCustomization(
        publisherConfig.ordering,
        orderByTypeName,
        field.name,
        typeName
      )

      if (inputType.fields.length > 0) {
        args.push({
          arg: orderByArg,
          type: inputType,
        })
      }
    }

    if (publisherConfig.pagination) {
      const paginationsArgs =
        publisherConfig.pagination === true
          ? field.args.filter((a) => this.paginationStrategy.paginationArgNames.includes(a.name))
          : field.args.filter((arg) => (publisherConfig.pagination as any)[arg.name] === true)

      args.push(
        ...paginationsArgs.map((a) => {
          if (a.inputType.kind === 'scalar' || a.inputType.kind === 'enum') {
            return {
              arg: a,
              type: { name: a.inputType.type },
            }
          } else {
            return {
              arg: a,
              type: this.dmmf.inputTypesIndex[a.inputType.type],
            }
          }
        })
      )
    }

    return args
  }

  /**
   * This handles "tailored field feature publishing".
   *
   * With tailored field feature publishing, users can specify that only some
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
    graphQLTypeName: string
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
    const userExposedObjectFields = photonObject.fields.filter((field) =>
      whitelistedFieldNames.includes(field.name)
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
    stage: 'walk' | 'build'
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
      stage
    )

    return false
  }

  protected assertArgNameExists(
    parentTypeName: string,
    prismaOutputTypeName: string,
    fieldName: string,
    config: FieldPublisherConfig,
    stage: 'build' | 'walk',
    configProperty: 'filtering' | 'ordering'
  ): { wrongArgNames: string[] } | true {
    if (!config[configProperty] || config[configProperty] === true) {
      return true
    }

    const argNames = Object.keys(config[configProperty] as Record<string, boolean>)
    const typeNameFieldNames = this.dmmf.getModelOrThrow(prismaOutputTypeName).fields.map((f) => f.name)
    const wrongArgNames = argNames.filter(
      (filteringFieldName) => !typeNameFieldNames.includes(filteringFieldName)
    )

    if (wrongArgNames.length === 0) {
      return true
    }

    const actionWord = configProperty === 'filtering' ? 'filter' : 'order'
    const renderMessage = (argName: string) =>
      `Your GraphQL \`${parentTypeName}\` object definition is projecting a relational field \`${fieldName}\`. On it, you are declaring that clients be able to ${actionWord} by Prisma \`${prismaOutputTypeName}\` model field \`${argName}\`. However, your Prisma model \`${prismaOutputTypeName}\` model has no such field \`${argName}\``

    const message = wrongArgNames.map((argName) => renderMessage(argName)).join('\n')

    raiseErrorOrTriggerHook(
      this.options.onUnknownArgName,
      {
        unknownArgNames: wrongArgNames,
        typeName: prismaOutputTypeName,
        fieldName,
        error: new Error(message),
      },
      message,
      stage
    )

    return { wrongArgNames }
  }

  protected assertFilteringOrOrderingArgNameExists(
    parentTypeName: string,
    prismaOutputTypeName: string,
    fieldName: string,
    config: FieldPublisherConfig,
    stage: 'build' | 'walk'
  ): void {
    this.assertArgNameExists(parentTypeName, prismaOutputTypeName, fieldName, config, stage, 'filtering')
    this.assertArgNameExists(parentTypeName, prismaOutputTypeName, fieldName, config, stage, 'ordering')
  }
}

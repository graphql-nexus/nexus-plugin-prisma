import * as Nexus from 'nexus'
import { DynamicOutputPropertyDef } from 'nexus/dist/dynamicProperty'
import * as path from 'path'
import * as DMMF from './dmmf'
import * as GraphQL from './graphql'
import { getCrudMappedFields } from './mapping'
import {
  ArgsNamingStrategy,
  defaultArgsNamingStrategy,
  defaultFieldNamingStrategy,
  FieldNamingStrategy,
  OperationName,
} from './naming-strategies'
import { Publisher } from './publisher'
import * as Typegen from './typegen'
import { assertPhotonInContext } from './utils'

export type ContextArgs = Record<string, (ctx: any) => any>

interface FieldPublisherConfig {
  alias?: string
  type?: Nexus.core.AllOutputTypes
  pagination?: boolean | Record<string, boolean>
  filtering?: boolean | Record<string, boolean>
  ordering?: boolean | Record<string, boolean>
  contextArgs?: ContextArgs
}

type WithRequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
// Config options that are populated with defaults will not be undefined
type ResolvedFieldPublisherConfig = WithRequiredKeys<
  FieldPublisherConfig,
  'alias' | 'type'
>

type FieldPublisher = (opts?: FieldPublisherConfig) => PublisherMethods // Fluent API
type PublisherMethods = Record<string, FieldPublisher>
type BuildPublisherConfigArgs = {
  field: DMMF.Data.SchemaField
  givenConfig: FieldPublisherConfig | undefined
}
type BuildFieldConfigArgs = {
  field: DMMF.Data.SchemaField
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
  fieldType: DMMF.Data.SchemaField['outputType'],
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
     * `node_modules/@generated/photon`. This is needed because nexus-prisma
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
}

export interface InternalOptions extends Options {
  dmmf?: DMMF.DMMF // For testing
  nexusBuilder: Nexus.PluginBuilderLens
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
  defaultPhotonPath = path.join(
    process.cwd(),
    '/node_modules/@generated/photon',
  )
} else {
  defaultPhotonPath = '@generated/photon'
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
  arg: DMMF.Data.SchemaArg
  type: DMMF.Data.InputType | DMMF.Data.Enum | { name: string } // scalar
}

export class SchemaBuilder {
  readonly dmmf: DMMF.DMMF
  argsNamingStrategy: ArgsNamingStrategy
  fieldNamingStrategy: FieldNamingStrategy
  getPhoton: PhotonFetcher
  publisher: Publisher

  constructor(public options: InternalOptions) {
    const config = {
      ...defaultOptions,
      ...options,
      inputs: { ...defaultOptions.inputs, ...options.inputs },
      outputs: { ...defaultOptions.outputs, ...options.outputs },
    }
    this.dmmf = options.dmmf || DMMF.get(config.inputs.photon)
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
      factory: ({ typeDef: t, typeName }) => {
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
        return getCrudMappedFields(typeName, this.dmmf).reduce<
          PublisherMethods
        >((crud, mappedField) => {
          const fieldPublisher: FieldPublisher = givenConfig => {
            const publisherConfig = this.buildPublisherConfig({
              field: mappedField.field,
              givenConfig,
            })
            const fieldConfig = this.buildFieldConfig({
              field: mappedField.field,
              publisherConfig,
              typeName,
              operation: mappedField.operation,
              resolve: (parent, args, ctx) => {
                const photon = this.getPhoton(ctx)
                return photon[mappedField.photonAccessor][
                  mappedField.operation
                ](args)
              },
            })
            t.field(publisherConfig.alias, fieldConfig)

            return crud
          }

          crud[mappedField.field.name] = fieldPublisher

          return crud
        }, {})
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
      factory: ({ typeDef, typeName }) =>
        this.dmmf.hasModel(typeName)
          ? this.internalBuildModel(typeName, typeDef)
          : (modelName: string) => this.internalBuildModel(modelName, typeDef),
    })
  }

  internalBuildModel(
    typeName: string,
    t: Nexus.core.OutputDefinitionBlock<any>,
  ) {
    const model = this.dmmf.getModelOrThrow(typeName)
    const outputType = this.dmmf.getOutputType(model.name)

    const publishers = outputType.fields.reduce<PublisherMethods>(
      (acc, field) => {
        const fieldPublisher: FieldPublisher = givenConfig => {
          const publisherConfig = this.buildPublisherConfig({
            field,
            givenConfig,
          })
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
      },
      {},
    )

    return publishers
  }

  buildPublisherConfig({
    field,
    givenConfig,
  }: BuildPublisherConfigArgs): ResolvedFieldPublisherConfig {
    return {
      pagination: true,
      type: field.outputType.type,
      alias: field.name,
      ...givenConfig,
    }
  }

  buildFieldConfig({
    field,
    publisherConfig,
    typeName,
    operation = null,
    resolve,
  }: BuildFieldConfigArgs): Nexus.core.NexusOutputFieldConfig<any, string> {
    return {
      type: this.publisher.outputType(publisherConfig.type, field),
      ...dmmfListFieldTypeToNexus(field.outputType),
      args: this.buildArgsFromField(
        typeName,
        operation,
        field,
        publisherConfig,
      ),
      resolve,
    }
  }

  buildArgsFromField(
    typeName: string,
    operationName: OperationName | null,
    field: DMMF.Data.SchemaField,
    publisherConfig: ResolvedFieldPublisherConfig,
  ): Nexus.core.ArgsRecord {
    let args: CustomInputArg[]

    if (typeName === 'Mutation' || operationName === 'findOne') {
      args = field.args.map(arg => {
        return {
          arg,
          type: this.dmmf.getInputType(arg.inputType.type),
        }
      })
    } else {
      args = this.argsFromQueryOrModelField(typeName, field, publisherConfig)
    }

    return args.reduce<Nexus.core.ArgsRecord>(
      (acc, customArg) => ({
        ...acc,
        [customArg.arg.name]: this.publisher.inputType(
          this.filterContextArgs(customArg, publisherConfig),
        ) as any, //FIX ME,
      }),
      {},
    )
  }

  filterContextArgs(
    { arg, type }: CustomInputArg,
    publisherConfig: ResolvedFieldPublisherConfig,
  ) {
    if (!publisherConfig.contextArgs) {
      return { arg, type }
    }
    const photonObject = this.dmmf.getInputType(arg.inputType.type)
    return {
      arg,
      type: {
        ...photonObject,
        name: arg.inputType.type,
        fields: photonObject.fields.filter(
          field => !(field.name in publisherConfig.contextArgs!),
        ),
      },
    }
  }

  argsFromQueryOrModelField(
    typeName: string,
    dmmfField: DMMF.Data.SchemaField,
    publisherConfig: ResolvedFieldPublisherConfig,
  ) {
    let args: CustomInputArg[] = []

    if (publisherConfig.filtering) {
      const inputObjectTypeDefName = `${dmmfField.outputType.type}WhereInput`
      const whereArg = dmmfField.args.find(
        arg =>
          arg.inputType.type === inputObjectTypeDefName && arg.name === 'where',
      )

      if (!whereArg) {
        throw new Error(
          `Could not find filtering argument for ${typeName}.${dmmfField.name}`,
        )
      }

      args.push({
        arg: whereArg,
        type: this.handleInputObjectCustomization(
          publisherConfig.filtering,
          inputObjectTypeDefName,
          dmmfField.name,
          typeName,
        ),
      })
    }

    if (publisherConfig.ordering) {
      const orderByTypeName = `${dmmfField.outputType.type}OrderByInput`
      const orderByArg = dmmfField.args.find(
        arg => arg.inputType.type === orderByTypeName && arg.name === 'orderBy',
      )

      if (!orderByArg) {
        throw new Error(
          `Could not find ordering argument for ${typeName}.${dmmfField.name}`,
        )
      }

      args.push({
        arg: orderByArg,
        type: this.handleInputObjectCustomization(
          publisherConfig.ordering,
          orderByTypeName,
          dmmfField.name,
          typeName,
        ),
      })
    }

    if (publisherConfig.pagination) {
      const paginationKeys = ['first', 'last', 'before', 'after', 'skip']
      const paginationsArgs =
        publisherConfig.pagination === true
          ? dmmfField.args.filter(a => paginationKeys.includes(a.name))
          : dmmfField.args.filter(
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
  ): DMMF.Data.InputType {
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
}

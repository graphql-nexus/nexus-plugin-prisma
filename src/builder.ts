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
} from './naming-strategies'
import { Publisher } from './publisher'
import * as Typegen from './typegen'
import { assertPhotonInContext } from './utils'

interface FieldPublisherConfig {
  alias?: string
  type?: Nexus.core.AllOutputTypes
  pagination?: boolean | Record<string, boolean>
  filtering?: boolean | Record<string, boolean>
  ordering?: boolean | Record<string, boolean>
}

type FieldPublisher = (opts?: FieldPublisherConfig) => PublisherMethods // Fluent API
type PublisherMethods = Record<string, FieldPublisher>

export interface Options {
  photon?: (ctx: Nexus.core.GetGen<'context'>) => any
  shouldGenerateArtifacts?: boolean
  inputs?: {
    photon?: string
  }
  outputs?: {
    typegen?: string
  }
}

export interface InternalOptions extends Options {
  dmmf?: DMMF.DMMF // For testing
  types: any // FIXME `any`
}

/**
 * Create nexus type definitions and resolvers particular to your prisma
 * schema that extend the Nexus DSL with e.g. t.model and t.crud. Example
 * effect in practice:
 *
 *    objectType({
 *      name: 'User',
 *      definition(t) {
 *        t.model.id()
 *        t.model.email()
 *      }
 *    })
 *
 *    queryType({
 *      definition (t) {
 *        t.crud.user()
 *        t.crud.users({ filtering: true, ordering: true })
 *      }
 *    })
 *
 * You must ensure the photon client has been generated prior as
 * it provides a data representation of the available models and CRUD
 * operations against them.
 *
 * Typically you will forward the type defs returned
 * here to Nexus' makeSchema function.
 *
 * Additionally, typegen will be run synchronously upon construction by default
 * if NODE_ENV is undefined or "development". Typegen can be explicitly enabled or
 * disabled via the shouldGenerateArtifacts option. This mirrors Nexus'
 * own typegen approach. This system will change once Nexus Plugins are
 * released.
 */
export function build(options: InternalOptions) {
  const builder = new SchemaBuilder(options)
  return builder.build()
}

const defaultOptions = {
  shouldGenerateArtifacts: Boolean(
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
  ),
  photon: (ctx: any) => ctx.photon,
  inputs: {
    // TODO Default should be updated once resolved:
    // https://github.com/prisma/photonjs/issues/88
    photon: '@generated/photon',
  },
  outputs: {
    // This default is based on the priviledge given to @types
    // packages by TypeScript. For details refer to https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types
    typegen: path.join(
      __dirname,
      '../../@types/__nexus-typegen__nexus-prisma/index.d.ts',
    ),
  },
}

export interface CustomInputArg {
  arg: DMMF.Data.SchemaArg
  type: DMMF.Data.InputType | DMMF.Data.Enum | { name: string } // scalar
}

export class SchemaBuilder {
  protected readonly dmmf: DMMF.DMMF
  protected argsNamingStrategy: ArgsNamingStrategy
  protected fieldNamingStrategy: FieldNamingStrategy
  protected getPhoton: any
  protected publisher: Publisher

  constructor(protected options: InternalOptions) {
    const config = {
      ...defaultOptions,
      ...options,
      inputs: { ...defaultOptions.inputs, ...options.inputs },
      outputs: { ...defaultOptions.outputs, ...options.outputs },
    }
    this.dmmf = options.dmmf || DMMF.get(config.inputs.photon)
    this.publisher = new Publisher(this.dmmf, config.types)

    this.argsNamingStrategy = defaultArgsNamingStrategy
    this.fieldNamingStrategy = defaultFieldNamingStrategy
    this.getPhoton = config.photon
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
  protected buildCRUD(): DynamicOutputPropertyDef<'crud'> {
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
            const resolvedConfig: FieldPublisherConfig = {
              pagination: true,
              type: mappedField.field.outputType.type,
              ...givenConfig,
            }
            const gqlFieldName = resolvedConfig.alias || mappedField.field.name

            t.field(gqlFieldName, {
              type: this.publisher.outputType(
                resolvedConfig.type!,
                mappedField.field,
              ),
              list: mappedField.field.outputType.isList || undefined,
              nullable: !mappedField.field.outputType.isRequired,
              args: this.buildArgsFromField(
                typeName,
                mappedField.operation,
                mappedField.field,
                resolvedConfig,
              ),
              resolve: (_parent, args, ctx) => {
                const photon = this.getPhoton(ctx)
                assertPhotonInContext(photon)
                return photon[mappedField.photonAccessor][
                  mappedField.operation
                ](args)
              },
            })

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
      factory: ({ typeDef, typeName }) =>
        this.dmmf.hasModel(typeName)
          ? this.internalBuildModel(typeName, typeDef)
          : (modelName: string) => this.internalBuildModel(modelName, typeDef),
    })
  }

  protected internalBuildModel(
    typeName: string,
    t: Nexus.core.OutputDefinitionBlock<any>,
  ) {
    const model = this.dmmf.getModelOrThrow(typeName)
    const outputType = this.dmmf.getOutputType(model.name)

    const publishers = outputType.fields.reduce<PublisherMethods>(
      (acc, field) => {
        const fieldPublisher: FieldPublisher = givenConfig => {
          const resolvedConfig: FieldPublisherConfig = {
            pagination: true,
            type: field.outputType.type,
            ...givenConfig,
          }
          const fieldName = resolvedConfig.alias || field.name
          const type = resolvedConfig.type || field.outputType.type
          const fieldOpts: Nexus.core.NexusOutputFieldConfig<any, string> = {
            type: this.publisher.outputType(type, field),
            list: field.outputType.isList || undefined,
            nullable: !field.outputType.isRequired,
            args: this.buildArgsFromField(
              typeName,
              null,
              field,
              resolvedConfig,
            ),
          }
          // Rely on default resolvers for scalars and enums
          if (field.outputType.kind === 'object') {
            const mapping = this.dmmf.getMapping(typeName)

            fieldOpts.resolve = (root, args, ctx) => {
              const photon = this.getPhoton(ctx)

              assertPhotonInContext(photon)

              return photon[mapping.plural!]
                ['findOne']({ where: { id: root.id } })
                [field.name](args)
            }
          }

          t.field(fieldName, fieldOpts)

          return publishers
        }

        acc[field.name] = fieldPublisher
        return acc
      },
      {},
    )

    return publishers
  }

  protected buildArgsFromField(
    typeName: string,
    operationName: keyof DMMF.Data.Mapping | null,
    field: DMMF.Data.SchemaField,
    resolvedConfig: FieldPublisherConfig,
  ): Nexus.core.ArgsRecord {
    let args: CustomInputArg[] = []

    if (typeName === 'Mutation' || operationName === 'findOne') {
      args = field.args.map(arg => ({
        arg,
        type: this.dmmf.getInputType(arg.inputType.type),
      }))
    } else {
      args = this.argsFromQueryOrModelField(typeName, field, resolvedConfig)
    }

    return args.reduce<Nexus.core.ArgsRecord>((acc, customArg) => {
      acc[customArg.arg.name] = this.publisher.inputType(customArg) as any //FIXME

      return acc
    }, {})
  }

  protected argsFromQueryOrModelField(
    typeName: string,
    dmmfField: DMMF.Data.SchemaField,
    resolvedConfig: FieldPublisherConfig,
  ) {
    let args: CustomInputArg[] = []

    if (resolvedConfig.filtering) {
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
          resolvedConfig.filtering,
          inputObjectTypeDefName,
          dmmfField.name,
          typeName,
        ),
      })
    }

    if (resolvedConfig.ordering) {
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
          resolvedConfig.ordering,
          orderByTypeName,
          dmmfField.name,
          typeName,
        ),
      })
    }

    if (resolvedConfig.pagination) {
      const paginationKeys = ['first', 'last', 'before', 'after', 'skip']
      const paginationsArgs =
        resolvedConfig.pagination === true
          ? dmmfField.args.filter(a => paginationKeys.includes(a.name))
          : dmmfField.args.filter(
              arg => (resolvedConfig.pagination as any)[arg.name] === true,
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
   * With tailord field feature publishing, users can specify that only
   * some fields of the PSL model are exposed under the given field feature.
   * For example, in the following...
   *
   *    t.model.friends({ filtering: { firstName: true, location: true } })

   * ...the field feature is "filtering" and the user has tailored it so
   * that only "firstName" and "location" of the field's type (e.g. "User")
   * are exposed to filtering on this field. So the resulting GQL TypeDef
   * would look something like:
   *
   *    ...
   *   friends(where: { firstName: ..., location: ..., }): [User]
   *   ...
   *
   */
  protected handleInputObjectCustomization(
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

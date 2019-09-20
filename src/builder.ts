import * as path from 'path'
import * as Nexus from 'nexus'
import { DynamicOutputPropertyDef } from 'nexus/dist/dynamicProperty'
import * as DMMF from './dmmf'
import * as Typegen from './typegen'
import * as GraphQL from './graphql'
import {
  assertPhotonInContext,
  flatMap,
  getCRUDFieldName,
  nexusOpts as nexusFieldOpts,
  partition,
} from './utils'
import {
  defaultArgsNamingStrategy,
  defaultFieldNamingStrategy,
  ArgsNamingStrategy,
  FieldNamingStrategy,
} from './naming-strategies'
import { dateTimeScalar, uuidScalar } from './scalars'
import { getSupportedMutations, getSupportedQueries } from './supported-ops'

interface FieldPublisherConfig {
  alias?: string
  type?: Nexus.core.AllOutputTypes
  pagination?: boolean | Record<string, boolean>
  filtering?: boolean | Record<string, boolean>
  ordering?: boolean | Record<string, boolean>
}

const stripInputSuffix = (
  dmmf: DMMF.External.InputType,
): DMMF.External.InputType => {
  return {
    ...dmmf,
    name: dmmf.name.replace(/Input$/, ''),
  }
}

export interface Options {
  photon?: (ctx: any) => any
  shouldGenerateArtifacts?: boolean
  inputs?: {
    photon?: string
  }
  outputs?: {
    typegen?: string
  }
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
export function build(options: Options = {}) {
  const builder = new Builder(options)
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
    // This default is based on the privledge given to @types
    // packages by TypeScript. For details refer to https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types
    typegen: path.join(
      __dirname,
      '../../@types/__nexus-typegen__nexus-prisma/index.d.ts',
    ),
  },
}

interface CustomInputArg {
  arg: DMMF.External.SchemaArg
  type: DMMF.External.InputType | DMMF.External.Enum | 'scalar'
}

export class Builder {
  protected readonly dmmf: DMMF.DMMF
  protected visitedInputTypesMap: Record<string, boolean>
  protected argsNamingStrategy: ArgsNamingStrategy
  protected fieldNamingStrategy: FieldNamingStrategy
  protected getPhoton: any

  constructor(protected options: Options) {
    const config = {
      ...defaultOptions,
      ...options,
      inputs: { ...defaultOptions.inputs, ...options.inputs },
      outputs: { ...defaultOptions.outputs, ...options.outputs },
    }
    this.dmmf = DMMF.get(config.inputs.photon)
    this.argsNamingStrategy = defaultArgsNamingStrategy
    this.fieldNamingStrategy = defaultFieldNamingStrategy
    this.visitedInputTypesMap = {}
    this.getPhoton = config.photon
    if (config.shouldGenerateArtifacts) {
      Typegen.generateSync({
        photonPath: config.inputs.photon,
        typegenPath: config.outputs.typegen,
      })
    }
  }

  build() {
    return [this.buildCRUD(), this.buildModel(), ...this.buildScalars()]
  }

  /**
   * Generate `t.crud` output property
   */
  protected buildCRUD(): DynamicOutputPropertyDef<'crud'> {
    return Nexus.dynamicOutputProperty({
      name: 'crud',
      typeDefinition: `: NexusPrisma<TypeName, 'crud'>`,
      // FIXME
      // Nexus should improve the type of typeName to be AllOutputTypes
      factory: ({ typeDef: t, typeName: gqlTypeName }) => {
        if (gqlTypeName === GraphQL.rootNames.Subscription) {
          // TODO Lets put a GitHub issue link in this error message
          throw new Error(
            `t.crud is not yet supported on the 'Subscription' type.`,
          )
        }

        if (
          gqlTypeName !== GraphQL.rootNames.Query &&
          gqlTypeName !== GraphQL.rootNames.Mutation
        ) {
          throw new Error(
            `t.crud can only be used on GraphQL root types 'Query' & 'Mutation' but was used on '${gqlTypeName}'. Please use 't.model' instead`,
          )
        }

        const mappedFields =
          gqlTypeName === 'Query'
            ? this.dmmf.mappings.map(mapping => {
                const queriesNames = getSupportedQueries(mapping)
                return {
                  fields: this.dmmf.queryType.fields.filter(query =>
                    queriesNames.includes(query.name),
                  ),
                  mapping,
                }
              })
            : gqlTypeName === 'Mutation'
            ? this.dmmf.mappings.map(mapping => {
                const mutationsNames = getSupportedMutations(mapping)
                return {
                  fields: this.dmmf.mutationType.fields.filter(mutation =>
                    mutationsNames.includes(mutation.name),
                  ),
                  mapping,
                }
              })
            : (undefined as never)

        type FieldPublisher = (opts?: FieldPublisherConfig) => CRUDMethods // Fluent API
        type CRUDMethods = Record<string, FieldPublisher>

        return mappedFields.reduce<CRUDMethods>((crud, mappedField) => {
          const prismaModelName = mappedField.mapping.model

          mappedField.fields.forEach(field => {
            const mappedFieldName = getCRUDFieldName(
              prismaModelName,
              field.name,
              mappedField.mapping,
              this.fieldNamingStrategy,
            )
            const fieldPublisher: FieldPublisher = givenConfig => {
              const resolvedConfig: FieldPublisherConfig = {
                pagination: true,
                type: field.outputType.type,
                ...givenConfig,
              }
              const gqlFieldName = resolvedConfig.alias
                ? resolvedConfig.alias
                : mappedFieldName
              const gqlType = resolvedConfig.type!
              const operationName = Object.keys(mappedField.mapping).find(
                key => (mappedField.mapping as any)[key] === field.name,
              ) as keyof DMMF.External.Mapping | undefined

              if (!operationName) {
                throw new Error(
                  `Could not find operation name for field ${field.name}`,
                )
              }

              t.field(gqlFieldName, {
                type: gqlType,
                list: field.outputType.isList || undefined,
                nullable: !field.outputType.isRequired,
                args: this.argsFromField(
                  prismaModelName,
                  gqlTypeName,
                  operationName,
                  field,
                  resolvedConfig,
                ),
                resolve: (_parent, args, ctx) => {
                  const photon = this.getPhoton(ctx)
                  assertPhotonInContext(photon)
                  return photon[mappedField.mapping.plural!][operationName](
                    args,
                  )
                },
              })

              return crud
            }
            crud[mappedFieldName] = fieldPublisher
          })

          return crud
        }, {})
      },
    })
  }

  /**
   * Generate `t.model` output method
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
          ? this.buildSchemaForPrismaModel(typeName, typeName, typeDef)
          : (modelName: string) =>
              this.buildSchemaForPrismaModel(modelName, modelName, typeDef),
    })
  }

  protected argsFromField(
    prismaModelName: string,
    graphQLTypeName: string,
    operationName: keyof DMMF.External.Mapping | null,
    field: DMMF.External.SchemaField,
    opts: FieldPublisherConfig,
  ) {
    let args: CustomInputArg[] = []

    if (graphQLTypeName === 'Mutation' || operationName === 'findOne') {
      args = field.args.map(arg => ({
        arg,
        type: stripInputSuffix(this.dmmf.getInputType(arg.inputType.type)),
      }))
    } else {
      args = this.argsFromQueryOrModelField(
        prismaModelName,
        graphQLTypeName,
        field,
        opts,
      )
    }

    return this.dmmfArgsToNexusArgs(args)
  }

  protected argsFromQueryOrModelField(
    prismaModelName: string,
    graphQLTypeName: string,
    dmmfField: DMMF.External.SchemaField,
    opts: FieldPublisherConfig,
  ) {
    let args: CustomInputArg[] = []

    if (opts.filtering) {
      const inputObjectTypeDefName = `${dmmfField.outputType.type}Where`
      const whereArg = dmmfField.args.find(
        arg =>
          arg.inputType.type === inputObjectTypeDefName + 'Input' &&
          arg.name === 'where',
      )

      if (!whereArg) {
        throw new Error(
          `Could not find filtering argument for ${prismaModelName}.${dmmfField.name}`,
        )
      }

      args.push({
        arg: whereArg,
        type: this.handleInputObjectCustomization(
          opts.filtering,
          inputObjectTypeDefName,
          dmmfField.name,
          graphQLTypeName,
        ),
      })
    }

    if (opts.ordering) {
      const orderByTypeName = `${dmmfField.outputType.type}OrderBy`
      const orderByArg = dmmfField.args.find(
        arg =>
          arg.inputType.type === orderByTypeName + 'Input' &&
          arg.name === 'orderBy',
      )

      if (!orderByArg) {
        throw new Error(
          `Could not find ordering argument for ${prismaModelName}.${dmmfField.name}`,
        )
      }

      args.push({
        arg: orderByArg,
        type: this.handleInputObjectCustomization(
          opts.ordering,
          orderByTypeName,
          dmmfField.name,
          graphQLTypeName,
        ),
      })
    }

    if (opts.pagination) {
      const paginationKeys = ['first', 'last', 'before', 'after', 'skip']
      const paginationsArgs =
        opts.pagination === true
          ? dmmfField.args.filter(a => paginationKeys.includes(a.name))
          : dmmfField.args.filter(
              arg => (opts.pagination as any)[arg.name] === true,
            )

      args.push(
        ...paginationsArgs.map(a => ({ arg: a, type: 'scalar' as 'scalar' })),
      )
    }

    return args
  }

  protected handleInputObjectCustomization(
    fieldWhitelist: Record<string, boolean> | boolean,
    inputTypeName: string,
    fieldName: string,
    graphQLTypeName: string,
  ): DMMF.External.InputType {
    // TODO Trying out this naming. Might be the wrong mental model.
    // Revisit this in the near future for reflection.
    const photonObject = this.dmmf.getInputType(inputTypeName + 'Input')

    // If the publishing for this field feature (filtering, ordering, ...)
    // has not been tailored then we may simply pass through the backing
    // version as-is.
    //
    if (fieldWhitelist === true) {
      return stripInputSuffix(photonObject)
    }

    // CHECK
    // ... only some fields of the PSL model are exposed ...
    // vs
    // ... only some fields of the field's type are exposed ...
    //
    // With tailord field feature publishing, users can specify that only
    // some fields of the PSL model are exposed under the given field feature.
    // For example, in the following...
    //
    //    t.model.friends({ filtering: { firstName: true, location: true } })
    //
    // ...the field feature is "filtering" and the user has tailored it so
    // that only "firstName" and "location" of the field's type (e.g. "User")
    // are exposed to filtering on this field. So the resulting GQL TypeDef
    // would look something like:
    //
    //    ...
    //    friends(where: { firstName: ..., location: ..., }): [User]
    //    ...
    //
    // REFACTOR use an intersection function
    //
    const whitelistedFieldNames = Object.keys(fieldWhitelist)
    const userExposedObjectFields = photonObject.fields.filter(field =>
      whitelistedFieldNames.includes(field.name),
    )

    const uniqueName = photonObject.isWhereType
      ? this.argsNamingStrategy.where(graphQLTypeName, fieldName)
      : this.argsNamingStrategy.orderBy(graphQLTypeName, fieldName)

    return {
      ...photonObject,
      name: uniqueName,
      fields: userExposedObjectFields,
    }
  }

  protected dmmfArgsToNexusArgs(args: CustomInputArg[]) {
    return args.reduce<Record<string, any>>((acc, customArg) => {
      if (customArg.type === 'scalar') {
        acc[customArg.arg.name] = Nexus.core.arg(
          nexusFieldOpts(customArg.arg.inputType),
        )
      } else {
        if (!this.visitedInputTypesMap[customArg.type.name]) {
          acc[customArg.arg.name] = this.createInputOrEnumType(customArg)
        } else {
          acc[customArg.arg.name] = Nexus.core.arg(
            nexusFieldOpts({
              ...customArg.arg.inputType,
              type: customArg.type.name.replace(/Input$/, ''),
            }),
          )
        }
      }
      return acc
    }, {})
  }

  protected createInputOrEnumType(customArg: CustomInputArg) {
    if (typeof customArg.type !== 'string') {
      this.visitedInputTypesMap[
        customArg.type.name.replace(/Input$/, '')
      ] = true
    }

    if (customArg.arg.inputType.kind === 'enum') {
      const eType = customArg.type as DMMF.External.Enum

      return Nexus.enumType({
        name: eType.name,
        members: eType.values,
      })
    } else {
      const inputType = customArg.type as DMMF.External.InputType
      return Nexus.inputObjectType({
        name: inputType.name.replace(/Input$/, ''),
        definition: t => {
          const [scalarFields, objectFields] = partition(
            inputType.fields,
            f => f.inputType.kind === 'scalar',
          )
          const remappedObjectFields = objectFields.map(field => ({
            ...field,
            inputType: {
              ...field.inputType,
              type:
                this.visitedInputTypesMap[
                  field.inputType.type.replace(/Input$/, '')
                ] === true
                  ? // Simply reference the field input type if it's already been visited, otherwise create it
                    field.inputType.type.replace(/Input$/, '')
                  : this.createInputOrEnumType({
                      arg: field,
                      type:
                        field.inputType.kind === 'enum'
                          ? this.dmmf.getEnumType(field.inputType.type)
                          : stripInputSuffix(
                              this.dmmf.getInputType(field.inputType.type),
                            ),
                    }),
            },
          }))
          ;[...scalarFields, ...remappedObjectFields].forEach(field => {
            t.field(field.name, nexusFieldOpts(field.inputType))
          })
        },
      })
    }
  }

  protected buildSchemaForPrismaModel(
    prismaModelName: string,
    graphQLTypeName: string,
    t: Nexus.core.OutputDefinitionBlock<any>,
  ) {
    const model = this.dmmf.getModelOrThrow(prismaModelName)
    const outputType = this.dmmf.getOutputType(model.name)

    const seed: Record<string, (opts?: FieldPublisherConfig) => any> = {}
    const result = outputType.fields.reduce((acc, graphqlField) => {
      acc[graphqlField.name] = opts => {
        if (!opts) {
          opts = {}
        }
        if (!opts.pagination) {
          opts.pagination = true
        }
        const fieldName = opts.alias ? opts.alias : graphqlField.name
        const type = opts.type ? opts.type : graphqlField.outputType.type
        const fieldOpts: Nexus.core.NexusOutputFieldConfig<any, string> = {
          ...nexusFieldOpts({ ...graphqlField.outputType, type }),
          args: this.argsFromField(
            prismaModelName,
            graphQLTypeName,
            null,
            graphqlField,
            opts,
          ),
        }
        // Rely on default resolvers for scalars and enums
        if (graphqlField.outputType.kind === 'object') {
          const mapping = this.dmmf.getMapping(prismaModelName)

          fieldOpts.resolve = (root, args, ctx) => {
            const photon = this.getPhoton(ctx)

            assertPhotonInContext(photon)

            return photon[mapping.plural!]
              ['findOne']({ where: { id: root.id } })
              [graphqlField.name](args)
          }
        }

        t.field(fieldName, fieldOpts)

        return result
      }
      return acc
    }, seed)

    return result
  }

  protected renameInputObject(
    graphQLTypeName: string,
    fieldName: string,
    inputType: DMMF.External.InputType,
  ) {
    if (inputType.isWhereType) {
      return this.argsNamingStrategy.where(graphQLTypeName, fieldName)
    }

    return this.argsNamingStrategy.orderBy(graphQLTypeName, fieldName)
  }

  // FIXME strongly type this so that build() does not return any[]
  //
  protected buildScalars() {
    const allScalarNames = flatMap(this.dmmf.schema.outputTypes, o => o.fields)
      .filter(
        f =>
          f.outputType.kind === 'scalar' &&
          !GraphQL.scalarsNameValues.includes(f.outputType.type as any),
      )
      .map(f => f.outputType.type)
    const dedupScalarNames = [...new Set(allScalarNames)]
    const scalars: any[] = []

    // FIXME The type of .type above is nexus.core.AllOutputTypes
    // but this does not account for custom scalars. Nexus
    // should change its AllOutputTypes type, or export a new type,
    // that integrates custom scalers. Conversely, nexus-prisma
    // typegen should contribute (e.g. via interface merging) to it
    // the scalars found in DMMF.
    if (dedupScalarNames.includes('DateTime' as any)) {
      scalars.push(dateTimeScalar)
    }
    if (dedupScalarNames.includes('UUID' as any)) {
      scalars.push(uuidScalar)
    }

    return scalars
  }
}

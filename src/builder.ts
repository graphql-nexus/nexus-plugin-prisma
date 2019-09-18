import { core, dynamicOutputProperty, enumType, inputObjectType } from 'nexus'
import { DynamicOutputPropertyDef } from 'nexus/dist/dynamicProperty'
import { transformDMMF } from './dmmf/transformer'
import { ExternalDMMF as DMMF } from './dmmf/types'
import { DMMFClass } from './dmmf/DMMFClass'
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
  IArgsNamingStrategy,
  IFieldNamingStrategy,
} from './naming-strategies'
import { dateTimeScalar, GQL_SCALARS_NAMES, uuidScalar } from './scalars'
import { getSupportedMutations, getSupportedQueries } from './supported-ops'
import * as Typegen from './typegen'
import * as path from 'path'

interface FieldPublisherConfig {
  alias?: string
  type?: string
  pagination?: boolean | Record<string, boolean>
  filtering?: boolean | Record<string, boolean>
  ordering?: boolean | Record<string, boolean>
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
 * TODO documentation for end-users here.
 */
export function build(options: Options = {}) {
  const builder = new NexusPrismaBuilder(options)
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
  arg: DMMF.SchemaArg
  type: DMMF.InputType | DMMF.Enum | 'scalar'
}

export class NexusPrismaBuilder {
  protected readonly dmmf: DMMFClass
  protected visitedInputTypesMap: Record<string, boolean>
  protected argsNamingStrategy: IArgsNamingStrategy
  protected fieldNamingStrategy: IFieldNamingStrategy
  protected getPhoton: any

  constructor(protected options: Options) {
    const config = {
      ...defaultOptions,
      ...options,
      inputs: { ...defaultOptions.inputs, ...options.inputs },
      outputs: { ...defaultOptions.outputs, ...options.outputs },
    }
    // TODO when photon not found log hints of what to do for the user
    // TODO DRY this with same logic in typegen
    const transformedDMMF = transformDMMF(require(config.inputs.photon).dmmf)
    this.dmmf = new DMMFClass(transformedDMMF)
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
   * Generate `t.crud` output method
   */
  protected buildCRUD(): DynamicOutputPropertyDef<'crud'> {
    //const methodName = this.params.methodName ? this.params.methodName : 'crud';
    return dynamicOutputProperty({
      name: 'crud',
      typeDefinition: `: NexusPrisma<TypeName, 'crud'>`,
      factory: ({ typeDef: t, typeName: gqlTypeName }) => {
        if (gqlTypeName !== 'Query' && gqlTypeName !== 'Mutation') {
          throw new Error(
            `t.crud can only be used on a 'Query' & 'Mutation' objectType. Please use 't.model' instead`,
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
              ) as keyof DMMF.Mapping | undefined

              if (!operationName) {
                throw new Error(
                  `Could not find operation name for field ${field.name}`,
                )
              }

              t.field(gqlFieldName, {
                type: gqlType,
                list: field.outputType.isList || undefined,
                nullable: !field.outputType.isRequired,
                args: this.computeArgsFromField(
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
    // const methodName = this.params.methodName
    //   ? this.params.methodName
    //   : 'model';
    return dynamicOutputProperty({
      name: 'model',
      typeDefinition: `: NexusPrisma<TypeName, 'model'>`,
      factory: ({ typeDef: t, typeName: graphQLTypeName }) => {
        const modelDefinition = this.dmmf.hasModel(graphQLTypeName)
          ? this.doBuildModel(t, graphQLTypeName)
          : (modelName: string) => this.doBuildModel(t, modelName)

        return modelDefinition
      },
    })
  }

  protected doBuildModel(
    t: core.OutputDefinitionBlock<any>,
    graphQLTypeName: string,
  ) {
    return this.buildSchemaForPrismaModel(graphQLTypeName, graphQLTypeName, t)
  }

  protected computeArgsFromField(
    prismaModelName: string,
    graphQLTypeName: string,
    operationName: keyof DMMF.Mapping | null,
    field: DMMF.SchemaField,
    opts: FieldPublisherConfig,
  ) {
    let args: CustomInputArg[] = []

    if (graphQLTypeName === 'Mutation' || operationName === 'findOne') {
      args = field.args.map(arg => ({
        arg,
        type: this.dmmf.getInputType(arg.inputType.type),
      }))
    } else {
      args = this.argsForQueryOrModelField(
        prismaModelName,
        graphQLTypeName,
        field,
        opts,
      )
    }

    return this.dmmfArgsToNexusArgs(args)
  }

  protected argsForQueryOrModelField(
    prismaModelName: string,
    graphQLTypeName: string,
    field: DMMF.SchemaField,
    opts: FieldPublisherConfig,
  ) {
    let args: CustomInputArg[] = []

    if (opts.filtering) {
      const whereTypeName = `${field.outputType.type}WhereInput`
      const whereArg = field.args.find(
        a => a.inputType.type === whereTypeName && a.name === 'where',
      )

      if (!whereArg) {
        throw new Error(
          `Could not find filtering argument for ${prismaModelName}.${field.name}`,
        )
      }

      args.push({
        arg: whereArg,
        type: this.customizeInputType(
          opts.filtering,
          whereTypeName,
          field.name,
          graphQLTypeName,
        ),
      })
    }

    if (opts.ordering) {
      const orderByTypeName = `${field.outputType.type}OrderByInput`
      const orderByArg = field.args.find(
        a => a.inputType.type === orderByTypeName && a.name === 'orderBy',
      )

      if (!orderByArg) {
        throw new Error(
          `Could not find ordering argument for ${prismaModelName}.${field.name}`,
        )
      }

      args.push({
        arg: orderByArg,
        type: this.customizeInputType(
          opts.ordering,
          orderByTypeName,
          field.name,
          graphQLTypeName,
        ),
      })
    }

    if (opts.pagination) {
      const paginationKeys = ['first', 'last', 'before', 'after', 'skip']
      const paginationsArgs =
        opts.pagination === true
          ? field.args.filter(a => paginationKeys.includes(a.name))
          : field.args.filter(a => (opts.pagination as any)[a.name] === true)

      args.push(
        ...paginationsArgs.map(a => ({ arg: a, type: 'scalar' as 'scalar' })),
      )
    }

    return args
  }

  protected customizeInputType(
    input: Record<string, boolean> | boolean,
    inputTypeName: string,
    fieldName: string,
    graphQLTypeName: string,
  ): DMMF.InputType {
    const type = this.dmmf.getInputType(inputTypeName)

    // Do not alias type name if type is not customized
    if (input === true) {
      return type
    }

    const argsNames = Object.keys(input)

    // Rename the InputObject type definition if some fields are whitelisted
    return {
      ...type,
      name: this.aliasInputTypeName(graphQLTypeName, fieldName, type),
      fields: type.fields.filter(f => argsNames.includes(f.name)),
    }
  }

  protected dmmfArgsToNexusArgs(args: CustomInputArg[]) {
    return args.reduce<Record<string, any>>((acc, customArg) => {
      if (customArg.type === 'scalar') {
        acc[customArg.arg.name] = core.arg(
          nexusFieldOpts(customArg.arg.inputType),
        )
      } else {
        if (!this.visitedInputTypesMap[customArg.type.name]) {
          acc[customArg.arg.name] = this.createInputEnumType(customArg)
        } else {
          acc[customArg.arg.name] = core.arg(
            nexusFieldOpts({
              ...customArg.arg.inputType,
              type: customArg.type.name,
            }),
          )
        }
      }
      return acc
    }, {})
  }

  protected createInputEnumType(customArg: CustomInputArg) {
    if (typeof customArg.type !== 'string') {
      this.visitedInputTypesMap[customArg.type.name] = true
    }

    if (customArg.arg.inputType.kind === 'enum') {
      const eType = customArg.type as DMMF.Enum

      return enumType({
        name: eType.name,
        members: eType.values,
      })
    } else {
      const inputType = customArg.type as DMMF.InputType
      return inputObjectType({
        name: inputType.name,
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
                this.visitedInputTypesMap[field.inputType.type] === true
                  ? // Simply reference the field input type if it's already been visited, otherwise create it
                    field.inputType.type
                  : this.createInputEnumType({
                      arg: field,
                      type:
                        field.inputType.kind === 'enum'
                          ? this.dmmf.getEnumType(field.inputType.type)
                          : this.dmmf.getInputType(field.inputType.type),
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
    t: core.OutputDefinitionBlock<any>,
  ) {
    const model = this.dmmf.getModelOrThrow(prismaModelName)
    const outputType = this.dmmf.getOutputType(model.name)

    const result = outputType.fields.reduce<
      Record<string, (opts?: FieldPublisherConfig) => any>
    >((acc, graphqlField) => {
      acc[graphqlField.name] = opts => {
        if (!opts) {
          opts = {}
        }
        if (!opts.pagination) {
          opts.pagination = true
        }
        const fieldName = opts.alias ? opts.alias : graphqlField.name
        const type = opts.type ? opts.type : graphqlField.outputType.type
        const fieldOpts: core.NexusOutputFieldConfig<any, string> = {
          ...nexusFieldOpts({ ...graphqlField.outputType, type }),
          args: this.computeArgsFromField(
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
    }, {})

    return result
  }

  protected aliasInputTypeName(
    graphQLTypeName: string,
    fieldName: string,
    inputType: DMMF.InputType,
  ) {
    if (inputType.isWhereType) {
      return this.argsNamingStrategy.whereInput(graphQLTypeName, fieldName)
    }

    return this.argsNamingStrategy.orderByInput(graphQLTypeName, fieldName)
  }

  // FIXME strongly type this so that build() does not return any[]
  //
  protected buildScalars() {
    const allScalarNames = flatMap(this.dmmf.schema.outputTypes, o => o.fields)
      .filter(
        f =>
          f.outputType.kind === 'scalar' &&
          !GQL_SCALARS_NAMES.includes(f.outputType.type),
      )
      .map(f => f.outputType.type)
    const dedupScalarNames = [...new Set(allScalarNames)]
    const scalars: any[] = []

    if (dedupScalarNames.includes('DateTime')) {
      scalars.push(dateTimeScalar)
    }

    if (dedupScalarNames.includes('UUID')) {
      scalars.push(uuidScalar)
    }

    return scalars
  }
}

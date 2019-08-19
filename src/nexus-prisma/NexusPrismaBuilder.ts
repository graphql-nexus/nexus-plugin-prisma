import {
  core,
  dynamicOutputMethod,
  enumType,
  inputObjectType
} from '@prisma/nexus';
import { NexusPrismaParams } from '.';
import { transformDMMF } from '../dmmf/dmmf-transformer';
import { ExternalDMMF as DMMF } from '../dmmf/dmmf-types';
import { DMMFClass } from '../dmmf/DMMFClass';
import {
  assertPhotonInContext,
  flatMap,
  getCRUDFieldName,
  nexusOpts as nexusFieldOpts
} from '../utils';
import {
  defaultArgsNamingStrategy,
  defaultFieldNamingStrategy,
  IArgsNamingStrategy,
  IFieldNamingStrategy
} from './NamingStrategies';
import { dateTimeScalar, GQL_SCALARS_NAMES } from './scalars';
import { getSupportedMutations, getSupportedQueries } from './supported-ops';

interface NexusPrismaMethodParams {
  alias?: string;
  type?: string;
  pagination?: boolean | Record<string, boolean>;
  filtering?: boolean | Record<string, boolean>;
  ordering?: boolean | Record<string, boolean>;
}

type FieldsWithModelName = {
  fields: DMMF.SchemaField[];
  mapping: DMMF.Mapping;
};

export class NexusPrismaBuilder {
  protected readonly dmmf: DMMFClass;
  protected visitedInputTypesMap: Record<string, boolean>;
  protected whitelistMap: Record<string, string[]>;
  protected argsNamingStrategy: IArgsNamingStrategy;
  protected fieldNamingStrategy: IFieldNamingStrategy;

  constructor(protected params: NexusPrismaParams) {
    let transformedDMMF;

    if (process.env.NEXUS_PRISMA_DEBUG) {
      // Using eval so that ncc doesn't include it in the build
      transformedDMMF = transformDMMF(eval(`require('@generated/photon'`).dmmf);
    } else {
      // @ts-ignore
      transformedDMMF = __DMMF__;
    }

    this.dmmf = new DMMFClass(transformedDMMF as any);
    this.argsNamingStrategy = defaultArgsNamingStrategy;
    this.fieldNamingStrategy = defaultFieldNamingStrategy;
    this.visitedInputTypesMap = {};
    this.whitelistMap = {};
    if (!this.params.photon) {
      this.params.photon = ctx => ctx.photon;
    }
  }

  getNexusPrismaMethod() {
    return [
      this.getCRUDDynamicOutputMethod(),
      this.getModelDynamicOutputMethod(),
      ...this.getPrismaScalars()
    ];
  }

  /**
   * Generate `t.crud` output method
   */
  protected getCRUDDynamicOutputMethod() {
    //const methodName = this.params.methodName ? this.params.methodName : 'crud';

    return dynamicOutputMethod({
      name: 'crud',
      typeDefinition: `: NexusPrisma<TypeName, 'crud'>`,
      factory: ({ typeDef: t, typeName: graphQLTypeName }) => {
        const buildCrud = () => {
          if (graphQLTypeName !== 'Query' && graphQLTypeName !== 'Mutation') {
            throw new Error(
              `t.crud can only be used on a 'Query' & 'Mutation' objectType. Please use 't.model' instead`
            );
          }

          if (graphQLTypeName === 'Query') {
            const queryFields = this.dmmf.mappings.map(mapping => {
              const queriesNames = getSupportedQueries(mapping);
              return {
                fields: this.dmmf.queryType.fields.filter(query =>
                  queriesNames.includes(query.name)
                ),
                mapping
              };
            });

            return this.buildSchemaForCRUD(t, 'Query', queryFields);
          }

          if (graphQLTypeName === 'Mutation') {
            const mutationFields = this.dmmf.mappings.map(mapping => {
              const mutationsNames = getSupportedMutations(mapping);
              return {
                fields: this.dmmf.mutationType.fields.filter(mutation =>
                  mutationsNames.includes(mutation.name)
                ),
                mapping
              };
            });

            return this.buildSchemaForCRUD(t, 'Mutation', mutationFields);
          }
        };

        // if (this.params.methodName) {
        //   return {
        //     [this.params.methodName]: buildCrud()
        //   };
        // }

        return buildCrud();
      }
    });
  }

  /**
   * Generate `t.model` output method
   */
  protected getModelDynamicOutputMethod() {
    // const methodName = this.params.methodName
    //   ? this.params.methodName
    //   : 'model';
    return dynamicOutputMethod({
      name: 'model',
      typeDefinition: `: NexusPrisma<TypeName, 'model'>`,
      factory: ({ typeDef: t, typeName: graphQLTypeName }) => {
        const modelDefinition = this.dmmf.hasModel(graphQLTypeName)
          ? this.buildModel(t, graphQLTypeName)
          : (modelName: string) => this.buildModel(t, modelName);

        return modelDefinition;
      }
    });
  }

  protected buildModel(
    t: core.OutputDefinitionBlock<any>,
    graphQLTypeName: string
  ) {
    return this.buildSchemaForPrismaModel(graphQLTypeName, graphQLTypeName, t);
  }

  protected computeArgsFromField(
    prismaModelName: string,
    graphQLTypeName: string,
    operationName: keyof DMMF.Mapping | null,
    field: DMMF.SchemaField,
    opts: NexusPrismaMethodParams
  ) {
    let args: DMMF.SchemaArg[] = [];

    if (graphQLTypeName === 'Mutation') {
      args = field.args;
    } else if (operationName === 'findOne') {
      args = field.args;
    } else {
      args = this.argsForQueryOrModelField(
        prismaModelName,
        graphQLTypeName,
        field,
        opts
      );
    }

    return this.dmmfArgsToNexusArgs(graphQLTypeName, field, args);
  }

  protected argsForQueryOrModelField(
    prismaModelName: string,
    graphQLTypeName: string,
    field: DMMF.SchemaField,
    opts: NexusPrismaMethodParams
  ) {
    let args: DMMF.SchemaArg[] = [];

    if (opts.filtering) {
      const whereTypeName = `${field.outputType.type}WhereInput`;
      const whereArg = field.args.find(
        a => a.inputType.type === whereTypeName && a.name === 'where'
      );

      if (!whereArg) {
        throw new Error(
          `Could not find filtering argument for ${prismaModelName}.${field.name}. Searched for a field param with type "${whereTypeName}". Actual fields were ${field.args}`
        );
      }

      if (opts.filtering !== true) {
        this.whitelistMap[
          this.argTypeName(
            graphQLTypeName,
            field.name,
            whereArg.inputType.type,
            whereArg.inputType.kind
          )
        ] = Object.keys(opts.filtering).filter(
          fieldName => (opts.filtering as any)[fieldName] === true
        );
      }

      args.push(whereArg);
    }

    if (opts.ordering) {
      const orderByArg = field.args.find(
        a =>
          a.inputType.type === `${field.outputType.type}OrderByInput` &&
          a.name === 'orderBy'
      );

      if (!orderByArg) {
        throw new Error(
          `Could not find ordering argument for ${prismaModelName}.${field.name}`
        );
      }

      if (opts.ordering !== true) {
        this.whitelistMap[
          this.argTypeName(
            graphQLTypeName,
            field.name,
            orderByArg.inputType.type,
            orderByArg.inputType.kind
          )
        ] = Object.keys(opts.ordering).filter(
          fieldName => (opts.ordering as any)[fieldName] === true
        );
      }

      args.push(orderByArg);
    }

    if (opts.pagination) {
      if (opts.pagination === true) {
        const paginationKeys = ['first', 'last', 'before', 'after', 'skip'];

        args.push(...field.args.filter(a => paginationKeys.includes(a.name)));
      } else {
        const paginationKeys = Object.keys(opts.pagination);

        args.push(...field.args.filter(a => paginationKeys.includes(a.name)));
      }
    }

    return args;
  }

  protected dmmfArgsToNexusArgs(
    parentTypeName: string,
    field: DMMF.SchemaField,
    args: DMMF.SchemaArg[]
  ) {
    return args.reduce<Record<string, any>>((acc, arg) => {
      if (arg.inputType.kind === 'scalar') {
        acc[arg.name] = core.arg(nexusFieldOpts(arg.inputType));
      } else {
        const typeName = this.argTypeName(
          parentTypeName,
          field.name,
          arg.inputType.type,
          arg.inputType.kind
        );
        if (!this.visitedInputTypesMap[typeName]) {
          acc[arg.name] = this.createInputEnumType(parentTypeName, field, arg);
        } else {
          acc[arg.name] = core.arg(
            nexusFieldOpts({
              ...arg.inputType,
              type: typeName
            })
          );
        }
      }
      return acc;
    }, {});
  }

  protected buildSchemaForCRUD(
    t: core.OutputDefinitionBlock<any>,
    parentTypeName: string,
    mappedFields: FieldsWithModelName[]
  ) {
    const result = mappedFields.reduce<
      Record<string, (opts?: NexusPrismaMethodParams) => any>
    >((acc, mappedField) => {
      const prismaModelName = mappedField.mapping.model;

      mappedField.fields.forEach(field => {
        const mappedFieldName = getCRUDFieldName(
          prismaModelName,
          field.name,
          mappedField.mapping,
          this.fieldNamingStrategy
        );
        acc[mappedFieldName] = opts => {
          const mergedOpts: NexusPrismaMethodParams = {
            pagination: true,
            type: field.outputType.type,
            ...opts
          };
          const fieldName = mergedOpts.alias
            ? mergedOpts.alias
            : mappedFieldName;
          const type = mergedOpts.type!;
          const operationName = Object.keys(mappedField.mapping).find(
            key => (mappedField.mapping as any)[key] === field.name
          ) as keyof DMMF.Mapping | undefined;

          if (!operationName) {
            throw new Error(
              'Could not find operation name for field ' + field.name
            );
          }

          t.field(fieldName, {
            ...nexusFieldOpts({ ...field.outputType, type }),
            args: this.computeArgsFromField(
              prismaModelName,
              parentTypeName,
              operationName,
              field,
              mergedOpts
            ),
            resolve: (_, args, ctx) => {
              const photon = this.params.photon(ctx);

              assertPhotonInContext(photon);

              return photon[mappedField.mapping.plural!][operationName](args);
            }
          });

          return result;
        };
      });

      return acc;
    }, {});

    return result;
  }

  protected createInputEnumType(
    parentTypeName: string,
    field: DMMF.SchemaField,
    arg: DMMF.SchemaArg
  ) {
    this.visitedInputTypesMap[
      this.argTypeName(
        parentTypeName,
        field.name,
        arg.inputType.type,
        arg.inputType.kind
      )
    ] = true;

    if (arg.inputType.kind === 'enum') {
      const eType = this.dmmf.getEnumType(arg.inputType.type);

      return enumType({
        name: eType.name,
        members: eType.values
      });
    } else {
      const input = this.dmmf.getInputType(arg.inputType.type);

      const inputName =
        input.isWhereType ||
        input.isOrderType ||
        this.isRelationFilterArg(input.name)
          ? this.argTypeName(parentTypeName, field.name, input.name, 'object')
          : input.name;

      const filteredFields = this.whitelistMap[inputName]
        ? input.fields.filter(f =>
            this.whitelistMap[inputName].includes(f.name)
          )
        : input.fields;

      return inputObjectType({
        name: inputName,
        definition: t => {
          filteredFields.forEach(inputArg => {
            if (inputArg.inputType.kind === 'scalar') {
              t.field(inputArg.name, nexusFieldOpts(inputArg.inputType));
            } else {
              const argumentTypeName = this.argTypeName(
                parentTypeName,
                field.name,
                inputArg.inputType.type,
                inputArg.inputType.kind
              );
              const type =
                this.visitedInputTypesMap[argumentTypeName] === true
                  ? argumentTypeName
                  : (this.createInputEnumType(
                      parentTypeName,
                      field,
                      inputArg
                    ) as any);

              t.field(
                inputArg.name,
                nexusFieldOpts({ ...inputArg.inputType, type })
              );
            }
          });
        }
      });
    }
  }

  protected buildSchemaForPrismaModel(
    prismaModelName: string,
    graphQLTypeName: string,
    t: core.OutputDefinitionBlock<any>
  ) {
    const model = this.dmmf.getModelOrThrow(prismaModelName);
    const outputType = this.dmmf.getOutputType(model.name);

    const result = outputType.fields.reduce<
      Record<string, (opts?: NexusPrismaMethodParams) => any>
    >((acc, graphqlField) => {
      acc[graphqlField.name] = opts => {
        if (!opts) {
          opts = {};
        }
        if (!opts.pagination) {
          opts.pagination = true;
        }
        const fieldName = opts.alias ? opts.alias : graphqlField.name;
        const type = opts.type ? opts.type : graphqlField.outputType.type;
        const fieldOpts: core.NexusOutputFieldConfig<any, string> = {
          ...nexusFieldOpts({ ...graphqlField.outputType, type }),
          args: this.computeArgsFromField(
            prismaModelName,
            graphQLTypeName,
            null,
            graphqlField,
            opts
          )
        };
        // Rely on default resolvers for scalars
        if (graphqlField.outputType.kind !== 'scalar') {
          const mapping = this.dmmf.getMapping(prismaModelName);

          fieldOpts.resolve = (root, args, ctx) => {
            const photon = this.params.photon(ctx);

            assertPhotonInContext(photon);

            return photon[mapping.plural!]
              ['findOne']({ where: { id: root.id } })
              [graphqlField.name](args);
          };
        }

        t.field(fieldName, fieldOpts);

        return result;
      };
      return acc;
    }, {});

    return result;
  }

  protected isRelationFilterArg(type: string) {
    return (
      type.endsWith('Filter') &&
      ![
        'IntFilter',
        'StringFilter',
        'BooleanFilter',
        'NullableStringFilter',
        'FloatFilter'
      ].includes(type) &&
      type !== 'Filter'
    );
  }

  protected argTypeName(
    graphQLTypeName: string,
    fieldName: string,
    inputTypeName: string,
    kind: DMMF.FieldKind
  ) {
    if (kind === 'object') {
      const input = this.dmmf.getInputType(inputTypeName);

      if (!input) {
        throw new Error('Could not find input with name: ' + graphQLTypeName);
      }

      if (input.isWhereType) {
        return this.argsNamingStrategy.whereInput(graphQLTypeName, fieldName);
      }

      if (input.isOrderType) {
        return this.argsNamingStrategy.orderByInput(graphQLTypeName, fieldName);
      }

      if (this.isRelationFilterArg(inputTypeName)) {
        return this.argsNamingStrategy.relationFilterInput(
          graphQLTypeName,
          fieldName
        );
      }

      return inputTypeName;
    }

    if (kind === 'enum') {
      return inputTypeName;
    }

    return inputTypeName;
  }

  protected getPrismaScalars() {
    const allScalarNames = flatMap(this.dmmf.schema.outputTypes, o => o.fields)
      .filter(
        f =>
          f.outputType.kind === 'scalar' &&
          !GQL_SCALARS_NAMES.includes(f.outputType.type)
      )
      .map(f => f.outputType.type);
    const dedupScalarNames = [...new Set(allScalarNames)];
    const scalars: any[] = [];

    if (dedupScalarNames.includes('DateTime')) {
      scalars.push(dateTimeScalar);
    }

    return scalars;
  }
}

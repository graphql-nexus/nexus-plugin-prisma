import * as fs from 'fs-extra'
import * as path from 'path'
import * as DMMF from './dmmf'
import { getCrudMappedFields } from './mapping'
import { defaultFieldNamingStrategy } from './naming-strategies'

type Options = {
  photonPath: string
  typegenPath: string
}

export function generateSync(options: Options): void {
  doGenerate(true, options)
}

export function generate(options: Options): Promise<void> {
  return doGenerate(false, options)
}

export function doGenerate(sync: true, options: Options): void
export function doGenerate(sync: false, options: Options): Promise<void>
export function doGenerate(
  sync: boolean,
  options: Options,
): void | Promise<void> {
  const dmmf = DMMF.get(options.photonPath)
  const tsDeclaration = render(dmmf, options.photonPath)
  if (sync) {
    fs.mkdirpSync(path.dirname(options.typegenPath))
    fs.writeFileSync(options.typegenPath, tsDeclaration)
  } else {
    return fs
      .mkdirp(path.dirname(options.typegenPath))
      .then(() => fs.writeFile(options.typegenPath, tsDeclaration))
  }
}

export function render(dmmf: DMMF.DMMF, photonPath: string) {
  return `\
import * as photon from '${photonPath}';
import { core } from 'nexus';
// Types helpers
${renderStaticTypes()}

// Generated
${renderModelTypes(dmmf)}
${renderNexusPrismaInputs(dmmf)}
${renderNexusPrismaTypes(dmmf)}
${renderNexusPrismaMethods(dmmf)}

declare global {
  type NexusPrisma<
    TypeName extends string,
    ModelOrCrud extends 'model' | 'crud'
  > = GetNexusPrisma<TypeName, ModelOrCrud>;
}
  `
}

function renderModelTypes(dmmf: DMMF.DMMF) {
  return `\
interface ModelTypes {
${dmmf.datamodel.models.map(m => `  ${m.name}: photon.${m.name}`).join('\n')}
}
  `
}

function renderNexusPrismaTypes(dmmf: DMMF.DMMF) {
  const queriesByType = getCrudMappedFields('Query', dmmf).map(mappedfield => ({
    fieldName: mappedfield.field.name,
    returnType: mappedfield.field.outputType.type,
  }))
  const mutationsByType = getCrudMappedFields('Mutation', dmmf).map(
    mappedField => ({
      fieldName: mappedField.field.name,
      returnType: mappedField.field.outputType.type,
    }),
  )
  const fieldsByType = dmmf.datamodel.models.reduce<
    Record<string, { fieldName: string; returnType: string }[]>
  >((acc, m) => {
    acc[m.name] = m.fields.map(f => ({
      fieldName: f.name,
      returnType: f.type,
    }))

    return acc
  }, {})

  // TODO: Add JS Docs
  const renderNexusPrismaType = (
    input: {
      fieldName: string
      returnType: string
    }[],
  ): string => `\
${input.map(f => `    ${f.fieldName}: '${f.returnType}'`).join('\n')}
`

  return `\
interface NexusPrismaTypes {
  Query: {
${renderNexusPrismaType(queriesByType)}
  },
  Mutation: {
${renderNexusPrismaType(mutationsByType)}
  },
${Object.entries(fieldsByType).map(
  ([modelName, fields]) => `  ${modelName}: {
${renderNexusPrismaType(fields)}
}`,
)}
}
`
}

function renderNexusPrismaInputs(dmmf: DMMF.DMMF) {
  const queriesFields = getCrudMappedFields('Query', dmmf)
    .filter(
      mappedField =>
        mappedField.field.outputType.isList &&
        mappedField.field.outputType.kind === 'object',
    )
    .map(mappedField => {
      const whereArg = mappedField.field.args.find(a => a.name === 'where')!
      const orderByArg = mappedField.field.args.find(a => a.name === 'orderBy')!
      const whereInput = dmmf.schema.inputTypes.find(
        i => i.name === whereArg.inputType.type,
      )!
      const orderByInput = dmmf.schema.inputTypes.find(
        i => i.name === orderByArg.inputType.type,
      )!

      return {
        fieldName: defaultFieldNamingStrategy[mappedField.operation](
          mappedField.field.name,
          mappedField.model,
        ),
        filtering: whereInput,
        ordering: orderByInput,
      }
    })

  const fieldsByType = dmmf.datamodel.models
    .map(m => dmmf.getOutputType(m.name))
    .reduce<
      Record<
        string,
        {
          fieldName: string
          filtering: DMMF.Data.InputType
          ordering: DMMF.Data.InputType
        }[]
      >
    >((acc, type) => {
      acc[type.name] = type.fields
        .filter(f => f.outputType.isList && f.outputType.kind === 'object')
        .map(f => {
          const whereArg = f.args.find(a => a.name === 'where')!

          const orderByArg = f.args.find(a => a.name === 'orderBy')!
          const whereInput = dmmf.schema.inputTypes.find(
            i => i.name === whereArg.inputType.type,
          )!
          const orderByInput = dmmf.schema.inputTypes.find(
            i => i.name === orderByArg.inputType.type,
          )!

          return {
            fieldName: f.name,
            filtering: whereInput,
            ordering: orderByInput,
          }
        })

      return acc
    }, {})

  // TODO: Add JS Docs
  const renderNexusPrismaInput = (
    input: {
      fieldName: string
      filtering: DMMF.Data.InputType
      ordering: DMMF.Data.InputType
    }[],
  ): string => `\
${input
  .map(
    f => `    ${f.fieldName}: {
  filtering: ${f.filtering.fields.map(f => `'${f.name}'`).join(' | ')}
  ordering: ${f.ordering.fields.map(f => `'${f.name}'`).join(' | ')}
}`,
  )
  .join('\n')}
`

  return `\
interface NexusPrismaInputs {
  Query: {
${renderNexusPrismaInput(queriesFields)}
  },
  ${Object.entries(fieldsByType).map(
    ([modelName, fields]) => `  ${modelName}: {
${renderNexusPrismaInput(fields)}
  }`,
  )}
}
`
}

function renderNexusPrismaMethods(dmmf: DMMF.DMMF) {
  return `\
interface NexusPrismaMethods {
${dmmf.datamodel.models
  .map(m => `  ${m.name}: NexusPrismaFields<'${m.name}'>`)
  .join('\n')}
  Query: NexusPrismaFields<'Query'>
  Mutation: NexusPrismaFields<'Mutation'>
}
  `
}

function renderStaticTypes() {
  return `\
  type IsModelNameExistsInGraphQLTypes<
  ReturnType extends any
> = ReturnType extends core.GetGen<'objectNames'> ? true : false;

type NexusPrismaScalarOpts = {
  alias?: string;
};

type Pagination = {
  first?: boolean;
  last?: boolean;
  before?: boolean;
  after?: boolean;
  skip?: boolean;
};

type RootObjectTypes = Pick<
  core.GetGen<'rootTypes'>,
  core.GetGen<'objectNames'>
>;

/**
 * Determine if \`B\` is a subset (or equivalent to) of \`A\`.
*/
type IsSubset<A, B> = keyof A extends never
  ? false
  : B extends A
  ? true
  : false;

type OmitByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]: T[Key] extends ValueType ? never : Key }[keyof T]
>;

type GetSubsetTypes<ModelName extends any> = keyof OmitByValue<
  {
    [P in keyof RootObjectTypes]: ModelName extends keyof ModelTypes
      ? IsSubset<RootObjectTypes[P], ModelTypes[ModelName]> extends true
        ? RootObjectTypes[P]
        : never
      : never;
  },
  never
>;

type SubsetTypes<ModelName extends any> = GetSubsetTypes<
  ModelName
> extends never
  ? \`ERROR: No subset types are available. Please make sure that one of your GraphQL type is a subset of your t.model('<ModelName>')\`
  : GetSubsetTypes<ModelName>;

type DynamicRequiredType<ReturnType extends any> = IsModelNameExistsInGraphQLTypes<
  ReturnType
> extends true
  ? { type?: SubsetTypes<ReturnType> }
  : { type: SubsetTypes<ReturnType> };

type GetNexusPrismaInput<
  ModelName extends any,
  MethodName extends any,
  InputName extends 'filtering' | 'ordering'
> = ModelName extends keyof NexusPrismaInputs
  ? MethodName extends keyof NexusPrismaInputs[ModelName]
    ? NexusPrismaInputs[ModelName][MethodName][InputName]
    : never
  : never;

type NexusPrismaRelationOpts<
  ModelName extends any,
  MethodName extends any,
  ReturnType extends any
> = GetNexusPrismaInput<
  // If GetNexusPrismaInput returns never, it means there are no filtering/ordering args for it. So just use \`alias\` and \`type\`
  ModelName,
  MethodName,
  'filtering'
> extends never
  ? {
      alias?: string;
    } & DynamicRequiredType<ReturnType>
  : {
      alias?: string;
      filtering?:
        | boolean
        | Partial<
            Record<
              GetNexusPrismaInput<ModelName, MethodName, 'filtering'>,
              boolean
            >
          >;
      ordering?:
        | boolean
        | Partial<
            Record<
              GetNexusPrismaInput<ModelName, MethodName, 'ordering'>,
              boolean
            >
          >;
      pagination?: boolean | Pagination;
    } & DynamicRequiredType<ReturnType>;

type IsScalar<TypeName extends any> = TypeName extends core.GetGen<
  'scalarNames'
>
  ? true
  : false;

type NexusPrismaFields<ModelName extends keyof NexusPrismaTypes> = {
  [MethodName in keyof NexusPrismaTypes[ModelName]]: NexusPrismaMethod<
    ModelName,
    MethodName,
    IsScalar<NexusPrismaTypes[ModelName][MethodName]> // Is the return type a scalar?
  >;
};

type NexusPrismaMethod<
  ModelName extends keyof NexusPrismaTypes,
  MethodName extends keyof NexusPrismaTypes[ModelName],
  IsScalar extends boolean,
  ReturnType extends any = NexusPrismaTypes[ModelName][MethodName]
> = IsScalar extends true // If scalar
  ? (opts?: NexusPrismaScalarOpts) => NexusPrismaFields<ModelName> // Return optional scalar opts
  : IsModelNameExistsInGraphQLTypes<ReturnType> extends true // If model name has a mapped graphql types
  ? (
      opts?: NexusPrismaRelationOpts<ModelName, MethodName, ReturnType>
    ) => NexusPrismaFields<ModelName> // Then make opts optional
  : (
      opts: NexusPrismaRelationOpts<ModelName, MethodName, ReturnType>
    ) => NexusPrismaFields<ModelName>; // Else force use input the related graphql type -> { type: '...' }

type GetNexusPrismaMethod<
  TypeName extends string
> = TypeName extends keyof NexusPrismaMethods
  ? NexusPrismaMethods[TypeName]
  : <CustomTypeName extends keyof ModelTypes>(
      typeName: CustomTypeName
    ) => NexusPrismaMethods[CustomTypeName];

type GetNexusPrisma<
  TypeName extends string,
  ModelOrCrud extends 'model' | 'crud'
> = ModelOrCrud extends 'model'
  ? TypeName extends 'Mutation'
    ? never
    : TypeName extends 'Query'
    ? never
    : GetNexusPrismaMethod<TypeName>
  : ModelOrCrud extends 'crud'
  ? TypeName extends 'Mutation'
    ? GetNexusPrismaMethod<TypeName>
    : TypeName extends 'Query'
    ? GetNexusPrismaMethod<TypeName>
    : never
  : never;
  `
}

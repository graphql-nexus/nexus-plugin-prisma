import { outdent } from 'outdent'
import * as Path from 'path'
import { DmmfDocument, DmmfTypes } from '../dmmf'
import { getTransformedDmmf } from '../dmmf/transformer'
import { getCrudMappedFields } from '../mapping'
import { defaultFieldNamingStrategy } from '../naming-strategies'
import { PaginationStrategy } from '../pagination'
import { hardWriteFile, hardWriteFileSync } from '../utils'

type Options = {
  prismaClientPath: string
  typegenPath: string
  paginationStrategy: PaginationStrategy
}

export function generateSync(options: Options): void {
  doGenerate(true, options)
}

export function generate(options: Options): Promise<void> {
  return doGenerate(false, options)
}

export function doGenerate(sync: true, options: Options): void
export function doGenerate(sync: false, options: Options): Promise<void>
export function doGenerate(sync: boolean, options: Options): void | Promise<void> {
  const paginationStrategy = options.paginationStrategy
  const prismaClientImportId =
    Path.isAbsolute(options.typegenPath) && Path.isAbsolute(options.prismaClientPath)
      ? Path.relative(Path.dirname(options.typegenPath), options.prismaClientPath)
      : options.prismaClientPath
  const dmmf = getTransformedDmmf(options.prismaClientPath)
  const tsDeclaration = render({
    dmmf,
    paginationStrategy,
    prismaClientImportId,
  })

  if (sync) {
    hardWriteFileSync(options.typegenPath, tsDeclaration)
  } else {
    return hardWriteFile(options.typegenPath, tsDeclaration)
  }
}

export function render(params: {
  dmmf: DmmfDocument
  prismaClientImportId: string
  paginationStrategy: PaginationStrategy
}) {
  return `\
import * as Typegen from 'nexus-prisma/typegen'
import * as Prisma from '${params.prismaClientImportId}';

// Pagination type
${renderPaginationType(params.paginationStrategy)}

// Prisma custom scalar names
${renderCustomScalars(params.dmmf)}

// Prisma model type definitions
${renderPrismaModels(params.dmmf)}

// Prisma input types metadata
${renderNexusPrismaInputs(params.dmmf)}

// Prisma output types metadata
${renderNexusPrismaOutputs(params.dmmf)}

// Helper to gather all methods relative to a model
${renderNexusPrismaMethods(params.dmmf)}

interface NexusPrismaGenTypes {
  inputs: NexusPrismaInputs
  outputs: NexusPrismaOutputs
  methods: NexusPrismaMethods
  models: PrismaModels
  pagination: Pagination
  scalars: CustomScalars
}

declare global {
  interface NexusPrismaGen extends NexusPrismaGenTypes {}

  type NexusPrisma<
    TypeName extends string,
    ModelOrCrud extends 'model' | 'crud'
  > = Typegen.GetNexusPrisma<TypeName, ModelOrCrud>;
}
  `
}

function renderPrismaModels(dmmf: DmmfDocument) {
  return `\
interface PrismaModels {
${dmmf.datamodel.models.map((m) => `  ${m.name}: Prisma.${m.name}`).join('\n')}
}`
}

function renderNexusPrismaOutputs(dmmf: DmmfDocument) {
  const queriesByType = getCrudMappedFields('Query', dmmf).map((mappedfield) => ({
    fieldName: mappedfield.field.name,
    returnType: mappedfield.field.outputType.type,
  }))
  const mutationsByType = getCrudMappedFields('Mutation', dmmf).map((mappedField) => ({
    fieldName: mappedField.field.name,
    returnType: mappedField.field.outputType.type,
  }))
  const fieldsByType = dmmf.datamodel.models.reduce<
    Record<string, { fieldName: string; returnType: string }[]>
  >((acc, m) => {
    acc[m.name] = m.fields.map((f) => ({
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
    }[]
  ): string => `\
${input.map((f) => `    ${f.fieldName}: '${f.returnType}'`).join('\n')}`

  return `\
interface NexusPrismaOutputs {
  Query: {
${renderNexusPrismaType(queriesByType)}
  },
  Mutation: {
${renderNexusPrismaType(mutationsByType)}
  },
${Object.entries(fieldsByType).map(
  ([modelName, fields]) => `  ${modelName}: {
${renderNexusPrismaType(fields)}
  }`
).join('\n')}
}`
}

function renderNexusPrismaInputs(dmmf: DmmfDocument) {
  const queriesFields = getCrudMappedFields('Query', dmmf)
    .filter(
      (mappedField) => mappedField.field.outputType.isList && mappedField.field.outputType.kind === 'object'
    )
    .map((mappedField) => {
      const whereArg = mappedField.field.args.find((a) => a.name === 'where')!
      const orderByArg = mappedField.field.args.find((a) => a.name === 'orderBy')!
      const whereInput = dmmf.schema.inputTypes.find((i) => i.name === whereArg.inputType.type)!
      const orderByInput = dmmf.schema.inputTypes.find((i) => i.name === orderByArg.inputType.type)!

      return {
        fieldName: defaultFieldNamingStrategy[mappedField.operation](
          mappedField.field.name,
          mappedField.model
        ),
        filtering: whereInput,
        ordering: orderByInput,
      }
    })

  const fieldsByType = dmmf.datamodel.models
    .map((m) => dmmf.getOutputType(m.name))
    .reduce<
      Record<
        string,
        {
          fieldName: string
          filtering: DmmfTypes.InputType
          ordering: DmmfTypes.InputType
        }[]
      >
    >((acc, type) => {
      acc[type.name] = type.fields
        .filter((f) => f.outputType.isList && f.outputType.kind === 'object')
        .map((f) => {
          const whereArg = f.args.find((a) => a.name === 'where')!

          const orderByArg = f.args.find((a) => a.name === 'orderBy')!
          const whereInput = dmmf.schema.inputTypes.find((i) => i.name === whereArg.inputType.type)!
          const orderByInput = dmmf.schema.inputTypes.find((i) => i.name === orderByArg.inputType.type)!

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
      filtering: DmmfTypes.InputType
      ordering: DmmfTypes.InputType
    }[]
  ): string => `\
${input
  .map(
    (f) => `    ${f.fieldName}: {
      filtering: ${f.filtering.fields.map((f) => `'${f.name}'`).join(' | ')}
      ordering: ${f.ordering.fields.map((f) => `'${f.name}'`).join(' | ')}
    }`
  )
  .join('\n')}`

  return `\
interface NexusPrismaInputs {
  Query: {
${renderNexusPrismaInput(queriesFields)}
  },
${Object.entries(fieldsByType).map(
    ([modelName, fields]) => `  ${modelName}: {
${renderNexusPrismaInput(fields)}
  }`
  ).join('\n')}
}`
}

function renderNexusPrismaMethods(dmmf: DmmfDocument) {
  return `\
interface NexusPrismaMethods {
${dmmf.datamodel.models.map((m) => `  ${m.name}: Typegen.NexusPrismaFields<'${m.name}'>`).join('\n')}
  Query: Typegen.NexusPrismaFields<'Query'>
  Mutation: Typegen.NexusPrismaFields<'Mutation'>
}`
}

function renderPaginationType(paginationStrategy: PaginationStrategy) {
  return outdent`
    type Pagination = {
    ${paginationStrategy.paginationArgNames.map((argName) => `  ${argName}?: boolean`).join('\n')}
    }`
}

function renderCustomScalars(dmmf: DmmfDocument) {
  if (dmmf.customScalars.length === 0) {
    return `type CustomScalars = 'No custom scalars are used in your Prisma Schema.'`
  }

  return outdent`
    type CustomScalars = ${dmmf.customScalars.map((s) => `'${s}'`).join(' | ')}`
}

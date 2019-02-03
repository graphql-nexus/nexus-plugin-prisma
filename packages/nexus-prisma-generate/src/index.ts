#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import {
  buildASTSchema,
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  isEnumType,
  isInputObjectType,
  isObjectType,
  isScalarType,
  parse,
} from 'graphql'
import * as meow from 'meow'
import { EOL } from 'os'
import { dirname, join } from 'path'
import {
  findDatamodelAndComputeSchema,
  findRootDirectory,
  getImportPathRelativeToOutput,
} from './config'
import { getFinalType, getTypeName, isList, isRequired } from './graphql'

const cli = meow(
  `
    nexus-prisma-generate prisma-client-dir output

    > Generate the TypeScript types for nexus-prisma

    -----
    
    Inputs should be relative to the root of your project

    \`prisma-client-dir\`: Path to your prisma-client directory (eg: ./generated/nexus-prisma/)
    \`output\`: Path to where you want to output the typings (eg: ./generated/nexus-prisma.ts)
`,
)

main(cli)

function main(cli: meow.Result) {
  let [prismaClientDir, output] = cli.input

  if (!prismaClientDir || !existsSync(prismaClientDir)) {
    console.log('No valid `prisma-client-dir` was found')
    process.exit(1)
  }

  if (!output || !output.endsWith('.ts')) {
    console.log('No valid `output` was found. Must point to a .ts file')
    process.exit(1)
  }

  const rootPath = findRootDirectory()
  const typeDefs = findDatamodelAndComputeSchema()
  const schema = buildASTSchema(parse(typeDefs))
  const typesToRender = render(
    schema,
    getImportPathRelativeToOutput(prismaClientDir, output),
  )

  // Create the output directories if needed (mkdir -p)
  mkdirSync(dirname(output), { recursive: true })

  const outputPath = join(rootPath, output)

  writeFileSync(outputPath, typesToRender)
  console.log(`Types generated at ${output}`)
}

function render(schema: GraphQLSchema, prismaClientPath: string) {
  const types = Object.values(schema.getTypeMap())
  const objectTypes = types.filter(
    t => isObjectType(t) && !t.name.startsWith('__'),
  ) as GraphQLObjectType[]
  const inputTypes = types.filter(isInputObjectType)
  const enumTypes = types.filter(
    t => isEnumType(t) && !t.name.startsWith('__'),
  ) as GraphQLEnumType[]

  return `\
// GENERATED TYPES FOR NEXUS-PRISMA. /!\\ DO NOT EDIT MANUALLY

import {
  core
} from 'nexus'
import { GraphQLResolveInfo } from 'graphql'
import * as prisma from '${prismaClientPath}'

declare global {
  interface NexusGen extends NexusPrismaTypes {}
}

${objectTypes.map(renderObjectType).join(EOL)}

${inputTypes.map(renderInputType).join(EOL)}

${renderEnumTypes(enumTypes)}

export interface NexusPrismaTypes {
  objectTypes: {
    fields: {
${objectTypes
  .map(type => `      ${type.name}: ${getObjectTypeFieldsName(type)}`)
  .join(EOL)}
    }
    fieldsDetails: {
${objectTypes
  .map(type => `      ${type.name}: ${getObjectTypeFieldsDetailsName(type)}`)
  .join(EOL)}
    }
  }
  inputTypes: {
    fields: {
${inputTypes
  .map(
    type =>
      `      ${getInputObjectTypeName(type)}: ${getInputObjectTypeFieldsName(
        type,
      )}`,
  )
  .join(EOL)}
    }
  }
  enumTypesNames: ${getEnumTypesName()}
}
  `
}

function renderObjectType(type: GraphQLObjectType) {
  const fields = Object.values(type.getFields())

  return `\
// Types for ${type.name}

${renderFields(type, fields)}

${renderFieldsArgs(type, fields)}

${renderTypeFieldDetails(type, fields)}
`
}

function renderTypeFieldDetails(
  type: GraphQLObjectType,
  fields: GraphQLField<any, any>[],
) {
  return `\
export interface ${getObjectTypeFieldsDetailsName(type)} {
${fields
  .map(
    field => `\
  ${field.name}: {
    args: ${
      field.args.length > 0
        ? `Record<${getTypeFieldArgName(
            type,
            field,
          )}, core.NexusArgDef<string>>`
        : '{}'
    }
    description: string
    list: ${isList(field.type) || false}
    nullable: ${!isRequired(field.type)}
    resolve: (
      root: core.RootValue<"${type.name}">,
      args: ${renderResolverArgs(field)},
      context: core.GetGen<"context">,
      info?: GraphQLResolveInfo
    ) => ${renderResolverReturnType(field)};
  }`,
  )
  .join(EOL)}
}
  `
}

function renderResolverArgs(field: GraphQLField<any, any>) {
  return `{\
 ${field.args
   .map(
     arg => `${arg.name}${isRequired(arg.type) ? '' : '?'}: ${getTSType(arg)}`,
   )
   .join(', ')} }\
  `
}

function renderFields(
  type: GraphQLObjectType,
  fields: GraphQLField<any, any>[],
) {
  return `\
type ${getObjectTypeFieldsName(type)} =
  | ${getExposableFieldsTypeName(type)}
${fields
  .map(
    f =>
      `  | { name: '${f.name}', args?: ${
        f.args.length > 0
          ? `${getTypeFieldArgName(type, f)}[] | false`
          : '[] | false'
      }, alias?: string  } `,
  )
  .join(EOL)}

type ${getExposableFieldsTypeName(type)} =
${fields.map(f => `  | '${f.name}'`).join(EOL)}
`
}

function renderFieldsArgs(
  type: GraphQLObjectType,
  fields: GraphQLField<any, any>[],
) {
  return `\
${fields
  .filter(field => field.args.length > 0)
  .map(field => renderFieldArg(type, field))
  .join(EOL)}
  `
}

function renderFieldArg(
  type: GraphQLObjectType,
  field: GraphQLField<any, any>,
) {
  return `\
type ${getTypeFieldArgName(type, field)} =
${field.args.map(arg => `  | '${arg.name}'`).join(EOL)}`
}

function getTSType(graphqlType: GraphQLField<any, any> | GraphQLInputField) {
  const graphqlToTypescript: Record<string, string> = {
    String: 'string',
    Boolean: 'boolean',
    ID: 'string',
    Int: 'number',
    Float: 'number',
    DateTime: 'string',
  }
  const finalType = getFinalType(graphqlType.type)

  let returnType = ''

  if (isScalarType(finalType)) {
    returnType = graphqlToTypescript[getTypeName(finalType)]
  } else if (isInputObjectType(finalType)) {
    returnType = getInputObjectTypeName(finalType)
  } else {
    returnType = `prisma.${getTypeName(finalType)}`
  }

  if (isList(graphqlType.type)) {
    returnType += '[]'
  }

  if (!isRequired(graphqlType.type)) {
    returnType += ' | null'
  }

  return returnType
}

function renderResolverReturnType(field: GraphQLField<any, any>) {
  const returnType = getTSType(field)

  return `Promise<${returnType}> | ${returnType}`
}

function renderInputType(input: GraphQLInputObjectType) {
  const fields = Object.values(input.getFields())
  return `\
export interface ${getInputObjectTypeName(input)} {
${fields
  .map(
    field =>
      `  ${field.name}${isRequired(input) ? '' : '?'}: ${getTSType(field)}`,
  )
  .join(EOL)}
}
export type ${getInputObjectTypeFieldsName(input)} =
  | Extract<keyof ${getInputObjectTypeName(input)}, string>
${fields.map(f => `  | { name: '${f.name}', alias?: string  } `).join(EOL)}
  `
}

function renderEnumTypes(enums: GraphQLEnumType[]): string {
  return `\
export type ${getEnumTypesName()} =
${enums.map(e => `  | '${e.name}'`).join(EOL)}
  `
}

function getExposableFieldsTypeName(type: GraphQLObjectType) {
  return `${type.name}Fields`
}

function upperFirst(s: string) {
  return s.replace(/^\w/, c => c.toUpperCase())
}

function getTypeFieldArgName(
  type: GraphQLObjectType,
  field: GraphQLField<any, any>,
) {
  return `${type.name}${upperFirst(field.name)}Args`
}

function getObjectTypeFieldsName(type: GraphQLObjectType) {
  return `${type.name}Object`
}

function getInputObjectTypeFieldsName(type: GraphQLInputObjectType) {
  return `${type.name}InputObject`
}

function getObjectTypeFieldsDetailsName(type: GraphQLObjectType) {
  return `${type.name}FieldDetails`
}

function getInputObjectTypeName(type: GraphQLInputObjectType) {
  return `${type.name}`
}

function getEnumTypesName(): string {
  return 'enumTypesNames'
}

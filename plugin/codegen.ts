import { readFileSync, writeFileSync } from 'fs'
import { EOL } from 'os'
import { join } from 'path'
import {
  extractTypes,
  GraphQLTypeField,
  GraphQLTypeObject,
  GraphQLTypes,
} from './source-helper'

codegen()
process.exit(0)

export function codegen(/* schemaPath: string */) {
  const schemaPath =
    '/Users/flavian/Projects/prisma/woopwoop/src/generated/prisma.graphql'
  const typeDefs = readFileSync(schemaPath).toString()
  const types = extractTypes(typeDefs)
  const typesToRender = render(schemaPath, types)
  const outputPath = join(__dirname, '../src/generated/plugins.ts')

  writeFileSync(outputPath, typesToRender)
  console.log('Types generated at plugin.ts')
}

// TODO: Dynamically resolve prisma-client import path
export function render(schemaPath: string, types: GraphQLTypes) {
  const objectTypes = types.types.filter(t => t.type.isObject)

  return `\
// GENERATED TYPES FOR PLUGIN. /!\\ DO NOT EDIT MANUALLY

import {
  ArgDefinition,
  RootValue,
  ArgsValue,
  ContextValue,
  MaybePromise,
  ResultValue,
} from 'gqliteral/dist/types'
import { GraphQLResolveInfo } from 'graphql'

import * as prisma from './prisma-client'

${objectTypes.map(renderType).join(EOL)}

export interface PluginTypes {
  fields: {
${objectTypes
    .map(type => `    ${type.name}: ${getExposableObjectsTypeName(type)}`)
    .join(EOL)}
  }
  aliases: {
${objectTypes
    .map(type => `    ${type.name}: ${getTypeAliasesName(type)}`)
    .join(EOL)}
  }
  objects: {
${objectTypes
    .map(type => `    ${type.name}: ${getTypeObjectName(type)}`)
    .join(EOL)}
  }
}

// declare global {
//   interface GraphQLiteralGen extends PluginTypes {}
// }
  `
}

function renderType(type: GraphQLTypeObject) {
  return `\
// Types for ${type.name}

${renderFields(type)}

${renderFieldsArgs(type)}

${renderAliasFields(type)}

${renderTypeFieldDetails(type)}
`
}

function renderTypeFieldDetails(type: GraphQLTypeObject) {
  return `\
export interface ${getTypeObjectName(type)}<GenTypes = GraphQLiteralGen> {
${type.fields
    .map(
      field => `\
  ${field.name}: {
    args: ${
      field.arguments.length > 0
        ? `Record<${getTypeFieldArgName(type, field)},ArgDefinition>`
        : '{}'
    }
    description: string
    list: ${field.type.isArray || false}
    resolve: (root: RootValue<GenTypes, "${
      type.name
    }">, args: ArgsValue<GenTypes, "${type.name}", "${
        field.name
      }">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => ${renderResolverReturnType(
        field,
      )};
  }`,
    )
    .join(EOL)}
}
  `
}

function renderFields(type: GraphQLTypeObject) {
  return `\
type ${getExposableObjectsTypeName(type)} =
  | ${getExposableFieldsTypeName(type)}
${type.fields
    .map(
      f =>
        `  | { name: '${f.name}', args?: ${
          f.arguments.length > 0
            ? `${getTypeFieldArgName(type, f)}[] | false`
            : '[] | false'
        }, alias?: string  } `,
    )
    .join(EOL)}

type ${getExposableFieldsTypeName(type)} =
${type.fields.map(f => `  | '${f.name}'`).join(EOL)}
`
}

function renderFieldsArgs(type: GraphQLTypeObject) {
  return `\
${type.fields
    .filter(field => field.arguments.length > 0)
    .map(field => renderFieldArg(type, field))
    .join(EOL)}
  `
}

function renderFieldArg(type: GraphQLTypeObject, f: GraphQLTypeField) {
  return `\
type ${getTypeFieldArgName(type, f)} =
${f.arguments.map(arg => `  | '${arg.name}'`).join(EOL)}`
}

function renderAliasFields(type: GraphQLTypeObject) {
  return `\
interface ${getTypeAliasesName(type)} {
  name: ${getExposableFieldsTypeName(type)}
  alias: string
}`
}

function renderResolverReturnType(field: GraphQLTypeField) {
  const graphqlToTypescript: Record<string, string> = {
    String: 'string',
    Boolean: 'boolean',
    ID: 'string',
    Int: 'number',
    Float: 'number',
    DateTime: 'string',
  }

  let returnType = field.type.isScalar
    ? graphqlToTypescript[field.type.name]
    : `prisma.${field.type.name}`

  if (field.type.isArray) {
    returnType += '[]'
  }

  if (!field.type.isRequired) {
    returnType += ' | null'
  }

  return `Promise<${returnType}> | ${returnType}`
}

function getExposableFieldsTypeName(type: GraphQLTypeObject) {
  return `${type.name}Fields`
}

function upperFirst(s: string) {
  return s.replace(/^\w/, c => c.toUpperCase())
}

function getTypeFieldArgName(type: GraphQLTypeObject, field: GraphQLTypeField) {
  return `${type.name}${upperFirst(field.name)}Args`
}

function getExposableObjectsTypeName(type: GraphQLTypeObject) {
  return `${type.name}Object`
}

function getTypeAliasesName(type: GraphQLTypeObject) {
  return `${type.name}Alias`
}

function getTypeObjectName(type: GraphQLTypeObject) {
  return `${type.name}FieldDetails`
}

// function renderArgs(
//   field: GraphQLTypeField,
//   isMutation = false,
//   isTopLevel = false,
// ) {
//   const { arguments: args } = field
//   const hasArgs = args.length > 0

//   const allOptional = args.reduce((acc, curr) => {
//     if (!acc) {
//       return false
//     }

//     return !curr.type.isRequired
//   }, true)

//   // hard-coded for Prisma ease-of-use
//   if (isMutation && field.name.startsWith('create')) {
//     return `data${allOptional ? '?' : ''}: ${this.renderInputFieldTypeHelper(
//       args[0],
//       isMutation,
//     )}`
//   } else if (
//     (isMutation && field.name.startsWith('delete')) || // either it's a delete mutation
//     (!isMutation &&
//       isTopLevel &&
//       args.length === 1 &&
//       (isObjectType(field.type) || isObjectType((field.type as any).ofType))) // or a top-level single query
//   ) {
//     return `where${allOptional ? '?' : ''}: ${this.renderInputFieldTypeHelper(
//       args[0],
//       isMutation,
//     )}`
//   }

//   return `args${allOptional ? '?' : ''}: {${hasArgs ? ' ' : ''}${args
//     .map(
//       a =>
//         `${this.renderFieldName(a, false)}${
//           isNonNullType(a.type) ? '' : '?'
//         }: ${this.renderInputFieldTypeHelper(a, isMutation)}`,
//     )
//     .join(', ')}${args.length > 0 ? ' ' : ''}}`
// }

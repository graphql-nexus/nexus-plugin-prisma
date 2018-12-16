#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { EOL } from 'os'
import { join } from 'path'
import {
  extractTypes,
  GraphQLTypeField,
  GraphQLTypeObject,
  GraphQLTypes,
  GraphQLTypeArgument,
  GraphQLType,
  GraphQLEnumObject,
} from './source-helper'

codegen()

export function codegen(/* schemaPath: string */) {
  const schemaPath = join(process.cwd(), './src/generated/prisma.graphql')
  const typeDefs = readFileSync(schemaPath).toString()
  const types = extractTypes(typeDefs)
  const typesToRender = render(/*schemaPath, */ types)
  const outputPath = join(process.cwd(), './src/generated/nexus-prisma.ts')

  writeFileSync(outputPath, typesToRender)
  console.log('Types generated at src/generated/nexus-prisma.ts')
}

// TODO: Dynamically resolve prisma-client import path
export function render(/*schemaPath: string,*/ types: GraphQLTypes) {
  const objectTypes = types.types.filter(t => t.type.isObject)
  const inputTypes = types.types.filter(t => t.type.isInput)
  const enumTypes = types.enums

  return `\
// GENERATED TYPES FOR PRISMA PLUGIN. /!\\ DO NOT EDIT MANUALLY

import {
  ArgDefinition,
  ContextValue,
  RootValue,
} from 'nexus/dist/types'
import { GraphQLResolveInfo } from 'graphql'

import * as prisma from './prisma-client'

${objectTypes.map(renderType).join(EOL)}

${inputTypes.map(renderInputType).join(EOL)}

${renderEnumTypes(enumTypes)}

export interface PluginTypes {
  fields: {
${objectTypes
    .map(type => `    ${type.name}: ${getExposableObjectsTypeName(type)}`)
    .join(EOL)}
  }
  fieldsDetails: {
${objectTypes
    .map(type => `    ${type.name}: ${getTypeObjectName(type)}`)
    .join(EOL)}
  }
  enumTypesNames: ${getEnumTypesName()}
}

declare global {
  interface GraphQLNexusGen extends PluginTypes {}
}
  `
}

function renderType(type: GraphQLTypeObject) {
  return `\
// Types for ${type.name}

${renderFields(type)}

${renderFieldsArgs(type)}

${renderTypeFieldDetails(type)}
`
}

function renderTypeFieldDetails(type: GraphQLTypeObject) {
  return `\
export interface ${getTypeObjectName(type)}<GenTypes = GraphQLNexusGen> {
${type.fields
    .map(
      field => `\
  ${field.name}: {
    args: ${
      field.arguments.length > 0
        ? `Record<${getTypeFieldArgName(type, field)}, ArgDefinition>`
        : '{}'
    }
    description: string
    list: ${field.type.isArray || false}
    nullable: ${!field.type.isRequired}
    resolve: (
      root: RootValue<GenTypes, "${type.name}">,
      args: ${renderResolverArgs(field)},
      context: ContextValue<GenTypes>,
      info?: GraphQLResolveInfo
    ) => ${renderResolverReturnType(field)};
  }`,
    )
    .join(EOL)}
}
  `
}

function renderResolverArgs(field: GraphQLTypeField) {
  return `{\
 ${field.arguments
   .map(
     arg => `${arg.name}${arg.type.isRequired ? '' : '?'}: ${getTSType(arg)}`,
   )
   .join(', ')} }\
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

function getTSType(graphqlType: GraphQLTypeField | GraphQLTypeArgument) {
  const graphqlToTypescript: Record<string, string> = {
    String: 'string',
    Boolean: 'boolean',
    ID: 'string',
    Int: 'number',
    Float: 'number',
    DateTime: 'string',
  }

  let returnType = ''

  if (graphqlType.type.isScalar) {
    returnType = graphqlToTypescript[graphqlType.type.name]
  } else if (graphqlType.type.isInput) {
    returnType = getInputTypeName(graphqlType.type)
  } else {
    returnType = `prisma.${graphqlType.type.name}`
  }

  if (graphqlType.type.isArray) {
    returnType += '[]'
  }

  if (!graphqlType.type.isRequired) {
    returnType += ' | null'
  }

  return returnType
}

function renderResolverReturnType(field: GraphQLTypeField) {
  const returnType = getTSType(field)

  return `Promise<${returnType}> | ${returnType}`
}

function renderInputType(input: GraphQLTypeObject) {
  return `\
export interface ${getInputTypeName(input)} {
${input.fields
    .map(
      field =>
        `  ${field.name}${field.type.isRequired ? '' : '?'}: ${getTSType(
          field,
        )}`,
    )
    .join(EOL)}
}
  `
}

function renderEnumTypes(enums: GraphQLEnumObject[]): string {
  return `\
export type ${getEnumTypesName()} =
${enums.map(e => `  | '${e.name}'`).join(EOL)}
  `
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

function getTypeObjectName(type: GraphQLTypeObject) {
  return `${type.name}FieldDetails`
}

function getInputTypeName(type: GraphQLTypeObject | GraphQLType) {
  return `${type.name}`
}

function getEnumTypesName(): string {
  return 'enumTypesNames'
}

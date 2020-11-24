import * as Nexus from '@nexus/schema'
import { GraphQLScalarType } from 'graphql'
import { CustomInputArg } from './builder'
import { DmmfDocument, DmmfTypes } from './dmmf'
import { scalarsNameValues } from './graphql'
import { apply, Index } from './utils'

export class Publisher {
  typesPublished: Index<boolean> = {}
  constructor(
    public dmmf: DmmfDocument,
    public nexusBuilder: Nexus.PluginBuilderLens,
    public scalars: Record<string, GraphQLScalarType>
  ) {}

  inputType(
    customArg: CustomInputArg
  ):
    | string
    | Nexus.core.NexusInputObjectTypeDef<string>
    | Nexus.core.NexusEnumTypeDef<string>
    | Nexus.core.NexusScalarTypeDef<string>
    | Nexus.core.NexusArgDef<any>
    | GraphQLScalarType {
    const typeName = customArg.type.name

    // If type is already published, just reference it
    if (this.isPublished(typeName)) {
      return Nexus.arg({
        type: getNexusTypesPipelineForInput(customArg.arg.inputType).reduce(apply, customArg.type.name),
      })
    }

    if (customArg.arg.inputType.kind === 'scalar') {
      return this.publishScalar(customArg.type.name)
    }

    if (customArg.arg.inputType.kind === 'enum') {
      return this.publishEnum(customArg.type.name)
    }

    const inputType = customArg.type as DmmfTypes.InputType

    return this.publishInputObjectType(inputType)
  }

  // Return type of 'any' to prevent a type mismatch with `type` property of nexus
  public outputType(outputTypeName: string, field: DmmfTypes.SchemaField): any {
    /**
     * Rules:
     * - If outputTypeName is already published
     * - Or if outputTypeName matches a prisma model name
     * - Then simply reference the type. Types that matches a prisma model name should be published manually by users.
     */
    if (this.isPublished(outputTypeName) || this.dmmf.hasModel(outputTypeName)) {
      return outputTypeName
    }

    // If output object type, just reference the type
    if (field.outputType.kind === 'object') {
      return this.publishObject(outputTypeName)
    }

    if (this.dmmf.hasEnumType(outputTypeName)) {
      return this.publishEnum(outputTypeName)
    }

    if (field.outputType.kind === 'scalar') {
      return this.publishScalar(outputTypeName)
    }

    return outputTypeName
  }

  protected publishObject(name: string) {
    const dmmfObject = this.dmmf.getOutputType(name)

    this.markTypeAsPublished(name)

    return Nexus.objectType({
      name,
      definition: (t) => {
        for (const field of dmmfObject.fields) {
          t.field(field.name, {
            type: getNexusTypesPipelineForOutput(field.outputType).reduce(apply, field.outputType.type),
          })
        }
      },
    })
  }

  protected publishScalar(typeName: string) {
    if (scalarsNameValues.includes(typeName as any)) {
      return typeName
    }

    this.markTypeAsPublished(typeName)

    if (this.scalars[typeName]) {
      return this.scalars[typeName]
    }

    return Nexus.scalarType({
      name: typeName,
      serialize(value) {
        return value
      },
    })
  }

  protected publishEnum(typeName: string) {
    const dmmfEnum = this.dmmf.getEnumType(typeName)

    this.markTypeAsPublished(typeName)

    return Nexus.enumType({
      name: typeName,
      members: dmmfEnum.values,
    })
  }

  publishInputObjectType(inputType: DmmfTypes.InputType) {
    this.markTypeAsPublished(inputType.name)

    return Nexus.inputObjectType({
      name: inputType.name,
      definition: (t) => {
        inputType.fields.forEach((field) => {
          // TODO: Do not filter JsonFilter once Prisma implements them
          // https://github.com/prisma/prisma/issues/2563
          if (['JsonFilter', 'NullableJsonFilter'].includes(field.inputType.type)) {
            return
          }

          // Simply reference the field input type if it's already been visited, otherwise create it
          let fieldType
          if (this.isPublished(field.inputType.type)) {
            fieldType = field.inputType.type
          } else {
            fieldType = this.inputType({
              arg: field,
              type: this.getTypeFromArg(field),
            })
          }

          t.field(field.name, {
            type: getNexusTypesPipelineForInput(field.inputType).reduce(apply, fieldType) as any,
          })
        })
      },
    })
  }

  protected getTypeFromArg(arg: DmmfTypes.SchemaArg): CustomInputArg['type'] {
    const kindToType = {
      scalar: (typeName: string) => ({
        name: typeName,
      }),
      enum: (typeName: string) => this.dmmf.getEnumType(typeName),
      object: (typeName: string) => this.dmmf.getInputType(typeName),
    }

    return kindToType[arg.inputType.kind](arg.inputType.type)
  }

  isPublished(typeName: string) {
    // If the user's app has published a type of the same name treat it as an
    // override to us auto publishing.
    return this.nexusBuilder.hasType(typeName) || this.typesPublished[typeName]
  }

  markTypeAsPublished(typeName: string) {
    this.typesPublished[typeName] = true
  }
}

/**
 * Get the pipeline of Nexus type def functions that will match the nullability and list types of the Prisma field type.
 *
 * For example { isList:true, isRequired: true } would result in array of funcs: [nonNull, list, nonNull]
 */
export const getNexusTypesPipelineForInput = (fieldType: DmmfTypes.SchemaArg['inputType']) => {
  const nexusTypes = []

  if (fieldType.isList) {
    nexusTypes.push(Nexus.nonNull)
    nexusTypes.push(Nexus.list)
  } else if (fieldType.isRequired === true) {
    nexusTypes.push(Nexus.nonNull)
  } else if (fieldType.isRequired === false) {
    nexusTypes.push(Nexus.nullable)
  }

  return nexusTypes
}

export const getNexusTypesPipelineForOutput = (fieldType: DmmfTypes.SchemaField['outputType']) => {
  const nexusTypes = []

  if (fieldType.isList) {
    nexusTypes.push(Nexus.nonNull)
    nexusTypes.push(Nexus.list)
    nexusTypes.push(Nexus.nonNull)
  } else if (fieldType.isRequired === true) {
    nexusTypes.push(Nexus.nonNull)
  } else if (fieldType.isRequired === false) {
    nexusTypes.push(Nexus.nullable)
  }

  return nexusTypes
}

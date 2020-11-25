import * as Nexus from '@nexus/schema'
import { GraphQLScalarType } from 'graphql'
import { CustomInputArg } from './builder'
import { DmmfDocument, InternalDMMF } from './dmmf'
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
      // NOTE the any cast is to get around this error in CI:
      // https://github.com/graphql-nexus/nexus-plugin-prisma/runs/1453859042#step:7:9
      return Nexus.arg({
        type: getNexusTypesCompositionForInput(customArg.arg.inputType).reduceRight(
          apply,
          customArg.type.name
        ) as any,
      })
    }

    if (customArg.arg.inputType.kind === 'scalar') {
      return this.publishScalar(customArg.type.name)
    }

    if (customArg.arg.inputType.kind === 'enum') {
      return this.publishEnum(customArg.type.name)
    }

    const inputType = customArg.type as InternalDMMF.InputType

    return this.publishInputObjectType(inputType)
  }

  // Return type of 'any' to prevent a type mismatch with `type` property of nexus
  public outputType(outputTypeName: string, field: InternalDMMF.SchemaField): any {
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
            type: getNexusTypesCompositionForOutput(field.outputType).reduceRight(
              apply,
              field.outputType.type
            ),
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

  publishInputObjectType(inputType: InternalDMMF.InputType) {
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
            type: getNexusTypesCompositionForInput(field.inputType).reduceRight(apply, fieldType) as any,
          })
        })
      },
    })
  }

  protected getTypeFromArg(arg: InternalDMMF.SchemaArg): CustomInputArg['type'] {
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
 * Get the composition-order pipeline of Nexus type def functions that will match the nullability and list types of the Prisma field type.
 *
 * For example { isList:true, isRequired: true } would result in array of funcs: [nonNull, list, nonNull]
 */
export const getNexusTypesCompositionForInput = (fieldType: InternalDMMF.SchemaArg['inputType']) => {
  if (fieldType.isList) {
    return [Nexus.list, Nexus.nonNull]
  } else if (fieldType.isRequired === true) {
    return [Nexus.nonNull]
  } else if (fieldType.isRequired === false) {
    return [Nexus.nullable]
  }

  return [] as Function[]
}

export const getNexusTypesCompositionForOutput = (fieldType: InternalDMMF.SchemaField['outputType']) => {
  if (fieldType.isList) {
    return [Nexus.nonNull, Nexus.list, Nexus.nonNull]
  } else if (fieldType.isRequired === true) {
    return [Nexus.nonNull]
  } else if (fieldType.isRequired === false) {
    return [Nexus.nullable]
  }

  return [] as Function[]
}

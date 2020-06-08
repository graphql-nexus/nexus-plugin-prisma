import * as Nexus from '@nexus/schema'
import { CustomInputArg } from './builder'
import { DmmfDocument, DmmfTypes } from './dmmf'
import { scalarsNameValues } from './graphql'
import { dmmfFieldToNexusFieldConfig, Index } from './utils'

export class Publisher {
  typesPublished: Index<boolean> = {}
  constructor(
    public dmmf: DmmfDocument,
    public nexusBuilder: Nexus.PluginBuilderLens,
  ) {}

  inputType(
    customArg: CustomInputArg,
  ):
    | string
    | Nexus.core.NexusInputObjectTypeDef<string>
    | Nexus.core.NexusEnumTypeDef<string>
    | Nexus.core.NexusScalarTypeDef<string>
    | Nexus.core.NexusArgDef<any> {
    const typeName = customArg.type.name

    // If type is already published, just reference it
    if (this.isPublished(typeName)) {
      return Nexus.arg(
        dmmfFieldToNexusFieldConfig({
          ...customArg.arg.inputType,
          type: customArg.type.name,
        }),
      )
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
    if (
      this.isPublished(outputTypeName) ||
      this.dmmf.hasModel(outputTypeName)
    ) {
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
      definition: t => {
        for (const field of dmmfObject.fields) {
          t.field(field.name, dmmfFieldToNexusFieldConfig(field.outputType))
        }
      },
    })
  }

  protected publishScalar(typeName: string) {
    if (scalarsNameValues.includes(typeName as any)) {
      return typeName
    }

    this.markTypeAsPublished(typeName)

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
      definition: t => {
        inputType.fields
          .map(field => {
            // TODO: Do not filter JsonFilter once Prisma implements them
            if (field.inputType.type === 'JsonFilter') {
              return null
            }

            return {
              ...field,
              inputType: {
                ...field.inputType,
                type: this.isPublished(field.inputType.type)
                  ? // Simply reference the field input type if it's already been visited, otherwise create it
                    field.inputType.type
                  : this.inputType({
                      arg: field,
                      type: this.getTypeFromArg(field),
                    }),
              },
            }
          })
          .forEach(field => {
            if (field) {
              t.field(field.name, dmmfFieldToNexusFieldConfig(field.inputType))
            }
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
    // overide to us auto publishing.
    return this.nexusBuilder.hasType(typeName) || this.typesPublished[typeName]
  }

  markTypeAsPublished(typeName: string) {
    this.typesPublished[typeName] = true
  }
}

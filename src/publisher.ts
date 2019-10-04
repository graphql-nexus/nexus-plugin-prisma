import * as Nexus from 'nexus'
import * as DMMF from './dmmf'
import { dmmfFieldToNexusFieldConfig, partition } from './utils'
import { CustomInputArg } from './builder'
import { scalarsNameValues } from './graphql'

export class Publisher {
  constructor(
    protected dmmf: DMMF.DMMF,
    protected publishedTypesMap: Record<string, boolean>,
  ) {}

  public inputType(
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

    const inputType = customArg.type as DMMF.Data.InputType

    return this.publishInputObjectType(inputType)
  }

  // Return type of 'any' to prevent a type mismatch with `type` property of nexus
  public outputType(outputTypeName: string, field: DMMF.Data.SchemaField): any {
    // If type is already published, just reference it
    if (this.isPublished(outputTypeName)) {
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
    this.markTypeAsPublished(name)
    const dmmfObject = this.dmmf.getOutputType(name)
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

  protected publishInputObjectType(inputType: DMMF.Data.InputType) {
    this.markTypeAsPublished(inputType.name)

    return Nexus.inputObjectType({
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
            type: this.isPublished(field.inputType.type)
              ? // Simply reference the field input type if it's already been visited, otherwise create it
                field.inputType.type
              : this.inputType({
                  arg: field,
                  type: this.getTypeFromArg(field),
                }),
          },
        }))
        ;[...scalarFields, ...remappedObjectFields].forEach(field => {
          t.field(field.name, dmmfFieldToNexusFieldConfig(field.inputType))
        })
      },
    })
  }

  protected getTypeFromArg(arg: DMMF.Data.SchemaArg) {
    const kindToType = {
      scalar: (typeName: string) => ({
        name: this.dmmf.getOutputType(typeName).name,
      }),
      enum: (typeName: string) => this.dmmf.getEnumType(typeName),
      object: (typeName: string) => this.dmmf.getInputType(typeName),
    }

    return kindToType[arg.inputType.kind](arg.inputType.type)
  }

  protected isPublished(typeName: string) {
    return this.publishedTypesMap[typeName]
  }

  protected markTypeAsPublished(typeName: string) {
    this.publishedTypesMap[typeName] = true
  }
}

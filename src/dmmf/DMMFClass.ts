import * as Photon from '@prisma/photon'
import { ExternalDMMF as DMMF, transform } from './transformer'
import { indexBy, Index } from '../utils'

export function fromPhotonDMMF(photonDMMF: Photon.DMMF.Document): DMMFClass {
  return new DMMFClass(transform(photonDMMF))
}

export class DMMFClass implements DMMF.Document {
  public datamodel: DMMF.Datamodel
  public schema: DMMF.Schema
  public mappings: DMMF.Mapping[]
  public queryType: DMMF.OutputType
  public mutationType: DMMF.OutputType
  public outputTypes: DMMF.OutputType[]
  public outputTypesIndex: Index<DMMF.OutputType> = {}
  public inputTypes: DMMF.InputType[]
  public inputTypesIndex: Index<DMMF.InputType>
  public enumsIndex: Index<DMMF.Enum>
  public modelsIndex: Index<DMMF.Model>

  constructor({ datamodel, schema, mappings }: DMMF.Document) {
    this.datamodel = datamodel
    this.schema = schema
    this.mappings = mappings

    this.queryType = schema.outputTypes.find(t => t.name === 'Query')!
    this.mutationType = schema.outputTypes.find(t => t.name === 'Mutation')!

    this.modelsIndex = indexBy('name', datamodel.models)
    this.enumsIndex = indexBy('name', schema.enums)

    this.inputTypes = schema.inputTypes
    this.inputTypesIndex = indexBy('name', schema.inputTypes)

    this.outputTypes = schema.outputTypes
    this.outputTypesIndex = indexBy('name', schema.outputTypes)
  }

  getInputType(inputTypeName: string) {
    const inputType = this.inputTypesIndex[inputTypeName]

    if (!inputType) {
      throw new Error('Could not find input type name: ' + inputTypeName)
    }

    return inputType
  }

  getOutputType(outputTypeName: string) {
    const outputType = this.outputTypesIndex[outputTypeName]

    if (!outputType) {
      throw new Error('Could not find output type name: ' + outputTypeName)
    }

    return outputType
  }

  hasOutputType(outputTypeName: string) {
    const outputType = this.outputTypesIndex[outputTypeName]

    if (!outputType) {
      return false
    }

    return true
  }

  getEnumType(enumTypeName: string) {
    const enumType = this.enumsIndex[enumTypeName]

    if (!enumType) {
      throw new Error('Could not find enum type name: ' + enumTypeName)
    }

    return enumType
  }

  hasEnumType(enumTypeName: string) {
    const enumType = this.enumsIndex[enumTypeName]

    if (!enumType) {
      return false
    }

    return true
  }

  getModelOrThrow(modelName: string) {
    const model = this.modelsIndex[modelName]

    if (!model) {
      throw new Error('Could not find model for model: ' + modelName)
    }

    return model
  }

  hasModel(modelName: string) {
    const model = this.modelsIndex[modelName]

    if (!model) {
      return false
    }

    return true
  }

  getMapping(modelName: string) {
    const mapping = this.mappings.find(m => m.model === modelName)

    if (!mapping) {
      throw new Error('Could not find mapping for model: ' + modelName)
    }

    return mapping
  }
}

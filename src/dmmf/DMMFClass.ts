import { ExternalDMMF as DMMF } from './types'
import { keyBy } from '../utils'

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
  public enumMap: Index<DMMF.Enum>
  public modelMap: Index<DMMF.Model>

  constructor({ datamodel, schema, mappings }: DMMF.Document) {
    this.datamodel = datamodel
    this.schema = schema
    this.mappings = mappings

    this.enumMap = this.getEnumMap()
    this.queryType = this.getQueryType()
    this.mutationType = this.getMutationType()
    this.modelMap = this.getModelMap()

    this.inputTypes = this.schema.inputTypes
    this.inputTypesIndex = this.getInputTypeMap()

    this.outputTypes = this.schema.outputTypes
    this.outputTypesIndex = this.getOutputTypeMap()

    // needed as references are not kept
    this.queryType = this.outputTypesIndex.Query
    this.mutationType = this.outputTypesIndex.Mutation
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

  getEnumType(enumTypeName: string) {
    const enumType = this.enumMap[enumTypeName]

    if (!enumType) {
      throw new Error('Could not find enum type name: ' + enumTypeName)
    }

    return enumType
  }

  getModelOrThrow(modelName: string) {
    const model = this.modelMap[modelName]

    if (!model) {
      throw new Error('Could not find model for model: ' + modelName)
    }

    return model
  }

  hasModel(modelName: string) {
    const model = this.modelMap[modelName]

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

  protected getQueryType(): DMMF.OutputType {
    return this.schema.outputTypes.find(t => t.name === 'Query')!
  }
  protected getMutationType(): DMMF.OutputType {
    return this.schema.outputTypes.find(t => t.name === 'Mutation')!
  }
  protected getEnumMap(): Index<DMMF.Enum> {
    return keyBy(this.schema.enums, e => e.name)
  }
  protected getModelMap(): Index<DMMF.Model> {
    return keyBy(this.datamodel.models, m => m.name)
  }
  protected getOutputTypeMap(): Index<DMMF.OutputType> {
    return keyBy(this.outputTypes, t => t.name)
  }
  protected getInputTypeMap(): Index<DMMF.InputType> {
    return keyBy(this.schema.inputTypes, t => t.name)
  }
}

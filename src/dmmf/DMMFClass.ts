import { ExternalDMMF as DMMF } from './dmmf-types'
import { keyBy } from '../utils'

type Dictionary<T> = Record<string, T>

export class DMMFClass implements DMMF.Document {
  public datamodel: DMMF.Datamodel
  public schema: DMMF.Schema
  public mappings: DMMF.Mapping[]
  public queryType: DMMF.OutputType
  public mutationType: DMMF.OutputType
  public outputTypes: DMMF.OutputType[]
  public outputTypeMap: Dictionary<DMMF.OutputType> = {}
  public inputTypes: DMMF.InputType[]
  public inputTypeMap: Dictionary<DMMF.InputType>
  public enumMap: Dictionary<DMMF.Enum>
  public modelMap: Dictionary<DMMF.Model>

  constructor({ datamodel, schema, mappings }: DMMF.Document) {
    this.datamodel = datamodel
    this.schema = schema
    this.mappings = mappings

    this.enumMap = this.getEnumMap()
    this.queryType = this.getQueryType()
    this.mutationType = this.getMutationType()
    this.modelMap = this.getModelMap()

    this.inputTypes = this.schema.inputTypes
    this.inputTypeMap = this.getInputTypeMap()

    this.outputTypes = this.schema.outputTypes
    this.outputTypeMap = this.getOutputTypeMap()

    // needed as references are not kept
    this.queryType = this.outputTypeMap.Query
    this.mutationType = this.outputTypeMap.Mutation
  }

  getInputType(inputTypeName: string) {
    const inputType = this.inputTypeMap[inputTypeName]

    if (!inputType) {
      throw new Error('Could not find input type name: ' + inputTypeName)
    }

    return inputType
  }

  getOutputType(outputTypeName: string) {
    const outputType = this.outputTypeMap[outputTypeName]

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
  protected getEnumMap(): Dictionary<DMMF.Enum> {
    return keyBy(this.schema.enums, e => e.name)
  }
  protected getModelMap(): Dictionary<DMMF.Model> {
    return keyBy(this.datamodel.models, m => m.name)
  }
  protected getOutputTypeMap(): Dictionary<DMMF.OutputType> {
    return keyBy(this.outputTypes, t => t.name)
  }
  protected getInputTypeMap(): Dictionary<DMMF.InputType> {
    return keyBy(this.schema.inputTypes, t => t.name)
  }
}

import { scalarsNameValues } from '../graphql'
import { Index, indexBy } from '../utils'
import { InternalDMMF } from './DmmfTypes'

export class DmmfDocument implements InternalDMMF.Document {
  public datamodel: InternalDMMF.Datamodel
  public schema: InternalDMMF.Schema
  public operations: InternalDMMF.Mapping[]
  public queryObject: OutputType
  public mutationObject: OutputType
  public outputTypesIndex: Index<InternalDMMF.OutputType> = {}
  public inputTypesIndex: Index<InternalDMMF.InputType>
  public mappingsIndex: Index<InternalDMMF.Mapping>
  public enumsIndex: Index<InternalDMMF.SchemaEnum>
  public modelsIndex: Index<InternalDMMF.Model>
  public inputTypesIndexWithFields: InputTypeIndexWithField
  public customScalars: Array<string>

  constructor({ datamodel, schema, operations }: InternalDMMF.Document) {
    // ExternalDMMF
    this.datamodel = datamodel
    this.schema = schema
    this.operations = operations

    // Indices
    this.modelsIndex = indexBy(datamodel.models, 'name')
    this.enumsIndex = indexBy(schema.enums, 'name')
    this.inputTypesIndex = indexBy(schema.inputTypes, 'name')
    this.outputTypesIndex = indexBy(schema.outputTypes, 'name')
    this.mappingsIndex = indexBy(operations, 'model')
    this.inputTypesIndexWithFields = indexInputTypeWithFields(schema.inputTypes)
    this.customScalars = findCustomScalars(datamodel.models)

    // Entrypoints
    this.queryObject = this.getOutputType('Query')
    this.mutationObject = this.getOutputType('Mutation')
  }

  getInputType(inputTypeName: string) {
    const inputType = this.inputTypesIndex[inputTypeName]

    if (!inputType) {
      throw new Error('Could not find input type name: ' + inputTypeName)
    }

    return inputType
  }

  getInputTypeWithIndexedFields(inputTypeName: string) {
    const inputType = this.inputTypesIndexWithFields[inputTypeName]

    if (!inputType) {
      throw new Error('Could not find input type name: ' + inputTypeName)
    }

    return inputType
  }

  getOutputType(outputTypeName: string): OutputType {
    const outputType = this.outputTypesIndex[outputTypeName]

    if (!outputType) {
      throw new Error('Could not find output type name: ' + outputTypeName)
    }

    return new OutputType(outputType)
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
    const mapping = this.mappingsIndex[modelName]

    if (!mapping) {
      throw new Error('Could not find mapping for model: ' + modelName)
    }

    return mapping
  }
}

export class OutputType {
  public name: string
  public fields: InternalDMMF.SchemaField[]
  public isEmbedded?: boolean

  constructor(protected outputType: InternalDMMF.OutputType) {
    this.name = outputType.name
    this.fields = outputType.fields
    this.isEmbedded = outputType.isEmbedded
  }

  getField(fieldName: string) {
    const field = this.outputType.fields.find((f) => f.name === fieldName)

    if (!field) {
      throw new Error(
        `Could not find field '${this.outputType.name}.${fieldName}' on type ${this.outputType.name}`
      )
    }

    return field
  }
}

type InputTypeIndexWithField = Index<
  Omit<InternalDMMF.InputType, 'fields'> & {
    fields: Index<InternalDMMF.SchemaArg>
  }
>

function indexInputTypeWithFields(inputTypes: InternalDMMF.InputType[]) {
  const indexedInputTypes: InputTypeIndexWithField = {}

  for (const inputType of inputTypes) {
    const indexedFields = indexBy(inputType.fields, 'name')

    indexedInputTypes[inputType.name] = {
      ...inputType,
      fields: indexedFields,
    }
  }

  return indexedInputTypes
}

function findCustomScalars(models: InternalDMMF.Model[]): Array<string> {
  const customScalars = new Set<string>()

  for (const model of models) {
    for (const field of model.fields) {
      if (field.kind === 'scalar' && !scalarsNameValues.includes(field.type as any)) {
        customScalars.add(field.type)
      }
    }
  }

  return [...customScalars]
}

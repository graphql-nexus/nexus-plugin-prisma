import { InternalDMMF, ExternalDMMF } from './types'

export function transform(doc: InternalDMMF.Document): ExternalDMMF.Document {
  return {
    datamodel: doc.datamodel,
    mappings: doc.mappings as ExternalDMMF.Mapping[],
    schema: {
      enums: doc.schema.enums,
      inputTypes: doc.schema.inputTypes.map(inputType => ({
        ...inputType,
        fields: inputType.fields.map(convertArg),
      })),
      outputTypes: doc.schema.outputTypes.map(o => ({
        ...o,
        fields: o.fields.map(f => ({
          ...f,
          args: f.args.map(convertArg),
        })),
      })),
    },
  }
}

function convertArg(arg: InternalDMMF.SchemaArg): ExternalDMMF.SchemaArg {
  return {
    ...arg,
    inputType: convertArgType(arg.inputType),
  }
}

/**
 * This function implements heuristics to convert an arg type from
 * Photon to an arg type in GraphQL. A conversion is needed becuase
 * GraphQL does not support union types on args, but Photon does.
 */
function convertArgType(
  photonFieldParamType: InternalDMMF.SchemaArgInputType[],
): InternalDMMF.SchemaArgInputType {
  // FIXME: *Enum*Filter are currently empty
  const enumMember = photonFieldParamType.find(fpt => fpt.kind === 'enum')
  if (enumMember) return enumMember

  const objectMember = photonFieldParamType.find(fpt => fpt.kind === 'object')
  if (objectMember) return objectMember

  const someMember = photonFieldParamType[0]
  if (someMember) return someMember

  throw new Error(
    'Invariant violation: Encountered Photon field arg union type with zero members.',
  )
}

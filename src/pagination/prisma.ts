import { PaginationStrategy } from '.'
import { Helpers as DMMFHelpers, InternalDMMF } from '../dmmf'
import { keys } from '../utils'

interface PrismaPaginationArgs {
  cursor?: object
  take?: number
  skip?: number
}

const prismaPaginationArgsToDmmfArgs: Record<
  'take' | 'skip' | 'cursor',
  (typeName: string) => InternalDMMF.SchemaArg
> = {
  take: () => ({
    name: 'take',
    inputType: {
      type: 'Int',
      kind: 'scalar',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
  skip: () => ({
    name: 'skip',
    inputType: {
      type: 'Int',
      kind: 'scalar',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
  cursor: (typeName: string) => ({
    name: 'cursor',
    inputType: {
      type: `${typeName}WhereUniqueInput`,
      kind: 'object',
      isRequired: false,
      isList: false,
      isNullable: false,
    },
  }),
}

export const prismaStrategy: PaginationStrategy<PrismaPaginationArgs> = {
  paginationArgNames: keys(prismaPaginationArgsToDmmfArgs),
  transformDmmfArgs({ paginationArgNames, args, field }) {
    // todo why not using internal dmmf here?
    const fieldOutputTypeName = DMMFHelpers.getTypeName(field.outputType.type)

    // Remove old pagination args
    args = args.filter((dmmfArg) => !paginationArgNames.includes(dmmfArg.name))

    // Push new pagination args
    args.push(
      prismaPaginationArgsToDmmfArgs.take(fieldOutputTypeName),
      prismaPaginationArgsToDmmfArgs.skip(fieldOutputTypeName),
      prismaPaginationArgsToDmmfArgs.cursor(fieldOutputTypeName)
    )

    return args
  },
  resolve(args) {
    return args
  },
}

// cSpell:word DMMF
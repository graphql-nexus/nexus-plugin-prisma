import { PaginationStrategy } from '.'
import { DmmfTypes, getReturnTypeName } from '../dmmf'
import { keys } from '../utils'

interface PrismaPaginationArgs {
  cursor?: object
  take?: number
  skip?: number
}

const prismaPaginationArgsToDmmfArgs: Record<
  'take' | 'skip' | 'cursor',
  (typeName: string) => DmmfTypes.SchemaArg
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

export const prismaStraegy: PaginationStrategy<PrismaPaginationArgs> = {
  paginationArgNames: keys(prismaPaginationArgsToDmmfArgs),
  transformDmmfArgs({ paginationArgNames, args, field }) {
    const fieldOutputTypeName = getReturnTypeName(field.outputType.type)

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

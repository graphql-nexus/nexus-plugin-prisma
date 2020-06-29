import { DmmfTypes, DmmfDocument } from '../../../src/schema/dmmf'
import { getCrudMappedFields } from '../../../src/schema/mapping'
import { OperationName } from '../../../src/schema/naming-strategies'
import { transformNullsToUndefined } from '../../../src/schema/null'
import { indexBy } from '../../../src/schema/utils'
import { getDmmf } from '../__utils'

const operationToRoot: Record<OperationName, 'Query' | 'Mutation'> = {
  findOne: 'Query',
  findMany: 'Query',
  create: 'Mutation',
  delete: 'Mutation',
  deleteMany: 'Mutation',
  update: 'Mutation',
  updateMany: 'Mutation',
  upsert: 'Mutation',
}

async function getSchemaArgsForCrud(
  datamodel: string,
  model: string,
  operation: OperationName
): Promise<{
  schemaArgs: Record<string, DmmfTypes.SchemaArg>
  dmmf: DmmfDocument
}> {
  const dmmf = await getDmmf(datamodel)
  const mappedField = getCrudMappedFields(operationToRoot[operation], dmmf).find(
    (x) => x.operation === operation && x.model === model
  )

  if (!mappedField) {
    throw new Error(`Could not find mapped fields for model ${model} and operation ${operation}`)
  }

  return {
    schemaArgs: indexBy(mappedField.field.args, 'name'),
    dmmf,
  }
}

test('findMany: converts nulls to undefined when fields are not nullable', async () => {
  const datamodel = `
  model User {
    id        String   @default(cuid()) @id
    email     String?  @unique
    birthDate DateTime
    posts     Post[]
  }
  
  model Post {
    id      String @default(cuid()) @id
    authors User[] @relation(references: [id])
  }
  `
  const { dmmf, schemaArgs } = await getSchemaArgsForCrud(datamodel, 'User', 'findMany')
  const incomingArgs = {
    before: null, // not nullable
    after: null, // not nullable
    first: 1,
    orderBy: {
      email: null, // nullable
      birthDate: null, // nullable
      id: 'asc',
    },
    where: {
      AND: null, // not nullable
      NOT: {
        AND: {
          birthDate: null, // not nullable
        },
        posts: null,
      },
    },
  }

  const result = transformNullsToUndefined(incomingArgs, schemaArgs, dmmf)

  expect(result).toMatchSnapshot()
})

test('create: converts nulls to undefined when fields are not nullable', async () => {
  const datamodel = `
  model User {
    id        String   @default(cuid()) @id
    email     String?  @unique
    birthDate DateTime
    posts     Post[]
  }
  
  model Post {
    id      String @default(cuid()) @id
    authors User[] @relation(references: [id])
  }
  `
  const { dmmf, schemaArgs } = await getSchemaArgsForCrud(datamodel, 'User', 'create')
  const incomingArgs = {
    data: {
      id: null, // not nullable
      posts: {
        connect: null, // not nullable
        create: {
          id: 'titi',
        },
      },
    },
  }

  const result = transformNullsToUndefined(incomingArgs, schemaArgs, dmmf)

  expect(result).toMatchSnapshot()
})

test('model filtering: converts nulls to undefined when fields are not nullable', async () => {
  const datamodel = `
  model User {
    id        String   @default(cuid()) @id
    email     String?  @unique
    birthDate DateTime
    posts     Post[]
  }
  
  model Post {
    id      String @default(cuid()) @id
    authors User[] @relation(references: [id])
  }
  `
  const dmmf = await getDmmf(datamodel)
  const schemaArgs = dmmf.getOutputType('User').fields.find((f) => f.name === 'posts')?.args!
  const indexedSchemaArgs = indexBy(schemaArgs, 'name')
  const incomingArgs = {
    where: {
      id: null, // not nullable
      authors: {
        every: {
          email: null,
          birthDate: null, // not nullable
          posts: null,
        },
      },
    },
  }

  const result = transformNullsToUndefined(incomingArgs, indexedSchemaArgs, dmmf)

  expect(result).toMatchSnapshot()
})

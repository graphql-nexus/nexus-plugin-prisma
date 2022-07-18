import { DmmfDocument, InternalDMMF } from '../../src/dmmf'
import { getCrudMappedFields } from '../../src/mapping'
import { OperationName } from '../../src/naming-strategies'
import { transformNullsToUndefined } from '../../src/null'
import { indexBy } from '../../src/utils'
import { getDmmf } from '../__utils'

const operationToRoot: Record<OperationName, 'Query' | 'Mutation'> = {
  findUnique: 'Query',
  findMany: 'Query',
  create: 'Mutation',
  delete: 'Mutation',
  deleteMany: 'Mutation',
  update: 'Mutation',
  updateMany: 'Mutation',
  upsert: 'Mutation',
  aggregate: 'Query',
  createMany: 'Mutation',
  groupBy: 'Query',
}

async function getSchemaArgsForCrud(
  datamodel: string,
  model: string,
  operation: OperationName
): Promise<{
  schemaArgs: Record<string, InternalDMMF.SchemaArg>
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
      posts     Post[]   @relation("PostAuthors")
    }
    
    model Post {
      id      String @default(cuid()) @id
      authors User[] @relation("PostAuthors")
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
    posts     Post[]   @relation("PostAuthors")
  }
  
  model Post {
    id      String @default(cuid()) @id
    authors User[] @relation("PostAuthors")
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
    posts     Post[]   @relation("PostAuthors")
  }
  
  model Post {
    id      String @default(cuid()) @id
    authors User[] @relation("PostAuthors")
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

test('do not convert args that are arrays', async () => {
  const datamodel = `
  model User {
    id        String   @default(cuid()) @id
    email     String?  @unique
    birthDate DateTime
    posts     Post[]   @relation("PostAuthors")
  }
  
  model Post {
    id      String @default(cuid()) @id
    authors User[] @relation("PostAuthors")
  }
  `
  const dmmf = await getDmmf(datamodel)
  const schemaArgs = dmmf.getOutputType('User').fields.find((f) => f.name === 'posts')?.args!
  const indexedSchemaArgs = indexBy(schemaArgs, 'name')
  const incomingArgs = {
    where: {
      OR: [{ something: true }, { something: false }],
    },
  }

  const result = transformNullsToUndefined(incomingArgs, indexedSchemaArgs, dmmf)

  expect(result).toMatchSnapshot()
})

test('safely transforms json fields', async () => {
  const datamodel = `
  datasource db {
    provider = "postgresql"
    url      = "postgresql://"
  }

  model User {
    id  Int @id @default(autoincrement())
    json1 Json
    json2 Json
    optionalJson1 Json?
    optionalJson2 Json?
  }
  `
  const { dmmf, schemaArgs } = await getSchemaArgsForCrud(datamodel, 'User', 'create')

  const incomingArgs = {
    data: {
      json1: null, // not nullable
      json2: { someRandomJson: 'titi' },
      optionalJson1: null,
      optionalJson2: { someRandomJson: 'titi' },
    },
  }

  const result = transformNullsToUndefined(incomingArgs, schemaArgs, dmmf)

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "json1": undefined,
        "json2": Object {
          "someRandomJson": "titi",
        },
        "optionalJson1": null,
        "optionalJson2": Object {
          "someRandomJson": "titi",
        },
      },
    }
  `)
})

import { shouldRelyOnDefaultResolver } from '../src/resolver'
import nexusPrismaSchema from './prisma/nexus-prisma'
import { buildClientSchema, GraphQLObjectType } from 'graphql'

const schema = buildClientSchema(nexusPrismaSchema.schema as any)

const getField = (typeName: string, fieldName: string) => {
  const type = schema.getType(typeName) as GraphQLObjectType

  return type.getFields()[fieldName]
}

describe('shouldRelyOnDefaultResolver', () => {
  it('should return true for scalars fields', () => {
    const typeName = 'Post'
    const idField = getField(typeName, 'id')
    const stringField = getField(typeName, 'title')
    const booleanField = getField(typeName, 'published')

    expect(shouldRelyOnDefaultResolver(typeName, idField)).toEqual(true)
    expect(shouldRelyOnDefaultResolver(typeName, stringField)).toEqual(true)
    expect(shouldRelyOnDefaultResolver(typeName, booleanField)).toEqual(true)
  })

  it('should return true for *Connection.edges & *Connection.pageInfo, except aggregate', () => {
    const typeName = 'PostConnection'
    const pageInfo = getField(typeName, 'pageInfo')
    const edges = getField(typeName, 'edges')
    const aggregate = getField(typeName, 'aggregate')

    expect(shouldRelyOnDefaultResolver(typeName, pageInfo)).toEqual(true)
    expect(shouldRelyOnDefaultResolver(typeName, edges)).toEqual(true)
    expect(shouldRelyOnDefaultResolver(typeName, aggregate)).toEqual(false)
  })

  it('should return false for all fields in Query/Mutation', () => {
    const types = ['Query', 'Mutation']

    types.forEach(typeName => {
      const fieldsNames = Object.keys(
        (schema.getType(typeName) as GraphQLObjectType).getFields(),
      )

      fieldsNames.forEach(fieldName => {
        const fieldToResolve = getField(typeName, fieldName)

        expect(shouldRelyOnDefaultResolver(typeName, fieldToResolve)).toEqual(
          false,
        )
      })
    })
  })
})

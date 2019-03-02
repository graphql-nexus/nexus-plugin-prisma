import { shouldRelyOnDefaultResolver } from '../src/resolver'
import { GraphQLObjectType } from 'graphql'
import { mockedDatamodelInfo } from './prisma/mockedArtifacts'

const getField = (typeName: string, fieldName: string) => {
  const type = mockedDatamodelInfo.schema.getType(typeName) as GraphQLObjectType

  return type.getFields()[fieldName]
}

describe('shouldRelyOnDefaultResolver', () => {
  it('should return true for scalars fields', () => {
    const typeName = 'Post'
    const idField = getField(typeName, 'id')
    const stringField = getField(typeName, 'title')
    const booleanField = getField(typeName, 'published')

    expect(
      shouldRelyOnDefaultResolver(typeName, idField, mockedDatamodelInfo),
    ).toEqual(true)
    expect(
      shouldRelyOnDefaultResolver(typeName, stringField, mockedDatamodelInfo),
    ).toEqual(true)
    expect(
      shouldRelyOnDefaultResolver(typeName, booleanField, mockedDatamodelInfo),
    ).toEqual(true)
  })

  it('should return true for *Connection.edges & *Connection.pageInfo, except aggregate', () => {
    const typeName = 'PostConnection'
    const pageInfo = getField(typeName, 'pageInfo')
    const edges = getField(typeName, 'edges')
    const aggregate = getField(typeName, 'aggregate')

    expect(
      shouldRelyOnDefaultResolver(typeName, pageInfo, mockedDatamodelInfo),
    ).toEqual(true)
    expect(
      shouldRelyOnDefaultResolver(typeName, edges, mockedDatamodelInfo),
    ).toEqual(true)
    expect(
      shouldRelyOnDefaultResolver(typeName, aggregate, mockedDatamodelInfo),
    ).toEqual(false)
  })

  it('should return false for all fields in Query/Mutation', () => {
    const types = ['Query', 'Mutation']

    types.forEach(typeName => {
      const fieldsNames = Object.keys(
        (mockedDatamodelInfo.schema.getType(
          typeName,
        ) as GraphQLObjectType).getFields(),
      )

      fieldsNames.forEach(fieldName => {
        const fieldToResolve = getField(typeName, fieldName)

        expect(
          shouldRelyOnDefaultResolver(
            typeName,
            fieldToResolve,
            mockedDatamodelInfo,
          ),
        ).toEqual(false)
      })
    })
  })
})

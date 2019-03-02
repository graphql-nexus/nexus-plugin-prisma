import { GraphQLEnumType } from 'graphql'
import { prismaEnumType } from '../src'
import { mockSchema } from './prisma/mockedArtifacts'

describe('prismaEnumType', () => {
  it('exposes only id_ASC and id_DESC', () => {
    const PostOrderByInput = prismaEnumType({
      name: 'PostOrderByInput',
      members: ['id_ASC', 'id_DESC'],
    })

    const schema = mockSchema([PostOrderByInput])

    const enumType = schema.getType('PostOrderByInput') as GraphQLEnumType
    const enumValues = enumType.getValues().map(member => member.name)

    expect(enumValues).toEqual(expect.arrayContaining(['id_ASC', 'id_DESC']))
  })
})

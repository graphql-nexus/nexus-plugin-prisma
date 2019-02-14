import { GraphQLObjectType } from 'graphql'
import { prismaExtendType, prismaObjectType } from '../src'
import { mockSchema } from './prisma/mockSchema'

describe('prismaExtendType', () => {
  it('extends the query types with `user` and `users` queries', () => {
    const Query = prismaObjectType({
      name: 'Query',
      definition(t) {
        t.prismaFields([])

        t.string('hello')
      },
    })
    const UserExtendedQuery = prismaExtendType({
      type: 'Query',
      definition(t) {
        t.prismaFields(['user', 'users'])
      },
    })
    const schema = mockSchema([Query, UserExtendedQuery])

    const queryFields = Object.keys(
      (schema.getType('Query') as GraphQLObjectType).getFields(),
    )

    expect(queryFields).toEqual(
      expect.arrayContaining(['user', 'users', 'hello']),
    )

    expect(Object.keys(schema.getTypeMap())).toEqual(
      expect.arrayContaining([
        'Query',
        'String',
        'UserWhereUniqueInput',
        'ID',
        'User',
        'PostWhereInput',
        'DateTime',
        'Boolean',
        'UserWhereInput',
        'PostOrderByInput',
        'Int',
        'Post',
        'UserOrderByInput',
        '__Schema',
        '__Type',
        '__TypeKind',
        '__Field',
        '__InputValue',
        '__EnumValue',
        '__Directive',
        '__DirectiveLocation',
      ]),
    )
  })
})

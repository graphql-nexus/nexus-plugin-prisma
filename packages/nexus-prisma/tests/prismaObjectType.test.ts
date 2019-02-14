import { GraphQLObjectType } from 'graphql'
import { makePrismaSchema, prismaObjectType } from '../src'
import datamodelInfo from './prisma/nexus-prisma'
import { prisma } from './prisma/prisma-client'

describe('prismaObjectType', () => {
  test("prismaObjectType('Query')", () => {
    const Query = prismaObjectType({
      name: 'Query',
      definition(t) {
        t.prismaFields(['*'])
      },
    })

    const schema = makePrismaSchema({
      types: [Query],
      outputs: {
        schema: false,
        typegen: false,
      },
      prisma: {
        client: prisma,
        datamodelInfo,
      },
    })

    const queryFields = Object.keys(
      (schema.getType('Query') as GraphQLObjectType).getFields(),
    )
    const userFields = Object.keys(
      (schema.getType('User') as GraphQLObjectType).getFields(),
    )
    const postFields = Object.keys(
      (schema.getType('Post') as GraphQLObjectType).getFields(),
    )

    expect(queryFields).toEqual(
      expect.arrayContaining([
        'post',
        'posts',
        'postsConnection',
        'user',
        'users',
        'usersConnection',
        'node',
      ]),
    )
    expect(userFields).toEqual(
      expect.arrayContaining(['id', 'email', 'name', 'posts']),
    )
    expect(postFields).toEqual(
      expect.arrayContaining([
        'id',
        'createdAt',
        'updatedAt',
        'published',
        'title',
        'content',
        'author',
      ]),
    )

    expect(Object.keys(schema.getTypeMap())).toEqual(
      expect.arrayContaining([
        'Query',
        'UserWhereUniqueInput',
        'ID',
        'String',
        'User',
        'PostWhereInput',
        'DateTime',
        'Boolean',
        'UserWhereInput',
        'PostOrderByInput',
        'Int',
        'Post',
        'UserOrderByInput',
        'UserConnection',
        'PageInfo',
        'UserEdge',
        'AggregateUser',
        'PostWhereUniqueInput',
        'PostConnection',
        'PostEdge',
        'AggregatePost',
        'Node',
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

  test("prismaObjectType('Query', ['post', 'posts'])", () => {
    const Query = prismaObjectType({
      name: 'Query',
      definition(t) {
        t.prismaFields(['post', 'posts'])
      },
    })

    const schema = makePrismaSchema({
      types: [Query],
      outputs: {
        schema: false,
        typegen: false,
      },
      prisma: {
        client: prisma,
        datamodelInfo,
      },
    })

    const queryFields = Object.keys(
      (schema.getType('Query') as GraphQLObjectType).getFields(),
    )

    expect(queryFields).toEqual(expect.arrayContaining(['post', 'posts']))

    expect(Object.keys(schema.getTypeMap())).toEqual(
      expect.arrayContaining([
        'Query',
        'PostWhereUniqueInput',
        'ID',
        'Post',
        'DateTime',
        'Boolean',
        'String',
        'User',
        'PostWhereInput',
        'UserWhereInput',
        'PostOrderByInput',
        'Int',
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

  test("prismaObjectType('Query', [{ name: 'posts', alias: 'feed'}])", async () => {
    const Query = prismaObjectType({
      name: 'Query',
      definition(t) {
        t.prismaFields([{ name: 'posts', alias: 'feed' }])
      },
    })

    const schema = makePrismaSchema({
      types: [Query],
      outputs: {
        schema: false,
        typegen: false,
      },
      prisma: {
        client: prisma,
        datamodelInfo,
      },
    })

    const queryFields = (schema.getType(
      'Query',
    ) as GraphQLObjectType).getFields()
    const queryFieldsNames = Object.keys(queryFields)
    const feedField = queryFields['feed']

    expect(queryFieldsNames).toEqual(expect.arrayContaining(['feed']))

    expect(Object.keys(schema.getTypeMap())).toEqual(
      expect.arrayContaining([
        'Query',
        'PostWhereInput',
        'ID',
        'DateTime',
        'Boolean',
        'String',
        'UserWhereInput',
        'PostOrderByInput',
        'Int',
        'Post',
        'User',
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

    const data = await feedField.resolve({}, {}, { prisma }, {} as any)

    expect(data.length).toBeGreaterThan(0)
  })
})

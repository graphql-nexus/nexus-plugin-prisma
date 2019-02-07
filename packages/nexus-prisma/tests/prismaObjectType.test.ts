import { prismaObjectType, makePrismaSchema } from '../src'
import { GraphQLObjectType } from 'graphql'
import nexusPrismaSchema from './prisma/nexus-prisma'

test("prismaObjectType('Query')", () => {
  const Query = prismaObjectType({ name: 'Query' })

  const schema = makePrismaSchema({
    types: [Query],
    outputs: {
      schema: false,
      typegen: false,
    },
    prisma: {
      contextClientName: 'prisma',
      nexusPrismaSchema,
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
      contextClientName: 'prisma',
      nexusPrismaSchema,
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

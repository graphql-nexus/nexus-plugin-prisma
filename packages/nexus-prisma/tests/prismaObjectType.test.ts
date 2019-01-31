import { prismaObjectType, makePrismaSchema } from '../src'
import { join } from 'path'
import { GraphQLObjectType } from 'graphql'

test("prismaObjectType('Query')", () => {
  const Post = prismaObjectType('Post')
  const User = prismaObjectType('User')
  const Query = prismaObjectType('Query')

  const schema = makePrismaSchema({
    types: [Post, User, Query],
    outputs: {
      schema: false,
      typegen: false,
    },
    prisma: {
      contextClientName: 'prisma',
      schemaPath: join(__dirname, './prisma/prisma.graphql'),
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
      'PostConnection',
      'PostEdge',
      'PageInfo',
      'UserWhereUniqueInput',
      'UserOrderByInput',
      'UserConnection',
      'UserEdge',
      'Node',
      '__Schema',
      '__Type',
      '__TypeKind',
      '__Field',
      '__InputValue',
      '__EnumValue',
      '__Directive',
      '__DirectiveLocation',
      'Long',
      'PostCreateInput',
      'UserCreateOneWithoutPostsInput',
      'UserCreateWithoutPostsInput',
      'PostUpdateInput',
      'UserUpdateOneRequiredWithoutPostsInput',
      'UserUpdateWithoutPostsDataInput',
      'UserUpsertWithoutPostsInput',
      'PostUpdateManyMutationInput',
      'UserCreateInput',
      'PostCreateManyWithoutAuthorInput',
      'PostCreateWithoutAuthorInput',
      'UserUpdateInput',
      'PostUpdateManyWithoutAuthorInput',
      'PostUpdateWithWhereUniqueWithoutAuthorInput',
      'PostUpdateWithoutAuthorDataInput',
      'PostUpsertWithWhereUniqueWithoutAuthorInput',
      'PostScalarWhereInput',
      'PostUpdateManyWithWhereNestedInput',
      'PostUpdateManyDataInput',
      'UserUpdateManyMutationInput',
      'PostSubscriptionWhereInput',
      'MutationType',
      'UserSubscriptionWhereInput',
      'BatchPayload',
    ]),
  )
})

test("prismaObjectType('Query', ['post', 'posts'])", () => {
  const Post = prismaObjectType('Post')
  const User = prismaObjectType('User')
  const Query = prismaObjectType('Query', t => {
    t.prismaFields(['post', 'posts'])
  })

  const schema = makePrismaSchema({
    types: [Post, User, Query],
    outputs: {
      schema: false,
      typegen: false,
    },
    prisma: {
      contextClientName: 'prisma',
      schemaPath: join(__dirname, './prisma/prisma.graphql'),
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
      'Long',
      'UserWhereUniqueInput',
      'PostCreateInput',
      'UserCreateOneWithoutPostsInput',
      'UserCreateWithoutPostsInput',
      'PostUpdateInput',
      'UserUpdateOneRequiredWithoutPostsInput',
      'UserUpdateWithoutPostsDataInput',
      'UserUpsertWithoutPostsInput',
      'PostUpdateManyMutationInput',
      'UserCreateInput',
      'PostCreateManyWithoutAuthorInput',
      'PostCreateWithoutAuthorInput',
      'UserUpdateInput',
      'PostUpdateManyWithoutAuthorInput',
      'PostUpdateWithWhereUniqueWithoutAuthorInput',
      'PostUpdateWithoutAuthorDataInput',
      'PostUpsertWithWhereUniqueWithoutAuthorInput',
      'PostScalarWhereInput',
      'PostUpdateManyWithWhereNestedInput',
      'PostUpdateManyDataInput',
      'UserUpdateManyMutationInput',
      'PostSubscriptionWhereInput',
      'MutationType',
      'UserSubscriptionWhereInput',
      'UserOrderByInput',
      'BatchPayload',
      'Node',
      'PageInfo',
    ]),
  )
})

import { buildClientSchema, GraphQLObjectType } from 'graphql'
import { generateDefaultResolver } from '../src/resolver'
import datamodelInfo from './prisma/nexus-prisma'
import { prisma } from './prisma/prisma-client'
import { mockedDatamodelInfo } from './prisma/mockedArtifacts'

const schema = buildClientSchema(datamodelInfo.schema as any)

const getField = (typeName: string, fieldName: string) => {
  const type = schema.getType(typeName) as GraphQLObjectType

  return type.getFields()[fieldName]
}

const getData = async (
  typeName: string,
  fieldName: string,
  root: Record<string, any> = {},
  args: Record<string, any> = {},
) => {
  const field = getField(typeName, fieldName)
  const resolver = generateDefaultResolver(
    typeName,
    field,
    prisma,
    mockedDatamodelInfo,
  )

  return resolver(root, args, { prisma }, {} as any)
}

describe('generateDefaultResolver', () => {
  test('Top-level Query.posts', async () => {
    const result = await getData('Query', 'posts')

    if (result.length) {
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('published')
      expect(result[0]).toHaveProperty('content')
      expect(result[0]).toHaveProperty('title')
    } else {
      expect(result).toBe([])
    }
  })

  test('TopLevel Query.post', async () => {
    const result = await getData('Query', 'post', {}, { where: { id: '' } })

    expect(result).toBe(null)
  })

  test('Top-level Mutation.createPost', async () => {
    try {
      await getData(
        'Mutation',
        'createPost',
        {},
        {
          data: {
            title: 'post_1',
            content: 'content',
            author: { connect: { id: '' } },
          },
        },
      )
    } catch (e) {
      expect(e.message).toEqual(
        'No Node for the model User with value  for id found.',
      )
    }
  })

  test('Top-level Mutation.deletePost', async () => {
    try {
      await getData(
        'Mutation',
        'deletePost',
        {},
        {
          where: { id: '' },
        },
      )
    } catch (e) {
      expect(e.message).toEqual(
        'No Node for the model Post with value  for id found.',
      )
    }
  })

  test('Top-level Mutation.updatePost', async () => {
    try {
      await getData(
        'Mutation',
        'updatePost',
        {},
        {
          where: { id: '' },
          data: { title: 'title' },
        },
      )
    } catch (e) {
      expect(e.message).toEqual(
        'No Node for the model Post with value  for id found.',
      )
    }
  })

  test('Children Post.author', async () => {
    const result = await getData('Post', 'author', {
      id: '',
    })

    expect(result).toBe(null)
  })

  test('Enum should use default resolver', async () => {
    const field = getField('User', 'gender')
    const resolver = generateDefaultResolver(
      'User',
      field,
      prisma,
      mockedDatamodelInfo,
    )

    expect(resolver).toBe(undefined)
  })
})

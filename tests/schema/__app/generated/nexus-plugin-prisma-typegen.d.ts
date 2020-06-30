import * as Typegen from '../../../../src/schema/typegen/static'
import * as Prisma from '@prisma/client';

// Pagination type
type Pagination = {
  first?: boolean
  last?: boolean
  before?: boolean
  after?: boolean
}

// Prisma custom scalar names
type CustomScalars = 'DateTime'

// Prisma model type definitions
interface PrismaModels {
  Bubble: Prisma.Bubble
  User: Prisma.User
  Post: Prisma.Post
}

// Prisma input types metadata
interface NexusPrismaInputs {
  Query: {
    bubbles: {
      filtering: 'id' | 'createdAt' | 'members' | 'AND' | 'OR' | 'NOT'
      ordering: 'id' | 'createdAt'
    }
    users: {
      filtering: 'id' | 'posts' | 'firstName' | 'lastName' | 'bubbleId' | 'AND' | 'OR' | 'NOT' | 'Bubble'
      ordering: 'id' | 'firstName' | 'lastName' | 'bubbleId'
    }
    posts: {
      filtering: 'id' | 'authors' | 'rating' | 'status' | 'AND' | 'OR' | 'NOT'
      ordering: 'id' | 'rating' | 'status'
    }
  },
  Bubble: {
    members: {
      filtering: 'id' | 'posts' | 'firstName' | 'lastName' | 'bubbleId' | 'AND' | 'OR' | 'NOT' | 'Bubble'
      ordering: 'id' | 'firstName' | 'lastName' | 'bubbleId'
    }
  }
  User: {
    posts: {
      filtering: 'id' | 'authors' | 'rating' | 'status' | 'AND' | 'OR' | 'NOT'
      ordering: 'id' | 'rating' | 'status'
    }
  }
  Post: {
    authors: {
      filtering: 'id' | 'posts' | 'firstName' | 'lastName' | 'bubbleId' | 'AND' | 'OR' | 'NOT' | 'Bubble'
      ordering: 'id' | 'firstName' | 'lastName' | 'bubbleId'
    }
  }
}

// Prisma output types metadata
interface NexusPrismaOutputs {
  Query: {
    bubble: 'Bubble'
    bubbles: 'Bubble'
    user: 'User'
    users: 'User'
    post: 'Post'
    posts: 'Post'
  },
  Mutation: {
    createOneBubble: 'Bubble'
    updateOneBubble: 'Bubble'
    updateManyBubble: 'BatchPayload'
    deleteOneBubble: 'Bubble'
    deleteManyBubble: 'BatchPayload'
    upsertOneBubble: 'Bubble'
    createOneUser: 'User'
    updateOneUser: 'User'
    updateManyUser: 'BatchPayload'
    deleteOneUser: 'User'
    deleteManyUser: 'BatchPayload'
    upsertOneUser: 'User'
    createOnePost: 'Post'
    updateOnePost: 'Post'
    updateManyPost: 'BatchPayload'
    deleteOnePost: 'Post'
    deleteManyPost: 'BatchPayload'
    upsertOnePost: 'Post'
  },
  Bubble: {
    id: 'String'
    createdAt: 'DateTime'
    members: 'User'
  }
  User: {
    id: 'String'
    posts: 'Post'
    firstName: 'String'
    lastName: 'String'
    Bubble: 'Bubble'
    bubbleId: 'String'
  }
  Post: {
    id: 'Int'
    authors: 'User'
    rating: 'Float'
    status: 'PostStatus'
  }
}

// Helper to gather all methods relative to a model
interface NexusPrismaMethods {
  Bubble: Typegen.NexusPrismaFields<'Bubble'>
  User: Typegen.NexusPrismaFields<'User'>
  Post: Typegen.NexusPrismaFields<'Post'>
  Query: Typegen.NexusPrismaFields<'Query'>
  Mutation: Typegen.NexusPrismaFields<'Mutation'>
}

interface NexusPrismaGenTypes {
  inputs: NexusPrismaInputs
  outputs: NexusPrismaOutputs
  methods: NexusPrismaMethods
  models: PrismaModels
  pagination: Pagination
  scalars: CustomScalars
}

declare global {
  interface NexusPrismaGen extends NexusPrismaGenTypes {}

  type NexusPrisma<
    TypeName extends string,
    ModelOrCrud extends 'model' | 'crud'
  > = Typegen.GetNexusPrisma<TypeName, ModelOrCrud>;
}
  
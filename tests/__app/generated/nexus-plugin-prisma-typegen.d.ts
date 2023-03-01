import * as Typegen from '../../../src/typegen/static'
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
  Location: Prisma.Location
  Post: Prisma.Post
}

// Prisma input types metadata
interface NexusPrismaInputs {
  Query: {
    bubbles: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'createdAt' | 'private' | 'members'
      ordering: 'id' | 'createdAt' | 'private' | 'members'
    }
    groupByBubble: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'createdAt' | 'private' | 'members'
      ordering: 'id' | 'createdAt' | 'private' | '_count' | '_max' | '_min'
    }
    users: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
      ordering: 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
    }
    groupByUser: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
      ordering: 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | '_count' | '_avg' | '_max' | '_min' | '_sum'
    }
    locations: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'country' | 'city' | 'User'
      ordering: 'id' | 'country' | 'city' | 'User'
    }
    groupByLocation: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'country' | 'city' | 'User'
      ordering: 'id' | 'country' | 'city' | '_count' | '_avg' | '_max' | '_min' | '_sum'
    }
    posts: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'rating' | 'likes' | 'status' | 'authors'
      ordering: 'id' | 'rating' | 'likes' | 'status' | 'authors'
    }
    groupByPost: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'rating' | 'likes' | 'status' | 'authors'
      ordering: 'id' | 'rating' | 'likes' | 'status' | '_count' | '_avg' | '_max' | '_min' | '_sum'
    }
  },
  Bubble: {
    members: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
      ordering: 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
    }
  }
  User: {
    posts: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'rating' | 'likes' | 'status' | 'authors'
      ordering: 'id' | 'rating' | 'likes' | 'status' | 'authors'
    }
  }
  Location: {
    User: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
      ordering: 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
    }
  }
  Post: {
    authors: {
      filtering: 'AND' | 'OR' | 'NOT' | 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
      ordering: 'id' | 'firstName' | 'lastName' | 'bubbleId' | 'locationId' | 'posts' | 'location' | 'Bubble'
    }
  }
}

// Prisma output types metadata
interface NexusPrismaOutputs {
  Query: {
    aggregateBubble: 'AggregateBubble'
    bubbles: 'Bubble'
    bubble: 'Bubble'
    groupByBubble: 'BubbleGroupByOutputType'
    aggregateUser: 'AggregateUser'
    users: 'User'
    user: 'User'
    groupByUser: 'UserGroupByOutputType'
    aggregateLocation: 'AggregateLocation'
    locations: 'Location'
    location: 'Location'
    groupByLocation: 'LocationGroupByOutputType'
    aggregatePost: 'AggregatePost'
    posts: 'Post'
    post: 'Post'
    groupByPost: 'PostGroupByOutputType'
  },
  Mutation: {
    createOneBubble: 'Bubble'
    createManyBubble: 'AffectedRowsOutput'
    deleteOneBubble: 'Bubble'
    deleteManyBubble: 'AffectedRowsOutput'
    updateOneBubble: 'Bubble'
    updateManyBubble: 'AffectedRowsOutput'
    upsertOneBubble: 'Bubble'
    createOneUser: 'User'
    createManyUser: 'AffectedRowsOutput'
    deleteOneUser: 'User'
    deleteManyUser: 'AffectedRowsOutput'
    updateOneUser: 'User'
    updateManyUser: 'AffectedRowsOutput'
    upsertOneUser: 'User'
    createOneLocation: 'Location'
    createManyLocation: 'AffectedRowsOutput'
    deleteOneLocation: 'Location'
    deleteManyLocation: 'AffectedRowsOutput'
    updateOneLocation: 'Location'
    updateManyLocation: 'AffectedRowsOutput'
    upsertOneLocation: 'Location'
    createOnePost: 'Post'
    createManyPost: 'AffectedRowsOutput'
    deleteOnePost: 'Post'
    deleteManyPost: 'AffectedRowsOutput'
    updateOnePost: 'Post'
    updateManyPost: 'AffectedRowsOutput'
    upsertOnePost: 'Post'
  },
  Bubble: {
    id: 'String'
    createdAt: 'DateTime'
    members: 'User'
    private: 'Boolean'
  }
  User: {
    id: 'String'
    posts: 'Post'
    firstName: 'String'
    lastName: 'String'
    location: 'Location'
    Bubble: 'Bubble'
    bubbleId: 'String'
    locationId: 'Int'
  }
  Location: {
    id: 'Int'
    country: 'String'
    city: 'String'
    User: 'User'
  }
  Post: {
    id: 'Int'
    authors: 'User'
    rating: 'Float'
    likes: 'Int'
    status: 'PostStatus'
  }
}

// Helper to gather all methods relative to a model
interface NexusPrismaMethods {
  Bubble: Typegen.NexusPrismaFields<'Bubble'>
  User: Typegen.NexusPrismaFields<'User'>
  Location: Typegen.NexusPrismaFields<'Location'>
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
  
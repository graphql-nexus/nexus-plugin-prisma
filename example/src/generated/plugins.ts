// GENERATED TYPES FOR PRISMA PLUGIN. /!\ DO NOT EDIT MANUALLY

import {
  ArgDefinition,
  RootValue,
  ArgsValue,
  ContextValue,
  MaybePromise,
  ResultValue,
} from 'gqliteral/dist/types'
import { GraphQLResolveInfo } from 'graphql'

import * as prisma from './prisma-client'

// Types for Query

type QueryObject =
  | QueryFields
  | { name: 'post', args?: QueryPostArgs[] | false, alias?: string  } 
  | { name: 'posts', args?: QueryPostsArgs[] | false, alias?: string  } 
  | { name: 'postsConnection', args?: QueryPostsConnectionArgs[] | false, alias?: string  } 
  | { name: 'user', args?: QueryUserArgs[] | false, alias?: string  } 
  | { name: 'users', args?: QueryUsersArgs[] | false, alias?: string  } 
  | { name: 'usersConnection', args?: QueryUsersConnectionArgs[] | false, alias?: string  } 
  | { name: 'node', args?: QueryNodeArgs[] | false, alias?: string  } 

type QueryFields =
  | 'post'
  | 'posts'
  | 'postsConnection'
  | 'user'
  | 'users'
  | 'usersConnection'
  | 'node'


type QueryPostArgs =
  | 'where'
type QueryPostsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryPostsConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryUserArgs =
  | 'where'
type QueryUsersArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryUsersConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryNodeArgs =
  | 'id'
  

export interface QueryFieldDetails<GenTypes = GraphQLiteralGen> {
  post: {
    args: Record<QueryPostArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "post">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post | null> | prisma.Post | null;
  }
  posts: {
    args: Record<QueryPostsArgs,ArgDefinition>
    description: string
    list: true
    nullable: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "posts">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post[]> | prisma.Post[];
  }
  postsConnection: {
    args: Record<QueryPostsConnectionArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "postsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PostConnection> | prisma.PostConnection;
  }
  user: {
    args: Record<QueryUserArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "user">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User | null> | prisma.User | null;
  }
  users: {
    args: Record<QueryUsersArgs,ArgDefinition>
    description: string
    list: true
    nullable: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "users">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User[]> | prisma.User[];
  }
  usersConnection: {
    args: Record<QueryUsersConnectionArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "usersConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.UserConnection> | prisma.UserConnection;
  }
  node: {
    args: Record<QueryNodeArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Node | null> | prisma.Node | null;
  }
}
  

// Types for Post

type PostObject =
  | PostFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'createdAt', args?: [] | false, alias?: string  } 
  | { name: 'updatedAt', args?: [] | false, alias?: string  } 
  | { name: 'published', args?: [] | false, alias?: string  } 
  | { name: 'title', args?: [] | false, alias?: string  } 
  | { name: 'content', args?: [] | false, alias?: string  } 
  | { name: 'author', args?: [] | false, alias?: string  } 

type PostFields =
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'published'
  | 'title'
  | 'content'
  | 'author'



  

export interface PostFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Post">, args: ArgsValue<GenTypes, "Post", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  createdAt: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Post">, args: ArgsValue<GenTypes, "Post", "createdAt">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  updatedAt: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Post">, args: ArgsValue<GenTypes, "Post", "updatedAt">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  published: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Post">, args: ArgsValue<GenTypes, "Post", "published">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<boolean> | boolean;
  }
  title: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Post">, args: ArgsValue<GenTypes, "Post", "title">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  content: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Post">, args: ArgsValue<GenTypes, "Post", "content">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string | null> | string | null;
  }
  author: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Post">, args: ArgsValue<GenTypes, "Post", "author">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User> | prisma.User;
  }
}
  

// Types for User

type UserObject =
  | UserFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'email', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 
  | { name: 'posts', args?: UserPostsArgs[] | false, alias?: string  } 

type UserFields =
  | 'id'
  | 'email'
  | 'name'
  | 'posts'


type UserPostsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
  

export interface UserFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "User">, args: ArgsValue<GenTypes, "User", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  email: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "User">, args: ArgsValue<GenTypes, "User", "email">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "User">, args: ArgsValue<GenTypes, "User", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string | null> | string | null;
  }
  posts: {
    args: Record<UserPostsArgs,ArgDefinition>
    description: string
    list: true
    nullable: false
    resolve: (root: RootValue<GenTypes, "User">, args: ArgsValue<GenTypes, "User", "posts">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post[]> | prisma.Post[];
  }
}
  

// Types for PostConnection

type PostConnectionObject =
  | PostConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type PostConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

export interface PostConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostConnection">, args: ArgsValue<GenTypes, "PostConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostConnection">, args: ArgsValue<GenTypes, "PostConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PostEdge[]> | prisma.PostEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostConnection">, args: ArgsValue<GenTypes, "PostConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregatePost> | prisma.AggregatePost;
  }
}
  

// Types for PageInfo

type PageInfoObject =
  | PageInfoFields
  | { name: 'hasNextPage', args?: [] | false, alias?: string  } 
  | { name: 'hasPreviousPage', args?: [] | false, alias?: string  } 
  | { name: 'startCursor', args?: [] | false, alias?: string  } 
  | { name: 'endCursor', args?: [] | false, alias?: string  } 

type PageInfoFields =
  | 'hasNextPage'
  | 'hasPreviousPage'
  | 'startCursor'
  | 'endCursor'



  

export interface PageInfoFieldDetails<GenTypes = GraphQLiteralGen> {
  hasNextPage: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "hasNextPage">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<boolean> | boolean;
  }
  hasPreviousPage: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "hasPreviousPage">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<boolean> | boolean;
  }
  startCursor: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "startCursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string | null> | string | null;
  }
  endCursor: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "endCursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string | null> | string | null;
  }
}
  

// Types for PostEdge

type PostEdgeObject =
  | PostEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type PostEdgeFields =
  | 'node'
  | 'cursor'



  

export interface PostEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostEdge">, args: ArgsValue<GenTypes, "PostEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post> | prisma.Post;
  }
  cursor: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostEdge">, args: ArgsValue<GenTypes, "PostEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregatePost

type AggregatePostObject =
  | AggregatePostFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregatePostFields =
  | 'count'



  

export interface AggregatePostFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "AggregatePost">, args: ArgsValue<GenTypes, "AggregatePost", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for UserConnection

type UserConnectionObject =
  | UserConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type UserConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

export interface UserConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserConnection">, args: ArgsValue<GenTypes, "UserConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserConnection">, args: ArgsValue<GenTypes, "UserConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.UserEdge[]> | prisma.UserEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserConnection">, args: ArgsValue<GenTypes, "UserConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregateUser> | prisma.AggregateUser;
  }
}
  

// Types for UserEdge

type UserEdgeObject =
  | UserEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type UserEdgeFields =
  | 'node'
  | 'cursor'



  

export interface UserEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserEdge">, args: ArgsValue<GenTypes, "UserEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User> | prisma.User;
  }
  cursor: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserEdge">, args: ArgsValue<GenTypes, "UserEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregateUser

type AggregateUserObject =
  | AggregateUserFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregateUserFields =
  | 'count'



  

export interface AggregateUserFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "AggregateUser">, args: ArgsValue<GenTypes, "AggregateUser", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for Mutation

type MutationObject =
  | MutationFields
  | { name: 'createPost', args?: MutationCreatePostArgs[] | false, alias?: string  } 
  | { name: 'updatePost', args?: MutationUpdatePostArgs[] | false, alias?: string  } 
  | { name: 'updateManyPosts', args?: MutationUpdateManyPostsArgs[] | false, alias?: string  } 
  | { name: 'upsertPost', args?: MutationUpsertPostArgs[] | false, alias?: string  } 
  | { name: 'deletePost', args?: MutationDeletePostArgs[] | false, alias?: string  } 
  | { name: 'deleteManyPosts', args?: MutationDeleteManyPostsArgs[] | false, alias?: string  } 
  | { name: 'createUser', args?: MutationCreateUserArgs[] | false, alias?: string  } 
  | { name: 'updateUser', args?: MutationUpdateUserArgs[] | false, alias?: string  } 
  | { name: 'updateManyUsers', args?: MutationUpdateManyUsersArgs[] | false, alias?: string  } 
  | { name: 'upsertUser', args?: MutationUpsertUserArgs[] | false, alias?: string  } 
  | { name: 'deleteUser', args?: MutationDeleteUserArgs[] | false, alias?: string  } 
  | { name: 'deleteManyUsers', args?: MutationDeleteManyUsersArgs[] | false, alias?: string  } 

type MutationFields =
  | 'createPost'
  | 'updatePost'
  | 'updateManyPosts'
  | 'upsertPost'
  | 'deletePost'
  | 'deleteManyPosts'
  | 'createUser'
  | 'updateUser'
  | 'updateManyUsers'
  | 'upsertUser'
  | 'deleteUser'
  | 'deleteManyUsers'


type MutationCreatePostArgs =
  | 'data'
type MutationUpdatePostArgs =
  | 'data'
  | 'where'
type MutationUpdateManyPostsArgs =
  | 'data'
  | 'where'
type MutationUpsertPostArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeletePostArgs =
  | 'where'
type MutationDeleteManyPostsArgs =
  | 'where'
type MutationCreateUserArgs =
  | 'data'
type MutationUpdateUserArgs =
  | 'data'
  | 'where'
type MutationUpdateManyUsersArgs =
  | 'data'
  | 'where'
type MutationUpsertUserArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeleteUserArgs =
  | 'where'
type MutationDeleteManyUsersArgs =
  | 'where'
  

export interface MutationFieldDetails<GenTypes = GraphQLiteralGen> {
  createPost: {
    args: Record<MutationCreatePostArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createPost">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post> | prisma.Post;
  }
  updatePost: {
    args: Record<MutationUpdatePostArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updatePost">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post | null> | prisma.Post | null;
  }
  updateManyPosts: {
    args: Record<MutationUpdateManyPostsArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyPosts">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertPost: {
    args: Record<MutationUpsertPostArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertPost">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post> | prisma.Post;
  }
  deletePost: {
    args: Record<MutationDeletePostArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deletePost">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post | null> | prisma.Post | null;
  }
  deleteManyPosts: {
    args: Record<MutationDeleteManyPostsArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyPosts">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  createUser: {
    args: Record<MutationCreateUserArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createUser">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User> | prisma.User;
  }
  updateUser: {
    args: Record<MutationUpdateUserArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateUser">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User | null> | prisma.User | null;
  }
  updateManyUsers: {
    args: Record<MutationUpdateManyUsersArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyUsers">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertUser: {
    args: Record<MutationUpsertUserArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertUser">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User> | prisma.User;
  }
  deleteUser: {
    args: Record<MutationDeleteUserArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteUser">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User | null> | prisma.User | null;
  }
  deleteManyUsers: {
    args: Record<MutationDeleteManyUsersArgs,ArgDefinition>
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyUsers">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
}
  

// Types for BatchPayload

type BatchPayloadObject =
  | BatchPayloadFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type BatchPayloadFields =
  | 'count'



  

export interface BatchPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "BatchPayload">, args: ArgsValue<GenTypes, "BatchPayload", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<undefined> | undefined;
  }
}
  

// Types for Subscription

type SubscriptionObject =
  | SubscriptionFields
  | { name: 'post', args?: SubscriptionPostArgs[] | false, alias?: string  } 
  | { name: 'user', args?: SubscriptionUserArgs[] | false, alias?: string  } 

type SubscriptionFields =
  | 'post'
  | 'user'


type SubscriptionPostArgs =
  | 'where'
type SubscriptionUserArgs =
  | 'where'
  

export interface SubscriptionFieldDetails<GenTypes = GraphQLiteralGen> {
  post: {
    args: Record<SubscriptionPostArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "post">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PostSubscriptionPayload | null> | prisma.PostSubscriptionPayload | null;
  }
  user: {
    args: Record<SubscriptionUserArgs,ArgDefinition>
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "user">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.UserSubscriptionPayload | null> | prisma.UserSubscriptionPayload | null;
  }
}
  

// Types for PostSubscriptionPayload

type PostSubscriptionPayloadObject =
  | PostSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type PostSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

export interface PostSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostSubscriptionPayload">, args: ArgsValue<GenTypes, "PostSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "PostSubscriptionPayload">, args: ArgsValue<GenTypes, "PostSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Post | null> | prisma.Post | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostSubscriptionPayload">, args: ArgsValue<GenTypes, "PostSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "PostSubscriptionPayload">, args: ArgsValue<GenTypes, "PostSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PostPreviousValues | null> | prisma.PostPreviousValues | null;
  }
}
  

// Types for PostPreviousValues

type PostPreviousValuesObject =
  | PostPreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'createdAt', args?: [] | false, alias?: string  } 
  | { name: 'updatedAt', args?: [] | false, alias?: string  } 
  | { name: 'published', args?: [] | false, alias?: string  } 
  | { name: 'title', args?: [] | false, alias?: string  } 
  | { name: 'content', args?: [] | false, alias?: string  } 

type PostPreviousValuesFields =
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'published'
  | 'title'
  | 'content'



  

export interface PostPreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostPreviousValues">, args: ArgsValue<GenTypes, "PostPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  createdAt: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostPreviousValues">, args: ArgsValue<GenTypes, "PostPreviousValues", "createdAt">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  updatedAt: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostPreviousValues">, args: ArgsValue<GenTypes, "PostPreviousValues", "updatedAt">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  published: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostPreviousValues">, args: ArgsValue<GenTypes, "PostPreviousValues", "published">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<boolean> | boolean;
  }
  title: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "PostPreviousValues">, args: ArgsValue<GenTypes, "PostPreviousValues", "title">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  content: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "PostPreviousValues">, args: ArgsValue<GenTypes, "PostPreviousValues", "content">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string | null> | string | null;
  }
}
  

// Types for UserSubscriptionPayload

type UserSubscriptionPayloadObject =
  | UserSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type UserSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

export interface UserSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserSubscriptionPayload">, args: ArgsValue<GenTypes, "UserSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "UserSubscriptionPayload">, args: ArgsValue<GenTypes, "UserSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.User | null> | prisma.User | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserSubscriptionPayload">, args: ArgsValue<GenTypes, "UserSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "UserSubscriptionPayload">, args: ArgsValue<GenTypes, "UserSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.UserPreviousValues | null> | prisma.UserPreviousValues | null;
  }
}
  

// Types for UserPreviousValues

type UserPreviousValuesObject =
  | UserPreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'email', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 

type UserPreviousValuesFields =
  | 'id'
  | 'email'
  | 'name'



  

export interface UserPreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserPreviousValues">, args: ArgsValue<GenTypes, "UserPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  email: {
    args: {}
    description: string
    list: false
    nullable: false
    resolve: (root: RootValue<GenTypes, "UserPreviousValues">, args: ArgsValue<GenTypes, "UserPreviousValues", "email">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    nullable: true
    resolve: (root: RootValue<GenTypes, "UserPreviousValues">, args: ArgsValue<GenTypes, "UserPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string | null> | string | null;
  }
}
  


export interface PluginTypes {
  fields: {
    Query: QueryObject
    Post: PostObject
    User: UserObject
    PostConnection: PostConnectionObject
    PageInfo: PageInfoObject
    PostEdge: PostEdgeObject
    AggregatePost: AggregatePostObject
    UserConnection: UserConnectionObject
    UserEdge: UserEdgeObject
    AggregateUser: AggregateUserObject
    Mutation: MutationObject
    BatchPayload: BatchPayloadObject
    Subscription: SubscriptionObject
    PostSubscriptionPayload: PostSubscriptionPayloadObject
    PostPreviousValues: PostPreviousValuesObject
    UserSubscriptionPayload: UserSubscriptionPayloadObject
    UserPreviousValues: UserPreviousValuesObject
  }
  fieldsDetails: {
    Query: QueryFieldDetails
    Post: PostFieldDetails
    User: UserFieldDetails
    PostConnection: PostConnectionFieldDetails
    PageInfo: PageInfoFieldDetails
    PostEdge: PostEdgeFieldDetails
    AggregatePost: AggregatePostFieldDetails
    UserConnection: UserConnectionFieldDetails
    UserEdge: UserEdgeFieldDetails
    AggregateUser: AggregateUserFieldDetails
    Mutation: MutationFieldDetails
    BatchPayload: BatchPayloadFieldDetails
    Subscription: SubscriptionFieldDetails
    PostSubscriptionPayload: PostSubscriptionPayloadFieldDetails
    PostPreviousValues: PostPreviousValuesFieldDetails
    UserSubscriptionPayload: UserSubscriptionPayloadFieldDetails
    UserPreviousValues: UserPreviousValuesFieldDetails
  }
}

declare global {
  interface GraphQLiteralGen extends PluginTypes {}
}
  
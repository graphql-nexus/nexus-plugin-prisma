// Generated types from prisma-client

import { PostPromise, UserPromise } from './prisma-client'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type KeysToOmit = 'then' | '$fragment' | 'finally' | 'catch'

export type NameExposableArgs = 'name'

export type ExposableFieldObject<TFields, TArgs> = {
  name: TFields
  alias?: string
  args?: TArgs[] | false
}

type UserPostsArgs =
  | 'first'
  | 'last'
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
type UserExposableFields = Extract<keyof Omit<UserPromise, KeysToOmit>, string>
type UserExposableObjects =
  | UserExposableFields
  | { name: 'id'; args?: [] | false; alias?: string }
  | { name: 'name'; args?: [] | false; alias?: string }
  | { name: 'posts'; args?: UserPostsArgs[] | false; alias?: string }

type PostCommentsArgs =
  | 'first'
  | 'last'
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
type PostExposableFields = Extract<keyof Omit<PostPromise, KeysToOmit>, string>
type PostExposableObjects =
  | PostExposableFields
  | { name: 'id'; args?: [] | false; alias?: string }
  | { name: 'title'; args?: [] | false; alias?: string }
  | { name: 'content'; args?: [] | false; alias?: string }
  | { name: 'comments'; args?: PostCommentsArgs[] | false; alias?: string }

type QueryUserArgs = 'where'
type QueryPostArgs = 'where'
type QueryCommentArgs = 'where'

type QueryUsersArgs =
  | 'first'
  | 'last'
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
type QueryPostsArgs =
  | 'first'
  | 'last'
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
type QueryCommentsArgs =
  | 'first'
  | 'last'
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'

type QueryExposableFields =
  | 'user'
  | 'users'
  | 'post'
  | 'posts'
  | 'comment'
  | 'comments'
  | 'usersConnection'
type QueryExposableObjects =
  | QueryExposableFields
  | { name: 'user'; args?: QueryUserArgs[] | false; alias?: string }
  | { name: 'users'; args?: QueryUsersArgs[] | false; alias?: string }
  | { name: 'post'; args?: QueryPostArgs[] | false; alias?: string }
  | { name: 'posts'; args?: QueryPostsArgs[] | false; alias?: string }
  | { name: 'comment'; args?: QueryCommentArgs[] | false; alias?: string }
  | {
      name: 'usersConnection'
      args?: QueryCommentsArgs[] | false
      alias?: string
    }
  | { name: 'comments'; args?: QueryCommentsArgs[] | false; alias?: string }

export interface PluginShapes {
  fields: Record<string, any>
}

interface PluginTypes {
  fields: {
    Query: QueryExposableObjects
    User: UserExposableObjects
    Post: PostExposableObjects
  }
}

declare global {
  interface GQLiteralGen extends PluginTypes {}
}

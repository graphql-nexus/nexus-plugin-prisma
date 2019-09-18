import * as photon from '@generated/photon';
import { core } from 'nexus';
// Types helpers
  type ModelNameExistsInGraphQLType<
  ReturnType extends any
> = ReturnType extends core.GetGen<'objectNames'> ? true : false;

type NexusPrismaScalarOpts = {
  alias?: string;
};

type Pagination = {
  first?: boolean;
  last?: boolean;
  before?: boolean;
  after?: boolean;
  skip?: boolean;
};

type RootObjectTypes = Pick<
  core.GetGen<'rootTypes'>,
  core.GetGen<'objectNames'>
>;

type IsSubset<A, B> = keyof A extends never
  ? false
  : B extends A
  ? true
  : false;

type OmitByValue<T, ValueType> = Pick<
  T,
  { [Key in keyof T]: T[Key] extends ValueType ? never : Key }[keyof T]
>;

type GetSubsetTypes<ModelName extends any> = keyof OmitByValue<
  {
    [P in keyof RootObjectTypes]: ModelName extends keyof ModelTypes
      ? IsSubset<RootObjectTypes[P], ModelTypes[ModelName]> extends true
        ? RootObjectTypes[P]
        : never
      : never;
  },
  never
>;

type SubsetTypes<ModelName extends any> = GetSubsetTypes<
  ModelName
> extends never
  ? `ERROR: No subset types are available. Please make sure that one of your GraphQL type is a subset of your t.model('<ModelName>')`
  : GetSubsetTypes<ModelName>;

type DynamicRequiredType<ReturnType extends any> = ModelNameExistsInGraphQLType<
  ReturnType
> extends true
  ? { type?: SubsetTypes<ReturnType> }
  : { type: SubsetTypes<ReturnType> };

type GetNexusPrismaInput<
  ModelName extends any,
  MethodName extends any,
  InputName extends 'filtering' | 'ordering'
> = ModelName extends keyof NexusPrismaInputs
  ? MethodName extends keyof NexusPrismaInputs[ModelName]
    ? NexusPrismaInputs[ModelName][MethodName][InputName]
    : never
  : never;

type NexusPrismaRelationOpts<
  ModelName extends any,
  MethodName extends any,
  ReturnType extends any
> = GetNexusPrismaInput<
  // If GetNexusPrismaInput returns never, it means there are no filtering/ordering args for it. So just use `alias` and `type`
  ModelName,
  MethodName,
  'filtering'
> extends never
  ? {
      alias?: string;
    } & DynamicRequiredType<ReturnType>
  : {
      alias?: string;
      filtering?:
        | boolean
        | Partial<
            Record<
              GetNexusPrismaInput<ModelName, MethodName, 'filtering'>,
              boolean
            >
          >;
      ordering?:
        | boolean
        | Partial<
            Record<
              GetNexusPrismaInput<ModelName, MethodName, 'ordering'>,
              boolean
            >
          >;
      pagination?: boolean | Pagination;
    } & DynamicRequiredType<ReturnType>;

type IsScalar<TypeName extends any> = TypeName extends core.GetGen<
  'scalarNames'
>
  ? true
  : false;

type NexusPrismaFields<ModelName extends keyof NexusPrismaTypes> = {
  [MethodName in keyof NexusPrismaTypes[ModelName]]: NexusPrismaMethod<
    ModelName,
    MethodName,
    IsScalar<NexusPrismaTypes[ModelName][MethodName]> // Is the return type a scalar?
  >;
};

type NexusPrismaMethod<
  ModelName extends keyof NexusPrismaTypes,
  MethodName extends keyof NexusPrismaTypes[ModelName],
  IsScalar extends boolean,
  ReturnType extends any = NexusPrismaTypes[ModelName][MethodName]
> = IsScalar extends true // If scalar
  ? (opts?: NexusPrismaScalarOpts) => NexusPrismaFields<ModelName> // Return optional scalar opts
  : ModelNameExistsInGraphQLType<ReturnType> extends true // If model name has a mapped graphql types
  ? (
      opts?: NexusPrismaRelationOpts<ModelName, MethodName, ReturnType>
    ) => NexusPrismaFields<ModelName> // Then make opts optional
  : (
      opts: NexusPrismaRelationOpts<ModelName, MethodName, ReturnType>
    ) => NexusPrismaFields<ModelName>; // Else force use input the related graphql type -> { type: '...' }

type GetNexusPrismaMethod<
  TypeName extends string
> = TypeName extends keyof NexusPrismaMethods
  ? NexusPrismaMethods[TypeName]
  : <CustomTypeName extends keyof ModelTypes>(
      typeName: CustomTypeName
    ) => NexusPrismaMethods[CustomTypeName];

type GetNexusPrisma<
  TypeName extends string,
  ModelOrCrud extends 'model' | 'crud'
> = ModelOrCrud extends 'model'
  ? TypeName extends 'Mutation'
    ? never
    : TypeName extends 'Query'
    ? never
    : GetNexusPrismaMethod<TypeName>
  : ModelOrCrud extends 'crud'
  ? TypeName extends 'Mutation'
    ? GetNexusPrismaMethod<TypeName>
    : TypeName extends 'Query'
    ? GetNexusPrismaMethod<TypeName>
    : never
  : never;
  

// Generated
interface ModelTypes {
  Bubble: photon.Bubble
  User: photon.User
  Post: photon.Post
}
  
interface NexusPrismaInputs {
  Query: {
    bubbles: {
  filtering: 'id' | 'createdAt' | 'members' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'createdAt'
}
    users: {
  filtering: 'id' | 'posts' | 'firstName' | 'lastName' | 'AND' | 'OR' | 'NOT' | 'bubble'
  ordering: 'id' | 'firstName' | 'lastName'
}
    posts: {
  filtering: 'id' | 'authors' | 'rating' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'rating'
}

  },
    Bubble: {
    members: {
  filtering: 'id' | 'posts' | 'firstName' | 'lastName' | 'AND' | 'OR' | 'NOT' | 'bubble'
  ordering: 'id' | 'firstName' | 'lastName'
}

  },  User: {
    posts: {
  filtering: 'id' | 'authors' | 'rating' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'rating'
}

  },  Post: {
    authors: {
  filtering: 'id' | 'posts' | 'firstName' | 'lastName' | 'AND' | 'OR' | 'NOT' | 'bubble'
  ordering: 'id' | 'firstName' | 'lastName'
}

  }
}

interface NexusPrismaTypes {
  Query: {
    bubbles: 'Bubble'
    bubble: 'Bubble'
    users: 'User'
    user: 'User'
    posts: 'Post'
    post: 'Post'

  },
  Mutation: {
    createOneBubble: 'Bubble'
    deleteOneBubble: 'Bubble'
    updateOneBubble: 'Bubble'
    upsertOneBubble: 'Bubble'
    updateManyBubble: 'BatchPayload'
    deleteManyBubble: 'BatchPayload'
    createOneUser: 'User'
    deleteOneUser: 'User'
    updateOneUser: 'User'
    upsertOneUser: 'User'
    updateManyUser: 'BatchPayload'
    deleteManyUser: 'BatchPayload'
    createOnePost: 'Post'
    deleteOnePost: 'Post'
    updateOnePost: 'Post'
    upsertOnePost: 'Post'
    updateManyPost: 'BatchPayload'
    deleteManyPost: 'BatchPayload'

  },
  Bubble: {
    id: 'String'
    createdAt: 'DateTime'
    members: 'User'

},  User: {
    id: 'String'
    posts: 'Post'
    firstName: 'String'
    lastName: 'String'
    bubble: 'Bubble'

},  Post: {
    id: 'Int'
    authors: 'User'
    rating: 'Float'

}
}

interface NexusPrismaMethods {
  Bubble: NexusPrismaFields<'Bubble'>
  User: NexusPrismaFields<'User'>
  Post: NexusPrismaFields<'Post'>
  Query: NexusPrismaFields<'Query'>
  Mutation: NexusPrismaFields<'Mutation'>
}
  

declare global {
  type NexusPrisma<
    TypeName extends string,
    ModelOrCrud extends 'model' | 'crud'
  > = GetNexusPrisma<TypeName, ModelOrCrud>;
}
  
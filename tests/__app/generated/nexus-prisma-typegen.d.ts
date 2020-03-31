import * as prisma from '@prisma/client';
import { core } from '@nexus/schema';
import { GraphQLResolveInfo } from 'graphql';

// Types helpers
  type IsModelNameExistsInGraphQLTypes<
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

/**
 * Determine if `B` is a subset (or equivalent to) of `A`.
*/
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

type DynamicRequiredType<ReturnType extends any> = IsModelNameExistsInGraphQLTypes<
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

/**
 * A function that takes an object representing the request's input
 * (args, context, and info) and returns the value to pass to the Prisma JS Client.
 */
export type ComputeInput<
  MethodName extends MutationMethodName = MutationMethodName
> = (params: MutationResolverParams<MethodName>) => unknown

export type MutationResolverParams<
  MethodName extends MutationMethodName = MutationMethodName
> = {
  info: GraphQLResolveInfo
  ctx: Context
  args: core.GetGen<'argTypes'>['Mutation'][MethodName]
}

export type MutationMethodName = Extract<
  keyof core.GetGen<'argTypes'>['Mutation'],
  string
>

export type Context = core.GetGen<'context'>

export type NestedKeys<T> = { [K in keyof T]: keyof T[K] }[keyof T]

export type PrismaInputFieldName = NestedKeys<PrismaInputs>

export type CollapseToValue = PrismaInputFieldName | null | undefined

export type StandardInputConfig = {
  collapseTo?: CollapseToValue
  computeFrom?: null
}

export type ComputedInputConfig<
  MethodName extends MutationMethodName = MutationMethodName
> = {
  collapseTo?: null
  computeFrom: ComputeInput<MethodName>
}

export type InputConfig = StandardInputConfig | ComputedInputConfig

export type InputsConfig<
  MethodName extends MutationMethodName = MutationMethodName
> = {
  [Name in PrismaInputFieldName]?:
    | StandardInputConfig
    | ComputedInputConfig<MethodName>
}

export type ComputedFields<
  MethodName extends MutationMethodName = MutationMethodName
> = {
  [Name in PrismaInputFieldName]?: ComputeInput<MethodName>
}

type NexusPrismaRelationOpts<
  ModelName extends any,
  MethodName extends any,
  ReturnType extends any
> = GetNexusPrismaInput<
  // If GetNexusPrismaInput returns never, it means there are no filtering/ordering args for it.
  ModelName,
  MethodName,
  'filtering'
> extends never
  ? {
      alias?: string;
      inputs?: InputsConfig<MethodName>
      collapseTo?: CollapseToValue
    } & DynamicRequiredType<ReturnType> : {
      inputs?: InputsConfig<MethodName>
      collapseTo?: CollapseToValue
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

type IsScalar<TypeName extends any> = TypeName extends core.GetGen<'scalarNames'>
  ? true
  : false;

type IsObject<Name extends any> = Name extends core.GetGen<'objectNames'>
  ? true
  : false

type IsEnum<Name extends any> = Name extends core.GetGen<'enumNames'>
  ? true
  : false

type IsInputObject<Name extends any> = Name extends core.GetGen<'inputNames'>
  ? true
  : false

/**
 * The kind that a GraphQL type may be.
 */
type Kind = 'Enum' | 'Object' | 'Scalar' | 'InputObject'

/**
 * Helper to safely reference a Kind type. For example instead of the following
 * which would admit a typo:
 *
 * ```ts
 * type Foo = Bar extends 'scalar' ? ...
 * ```
 *
 * You can do this which guarantees a correct reference:
 *
 * ```ts
 * type Foo = Bar extends AKind<'Scalar'> ? ...
 * ```
 *
 */
type AKind<T extends Kind> = T

type GetKind<Name extends any> = IsEnum<Name> extends true
  ? 'Enum'
  : IsScalar<Name> extends true
  ? 'Scalar'
  : IsObject<Name> extends true
  ? 'Object'
  : IsInputObject<Name> extends true
  ? 'InputObject'
  // FIXME should be `never`, but GQL objects named differently
  // than backing type fall into this branch
  : 'Object'

type NexusPrismaFields<ModelName extends keyof NexusPrismaTypes> = {
  [MethodName in keyof NexusPrismaTypes[ModelName]]: NexusPrismaMethod<
    ModelName,
    MethodName,
    GetKind<NexusPrismaTypes[ModelName][MethodName]> // Is the return type a scalar?
  >;
};

type NexusPrismaMethod<
  ModelName extends keyof NexusPrismaTypes,
  MethodName extends keyof NexusPrismaTypes[ModelName],
  ThisKind extends Kind,
  ReturnType extends any = NexusPrismaTypes[ModelName][MethodName]
> =
  ThisKind extends AKind<'Enum'>
  ? () => NexusPrismaFields<ModelName>
  : ThisKind extends AKind<'Scalar'>
  ? (opts?: NexusPrismaScalarOpts) => NexusPrismaFields<ModelName> // Return optional scalar opts
  : IsModelNameExistsInGraphQLTypes<ReturnType> extends true // If model name has a mapped graphql types
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
  Bubble: prisma.Bubble
  User: prisma.User
  Post: prisma.Post
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
  filtering: 'id' | 'authors' | 'rating' | 'status' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'rating' | 'status'
}

  },
    Bubble: {
    members: {
  filtering: 'id' | 'posts' | 'firstName' | 'lastName' | 'AND' | 'OR' | 'NOT' | 'bubble'
  ordering: 'id' | 'firstName' | 'lastName'
}

  },  User: {
    posts: {
  filtering: 'id' | 'authors' | 'rating' | 'status' | 'AND' | 'OR' | 'NOT'
  ordering: 'id' | 'rating' | 'status'
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
    status: 'PostStatus'

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

  // Pre-transform inputs
  interface PrismaInputs {
  
    PostWhereInput: prisma.PostWhereInput
    UserWhereInput: prisma.UserWhereInput
    BubbleWhereInput: prisma.BubbleWhereInput
    IdCompoundUniqueInput: prisma.IdCompoundUniqueInput
    BubbleWhereUniqueInput: prisma.BubbleWhereUniqueInput
    UserWhereUniqueInput: prisma.UserWhereUniqueInput
    PostWhereUniqueInput: prisma.PostWhereUniqueInput
    PostCreateWithoutAuthorsInput: prisma.PostCreateWithoutAuthorsInput
    PostCreateManyWithoutAuthorsInput: prisma.PostCreateManyWithoutAuthorsInput
    UserCreateWithoutBubbleInput: prisma.UserCreateWithoutBubbleInput
    UserCreateManyWithoutBubbleInput: prisma.UserCreateManyWithoutBubbleInput
    BubbleCreateInput: prisma.BubbleCreateInput
    PostUpdateWithoutAuthorsDataInput: prisma.PostUpdateWithoutAuthorsDataInput
    PostUpdateWithWhereUniqueWithoutAuthorsInput: prisma.PostUpdateWithWhereUniqueWithoutAuthorsInput
    PostScalarWhereInput: prisma.PostScalarWhereInput
    PostUpdateManyDataInput: prisma.PostUpdateManyDataInput
    PostUpdateManyWithWhereNestedInput: prisma.PostUpdateManyWithWhereNestedInput
    PostUpsertWithWhereUniqueWithoutAuthorsInput: prisma.PostUpsertWithWhereUniqueWithoutAuthorsInput
    PostUpdateManyWithoutAuthorsInput: prisma.PostUpdateManyWithoutAuthorsInput
    UserUpdateWithoutBubbleDataInput: prisma.UserUpdateWithoutBubbleDataInput
    UserUpdateWithWhereUniqueWithoutBubbleInput: prisma.UserUpdateWithWhereUniqueWithoutBubbleInput
    UserScalarWhereInput: prisma.UserScalarWhereInput
    UserUpdateManyDataInput: prisma.UserUpdateManyDataInput
    UserUpdateManyWithWhereNestedInput: prisma.UserUpdateManyWithWhereNestedInput
    UserUpsertWithWhereUniqueWithoutBubbleInput: prisma.UserUpsertWithWhereUniqueWithoutBubbleInput
    UserUpdateManyWithoutBubbleInput: prisma.UserUpdateManyWithoutBubbleInput
    BubbleUpdateInput: prisma.BubbleUpdateInput
    BubbleUpdateManyMutationInput: prisma.BubbleUpdateManyMutationInput
    BubbleCreateWithoutMembersInput: prisma.BubbleCreateWithoutMembersInput
    BubbleCreateOneWithoutMembersInput: prisma.BubbleCreateOneWithoutMembersInput
    UserCreateInput: prisma.UserCreateInput
    BubbleUpdateWithoutMembersDataInput: prisma.BubbleUpdateWithoutMembersDataInput
    BubbleUpsertWithoutMembersInput: prisma.BubbleUpsertWithoutMembersInput
    BubbleUpdateOneWithoutMembersInput: prisma.BubbleUpdateOneWithoutMembersInput
    UserUpdateInput: prisma.UserUpdateInput
    UserUpdateManyMutationInput: prisma.UserUpdateManyMutationInput
    UserCreateWithoutPostsInput: prisma.UserCreateWithoutPostsInput
    UserCreateManyWithoutPostsInput: prisma.UserCreateManyWithoutPostsInput
    PostCreateInput: prisma.PostCreateInput
    UserUpdateWithoutPostsDataInput: prisma.UserUpdateWithoutPostsDataInput
    UserUpdateWithWhereUniqueWithoutPostsInput: prisma.UserUpdateWithWhereUniqueWithoutPostsInput
    UserUpsertWithWhereUniqueWithoutPostsInput: prisma.UserUpsertWithWhereUniqueWithoutPostsInput
    UserUpdateManyWithoutPostsInput: prisma.UserUpdateManyWithoutPostsInput
    PostUpdateInput: prisma.PostUpdateInput
    PostUpdateManyMutationInput: prisma.PostUpdateManyMutationInput
    IntFilter: prisma.IntFilter
    UserFilter: prisma.UserFilter
    FloatFilter: prisma.FloatFilter
    PostStatusFilter: prisma.PostStatusFilter
    StringFilter: prisma.StringFilter
    PostFilter: prisma.PostFilter
    UUIDFilter: prisma.UUIDFilter
    DateTimeFilter: prisma.DateTimeFilter
    BubbleOrderByInput: prisma.BubbleOrderByInput
    UserOrderByInput: prisma.UserOrderByInput
    PostOrderByInput: prisma.PostOrderByInput
  }
}
  
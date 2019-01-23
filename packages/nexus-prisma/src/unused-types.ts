// Borrowed from https://github.com/AEB-labs/graphql-transformer
import {
  getNamedType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  GraphQLUnionType,
} from 'graphql'

export function removeUnusedTypesFromSchema(
  schema: GraphQLSchema,
): GraphQLSchema {
  const rootTypes = compact([
    schema.getQueryType(),
    schema.getMutationType(),
    schema.getSubscriptionType(),
  ])
  const objectTypes = Object.values(schema.getTypeMap()).filter(
    type => type instanceof GraphQLObjectType,
  ) as GraphQLObjectType[]

  return new GraphQLSchema({
    query: schema.getQueryType(),
    mutation: schema.getMutationType() || undefined,
    subscription: schema.getSubscriptionType() || undefined,
    directives: Array.from(schema.getDirectives()), // @types/graphql messed up - input requires [], but getDirectives() gets a ReadonlyArray.
    types: filterUsableInterfaceImplementations(objectTypes, rootTypes),
  })
}

/**
 * Finds all interface types that are reachable through any of the given types
 */
function findAllReachableInterfaces(
  types: GraphQLObjectType[],
): Set<GraphQLInterfaceType> {
  const visitedTypes = new Set<GraphQLType>()
  const interfaces = new Set<GraphQLInterfaceType>()

  function visitType(type: GraphQLType) {
    type = getNamedType(type)

    if (visitedTypes.has(type)) {
      return
    }
    visitedTypes.add(type)

    if (type instanceof GraphQLUnionType) {
      for (const option of type.getTypes()) {
        visitType(option)
      }
    } else if (
      type instanceof GraphQLInterfaceType ||
      type instanceof GraphQLObjectType
    ) {
      if (type instanceof GraphQLInterfaceType) {
        interfaces.add(type)
      }
      for (const field of Object.values(type.getFields())) {
        visitType(field.type)
      }
    }
  }

  for (const type of types) {
    visitType(type)
  }

  return interfaces
}

/**
 * Finds all object types that implement any of the interfaces reachable from any of the rootTypes
 * @param rootTypes types that are used fo reachability test
 * @param candidates the types which are filtered
 * @return the object types that are usable
 */
export function filterUsableInterfaceImplementations(
  candidates: GraphQLObjectType[],
  rootTypes: GraphQLObjectType[],
): GraphQLObjectType[] {
  const reachableInterfaces = findAllReachableInterfaces(rootTypes)
  const implementations = new Set<GraphQLObjectType>()
  let hasFoundNewInterfaces = false
  do {
    const newImplementations = candidates.filter(objectType =>
      objectType
        .getInterfaces()
        .some(implementedInterface =>
          reachableInterfaces.has(implementedInterface),
        ),
    )
    for (const impl of newImplementations) {
      implementations.add(impl)
    }
    // we might have introduced some new fields that make use of interfaces which need to be added to reachableInterfaces
    const newInterfaces = findAllReachableInterfaces(newImplementations)
    hasFoundNewInterfaces = false
    for (const newlyFoundInterface of Array.from(newInterfaces)) {
      if (!reachableInterfaces.has(newlyFoundInterface)) {
        // found some new interfaces, so trigger a new round
        hasFoundNewInterfaces = true
        reachableInterfaces.add(newlyFoundInterface)
      }
    }
  } while (hasFoundNewInterfaces)
  return Array.from(implementations)
}

function compact<T>(arr: (T | undefined | null)[]): T[] {
  return arr.filter(a => a != undefined) as T[]
}

// GENERATED TYPES FOR PLUGIN. /!\ DO NOT EDIT MANUALLY

import {
  ArgDefinition,
  RootValue,
  ArgsValue,
  ContextValue,
  MaybePromise,
  ResultValue,
} from 'gqliteral/dist/types'
import { GraphQLResolveInfo } from 'graphql'

// Types for Query

type Query =
  | QueryFields
  | { name: 'attribute', args?: QueryAttributeArgs[] | false, alias?: string  } 
  | { name: 'attributes', args?: QueryAttributesArgs[] | false, alias?: string  } 
  | { name: 'attributesConnection', args?: QueryAttributesConnectionArgs[] | false, alias?: string  } 
  | { name: 'brand', args?: QueryBrandArgs[] | false, alias?: string  } 
  | { name: 'brands', args?: QueryBrandsArgs[] | false, alias?: string  } 
  | { name: 'brandsConnection', args?: QueryBrandsConnectionArgs[] | false, alias?: string  } 
  | { name: 'collection', args?: QueryCollectionArgs[] | false, alias?: string  } 
  | { name: 'collections', args?: QueryCollectionsArgs[] | false, alias?: string  } 
  | { name: 'collectionsConnection', args?: QueryCollectionsConnectionArgs[] | false, alias?: string  } 
  | { name: 'option', args?: QueryOptionArgs[] | false, alias?: string  } 
  | { name: 'options', args?: QueryOptionsArgs[] | false, alias?: string  } 
  | { name: 'optionsConnection', args?: QueryOptionsConnectionArgs[] | false, alias?: string  } 
  | { name: 'optionValue', args?: QueryOptionValueArgs[] | false, alias?: string  } 
  | { name: 'optionValues', args?: QueryOptionValuesArgs[] | false, alias?: string  } 
  | { name: 'optionValuesConnection', args?: QueryOptionValuesConnectionArgs[] | false, alias?: string  } 
  | { name: 'product', args?: QueryProductArgs[] | false, alias?: string  } 
  | { name: 'products', args?: QueryProductsArgs[] | false, alias?: string  } 
  | { name: 'productsConnection', args?: QueryProductsConnectionArgs[] | false, alias?: string  } 
  | { name: 'variant', args?: QueryVariantArgs[] | false, alias?: string  } 
  | { name: 'variants', args?: QueryVariantsArgs[] | false, alias?: string  } 
  | { name: 'variantsConnection', args?: QueryVariantsConnectionArgs[] | false, alias?: string  } 
  | { name: 'node', args?: QueryNodeArgs[] | false, alias?: string  } 

type QueryFields =
  | 'attribute'
  | 'attributes'
  | 'attributesConnection'
  | 'brand'
  | 'brands'
  | 'brandsConnection'
  | 'collection'
  | 'collections'
  | 'collectionsConnection'
  | 'option'
  | 'options'
  | 'optionsConnection'
  | 'optionValue'
  | 'optionValues'
  | 'optionValuesConnection'
  | 'product'
  | 'products'
  | 'productsConnection'
  | 'variant'
  | 'variants'
  | 'variantsConnection'
  | 'node'


type QueryAttributeArgs =
  | 'where'
type QueryAttributesArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryAttributesConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryBrandArgs =
  | 'where'
type QueryBrandsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryBrandsConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryCollectionArgs =
  | 'where'
type QueryCollectionsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryCollectionsConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryOptionArgs =
  | 'where'
type QueryOptionsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryOptionsConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryOptionValueArgs =
  | 'where'
type QueryOptionValuesArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryOptionValuesConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryProductArgs =
  | 'where'
type QueryProductsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryProductsConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryVariantArgs =
  | 'where'
type QueryVariantsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryVariantsConnectionArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type QueryNodeArgs =
  | 'id'
  

interface QueryAlias {
  name: QueryFields
  alias: string
}

export interface QueryFieldDetails<GenTypes = GraphQLiteralGen> {
  attribute: {
    args: Record<QueryAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "attribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "attribute">>;
  }
  attributes: {
    args: Record<QueryAttributesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "attributes">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "attributes">>;
  }
  attributesConnection: {
    args: Record<QueryAttributesConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "attributesConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "attributesConnection">>;
  }
  brand: {
    args: Record<QueryBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "brand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "brand">>;
  }
  brands: {
    args: Record<QueryBrandsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "brands">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "brands">>;
  }
  brandsConnection: {
    args: Record<QueryBrandsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "brandsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "brandsConnection">>;
  }
  collection: {
    args: Record<QueryCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "collection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "collection">>;
  }
  collections: {
    args: Record<QueryCollectionsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "collections">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "collections">>;
  }
  collectionsConnection: {
    args: Record<QueryCollectionsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "collectionsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "collectionsConnection">>;
  }
  option: {
    args: Record<QueryOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "option">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "option">>;
  }
  options: {
    args: Record<QueryOptionsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "options">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "options">>;
  }
  optionsConnection: {
    args: Record<QueryOptionsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "optionsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "optionsConnection">>;
  }
  optionValue: {
    args: Record<QueryOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "optionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "optionValue">>;
  }
  optionValues: {
    args: Record<QueryOptionValuesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "optionValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "optionValues">>;
  }
  optionValuesConnection: {
    args: Record<QueryOptionValuesConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "optionValuesConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "optionValuesConnection">>;
  }
  product: {
    args: Record<QueryProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "product">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "product">>;
  }
  products: {
    args: Record<QueryProductsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "products">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "products">>;
  }
  productsConnection: {
    args: Record<QueryProductsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "productsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "productsConnection">>;
  }
  variant: {
    args: Record<QueryVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "variant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "variant">>;
  }
  variants: {
    args: Record<QueryVariantsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "variants">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "variants">>;
  }
  variantsConnection: {
    args: Record<QueryVariantsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "variantsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "variantsConnection">>;
  }
  node: {
    args: Record<QueryNodeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Query", "node">>;
  }
}
  

// Types for Attribute

type Attribute =
  | AttributeFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'key', args?: [] | false, alias?: string  } 
  | { name: 'value', args?: [] | false, alias?: string  } 
  | { name: 'products', args?: AttributeProductsArgs[] | false, alias?: string  } 

type AttributeFields =
  | 'id'
  | 'key'
  | 'value'
  | 'products'


type AttributeProductsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
  

interface AttributeAlias {
  name: AttributeFields
  alias: string
}

export interface AttributeFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Attribute">, args: ArgsValue<GenTypes, "Attribute", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Attribute", "id">>;
  }
  key: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Attribute">, args: ArgsValue<GenTypes, "Attribute", "key">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Attribute", "key">>;
  }
  value: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Attribute">, args: ArgsValue<GenTypes, "Attribute", "value">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Attribute", "value">>;
  }
  products: {
    args: Record<AttributeProductsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Attribute">, args: ArgsValue<GenTypes, "Attribute", "products">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Attribute", "products">>;
  }
}
  

// Types for Product

type Product =
  | ProductFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 
  | { name: 'brand', args?: [] | false, alias?: string  } 
  | { name: 'variants', args?: ProductVariantsArgs[] | false, alias?: string  } 
  | { name: 'collections', args?: ProductCollectionsArgs[] | false, alias?: string  } 
  | { name: 'attributes', args?: ProductAttributesArgs[] | false, alias?: string  } 

type ProductFields =
  | 'id'
  | 'name'
  | 'brand'
  | 'variants'
  | 'collections'
  | 'attributes'


type ProductVariantsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type ProductCollectionsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
type ProductAttributesArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
  

interface ProductAlias {
  name: ProductFields
  alias: string
}

export interface ProductFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Product", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Product", "name">>;
  }
  brand: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "brand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Product", "brand">>;
  }
  variants: {
    args: Record<ProductVariantsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "variants">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Product", "variants">>;
  }
  collections: {
    args: Record<ProductCollectionsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "collections">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Product", "collections">>;
  }
  attributes: {
    args: Record<ProductAttributesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "attributes">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Product", "attributes">>;
  }
}
  

// Types for Brand

type Brand =
  | BrandFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 
  | { name: 'products', args?: BrandProductsArgs[] | false, alias?: string  } 

type BrandFields =
  | 'id'
  | 'name'
  | 'products'


type BrandProductsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
  

interface BrandAlias {
  name: BrandFields
  alias: string
}

export interface BrandFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Brand">, args: ArgsValue<GenTypes, "Brand", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Brand", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Brand">, args: ArgsValue<GenTypes, "Brand", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Brand", "name">>;
  }
  products: {
    args: Record<BrandProductsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Brand">, args: ArgsValue<GenTypes, "Brand", "products">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Brand", "products">>;
  }
}
  

// Types for Variant

type Variant =
  | VariantFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'optionValues', args?: VariantOptionValuesArgs[] | false, alias?: string  } 
  | { name: 'price', args?: [] | false, alias?: string  } 

type VariantFields =
  | 'id'
  | 'optionValues'
  | 'price'


type VariantOptionValuesArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
  

interface VariantAlias {
  name: VariantFields
  alias: string
}

export interface VariantFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Variant">, args: ArgsValue<GenTypes, "Variant", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Variant", "id">>;
  }
  optionValues: {
    args: Record<VariantOptionValuesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Variant">, args: ArgsValue<GenTypes, "Variant", "optionValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Variant", "optionValues">>;
  }
  price: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Variant">, args: ArgsValue<GenTypes, "Variant", "price">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Variant", "price">>;
  }
}
  

// Types for OptionValue

type OptionValue =
  | OptionValueFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 
  | { name: 'option', args?: [] | false, alias?: string  } 

type OptionValueFields =
  | 'id'
  | 'name'
  | 'option'



  

interface OptionValueAlias {
  name: OptionValueFields
  alias: string
}

export interface OptionValueFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValue">, args: ArgsValue<GenTypes, "OptionValue", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValue", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValue">, args: ArgsValue<GenTypes, "OptionValue", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValue", "name">>;
  }
  option: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValue">, args: ArgsValue<GenTypes, "OptionValue", "option">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValue", "option">>;
  }
}
  

// Types for Option

type Option =
  | OptionFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 
  | { name: 'values', args?: OptionValuesArgs[] | false, alias?: string  } 

type OptionFields =
  | 'id'
  | 'name'
  | 'values'


type OptionValuesArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
  

interface OptionAlias {
  name: OptionFields
  alias: string
}

export interface OptionFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Option">, args: ArgsValue<GenTypes, "Option", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Option", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Option">, args: ArgsValue<GenTypes, "Option", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Option", "name">>;
  }
  values: {
    args: Record<OptionValuesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Option">, args: ArgsValue<GenTypes, "Option", "values">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Option", "values">>;
  }
}
  

// Types for Collection

type Collection =
  | CollectionFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 
  | { name: 'products', args?: CollectionProductsArgs[] | false, alias?: string  } 

type CollectionFields =
  | 'id'
  | 'name'
  | 'products'


type CollectionProductsArgs =
  | 'where'
  | 'orderBy'
  | 'skip'
  | 'after'
  | 'before'
  | 'first'
  | 'last'
  

interface CollectionAlias {
  name: CollectionFields
  alias: string
}

export interface CollectionFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Collection">, args: ArgsValue<GenTypes, "Collection", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Collection", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Collection">, args: ArgsValue<GenTypes, "Collection", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Collection", "name">>;
  }
  products: {
    args: Record<CollectionProductsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Collection">, args: ArgsValue<GenTypes, "Collection", "products">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Collection", "products">>;
  }
}
  

// Types for AttributeConnection

type AttributeConnection =
  | AttributeConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type AttributeConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

interface AttributeConnectionAlias {
  name: AttributeConnectionFields
  alias: string
}

export interface AttributeConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeConnection">, args: ArgsValue<GenTypes, "AttributeConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeConnection", "pageInfo">>;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "AttributeConnection">, args: ArgsValue<GenTypes, "AttributeConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeConnection", "edges">>;
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeConnection">, args: ArgsValue<GenTypes, "AttributeConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeConnection", "aggregate">>;
  }
}
  

// Types for PageInfo

type PageInfo =
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



  

interface PageInfoAlias {
  name: PageInfoFields
  alias: string
}

export interface PageInfoFieldDetails<GenTypes = GraphQLiteralGen> {
  hasNextPage: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "hasNextPage">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "PageInfo", "hasNextPage">>;
  }
  hasPreviousPage: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "hasPreviousPage">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "PageInfo", "hasPreviousPage">>;
  }
  startCursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "startCursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "PageInfo", "startCursor">>;
  }
  endCursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "endCursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "PageInfo", "endCursor">>;
  }
}
  

// Types for AttributeEdge

type AttributeEdge =
  | AttributeEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type AttributeEdgeFields =
  | 'node'
  | 'cursor'



  

interface AttributeEdgeAlias {
  name: AttributeEdgeFields
  alias: string
}

export interface AttributeEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeEdge">, args: ArgsValue<GenTypes, "AttributeEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeEdge", "node">>;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeEdge">, args: ArgsValue<GenTypes, "AttributeEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeEdge", "cursor">>;
  }
}
  

// Types for AggregateAttribute

type AggregateAttribute =
  | AggregateAttributeFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregateAttributeFields =
  | 'count'



  

interface AggregateAttributeAlias {
  name: AggregateAttributeFields
  alias: string
}

export interface AggregateAttributeFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AggregateAttribute">, args: ArgsValue<GenTypes, "AggregateAttribute", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AggregateAttribute", "count">>;
  }
}
  

// Types for BrandConnection

type BrandConnection =
  | BrandConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type BrandConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

interface BrandConnectionAlias {
  name: BrandConnectionFields
  alias: string
}

export interface BrandConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandConnection">, args: ArgsValue<GenTypes, "BrandConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandConnection", "pageInfo">>;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "BrandConnection">, args: ArgsValue<GenTypes, "BrandConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandConnection", "edges">>;
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandConnection">, args: ArgsValue<GenTypes, "BrandConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandConnection", "aggregate">>;
  }
}
  

// Types for BrandEdge

type BrandEdge =
  | BrandEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type BrandEdgeFields =
  | 'node'
  | 'cursor'



  

interface BrandEdgeAlias {
  name: BrandEdgeFields
  alias: string
}

export interface BrandEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandEdge">, args: ArgsValue<GenTypes, "BrandEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandEdge", "node">>;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandEdge">, args: ArgsValue<GenTypes, "BrandEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandEdge", "cursor">>;
  }
}
  

// Types for AggregateBrand

type AggregateBrand =
  | AggregateBrandFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregateBrandFields =
  | 'count'



  

interface AggregateBrandAlias {
  name: AggregateBrandFields
  alias: string
}

export interface AggregateBrandFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AggregateBrand">, args: ArgsValue<GenTypes, "AggregateBrand", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AggregateBrand", "count">>;
  }
}
  

// Types for CollectionConnection

type CollectionConnection =
  | CollectionConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type CollectionConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

interface CollectionConnectionAlias {
  name: CollectionConnectionFields
  alias: string
}

export interface CollectionConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionConnection">, args: ArgsValue<GenTypes, "CollectionConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionConnection", "pageInfo">>;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "CollectionConnection">, args: ArgsValue<GenTypes, "CollectionConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionConnection", "edges">>;
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionConnection">, args: ArgsValue<GenTypes, "CollectionConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionConnection", "aggregate">>;
  }
}
  

// Types for CollectionEdge

type CollectionEdge =
  | CollectionEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type CollectionEdgeFields =
  | 'node'
  | 'cursor'



  

interface CollectionEdgeAlias {
  name: CollectionEdgeFields
  alias: string
}

export interface CollectionEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionEdge">, args: ArgsValue<GenTypes, "CollectionEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionEdge", "node">>;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionEdge">, args: ArgsValue<GenTypes, "CollectionEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionEdge", "cursor">>;
  }
}
  

// Types for AggregateCollection

type AggregateCollection =
  | AggregateCollectionFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregateCollectionFields =
  | 'count'



  

interface AggregateCollectionAlias {
  name: AggregateCollectionFields
  alias: string
}

export interface AggregateCollectionFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AggregateCollection">, args: ArgsValue<GenTypes, "AggregateCollection", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AggregateCollection", "count">>;
  }
}
  

// Types for OptionConnection

type OptionConnection =
  | OptionConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type OptionConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

interface OptionConnectionAlias {
  name: OptionConnectionFields
  alias: string
}

export interface OptionConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionConnection">, args: ArgsValue<GenTypes, "OptionConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionConnection", "pageInfo">>;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "OptionConnection">, args: ArgsValue<GenTypes, "OptionConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionConnection", "edges">>;
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionConnection">, args: ArgsValue<GenTypes, "OptionConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionConnection", "aggregate">>;
  }
}
  

// Types for OptionEdge

type OptionEdge =
  | OptionEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type OptionEdgeFields =
  | 'node'
  | 'cursor'



  

interface OptionEdgeAlias {
  name: OptionEdgeFields
  alias: string
}

export interface OptionEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionEdge">, args: ArgsValue<GenTypes, "OptionEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionEdge", "node">>;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionEdge">, args: ArgsValue<GenTypes, "OptionEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionEdge", "cursor">>;
  }
}
  

// Types for AggregateOption

type AggregateOption =
  | AggregateOptionFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregateOptionFields =
  | 'count'



  

interface AggregateOptionAlias {
  name: AggregateOptionFields
  alias: string
}

export interface AggregateOptionFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AggregateOption">, args: ArgsValue<GenTypes, "AggregateOption", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AggregateOption", "count">>;
  }
}
  

// Types for OptionValueConnection

type OptionValueConnection =
  | OptionValueConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type OptionValueConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

interface OptionValueConnectionAlias {
  name: OptionValueConnectionFields
  alias: string
}

export interface OptionValueConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueConnection">, args: ArgsValue<GenTypes, "OptionValueConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueConnection", "pageInfo">>;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "OptionValueConnection">, args: ArgsValue<GenTypes, "OptionValueConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueConnection", "edges">>;
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueConnection">, args: ArgsValue<GenTypes, "OptionValueConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueConnection", "aggregate">>;
  }
}
  

// Types for OptionValueEdge

type OptionValueEdge =
  | OptionValueEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type OptionValueEdgeFields =
  | 'node'
  | 'cursor'



  

interface OptionValueEdgeAlias {
  name: OptionValueEdgeFields
  alias: string
}

export interface OptionValueEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueEdge">, args: ArgsValue<GenTypes, "OptionValueEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueEdge", "node">>;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueEdge">, args: ArgsValue<GenTypes, "OptionValueEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueEdge", "cursor">>;
  }
}
  

// Types for AggregateOptionValue

type AggregateOptionValue =
  | AggregateOptionValueFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregateOptionValueFields =
  | 'count'



  

interface AggregateOptionValueAlias {
  name: AggregateOptionValueFields
  alias: string
}

export interface AggregateOptionValueFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AggregateOptionValue">, args: ArgsValue<GenTypes, "AggregateOptionValue", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AggregateOptionValue", "count">>;
  }
}
  

// Types for ProductConnection

type ProductConnection =
  | ProductConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type ProductConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

interface ProductConnectionAlias {
  name: ProductConnectionFields
  alias: string
}

export interface ProductConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductConnection">, args: ArgsValue<GenTypes, "ProductConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductConnection", "pageInfo">>;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "ProductConnection">, args: ArgsValue<GenTypes, "ProductConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductConnection", "edges">>;
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductConnection">, args: ArgsValue<GenTypes, "ProductConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductConnection", "aggregate">>;
  }
}
  

// Types for ProductEdge

type ProductEdge =
  | ProductEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type ProductEdgeFields =
  | 'node'
  | 'cursor'



  

interface ProductEdgeAlias {
  name: ProductEdgeFields
  alias: string
}

export interface ProductEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductEdge">, args: ArgsValue<GenTypes, "ProductEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductEdge", "node">>;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductEdge">, args: ArgsValue<GenTypes, "ProductEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductEdge", "cursor">>;
  }
}
  

// Types for AggregateProduct

type AggregateProduct =
  | AggregateProductFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregateProductFields =
  | 'count'



  

interface AggregateProductAlias {
  name: AggregateProductFields
  alias: string
}

export interface AggregateProductFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AggregateProduct">, args: ArgsValue<GenTypes, "AggregateProduct", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AggregateProduct", "count">>;
  }
}
  

// Types for VariantConnection

type VariantConnection =
  | VariantConnectionFields
  | { name: 'pageInfo', args?: [] | false, alias?: string  } 
  | { name: 'edges', args?: [] | false, alias?: string  } 
  | { name: 'aggregate', args?: [] | false, alias?: string  } 

type VariantConnectionFields =
  | 'pageInfo'
  | 'edges'
  | 'aggregate'



  

interface VariantConnectionAlias {
  name: VariantConnectionFields
  alias: string
}

export interface VariantConnectionFieldDetails<GenTypes = GraphQLiteralGen> {
  pageInfo: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantConnection">, args: ArgsValue<GenTypes, "VariantConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantConnection", "pageInfo">>;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "VariantConnection">, args: ArgsValue<GenTypes, "VariantConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantConnection", "edges">>;
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantConnection">, args: ArgsValue<GenTypes, "VariantConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantConnection", "aggregate">>;
  }
}
  

// Types for VariantEdge

type VariantEdge =
  | VariantEdgeFields
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'cursor', args?: [] | false, alias?: string  } 

type VariantEdgeFields =
  | 'node'
  | 'cursor'



  

interface VariantEdgeAlias {
  name: VariantEdgeFields
  alias: string
}

export interface VariantEdgeFieldDetails<GenTypes = GraphQLiteralGen> {
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantEdge">, args: ArgsValue<GenTypes, "VariantEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantEdge", "node">>;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantEdge">, args: ArgsValue<GenTypes, "VariantEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantEdge", "cursor">>;
  }
}
  

// Types for AggregateVariant

type AggregateVariant =
  | AggregateVariantFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type AggregateVariantFields =
  | 'count'



  

interface AggregateVariantAlias {
  name: AggregateVariantFields
  alias: string
}

export interface AggregateVariantFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AggregateVariant">, args: ArgsValue<GenTypes, "AggregateVariant", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AggregateVariant", "count">>;
  }
}
  

// Types for Mutation

type Mutation =
  | MutationFields
  | { name: 'createAttribute', args?: MutationCreateAttributeArgs[] | false, alias?: string  } 
  | { name: 'updateAttribute', args?: MutationUpdateAttributeArgs[] | false, alias?: string  } 
  | { name: 'updateManyAttributes', args?: MutationUpdateManyAttributesArgs[] | false, alias?: string  } 
  | { name: 'upsertAttribute', args?: MutationUpsertAttributeArgs[] | false, alias?: string  } 
  | { name: 'deleteAttribute', args?: MutationDeleteAttributeArgs[] | false, alias?: string  } 
  | { name: 'deleteManyAttributes', args?: MutationDeleteManyAttributesArgs[] | false, alias?: string  } 
  | { name: 'createBrand', args?: MutationCreateBrandArgs[] | false, alias?: string  } 
  | { name: 'updateBrand', args?: MutationUpdateBrandArgs[] | false, alias?: string  } 
  | { name: 'updateManyBrands', args?: MutationUpdateManyBrandsArgs[] | false, alias?: string  } 
  | { name: 'upsertBrand', args?: MutationUpsertBrandArgs[] | false, alias?: string  } 
  | { name: 'deleteBrand', args?: MutationDeleteBrandArgs[] | false, alias?: string  } 
  | { name: 'deleteManyBrands', args?: MutationDeleteManyBrandsArgs[] | false, alias?: string  } 
  | { name: 'createCollection', args?: MutationCreateCollectionArgs[] | false, alias?: string  } 
  | { name: 'updateCollection', args?: MutationUpdateCollectionArgs[] | false, alias?: string  } 
  | { name: 'updateManyCollections', args?: MutationUpdateManyCollectionsArgs[] | false, alias?: string  } 
  | { name: 'upsertCollection', args?: MutationUpsertCollectionArgs[] | false, alias?: string  } 
  | { name: 'deleteCollection', args?: MutationDeleteCollectionArgs[] | false, alias?: string  } 
  | { name: 'deleteManyCollections', args?: MutationDeleteManyCollectionsArgs[] | false, alias?: string  } 
  | { name: 'createOption', args?: MutationCreateOptionArgs[] | false, alias?: string  } 
  | { name: 'updateOption', args?: MutationUpdateOptionArgs[] | false, alias?: string  } 
  | { name: 'updateManyOptions', args?: MutationUpdateManyOptionsArgs[] | false, alias?: string  } 
  | { name: 'upsertOption', args?: MutationUpsertOptionArgs[] | false, alias?: string  } 
  | { name: 'deleteOption', args?: MutationDeleteOptionArgs[] | false, alias?: string  } 
  | { name: 'deleteManyOptions', args?: MutationDeleteManyOptionsArgs[] | false, alias?: string  } 
  | { name: 'createOptionValue', args?: MutationCreateOptionValueArgs[] | false, alias?: string  } 
  | { name: 'updateOptionValue', args?: MutationUpdateOptionValueArgs[] | false, alias?: string  } 
  | { name: 'updateManyOptionValues', args?: MutationUpdateManyOptionValuesArgs[] | false, alias?: string  } 
  | { name: 'upsertOptionValue', args?: MutationUpsertOptionValueArgs[] | false, alias?: string  } 
  | { name: 'deleteOptionValue', args?: MutationDeleteOptionValueArgs[] | false, alias?: string  } 
  | { name: 'deleteManyOptionValues', args?: MutationDeleteManyOptionValuesArgs[] | false, alias?: string  } 
  | { name: 'createProduct', args?: MutationCreateProductArgs[] | false, alias?: string  } 
  | { name: 'updateProduct', args?: MutationUpdateProductArgs[] | false, alias?: string  } 
  | { name: 'updateManyProducts', args?: MutationUpdateManyProductsArgs[] | false, alias?: string  } 
  | { name: 'upsertProduct', args?: MutationUpsertProductArgs[] | false, alias?: string  } 
  | { name: 'deleteProduct', args?: MutationDeleteProductArgs[] | false, alias?: string  } 
  | { name: 'deleteManyProducts', args?: MutationDeleteManyProductsArgs[] | false, alias?: string  } 
  | { name: 'createVariant', args?: MutationCreateVariantArgs[] | false, alias?: string  } 
  | { name: 'updateVariant', args?: MutationUpdateVariantArgs[] | false, alias?: string  } 
  | { name: 'updateManyVariants', args?: MutationUpdateManyVariantsArgs[] | false, alias?: string  } 
  | { name: 'upsertVariant', args?: MutationUpsertVariantArgs[] | false, alias?: string  } 
  | { name: 'deleteVariant', args?: MutationDeleteVariantArgs[] | false, alias?: string  } 
  | { name: 'deleteManyVariants', args?: MutationDeleteManyVariantsArgs[] | false, alias?: string  } 

type MutationFields =
  | 'createAttribute'
  | 'updateAttribute'
  | 'updateManyAttributes'
  | 'upsertAttribute'
  | 'deleteAttribute'
  | 'deleteManyAttributes'
  | 'createBrand'
  | 'updateBrand'
  | 'updateManyBrands'
  | 'upsertBrand'
  | 'deleteBrand'
  | 'deleteManyBrands'
  | 'createCollection'
  | 'updateCollection'
  | 'updateManyCollections'
  | 'upsertCollection'
  | 'deleteCollection'
  | 'deleteManyCollections'
  | 'createOption'
  | 'updateOption'
  | 'updateManyOptions'
  | 'upsertOption'
  | 'deleteOption'
  | 'deleteManyOptions'
  | 'createOptionValue'
  | 'updateOptionValue'
  | 'updateManyOptionValues'
  | 'upsertOptionValue'
  | 'deleteOptionValue'
  | 'deleteManyOptionValues'
  | 'createProduct'
  | 'updateProduct'
  | 'updateManyProducts'
  | 'upsertProduct'
  | 'deleteProduct'
  | 'deleteManyProducts'
  | 'createVariant'
  | 'updateVariant'
  | 'updateManyVariants'
  | 'upsertVariant'
  | 'deleteVariant'
  | 'deleteManyVariants'


type MutationCreateAttributeArgs =
  | 'data'
type MutationUpdateAttributeArgs =
  | 'data'
  | 'where'
type MutationUpdateManyAttributesArgs =
  | 'data'
  | 'where'
type MutationUpsertAttributeArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeleteAttributeArgs =
  | 'where'
type MutationDeleteManyAttributesArgs =
  | 'where'
type MutationCreateBrandArgs =
  | 'data'
type MutationUpdateBrandArgs =
  | 'data'
  | 'where'
type MutationUpdateManyBrandsArgs =
  | 'data'
  | 'where'
type MutationUpsertBrandArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeleteBrandArgs =
  | 'where'
type MutationDeleteManyBrandsArgs =
  | 'where'
type MutationCreateCollectionArgs =
  | 'data'
type MutationUpdateCollectionArgs =
  | 'data'
  | 'where'
type MutationUpdateManyCollectionsArgs =
  | 'data'
  | 'where'
type MutationUpsertCollectionArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeleteCollectionArgs =
  | 'where'
type MutationDeleteManyCollectionsArgs =
  | 'where'
type MutationCreateOptionArgs =
  | 'data'
type MutationUpdateOptionArgs =
  | 'data'
  | 'where'
type MutationUpdateManyOptionsArgs =
  | 'data'
  | 'where'
type MutationUpsertOptionArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeleteOptionArgs =
  | 'where'
type MutationDeleteManyOptionsArgs =
  | 'where'
type MutationCreateOptionValueArgs =
  | 'data'
type MutationUpdateOptionValueArgs =
  | 'data'
  | 'where'
type MutationUpdateManyOptionValuesArgs =
  | 'data'
  | 'where'
type MutationUpsertOptionValueArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeleteOptionValueArgs =
  | 'where'
type MutationDeleteManyOptionValuesArgs =
  | 'where'
type MutationCreateProductArgs =
  | 'data'
type MutationUpdateProductArgs =
  | 'data'
  | 'where'
type MutationUpdateManyProductsArgs =
  | 'data'
  | 'where'
type MutationUpsertProductArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeleteProductArgs =
  | 'where'
type MutationDeleteManyProductsArgs =
  | 'where'
type MutationCreateVariantArgs =
  | 'data'
type MutationUpdateVariantArgs =
  | 'data'
  | 'where'
type MutationUpdateManyVariantsArgs =
  | 'data'
  | 'where'
type MutationUpsertVariantArgs =
  | 'where'
  | 'create'
  | 'update'
type MutationDeleteVariantArgs =
  | 'where'
type MutationDeleteManyVariantsArgs =
  | 'where'
  

interface MutationAlias {
  name: MutationFields
  alias: string
}

export interface MutationFieldDetails<GenTypes = GraphQLiteralGen> {
  createAttribute: {
    args: Record<MutationCreateAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createAttribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "createAttribute">>;
  }
  updateAttribute: {
    args: Record<MutationUpdateAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateAttribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateAttribute">>;
  }
  updateManyAttributes: {
    args: Record<MutationUpdateManyAttributesArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyAttributes">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateManyAttributes">>;
  }
  upsertAttribute: {
    args: Record<MutationUpsertAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertAttribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "upsertAttribute">>;
  }
  deleteAttribute: {
    args: Record<MutationDeleteAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteAttribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteAttribute">>;
  }
  deleteManyAttributes: {
    args: Record<MutationDeleteManyAttributesArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyAttributes">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteManyAttributes">>;
  }
  createBrand: {
    args: Record<MutationCreateBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createBrand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "createBrand">>;
  }
  updateBrand: {
    args: Record<MutationUpdateBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateBrand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateBrand">>;
  }
  updateManyBrands: {
    args: Record<MutationUpdateManyBrandsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyBrands">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateManyBrands">>;
  }
  upsertBrand: {
    args: Record<MutationUpsertBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertBrand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "upsertBrand">>;
  }
  deleteBrand: {
    args: Record<MutationDeleteBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteBrand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteBrand">>;
  }
  deleteManyBrands: {
    args: Record<MutationDeleteManyBrandsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyBrands">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteManyBrands">>;
  }
  createCollection: {
    args: Record<MutationCreateCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createCollection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "createCollection">>;
  }
  updateCollection: {
    args: Record<MutationUpdateCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateCollection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateCollection">>;
  }
  updateManyCollections: {
    args: Record<MutationUpdateManyCollectionsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyCollections">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateManyCollections">>;
  }
  upsertCollection: {
    args: Record<MutationUpsertCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertCollection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "upsertCollection">>;
  }
  deleteCollection: {
    args: Record<MutationDeleteCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteCollection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteCollection">>;
  }
  deleteManyCollections: {
    args: Record<MutationDeleteManyCollectionsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyCollections">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteManyCollections">>;
  }
  createOption: {
    args: Record<MutationCreateOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createOption">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "createOption">>;
  }
  updateOption: {
    args: Record<MutationUpdateOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateOption">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateOption">>;
  }
  updateManyOptions: {
    args: Record<MutationUpdateManyOptionsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyOptions">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateManyOptions">>;
  }
  upsertOption: {
    args: Record<MutationUpsertOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertOption">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "upsertOption">>;
  }
  deleteOption: {
    args: Record<MutationDeleteOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteOption">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteOption">>;
  }
  deleteManyOptions: {
    args: Record<MutationDeleteManyOptionsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyOptions">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteManyOptions">>;
  }
  createOptionValue: {
    args: Record<MutationCreateOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createOptionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "createOptionValue">>;
  }
  updateOptionValue: {
    args: Record<MutationUpdateOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateOptionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateOptionValue">>;
  }
  updateManyOptionValues: {
    args: Record<MutationUpdateManyOptionValuesArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyOptionValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateManyOptionValues">>;
  }
  upsertOptionValue: {
    args: Record<MutationUpsertOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertOptionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "upsertOptionValue">>;
  }
  deleteOptionValue: {
    args: Record<MutationDeleteOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteOptionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteOptionValue">>;
  }
  deleteManyOptionValues: {
    args: Record<MutationDeleteManyOptionValuesArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyOptionValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteManyOptionValues">>;
  }
  createProduct: {
    args: Record<MutationCreateProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createProduct">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "createProduct">>;
  }
  updateProduct: {
    args: Record<MutationUpdateProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateProduct">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateProduct">>;
  }
  updateManyProducts: {
    args: Record<MutationUpdateManyProductsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyProducts">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateManyProducts">>;
  }
  upsertProduct: {
    args: Record<MutationUpsertProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertProduct">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "upsertProduct">>;
  }
  deleteProduct: {
    args: Record<MutationDeleteProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteProduct">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteProduct">>;
  }
  deleteManyProducts: {
    args: Record<MutationDeleteManyProductsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyProducts">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteManyProducts">>;
  }
  createVariant: {
    args: Record<MutationCreateVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createVariant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "createVariant">>;
  }
  updateVariant: {
    args: Record<MutationUpdateVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateVariant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateVariant">>;
  }
  updateManyVariants: {
    args: Record<MutationUpdateManyVariantsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyVariants">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "updateManyVariants">>;
  }
  upsertVariant: {
    args: Record<MutationUpsertVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertVariant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "upsertVariant">>;
  }
  deleteVariant: {
    args: Record<MutationDeleteVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteVariant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteVariant">>;
  }
  deleteManyVariants: {
    args: Record<MutationDeleteManyVariantsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyVariants">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Mutation", "deleteManyVariants">>;
  }
}
  

// Types for BatchPayload

type BatchPayload =
  | BatchPayloadFields
  | { name: 'count', args?: [] | false, alias?: string  } 

type BatchPayloadFields =
  | 'count'



  

interface BatchPayloadAlias {
  name: BatchPayloadFields
  alias: string
}

export interface BatchPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  count: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BatchPayload">, args: ArgsValue<GenTypes, "BatchPayload", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BatchPayload", "count">>;
  }
}
  

// Types for Subscription

type Subscription =
  | SubscriptionFields
  | { name: 'attribute', args?: SubscriptionAttributeArgs[] | false, alias?: string  } 
  | { name: 'brand', args?: SubscriptionBrandArgs[] | false, alias?: string  } 
  | { name: 'collection', args?: SubscriptionCollectionArgs[] | false, alias?: string  } 
  | { name: 'option', args?: SubscriptionOptionArgs[] | false, alias?: string  } 
  | { name: 'optionValue', args?: SubscriptionOptionValueArgs[] | false, alias?: string  } 
  | { name: 'product', args?: SubscriptionProductArgs[] | false, alias?: string  } 
  | { name: 'variant', args?: SubscriptionVariantArgs[] | false, alias?: string  } 

type SubscriptionFields =
  | 'attribute'
  | 'brand'
  | 'collection'
  | 'option'
  | 'optionValue'
  | 'product'
  | 'variant'


type SubscriptionAttributeArgs =
  | 'where'
type SubscriptionBrandArgs =
  | 'where'
type SubscriptionCollectionArgs =
  | 'where'
type SubscriptionOptionArgs =
  | 'where'
type SubscriptionOptionValueArgs =
  | 'where'
type SubscriptionProductArgs =
  | 'where'
type SubscriptionVariantArgs =
  | 'where'
  

interface SubscriptionAlias {
  name: SubscriptionFields
  alias: string
}

export interface SubscriptionFieldDetails<GenTypes = GraphQLiteralGen> {
  attribute: {
    args: Record<SubscriptionAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "attribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Subscription", "attribute">>;
  }
  brand: {
    args: Record<SubscriptionBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "brand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Subscription", "brand">>;
  }
  collection: {
    args: Record<SubscriptionCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "collection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Subscription", "collection">>;
  }
  option: {
    args: Record<SubscriptionOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "option">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Subscription", "option">>;
  }
  optionValue: {
    args: Record<SubscriptionOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "optionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Subscription", "optionValue">>;
  }
  product: {
    args: Record<SubscriptionProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "product">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Subscription", "product">>;
  }
  variant: {
    args: Record<SubscriptionVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "variant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "Subscription", "variant">>;
  }
}
  

// Types for AttributeSubscriptionPayload

type AttributeSubscriptionPayload =
  | AttributeSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type AttributeSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

interface AttributeSubscriptionPayloadAlias {
  name: AttributeSubscriptionPayloadFields
  alias: string
}

export interface AttributeSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeSubscriptionPayload">, args: ArgsValue<GenTypes, "AttributeSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeSubscriptionPayload", "mutation">>;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeSubscriptionPayload">, args: ArgsValue<GenTypes, "AttributeSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeSubscriptionPayload", "node">>;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "AttributeSubscriptionPayload">, args: ArgsValue<GenTypes, "AttributeSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeSubscriptionPayload", "updatedFields">>;
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeSubscriptionPayload">, args: ArgsValue<GenTypes, "AttributeSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributeSubscriptionPayload", "previousValues">>;
  }
}
  

// Types for AttributePreviousValues

type AttributePreviousValues =
  | AttributePreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'key', args?: [] | false, alias?: string  } 
  | { name: 'value', args?: [] | false, alias?: string  } 

type AttributePreviousValuesFields =
  | 'id'
  | 'key'
  | 'value'



  

interface AttributePreviousValuesAlias {
  name: AttributePreviousValuesFields
  alias: string
}

export interface AttributePreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributePreviousValues">, args: ArgsValue<GenTypes, "AttributePreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributePreviousValues", "id">>;
  }
  key: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributePreviousValues">, args: ArgsValue<GenTypes, "AttributePreviousValues", "key">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributePreviousValues", "key">>;
  }
  value: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributePreviousValues">, args: ArgsValue<GenTypes, "AttributePreviousValues", "value">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "AttributePreviousValues", "value">>;
  }
}
  

// Types for BrandSubscriptionPayload

type BrandSubscriptionPayload =
  | BrandSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type BrandSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

interface BrandSubscriptionPayloadAlias {
  name: BrandSubscriptionPayloadFields
  alias: string
}

export interface BrandSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandSubscriptionPayload">, args: ArgsValue<GenTypes, "BrandSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandSubscriptionPayload", "mutation">>;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandSubscriptionPayload">, args: ArgsValue<GenTypes, "BrandSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandSubscriptionPayload", "node">>;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "BrandSubscriptionPayload">, args: ArgsValue<GenTypes, "BrandSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandSubscriptionPayload", "updatedFields">>;
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandSubscriptionPayload">, args: ArgsValue<GenTypes, "BrandSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandSubscriptionPayload", "previousValues">>;
  }
}
  

// Types for BrandPreviousValues

type BrandPreviousValues =
  | BrandPreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 

type BrandPreviousValuesFields =
  | 'id'
  | 'name'



  

interface BrandPreviousValuesAlias {
  name: BrandPreviousValuesFields
  alias: string
}

export interface BrandPreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandPreviousValues">, args: ArgsValue<GenTypes, "BrandPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandPreviousValues", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandPreviousValues">, args: ArgsValue<GenTypes, "BrandPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "BrandPreviousValues", "name">>;
  }
}
  

// Types for CollectionSubscriptionPayload

type CollectionSubscriptionPayload =
  | CollectionSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type CollectionSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

interface CollectionSubscriptionPayloadAlias {
  name: CollectionSubscriptionPayloadFields
  alias: string
}

export interface CollectionSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionSubscriptionPayload">, args: ArgsValue<GenTypes, "CollectionSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionSubscriptionPayload", "mutation">>;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionSubscriptionPayload">, args: ArgsValue<GenTypes, "CollectionSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionSubscriptionPayload", "node">>;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "CollectionSubscriptionPayload">, args: ArgsValue<GenTypes, "CollectionSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionSubscriptionPayload", "updatedFields">>;
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionSubscriptionPayload">, args: ArgsValue<GenTypes, "CollectionSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionSubscriptionPayload", "previousValues">>;
  }
}
  

// Types for CollectionPreviousValues

type CollectionPreviousValues =
  | CollectionPreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 

type CollectionPreviousValuesFields =
  | 'id'
  | 'name'



  

interface CollectionPreviousValuesAlias {
  name: CollectionPreviousValuesFields
  alias: string
}

export interface CollectionPreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionPreviousValues">, args: ArgsValue<GenTypes, "CollectionPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionPreviousValues", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionPreviousValues">, args: ArgsValue<GenTypes, "CollectionPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "CollectionPreviousValues", "name">>;
  }
}
  

// Types for OptionSubscriptionPayload

type OptionSubscriptionPayload =
  | OptionSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type OptionSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

interface OptionSubscriptionPayloadAlias {
  name: OptionSubscriptionPayloadFields
  alias: string
}

export interface OptionSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionSubscriptionPayload", "mutation">>;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionSubscriptionPayload", "node">>;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "OptionSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionSubscriptionPayload", "updatedFields">>;
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionSubscriptionPayload", "previousValues">>;
  }
}
  

// Types for OptionPreviousValues

type OptionPreviousValues =
  | OptionPreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 

type OptionPreviousValuesFields =
  | 'id'
  | 'name'



  

interface OptionPreviousValuesAlias {
  name: OptionPreviousValuesFields
  alias: string
}

export interface OptionPreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionPreviousValues">, args: ArgsValue<GenTypes, "OptionPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionPreviousValues", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionPreviousValues">, args: ArgsValue<GenTypes, "OptionPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionPreviousValues", "name">>;
  }
}
  

// Types for OptionValueSubscriptionPayload

type OptionValueSubscriptionPayload =
  | OptionValueSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type OptionValueSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

interface OptionValueSubscriptionPayloadAlias {
  name: OptionValueSubscriptionPayloadFields
  alias: string
}

export interface OptionValueSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionValueSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueSubscriptionPayload", "mutation">>;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionValueSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueSubscriptionPayload", "node">>;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "OptionValueSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionValueSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueSubscriptionPayload", "updatedFields">>;
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionValueSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValueSubscriptionPayload", "previousValues">>;
  }
}
  

// Types for OptionValuePreviousValues

type OptionValuePreviousValues =
  | OptionValuePreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 

type OptionValuePreviousValuesFields =
  | 'id'
  | 'name'



  

interface OptionValuePreviousValuesAlias {
  name: OptionValuePreviousValuesFields
  alias: string
}

export interface OptionValuePreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValuePreviousValues">, args: ArgsValue<GenTypes, "OptionValuePreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValuePreviousValues", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValuePreviousValues">, args: ArgsValue<GenTypes, "OptionValuePreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "OptionValuePreviousValues", "name">>;
  }
}
  

// Types for ProductSubscriptionPayload

type ProductSubscriptionPayload =
  | ProductSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type ProductSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

interface ProductSubscriptionPayloadAlias {
  name: ProductSubscriptionPayloadFields
  alias: string
}

export interface ProductSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductSubscriptionPayload">, args: ArgsValue<GenTypes, "ProductSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductSubscriptionPayload", "mutation">>;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductSubscriptionPayload">, args: ArgsValue<GenTypes, "ProductSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductSubscriptionPayload", "node">>;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "ProductSubscriptionPayload">, args: ArgsValue<GenTypes, "ProductSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductSubscriptionPayload", "updatedFields">>;
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductSubscriptionPayload">, args: ArgsValue<GenTypes, "ProductSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductSubscriptionPayload", "previousValues">>;
  }
}
  

// Types for ProductPreviousValues

type ProductPreviousValues =
  | ProductPreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'name', args?: [] | false, alias?: string  } 

type ProductPreviousValuesFields =
  | 'id'
  | 'name'



  

interface ProductPreviousValuesAlias {
  name: ProductPreviousValuesFields
  alias: string
}

export interface ProductPreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductPreviousValues">, args: ArgsValue<GenTypes, "ProductPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductPreviousValues", "id">>;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductPreviousValues">, args: ArgsValue<GenTypes, "ProductPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "ProductPreviousValues", "name">>;
  }
}
  

// Types for VariantSubscriptionPayload

type VariantSubscriptionPayload =
  | VariantSubscriptionPayloadFields
  | { name: 'mutation', args?: [] | false, alias?: string  } 
  | { name: 'node', args?: [] | false, alias?: string  } 
  | { name: 'updatedFields', args?: [] | false, alias?: string  } 
  | { name: 'previousValues', args?: [] | false, alias?: string  } 

type VariantSubscriptionPayloadFields =
  | 'mutation'
  | 'node'
  | 'updatedFields'
  | 'previousValues'



  

interface VariantSubscriptionPayloadAlias {
  name: VariantSubscriptionPayloadFields
  alias: string
}

export interface VariantSubscriptionPayloadFieldDetails<GenTypes = GraphQLiteralGen> {
  mutation: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantSubscriptionPayload">, args: ArgsValue<GenTypes, "VariantSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantSubscriptionPayload", "mutation">>;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantSubscriptionPayload">, args: ArgsValue<GenTypes, "VariantSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantSubscriptionPayload", "node">>;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "VariantSubscriptionPayload">, args: ArgsValue<GenTypes, "VariantSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantSubscriptionPayload", "updatedFields">>;
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantSubscriptionPayload">, args: ArgsValue<GenTypes, "VariantSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantSubscriptionPayload", "previousValues">>;
  }
}
  

// Types for VariantPreviousValues

type VariantPreviousValues =
  | VariantPreviousValuesFields
  | { name: 'id', args?: [] | false, alias?: string  } 
  | { name: 'price', args?: [] | false, alias?: string  } 

type VariantPreviousValuesFields =
  | 'id'
  | 'price'



  

interface VariantPreviousValuesAlias {
  name: VariantPreviousValuesFields
  alias: string
}

export interface VariantPreviousValuesFieldDetails<GenTypes = GraphQLiteralGen> {
  id: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantPreviousValues">, args: ArgsValue<GenTypes, "VariantPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantPreviousValues", "id">>;
  }
  price: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantPreviousValues">, args: ArgsValue<GenTypes, "VariantPreviousValues", "price">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => MaybePromise<ResultValue<GenTypes, "VariantPreviousValues", "price">>;
  }
}
  


export interface PluginTypes {
  fields: {
    Query: Query
    Attribute: Attribute
    Product: Product
    Brand: Brand
    Variant: Variant
    OptionValue: OptionValue
    Option: Option
    Collection: Collection
    AttributeConnection: AttributeConnection
    PageInfo: PageInfo
    AttributeEdge: AttributeEdge
    AggregateAttribute: AggregateAttribute
    BrandConnection: BrandConnection
    BrandEdge: BrandEdge
    AggregateBrand: AggregateBrand
    CollectionConnection: CollectionConnection
    CollectionEdge: CollectionEdge
    AggregateCollection: AggregateCollection
    OptionConnection: OptionConnection
    OptionEdge: OptionEdge
    AggregateOption: AggregateOption
    OptionValueConnection: OptionValueConnection
    OptionValueEdge: OptionValueEdge
    AggregateOptionValue: AggregateOptionValue
    ProductConnection: ProductConnection
    ProductEdge: ProductEdge
    AggregateProduct: AggregateProduct
    VariantConnection: VariantConnection
    VariantEdge: VariantEdge
    AggregateVariant: AggregateVariant
    Mutation: Mutation
    BatchPayload: BatchPayload
    Subscription: Subscription
    AttributeSubscriptionPayload: AttributeSubscriptionPayload
    AttributePreviousValues: AttributePreviousValues
    BrandSubscriptionPayload: BrandSubscriptionPayload
    BrandPreviousValues: BrandPreviousValues
    CollectionSubscriptionPayload: CollectionSubscriptionPayload
    CollectionPreviousValues: CollectionPreviousValues
    OptionSubscriptionPayload: OptionSubscriptionPayload
    OptionPreviousValues: OptionPreviousValues
    OptionValueSubscriptionPayload: OptionValueSubscriptionPayload
    OptionValuePreviousValues: OptionValuePreviousValues
    ProductSubscriptionPayload: ProductSubscriptionPayload
    ProductPreviousValues: ProductPreviousValues
    VariantSubscriptionPayload: VariantSubscriptionPayload
    VariantPreviousValues: VariantPreviousValues
  }
  aliases: {
    Query: QueryAlias
    Attribute: AttributeAlias
    Product: ProductAlias
    Brand: BrandAlias
    Variant: VariantAlias
    OptionValue: OptionValueAlias
    Option: OptionAlias
    Collection: CollectionAlias
    AttributeConnection: AttributeConnectionAlias
    PageInfo: PageInfoAlias
    AttributeEdge: AttributeEdgeAlias
    AggregateAttribute: AggregateAttributeAlias
    BrandConnection: BrandConnectionAlias
    BrandEdge: BrandEdgeAlias
    AggregateBrand: AggregateBrandAlias
    CollectionConnection: CollectionConnectionAlias
    CollectionEdge: CollectionEdgeAlias
    AggregateCollection: AggregateCollectionAlias
    OptionConnection: OptionConnectionAlias
    OptionEdge: OptionEdgeAlias
    AggregateOption: AggregateOptionAlias
    OptionValueConnection: OptionValueConnectionAlias
    OptionValueEdge: OptionValueEdgeAlias
    AggregateOptionValue: AggregateOptionValueAlias
    ProductConnection: ProductConnectionAlias
    ProductEdge: ProductEdgeAlias
    AggregateProduct: AggregateProductAlias
    VariantConnection: VariantConnectionAlias
    VariantEdge: VariantEdgeAlias
    AggregateVariant: AggregateVariantAlias
    Mutation: MutationAlias
    BatchPayload: BatchPayloadAlias
    Subscription: SubscriptionAlias
    AttributeSubscriptionPayload: AttributeSubscriptionPayloadAlias
    AttributePreviousValues: AttributePreviousValuesAlias
    BrandSubscriptionPayload: BrandSubscriptionPayloadAlias
    BrandPreviousValues: BrandPreviousValuesAlias
    CollectionSubscriptionPayload: CollectionSubscriptionPayloadAlias
    CollectionPreviousValues: CollectionPreviousValuesAlias
    OptionSubscriptionPayload: OptionSubscriptionPayloadAlias
    OptionPreviousValues: OptionPreviousValuesAlias
    OptionValueSubscriptionPayload: OptionValueSubscriptionPayloadAlias
    OptionValuePreviousValues: OptionValuePreviousValuesAlias
    ProductSubscriptionPayload: ProductSubscriptionPayloadAlias
    ProductPreviousValues: ProductPreviousValuesAlias
    VariantSubscriptionPayload: VariantSubscriptionPayloadAlias
    VariantPreviousValues: VariantPreviousValuesAlias
  }
  objects: {
    Query: QueryFieldDetails
    Attribute: AttributeFieldDetails
    Product: ProductFieldDetails
    Brand: BrandFieldDetails
    Variant: VariantFieldDetails
    OptionValue: OptionValueFieldDetails
    Option: OptionFieldDetails
    Collection: CollectionFieldDetails
    AttributeConnection: AttributeConnectionFieldDetails
    PageInfo: PageInfoFieldDetails
    AttributeEdge: AttributeEdgeFieldDetails
    AggregateAttribute: AggregateAttributeFieldDetails
    BrandConnection: BrandConnectionFieldDetails
    BrandEdge: BrandEdgeFieldDetails
    AggregateBrand: AggregateBrandFieldDetails
    CollectionConnection: CollectionConnectionFieldDetails
    CollectionEdge: CollectionEdgeFieldDetails
    AggregateCollection: AggregateCollectionFieldDetails
    OptionConnection: OptionConnectionFieldDetails
    OptionEdge: OptionEdgeFieldDetails
    AggregateOption: AggregateOptionFieldDetails
    OptionValueConnection: OptionValueConnectionFieldDetails
    OptionValueEdge: OptionValueEdgeFieldDetails
    AggregateOptionValue: AggregateOptionValueFieldDetails
    ProductConnection: ProductConnectionFieldDetails
    ProductEdge: ProductEdgeFieldDetails
    AggregateProduct: AggregateProductFieldDetails
    VariantConnection: VariantConnectionFieldDetails
    VariantEdge: VariantEdgeFieldDetails
    AggregateVariant: AggregateVariantFieldDetails
    Mutation: MutationFieldDetails
    BatchPayload: BatchPayloadFieldDetails
    Subscription: SubscriptionFieldDetails
    AttributeSubscriptionPayload: AttributeSubscriptionPayloadFieldDetails
    AttributePreviousValues: AttributePreviousValuesFieldDetails
    BrandSubscriptionPayload: BrandSubscriptionPayloadFieldDetails
    BrandPreviousValues: BrandPreviousValuesFieldDetails
    CollectionSubscriptionPayload: CollectionSubscriptionPayloadFieldDetails
    CollectionPreviousValues: CollectionPreviousValuesFieldDetails
    OptionSubscriptionPayload: OptionSubscriptionPayloadFieldDetails
    OptionPreviousValues: OptionPreviousValuesFieldDetails
    OptionValueSubscriptionPayload: OptionValueSubscriptionPayloadFieldDetails
    OptionValuePreviousValues: OptionValuePreviousValuesFieldDetails
    ProductSubscriptionPayload: ProductSubscriptionPayloadFieldDetails
    ProductPreviousValues: ProductPreviousValuesFieldDetails
    VariantSubscriptionPayload: VariantSubscriptionPayloadFieldDetails
    VariantPreviousValues: VariantPreviousValuesFieldDetails
  }
}

// declare global {
//   interface GraphQLiteralGen extends PluginTypes {}
// }
  
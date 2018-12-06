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

import * as prisma from './prisma-client'

// Types for Query

type QueryObject =
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
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "attribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute | null> | prisma.Attribute | null;
  }
  attributes: {
    args: Record<QueryAttributesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "attributes">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute[]> | prisma.Attribute[];
  }
  attributesConnection: {
    args: Record<QueryAttributesConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "attributesConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AttributeConnection> | prisma.AttributeConnection;
  }
  brand: {
    args: Record<QueryBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "brand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand | null> | prisma.Brand | null;
  }
  brands: {
    args: Record<QueryBrandsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "brands">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand[]> | prisma.Brand[];
  }
  brandsConnection: {
    args: Record<QueryBrandsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "brandsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BrandConnection> | prisma.BrandConnection;
  }
  collection: {
    args: Record<QueryCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "collection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection | null> | prisma.Collection | null;
  }
  collections: {
    args: Record<QueryCollectionsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "collections">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection[]> | prisma.Collection[];
  }
  collectionsConnection: {
    args: Record<QueryCollectionsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "collectionsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.CollectionConnection> | prisma.CollectionConnection;
  }
  option: {
    args: Record<QueryOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "option">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option | null> | prisma.Option | null;
  }
  options: {
    args: Record<QueryOptionsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "options">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option[]> | prisma.Option[];
  }
  optionsConnection: {
    args: Record<QueryOptionsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "optionsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionConnection> | prisma.OptionConnection;
  }
  optionValue: {
    args: Record<QueryOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "optionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue | null> | prisma.OptionValue | null;
  }
  optionValues: {
    args: Record<QueryOptionValuesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "optionValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue[]> | prisma.OptionValue[];
  }
  optionValuesConnection: {
    args: Record<QueryOptionValuesConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "optionValuesConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValueConnection> | prisma.OptionValueConnection;
  }
  product: {
    args: Record<QueryProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "product">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product | null> | prisma.Product | null;
  }
  products: {
    args: Record<QueryProductsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "products">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product[]> | prisma.Product[];
  }
  productsConnection: {
    args: Record<QueryProductsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "productsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.ProductConnection> | prisma.ProductConnection;
  }
  variant: {
    args: Record<QueryVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "variant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant | null> | prisma.Variant | null;
  }
  variants: {
    args: Record<QueryVariantsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "variants">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant[]> | prisma.Variant[];
  }
  variantsConnection: {
    args: Record<QueryVariantsConnectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "variantsConnection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.VariantConnection> | prisma.VariantConnection;
  }
  node: {
    args: Record<QueryNodeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Query">, args: ArgsValue<GenTypes, "Query", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Node | null> | prisma.Node | null;
  }
}
  

// Types for Attribute

type AttributeObject =
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
    resolve: (root: RootValue<GenTypes, "Attribute">, args: ArgsValue<GenTypes, "Attribute", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  key: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Attribute">, args: ArgsValue<GenTypes, "Attribute", "key">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  value: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Attribute">, args: ArgsValue<GenTypes, "Attribute", "value">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  products: {
    args: Record<AttributeProductsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Attribute">, args: ArgsValue<GenTypes, "Attribute", "products">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product[]> | prisma.Product[];
  }
}
  

// Types for Product

type ProductObject =
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
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  brand: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "brand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand> | prisma.Brand;
  }
  variants: {
    args: Record<ProductVariantsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "variants">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant[]> | prisma.Variant[];
  }
  collections: {
    args: Record<ProductCollectionsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "collections">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection[]> | prisma.Collection[];
  }
  attributes: {
    args: Record<ProductAttributesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Product">, args: ArgsValue<GenTypes, "Product", "attributes">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute[]> | prisma.Attribute[];
  }
}
  

// Types for Brand

type BrandObject =
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
    resolve: (root: RootValue<GenTypes, "Brand">, args: ArgsValue<GenTypes, "Brand", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Brand">, args: ArgsValue<GenTypes, "Brand", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  products: {
    args: Record<BrandProductsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Brand">, args: ArgsValue<GenTypes, "Brand", "products">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product[]> | prisma.Product[];
  }
}
  

// Types for Variant

type VariantObject =
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
    resolve: (root: RootValue<GenTypes, "Variant">, args: ArgsValue<GenTypes, "Variant", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  optionValues: {
    args: Record<VariantOptionValuesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Variant">, args: ArgsValue<GenTypes, "Variant", "optionValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue[]> | prisma.OptionValue[];
  }
  price: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Variant">, args: ArgsValue<GenTypes, "Variant", "price">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number | null> | number | null;
  }
}
  

// Types for OptionValue

type OptionValueObject =
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
    resolve: (root: RootValue<GenTypes, "OptionValue">, args: ArgsValue<GenTypes, "OptionValue", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValue">, args: ArgsValue<GenTypes, "OptionValue", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  option: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValue">, args: ArgsValue<GenTypes, "OptionValue", "option">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option> | prisma.Option;
  }
}
  

// Types for Option

type OptionObject =
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
    resolve: (root: RootValue<GenTypes, "Option">, args: ArgsValue<GenTypes, "Option", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Option">, args: ArgsValue<GenTypes, "Option", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  values: {
    args: Record<OptionValuesArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Option">, args: ArgsValue<GenTypes, "Option", "values">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue[]> | prisma.OptionValue[];
  }
}
  

// Types for Collection

type CollectionObject =
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
    resolve: (root: RootValue<GenTypes, "Collection">, args: ArgsValue<GenTypes, "Collection", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Collection">, args: ArgsValue<GenTypes, "Collection", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  products: {
    args: Record<CollectionProductsArgs,ArgDefinition>
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "Collection">, args: ArgsValue<GenTypes, "Collection", "products">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product[]> | prisma.Product[];
  }
}
  

// Types for AttributeConnection

type AttributeConnectionObject =
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
    resolve: (root: RootValue<GenTypes, "AttributeConnection">, args: ArgsValue<GenTypes, "AttributeConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "AttributeConnection">, args: ArgsValue<GenTypes, "AttributeConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AttributeEdge[]> | prisma.AttributeEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeConnection">, args: ArgsValue<GenTypes, "AttributeConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregateAttribute> | prisma.AggregateAttribute;
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



  

interface PageInfoAlias {
  name: PageInfoFields
  alias: string
}

export interface PageInfoFieldDetails<GenTypes = GraphQLiteralGen> {
  hasNextPage: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "hasNextPage">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<boolean> | boolean;
  }
  hasPreviousPage: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "hasPreviousPage">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<boolean> | boolean;
  }
  startCursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "startCursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string | null> | string | null;
  }
  endCursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "PageInfo">, args: ArgsValue<GenTypes, "PageInfo", "endCursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string | null> | string | null;
  }
}
  

// Types for AttributeEdge

type AttributeEdgeObject =
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
    resolve: (root: RootValue<GenTypes, "AttributeEdge">, args: ArgsValue<GenTypes, "AttributeEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute> | prisma.Attribute;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeEdge">, args: ArgsValue<GenTypes, "AttributeEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregateAttribute

type AggregateAttributeObject =
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
    resolve: (root: RootValue<GenTypes, "AggregateAttribute">, args: ArgsValue<GenTypes, "AggregateAttribute", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for BrandConnection

type BrandConnectionObject =
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
    resolve: (root: RootValue<GenTypes, "BrandConnection">, args: ArgsValue<GenTypes, "BrandConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "BrandConnection">, args: ArgsValue<GenTypes, "BrandConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BrandEdge[]> | prisma.BrandEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandConnection">, args: ArgsValue<GenTypes, "BrandConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregateBrand> | prisma.AggregateBrand;
  }
}
  

// Types for BrandEdge

type BrandEdgeObject =
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
    resolve: (root: RootValue<GenTypes, "BrandEdge">, args: ArgsValue<GenTypes, "BrandEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand> | prisma.Brand;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandEdge">, args: ArgsValue<GenTypes, "BrandEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregateBrand

type AggregateBrandObject =
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
    resolve: (root: RootValue<GenTypes, "AggregateBrand">, args: ArgsValue<GenTypes, "AggregateBrand", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for CollectionConnection

type CollectionConnectionObject =
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
    resolve: (root: RootValue<GenTypes, "CollectionConnection">, args: ArgsValue<GenTypes, "CollectionConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "CollectionConnection">, args: ArgsValue<GenTypes, "CollectionConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.CollectionEdge[]> | prisma.CollectionEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionConnection">, args: ArgsValue<GenTypes, "CollectionConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregateCollection> | prisma.AggregateCollection;
  }
}
  

// Types for CollectionEdge

type CollectionEdgeObject =
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
    resolve: (root: RootValue<GenTypes, "CollectionEdge">, args: ArgsValue<GenTypes, "CollectionEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection> | prisma.Collection;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionEdge">, args: ArgsValue<GenTypes, "CollectionEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregateCollection

type AggregateCollectionObject =
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
    resolve: (root: RootValue<GenTypes, "AggregateCollection">, args: ArgsValue<GenTypes, "AggregateCollection", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for OptionConnection

type OptionConnectionObject =
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
    resolve: (root: RootValue<GenTypes, "OptionConnection">, args: ArgsValue<GenTypes, "OptionConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "OptionConnection">, args: ArgsValue<GenTypes, "OptionConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionEdge[]> | prisma.OptionEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionConnection">, args: ArgsValue<GenTypes, "OptionConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregateOption> | prisma.AggregateOption;
  }
}
  

// Types for OptionEdge

type OptionEdgeObject =
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
    resolve: (root: RootValue<GenTypes, "OptionEdge">, args: ArgsValue<GenTypes, "OptionEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option> | prisma.Option;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionEdge">, args: ArgsValue<GenTypes, "OptionEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregateOption

type AggregateOptionObject =
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
    resolve: (root: RootValue<GenTypes, "AggregateOption">, args: ArgsValue<GenTypes, "AggregateOption", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for OptionValueConnection

type OptionValueConnectionObject =
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
    resolve: (root: RootValue<GenTypes, "OptionValueConnection">, args: ArgsValue<GenTypes, "OptionValueConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "OptionValueConnection">, args: ArgsValue<GenTypes, "OptionValueConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValueEdge[]> | prisma.OptionValueEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueConnection">, args: ArgsValue<GenTypes, "OptionValueConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregateOptionValue> | prisma.AggregateOptionValue;
  }
}
  

// Types for OptionValueEdge

type OptionValueEdgeObject =
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
    resolve: (root: RootValue<GenTypes, "OptionValueEdge">, args: ArgsValue<GenTypes, "OptionValueEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue> | prisma.OptionValue;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueEdge">, args: ArgsValue<GenTypes, "OptionValueEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregateOptionValue

type AggregateOptionValueObject =
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
    resolve: (root: RootValue<GenTypes, "AggregateOptionValue">, args: ArgsValue<GenTypes, "AggregateOptionValue", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for ProductConnection

type ProductConnectionObject =
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
    resolve: (root: RootValue<GenTypes, "ProductConnection">, args: ArgsValue<GenTypes, "ProductConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "ProductConnection">, args: ArgsValue<GenTypes, "ProductConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.ProductEdge[]> | prisma.ProductEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductConnection">, args: ArgsValue<GenTypes, "ProductConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregateProduct> | prisma.AggregateProduct;
  }
}
  

// Types for ProductEdge

type ProductEdgeObject =
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
    resolve: (root: RootValue<GenTypes, "ProductEdge">, args: ArgsValue<GenTypes, "ProductEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product> | prisma.Product;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductEdge">, args: ArgsValue<GenTypes, "ProductEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregateProduct

type AggregateProductObject =
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
    resolve: (root: RootValue<GenTypes, "AggregateProduct">, args: ArgsValue<GenTypes, "AggregateProduct", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for VariantConnection

type VariantConnectionObject =
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
    resolve: (root: RootValue<GenTypes, "VariantConnection">, args: ArgsValue<GenTypes, "VariantConnection", "pageInfo">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.PageInfo> | prisma.PageInfo;
  }
  edges: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "VariantConnection">, args: ArgsValue<GenTypes, "VariantConnection", "edges">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.VariantEdge[]> | prisma.VariantEdge[];
  }
  aggregate: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantConnection">, args: ArgsValue<GenTypes, "VariantConnection", "aggregate">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AggregateVariant> | prisma.AggregateVariant;
  }
}
  

// Types for VariantEdge

type VariantEdgeObject =
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
    resolve: (root: RootValue<GenTypes, "VariantEdge">, args: ArgsValue<GenTypes, "VariantEdge", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant> | prisma.Variant;
  }
  cursor: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantEdge">, args: ArgsValue<GenTypes, "VariantEdge", "cursor">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for AggregateVariant

type AggregateVariantObject =
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
    resolve: (root: RootValue<GenTypes, "AggregateVariant">, args: ArgsValue<GenTypes, "AggregateVariant", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number> | number;
  }
}
  

// Types for Mutation

type MutationObject =
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
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createAttribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute> | prisma.Attribute;
  }
  updateAttribute: {
    args: Record<MutationUpdateAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateAttribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute | null> | prisma.Attribute | null;
  }
  updateManyAttributes: {
    args: Record<MutationUpdateManyAttributesArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyAttributes">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertAttribute: {
    args: Record<MutationUpsertAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertAttribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute> | prisma.Attribute;
  }
  deleteAttribute: {
    args: Record<MutationDeleteAttributeArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteAttribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute | null> | prisma.Attribute | null;
  }
  deleteManyAttributes: {
    args: Record<MutationDeleteManyAttributesArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyAttributes">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  createBrand: {
    args: Record<MutationCreateBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createBrand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand> | prisma.Brand;
  }
  updateBrand: {
    args: Record<MutationUpdateBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateBrand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand | null> | prisma.Brand | null;
  }
  updateManyBrands: {
    args: Record<MutationUpdateManyBrandsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyBrands">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertBrand: {
    args: Record<MutationUpsertBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertBrand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand> | prisma.Brand;
  }
  deleteBrand: {
    args: Record<MutationDeleteBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteBrand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand | null> | prisma.Brand | null;
  }
  deleteManyBrands: {
    args: Record<MutationDeleteManyBrandsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyBrands">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  createCollection: {
    args: Record<MutationCreateCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createCollection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection> | prisma.Collection;
  }
  updateCollection: {
    args: Record<MutationUpdateCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateCollection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection | null> | prisma.Collection | null;
  }
  updateManyCollections: {
    args: Record<MutationUpdateManyCollectionsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyCollections">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertCollection: {
    args: Record<MutationUpsertCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertCollection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection> | prisma.Collection;
  }
  deleteCollection: {
    args: Record<MutationDeleteCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteCollection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection | null> | prisma.Collection | null;
  }
  deleteManyCollections: {
    args: Record<MutationDeleteManyCollectionsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyCollections">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  createOption: {
    args: Record<MutationCreateOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createOption">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option> | prisma.Option;
  }
  updateOption: {
    args: Record<MutationUpdateOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateOption">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option | null> | prisma.Option | null;
  }
  updateManyOptions: {
    args: Record<MutationUpdateManyOptionsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyOptions">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertOption: {
    args: Record<MutationUpsertOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertOption">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option> | prisma.Option;
  }
  deleteOption: {
    args: Record<MutationDeleteOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteOption">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option | null> | prisma.Option | null;
  }
  deleteManyOptions: {
    args: Record<MutationDeleteManyOptionsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyOptions">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  createOptionValue: {
    args: Record<MutationCreateOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createOptionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue> | prisma.OptionValue;
  }
  updateOptionValue: {
    args: Record<MutationUpdateOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateOptionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue | null> | prisma.OptionValue | null;
  }
  updateManyOptionValues: {
    args: Record<MutationUpdateManyOptionValuesArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyOptionValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertOptionValue: {
    args: Record<MutationUpsertOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertOptionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue> | prisma.OptionValue;
  }
  deleteOptionValue: {
    args: Record<MutationDeleteOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteOptionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue | null> | prisma.OptionValue | null;
  }
  deleteManyOptionValues: {
    args: Record<MutationDeleteManyOptionValuesArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyOptionValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  createProduct: {
    args: Record<MutationCreateProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createProduct">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product> | prisma.Product;
  }
  updateProduct: {
    args: Record<MutationUpdateProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateProduct">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product | null> | prisma.Product | null;
  }
  updateManyProducts: {
    args: Record<MutationUpdateManyProductsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyProducts">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertProduct: {
    args: Record<MutationUpsertProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertProduct">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product> | prisma.Product;
  }
  deleteProduct: {
    args: Record<MutationDeleteProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteProduct">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product | null> | prisma.Product | null;
  }
  deleteManyProducts: {
    args: Record<MutationDeleteManyProductsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyProducts">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  createVariant: {
    args: Record<MutationCreateVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "createVariant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant> | prisma.Variant;
  }
  updateVariant: {
    args: Record<MutationUpdateVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateVariant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant | null> | prisma.Variant | null;
  }
  updateManyVariants: {
    args: Record<MutationUpdateManyVariantsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "updateManyVariants">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
  upsertVariant: {
    args: Record<MutationUpsertVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "upsertVariant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant> | prisma.Variant;
  }
  deleteVariant: {
    args: Record<MutationDeleteVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteVariant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant | null> | prisma.Variant | null;
  }
  deleteManyVariants: {
    args: Record<MutationDeleteManyVariantsArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Mutation">, args: ArgsValue<GenTypes, "Mutation", "deleteManyVariants">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BatchPayload> | prisma.BatchPayload;
  }
}
  

// Types for BatchPayload

type BatchPayloadObject =
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
    resolve: (root: RootValue<GenTypes, "BatchPayload">, args: ArgsValue<GenTypes, "BatchPayload", "count">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<undefined> | undefined;
  }
}
  

// Types for Subscription

type SubscriptionObject =
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
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "attribute">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AttributeSubscriptionPayload | null> | prisma.AttributeSubscriptionPayload | null;
  }
  brand: {
    args: Record<SubscriptionBrandArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "brand">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BrandSubscriptionPayload | null> | prisma.BrandSubscriptionPayload | null;
  }
  collection: {
    args: Record<SubscriptionCollectionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "collection">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.CollectionSubscriptionPayload | null> | prisma.CollectionSubscriptionPayload | null;
  }
  option: {
    args: Record<SubscriptionOptionArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "option">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionSubscriptionPayload | null> | prisma.OptionSubscriptionPayload | null;
  }
  optionValue: {
    args: Record<SubscriptionOptionValueArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "optionValue">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValueSubscriptionPayload | null> | prisma.OptionValueSubscriptionPayload | null;
  }
  product: {
    args: Record<SubscriptionProductArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "product">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.ProductSubscriptionPayload | null> | prisma.ProductSubscriptionPayload | null;
  }
  variant: {
    args: Record<SubscriptionVariantArgs,ArgDefinition>
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "Subscription">, args: ArgsValue<GenTypes, "Subscription", "variant">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.VariantSubscriptionPayload | null> | prisma.VariantSubscriptionPayload | null;
  }
}
  

// Types for AttributeSubscriptionPayload

type AttributeSubscriptionPayloadObject =
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
    resolve: (root: RootValue<GenTypes, "AttributeSubscriptionPayload">, args: ArgsValue<GenTypes, "AttributeSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeSubscriptionPayload">, args: ArgsValue<GenTypes, "AttributeSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Attribute | null> | prisma.Attribute | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "AttributeSubscriptionPayload">, args: ArgsValue<GenTypes, "AttributeSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributeSubscriptionPayload">, args: ArgsValue<GenTypes, "AttributeSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.AttributePreviousValues | null> | prisma.AttributePreviousValues | null;
  }
}
  

// Types for AttributePreviousValues

type AttributePreviousValuesObject =
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
    resolve: (root: RootValue<GenTypes, "AttributePreviousValues">, args: ArgsValue<GenTypes, "AttributePreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  key: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributePreviousValues">, args: ArgsValue<GenTypes, "AttributePreviousValues", "key">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  value: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "AttributePreviousValues">, args: ArgsValue<GenTypes, "AttributePreviousValues", "value">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for BrandSubscriptionPayload

type BrandSubscriptionPayloadObject =
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
    resolve: (root: RootValue<GenTypes, "BrandSubscriptionPayload">, args: ArgsValue<GenTypes, "BrandSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandSubscriptionPayload">, args: ArgsValue<GenTypes, "BrandSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Brand | null> | prisma.Brand | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "BrandSubscriptionPayload">, args: ArgsValue<GenTypes, "BrandSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandSubscriptionPayload">, args: ArgsValue<GenTypes, "BrandSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.BrandPreviousValues | null> | prisma.BrandPreviousValues | null;
  }
}
  

// Types for BrandPreviousValues

type BrandPreviousValuesObject =
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
    resolve: (root: RootValue<GenTypes, "BrandPreviousValues">, args: ArgsValue<GenTypes, "BrandPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "BrandPreviousValues">, args: ArgsValue<GenTypes, "BrandPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for CollectionSubscriptionPayload

type CollectionSubscriptionPayloadObject =
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
    resolve: (root: RootValue<GenTypes, "CollectionSubscriptionPayload">, args: ArgsValue<GenTypes, "CollectionSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionSubscriptionPayload">, args: ArgsValue<GenTypes, "CollectionSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Collection | null> | prisma.Collection | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "CollectionSubscriptionPayload">, args: ArgsValue<GenTypes, "CollectionSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionSubscriptionPayload">, args: ArgsValue<GenTypes, "CollectionSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.CollectionPreviousValues | null> | prisma.CollectionPreviousValues | null;
  }
}
  

// Types for CollectionPreviousValues

type CollectionPreviousValuesObject =
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
    resolve: (root: RootValue<GenTypes, "CollectionPreviousValues">, args: ArgsValue<GenTypes, "CollectionPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "CollectionPreviousValues">, args: ArgsValue<GenTypes, "CollectionPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for OptionSubscriptionPayload

type OptionSubscriptionPayloadObject =
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
    resolve: (root: RootValue<GenTypes, "OptionSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Option | null> | prisma.Option | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "OptionSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionPreviousValues | null> | prisma.OptionPreviousValues | null;
  }
}
  

// Types for OptionPreviousValues

type OptionPreviousValuesObject =
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
    resolve: (root: RootValue<GenTypes, "OptionPreviousValues">, args: ArgsValue<GenTypes, "OptionPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionPreviousValues">, args: ArgsValue<GenTypes, "OptionPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for OptionValueSubscriptionPayload

type OptionValueSubscriptionPayloadObject =
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
    resolve: (root: RootValue<GenTypes, "OptionValueSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionValueSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionValueSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValue | null> | prisma.OptionValue | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "OptionValueSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionValueSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValueSubscriptionPayload">, args: ArgsValue<GenTypes, "OptionValueSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.OptionValuePreviousValues | null> | prisma.OptionValuePreviousValues | null;
  }
}
  

// Types for OptionValuePreviousValues

type OptionValuePreviousValuesObject =
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
    resolve: (root: RootValue<GenTypes, "OptionValuePreviousValues">, args: ArgsValue<GenTypes, "OptionValuePreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "OptionValuePreviousValues">, args: ArgsValue<GenTypes, "OptionValuePreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for ProductSubscriptionPayload

type ProductSubscriptionPayloadObject =
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
    resolve: (root: RootValue<GenTypes, "ProductSubscriptionPayload">, args: ArgsValue<GenTypes, "ProductSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductSubscriptionPayload">, args: ArgsValue<GenTypes, "ProductSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Product | null> | prisma.Product | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "ProductSubscriptionPayload">, args: ArgsValue<GenTypes, "ProductSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductSubscriptionPayload">, args: ArgsValue<GenTypes, "ProductSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.ProductPreviousValues | null> | prisma.ProductPreviousValues | null;
  }
}
  

// Types for ProductPreviousValues

type ProductPreviousValuesObject =
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
    resolve: (root: RootValue<GenTypes, "ProductPreviousValues">, args: ArgsValue<GenTypes, "ProductPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  name: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "ProductPreviousValues">, args: ArgsValue<GenTypes, "ProductPreviousValues", "name">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
}
  

// Types for VariantSubscriptionPayload

type VariantSubscriptionPayloadObject =
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
    resolve: (root: RootValue<GenTypes, "VariantSubscriptionPayload">, args: ArgsValue<GenTypes, "VariantSubscriptionPayload", "mutation">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.MutationType> | prisma.MutationType;
  }
  node: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantSubscriptionPayload">, args: ArgsValue<GenTypes, "VariantSubscriptionPayload", "node">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.Variant | null> | prisma.Variant | null;
  }
  updatedFields: {
    args: {}
    description: string
    list: true
    resolve: (root: RootValue<GenTypes, "VariantSubscriptionPayload">, args: ArgsValue<GenTypes, "VariantSubscriptionPayload", "updatedFields">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string[]> | string[];
  }
  previousValues: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantSubscriptionPayload">, args: ArgsValue<GenTypes, "VariantSubscriptionPayload", "previousValues">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<prisma.VariantPreviousValues | null> | prisma.VariantPreviousValues | null;
  }
}
  

// Types for VariantPreviousValues

type VariantPreviousValuesObject =
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
    resolve: (root: RootValue<GenTypes, "VariantPreviousValues">, args: ArgsValue<GenTypes, "VariantPreviousValues", "id">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<string> | string;
  }
  price: {
    args: {}
    description: string
    list: false
    resolve: (root: RootValue<GenTypes, "VariantPreviousValues">, args: ArgsValue<GenTypes, "VariantPreviousValues", "price">, context: ContextValue<GenTypes>, info?: GraphQLResolveInfo) => Promise<number | null> | number | null;
  }
}
  


export interface PluginTypes {
  fields: {
    Query: QueryObject
    Attribute: AttributeObject
    Product: ProductObject
    Brand: BrandObject
    Variant: VariantObject
    OptionValue: OptionValueObject
    Option: OptionObject
    Collection: CollectionObject
    AttributeConnection: AttributeConnectionObject
    PageInfo: PageInfoObject
    AttributeEdge: AttributeEdgeObject
    AggregateAttribute: AggregateAttributeObject
    BrandConnection: BrandConnectionObject
    BrandEdge: BrandEdgeObject
    AggregateBrand: AggregateBrandObject
    CollectionConnection: CollectionConnectionObject
    CollectionEdge: CollectionEdgeObject
    AggregateCollection: AggregateCollectionObject
    OptionConnection: OptionConnectionObject
    OptionEdge: OptionEdgeObject
    AggregateOption: AggregateOptionObject
    OptionValueConnection: OptionValueConnectionObject
    OptionValueEdge: OptionValueEdgeObject
    AggregateOptionValue: AggregateOptionValueObject
    ProductConnection: ProductConnectionObject
    ProductEdge: ProductEdgeObject
    AggregateProduct: AggregateProductObject
    VariantConnection: VariantConnectionObject
    VariantEdge: VariantEdgeObject
    AggregateVariant: AggregateVariantObject
    Mutation: MutationObject
    BatchPayload: BatchPayloadObject
    Subscription: SubscriptionObject
    AttributeSubscriptionPayload: AttributeSubscriptionPayloadObject
    AttributePreviousValues: AttributePreviousValuesObject
    BrandSubscriptionPayload: BrandSubscriptionPayloadObject
    BrandPreviousValues: BrandPreviousValuesObject
    CollectionSubscriptionPayload: CollectionSubscriptionPayloadObject
    CollectionPreviousValues: CollectionPreviousValuesObject
    OptionSubscriptionPayload: OptionSubscriptionPayloadObject
    OptionPreviousValues: OptionPreviousValuesObject
    OptionValueSubscriptionPayload: OptionValueSubscriptionPayloadObject
    OptionValuePreviousValues: OptionValuePreviousValuesObject
    ProductSubscriptionPayload: ProductSubscriptionPayloadObject
    ProductPreviousValues: ProductPreviousValuesObject
    VariantSubscriptionPayload: VariantSubscriptionPayloadObject
    VariantPreviousValues: VariantPreviousValuesObject
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
  
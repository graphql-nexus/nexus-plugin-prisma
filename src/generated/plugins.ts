// GENERATED TYPES FOR PLUGIN. /!\ DO NOT EDIT MANUALLY

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
}

// declare global {
//   interface GraphQLiteralGen extends PluginTypes {}
// }
  
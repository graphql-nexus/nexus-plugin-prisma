import { ArgDefinition } from 'gqliteral/dist/types'

interface GenTypesShape {
  fields: Record<string, any>
  aliases: Record<string, any>
  objects: Record<string, any>
}

export interface ObjectField {
  name: string
  args?: string[] | false
  alias?: string
}

export type AnonymousField = string | ObjectField

export interface AnonymousAliasField {
  name: string
  alias: string
}

export interface AnonymousPickOmitField {
  pick?: AnonymousField[]
  omit?: AnonymousField[]
}

export interface AnonymousAliases {
  aliases: AnonymousAliasField[]
}

export type AnonymousInputFields =
  | AnonymousField[]
  | AnonymousAliases
  | AnonymousPickOmitField

export interface AnonymousFieldDetail {
  prismaFieldName: string
  args: Record<string, ArgDefinition>
  description?: string
  list: boolean
  resolve: (root: any, args: any, ctx: any, info?: any) => any
}

export type AnonymousFieldDetails = Record<string, AnonymousFieldDetail>

export type InputField<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['fields']
    ? GenTypes['fields'][TypeName]
    : AnonymousField
  : AnonymousField

export type AliasField<
  GenTypes = GraphQLiteralGen,
  TypeName extends string = any
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['aliases']
    ? GenTypes['aliases'][TypeName]
    : AnonymousAliasField
  : AnonymousAliasField

export type PrismaTypeNames<
  GenTypes = GraphQLiteralGen
> = GenTypes extends GenTypesShape
  ? Extract<keyof GenTypes['fields'], string>
  : string

export interface AliasesField<GenTypes, TypeName extends string> {
  aliases: AliasField<GenTypes, TypeName>[]
}

export interface PickOmitField<GenTypes, TypeName extends string> {
  omit?: InputField<GenTypes, TypeName>[]
  pick?: InputField<GenTypes, TypeName>[]
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
type XOR<T, U> = (T | U) extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U

export type AddFieldInput<GenTypes, TypeName extends string> =
  | InputField<GenTypes, TypeName>[]
  | XOR<PickOmitField<GenTypes, TypeName>, AliasesField<GenTypes, TypeName>>

export type PrismaObject<
  GenTypes,
  TypeName extends string
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['objects']
    ? GenTypes['objects'][TypeName]
    : any
  : any

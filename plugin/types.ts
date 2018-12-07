import { ArgDefinition } from 'gqliteral/dist/types'

interface GenTypesShape {
  fields: Record<string, any>
  fieldsDetails: Record<string, any>
}

export interface ObjectField {
  name: string
  args?: string[] | false
  alias?: string
}

export type AnonymousField = string | ObjectField

export interface AnonymousPickOmitField {
  pick?: AnonymousField[]
  omit?: AnonymousField[]
}

export type AnonymousInputFields = AnonymousField[] | AnonymousPickOmitField

export interface AnonymousFieldDetail {
  // Internal field to properly resolve aliased field
  $prismaFieldName: string
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

export type PrismaTypeNames<
  GenTypes = GraphQLiteralGen
> = GenTypes extends GenTypesShape
  ? Extract<keyof GenTypes['fields'], string>
  : string

export interface PickOmitField<GenTypes, TypeName extends string> {
  omit?: InputField<GenTypes, TypeName>[]
  pick?: InputField<GenTypes, TypeName>[]
}

export type AddFieldInput<GenTypes, TypeName extends string> =
  | InputField<GenTypes, TypeName>[]
  | PickOmitField<GenTypes, TypeName>

export type PrismaObject<
  GenTypes,
  TypeName extends string
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['fieldsDetails']
    ? GenTypes['fieldsDetails'][TypeName]
    : any
  : any

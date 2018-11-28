interface GenTypesShape {
  fields: Record<string, any>
  alias: Record<string, any>
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

// addPrismaFields('id', { name: "fsfdlksjfsf" })

export type InputField<
  GenTypes = GQLiteralGen,
  TypeName extends string = any
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['fields']
    ? GenTypes['fields'][TypeName]
    : AnonymousField
  : AnonymousField

export type AliasField<
  GenTypes = GQLiteralGen,
  TypeName extends string = any
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['alias']
    ? GenTypes['alias'][TypeName]
    : AnonymousAliasField
  : AnonymousAliasField

interface AliasesField<GenTypes, TypeName extends string> {
  aliases: AliasField<GenTypes, TypeName>[]
}

interface PickOmitField<GenTypes, TypeName extends string> {
  omit?: InputField<GenTypes, TypeName>[]
  pick?: InputField<GenTypes, TypeName>[]
}

export type AddFieldInput<GenTypes, TypeName extends string> =
  | InputField<GenTypes, TypeName>[]
  | AliasesField<GenTypes, TypeName>
  | PickOmitField<GenTypes, TypeName>

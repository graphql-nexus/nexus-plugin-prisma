interface GenTypesShape {
  fields: Record<string, any>
}

export interface ObjectField {
  name: string
  args?: string[] | false
  alias?: string
}

export type AnonymousField = string | ObjectField

// addPrismaFields('id', { name: "fsfdlksjfsf" })

export type InputField<
  GenTypes = GQLiteralGen,
  TypeName extends string = any
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['fields']
    ? GenTypes['fields'][TypeName]
    : AnonymousField
  : AnonymousField

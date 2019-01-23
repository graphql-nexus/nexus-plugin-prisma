import { core } from 'nexus'

interface GenTypesShape {
  fields: Record<string, any>
  fieldsDetails: Record<string, any>
  enumTypesNames: string
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

export interface PrismaOutputOpts {
  args: Record<string, core.Types.ArgDefinition>
  description?: string
  list: boolean
  nullable: boolean
  resolve: (root: any, args: any, ctx: any, info?: any) => any
}

export type PrismaOutputOptsMap = Record<string, PrismaOutputOpts>

export type InputField<
  GenTypes = GraphQLNexusGen,
  TypeName extends string = any
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['fields']
    ? GenTypes['fields'][TypeName]
    : AnonymousField
  : AnonymousField

export type PrismaTypeNames<
  GenTypes = GraphQLNexusGen
> = GenTypes extends GenTypesShape
  ? Extract<keyof GenTypes['fields'], string>
  : string

export type PrismaEnumTypeNames<
  GenTypes = GraphQLNexusGen
> = GenTypes extends GenTypesShape ? GenTypes['enumTypesNames'] : string

export interface PickInputField<GenTypes, TypeName extends string> {
  pick: InputField<GenTypes, TypeName>[]
}

export interface FilterInputField<GenTypes, TypeName extends string> {
  filter: ((fields: string[]) => string[]) | InputField<GenTypes, TypeName>[]
}

export type AddFieldInput<GenTypes, TypeName extends string> =
  | InputField<GenTypes, TypeName>[]
  | PickInputField<GenTypes, TypeName>
  | FilterInputField<GenTypes, TypeName>

export type PrismaObject<
  GenTypes,
  TypeName extends string
> = GenTypes extends GenTypesShape
  ? TypeName extends keyof GenTypes['fieldsDetails']
    ? GenTypes['fieldsDetails'][TypeName]
    : any
  : any

export interface PrismaSchemaConfig extends core.Types.BuilderConfig {
  types: any
  prisma: {
    schemaPath: string
    contextClientName: string
  }
}

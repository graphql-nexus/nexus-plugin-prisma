declare global {
  interface NexusPrismaGen {}
}

export type PrismaShapeKeys = 'objectTypes' | 'inputTypes' | 'enumTypes'

export interface PrismaGenTypesShape {
  objectTypes: {
    fields: Record<string, any>
    fieldsDetails: Record<string, any>
  }
  inputTypes: {
    fields: Record<string, any>
  }
  enumTypes: Record<string, any>
}

export type GetGen<
  K extends PrismaShapeKeys,
  Fallback = any
> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends PrismaGenTypesShape
    ? GenTypes[K]
    : Fallback
  : Fallback

export type GetGen2<
  K extends PrismaShapeKeys,
  K2 extends keyof PrismaGenTypesShape[K]
> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends PrismaGenTypesShape
    ? K extends keyof GenTypes
      ? K2 extends keyof GenTypes[K]
        ? GenTypes[K][K2]
        : any
      : any
    : any
  : any

export type GetGen3<
  K extends PrismaShapeKeys,
  K2 extends Extract<keyof PrismaGenTypesShape[K], string>,
  K3 extends Extract<keyof PrismaGenTypesShape[K][K2], string>
> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends PrismaGenTypesShape
    ? K extends keyof GenTypes
      ? K2 extends keyof GenTypes[K]
        ? K3 extends keyof GenTypes[K][K2]
          ? GenTypes[K][K2][K3]
          : any
        : any
      : any
    : any
  : any

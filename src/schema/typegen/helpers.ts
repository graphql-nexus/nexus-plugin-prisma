declare global {
  interface NexusPrismaGen {}
}

/**
 * Generated type helpers:
 */
export type GenTypesShapeKeys = 'inputs' | 'outputs' | 'methods' | 'pagination' | 'scalars' | 'models'

/**
 * Helpers for handling the generated schema
 */
export type GenTypesShape = Record<GenTypesShapeKeys, any>

export type GetGen<K extends GenTypesShapeKeys, Fallback = any> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends GenTypesShape
    ? GenTypes[K]
    : Fallback
  : Fallback

export type GetGen2<
  K extends GenTypesShapeKeys,
  K2 extends keyof GenTypesShape[K]
> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends GenTypesShape
    ? K extends keyof GenTypes
      ? K2 extends keyof GenTypes[K]
        ? GenTypes[K][K2]
        : any
      : any
    : any
  : any

export type GetGen3<
  K extends GenTypesShapeKeys,
  K2 extends keyof GenTypesShape[K],
  K3 extends keyof GenTypesShape[K][K2],
  Fallback = any
> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends GenTypesShape
    ? K extends keyof GenTypes
      ? K2 extends keyof GenTypes[K]
        ? K3 extends keyof GenTypes[K][K2]
          ? GenTypes[K][K2][K3]
          : Fallback
        : any
      : any
    : any
  : any

export type HasGen<K extends GenTypesShapeKeys> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends GenTypesShape
    ? K extends keyof GenTypes
      ? true
      : false
    : false
  : false

export type HasGen2<
  K extends GenTypesShapeKeys,
  K2 extends Extract<keyof GenTypesShape[K], string>
> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends GenTypesShape
    ? K extends keyof GenTypes
      ? K2 extends keyof GenTypes[K]
        ? true
        : false
      : false
    : false
  : false

export type HasGen3<
  K extends GenTypesShapeKeys,
  K2 extends Extract<keyof GenTypesShape[K], string>,
  K3 extends Extract<keyof GenTypesShape[K][K2], string>
> = NexusPrismaGen extends infer GenTypes
  ? GenTypes extends GenTypesShape
    ? K extends keyof GenTypes
      ? K2 extends keyof GenTypes[K]
        ? K3 extends keyof GenTypes[K][K2]
          ? true
          : false
        : false
      : false
    : false
  : false

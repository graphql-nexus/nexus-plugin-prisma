import { Option } from '../generated/prisma-client'

export const fragment = `fragment ProductVariant on Product {
  variants {
    optionValues {
      option { id name }
    }
  }
}`

export interface Type {
  variants: {
    optionValues: { option: Option }[]
  }[]
}

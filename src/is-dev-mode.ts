export function isDevMode() {
  return Boolean(
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
  )
}
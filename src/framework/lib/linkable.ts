import * as Path from 'path'

/**
 * A wrapper around require. It does nothing special except when LINK env var is
 * set in which case it prefixes the import path with CWD. This is essential
 * when dealing with plugin or plugin-like situations.
 *
 * In prisma case, Prisma Client is generated into user's project and required by other packages in
 * user's prject. Problem is when those "other packages" are LINKED, then their
 * attempts to import fail because they are looking relative to their location
 * on disk, not hte user's project, where they just LINKED into.
 */
export function linkableRequire(id: string): any {
  if (process.env.LINK) {
    return require(Path.join(process.cwd(), 'node_modules', id))
  } else {
    return require(id)
  }
}

export function linkableResolve(id: string): any {
  if (process.env.LINK) {
    return require.resolve(Path.join(process.cwd(), 'node_modules', id))
  } else {
    return require.resolve(id)
  }
}

export function linkableProjectDir(): string {
  if (process.env.LINK) {
    return process.cwd()
  } else {
    // lib/src/nexus-plugin-prisma/node_modules
    return Path.join(__dirname, '..', '..', '..', '..')
  }
}

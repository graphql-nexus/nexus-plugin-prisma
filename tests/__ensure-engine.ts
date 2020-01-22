import { download } from '@prisma/fetch-engine'
import path from 'path'
import fs from 'fs'

const runtimeDir = path.join(__dirname, '../node_modules/@prisma/client')

if (fs.existsSync(runtimeDir)) {
  download({
    binaries: {
      'query-engine': runtimeDir,
    },
    showProgress: true,
  })
}

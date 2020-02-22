import { download } from '@prisma/fetch-engine'
import fs from 'fs'
import path from 'path'
const manifest = require('../package.json')

const runtimeDir = path.join(__dirname, '../node_modules/@prisma/client')

if (fs.existsSync(runtimeDir)) {
  download({
    binaries: {
      'query-engine': runtimeDir,
    },
    version: manifest.prisma.version,
    showProgress: true,
  })
}

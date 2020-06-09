/**
 * This script is a temp fix, hack.
 * https://github.com/graphql-nexus/nexus-schema-plugin-prisma/pull/700.
 */
import * as fs from 'fs-jetpack'

let contents
let path

path = 'dist/dmmf/utils.d.ts'
contents = fs.read(path)

if (!contents) throw new Error(`No such path: ${path}`)

contents = contents.replace('/// <reference types="react" />\n', '')
fs.write(path, contents)

import * as fs from 'fs-jetpack'

let contents
let path

path = 'dist/dmmf/utils.d.ts'
contents = fs.read(path)

if (!contents) throw new Error(`No such path: ${path}`)

contents = contents.replace('/// <reference types="react" />\n', '')
fs.write(path, contents)

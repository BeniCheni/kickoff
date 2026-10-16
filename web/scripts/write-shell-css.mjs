import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import tailwind from '@tailwindcss/postcss'

const webRoot = fileURLToPath(new URL('..', import.meta.url))
const from = path.join(webRoot, 'app/globals.css')
const css = readFileSync(from, 'utf8')
const result = await postcss([tailwind()]).process(css, { from })
const outDir = path.join(webRoot, 'generated')
mkdirSync(outDir, { recursive: true })
writeFileSync(path.join(outDir, 'shell.css'), result.css)
console.log(`shell css ${result.css.length} bytes`)

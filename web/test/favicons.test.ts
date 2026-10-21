import { lstatSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

// Vercel builds from web/ and cannot copy a symbolic link that points out of it
// ("Cannot copy '../../public/favicon-192.png' to a subdirectory of itself").
// web/public holds real copies of the reader's favicons, and these checks fail
// if a link comes back or a copy drifts from the file it came from.
const copies: Array<[copy: string, source: string]> = [
  ['favicon-32.png', 'favicon-32.png'],
  ['favicon-64.png', 'favicon-64.png'],
  ['favicon-192.png', 'favicon-192.png'],
  ['favicon.ico', 'favicon-32.png'],
]

const webPublic = (name: string) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))
const rootPublic = (name: string) => fileURLToPath(new URL(`../../public/${name}`, import.meta.url))

test.each(copies)('web/public/%s is a regular file, not a link', copy => {
  const stat = lstatSync(webPublic(copy))
  expect(stat.isSymbolicLink()).toBe(false)
  expect(stat.isFile()).toBe(true)
})

test.each(copies)('web/public/%s has the same bytes as public/%s', (copy, source) => {
  expect(readFileSync(webPublic(copy)).equals(readFileSync(rootPublic(source)))).toBe(true)
})

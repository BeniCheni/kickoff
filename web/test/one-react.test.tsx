import { renderToStaticMarkup } from 'react-dom/server'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { LensSwitcher } from '../../src/components/LensSwitcher'
import { assertOneClientReact } from '../scripts/react-copies.mjs'

const require = createRequire(import.meta.url)
const webRoot = fileURLToPath(new URL('..', import.meta.url))

test('web and a ../src importer share one React 19.2.8', () => {
  const react = require(path.join(webRoot, 'node_modules/react/package.json')) as { version: string }
  const reactDom = require(path.join(webRoot, 'node_modules/react-dom/package.json')) as { version: string }
  expect(react.version).toBe('19.2.8')
  expect(reactDom.version).toBe('19.2.8')
  // A second React throws "Invalid hook call" here: LensSwitcher calls useRef
  // on the copy it imported, and renderToStaticMarkup renders with this one.
  const html = renderToStaticMarkup(<LensSwitcher lens="poster" onSelect={() => {}} />)
  expect(html).toContain('Poster')
  expect(html).toContain('aria-checked="true"')
})

test('the client checker fails on a second React and passes on one', () => {
  const one = [{ text: 'r.version="19.2.8";r.version="19.2.8"' }]
  const two = [{ text: 'r.version="19.2.8"' }, { text: 'r.version="19.3.0-canary-278794d7-20261002"' }]
  expect(assertOneClientReact(one)).toBe('19.2.8')
  expect(() => assertOneClientReact(two)).toThrow(/19\.2\.8, 19\.3\.0-canary/)
  expect(() => assertOneClientReact([{ text: 'no react here' }])).toThrow(/\(none\)/)
})

import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import * as ReactDOMServer from 'react-dom/server'
import * as JsxRuntime from 'react/jsx-runtime'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { LensSwitcher } from '../../src/components/LensSwitcher'
import { compiledReactVersion } from '../react-resolution.mjs'
import { assertOneClientReact } from '../scripts/react-copies.mjs'

const require = createRequire(import.meta.url)
const webRoot = fileURLToPath(new URL('..', import.meta.url))

test('the installed pin stays 19.2.8', () => {
  const react = require(path.join(webRoot, 'node_modules/react/package.json')) as { version: string }
  const reactDom = require(path.join(webRoot, 'node_modules/react-dom/package.json')) as { version: string }
  expect(react.version).toBe('19.2.8')
  expect(reactDom.version).toBe('19.2.8')
})

test('web tests run Next\'s compiled React, and a second copy fails', () => {
  // The five entries this package's tests resolve. jsx-runtime has no version
  // export; rendering through it is the proof it is the same copy.
  expect(React.version).toBe(compiledReactVersion)
  expect(ReactDOM.version).toBe(compiledReactVersion)
  expect((ReactDOMClient as { version?: string }).version).toBe(compiledReactVersion)
  expect(ReactDOMServer.version).toBe(compiledReactVersion)

  const closedOver = require('next/dist/compiled/react') as { useState: typeof React.useState, version: string }
  expect(closedOver.version).toBe(compiledReactVersion)
  // Fails when this file's `react` is a different copy from the one react-dom
  // and the jsx runtime closed over, even if that copy prints the same version.
  expect(React.useState).toBe(closedOver.useState)
  expect(loadedRuntimeVersions()).toEqual([compiledReactVersion])

  function Probe() {
    const [value] = React.useState('one')
    return JsxRuntime.jsx('span', { children: value })
  }
  expect(ReactDOMServer.renderToStaticMarkup(JsxRuntime.jsx(Probe, {}))).toBe('<span>one</span>')

  const installed = require(path.join(webRoot, 'node_modules/react/index.js')) as {
    useState: typeof React.useState
    version: string
  }
  expect(installed.version).toBe('19.2.8')
  expect(installed.useState).not.toBe(React.useState)
  function Second() {
    installed.useState(0)
    return null
  }
  expect(() => ReactDOMServer.renderToStaticMarkup(JsxRuntime.jsx(Second, {}))).toThrow(/Invalid hook call|reading 'useState'/)

  // A second React throws here too: LensSwitcher calls useRef on the copy it
  // imported, and renderToStaticMarkup renders with this file's copy.
  const html = ReactDOMServer.renderToStaticMarkup(<LensSwitcher lens="poster" onSelect={() => {}} />)
  expect(html).toContain('Poster')
  expect(html).toContain('aria-checked="true"')
})

function loadedRuntimeVersions() {
  const versions = new Set<string>()
  for (const mod of Object.values(require.cache)) {
    const exp = mod?.exports as { version?: unknown, useState?: unknown, renderToStaticMarkup?: unknown, createRoot?: unknown } | undefined
    if (!exp || typeof exp.version !== 'string') continue
    const runtime = typeof exp.useState === 'function' || typeof exp.renderToStaticMarkup === 'function' || typeof exp.createRoot === 'function'
    if (runtime) versions.add(exp.version)
  }
  return [...versions]
}

test('the client checker fails on a second React and passes on one', () => {
  const one = [{ text: 'r.version="19.2.8";r.version="19.2.8"' }]
  const two = [{ text: 'r.version="19.2.8"' }, { text: 'r.version="19.3.0-canary-278794d7-20261002"' }]
  expect(assertOneClientReact(one)).toBe('19.2.8')
  expect(() => assertOneClientReact(two)).toThrow(/19\.2\.8, 19\.3\.0-canary/)
  expect(() => assertOneClientReact([{ text: 'no react here' }])).toThrow(/\(none\)/)
})

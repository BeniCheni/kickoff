import { describe, expect, it } from 'vitest'
import { unexpectedHost } from '../scripts/rendered-contrast.mjs'

const page = 'http://127.0.0.1:5173/?tab=fixtures'
const file = 'file:///tmp/dist-offline/index.html'

describe('cold-load hosts', () => {
  it('allows this page and names every other host, including a font host', () => {
    expect(unexpectedHost('http://127.0.0.1:5173/assets/index.js', page)).toBeNull()
    expect(unexpectedHost('https://fonts.googleapis.com/css2?family=Inter', page)).toBe('https://fonts.googleapis.com/css2?family=Inter')
    expect(unexpectedHost('https://fonts.gstatic.com/s/inter.woff2', page)).toBe('https://fonts.gstatic.com/s/inter.woff2')
    expect(unexpectedHost('https://escape.invalid/photograph.jpg', page)).toBe('https://escape.invalid/photograph.jpg')
    expect(unexpectedHost('wss://127.0.0.1:5175/', 'http://127.0.0.1:5175/tests/harness/states.html')).toBeNull()
    expect(unexpectedHost('wss://escape.invalid/socket', page)).toBe('wss://escape.invalid/socket')
    expect(unexpectedHost('data:image/svg+xml,x', page)).toBeNull()
    expect(unexpectedHost('https://fonts.googleapis.com/css', file, { offline: true })).toBe('https://fonts.googleapis.com/css')
    expect(unexpectedHost('https://fonts.gstatic.com/s/inter.woff2', file, { offline: true })).toBe('https://fonts.gstatic.com/s/inter.woff2')
    expect(unexpectedHost('https://escape.invalid/photograph.jpg', file, { offline: true })).toBe('https://escape.invalid/photograph.jpg')
    expect(unexpectedHost('http://127.0.0.1:5173/', file, { offline: true })).toBe('http://127.0.0.1:5173/')
  })
})

import { describe, expect, it } from 'vitest'
import { unexpectedHost } from '../scripts/rendered-contrast.mjs'

const page = 'http://127.0.0.1:5173/?tab=fixtures'
const file = 'file:///tmp/dist-offline/index.html'

describe('cold-load hosts', () => {
  it('allows this page and the two font hosts, and names any other', () => {
    expect(unexpectedHost('http://127.0.0.1:5173/assets/index.js', page)).toBeNull()
    expect(unexpectedHost('https://fonts.googleapis.com/css2?family=Inter', page)).toBeNull()
    expect(unexpectedHost('https://fonts.gstatic.com/s/inter.woff2', page)).toBeNull()
    expect(unexpectedHost('https://escape.invalid/photograph.jpg', page)).toBe('https://escape.invalid/photograph.jpg')
    expect(unexpectedHost('wss://127.0.0.1:5175/', 'http://127.0.0.1:5175/tests/harness/states.html')).toBeNull()
    expect(unexpectedHost('wss://escape.invalid/socket', page)).toBe('wss://escape.invalid/socket')
    expect(unexpectedHost('data:image/svg+xml,x', page)).toBeNull()
    expect(unexpectedHost('https://fonts.googleapis.com/css', file, { offline: true })).toBeNull()
    expect(unexpectedHost('https://escape.invalid/photograph.jpg', file, { offline: true })).toBe('https://escape.invalid/photograph.jpg')
    expect(unexpectedHost('http://127.0.0.1:5173/', file, { offline: true })).toBe('http://127.0.0.1:5173/')
  })
})

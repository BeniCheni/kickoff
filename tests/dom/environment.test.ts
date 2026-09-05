import { describe, expect, it } from 'vitest'

/**
 * The routing guard. Everything under `tests/dom/` belongs to the `dom` project whatever its
 * extension, and the `node` project excludes the directory (vite.config.ts, `test.projects`) —
 * the same line tsconfig.node.json draws. Before that exclude existed, a `.test.ts` here
 * matched the node project's `*.test.ts` include and ran with no DOM at all (found by the
 * review of PR #21). This file is deliberately that `.test.ts`: if either half of the routing
 * regresses, it fails under node with "document is not defined" instead of the next DOM test
 * failing somewhere confusing.
 */
describe('tests/dom routing', () => {
  it('a .test.ts under tests/dom runs in the dom project, with a document and the setup file', () => {
    expect(typeof document).toBe('object')
    // setup.ts installs the matchMedia stub before every dom file; jsdom itself has none.
    expect(typeof window.matchMedia).toBe('function')
  })
})

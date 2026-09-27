import { expect, it } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

// Exercise the real CLI's report/exit seam without a browser install or external request.
// This adapter supplies measured results; it is not evidence of actual browser behavior.
const runtime = `
let build = 0;
const scenario = process.env.MOMENTS_CHECK_SCENARIO;
export const chromium = { launch: async () => ({
  version: () => 'synthetic-checker-test', close: async () => {},
  newContext: async () => {
    const current = build++;
    let route, width = 360, first = true;
    const handlers = {};
    const page = {
      on: (name, handler) => { handlers[name] = handler; },
      goto: async () => {
        if (!first) return;
        first = false;
        const url = scenario === 'provider' ? 'https://www.youtube.com/embed/synthetic'
          : scenario === 'unexpected' ? 'https://unexpected.example/asset'
          : 'https://fonts.gstatic.com/synthetic.woff2';
        await route({request: () => ({url: () => url}), abort: async () => {}, continue: async () => {}});
        if (scenario === 'font-failure') handlers.requestfailed({url: () => url, failure: () => ({errorText: 'synthetic refusal'})});
        if (scenario === 'page-error') handlers.pageerror(new Error('synthetic page error'));
      },
      setViewportSize: async value => { width = value.width; },
      evaluate: async () => ({width, scrollWidth: width, mediaElements: 0,
        text: scenario === 'text-drift' && current ? 'different' : 'same'}),
      waitForFunction: async () => {},
      screenshot: async () => Buffer.from(scenario === 'png-drift' && current ? 'different PNG' : 'same PNG'),
    };
    return {addInitScript: async () => {}, route: async (_, handler) => { route = handler; },
      newPage: async () => page, close: async () => {}};
  },
})};
`

it.each([
  ['baseline', 0], ['unexpected', 1], ['font-failure', 1], ['provider', 1],
  ['page-error', 1], ['text-drift', 1], ['png-drift', 0],
] as const)('browser receipt CLI exit for %s is %s', (scenario, expected) => {
  const dir = mkdtempSync(join(tmpdir(), 'moments-checker-'))
  try {
    const module = join(dir, 'runtime.mjs')
    writeFileSync(module, runtime)
    const result = spawnSync(process.execPath, [resolve('docs/verification/moments-foundation/check-browser.mjs'),
      pathToFileURL(module).href, 'synthetic-chrome', 'http://127.0.0.1:1', 'http://127.0.0.1:2', dir],
    { env: { ...process.env, MOMENTS_CHECK_SCENARIO: scenario }, encoding: 'utf8' })
    expect(result.stderr).toBe('')
    expect(JSON.parse(result.stdout).cells).toBe(72)
    expect(result.status).toBe(expected)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})

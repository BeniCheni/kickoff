import { afterEach, describe, expect, it, vi } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { deploymentUrl, digestAt, readDeployment, smoke } from '../scripts/vercel-smoke.mjs'

const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const url = 'https://kickoff-deployment-scope.vercel.app'
const project = 'kickoff'
const base = { url, sha, ref: 'main', project, mainSha: sha }
const nav = '<nav aria-label="Primary"></nav>'
const pages = [
  `${nav}<div data-moments-background="route"><button aria-label="Previous">‹</button></div>`,
  `${nav}<div data-moments-background="route"><div data-table-picker></div></div>`,
  `${nav}<main class="moments-gallery" aria-label="Moments">Published videos</main>`,
]
const payload = () => ({ action: 'vercel.deployment.success', client_payload: { project: { name: project, id: 'prj_fixture' }, environment: 'preview', url, git: { ref: 'main', sha, shortSha: sha.slice(0, 7) } } })
const dirs: string[] = []
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }) })

const fixturesPage = (inner: string) =>
  `${nav}<div data-moments-background="route">${inner}</div>`

// renderToString of the shell on this repo's React 19.2.8. esbuild bundles the
// .tsx (root npm ci provides it through tsx) and stubs next/dynamic plus CSS, so
// the root suite does not need web/node_modules. The three strings are the server
// markup of /, /?tab=table and /?tab=moments.
async function renderedRoutes(): Promise<[string, string, string]> {
  const require = createRequire(path.resolve('node_modules/tsx/package.json'))
  const esbuild = require('esbuild') as {
    build(options: {
      absWorkingDir: string
      entryPoints: string[]
      bundle: true
      platform: 'node'
      format: 'esm'
      jsx: 'automatic'
      outfile: string
      logLevel: 'silent'
      external: string[]
      plugins: Array<{ name: string, setup(build: EsbuildBuild): void }>
    }): Promise<void>
  }
  const stamp = randomUUID()
  const dir = path.join(tmpdir(), `kickoff-server-html-${stamp}`)
  const entry = path.join(dir, 'entry.tsx')
  const outfile = path.join(dir, 'bundle.mjs')
  const root = path.resolve('.')
  mkdirSync(dir)
  writeFileSync(entry, `
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { clockSnapshotAt } from ${JSON.stringify(path.join(root, 'src/lib/clock.ts'))}
import { RequestClock } from ${JSON.stringify(path.join(root, 'src/lib/RequestClock.tsx'))}
import { Shell } from ${JSON.stringify(path.join(root, 'web/app/shell.tsx'))}
export function renderRoutes() {
  const snapshot = clockSnapshotAt(Date.now())
  return ['', '?tab=table', '?tab=moments'].map((search) =>
    renderToString(createElement(RequestClock, { snapshot }, createElement(Shell, { search }))),
  )
}
`)
  try {
    await esbuild.build({
      absWorkingDir: root,
      entryPoints: [entry],
      bundle: true,
      platform: 'node',
      format: 'esm',
      jsx: 'automatic',
      outfile,
      logLevel: 'silent',
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/server'],
      plugins: [{
        name: 'server-html-stubs',
        setup(build) {
          build.onResolve({ filter: /^next\/dynamic$/ }, () => ({ path: 'next-dynamic', namespace: 'server-html-stub' }))
          build.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: path.join(root, 'web/test/next-navigation.ts') }))
          build.onResolve({ filter: /\.css$/ }, () => ({ path: 'empty-css', namespace: 'server-html-stub' }))
          build.onLoad({ filter: /.*/, namespace: 'server-html-stub' }, (args) => ({
            contents: args.path === 'next-dynamic'
              ? 'export default function dynamic(){return function NextDynamic(){return null}}'
              : 'export default ""',
            loader: 'js',
          }))
        },
      }],
    })
    const rendered = await import(pathToFileURL(outfile).href) as { renderRoutes(): string[] }
    const bodies = rendered.renderRoutes()
    if (bodies.length !== 3 || bodies.some(body => typeof body !== 'string' || body.length === 0)) {
      throw new Error('server HTML render returned the wrong routes')
    }
    return [bodies[0]!, bodies[1]!, bodies[2]!]
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

type EsbuildBuild = {
  onResolve(options: { filter: RegExp }, callback: () => { path: string, namespace?: string }): void
  onLoad(options: { filter: RegExp, namespace: string }, callback: (args: { path: string }) => { contents: string, loader: 'js' }): void
}

function server(over: { index?: number; body?: string; status?: number; headers?: Record<string, string> } = {}) {
  let index = 0
  return vi.fn<typeof fetch>(async () => {
    const i = index++
    const body = i === over.index && over.body !== undefined ? over.body : pages[i] ?? JSON.stringify({ sourceSha: sha, snapshotDigest: digestAt(sha) })
    return new Response(body, { status: i === over.index ? over.status ?? 200 : 200, headers: i === over.index ? over.headers : undefined })
  })
}

describe('trusted-main Vercel smoke', () => {
  it('reads the real dispatch shape and manual inputs', () => {
    expect(readDeployment('repository_dispatch', payload(), project)).toEqual({ url, sha, ref: 'main' })
    expect(readDeployment('workflow_dispatch', { inputs: { url, sha } }, project)).toEqual({ url, sha, ref: null })
    expect(deploymentUrl(url.slice(8), project)).toBe(url)
    expect(() => readDeployment('repository_dispatch', payload(), 'other')).toThrow('Dispatch project')
    expect(() => readDeployment('workflow_dispatch', { inputs: { url, sha: '--help' } }, project)).toThrow('metadata')
  })
  it('accepts an interior double hyphen in the project prefix', () => {
    expect(deploymentUrl('https://kickoff--web-deployment.vercel.app', 'kickoff--web')).toBe('https://kickoff--web-deployment.vercel.app')
  })
  it.each([
    'https://other-deployment.vercel.app', 'https://kickoff.vercel.app', 'https://kickoff-.vercel.app',
    'https://kickoff-deployment.vercel.app.evil.invalid', 'http://kickoff-deployment.vercel.app',
    'https://kickoff-deployment.vercel.app:444', 'https://user@kickoff-deployment.vercel.app',
    'https://kickoff-deployment.vercel.app/?token=anything', 'https://kickoff-deployment.vercel.app/path',
    'http://127.0.0.1:5174',
  ])('refuses %s before any secret-bearing request', async bad => {
    const fetchImpl = server()
    await expect(smoke({ ...base, url: bad, bypass: randomUUID() }, { fetchImpl })).rejects.toThrow('host')
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('checks all routes, sends the header only to the validated origin, and never follows redirects', async () => {
    const fetchImpl = server()
    const bypass = randomUUID()
    const result = await smoke({ ...base, bypass }, { fetchImpl })
    expect(result).toMatchObject({ latestMain: true, gallery: 'available', checks: ['/', '/?tab=table', '/?tab=moments', '/api/snapshot'] })
    for (const [request, options] of fetchImpl.mock.calls) {
      expect(String(request).startsWith(url + '/')).toBe(true)
      expect(new Headers(options?.headers).get('x-vercel-protection-bypass')).toBe(bypass)
      expect(options?.redirect).toBe('manual')
    }
    const redirect = server({ index: 0, status: 302, headers: { location: 'https://other.invalid/' } })
    await expect(smoke(base, { fetchImpl: redirect })).rejects.toThrow('HTTP 200')
    expect(redirect).toHaveBeenCalledTimes(1)
  })
  it.each([0, 1, 2])('rejects missing landmarks on page %i', async index => {
    await expect(smoke(base, { fetchImpl: server({ index, body: nav }) })).rejects.toThrow('landmark')
  })
  it('requires the surviving fixture navigation, not just the retired view control', async () => {
    const retired = `${nav}<div data-moments-background="route"><button>Weekly</button></div>`
    await expect(smoke(base, { fetchImpl: server({ index: 0, body: retired }) })).rejects.toThrow('landmark')
  })
  it('still passes when the jump control reads Today', async () => {
    const renamed = `${nav}<div data-moments-background="route"><button>Today</button><button aria-label="Previous">‹</button></div>`
    const result = await smoke(base, { fetchImpl: server({ index: 0, body: renamed }) })
    expect(result.checks).toContain('/')
  })
  it.each([
    ['nav', 0, `<nav data-aria-label="Primary"></nav><div data-moments-background="route"><button aria-label="Previous">‹</button></div>`],
    ['moments background', 0, `${nav}<div x-data-moments-background="route"><button aria-label="Previous">‹</button></div>`],
    ['previous button', 0, `${nav}<div data-moments-background="route"><button data-aria-label="Previous">‹</button></div>`],
    ['table picker', 1, `${nav}<div data-moments-background="route"><div x-data-table-picker></div></div>`],
    ['moments main', 2, `${nav}<main data-aria-label="Moments">Published videos</main>`],
  ])('rejects a prefixed stand-in for the %s landmark', async (_name, index, body) => {
    await expect(smoke(base, { fetchImpl: server({ index, body }) })).rejects.toThrow('landmark')
  })
  it('rejects a Previous button whose accessible name is overridden', async () => {
    const bodies = [
      `${nav}<div data-moments-background="route"><button aria-label="Previous" aria-labelledby="week">‹</button></div>`,
      `${nav}<div data-moments-background="route"><button aria-labelledby="week" aria-label="Previous">‹</button></div>`,
      `${nav}<div data-moments-background="route"><button aria-label="Previous week">‹</button></div>`,
    ]
    for (const body of bodies) {
      await expect(smoke(base, { fetchImpl: server({ index: 0, body }) })).rejects.toThrow('landmark')
    }
  })
  it.each([
    ['ARIA-LABELLEDBY', fixturesPage('<button aria-label="Previous" ARIA-LABELLEDBY="other">‹</button><span id="other">Wrong week</span>')],
    ['Aria-LabelledBy', fixturesPage('<button aria-label="Previous" Aria-LabelledBy="other">‹</button><span id="other">Wrong week</span>')],
    ['a button-probe element', fixturesPage('<button-probe aria-label="Previous"></button-probe>')],
    ['a quoted > before a lowercase aria-labelledby', fixturesPage('<button aria-label="Previous" title="a>b" aria-labelledby="week">‹</button>')],
    ['the name Previous week', fixturesPage('<button aria-label="Previous week">‹</button>')],
    ['the name previous', fixturesPage('<button aria-label="previous">‹</button>')],
  ])('rejects Previous when the control is %s', async (_name, body) => {
    await expect(smoke(base, { fetchImpl: server({ index: 0, body }) })).rejects.toThrow('landmark')
  })
  it.each([
    ['a button.x tag', fixturesPage('<button.x aria-label="Previous">‹</button.x>')],
    ['a button inside template', fixturesPage('<template><button aria-label="Previous">‹</button></template>')],
    ['a button inside noscript', fixturesPage('<noscript><button aria-label="Previous">‹</button></noscript>')],
  ])('rejects Previous when it is only %s', async (_name, body) => {
    await expect(smoke(base, { fetchImpl: server({ index: 0, body }) })).rejects.toThrow('landmark')
  })
  it('keeps the page Previous when a template holds another', async () => {
    const body = fixturesPage('<template><button aria-label="Previous">‹</button></template><button aria-label="Previous">‹</button>')
    const result = await smoke(base, { fetchImpl: server({ index: 0, body }) })
    expect(result.checks).toContain('/')
  })
  it('keeps Previous when an earlier attribute quotes a >', async () => {
    const body = fixturesPage('<button title="a>b" aria-label="Previous">‹</button>')
    const result = await smoke(base, { fetchImpl: server({ index: 0, body }) })
    expect(result.checks).toContain('/')
  })
  it("accepts today's rendered server HTML on all three routes", async () => {
    const [fixtures, table, moments] = await renderedRoutes()
    expect(fixtures).toContain('<nav aria-label="Primary"')
    expect(fixtures).toContain('data-moments-background="route"')
    expect(fixtures).toContain('<button aria-label="Previous"')
    expect(table).toContain('<nav aria-label="Primary"')
    expect(table).toContain('data-moments-background="route"')
    expect(table).toContain('data-table-picker="true"')
    expect(moments).toContain('<nav aria-label="Primary"')
    expect(moments).toContain('<main class="moments-gallery" aria-label="Moments"')
    // This shell has no catalog, so Moments names the unavailable gallery. Landmarks
    // still hold: latest main fails that gate, and any other ref reports it.
    const bodies = [fixtures, table, moments]
    const fetchImpl = () => {
      let index = 0
      return vi.fn<typeof fetch>(async () => {
        const i = index++
        const body = bodies[i] ?? JSON.stringify({ sourceSha: sha, snapshotDigest: digestAt(sha) })
        return new Response(body)
      })
    }
    await expect(smoke(base, { fetchImpl: fetchImpl() })).rejects.toThrow('Gallery unavailable')
    const result = await smoke({ ...base, ref: 'feature' }, { fetchImpl: fetchImpl() })
    expect(result.checks).toEqual(['/', '/?tab=table', '/?tab=moments', '/api/snapshot'])
    expect(result.gallery).toContain('reported')
  })
  it('rejects wrong source SHA and wrong snapshot bytes', async () => {
    for (const snapshot of [{ sourceSha: 'b'.repeat(40), snapshotDigest: digestAt(sha) }, { sourceSha: sha, snapshotDigest: '0'.repeat(64) }]) {
      await expect(smoke(base, { fetchImpl: server({ index: 3, body: JSON.stringify(snapshot) }) })).rejects.toThrow('Snapshot')
    }
    const hash = createHash('sha256')
    for (const name of ['fixtures.json', 'meta.json', 'standings.json']) {
      // The committed bytes at `sha`, not the working tree: sync.yml runs this suite after it has written a new
      // snapshot and before it commits one, so the files on disk then differ from HEAD by design.
      const bytes = execFileSync('git', ['show', `${sha}:src/data/${name}`], { maxBuffer: 16 * 1024 * 1024 })
      hash.update(name); hash.update('\n'); hash.update(String(bytes.length)); hash.update('\n'); hash.update(bytes); hash.update('\n')
    }
    expect(digestAt(sha)).toBe(hash.digest('hex'))
    expect(() => digestAt('--help')).toThrow('Invalid')
  })
  it.each([
    ['postgres', '://', 'synthetic.invalid/db'].join(''),
    ['studio_reader', '.', 'synthetic'].join(''),
    ['KICKOFF', 'STUB', 'CATALOG'].join('-'),
    'db.synthetic.supabase.co', 'aws-0-region.pooler.supabase.com',
    ['postgres', ':\\u002f\\u002f', 'synthetic.invalid/db'].join(''),
  ])('rejects a response leak without printing its value', async leak => {
    await expect(smoke(base, { fetchImpl: server({ index: 1, body: pages[1] + leak }) })).rejects.toThrow('Response leak: /?tab=table')
    await expect(smoke(base, { fetchImpl: server({ index: 3, headers: { 'x-test': leak } }) })).rejects.toThrow('Response leak: /api/snapshot')
  })
  it('rejects a bypass echo in bodies and headers without printing response content', async () => {
    const bypass = randomUUID()
    await expect(smoke({ ...base, bypass }, { fetchImpl: server({ index: 1, body: pages[1] + `before-${bypass}-after` }) }))
      .rejects.toMatchObject({ message: 'Response leak: /?tab=table' })
    await expect(smoke({ ...base, bypass }, { fetchImpl: server({ index: 3, headers: { 'x-test': bypass } }) }))
      .rejects.toMatchObject({ message: 'Response leak: /api/snapshot' })
  })
  it('fails unavailable latest main, reports other branches and older main', async () => {
    const unavailable = () => server({ index: 2, body: pages[2] + '<h2 id="moments-unavailable-heading">The gallery is unavailable.</h2>' })
    await expect(smoke(base, { fetchImpl: unavailable() })).rejects.toThrow('Gallery unavailable')
    await expect(smoke({ ...base, ref: null }, { fetchImpl: unavailable() })).rejects.toThrow('Gallery unavailable')
    for (const input of [{ ...base, ref: 'feature' }, { ...base, mainSha: 'b'.repeat(40) }]) {
      expect((await smoke(input, { fetchImpl: unavailable() })).gallery).toContain('reported')
    }
  })
  it('does not echo transport exceptions', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new Error(randomUUID()))
    await expect(smoke(base, { fetchImpl })).rejects.toThrow('Request failed: /')
  })
  it('executes a fake dispatch through the CLI metadata path without secrets', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'vercel-event-')); dirs.push(dir)
    const event = path.join(dir, 'event.json'), output = path.join(dir, 'output')
    writeFileSync(event, JSON.stringify(payload()))
    const result = spawnSync(process.execPath, ['scripts/vercel-smoke.mjs', 'metadata'], {
      encoding: 'utf8', env: { ...process.env, GITHUB_EVENT_NAME: 'repository_dispatch', GITHUB_EVENT_PATH: event, GITHUB_OUTPUT: output, VERCEL_PROJECT_NAME: project, VERCEL_AUTOMATION_BYPASS_SECRET: '' },
    })
    expect(result.status).toBe(0)
    expect(readFileSync(output, 'utf8')).toBe(`sha=${sha}\nurl=${url}\n`)
  })
  it('workflow checks out only main and scopes the bypass to the standalone script', () => {
    const workflow = readFileSync('.github/workflows/preview-smoke.yml', 'utf8')
    expect(workflow).toContain('types: [vercel.deployment.success]')
    expect(workflow).toContain("if: github.ref == 'refs/heads/main'")
    expect(workflow).toContain('ref: main')
    expect(workflow).toContain('persist-credentials: false')
    expect(workflow).toContain('contents: read\n  statuses: write')
    expect(workflow).toContain('group: vercel-smoke-${{ github.event.client_payload.git.sha || inputs.sha || github.run_id }}')
    expect(workflow).toContain('VERCEL_AUTOMATION_BYPASS_SECRET: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}\n        run: node scripts/vercel-smoke.mjs')
    expect(workflow).not.toMatch(/npm |npx |pull_request|ref:.*(?:inputs|payload)/)
    expect(workflow).toContain('-f context=vercel-smoke')
    expect(workflow).toContain('GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}')
    expect(workflow).toContain('-f "target_url=$DEPLOYMENT_URL"')
  })
  it.each(['success', 'failure', 'skipped'])('posts the real status shell for smoke outcome %s', outcome => {
    const workflow = readFileSync('.github/workflows/preview-smoke.yml', 'utf8')
    const shell = workflow.split('        run: |\n')[1]!.split('\n').map(line => line.slice(10)).join('\n')
    const dir = mkdtempSync(path.join(tmpdir(), 'vercel-status-')); dirs.push(dir)
    mkdirSync(path.join(dir, 'bin'))
    writeFileSync(path.join(dir, 'bin/gh'), '#!/usr/bin/env bash\nprintf "%s\\n" "$@" > "$MOCK_CALLS"\n', { mode: 0o755 })
    const result = spawnSync('bash', ['-euo', 'pipefail', '-c', shell], {
      encoding: 'utf8', env: { ...process.env, PATH: `${dir}/bin:${process.env.PATH}`, MOCK_CALLS: path.join(dir, 'calls'),
        GH_TOKEN: '', GITHUB_REPOSITORY: 'BeniCheni/kickoff', DEPLOYED_SHA: sha, DEPLOYMENT_URL: url, SMOKE_OUTCOME: outcome },
    })
    expect(result.status).toBe(0)
    const calls = readFileSync(path.join(dir, 'calls'), 'utf8')
    expect(calls).toContain(`repos/BeniCheni/kickoff/statuses/${sha}`)
    expect(calls).toContain(`state=${outcome === 'success' ? 'success' : 'failure'}`)
    expect(calls).toContain('context=vercel-smoke')
    expect(calls).toContain(`target_url=${url}`)
  })
})

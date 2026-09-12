// Read-only candidate probe: archive the requested ref, alter only disposable test
// modules, and run the publication gate against two valid in-memory snapshot shapes.
// Usage from the repo root: node docs/verification/european-week/round2-resilience.mjs <ref>
import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const ref = process.argv[2] ?? 'HEAD'
const sha = execFileSync('git', ['rev-parse', '--verify', `${ref}^{commit}`], { encoding: 'utf8' }).trim()
const scratch = mkdtempSync(join(tmpdir(), 'kickoff-round2-resilience-'))
const archive = execFileSync('git', ['archive', sha], { maxBuffer: 64 * 1024 * 1024 })
execFileSync('tar', ['-xf', '-', '-C', scratch], { input: archive })
symlinkSync(realpathSync(resolve('node_modules')), join(scratch, 'node_modules'))

// These mocks change module return values. No src/data file is edited or regenerated.
appendFileSync(join(scratch, 'tests/dom/setup.ts'), `
import { vi } from 'vitest'
vi.mock('../../src/data/standings.json', async original => {
  const mod = await original<{ default: { leagues: Record<string, unknown>; degraded?: string[] } }>()
  const data = structuredClone(mod.default)
  delete data.leagues.ucl
  data.degraded = ['ucl']
  return { default: data }
})
vi.mock('../../src/data/meta.json', async original => {
  const mod = await original<{ default: Record<string, unknown> }>()
  return { default: { ...mod.default, standingsDegraded: ['ucl'] } }
})
`)
const venueTest = join(scratch, 'tests/venueTz.test.ts')
const source = readFileSync(venueTest, 'utf8')
if (!source.includes("import { describe, expect, it } from 'vitest'")) throw new Error('Venue test import changed; inspect the probe')
writeFileSync(venueTest, source.replace("import { describe, expect, it }", "import { describe, expect, it, vi }") + `
vi.mock('node:fs', async original => {
  const fs = await original<typeof import('node:fs')>()
  return { ...fs, readFileSync: (...args: Parameters<typeof fs.readFileSync>) => {
    const result = fs.readFileSync(...args)
    if (String(args[0]).endsWith('/src/data/fixtures.json')) {
      const rows = JSON.parse(String(result))
      const row = rows.find((f: { competition: string }) => f.competition === 'ucl')
      if (!row) throw new Error('Probe requires a UCL fixture')
      row.venueCountry = 'Unmapped country'
      delete row.venueTz
      return JSON.stringify(rows)
    }
    return result
  } }
})
`)
const result = spawnSync('npm', ['test'], { cwd: scratch, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
writeFileSync(join(scratch, 'run.log'), result.stdout + result.stderr)
console.log(JSON.stringify({ sha, scratch, exit: result.status }))
console.log((result.stdout + result.stderr).split('\n').filter(line => /Test Files|Tests |FAIL |×|✓/.test(line)).join('\n'))
if (result.error) throw result.error
process.exitCode = result.status ?? 1

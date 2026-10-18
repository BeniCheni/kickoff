import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { COPY } from '../copy.ts'
import { PER_JOB_CAP_USD, PREPAID_CEILING_USD, SESSION_CAP_USD } from '../caps.ts'
import { displayUsd } from '../shared/display.ts'
import type { ShellView } from '../shared/types.ts'
import { StudioShell } from '../ui/app/shell.tsx'

const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const shell: ShellView = {
  transport: 'stub',
  host: '127.0.0.1',
  port: 5176,
  balance: null,
  session: null,
  caps: {
    perJobUsd: PER_JOB_CAP_USD,
    sessionUsd: SESSION_CAP_USD,
    prepaidCeilingUsd: PREPAID_CEILING_USD,
  },
  database: 'unavailable',
  outOfCredit: true,
}

describe('studio shell', () => {
  it('draws the loopback shell, both banners, and Publish rather than Export', () => {
    const html = renderToStaticMarkup(
      <StudioShell shell={shell} tab="compose" theme="light" onTab={() => undefined} onTheme={() => undefined} />,
    )
    expect(html).toContain('Kickoff')
    expect(html).toContain('127.0.0.1:5176')
    expect(html).toContain('this Mac only')
    expect(html).toContain('transport=stub')
    expect(html).toContain('not recorded')
    expect(html).toContain('not open')
    expect(html).toContain(displayUsd(PER_JOB_CAP_USD))
    expect(html).toContain(displayUsd(SESSION_CAP_USD))
    expect(html).toContain(displayUsd(PREPAID_CEILING_USD))
    expect(html).toContain('paused')
    expect(html).toContain('data-kind="ledger"')
    const databaseSplit = COPY.databaseUnavailable.indexOf('. ')
    expect(html).toContain(COPY.databaseUnavailable.slice(0, databaseSplit + 1))
    expect(html).toContain(COPY.databaseUnavailable.slice(databaseSplit + 2))
    const creditSplit = COPY.outOfCredit.indexOf('. ')
    expect(html).toContain(COPY.outOfCredit.slice(0, creditSplit + 1))
    expect(html).toContain(COPY.outOfCredit.slice(creditSplit + 2))
    for (const label of ['Compose', 'Jobs', 'Review', 'Publish', 'Import']) {
      expect(html).toContain(`>${label}<`)
    }
    expect(html).not.toContain('>Export<')
    expect(html).toContain('Use dark theme')
  })

  it('has no live switch and no VITE variable in the admin source', () => {
    const files = [
      'ui/app/app.tsx',
      'ui/app/api.ts',
      'ui/app/shell.tsx',
      'ui/app/main.tsx',
      'server/http.ts',
      'server/main.ts',
    ]
    for (const file of files) {
      const text = readFileSync(path.join(studioRoot, file), 'utf8')
      expect(text).not.toContain('VITE_')
      expect(text).not.toMatch(/transport\s*=\s*['"]live['"]/)
    }
  })
})

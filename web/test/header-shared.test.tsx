import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { ImprintBand } from '../../src/components/ImprintBand'
import { clockSnapshotAt } from '../../src/lib/clock'
import { META, SYNC_STAMP } from '../../src/lib/fixtures'
import { RequestClock } from '../../src/lib/RequestClock'
import { Shell } from '../app/shell'

function headerHtml(html: string) {
  const match = html.match(/<header[\s\S]*?<\/header>/)
  if (!match) throw new Error('header missing')
  return match[0]
}

const themeLabel = (
  <>
    <span className="theme-when-light">Dark mode</span>
    <span className="theme-when-dark">Light mode</span>
  </>
)

test('Next renders the band from the shared module', () => {
  const html = renderToStaticMarkup(
    <RequestClock snapshot={clockSnapshotAt(Date.parse('2026-09-14T16:00:00Z'))}>
      <Shell search="" />
    </RequestClock>,
  )
  const fromModule = renderToStaticMarkup(
    <ImprintBand
      version="0.5.5"
      tab="fixtures"
      lens="poster"
      onSelectTab={() => {}}
      onSelectLens={() => {}}
      onToggleTheme={() => {}}
      themeLabel={themeLabel}
      onToggleMotion={() => {}}
      motionLabel={(
        <>
          <span className="motion-when-on">Stop motion</span>
          <span className="motion-when-off">Start motion</span>
        </>
      )}
    />,
  )
  expect(headerHtml(html)).toBe(fromModule)
  expect(fromModule).toContain('Brooklyn · ET')
  expect(fromModule).toContain('theme-when-light')
  expect(fromModule).toContain('theme-when-dark')
  expect(fromModule).toContain('aria-label="Primary"')
  const provenance = html.toLowerCase()
  expect(provenance).toContain(`${META.total} fixtures`)
  expect(provenance).toContain(SYNC_STAMP.toLowerCase())
})

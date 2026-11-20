import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { BandHeightBoot, ImprintBand } from '../../src/components/ImprintBand'
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

test('the server’s HTML measures its band before the app runs: the script is the band’s next sibling', () => {
  const html = renderToStaticMarkup(
    <RequestClock snapshot={clockSnapshotAt(Date.parse('2026-09-14T16:00:00Z'))}>
      <Shell search="?tab=table" />
    </RequestClock>,
  )
  const boot = renderToStaticMarkup(<BandHeightBoot />)
  expect(boot).toMatch(/^<script data-kickoff-band="">\(function\(\)\{var b=document\.currentScript\.previousElementSibling;/)
  expect(boot).toContain("setProperty('--band-height',h+'px')")
  // Directly after the band and before the page, so previousElementSibling is the band
  // and the general-sibling rules in the shared sheet still reach the page.
  expect(html).toContain(`</header>${boot}<div class="page-measure"`)
  expect(html.split('data-kickoff-band').length - 1).toBe(1)
})

import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { AppHeader } from '../../src/components/AppHeader'
import { clockSnapshotAt } from '../../src/lib/clock'
import { RequestClock } from '../../src/lib/RequestClock'
import { Shell } from '../app/shell'

function headerHtml(html: string) {
  const match = html.match(/<header[\s\S]*?<\/header>/)
  if (!match) throw new Error('header missing')
  return match[0]
}

test('Next renders the header from the shared module', () => {
  const html = renderToStaticMarkup(
    <RequestClock snapshot={clockSnapshotAt(Date.parse('2026-09-14T16:00:00Z'))}>
      <Shell search="" />
    </RequestClock>,
  )
  const fromModule = renderToStaticMarkup(
    <AppHeader
      version="0.5.3"
      onToggleTheme={() => {}}
      themeLabel={(
        <>
          <span className="dark:hidden">Dark mode</span>
          <span className="hidden dark:inline">Light mode</span>
        </>
      )}
    />,
  )
  expect(headerHtml(html)).toBe(fromModule)
  expect(fromModule).toContain('Brooklyn · ET')
  expect(fromModule).toContain('dark:hidden')
})

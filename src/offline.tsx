import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useNow } from './lib/useNow'
import { useCanonicalSearch, useUrlState } from './lib/useUrlState'
import { encodeTab, parseTab, type Tab } from './lib/urlCodecs'
import { DEFAULT_LENS, encodeLens, parseLens } from './lib/lens'
import { useMotionController } from './lib/useMotionController'
import { useThemeController } from './lib/useThemeController'
import { ImprintBand } from './components/ImprintBand'
import { FixturesPage } from './components/FixturesPage'
import { TablePage } from './components/TablePage'
import { StalenessBanner } from './components/StalenessBanner'
import { ViewBoundary } from './components/ViewBoundary'
import './index.css'

const OFFLINE_TABS: ReadonlyArray<{ key: Tab; label: string }> = [
  { key: 'fixtures', label: 'Fixtures' },
  { key: 'table', label: 'Table' },
]

/**
 * Fixtures and Table only. `?tab=moments` renders Fixtures and does not rewrite the URL.
 * The "Offline snapshot" line sits outside the band. The tab list is the only
 * difference: Moments is not on this page.
 */
export function OfflineApp() {
  const { today } = useNow()
  const [tab, setTab] = useUrlState<Tab>('tab', 'fixtures', encodeTab, parseTab, 'push')
  const [lens, setLens] = useUrlState('lens', DEFAULT_LENS, encodeLens, parseLens, 'replace')
  useCanonicalSearch(today)
  const { theme, toggle } = useThemeController(lens)
  const { motion, toggle: toggleMotion } = useMotionController()
  const shown = tab === 'table' ? 'table' : 'fixtures'

  return (
    <>
    <ImprintBand
      version={__APP_VERSION__}
      tab={shown}
      lens={lens}
      tabs={OFFLINE_TABS}
      onSelectTab={setTab}
      onSelectLens={setLens}
      onToggleTheme={toggle}
      themeLabel={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      onToggleMotion={toggleMotion}
      motionLabel={motion === 'off' ? 'Start motion' : 'Stop motion'}
    />
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-16">
      <p data-offline-snapshot="" className="label-caps mb-4 text-[10px] text-ink-muted">Offline snapshot</p>
      <div data-moments-background="route">
        <ViewBoundary key={`${shown}:${lens}`}>
          <StalenessBanner />
          {shown === 'table' ? <TablePage /> : <FixturesPage today={today} lens={lens} />}
        </ViewBoundary>
      </div>
    </div>
    </>
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <OfflineApp />
    </StrictMode>,
  )
}

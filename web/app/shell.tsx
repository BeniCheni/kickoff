'use client'

import pkg from '../../package.json'
import { AppHeader } from '../../src/components/AppHeader'
import { TabNav } from '../../src/components/TabNav'
import { LensSwitcher } from '../../src/components/LensSwitcher'
import { StalenessBanner } from '../../src/components/StalenessBanner'
import { ViewBoundary } from '../../src/components/ViewBoundary'
import { MomentsRegion } from './moments/region'
import type { CatalogMode, MomentsPayload } from '../lib/catalog/types'
import { FixturesPage } from '../../src/components/FixturesPage'
import { TablePage } from '../../src/components/TablePage'
import { TickerStrip } from '../../src/components/TickerStrip'
import { DEFAULT_LENS, encodeLens, parseLens } from '../../src/lib/lens'
import { useThemeController } from '../../src/lib/useThemeController'
import { useNow } from '../../src/lib/useNow'
import { SearchProvider, useCanonicalSearch, useUrlState } from '../../src/lib/useUrlState'
import { useSearchParams } from 'next/navigation'
import { useWatchNavigation, WatchNavigationProvider, useIgnoredWatchScrub } from './moments/watch-url'
import { encodeTab, parseTab, type Tab } from '../../src/lib/urlCodecs'

/** Empty until N5 mounts the Privacy & terms link. Renders no element. */
export function PrivacyFoot() {
  return null
}

export function Shell({
  search,
  moments = { state: 'skipped' },
  catalogMode = 'closed',
  demo = false,
}: {
  search: string
  moments?: MomentsPayload
  catalogMode?: CatalogMode
  demo?: boolean
}) {
  return <SearchProvider search={search}><WatchNavigationProvider><ShellInner moments={moments} catalogMode={catalogMode} demo={demo} /></WatchNavigationProvider></SearchProvider>
}

function ShellInner({ moments, catalogMode, demo }: { moments: MomentsPayload; catalogMode: CatalogMode; demo: boolean }) {
  const { today } = useNow()
  const [, setTab] = useUrlState('tab', 'fixtures', encodeTab, parseTab, 'push')
  const params = useSearchParams()
  const tab = parseTab(params.get('tab') ?? '')
  const liveSearch = params.size ? `?${params}` : ''
  const [lens, setLens] = useUrlState('lens', DEFAULT_LENS, encodeLens, parseLens, 'replace')
  const navigate = useWatchNavigation()
  useCanonicalSearch(today)
  useIgnoredWatchScrub()
  const { toggle } = useThemeController(lens)
  function onSelect(next: Tab) {
    const currentWatch = new URLSearchParams(window.location.search).get('watch')
    const enteringMoments = next === 'moments' && tab !== 'moments'
    const leavingWithWatch = tab === 'moments' && next !== 'moments' && currentWatch !== null
    const ignoredWatch = tab !== 'moments' && currentWatch !== null && next !== 'moments'
    if (enteringMoments || leavingWithWatch || ignoredWatch) {
      navigate(next, next === 'moments' ? currentWatch : null)
      return
    }
    setTab(next)
  }

  return (
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-16">
      <AppHeader
        version={pkg.version}
        onToggleTheme={toggle}
        themeLabel={(
          <>
            <span className="dark:hidden">Dark mode</span>
            <span className="hidden dark:inline">Light mode</span>
          </>
        )}
      />
      <TabNav tab={tab} onSelect={onSelect}>
        <LensSwitcher lens={lens} onSelect={setLens} />
      </TabNav>
      {tab === 'moments' ? <ViewBoundary key={tab}><MomentsRegion moments={moments} catalogMode={catalogMode} search={liveSearch} demo={demo} /></ViewBoundary> : (
        <div data-moments-background="route"><ViewBoundary key={`${tab}:${lens}`}>
          {lens === 'broadcast' && tab === 'fixtures' && <TickerStrip />}
          <StalenessBanner />
          {tab === 'table' ? <TablePage /> : <FixturesPage today={today} lens={lens} />}
        </ViewBoundary></div>
      )}
      <PrivacyFoot />
    </div>
  )
}

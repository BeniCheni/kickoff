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
import { useRouter } from 'next/navigation'
import { mergeWatch } from './moments/watch-url'
import { encodeTab, parseTab, type Tab } from '../../src/lib/urlCodecs'

/** Empty until N5 mounts the Privacy & terms link. Renders no element. */
export function PrivacyFoot() {
  return null
}

export function Shell({
  search,
  moments = { state: 'skipped' },
  catalogMode = 'closed',
}: {
  search: string
  moments?: MomentsPayload
  catalogMode?: CatalogMode
}) {
  return <SearchProvider search={search}><ShellInner moments={moments} catalogMode={catalogMode} search={search} /></SearchProvider>
}

function ShellInner({ moments, catalogMode, search }: { moments: MomentsPayload; catalogMode: CatalogMode; search: string }) {
  const { today } = useNow()
  const [tab, setTab] = useUrlState('tab', 'fixtures', encodeTab, parseTab, 'push')
  const [lens, setLens] = useUrlState('lens', DEFAULT_LENS, encodeLens, parseLens, 'replace')
  const router = useRouter()
  useCanonicalSearch(today)
  const { toggle } = useThemeController(lens)
  function onSelect(next: Tab) {
    const currentWatch = new URLSearchParams(window.location.search).get('watch')
    const leavingWithWatch = tab === 'moments' && next !== 'moments' && currentWatch !== null
    const enteringMoments = next === 'moments' && tab !== 'moments'
    if (leavingWithWatch || enteringMoments) {
      const href = mergeWatch(window.location.search, window.location.hash, next, next === 'moments' ? currentWatch : null)
      router.push(`${window.location.pathname}${href}`)
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
      {tab === 'moments' ? <ViewBoundary key={`${tab}:${lens}`}><MomentsRegion moments={moments} catalogMode={catalogMode} search={search} /></ViewBoundary> : (
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

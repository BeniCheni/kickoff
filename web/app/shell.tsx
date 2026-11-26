'use client'

import pkg from '../../package.json'
import { BandHeightBoot, ImprintBand } from '../../src/components/ImprintBand'
import { StalenessBanner } from '../../src/components/StalenessBanner'
import { ViewBoundary } from '../../src/components/ViewBoundary'
import { MomentsRegion } from './moments/region'
import type { CatalogMode, MomentsPayload } from '../lib/catalog/types'
import { FixturesPage } from '../../src/components/FixturesPage'
import { TablePage } from '../../src/components/TablePage'
import { DEFAULT_LENS, encodeLens, parseLens } from '../../src/lib/lens'
import { useMotionController } from '../../src/lib/useMotionController'
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
}: {
  search: string
  moments?: MomentsPayload
  catalogMode?: CatalogMode
}) {
  return <SearchProvider search={search}><WatchNavigationProvider><ShellInner moments={moments} catalogMode={catalogMode} /></WatchNavigationProvider></SearchProvider>
}

function ShellInner({ moments, catalogMode }: { moments: MomentsPayload; catalogMode: CatalogMode }) {
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
  const { motion, toggle: toggleMotion } = useMotionController()
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
    <>
    <ImprintBand
      version={pkg.version}
      tab={tab}
      lens={lens}
      onSelectTab={onSelect}
      onSelectLens={setLens}
      onToggleTheme={toggle}
      themeLabel={(
        <>
          <span className="theme-when-light">Dark mode</span>
          <span className="theme-when-dark">Light mode</span>
        </>
      )}
      onToggleMotion={toggleMotion}
      motionLabel={(
        <>
          <span className="motion-when-on">Stop motion</span>
          <span className="motion-when-off">Start motion</span>
        </>
      )}
    />
    <BandHeightBoot />
    <div className="page-measure" data-measure={tab === 'moments' ? 'moments' : tab === 'table' ? 'register' : 'poster'} data-ground={tab === 'table' || tab === 'moments' ? 'black' : lens === 'ledger' ? 'typescript' : 'pulp'}>
      {tab === 'moments' ? <ViewBoundary key={tab}><MomentsRegion moments={moments} catalogMode={catalogMode} search={liveSearch} /></ViewBoundary> : (
        <div data-moments-background="route"><ViewBoundary key={`${tab}:${lens}`}>
          <StalenessBanner />
          {tab === 'table' ? <TablePage /> : <FixturesPage today={today} lens={lens} motion={motion} toggleMotion={toggleMotion} />}
        </ViewBoundary></div>
      )}
      <PrivacyFoot />
    </div>
    </>
  )
}

import type { ReactNode } from 'react'
import { useNow } from './lib/useNow'
import { useUrlState, useCanonicalSearch } from './lib/useUrlState'
import { encodeTab, parseTab } from './lib/urlCodecs'
import { DEFAULT_LENS, encodeLens, parseLens, type Lens } from './lib/lens'
import { useThemeController } from './lib/useThemeController'
import { TabNav, type Tab } from './components/TabNav'
import { AppHeader } from './components/AppHeader'
import { LensSwitcher } from './components/LensSwitcher'
import { FixturesPage } from './components/FixturesPage'
import { MomentsPage } from './components/MomentsPage'
import { TablePage } from './components/TablePage'
import { StalenessBanner } from './components/StalenessBanner'
import { TickerStrip } from './components/TickerStrip'
import { MOMENTS } from './lib/moments'
import type { GalleryMoment } from './lib/momentsGallery'
import type { StorageAccess } from './lib/momentsSaved'
import { MomentsPlayerBoundary } from './components/MomentsPlayerHost'
import { MomentsSessionBoundary, MomentsSessionProvider, useMomentsSession } from './components/MomentsSessionProvider'
import { ViewBoundary } from './components/ViewBoundary'
import type { MomentsPlayability } from './lib/momentsPlayability'
import type { MomentsPlayerFactory } from './lib/momentsPlayer'

// A route-level seam allows the isolated harness to exercise the real shell and boundary.
function MomentsRouteBoundary({ boundaryKey, children }: { boundaryKey: string; children: ReactNode }) {
  const session = useMomentsSession()!
  return <ViewBoundary key={boundaryKey} onFailure={() => session.dispatch({ type: 'leave' })}
    allowRetry>{children}</ViewBoundary>
}

export default function App({ momentsEdition = MOMENTS, momentsStorage, momentsRoute, momentsPlayer, momentsPlayability, momentsPlayerFault = false }: {
  momentsEdition?: readonly GalleryMoment[]
  momentsStorage?: StorageAccess
  momentsRoute?: ReactNode
  momentsPlayability?: MomentsPlayability
  momentsPlayer?: MomentsPlayerFactory
  momentsPlayerFault?: boolean
} = {}) {
  const { today } = useNow()

  // `/` is Fixtures; Table and Moments use `?tab=`. The header and tab row persist
  // across all three, so each view is always one tap from the others. Tab switches push a
  // history entry — Back returns to the previous tab, not out of the site.
  const [tab, setTab] = useUrlState<Tab>(
    'tab', 'fixtures',
    encodeTab, parseTab,
    'push',
  )

  // The lens is a view preference, not navigation — replace history, default omitted.
  const [lens, setLens] = useUrlState<Lens>('lens', DEFAULT_LENS, encodeLens, parseLens, 'replace')

  useCanonicalSearch(today)
  const { theme, toggle } = useThemeController(lens)

  return (
    <div className="mx-auto max-w-[780px] px-5 pt-7 pb-16">
      <AppHeader
        version={__APP_VERSION__}
        onToggleTheme={toggle}
        themeLabel={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      />

      <TabNav tab={tab} onSelect={setTab}>
        <LensSwitcher lens={lens} onSelect={setLens} />
      </TabNav>

      {/* The Moments visit owner (Decision 1) is mounted once and never keyed, whatever the tab,
          so the visit survives tab and lens changes — but only the Moments route sits under it.
          Fixtures and Table render outside both Moments boundaries: an owner failure cannot take
          the shell or another tab down, and their error paths stay exactly what main renders. */}
      <MomentsSessionBoundary active={tab === 'moments'}>
        <MomentsSessionProvider edition={momentsEdition} tab={tab} storage={momentsStorage} playability={momentsPlayability}>
          {tab === 'moments' && <div data-moments-background="route"><MomentsRouteBoundary boundaryKey={`${tab}:${lens}`}>
            {momentsRoute ?? <MomentsPage />}
          </MomentsRouteBoundary></div>}
          <MomentsPlayerBoundary factory={momentsPlayer} fault={momentsPlayerFault} />
        </MomentsSessionProvider>
      </MomentsSessionBoundary>

      {tab !== 'moments' && <div data-moments-background="route"><ViewBoundary key={`${tab}:${lens}`}>
        {lens === 'broadcast' && tab === 'fixtures' && <TickerStrip />}

        <StalenessBanner />

        {tab === 'table' ? <TablePage /> : <FixturesPage today={today} lens={lens} />}
      </ViewBoundary></div>}
    </div>
  )
}

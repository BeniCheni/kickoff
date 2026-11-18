import { useRef, type ReactNode } from 'react'
import type { Lens } from '../lib/lens'
import type { Tab } from '../lib/urlCodecs'
import { useBandHeight } from '../lib/useBandHeight'
import { LensSwitcher } from './LensSwitcher'
import { MotionControl } from './MotionControl'
import { Glyph, PlusFive } from './glyphs'
import { ProvenanceLine } from './ProvenanceLine'
import { TabNav } from './TabNav'

/** Black on Poster, Table and Moments. The Ledger band is paper stock on the
 *  typescript ground: the stock axis has paper and black, and paper is what
 *  restores the Ledger's voices under the nearest-stock rule. */
export function bandStock(tab: Tab, lens: Lens): 'black' | 'paper' {
  if (tab === 'table' || tab === 'moments') return 'black'
  return lens === 'ledger' ? 'paper' : 'black'
}

export function ImprintBand({
  version,
  tab,
  lens,
  tabs,
  onSelectTab,
  onSelectLens,
  themeLabel,
  onToggleTheme,
  motionLabel,
  onToggleMotion,
}: {
  version: string
  tab: Tab
  lens: Lens
  tabs?: ReadonlyArray<{ key: Tab; label: string }>
  onSelectTab: (tab: Tab) => void
  onSelectLens: (lens: Lens) => void
  themeLabel: ReactNode
  onToggleTheme: () => void
  motionLabel: ReactNode
  onToggleMotion: () => void
}) {
  const stock = bandStock(tab, lens)
  // The band is pinned. What pins below it reads the height measured here.
  const band = useRef<HTMLElement>(null)
  useBandHeight(band)
  return (
    <header
      ref={band}
      className="imprint-band"
      data-stock={stock}
      data-ground={stock === 'paper' ? 'typescript' : 'black'}
      data-moments-background="header"
    >
      <div className="imprint-controls" data-imprint-row="controls">
        <div className="wordmark">
          <span className="wordmark-name">Kickoff</span>
          <span className="wordmark-strap" data-voice="pitch">Brooklyn · ET</span>
        </div>
        <div className="imprint-tools">
          <MotionControl label={motionLabel} onToggle={onToggleMotion} />
          <button type="button" className="imprint-hit theme-toggle" onClick={onToggleTheme}>
            <span className="theme-disc" aria-hidden="true"><Glyph name="moon" /></span>
            <span className="imprint-name">{themeLabel}</span>
          </button>
          <LensSwitcher lens={lens} onSelect={onSelectLens} />
          <PlusFive />
        </div>
      </div>
      <TabNav tab={tab} onSelect={onSelectTab} tabs={tabs} />
      <ProvenanceLine version={version} />
    </header>
  )
}

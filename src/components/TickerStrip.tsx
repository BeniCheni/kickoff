import { useMemo, useState } from 'react'
import { FIXTURES } from '../lib/fixtures'
import { todayIso } from '../lib/time'
import { tickerSegments, type TickerSegment } from '../lib/lensSelectors'

function Track({ segments, decorative }: { segments: TickerSegment[]; decorative?: boolean }) {
  return (
    <span className="pr-8" aria-hidden={decorative || undefined}>
      {segments.map((s, i) => (
        <span key={i}>
          {i > 0 && ' · '}
          <span className="font-semibold text-floodlight">{s.keyword}</span> {s.text}
        </span>
      ))}
    </span>
  )
}

/**
 * Broadcast's hero: a full-bleed one-line marquee under the tab row — live fixtures, the
 * next kickoff and today's FT scores from the loaded snapshot, amber keywords in mono.
 * Two identical spans scroll −50% over 36s so the loop is seamless; hover or touch pauses
 * it, and reduced-motion renders it static. This plus the lens-switch timings is the
 * complete motion budget.
 */
export function TickerStrip() {
  const [paused, setPaused] = useState(false)
  const segments = useMemo(() => tickerSegments(FIXTURES, todayIso(), new Date().toISOString()), [])

  if (segments.length === 0) return null

  return (
    <div
      className="-mx-5 -mt-5 mb-5 overflow-hidden border-b border-line bg-surface py-[7px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className="ticker-track font-mono inline-flex text-[11px] font-medium whitespace-nowrap text-ink-secondary"
        style={paused ? { animationPlayState: 'paused' } : undefined}
      >
        <Track segments={segments} />
        <Track segments={segments} decorative />
      </div>
    </div>
  )
}

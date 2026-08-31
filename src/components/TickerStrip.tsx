import { useMemo, useState } from 'react'
import { FIXTURES } from '../lib/fixtures'
import { todayIso } from '../lib/time'
import { tickerSegments, type TickerSegment } from '../lib/lensSelectors'

function Track({ segments, decorative }: { segments: TickerSegment[]; decorative?: boolean }) {
  // min-w-full keeps the −50% loop seamless when the content is narrower than the strip.
  return (
    <span className="min-w-full pr-8" aria-hidden={decorative || undefined}>
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
 * Two identical spans scroll −50% over 36s so the loop is seamless. Mouse hover pauses
 * while it lasts; a touch tap and the ‖/› button toggle a pinned pause (the button is the
 * keyboard/AT mechanism WCAG 2.2.2 requires); reduced-motion renders it static. The
 * marquee, the lens-switch timings and the 150ms expansions are the complete motion budget.
 */
export function TickerStrip() {
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const segments = useMemo(() => tickerSegments(FIXTURES, todayIso(), new Date().toISOString()), [])

  if (segments.length === 0) return null

  const paused = hovered || pinned

  return (
    <div
      className="relative -mx-5 -mt-5 mb-5 overflow-hidden border-b border-line bg-surface py-[7px]"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      onPointerDown={(e) => {
        // A touch tap toggles the pause and stays paused — pause-while-held is useless
        // one-handed. Taps on the button are its own click's business.
        if (e.pointerType !== 'mouse' && !(e.target as Element).closest('button')) {
          setPinned((p) => !p)
        }
      }}
    >
      <div
        className="ticker-track font-mono inline-flex text-[11px] font-medium whitespace-nowrap text-ink-secondary"
        style={paused ? { animationPlayState: 'paused' } : undefined}
      >
        <Track segments={segments} />
        <Track segments={segments} decorative />
      </div>
      <button
        type="button"
        onClick={() => setPinned((p) => !p)}
        aria-pressed={pinned}
        aria-label={pinned ? 'Resume ticker' : 'Pause ticker'}
        className="font-mono absolute inset-y-0 right-0 cursor-pointer border-l border-line bg-surface px-2 text-[11px] text-ink-secondary"
      >
        <span aria-hidden>{pinned ? '›' : '‖'}</span>
      </button>
    </div>
  )
}

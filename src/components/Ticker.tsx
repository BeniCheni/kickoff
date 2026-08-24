import { COMPETITIONS } from '../lib/competitions'
import { fixtureTimes, brooklynDate, daysUntil, niceDate } from '../lib/time'
import type { Fixture } from '../lib/schema'

export function Ticker({ fixtures }: { fixtures: Fixture[] }) {
  if (!fixtures.length) {
    return <div className="mb-6 text-[12px] text-ink-muted">No upcoming fixtures match your filters.</div>
  }
  return (
    <div className="mb-6 flex gap-2.5 overflow-x-auto pb-1">
      {fixtures.map((f) => {
        const comp = COMPETITIONS[f.competition]
        const date = brooklynDate(f.kickoffUtc)
        const days = daysUntil(date)
        const t = fixtureTimes(f.kickoffUtc, f.venueTz)
        const marquee = comp.group !== 'domestic'
        return (
          <div
            key={f.id}
            className={[
              'w-[200px] shrink-0 rounded p-3.5 text-[#F7F5EE]',
              marquee ? 'bg-gradient-to-br from-[#3A2A6B] to-[#241A47]' : 'bg-pitch-deep',
            ].join(' ')}
          >
            <div className="font-display text-[20px] leading-none font-bold text-floodlight">
              {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
            </div>
            <div className="mb-2 text-[10px] tracking-wide text-[#B9CFC0] uppercase">{niceDate(date)}</div>
            <div className="text-[13px] leading-snug font-medium">
              {f.home.name} vs {f.away.name}
            </div>
            <div className="mt-1.5 text-[10px] tracking-wide uppercase" style={{ color: comp.color }}>
              {comp.flag} {comp.name}
            </div>
            <div className="mt-1.5 border-t border-white/20 pt-1.5 text-[10.5px] text-[#DCE8DF]">
              {f.timeConfidence === 'exact' ? (
                <>
                  {t.local.time} local &middot; <b className="text-white">{t.brooklyn.time} {t.abbrev}</b>
                </>
              ) : (
                <i>kickoff time TBC</i>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

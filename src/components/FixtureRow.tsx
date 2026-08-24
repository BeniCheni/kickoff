import { COMPETITIONS } from '../lib/competitions'
import { fixtureTimes } from '../lib/time'
import type { Fixture } from '../lib/schema'

const STATUS_LABEL: Record<Fixture['status'], string | null> = {
  scheduled: null,
  in_play: 'LIVE',
  full_time: 'FT',
  postponed: 'POSTPONED',
  cancelled: 'CANCELLED',
}

/**
 * One fixture. Both clocks are derived from the stored UTC instant, so the stadium-local
 * time and the Brooklyn time cannot disagree — and a kickoff whose time the league has not
 * actually set is rendered as "time TBC" rather than as a confident number.
 */
export function FixtureRow({ fixture }: { fixture: Fixture }) {
  const comp = COMPETITIONS[fixture.competition]
  const t = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
  const marquee = comp.group !== 'domestic'
  const status = STATUS_LABEL[fixture.status]
  const unsettled = fixture.status === 'postponed' || fixture.status === 'cancelled'
  const placeholder = fixture.timeConfidence !== 'exact'

  return (
    <div
      className={[
        'mt-2 rounded border-l-3 bg-surface-alt px-3 py-2.5',
        unsettled ? 'border-l-accent' : marquee ? 'border-l-floodlight' : 'border-l-transparent',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[13.5px] font-semibold">
          {fixture.home.name} <span className="text-[12px] font-normal text-ink-muted">vs</span>{' '}
          {fixture.away.name}
        </span>
        {fixture.result && (
          <span className="font-display text-[13px] font-semibold text-pitch">
            {fixture.result.home}–{fixture.result.away}
          </span>
        )}
        {status && (
          <span
            className={[
              'rounded px-1.5 py-px text-[9px] font-bold tracking-wide uppercase',
              fixture.status === 'in_play'
                ? 'bg-accent text-white'
                : unsettled
                  ? 'bg-accent/15 text-accent'
                  : 'bg-line text-ink-muted',
            ].join(' ')}
          >
            {status}
          </span>
        )}
      </div>

      <div className="mt-1 text-[11px] text-ink-secondary">
        <span style={{ color: comp.color }}>
          {comp.flag} {comp.name}
        </span>
        {fixture.venue && <> &middot; {fixture.venue}</>}
      </div>

      {placeholder ? (
        <div className="mt-1.5 text-[11px] text-floodlight italic">
          {t.brooklyn.weekday} {t.brooklyn.isoDate} &mdash; kickoff time not yet set by the league
        </div>
      ) : (
        <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-ink-secondary">
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-0.5">
            {comp.flag} {t.local.time} local
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-pitch bg-surface px-2 py-0.5 font-semibold text-pitch">
            🗽 {t.brooklyn.time} {t.abbrev}
            {t.dayDelta !== 0 && (
              <span className="font-normal">
                ({t.brooklyn.weekday}, {t.dayDelta === -1 ? 'prev.' : 'next'} day)
              </span>
            )}
          </span>
        </div>
      )}

      {fixture.note && (
        <div className="mt-1.5 text-[10.5px] text-ink-muted">{fixture.note}</div>
      )}

      <div className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[10.5px] text-ink-secondary">
        📺 {comp.tv}
        {comp.tvNew && (
          <span className="rounded bg-pitch px-1 py-px text-[8.5px] font-bold text-white">NEW</span>
        )}
      </div>
    </div>
  )
}

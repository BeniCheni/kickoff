import { useState } from 'react'
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
 * One fixture as a ledger row on hairlines: leading Brooklyn time in mono, teams, score,
 * status pill; competition + venue as a muted meta line. Tapping expands the detail line —
 * both clock pills (stadium-local and Brooklyn, derived from one UTC instant so they cannot
 * disagree), the note and the TV pill. A kickoff whose time the league has not actually set
 * is rendered as "time not yet set" rather than as a confident number.
 *
 * Lens deltas (Poster's 20px time, Broadcast's tighter mono) are pure CSS variants — the
 * component takes no lens prop. `hot` marks the LIVE/next-kickoff rows whose glow only
 * renders under the Broadcast lens.
 */
export function FixtureRow({ fixture, hot = false }: { fixture: Fixture; hot?: boolean }) {
  const comp = COMPETITIONS[fixture.competition]
  const t = fixtureTimes(fixture.kickoffUtc, fixture.venueTz)
  const marquee = comp.group !== 'domestic'
  const status = STATUS_LABEL[fixture.status]
  const unsettled = fixture.status === 'postponed' || fixture.status === 'cancelled'
  const placeholder = fixture.timeConfidence !== 'exact'
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      data-hot={hot ? 'true' : undefined}
      className="relative border-b border-line py-2 pl-[9px] broadcast:rounded-[2px] broadcast:py-[7px] broadcast:pr-1 broadcast:pl-[6px]"
    >
      {(marquee || unsettled) && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: unsettled ? 'var(--accent)' : comp.color }}
        />
      )}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="block w-full cursor-pointer text-left"
      >
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-mono min-w-[58px] text-[13px] font-medium text-ink-secondary poster:min-w-[82px] poster:text-[20px] poster:font-semibold poster:text-ink broadcast:font-semibold">
            {placeholder ? '—' : t.brooklyn.time}
          </span>
          <span className="text-[13.5px] font-semibold broadcast:text-[13px]">
            {fixture.home.name}{' '}
            <span className="text-[12px] font-normal text-ink-muted">vs</span>{' '}
            {fixture.away.name}
          </span>
          {fixture.result && (
            <span className="font-mono text-[13px] font-semibold text-pitch">
              {fixture.result.home}–{fixture.result.away}
            </span>
          )}
          {status && (
            <span
              className={[
                'rounded px-1.5 py-px text-[9px] font-bold tracking-wide uppercase',
                fixture.status === 'in_play'
                  ? 'bg-accent text-white broadcast:bg-floodlight broadcast:text-bg'
                  : unsettled
                    ? 'bg-accent/15 text-accent'
                    : 'bg-line text-ink-muted',
              ].join(' ')}
            >
              {status}
            </span>
          )}
        </div>

        <div className="mt-0.5 pl-[66px] text-[11px] text-ink-muted poster:pl-[92px] broadcast:font-mono broadcast:text-[10.5px] broadcast:font-medium">
          <span style={{ color: comp.color }}>
            {comp.flag} {comp.name}
          </span>
          {fixture.venue && <> &middot; {fixture.venue}</>}
        </div>

        {placeholder && (
          <div className="mt-0.5 pl-[66px] text-[11px] text-floodlight italic poster:pl-[92px]">
            {t.brooklyn.weekday} {t.brooklyn.isoDate} &mdash; kickoff time not yet set by the league
          </div>
        )}
      </button>

      <div
        className={[
          'grid transition-[grid-template-rows] duration-150 ease-out motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-1.5 pl-[66px] poster:pl-[92px]">
            {!placeholder && (
              <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-ink-secondary">
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
        </div>
      </div>
    </div>
  )
}

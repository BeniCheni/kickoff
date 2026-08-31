import { weekdayShort } from '../lib/time'
import { FixtureRow } from './FixtureRow'
import type { DayInfo } from '../lib/lensSelectors'

const EMPTY: ReadonlySet<string> = new Set()

/**
 * The Ledger date spine — the Table's quiet language extended to fixtures. A 56px margin
 * column carries the weekday cap and a 30px Oswald day numeral; rows sit on hairlines in
 * the second column. Empty days collapse to a single hairline with a mono em-dash (or a
 * "hidden by filters" note). Broadcast reuses this skeleton wholesale: its amber numerals,
 * tighter rows and glow are CSS-only (`broadcast:` variants and `data-hot`).
 */
export function LedgerWeek({ days, hot = EMPTY }: { days: DayInfo[]; hot?: ReadonlySet<string> }) {
  return (
    <div>
      {days.map(({ date, shown, total, isToday }) => {
        const numeral = Number(date.slice(8))

        if (shown.length === 0) {
          return (
            <section
              key={date}
              className="mt-3.5 grid grid-cols-[56px_1fr] items-baseline gap-x-3"
            >
              <div className="flex items-baseline gap-1.5">
                <span className="label-caps text-[10px] text-ink-muted">{weekdayShort(date)}</span>
                <span className="font-display text-[16px] font-semibold text-ink-muted">{numeral}</span>
              </div>
              <div className="font-mono border-b border-line py-1.5 text-[11px] font-medium text-ink-muted">
                {total > 0 ? <>🔎 {total} hidden by filters</> : '—'}
              </div>
            </section>
          )
        }

        return (
          <section key={date} className="mt-5 grid grid-cols-[56px_1fr] gap-x-3">
            <div>
              <div className="label-caps text-[10px] text-ink-muted">{weekdayShort(date)}</div>
              <div
                className={[
                  'font-display mt-0.5 text-[30px] leading-none font-semibold',
                  isToday ? 'text-accent-lead-strong' : 'text-ink broadcast:text-accent-lead-strong',
                ].join(' ')}
              >
                {numeral}
              </div>
              {isToday && (
                <span className="font-display mt-1.5 inline-block rounded-full bg-accent-lead px-[7px] py-[2px] text-[8.5px] font-semibold tracking-[0.1em] text-on-accent-lead uppercase">
                  Today
                </span>
              )}
            </div>
            <div className="border-t border-line">
              {shown.map((f) => (
                <FixtureRow key={f.id} fixture={f} hot={hot.has(f.id)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

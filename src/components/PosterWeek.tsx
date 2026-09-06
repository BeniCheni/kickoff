import { COMPETITIONS } from '../lib/competitions'
import { posterDayTitle, weekdayShort } from '../lib/time'
import { posterSubLine, type PosterBlock } from '../lib/lensSelectors'
import { FixtureRow } from './FixtureRow'

function TodayPill() {
  return (
    <span className="font-display inline-block rounded-full bg-accent-lead px-[7px] py-[2px] text-[8.5px] font-semibold tracking-[0.1em] text-on-accent-lead uppercase">
      Today
    </span>
  )
}

/**
 * Poster's week: loudness proportional to the slate. Big days (3+ shown matches) get the
 * full-bleed duotone header railed in the day's dominant competition colour; light days
 * an inline header; consecutive empty days merge into one hairline line. Rows stay Ledger
 * rows — only the leading time grows (a `poster:` variant inside FixtureRow).
 */
export function PosterWeek({ blocks }: { blocks: PosterBlock[] }) {
  return (
    <div>
      {blocks.map((block) => {
        if (block.kind === 'gap') {
          const label = block.dates
            .map((d) => `${weekdayShort(d)} ${Number(d.slice(8))}`)
            .join(' · ')
          return (
            <div
              key={block.dates[0]}
              className="font-mono mt-3.5 border-b border-line py-1.5 text-[11px] font-medium text-ink-muted uppercase"
            >
              {label} — no fixtures
              {block.hiddenTotal > 0 && (
                <>
                  {' '}
                  · <span aria-hidden>🔎</span> {block.hiddenTotal} hidden by filters
                </>
              )}
            </div>
          )
        }

        if (block.kind === 'big') {
          return (
            <section key={block.date}>
              <div
                className="-mx-5 mt-[22px] border-l-[12px] bg-surface-alt py-3 pr-5 pl-4"
                style={{ borderLeftColor: COMPETITIONS[block.dominant].color }}
              >
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span
                    className={[
                      'font-display leading-none font-bold uppercase',
                      block.isToday ? 'text-[44px]' : 'text-[28px]',
                    ].join(' ')}
                  >
                    {posterDayTitle(block.date)}
                  </span>
                  {block.isToday && <TodayPill />}
                </div>
                <div className="font-mono mt-1.5 text-[11px] font-medium tracking-[0.06em] text-ink-secondary">
                  {posterSubLine(block.fixtures)}
                </div>
              </div>
              <div className="mt-2.5 border-t border-line">
                {block.fixtures.map((f) => (
                  <FixtureRow key={f.id} fixture={f} />
                ))}
              </div>
            </section>
          )
        }

        return (
          <section key={block.date}>
            <div className="mt-[18px] flex items-baseline gap-2.5">
              <span className="font-display text-[16px] font-semibold tracking-[0.06em] uppercase">
                {posterDayTitle(block.date)}
              </span>
              <span className="font-mono text-[10px] font-medium tracking-[0.06em] text-ink-muted">
                {block.fixtures.length} {block.fixtures.length === 1 ? 'MATCH' : 'MATCHES'}
              </span>
              {block.isToday && <TodayPill />}
            </div>
            <div className="mt-1.5 border-t border-line">
              {block.fixtures.map((f) => (
                <FixtureRow key={f.id} fixture={f} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

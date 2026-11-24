import { PosterPart } from './PosterPart'
import { posterDayTitle, weekdayShort } from '../lib/time'
import { isFinal, type PosterBlock } from '../lib/lensSelectors'
import { FixtureRows } from './FixtureRow'
import { MatchdayLines } from './MatchdayLines'

const EMPTY: ReadonlySet<string> = new Set()

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
 * an inline header; consecutive empty days merge into one hairline line. Its fixture list uses the contents layout.
 */
export function PosterWeek({ blocks, stale = EMPTY, next, nowUtcIso }: { blocks: PosterBlock[]; next?: string | null; nowUtcIso?: string; stale?: ReadonlySet<string> }) {
  let part = 0
  return (
    <div className="poster-week">
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
            </div>
          )
        }

        if (block.fixtures.length) {
          return <PosterPart key={block.date} date={block.date} shown={block.fixtures} hidden={block.hidden ?? 0}
            part={++part} closed={block.closed ?? (!block.hidden && block.fixtures.every(isFinal))}
            next={next} stale={stale} nowUtcIso={nowUtcIso} />
        }

        return (
          <section key={block.date} data-week-date={block.date}>
            <div className="mt-[18px] flex flex-wrap items-baseline gap-2.5">
              <span className="font-display text-[16px] font-semibold tracking-[0.06em] uppercase">
                {posterDayTitle(block.date)}
              </span>
              <span className="font-mono text-[10px] font-medium tracking-[0.06em] text-ink-muted">
                {block.fixtures.length} {block.fixtures.length === 1 ? 'MATCH' : 'MATCHES'}
              </span>
              {!!block.hidden && <p className="week-hidden basis-full">{block.hidden} hidden by filters</p>}
              <MatchdayLines fixtures={block.fixtures.slice(0, 1)} />
              {block.isToday && <TodayPill />}
            </div>
            <div className="mt-1.5 border-t border-line">
              <FixtureRows fixtures={block.fixtures} lens="poster" next={next} nowUtcIso={nowUtcIso} stale={stale} />
            </div>
          </section>
        )
      })}
    </div>
  )
}

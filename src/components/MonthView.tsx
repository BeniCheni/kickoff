import { useMemo, useState } from 'react'
import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { addDays, startOfWeek, niceDate } from '../lib/time'
import { FIXTURES, fixturesOn } from '../lib/fixtures'
import { hotFixtureIds, monthCellSummary } from '../lib/lensSelectors'
import { FixtureRow } from './FixtureRow'

/**
 * The month grid is the navigation, not decoration: each cell shows its match count and
 * up to three competition-coloured bars (⭐ marks a marquee day), and selecting a cell
 * reveals that day's rows — in the current lens's row style — beneath the grid. The
 * parent keys this component by month so selection resets on navigation.
 */
export function MonthView({
  monthStart,
  active,
  today,
}: {
  monthStart: string
  active: ReadonlySet<CompetitionKey>
  today: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const hot = useMemo(() => hotFixtureIds(FIXTURES, new Date().toISOString()), [])

  const month = monthStart.slice(0, 7)
  const gridStart = startOfWeek(monthStart)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7)).filter((week) =>
    week.some((d) => d.slice(0, 7) === month),
  )

  const selectedList = selected ? fixturesOn(selected, active) : []
  const open = selected !== null && selectedList.length > 0

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="py-1 text-center text-[10.5px] text-ink-muted uppercase">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date) => {
          const inMonth = date.slice(0, 7) === month
          const list = inMonth ? fixturesOn(date, active) : []
          const numeral = Number(date.slice(8))
          const frame = [
            'flex aspect-square flex-col rounded border p-1 text-left',
            date === selected
              ? 'border-accent-lead ring-1 ring-accent-lead'
              : date === today
                ? 'border-accent-lead ring-1 ring-accent-lead/40'
                : list.length
                  ? 'border-line-strong'
                  : 'border-line',
            inMonth ? 'bg-surface' : 'bg-surface opacity-35',
          ].join(' ')

          if (list.length === 0) {
            return (
              <div key={date} className={frame}>
                <div className="text-[10.5px] text-ink-muted">{numeral}</div>
              </div>
            )
          }

          const cell = monthCellSummary(list)
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelected((s) => (s === date ? null : date))}
              aria-expanded={date === selected}
              aria-label={`${niceDate(date)}, ${cell.count} ${cell.count === 1 ? 'match' : 'matches'}`}
              className={`${frame} cursor-pointer`}
            >
              <div className="flex items-start justify-between text-[10.5px] text-ink-secondary">
                {numeral}
                {cell.marquee && <span className="text-[8px] leading-[1.4]">⭐</span>}
              </div>
              <div className="font-mono mt-auto text-[11px] font-semibold">{cell.count}</div>
              <div className="mt-0.5 flex gap-0.5">
                {cell.bars.map((c) => (
                  <span
                    key={c}
                    title={COMPETITIONS[c].name}
                    className="h-[3px] flex-1 rounded-full"
                    style={{ background: COMPETITIONS[c].color }}
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div
        className={[
          'grid transition-[grid-template-rows] duration-150 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="min-h-0 overflow-hidden">
          {selected !== null && selectedList.length > 0 && (
            <div className="pt-4">
              <div className="text-[12px] text-ink-secondary">{niceDate(selected)}</div>
              <div className="mt-1 border-t border-line">
                {selectedList.map((f) => (
                  <FixtureRow key={f.id} fixture={f} hot={hot.has(f.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

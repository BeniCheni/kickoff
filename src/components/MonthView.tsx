import { useMemo, useState } from 'react'
import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { addDays, startOfWeek, niceDate } from '../lib/time'
import { FIXTURES, fixturesOn, totalOn } from '../lib/fixtures'
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
  // A selection whose fixtures the filters have since hidden is no selection at all —
  // frame, aria-expanded and panel must all agree on that.
  const activeSelection = selectedList.length > 0 ? selected : null
  const open = activeSelection !== null

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
          (name) => (
            <div key={name} className="py-1 text-center text-[10.5px] text-ink-muted uppercase">
              <span aria-hidden>{name[0]}</span>
              <span className="sr-only">{name}</span>
            </div>
          ),
        )}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date) => {
          const inMonth = date.slice(0, 7) === month
          const list = inMonth ? fixturesOn(date, active) : []
          const numeral = Number(date.slice(8))
          const frame = [
            'flex aspect-square flex-col rounded border p-1 text-left',
            date === activeSelection
              ? 'border-accent-lead-strong ring-1 ring-accent-lead-strong'
              : date === today
                ? 'border-accent-lead-strong ring-1 ring-accent-lead-strong/40'
                : list.length
                  ? 'border-line-strong'
                  : 'border-line',
            inMonth ? 'bg-surface' : 'bg-surface opacity-35',
          ].join(' ')

          if (list.length === 0) {
            // "Hidden by filters" and "nothing on" are different truths — the week views
            // already say so; the grid must not flatten them into the same blank cell.
            const hidden = inMonth ? totalOn(date) : 0
            return (
              <div key={date} className={frame}>
                <div className="text-[10.5px] text-ink-muted">{numeral}</div>
                {hidden > 0 && (
                  <div className="mt-auto text-[8px] leading-none text-ink-muted">
                    <span aria-hidden>🔎</span>
                    <span className="sr-only">
                      {hidden} hidden by filters
                    </span>
                  </div>
                )}
              </div>
            )
          }

          const cell = monthCellSummary(list)
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelected((s) => (s === date ? null : date))}
              aria-expanded={date === activeSelection}
              aria-controls="month-day-panel"
              aria-label={[
                `${niceDate(date)}, ${cell.count} ${cell.count === 1 ? 'match' : 'matches'}`,
                cell.bars.map((c) => COMPETITIONS[c].name).join(', '),
              ].join(': ')}
              className={`${frame} cursor-pointer`}
            >
              <span className="flex items-start justify-between text-[10.5px] text-ink-secondary">
                {numeral}
                {cell.marquee && (
                  <span aria-hidden className="text-[8px] leading-[1.4]">
                    ⭐
                  </span>
                )}
              </span>
              <span className="font-mono mt-auto block text-[11px] font-semibold">{cell.count}</span>
              <span className="mt-0.5 flex gap-0.5">
                {cell.bars.map((c) => (
                  <span
                    key={c}
                    title={COMPETITIONS[c].name}
                    className="h-[3px] flex-1 rounded-full"
                    style={{ background: COMPETITIONS[c].color }}
                  />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      <div
        id="month-day-panel"
        className={[
          'grid transition-[grid-template-rows] duration-150 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="min-h-0 overflow-hidden">
          {activeSelection !== null && (
            <div className="pt-4">
              <div className="text-[12px] text-ink-secondary">{niceDate(activeSelection)}</div>
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

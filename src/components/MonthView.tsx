import { COMPETITIONS, type CompetitionKey } from '../lib/competitions'
import { addDays, startOfWeek, niceDate } from '../lib/time'
import { fixturesOn } from '../lib/fixtures'
import { FixtureRow } from './FixtureRow'

export function MonthView({
  monthStart,
  active,
  today,
}: {
  monthStart: string
  active: ReadonlySet<CompetitionKey>
  today: string
}) {
  const month = monthStart.slice(0, 7)
  const gridStart = startOfWeek(monthStart)
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
  const weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7)).filter((week) =>
    week.some((d) => d.slice(0, 7) === month),
  )

  const daysWithFixtures = cells.filter(
    (d) => d.slice(0, 7) === month && fixturesOn(d, active).length > 0,
  )

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
          const comps = [...new Set(list.map((f) => f.competition))]
          return (
            <div
              key={date}
              className={[
                'flex aspect-square flex-col rounded border p-1',
                date === today ? 'border-pitch ring-1 ring-pitch/40' : list.length ? 'border-pitch/60' : 'border-line',
                inMonth ? 'bg-surface' : 'bg-surface opacity-35',
              ].join(' ')}
            >
              <div className="text-[10.5px] text-ink-secondary">{Number(date.slice(8))}</div>
              <div className="mt-auto flex flex-wrap gap-0.5">
                {comps.map((c) => (
                  <span
                    key={c}
                    title={COMPETITIONS[c].name}
                    className="inline-block size-[5px] rounded-full"
                    style={{ background: COMPETITIONS[c].color }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="label-caps mt-6 border-t-[1.5px] border-line pt-4 text-[13px]">
        Matches this month
      </div>
      {daysWithFixtures.length === 0 ? (
        <div className="mt-2 text-[13px] text-ink-muted">
          Nothing scheduled this month for your current filters.
        </div>
      ) : (
        daysWithFixtures.map((date) => (
          <div key={date}>
            <div className="mt-3.5 mb-0.5 text-[12px] text-ink-secondary">{niceDate(date)}</div>
            {fixturesOn(date, active).map((f) => (
              <FixtureRow key={f.id} fixture={f} />
            ))}
          </div>
        ))
      )}
    </div>
  )
}

import { useId, useState } from 'react'
import { bookCalendar, weekdayShort } from '../lib/time'
import { matchCount } from '../lib/lensSelectors'
import type { Fixture } from '../lib/schema'
import { BookDateLine } from './BookDateLine'
import { FixtureRows } from './FixtureRow'
import { MatchdayLines } from './MatchdayLines'

const parts = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN']

export function PosterPart({ date, shown, hidden, closed, part, next, nowUtcIso, stale }: {
  date: string; shown: Fixture[]; hidden: number; closed: boolean; part: number
  next?: string | null; nowUtcIso?: string; stale?: ReadonlySet<string>
}) {
  const [open, setOpen] = useState(false)
  const panel = useId()
  const extra = shown.length >= 6 ? shown.length - 4 : 0
  const first = extra ? shown.slice(0, 4) : shown
  const rowProps = { lens: 'poster' as const, next, nowUtcIso, stale }
  return <section className="poster-part" data-week-date={date}>
    <header>
      <div className="part-plate" data-stock="black">
        <span>PART {parts[part - 1]}</span>
        <h2>{bookCalendar(date).weekday}</h2>
      </div>
      <div className="part-date">
        <BookDateLine date={date} shown={shown} closed={closed} />
        {!!hidden && <p className="week-hidden">{hidden} hidden by filters</p>}
      </div>
      <MatchdayLines fixtures={first.slice(0, 1)} />
    </header>
    <FixtureRows fixtures={first} {...rowProps} />
    {extra > 0 && <>
      <button className="more-stories" type="button" aria-expanded={open} aria-controls={panel} onClick={() => setOpen(!open)}>
        <em>More stories</em>{' · '}<span>{matchCount(extra)} · {weekdayShort(date).toUpperCase()} · {open ? 'HIDE' : 'SHOW'}</span>
      </button>
      <div id={panel} className="more-rows" data-open={open}>
        {open && <div><FixtureRows fixtures={shown.slice(4)} preceding={first} {...rowProps} /></div>}
      </div>
    </>}
  </section>
}

import { COMPETITIONS } from '../lib/competitions'
import { MOMENTS, MOMENT_CATEGORIES, type Moment } from '../lib/moments'
import { fixtureTimes, niceDate, syncStamp } from '../lib/time'

const CATEGORY_LABELS = { prematch: 'Pre-match', highlights: 'Highlights', celebrations: 'Celebrations' }

function MomentCard({ moment }: { moment: Moment }) {
  const { fixture: f, still } = moment
  const comp = COMPETITIONS[f.competition]
  const times = fixtureTimes(f.kickoffUtc, f.venueTz)
  const clockKnown = f.timeConfidence === 'exact' && f.status !== 'postponed' && f.status !== 'cancelled'
  return (
    <article data-moment-card className="overflow-hidden rounded border border-line bg-surface">
      <div data-moment-frame className="relative aspect-video bg-media">
        {/* Cover is the design default; the letterbox tolerance remains decision (e). */}
        {still && <img src={still.url} alt="" loading="lazy" className="h-full w-full object-cover" />}
        <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: comp.color }} />
      </div>
      <div className="space-y-2 p-3">
        <h3 className="text-[13.5px] font-semibold break-words">{moment.title}</h3>
        <div className="space-y-1 text-[11px] text-ink-muted">
          <p>{f.home.name} v {f.away.name} · {comp.name}</p>
          <p>{niceDate(times.brooklyn.isoDate)} · Brooklyn date</p>
          {clockKnown ? <p className="flex flex-wrap gap-x-2 gap-y-1">
            <span className={times.local ? '' : 'font-mono text-[10px] font-medium text-floodlight-strong'}>
              {times.local ? `${times.local.time} local` : 'local time not known'}
            </span>
            <span>🗽 {times.brooklyn.time} {times.abbrev}{times.dayDelta ? ` (${times.brooklyn.weekday}, ${times.dayDelta < 0 ? 'prev.' : 'next'} day)` : ''}</span>
          </p> : <p className="font-mono text-[10px] font-medium text-floodlight-strong">Kickoff time not confirmed at curation</p>}
          {still && <p>Still: {still.credit}</p>}
        </div>
        <p className="font-mono text-[10px] font-medium text-floodlight-strong">{moment.source.name} · curated {syncStamp(moment.curatedAt)}</p>
        <a href={moment.source.url} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full border-[1.5px] border-pitch px-[9px] py-[3px] text-[10.5px] font-semibold text-pitch">
          Open at {moment.source.name} <span aria-hidden>↗</span><span className="sr-only"> (new tab)</span>
        </a>
      </div>
    </article>
  )
}

export function MomentsPage() {
  const latest = MOMENTS.reduce<string | null>((stamp, m) => !stamp || Date.parse(m.curatedAt) > Date.parse(stamp) ? m.curatedAt : stamp, null)
  return (
    <main aria-label="Moments">
      <div className="rounded-[5px] border border-line border-l-3 border-l-floodlight bg-floodlight-bg px-2.5 py-2">
        <p className="label-caps text-[9.5px] text-floodlight-strong">Hand-curated · linked to rights holders · never played here</p>
        {latest && <p className="mt-1 font-mono text-[10px] font-medium text-floodlight-strong">Last curated {syncStamp(latest)}</p>}
      </div>
      {MOMENTS.length === 0 && <p className="mt-5 text-[13px] text-ink-muted">No moments curated yet.</p>}
      {MOMENT_CATEGORIES.map(category => {
        const moments = MOMENTS.filter(m => m.category === category)
        return moments.length ? <section key={category} aria-labelledby={`moments-${category}`} className="mt-6">
          <h2 id={`moments-${category}`} className="label-caps mb-3 text-[15px]">{CATEGORY_LABELS[category]}</h2>
          <div className="grid gap-3 md:grid-cols-2">{moments.map(moment => <MomentCard key={moment.id} moment={moment} />)}</div>
        </section> : null
      })}
    </main>
  )
}

import { Fragment, useId, useRef } from 'react'
import { COMPETITIONS } from '../lib/competitions'
import { MOMENT_CATEGORIES, latestKnownAvailability } from '../lib/moments'
import { ALL_MOMENTS, knownKickoff, momentNote, momentTitle, type GalleryMoment } from '../lib/momentsGallery'
import { eligibleIds, queueIds, queueNeighbours } from '../lib/momentsQueue'
import { fixtureTimes, niceDate, syncStamp } from '../lib/time'
import { MomentCover } from './MomentCover'
import { PlaybackActions, SourceLink } from './MomentsPlayback'
import { MomentsSessionProvider, useMomentsSession } from './MomentsSessionProvider'

const CATEGORY_LABELS = { prematch: 'Pre-match', highlights: 'Highlights', celebrations: 'Celebrations' }

function MomentFacts({ moment }: { moment: GalleryMoment }) {
  if (!moment.fixture) return <p className="moments-facts">{moment.illustration.label}</p>
  const f = moment.fixture
  const times = fixtureTimes(f.kickoffUtc, f.venueTz)
  return <div className="moments-facts" data-facts>
    <p>{f.home.name} v {f.away.name} · {COMPETITIONS[f.competition].name}</p>
    <p>{niceDate(times.brooklyn.isoDate)} · Brooklyn date</p>
    {knownKickoff(moment) ? <p className="flex flex-wrap gap-x-2 gap-y-1">
      <span>{times.local ? `${times.local.time} local` : 'local time not known'}</span>
      <span>🗽 {times.brooklyn.time} {times.abbrev}{times.dayDelta ? ` (${times.brooklyn.weekday}, ${times.dayDelta < 0 ? 'prev.' : 'next'} day)` : ''}</span>
    </p> : <p>Kickoff time not confirmed at curation</p>}
  </div>
}

function SourceLine({ moment }: { moment: GalleryMoment }) {
  const session = useMomentsSession()!
  if (!moment.source) return null
  return <p className="moments-source" data-source-line>{moment.source.name}
    {moment.source.content && <> · {session.spoiler ? 'Source description hidden' : moment.source.content.description}</>}
  </p>
}

function Actions({ moment, target, onOpen, readNotice = false }: {
  moment: GalleryMoment; target: string; onOpen?: () => void; readNotice?: boolean
}) {
  const session = useMomentsSession()!
  const feedbackId = useId()
  const saved = session.queue.saved.includes(moment.id)
  const notice = session.notice?.target === target ? session.notice.text : ''
  const readWarning = readNotice && session.notice?.target === 'initial-read'
    ? 'Saved references could not be read. Changes are visit-only until a browser write succeeds.' : ''
  return <div className="moments-actions">
    <div className="moments-action-row">
      {onOpen ? <button className="moments-button moments-primary" data-primary-action onClick={onOpen}>Open selection <span aria-hidden="true">→</span></button>
        : <SourceLink moment={moment} primary />}
      <button className="moments-button moments-save" aria-label={`Save reference: ${momentTitle(moment, session.spoiler)}`}
        aria-pressed={saved} aria-describedby={feedbackId} data-save={moment.id}
        onClick={() => session.toggleSave(moment.id, target)}>Save reference</button>
    </div>
    <p className="moments-save-state">{saved ? 'Saved reference' : 'Not saved'}{session.saved.persistence === 'visit-only' ? ' · visit only' : ''}</p>
    <p id={feedbackId} role="status" aria-live="polite" className="moments-feedback">{notice || readWarning}</p>
  </div>
}

function Filters() {
  const session = useMomentsSession()!
  const filters = session.filters
  const competitions = [...new Set(session.edition.flatMap(m => m.fixture ? [m.fixture.competition] : []))]
  return <details className="moments-filters">
    <summary>Find your next moment <span>{eligibleIds(session.queue).length} / {session.edition.length}</span></summary>
    <div className="moments-filter-fields">
      <label>Competition<select aria-label="Competition" value={filters.competition}
        onChange={e => session.setFilters({ ...filters, competition: e.target.value })}>
        <option value="all">All competitions</option>
        {competitions.map(key => <option key={key} value={key}>{COMPETITIONS[key].name}</option>)}
      </select></label>
      <label>Category<select aria-label="Category" value={filters.category}
        onChange={e => session.setFilters({ ...filters, category: e.target.value })}>
        <option value="all">All categories</option>
        {MOMENT_CATEGORIES.map(key => <option key={key} value={key}>{CATEGORY_LABELS[key]}</option>)}
      </select></label>
      <label>Browse order<select aria-label="Browse order" value={session.queue.mode === 'custom' ? 'newest' : session.queue.mode}
        onChange={e => session.setOrder(e.target.value)}>
        <option value="editorial">Beni’s order</option><option value="newest">Newest fixture</option>
        {session.queue.mode === 'shuffle' && <option value="shuffle" disabled>Shuffled remainder</option>}
      </select></label>
      <label className="moments-check"><input type="checkbox" checked={filters.savedOnly}
        onChange={e => session.setFilters({ ...filters, savedOnly: e.target.checked })} />Saved only</label>
      <label className="moments-check"><input type="checkbox" checked={session.spoiler}
        onChange={e => session.setSpoiler(e.target.checked)} />Spoiler-light</label>
    </div>
    <p className="moments-small">Spoiler-light hides revealing titles, source descriptions, notes, evidence text and cover motifs here. Fixture identity, dates and source names stay visible. External source pages are outside this control and can reveal results.</p>
    <p className="moments-small">Newest uses confirmed fixture times, with editorial ties. Unconfirmed times follow in Beni’s order.</p>
  </details>
}

function OrderControls() {
  const session = useMomentsSession()!
  return <div className="moments-order-controls">
    <button className="moments-button" onClick={() => session.dispatch({ type: 'shuffle', seed: 'matchnight' })}>Shuffle remaining</button>
    <button className="moments-button" disabled={!session.queue.undo} onClick={() => session.dispatch({ type: 'undo' })}>Undo shuffle</button>
    <button className="moments-button" onClick={() => session.dispatch({ type: 'restore' })}>Restore Beni’s order</button>
    <p className="moments-small" data-order-label>{session.queue.mode === 'editorial' ? 'Beni’s order for the remainder'
      : session.queue.mode === 'custom' ? 'Newest fixture order · earlier visits kept' : 'Shuffled remainder · earlier visits kept'}</p>
  </div>
}

function NoResults({ onReturn }: { onReturn: () => void }) {
  const session = useMomentsSession()!
  return <div className="moments-empty">
    <h2>No selections match.</h2>
    <p>{session.queue.active ? 'Your active selection is kept, even outside these filters.' : 'No selection is active. Clear filters to browse this edition.'}</p>
    <button className="moments-button" onClick={() => session.setFilters(ALL_MOMENTS)}>Clear filters</button>
    {session.queue.active && <button className="moments-button" onClick={onReturn}>Return to selection</button>}
  </div>
}

export function MomentsQueueList({ onOpen }: { onOpen: (id: string) => void }) {
  const session = useMomentsSession()!
  const { edition, queue, spoiler } = session
  const available = new Set(eligibleIds(queue))
  const byId = new Map(edition.map(item => [item.id, item]))
  return <ol>{queueIds(queue).map((id, index) => {
    const item = byId.get(id)!
    return <li key={id}><button type="button" data-queue-id={id} data-visited={queue.history.includes(id)}
      aria-current={id === queue.active ? 'true' : undefined} onClick={() => onOpen(id)}>
      <span>{index + 1}</span><strong>{momentTitle(item, spoiler)}</strong>
      <small>{id === queue.active ? 'Active · ' : ''}{queue.history.includes(id) ? 'Opened' : 'Unvisited'}{!available.has(id) ? ' · outside current filters' : ''}</small>
    </button></li>
  })}</ol>
}

function Gallery() {
  const session = useMomentsSession()!
  const { edition, queue, spoiler } = session
  const selectedHeading = useRef<HTMLHeadingElement>(null)
  const galleryHeading = useRef<HTMLHeadingElement>(null)
  const mainId = useId()
  const available = new Set(eligibleIds(queue))
  const byId = new Map(edition.map(m => [m.id, m]))
  const ordered = queueIds(queue).flatMap(id => { const m = byId.get(id); return m && available.has(id) ? [m] : [] })
  const active = queue.active ? byId.get(queue.active) : undefined
  const selected = !!active && queue.surface !== 'gallery'
  const focusHeading = (ref: typeof selectedHeading) => requestAnimationFrame(() => {
    ref.current?.scrollIntoView({ block: 'start' }); ref.current?.focus({ preventScroll: true })
  })
  const open = (id: string) => { session.dispatch({ type: 'open', id }); focusHeading(selectedHeading) }
  const returnToSelection = () => { if (active) open(active.id) }
  const neighbours = queueNeighbours(queue)
  const observation = active?.source ? latestKnownAvailability(active.source.availability ?? []) : undefined
  return <main aria-label="Moments" className="moments-gallery" data-moments-gallery>
    {selected ? <>
      <div className="moments-stage-top">
        <button className="moments-button" onClick={() => { session.dispatch({ type: 'surface', surface: 'gallery' }); focusHeading(galleryHeading) }}>← Gallery</button>
        <span className="label-caps">Selected moment</span>
        <button type="button" className="moments-button" data-cinema-enter onClick={event => session.enterCinema(event.currentTarget)}>Enter Cinema</button>
      </div>
      <div className="moments-selected-heading">
        <h1 ref={selectedHeading} tabIndex={-1}>{momentTitle(active, spoiler)}</h1>
        <SourceLine moment={active} />
      </div>
      <div className="moments-stage-layout">
        <section className="moments-stage-main" aria-label="Selected reference">
          <div data-moments-stage-anchor className="moments-stage-anchor">
            <MomentCover moment={active} spoiler={spoiler} />
            {session.playerLive && <button type="button" className="sr-only" data-player-sentinel
              onFocus={event => session.focusPlayer(event.relatedTarget)}>Player</button>}
          </div>
          <MomentFacts moment={active} />
          <PlaybackActions moment={active} target="selected" readNotice
            nextTitle={neighbours.next ? momentTitle(byId.get(neighbours.next)!, spoiler) : null} />
          <p className="moments-note">{momentNote(active, spoiler)}</p>
          {active.source && <details className="moments-provenance">
            <summary>Source &amp; curation</summary>
            <p className="moments-small">{active.source.name} · curated {syncStamp(active.curatedAt!)}</p>
            {observation && <p className="moments-small">{spoiler ? 'Revealing source evidence is hidden.'
              : `Recorded ${syncStamp(observation.observedAt)}: ${observation.note}`}</p>}
            <p className="moments-small">Opening a selection or its source does not mark it watched.</p>
          </details>}
          <div className="moments-neighbours">
            {(['previous', 'next'] as const).map(direction => {
              const id = neighbours[direction]
              const target = id ? byId.get(id) : undefined
              const label = direction === 'previous' ? 'Previous' : 'Next'
              return <button key={direction} className="moments-button" disabled={!target}
                aria-label={target ? `${label}: ${momentTitle(target, spoiler)}` : label}
                onClick={() => { if (id) open(id) }}>{label}{target && <span className="moments-neighbour-title">{momentTitle(target, spoiler)}</span>}</button>
            })}
          </div>
        </section>
        <aside className="moments-queue" aria-label="Selection queue" data-moments-list>
          <h2>Your evening</h2>
          <Filters />
          {!ordered.length && <NoResults onReturn={returnToSelection} />}
          <MomentsQueueList onOpen={open} />
          <OrderControls />
          <p className="moments-small">History keeps only selections you opened, in first-open order. Skipped selections remain reorderable. Opened does not mean watched.</p>
        </aside>
      </div>
    </> : <>
      <header className="moments-edition-head">
        <div><p className="moments-eyebrow">Matchnight edition</p><h1 ref={galleryHeading} tabIndex={-1}>The noise stays.</h1></div>
        <p className="moments-small">{ordered.length} of {edition.length} selections<br />Selected, never exhaustive</p>
      </header>
      {!ordered.length && <NoResults onReturn={returnToSelection} />}
      <div className="moments-cards">{ordered.map((moment, index) => <Fragment key={moment.id}><article data-moment-card data-moment-id={moment.id}
        data-lead={index === 0 || undefined} className={`moments-card ${index === 0 ? 'moments-lead' : ''}`}>
        <MomentCover moment={moment} spoiler={spoiler} />
        <div className="moments-card-body">
          <p className="moments-eyebrow">{moment.category ? spoiler ? 'Selection' : CATEGORY_LABELS[moment.category] : moment.illustration.label}</p>
          {index === 0 ? <h2>{momentTitle(moment, spoiler)}</h2> : <h3>{momentTitle(moment, spoiler)}</h3>}
          <MomentFacts moment={moment} />
          <SourceLine moment={moment} />
          <p className="moments-note">{momentNote(moment, spoiler)}</p>
          <Actions moment={moment} target={`card-${moment.id}`} onOpen={() => open(moment.id)} readNotice={index === 0} />
          <SourceLink moment={moment} />
        </div>
      </article>{index === 0 && <div className="moments-browse-controls"><Filters /><OrderControls /></div>}</Fragment>)}</div>
      {active && ordered.length > 0 && <div className="moments-resume"><p>Your selection is kept: {momentTitle(active, spoiler)}{!available.has(active.id) ? ' · outside current filters' : ''}</p>
        <button className="moments-button" onClick={returnToSelection}>Return to selection</button></div>}
      {!ordered.length && <div className="moments-browse-controls" id={mainId}><Filters /><OrderControls /></div>}
    </>}
  </main>
}

export function MomentsPage() {
  const session = useMomentsSession()
  // Also usable by isolated component tests; App supplies the persistent owner.
  if (!session) return <MomentsSessionProvider><MomentsPage /></MomentsSessionProvider>
  // Keep this production-empty markup byte-for-byte equivalent to the pre-gallery route.
  if (session.edition.length === 0) return <main aria-label="Moments">
    <div className="rounded-[5px] border border-line border-l-3 border-l-floodlight bg-floodlight-bg px-2.5 py-2">
      <p className="label-caps text-[9.5px] text-floodlight-strong">Hand-curated · linked to rights holders · never played here</p>
    </div>
    <p className="mt-5 text-[13px] text-ink-muted">No moments curated yet.</p>
  </main>
  return <Gallery />
}

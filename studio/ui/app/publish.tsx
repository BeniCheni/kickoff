import { useEffect, useState } from 'react'
import { COPY } from '../../copy.ts'
import { DRAFT } from '../../shared/admin-copy.ts'
import type { JobView } from '../../shared/jobs.ts'
import { getJobs, getPublish, publishClip, recordGate, retryDelete, retryRemoval, unpublishClip, type PublishView } from './api.ts'

export function PublishCard({
  view,
  publicId,
  title,
  onPublicId,
  onTitle,
  gateAnswer,
  gateDisclosure,
  gateBy,
  gateSource,
  position,
  onGateAnswer,
  onGateDisclosure,
  onGateBy,
  onGateSource,
  onPosition,
  onGate,
  onPublish,
  onUnpublish,
  onRetryDelete,
  onRetryRemoval,
}: {
  view: PublishView
  publicId: string
  title: string
  onPublicId: (value: string) => void
  onTitle: (value: string) => void
  gateAnswer: string
  gateDisclosure: string
  gateBy: string
  gateSource: string
  position: string
  onGateAnswer: (value: string) => void
  onGateDisclosure: (value: string) => void
  onGateBy: (value: string) => void
  onGateSource: (value: string) => void
  onPosition: (value: string) => void
  onGate: () => void
  onPublish: () => void
  onUnpublish: () => void
  onRetryDelete: () => void
  onRetryRemoval: () => void
}) {
  const blocked = !view.gateRecorded || view.refusals.length > 0 || view.status !== 'kept'
  return (
    <div className="studio-grid">
      <div>
        <h1>Publish</h1>
        {view.assetId ? (
          <video controls playsInline preload="none" src={`/media/assets/${view.assetId}`} aria-label="Generated clip" />
        ) : null}
        <section className="studio-section" data-gate>
          <span className="label-caps">Publication gate · Article 50</span>
          <p className="studio-help">Before any generated clip is published, an explicit answer is recorded on whether EU AI Act Article 50 applies to Kickoff, and what disclosure it would need (A-06).</p>
          {view.gateRecorded ? <p className="studio-help">Answer on file.</p> : <p className="studio-help" role="status">{COPY.gate}</p>}
          {view.gateRecorded ? null : (
            <>
              <label htmlFor="p-answer">Article 50 answer</label>
              <textarea id="p-answer" className="studio-field" value={gateAnswer} onChange={(event) => onGateAnswer(event.target.value)} />
              <label htmlFor="p-disclosure">Disclosure</label>
              <textarea id="p-disclosure" className="studio-field" value={gateDisclosure} onChange={(event) => onGateDisclosure(event.target.value)} />
              <label htmlFor="p-by">Recorded by</label>
              <input id="p-by" className="studio-field" value={gateBy} onChange={(event) => onGateBy(event.target.value)} />
              <label htmlFor="p-source">Source</label>
              <input id="p-source" className="studio-field" value={gateSource} onChange={(event) => onGateSource(event.target.value)} />
              <button type="button" className="studio-button" onClick={onGate}>Record the answer</button>
            </>
          )}
        </section>
        <section className="studio-section">
          <span className="label-caps">This clip</span>
          <div className="studio-row">
            <label htmlFor="p-id">Public id</label>
            <input id="p-id" className="studio-field" value={publicId} onChange={(event) => onPublicId(event.target.value)} />
          </div>
          <div className="studio-row">
            <label htmlFor="p-title">Title</label>
            <input id="p-title" className="studio-field" value={title} onChange={(event) => onTitle(event.target.value)} />
          </div>
          <div className="studio-row">
            <label htmlFor="p-position">Position</label>
            <input id="p-position" className="studio-field" inputMode="numeric" value={position} onChange={(event) => onPosition(event.target.value)} />
          </div>
          {view.keys ? (
            <p className="studio-help">Storage keys: {view.keys.video} · {view.keys.thumbnail}</p>
          ) : <p className="studio-help">The storage keys cannot be named until the clip and its still have recorded hashes.</p>}
          {view.refusals.map((refusal) => <p key={refusal} className="studio-help" role="status">{refusal}</p>)}
        </section>
      </div>
      <div className="studio-card">
        <span className="label-caps">Confirm</span>
        <p className="studio-help">{DRAFT.publishConfirm}</p>
        <button type="button" className="studio-primary" disabled={blocked} onClick={onPublish}>Publish</button>
        {view.gateReason ? <p className="studio-help" role="status">{view.gateReason}</p> : null}
        {view.status === 'published' ? (
          <>
            <button type="button" className="studio-button" onClick={onUnpublish}>Unpublish</button>
            <button type="button" className="studio-button" onClick={onRetryDelete}>Retry delete</button>
            <button type="button" className="studio-button" onClick={onRetryRemoval}>Retry removal</button>
          </>
        ) : null}
        {view.status === 'withdrawn' ? (
          <>
            <button type="button" className="studio-button" onClick={onRetryDelete}>Retry delete</button>
            <button type="button" className="studio-button" onClick={onRetryRemoval}>Retry removal</button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function PublishPage() {
  const [jobs, setJobs] = useState<JobView[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [view, setView] = useState<PublishView | null>(null)
  const [publicId, setPublicId] = useState('')
  const [title, setTitle] = useState('')
  const [position, setPosition] = useState('')
  const [gateAnswer, setGateAnswer] = useState('')
  const [gateDisclosure, setGateDisclosure] = useState('')
  const [gateBy, setGateBy] = useState('')
  const [gateSource, setGateSource] = useState('')

  function reloadClip(id: string, nextPublicId: string) {
    void getJobs().then((rows) => {
      setJobs(rows.filter((row) => row.status === 'kept' || row.status === 'published' || row.status === 'withdrawn'))
    }).catch(() => undefined)
    void getPublish(id, nextPublicId).then(setView)
  }

  useEffect(() => {
    void getJobs().then((rows) => {
      const ready = rows.filter((row) => row.status === 'kept' || row.status === 'published' || row.status === 'withdrawn')
      setJobs(ready)
      const first = ready[0]
      if (first) setSelected(first.id)
    }).catch(() => setJobs([]))
  }, [])

  useEffect(() => {
    if (!selected) return
    void getPublish(selected, publicId).then(setView).catch(() => setView(null))
  }, [selected, publicId])

  if (!jobs) return <p className="studio-help">Reading publication.</p>
  if (!selected || !view || view.outcome !== 'publish') return <p className="studio-help">No kept clip is recorded.</p>
  return (
    <>
    <label htmlFor="p-clip">Clip</label>
    <select id="p-clip" aria-label="Clip" value={selected} onChange={(event) => setSelected(event.target.value)}>
      {jobs.map((job) => (
        <option key={job.id} value={job.id}>{job.status} · {job.id}</option>
      ))}
    </select>
    <PublishCard
      view={view}
      publicId={publicId}
      title={title}
      onPublicId={setPublicId}
      onTitle={setTitle}
      position={position}
      gateAnswer={gateAnswer}
      gateDisclosure={gateDisclosure}
      gateBy={gateBy}
      gateSource={gateSource}
      onGateAnswer={setGateAnswer}
      onGateDisclosure={setGateDisclosure}
      onGateBy={setGateBy}
      onGateSource={setGateSource}
      onPosition={setPosition}
      onGate={() => void recordGate({
        answer: gateAnswer,
        disclosure: gateDisclosure,
        recordedBy: gateBy,
        source: gateSource,
      }).then(() => getPublish(selected, publicId).then(setView))}
      onPublish={() => void publishClip(selected, {
        publicId,
        title,
        position: Number(position),
        confirm: true,
      }).then(() => reloadClip(selected, publicId))}
      onUnpublish={() => void unpublishClip(selected, false).then(() => reloadClip(selected, publicId))}
      onRetryDelete={() => void retryDelete(selected)}
      onRetryRemoval={() => void retryRemoval(selected)}
    />
    </>
  )
}

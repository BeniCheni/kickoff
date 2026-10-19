import { useEffect, useState } from 'react'
import { DRAFT } from '../../shared/admin-copy.ts'
import type { ShellView } from '../../shared/types.ts'
import { regenerateLabel } from '../../shared/jobs.ts'
import { CHECKLIST, CHECKLIST_RULE, PLAYER_HELP, keepReason } from '../../shared/review.ts'
import { discardReview, getJobs, getReview, keepReview, regenerateReview, type ReviewView } from './api.ts'
import type { JobView } from '../../shared/jobs.ts'

const ANSWERS = ['clear', 'present', 'unsure'] as const

export function ReviewChecklist({
  answers,
  onAnswer,
  onKeep,
  onDiscard,
}: {
  answers: Record<string, string>
  onAnswer: (line: string, answer: string) => void
  onKeep: () => void
  onDiscard: () => void
}) {
  const reason = keepReason(answers)
  return (
    <div className="studio-card">
      <span className="label-caps">Review checklist · walk every line</span>
      <ul className="check">
        {CHECKLIST.map((item, index) => (
          <li key={item.line}>
            <span id={`r-q${index}`}>{item.name}</span>
            <div className="studio-seg" role="group" aria-labelledby={`r-q${index}`}>
              {ANSWERS.map((answer) => (
                <button key={answer} type="button" aria-pressed={answers[item.line] === answer} onClick={() => onAnswer(item.line, answer)}>
                  {answer === 'clear' ? 'Clear' : answer === 'present' ? 'Present' : 'Unsure'}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className="studio-help">{CHECKLIST_RULE}</p>
      <div className="review-actions">
        <button type="button" className="studio-primary" disabled={reason !== null} onClick={onKeep}>Keep</button>
        <button type="button" className="studio-button" onClick={onDiscard}>Discard</button>
      </div>
      {reason ? <p className="studio-help" role="status">{reason}</p> : null}
    </div>
  )
}

export function ReviewPage({ shell }: { shell: ShellView }) {
  const [jobs, setJobs] = useState<JobView[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [review, setReview] = useState<ReviewView | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    void getJobs().then((rows) => {
      const ready = rows.filter((row) => row.status === 'downloaded' || row.status === 'kept' || row.status === 'discarded')
      setJobs(ready)
      const first = ready[0]
      if (first) setSelected(first.id)
    }).catch(() => setJobs([]))
  }, [])

  useEffect(() => {
    if (!selected) return
    void getReview(selected).then((next) => {
      setReview(next)
      const recorded: Record<string, string> = {}
      for (const answer of next.answers ?? []) recorded[answer.line] = answer.answer
      setAnswers(recorded)
    }).catch(() => setReview(null))
  }, [selected])

  if (!jobs) return <p className="studio-help">Reading reviews.</p>
  if (!selected || !review || review.outcome !== 'review') {
    return <p className="studio-help">No downloaded clip is recorded.</p>
  }
  return (
    <div className="studio-grid">
      <div>
        <label htmlFor="r-clip">Clip</label>
        <select id="r-clip" aria-label="Clip" value={selected} onChange={(event) => setSelected(event.target.value)}>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>{job.status} · {job.id}</option>
          ))}
        </select>
        <h1>{review.jobId}</h1>
        {review.assetId ? (
          <video controls playsInline preload="none" src={`/media/assets/${review.assetId}`} aria-label="Generated clip" />
        ) : <p className="studio-help">No local file is recorded for this job.</p>}
        <p className="studio-help" data-player-help>{PLAYER_HELP}</p>
        <section className="studio-section">
          <span className="label-caps">This generation</span>
          {review.file ? (
            <p className="studio-help">
              {review.file.mime} · {review.file.bytes} bytes · SHA-256 {review.file.sha256.slice(0, 8)}…{review.file.sha256.slice(-4)}
              {review.file.width && review.file.height ? ` · ${review.file.width} × ${review.file.height}` : ''}
              {review.file.durationS ? ` · ${review.file.durationS} s` : ''}
            </p>
          ) : null}
          {review.prompt ? <p className="studio-help">“{review.prompt}”</p> : null}
        </section>
        <section className="studio-section">
          <span className="label-caps">Lineage</span>
          <p className="studio-help">{(review.parents ?? []).length === 0 ? 'First generation; no parent.' : `Regeneration of ${(review.parents ?? []).join(', ')}.`}</p>
          {shell.falConfigured ? null : <p className="studio-help" role="status">{DRAFT.falKey}</p>}
          {review.regenerateEstimateUsd ? (
            <button type="button" className="studio-button" disabled={!shell.falConfigured} onClick={() => void regenerateReview(selected, review.regenerateEstimateUsd ?? '').then(() => getJobs())}>
              {regenerateLabel(review.regenerateEstimateUsd)}
            </button>
          ) : null}
        </section>
      </div>
      <div>
        <ReviewChecklist
          answers={answers}
          onAnswer={(line, answer) => setAnswers({ ...answers, [line]: answer })}
          onKeep={() => void keepReview(selected, CHECKLIST.map((item) => ({ line: item.line, answer: answers[item.line] ?? '' }))).then(() => getReview(selected).then(setReview))}
          onDiscard={() => void discardReview(selected).then(() => getReview(selected).then(setReview))}
        />
        <div className="studio-card">
          <span className="label-caps">Attestation, written at Keep</span>
          <p className="studio-help">
            {review.attestation
              ? `policy v1 · fictionalOnly true · checklist walked by ${review.attestation.by ?? 'operator'} · ${review.attestation.at} · 5 of 5 clear · answers recorded per line`
              : 'The time and the walker are written when Keep is recorded.'}
          </p>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { COPY } from '../../copy.ts'
import { DRAFT } from '../../shared/admin-copy.ts'
import {
  composeJobs,
  largestEstimate,
  submitBlock,
  sumEstimates,
  type ComposeDraft,
  type ComposeJob,
} from '../../shared/compose.ts'
import { displayUsd } from '../../shared/display.ts'
import { cmpUsd } from '../../money.ts'
import type { ShellView } from '../../shared/types.ts'
import { estimateJobs, getCompose, submitJobs, uploadPhoto, type ComposeCatalog, type EstimateLine } from './api.ts'

const CANVAS_HELP = '16:10 is what every H3 image-to-video clip so far measures (Appendix S; that appendix’s other models and aspects are not this series). 16:9 is UNVERIFIED (H3 takes its canvas from the input image). The verification run, decided 8 Oct: crop the existing K0 to 768 × 432 locally (free), one 5 s 480P clip ($0.075), pass if ffprobe reports a 16:9 frame. Pass flips this default to 16:9; fail closes the question at 16:10 with the bars.'

function Seg({
  label,
  labelledBy,
  options,
  value,
  onChange,
}: {
  label?: string
  labelledBy?: string
  options: readonly { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="studio-seg" role="group" aria-label={label} aria-labelledby={labelledBy}>
      {options.map((option) => (
        <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function ComposeForm({
  catalog,
  shell,
  draft,
  onDraft,
  lines,
  onEstimate,
  onSubmit,
  onChoosePhoto,
}: {
  catalog: ComposeCatalog
  shell: ShellView
  draft: ComposeDraft
  onDraft: (draft: ComposeDraft) => void
  lines: EstimateLine[]
  onEstimate: () => void
  onSubmit: () => void
  onChoosePhoto?: (file: File) => void
}) {
  const jobs = composeJobs(draft)
  const priced = lines.flatMap((line) => line.outcome === 'estimate' ? [line.usd] : [])
  const total = sumEstimates(priced)
  const largest = largestEstimate(priced)
  const spend = shell.session?.spendUsd ?? '0.000000'
  const overBudget = lines.some((line) => line.outcome === 'estimate' && cmpUsd(line.usd, shell.caps.perJobUsd) > 0)
    || (priced.length > 0 && cmpUsd(sumEstimates([spend, total]), shell.caps.sessionUsd) > 0)
  const block = submitBlock({
    database: shell.database,
    jobCount: jobs.length,
    overBudget,
    unpriced: jobs.length > 0 && (lines.length !== jobs.length || lines.some((line) => line.outcome !== 'estimate')),
  })
  const sessionWidth = percent(spend, shell.caps.sessionUsd)
  const addWidth = percent(total, shell.caps.sessionUsd)
  return (
    <div className="studio-grid">
      <div>
        <section className="studio-section">
          <span className="label-caps">Recipe v0 · keyframes</span>
          <div className="studio-row">
            <span id="c-subject">Subject</span>
            <div>
              {catalog.subjects.length === 0 ? <p className="studio-help">No subject is recorded.</p> : (
                <Seg
                  labelledBy="c-subject"
                  value={draft.subjectId ?? ''}
                  onChange={(subjectId) => onDraft({ ...draft, subjectId })}
                  options={catalog.subjects.map((subject) => ({ value: subject.id, label: subject.name }))}
                />
              )}
            </div>
          </div>
          <div className="studio-row">
            <span id="c-photos">Reference photos</span>
            <div>
              <div className="studio-photos" role="list" aria-labelledby="c-photos">
                {catalog.photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    role="listitem"
                    className="studio-photo"
                    aria-pressed={draft.photoId === photo.id}
                    onClick={() => onDraft({ ...draft, photoId: photo.id })}
                  >
                    {photo.sha256.slice(0, 8)}
                    <br />
                    stripped copy
                  </button>
                ))}
              </div>
              {onChoosePhoto ? (
                <input aria-label="Choose a JPEG" type="file" accept="image/jpeg" onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) onChoosePhoto(file)
                }} />
              ) : null}
              <p className="studio-help">{COPY.photos}</p>
              <p className="studio-help">{DRAFT.onePhotograph}</p>
            </div>
          </div>
        </section>
        <section className="studio-section">
          <span className="label-caps">Keyframes K0 · K1 · K2</span>
          <div className="studio-row">
            <label htmlFor="c-kmodel">Keyframe model</label>
            <select id="c-kmodel" className="studio-field" value={draft.keyframeEndpoint} onChange={(event) => onDraft({ ...draft, keyframeEndpoint: event.target.value })}>
              {catalog.keyframeModels.map((model) => (
                <option key={model.id} value={model.endpoint}>{model.endpoint} · pinned {model.pinnedOn}</option>
              ))}
            </select>
          </div>
          <div className="studio-row">
            <span id="c-canvas">Canvas</span>
            <div>
              <Seg
                labelledBy="c-canvas"
                value={draft.canvas}
                onChange={(canvas) => onDraft({ ...draft, canvas: canvas as ComposeDraft['canvas'] })}
                options={[{ value: '16:10', label: '16:10' }, { value: '16:9', label: '16:9' }]}
              />
              <p className="studio-help">{CANVAS_HELP}</p>
            </div>
          </div>
          {(['k0', 'k1', 'k2'] as const).map((key) => (
            <div className="studio-row" key={key}>
              <label htmlFor={`c-${key}`}>{key.toUpperCase()} prompt</label>
              <textarea id={`c-${key}`} className="studio-field" value={draft.prompts[key]} onChange={(event) => onDraft({ ...draft, prompts: { ...draft.prompts, [key]: event.target.value } })} onBlur={onEstimate} />
            </div>
          ))}
        </section>
        <section className="studio-section">
          <span className="label-caps">Clip · image to video</span>
          <div className="studio-row">
            <label htmlFor="c-cmodel">Clip model</label>
            <select id="c-cmodel" className="studio-field" value={draft.clipEndpoint} onChange={(event) => onDraft({ ...draft, clipEndpoint: event.target.value })}>
              {catalog.clipModels.map((model) => (
                <option key={model.id} value={model.endpoint}>{model.endpoint} · pinned {model.pinnedOn}</option>
              ))}
            </select>
          </div>
          <div className="studio-row">
            <span id="c-frames">Frames</span>
            <Seg
              labelledBy="c-frames"
              value={draft.frames}
              onChange={(frames) => onDraft({ ...draft, frames: frames as ComposeDraft['frames'] })}
              options={[{ value: 'k0-k2', label: 'K0 first · K2 last' }, { value: 'k0', label: 'K0 only' }]}
            />
          </div>
          <div className="studio-row">
            <span id="c-res">Resolution</span>
            <Seg
              labelledBy="c-res"
              value={draft.resolution}
              onChange={(resolution) => onDraft({ ...draft, resolution: resolution as ComposeDraft['resolution'] })}
              options={[{ value: '480P', label: '480P' }, { value: '768P', label: '768P' }]}
            />
          </div>
          <div className="studio-row">
            <span id="c-length">Clip length</span>
            <Seg
              labelledBy="c-length"
              value={String(draft.duration)}
              onChange={(duration) => onDraft({ ...draft, duration: Number(duration) as ComposeDraft['duration'] })}
              options={[{ value: '5', label: '5 s' }, { value: '10', label: '10 s' }, { value: '15', label: '15 s' }]}
            />
          </div>
          <div className="studio-row">
            <label htmlFor="c-motion">Motion prompt</label>
            <textarea id="c-motion" className="studio-field" value={draft.motion} onChange={(event) => onDraft({ ...draft, motion: event.target.value })} onBlur={onEstimate} />
          </div>
          <div className="studio-row">
            <span>Seed</span>
            <input id="c-seed" aria-label="Seed" className="studio-field" value={draft.seed} onChange={(event) => onDraft({ ...draft, seed: event.target.value })} />
          </div>
          <div className="studio-row">
            <span id="c-expansion">Prompt expansion</span>
            <Seg
              labelledBy="c-expansion"
              value={draft.expansion}
              onChange={(expansion) => onDraft({ ...draft, expansion: expansion as ComposeDraft['expansion'] })}
              options={[{ value: 'off', label: 'expansion off' }, { value: 'balanced', label: 'balanced' }]}
            />
          </div>
        </section>
      </div>
      <EstimateCard
        jobs={jobs}
        lines={lines}
        total={total}
        largest={largest}
        spend={spend}
        sessionWidth={sessionWidth}
        addWidth={addWidth}
        shell={shell}
        block={block}
        onSubmit={onSubmit}
      />
    </div>
  )
}

function percent(part: string, whole: string): number {
  const scale = 1_000_000
  const left = Number(part) * scale
  const right = Number(whole) * scale
  if (!Number.isFinite(left) || !Number.isFinite(right) || right <= 0) return 0
  return Math.min(100, (left / right) * 100)
}

function EstimateCard({
  jobs,
  lines,
  total,
  largest,
  spend,
  sessionWidth,
  addWidth,
  shell,
  block,
  onSubmit,
}: {
  jobs: readonly ComposeJob[]
  lines: readonly EstimateLine[]
  total: string
  largest: string | null
  spend: string
  sessionWidth: number
  addWidth: number
  shell: ShellView
  block: string | null
  onSubmit: () => void
}) {
  return (
    <div>
      <div className="studio-card">
        <span className="label-caps">Estimate before submit</span>
        <table className="cost">
          <thead>
            <tr><th>Request</th><th className="n">Current</th></tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => {
              const line = lines[index]
              return (
                <tr key={`${job.label}-${index}`}>
                  <td>{job.label}</td>
                  <td className="n">{line?.outcome === 'estimate' ? displayUsd(line.usd) : 'no current price'}</td>
                </tr>
              )
            })}
            <tr>
              <td>{jobs.length} jobs</td>
              <td className="n">{priced(total)}</td>
            </tr>
          </tbody>
        </table>
        <div className="cap">
          <div className="cap-label"><span>Largest single job</span><b>{largest ? `${displayUsd(largest)} of ${displayUsd(shell.caps.perJobUsd)}` : 'none'}</b></div>
          <div className="cap-bar"><b style={{ width: `${largest ? percent(largest, shell.caps.perJobUsd) : 0}%` }} /></div>
        </div>
        <div className="cap">
          <div className="cap-label"><span>Session after submit</span><b>{displayUsd(spend)} + {displayUsd(total)} of {displayUsd(shell.caps.sessionUsd)}</b></div>
          <div className="cap-bar">
            <b style={{ width: `${sessionWidth}%` }} />
            <b className="add" style={{ left: `${sessionWidth}%`, width: `${addWidth}%` }} />
          </div>
        </div>
        <div className="cap">
          <div className="cap-label"><span>Balance</span><b>{shell.balance ? displayUsd(shell.balance.amountUsd) : 'not recorded'}</b></div>
          {shell.balance ? null : <p className="studio-help">{DRAFT.balanceUnrecorded}</p>}
        </div>
        <button className="studio-primary" type="button" disabled={block !== null} onClick={onSubmit}>
          {block ? 'Submit' : `Submit ${jobs.length} jobs · est. ${displayUsd(total)}`}
        </button>
        {block ? <p className="studio-help" role="status">{block}</p> : null}
      </div>
    </div>
  )
}

function priced(total: string): string {
  return displayUsd(total)
}

const EMPTY: ComposeDraft = {
  subjectId: null,
  photoId: null,
  keyframeEndpoint: 'openai/gpt-image-2/edit',
  canvas: '16:10',
  prompts: { k0: '', k1: '', k2: '' },
  clipEndpoint: 'minimax/h3-max-turbo/image-to-video',
  frames: 'k0-k2',
  resolution: '480P',
  duration: 15,
  motion: '',
  seed: '',
  expansion: 'off',
}

export function ComposePage({ shell }: { shell: ShellView }) {
  const [catalog, setCatalog] = useState<ComposeCatalog | null>(null)
  const [draft, setDraft] = useState<ComposeDraft>(EMPTY)
  const [lines, setLines] = useState<EstimateLine[]>([])

  useEffect(() => {
    void getCompose().then(setCatalog).catch(() => setCatalog(null))
  }, [])

  async function refreshEstimate(next = draft) {
    const built = composeJobs(next)
    if (built.length === 0) {
      setLines([])
      return
    }
    const result = await estimateJobs(built.map((job) => ({ endpoint: job.endpoint, params: job.params })))
    setLines(result.lines)
  }

  async function onPhoto(file: File) {
    const photo = await uploadPhoto(await file.arrayBuffer())
    setCatalog(await getCompose())
    setDraft({ ...draft, photoId: photo.id })
  }

  async function onSubmit() {
    const built = composeJobs(draft)
    const estimate = await estimateJobs(built.map((job) => ({ endpoint: job.endpoint, params: job.params })))
    setLines(estimate.lines)
    if (estimate.overBudget || estimate.unpriced) return
    await submitJobs({
      confirmTotalUsd: estimate.totalUsd,
      jobs: built.map((job) => ({
        endpoint: job.endpoint,
        params: job.params,
        prompt: job.prompt,
        seed: job.seed,
        photoId: job.photoId,
        subjectId: job.subjectId,
      })),
    })
    setDraft({ ...draft, prompts: { k0: '', k1: '', k2: '' }, motion: '' })
    setLines([])
  }

  if (!catalog) return <p className="studio-help">Reading the registry.</p>
  return (
    <>
      <ComposeForm
        catalog={catalog}
        shell={shell}
        draft={draft}
        onDraft={(next) => {
          setDraft(next)
          void refreshEstimate(next)
        }}
        lines={lines}
        onEstimate={() => void refreshEstimate()}
        onSubmit={() => void onSubmit()}
        onChoosePhoto={(file) => void onPhoto(file)}
      />
    </>
  )
}

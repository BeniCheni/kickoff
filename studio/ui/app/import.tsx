import { useState } from 'react'
import { SUBJECT_LABELS } from '@kickoff/catalog'
import { DRAFT } from '../../shared/admin-copy.ts'
import { confirmImport, discardImportUpload, previewImport, uploadImportClip, uploadImportStill, type ImportPreview } from './api.ts'
import { StatusLine } from './status.tsx'

export type ImportFacts = ImportPreview

function isPreview(body: unknown): body is ImportPreview {
  return Boolean(body && typeof body === 'object' && (body as { outcome?: unknown }).outcome === 'preview')
}

function fileKind(file: File): 'clip' | 'still' | 'png' | 'other' {
  const name = file.name.toLowerCase()
  if (file.type === 'image/png' || name.endsWith('.png')) return 'png'
  if (file.type === 'video/mp4' || name.endsWith('.mp4')) return 'clip'
  if (file.type === 'image/jpeg' || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'still'
  return 'other'
}

export function ImportForm({
  clipName,
  stillName,
  png,
  prompt,
  subjects,
  title,
  note,
  madeOn,
  preview,
  notice,
  onClip,
  onStill,
  onPng,
  onOther,
  onPrompt,
  onSubject,
  onTitle,
  onNote,
  onMadeOn,
  onPreview,
  onImport,
}: {
  clipName: string | null
  stillName: string | null
  png: boolean
  prompt: string
  subjects: readonly string[]
  title: string
  note: string
  madeOn: string
  preview: ImportFacts | null
  notice: unknown
  onClip: (file: File) => void
  onStill: (file: File) => void
  onPng: () => void
  onOther: () => void
  onPrompt: (value: string) => void
  onSubject: (name: string, on: boolean) => void
  onTitle: (value: string) => void
  onNote: (value: string) => void
  onMadeOn: (value: string) => void
  onPreview: () => void
  onImport: () => void
}) {
  function take(files: FileList | File[]) {
    for (const file of files) {
      const kind = fileKind(file)
      if (kind === 'png') onPng()
      else if (kind === 'clip') onClip(file)
      else if (kind === 'still') onStill(file)
      else onOther()
    }
  }
  const needsDate = Boolean(preview?.needsMadeOn) && madeOn.trim().length === 0
  const ready = Boolean(preview) && prompt.trim().length > 0 && title.trim().length > 0 && subjects.length > 0 && !needsDate && !png
  const strip = preview
    ? (preview.stripped === 'none' ? DRAFT.importStripNone : `Strip will remove ${preview.stripped}.`)
    : null
  return (
    <div
      className="studio-grid"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        take(event.dataTransfer.files)
      }}
    >
      <div>
        <h1>Import</h1>
        <p className="studio-help">{DRAFT.importChoose}</p>
        <div className="studio-row">
          <label htmlFor="i-clip">Clip</label>
          <input id="i-clip" className="studio-field" type="file" accept="video/mp4,.mp4" onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) take([file])
          }} />
        </div>
        <div className="studio-row">
          <label htmlFor="i-still">Keyframe</label>
          <input id="i-still" className="studio-field" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) take([file])
          }} />
        </div>
        {clipName ? <p className="studio-help">Clip: {clipName}</p> : null}
        {stillName ? <p className="studio-help">Keyframe: {stillName}</p> : null}
        {png ? <p className="studio-help" role="status">{DRAFT.importPng}</p> : null}
        <label htmlFor="i-prompt">Prompt</label>
        <textarea id="i-prompt" className="studio-field" value={prompt} onChange={(event) => onPrompt(event.target.value)} />
        <p className="studio-help">{DRAFT.importPrompt}</p>
        <div className="studio-row">
          <span id="i-subjects">Subjects</span>
          <div className="studio-seg" role="group" aria-labelledby="i-subjects">
            {SUBJECT_LABELS.map((name) => (
              <button key={name} type="button" aria-pressed={subjects.includes(name)} onClick={() => onSubject(name, !subjects.includes(name))}>
                {name}
              </button>
            ))}
          </div>
        </div>
        <label htmlFor="i-title">Title</label>
        <input id="i-title" className="studio-field" value={title} onChange={(event) => onTitle(event.target.value)} />
        <label htmlFor="i-note">Note</label>
        <textarea id="i-note" className="studio-field" value={note} onChange={(event) => onNote(event.target.value)} />
        <label htmlFor="i-made">Made on</label>
        <input id="i-made" className="studio-field" type="date" value={madeOn} onChange={(event) => onMadeOn(event.target.value)} />
        <p className="studio-help">{DRAFT.importMadeOn}</p>
      </div>
      <div className="studio-card">
        <span className="label-caps">Before import</span>
        <button type="button" className="studio-button" disabled={!clipName || !stillName || png} onClick={onPreview}>{DRAFT.importRead}</button>
        {preview ? (
          <section className="studio-section" aria-label="What the file says">
            <p className="studio-help">{DRAFT.importPreview}</p>
            <p className="studio-help">Width {preview.width}. Height {preview.height}. Duration {preview.durationS}. Frame rate {preview.frameRate ?? 'not in the file'}. Audio {preview.audio ? 'yes' : 'no'}. Fast start {preview.fastStart ? 'yes' : 'no'}.</p>
            <p className="studio-help">{strip}</p>
            {needsDate ? <p className="studio-help" role="status">{DRAFT.importNeedsMadeOn}</p> : null}
          </section>
        ) : null}
        <button type="button" className="studio-primary" disabled={!ready} onClick={onImport}>Import</button>
        <StatusLine body={notice} />
      </div>
    </div>
  )
}

export function ImportPage() {
  const [clip, setClip] = useState<File | null>(null)
  const [still, setStill] = useState<File | null>(null)
  const [png, setPng] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [madeOn, setMadeOn] = useState('')
  const [preview, setPreview] = useState<ImportFacts | null>(null)
  const [ids, setIds] = useState<{ clipId: string; stillId: string } | null>(null)
  const [notice, setNotice] = useState<unknown>(null)

  async function readFile() {
    if (!clip || !still || png) return
    const clipBody = await uploadImportClip(await clip.arrayBuffer())
    const clipId = clipBody && typeof clipBody === 'object' && typeof (clipBody as { id?: unknown }).id === 'string'
      ? (clipBody as { id: string }).id
      : null
    if (!clipId) {
      setPreview(null)
      setIds(null)
      setNotice(clipBody)
      return
    }
    let stillBody: unknown
    try {
      stillBody = await uploadImportStill(await still.arrayBuffer(), still.type || 'image/jpeg')
    } catch {
      await discardImportUpload(clipId, 'clip').catch(() => undefined)
      setPreview(null)
      setIds(null)
      setNotice({ outcome: 'refused' })
      return
    }
    const stillId = stillBody && typeof stillBody === 'object' && typeof (stillBody as { id?: unknown }).id === 'string'
      ? (stillBody as { id: string }).id
      : null
    if (!stillId) {
      await discardImportUpload(clipId, 'clip').catch(() => undefined)
      setPreview(null)
      setIds(null)
      setNotice(stillBody)
      return
    }
    const facts = await previewImport(clipId, stillId)
    if (!isPreview(facts)) {
      setPreview(null)
      setIds(null)
      setNotice(facts)
      return
    }
    setIds({ clipId, stillId })
    setPreview(facts)
    setNotice(null)
  }

  async function commit() {
    if (!ids) return
    const result = await confirmImport({
      clipId: ids.clipId,
      stillId: ids.stillId,
      prompt,
      subjects,
      title,
      note,
      madeOn,
    })
    const imported = Boolean(result && typeof result === 'object' && (result as { outcome?: unknown }).outcome === 'imported')
    setNotice(imported ? DRAFT.importImported : result)
    setPreview(null)
    setIds(null)
  }

  return (
    <ImportForm
      clipName={clip?.name ?? null}
      stillName={png ? null : still?.name ?? null}
      png={png}
      prompt={prompt}
      subjects={subjects}
      title={title}
      note={note}
      madeOn={madeOn}
      preview={preview}
      notice={notice}
      onClip={(file) => {
        setClip(file)
        setPreview(null)
        setIds(null)
      }}
      onStill={(file) => {
        setStill(file)
        setPng(false)
        setPreview(null)
        setIds(null)
      }}
      onPng={() => {
        setPng(true)
        setStill(null)
        setPreview(null)
        setIds(null)
      }}
      onOther={() => setNotice({ outcome: 'wrong-type' })}
      onPrompt={setPrompt}
      onSubject={(name, on) => setSubjects((current) => on ? [...current, name] : current.filter((item) => item !== name))}
      onTitle={setTitle}
      onNote={setNote}
      onMadeOn={setMadeOn}
      onPreview={() => void readFile()}
      onImport={() => void commit()}
    />
  )
}

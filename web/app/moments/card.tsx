'use client'

import { useState } from 'react'
import { siteCopyPath, storageAddress, type CatalogListRow } from '@kickoff/catalog'
import { useRouter } from 'next/navigation'
import { isMomentReference } from '../../../src/lib/momentsReferences'
import type { SavedReferences } from '../../../src/lib/momentsSaved'
import { durationClock, generatedDate } from './format'
import { mergeWatch } from './watch-url'

export function cardFrame(row: CatalogListRow): string | null {
  if (row.width === null || row.height === null || row.width <= 0 || row.height <= 0) return null
  return `${row.width} / ${row.height}`
}

export type ThumbStep = 'storage' | 'site' | 'cover'

export function thumbSources(row: CatalogListRow, storageOrigin: string | null): { storage: string | null; site: string | null } {
  const storage = row.thumbnail_bucket && row.thumbnail_object_path && storageOrigin
    ? storageAddress(row.thumbnail_bucket, row.thumbnail_object_path, storageOrigin)
    : null
  return { storage, site: siteCopyPath(row.id) }
}

export function nextThumbStep(step: ThumbStep, site: string | null): ThumbStep {
  if (step === 'storage' && site) return 'site'
  return 'cover'
}

const SITE_LINE = 'Thumbnail from the site\u2019s copy \u00b7 Supabase did not answer.'
const COVER_LINE = 'No thumbnail: Supabase and the site\u2019s copy both failed.'

export function Thumb({
  row,
  storageOrigin,
  forcedStep,
  href,
}: {
  row: CatalogListRow
  storageOrigin: string | null
  forcedStep?: ThumbStep
  href?: string
}) {
  const { storage, site } = thumbSources(row, storageOrigin)
  const initial: ThumbStep = forcedStep ?? (storage ? 'storage' : site ? 'site' : 'cover')
  const [step, setStep] = useState<ThumbStep>(initial)
  const [loaded, setLoaded] = useState(false)
  const frame = cardFrame(row)
  const src = step === 'storage' ? storage : step === 'site' ? site : null
  const picture = (
    <div className="moments-cover" style={frame ? { aspectRatio: frame } : undefined}>
      {src ? (
        <>
          {loaded ? null : <p className="moments-small">Thumbnail loading</p>}
          <img
            alt=""
            decoding="async"
            loading="lazy"
            src={src}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setLoaded(false)
              setStep(current => nextThumbStep(current, site))
            }}
          />
        </>
      ) : (
        <div className="moments-cover-fallback">
          <p className="moments-cover-word">STUDIO</p>
          <p className="moments-art-label">Original typographic art {'\u00b7'} no thumbnail could be loaded</p>
        </div>
      )}
    </div>
  )
  return (
    <>
      {href ? <a href={href} aria-hidden="true" tabIndex={-1}>{picture}</a> : picture}
      {step === 'site' ? <p className="moments-trust">{SITE_LINE}</p> : null}
      {step === 'cover' ? <p className="moments-trust">{COVER_LINE}</p> : null}
    </>
  )
}

export function VideoCard({
  row,
  search,
  storageOrigin,
  saved,
  visitOnly,
  onToggleSave,
}: {
  row: CatalogListRow
  search: string
  storageOrigin: string | null
  saved: boolean
  visitOnly: boolean
  onToggleSave: (id: string) => void
}) {
  const router = useRouter()
  const duration = durationClock(row.duration_s)
  const href = mergeWatch(search, '', 'moments', row.id)
  return (
    <article data-kind="generated" data-moment={row.id} className="moments-card">
      <Thumb row={row} storageOrigin={storageOrigin} href={href} />
      <div className="moments-card-body">
        <p className="moments-facts">
          <span className="moments-badge">Generated</span>
          {duration ? <span> · {duration}</span> : null}
          <span> · Generated {generatedDate(row.generated_at)}</span>
        </p>
        <h2>
          <a
            href={href}
            onClick={event => {
              event.preventDefault()
              const live = typeof window === 'undefined'
                ? href
                : mergeWatch(window.location.search, window.location.hash, 'moments', row.id)
              router.push(`${window.location.pathname}${live}`)
            }}
          >{row.title}</a>
        </h2>
        {row.editorial_note ? <p className="moments-note">{row.editorial_note}</p> : null}
        <button
          type="button"
          className="moments-save"
          aria-label={`Save reference: ${row.title}`}
          aria-pressed={saved}
          onClick={() => { if (isMomentReference(row.id)) onToggleSave(row.id) }}
        >Save reference</button>
        <p className="moments-save-state">{saved ? 'Saved reference' : 'Not saved'}{visitOnly ? ' · visit only' : ''}</p>
      </div>
    </article>
  )
}

export function savedIdSet(saved: SavedReferences): Set<string> {
  return new Set(saved.ids.filter(isMomentReference))
}

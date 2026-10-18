'use client'

import { useEffect, useRef, useState } from 'react'
import type { CatalogListRow } from '@kickoff/catalog'
import type { ThumbnailSources } from '../../lib/catalog/types'
import { isMomentReference } from '../../../src/lib/momentsReferences'
import type { SavedReferences } from '../../../src/lib/momentsSaved'
import { durationClock, generatedDate } from './format'
import { useWatchNavigation, useWatchHref } from './watch-url'
import dynamic from 'next/dynamic'
import type { MomentSocial } from '../../lib/catalog/types'
import { PREVIEW_DELAY_MS, previewAllowed, previewGate } from './preview-gate'

const CardSocial = dynamic(() => import('./social').then(mod => mod.CardSocial))
const CardPreview = dynamic(() => import('./preview').then(mod => mod.CardPreview))

export function cardFrame(row: CatalogListRow): string | null {
  if (row.width === null || row.height === null || row.width <= 0 || row.height <= 0) return null
  return `${row.width} / ${row.height}`
}

export type ThumbStep = 'storage' | 'site' | 'cover'

export function nextThumbStep(step: ThumbStep, site: string | null): ThumbStep {
  if (step === 'storage' && site) return 'site'
  return 'cover'
}

const SITE_LINE = 'Thumbnail from the site\u2019s copy \u00b7 Supabase did not answer.'
const COVER_LINE = 'No thumbnail: Supabase and the site\u2019s copy both failed.'

export function Thumb({
  row,
  sources,
  forcedStep,
  href,
  stage = false,
  previewSrc = null,
}: {
  row: CatalogListRow
  sources?: ThumbnailSources
  forcedStep?: ThumbStep
  href?: string
  stage?: boolean
  previewSrc?: string | null
}) {
  const navigate = useWatchNavigation()
  const { storage, site } = sources ?? { storage: null, site: null }
  const initial: ThumbStep = forcedStep ?? (storage ? 'storage' : site ? 'site' : 'cover')
  const [step, setStep] = useState<ThumbStep>(initial)
  const [loaded, setLoaded] = useState(false)
  const image = useRef<HTMLImageElement>(null)
  const frame = cardFrame(row)
  const src = step === 'storage' ? storage : step === 'site' ? site : null
  function failed() {
    setLoaded(false)
    // A pre-hydration error and React's handler may both observe this source.
    setStep(current => current === step ? nextThumbStep(current, site) : current)
  }
  useEffect(() => {
    const img = image.current
    if (!img?.complete) return
    if (img.naturalWidth === 0) failed()
    else setLoaded(true)
  }, [src])
  const picture = (
    <div className="moments-cover" style={stage ? { aspectRatio: '16 / 9' } : frame ? { aspectRatio: frame } : undefined}>
      {src ? (
        <>
          {loaded ? null : <p className="moments-small">Thumbnail loading</p>}
          <img
            ref={image}
            alt=""
            decoding="async"
            loading="lazy"
            src={src}
            onLoad={() => setLoaded(true)}
            onError={failed}
          />
        </>
      ) : (
        <div className="moments-cover-fallback">
          <p className="moments-cover-word">STUDIO</p>
          <p className="moments-art-label">Original typographic art {'\u00b7'} no thumbnail could be loaded</p>
        </div>
      )}
      {previewSrc ? <CardPreview src={previewSrc} /> : null}
    </div>
  )
  return (
    <>
      {href ? <a href={href} aria-hidden="true" tabIndex={-1} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        navigate('moments', row.id)
      }}>{picture}</a> : picture}
      {step === 'site' ? <p className="moments-trust">{SITE_LINE}</p> : null}
      {step === 'cover' ? <p className="moments-trust">{COVER_LINE}</p> : null}
    </>
  )
}

export function VideoCard({
  row,
  search,
  thumbnail,
  saved,
  visitOnly,
  onToggleSave,
  social,
  videoSrc = null,
}: {
  row: CatalogListRow
  search: string
  thumbnail?: ThumbnailSources
  saved: boolean
  visitOnly: boolean
  onToggleSave: (id: string) => void
  social?: MomentSocial
  videoSrc?: string | null
}) {
  const navigate = useWatchNavigation()
  const duration = durationClock(row.duration_s)
  const href = useWatchHref(search, row.id)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const timer = useRef<number | null>(null)
  function clearArm() {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
  }
  function arm() {
    clearArm()
    if (!videoSrc || !previewAllowed(previewGate())) return
    timer.current = window.setTimeout(() => {
      if (!videoSrc || !previewAllowed(previewGate())) return
      setPreviewSrc(videoSrc)
    }, PREVIEW_DELAY_MS)
  }
  function disarm() {
    clearArm()
    setPreviewSrc(null)
  }
  useEffect(() => clearArm, [])
  return (
    <article
      data-kind="generated"
      data-moment={row.id}
      className="moments-card"
      onMouseEnter={arm}
      onMouseLeave={disarm}
      onFocus={arm}
      onBlur={disarm}
    >
      <Thumb row={row} sources={thumbnail} href={href} previewSrc={previewSrc} />
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
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              event.preventDefault()
              navigate('moments', row.id)
            }}
          >{row.title}</a>
        </h2>
        {social ? <CardSocial social={social} publishedAt={row.published_at} /> : null}
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

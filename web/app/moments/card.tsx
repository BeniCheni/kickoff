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

const SITE_LINE = 'Thumbnail from the site\'s copy \u00b7 the file store did not answer.'
const COVER_LINE = 'No thumbnail: the file store and the site\'s copy both failed.'

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
  enterIndex = -1,
  onEntered,
}: {
  row: CatalogListRow
  search: string
  thumbnail?: ThumbnailSources
  saved: boolean
  visitOnly: boolean
  onToggleSave: (id: string) => void
  social?: MomentSocial
  videoSrc?: string | null
  enterIndex?: number
  onEntered?: (id: string) => void
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
    if (previewSrc || timer.current !== null) return
    if (!videoSrc) return
    const started = Date.now()
    timer.current = window.setTimeout(() => { timer.current = null }, 60_000)
    void import('./preview-gate').then(({ PREVIEW_DELAY_MS, previewAllowed, previewGate }) => {
      if (timer.current === null) return
      window.clearTimeout(timer.current)
      timer.current = null
      if (!previewAllowed(previewGate())) return
      const wait = Math.max(0, PREVIEW_DELAY_MS - (Date.now() - started))
      timer.current = window.setTimeout(() => {
        timer.current = null
        if (!videoSrc || !previewAllowed(previewGate())) return
        setPreviewSrc(videoSrc)
      }, wait)
    })
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
      data-enter={enterIndex >= 0 ? '' : undefined}
      style={enterIndex >= 0 ? { ['--enter' as string]: String(enterIndex) } : undefined}
      onAnimationEnd={event => {
        if (event.target !== event.currentTarget || event.animationName !== 'moments-card-enter') return
        onEntered?.(row.id)
      }}
      onMouseEnter={arm}
      onMouseLeave={disarm}
      onFocus={arm}
      onBlur={event => {
        const next = event.relatedTarget
        if (next instanceof Node && event.currentTarget.contains(next)) return
        disarm()
      }}
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

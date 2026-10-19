'use client'

import { useEffect, useRef } from 'react'
import type { CatalogMode, MomentsPayload } from '../../lib/catalog/types'
import { previewAllowed } from '../../lib/catalog/types'
import { Gallery } from './gallery'
import './gallery.css'
import dynamic from 'next/dynamic'
import { WatchMissing, WatchUnavailable } from './watch-states'

const WatchPage = dynamic(() => import('./watch').then(mod => mod.WatchPage))

const UNAVAILABLE_HEADING = 'The gallery is unavailable.'
const UNAVAILABLE_CAUSE = 'The server could not read the list of published videos. The cause is unknown from here.'
const UNAVAILABLE_BODY = 'Nothing is shown from memory. The site\u2019s fallback thumbnails are keyed to that list, and a video withdrawn since the last deploy must not reappear, so no card is drawn without its record.'

const DEMO_LABEL = 'Sample reactions and comments \u00b7 made-up viewers, not real ones'

export function showSampleLabel(moments: MomentsPayload): boolean {
  if (moments.state !== 'ready' || !moments.social) return false
  if (moments.watchId && !moments.detail) return false
  if (moments.detail) return moments.social[moments.detail.id] !== undefined
  return moments.list.some(row => moments.social?.[row.id] !== undefined)
}

export function MomentsRegion({
  moments,
  catalogMode,
  search = '',
}: {
  moments: MomentsPayload
  catalogMode: CatalogMode
  search?: string
}) {
  const blocked = moments.state === 'ready' && !previewAllowed(moments.preview, catalogMode)
  const failed = blocked || moments.state !== 'ready'
  const watchId = moments.state === 'skipped' ? null : moments.watchId
  const showStub = (moments.state === 'ready' || moments.state === 'unavailable') && moments.preview && !blocked
  const wasWatch = useRef(false)
  useEffect(() => {
    if (failed) {
      const heading = watchId ? 'moments-watch-unavailable' : 'moments-unavailable-heading'
      document.getElementById(heading)?.focus()
      return
    }
    if (moments.state === 'ready' && moments.watchId && !moments.detail) {
      document.getElementById('moments-missing-heading')?.focus()
    }
    if (moments.state === 'ready' && moments.watchId) wasWatch.current = true
    else if (wasWatch.current && moments.state === 'ready' && !moments.watchId) {
      wasWatch.current = false
      document.getElementById('moments-gallery-heading')?.focus()
    }
  }, [failed, watchId, moments])
  let body
  if (failed) {
    body = watchId ? <WatchUnavailable search={search} /> : (
      <div className="moments-empty" role="status">
        <h2 id="moments-unavailable-heading" tabIndex={-1}>{UNAVAILABLE_HEADING}</h2>
        <p>{UNAVAILABLE_CAUSE}</p>
        <p>{UNAVAILABLE_BODY}</p>
        <button type="button" onClick={() => window.location.reload()}>Try again</button>
      </div>
    )
  } else if (moments.state === 'ready' && moments.watchId && moments.detail) {
    body = <WatchPage detail={moments.detail} list={moments.list} search={search} thumbnail={moments.thumbnails[moments.detail.id]} address={moments.videoAddress} social={moments.social?.[moments.detail.id]} />
  } else if (moments.state === 'ready' && moments.watchId) {
    body = <WatchMissing search={search} />
  } else if (moments.state === 'ready') {
    body = <Gallery list={moments.list} search={search} thumbnails={moments.thumbnails} social={moments.social} videos={moments.videos} />
  }
  return (
    <main className="moments-gallery" aria-label="Moments" data-catalog={showStub ? 'stub' : undefined}>
      {showStub ? <p className="moments-preview">Stub catalog · synthetic records</p> : null}
      {showSampleLabel(moments) ? <p className="moments-preview">{DEMO_LABEL}</p> : null}
      {body}
    </main>
  )
}

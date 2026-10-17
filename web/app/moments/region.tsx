'use client'

import { useEffect, useRef } from 'react'
import type { CatalogMode, MomentsPayload } from '../../lib/catalog/types'
import { previewAllowed } from '../../lib/catalog/request'
import { Gallery } from './gallery'
import { WatchMissing, WatchPage, WatchUnavailable } from './watch'

const UNAVAILABLE_HEADING = 'The gallery is unavailable.'
const UNAVAILABLE_CAUSE = 'The server could not read the list of published videos. The cause is unknown from here.'
const UNAVAILABLE_BODY = 'Nothing is shown from memory. The site\u2019s fallback thumbnails are keyed to that list, and a video withdrawn since the last deploy must not reappear, so no card is drawn without its record.'

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
  const preview = !blocked && (moments.state === 'ready' || (moments.state === 'unavailable' && moments.preview))
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
    body = <WatchPage detail={moments.detail} list={moments.list} search={search} storageOrigin={moments.storageOrigin} />
  } else if (moments.state === 'ready' && moments.watchId) {
    body = <WatchMissing search={search} />
  } else if (moments.state === 'ready') {
    body = <Gallery list={moments.list} search={search} storageOrigin={moments.storageOrigin} />
  }
  return (
    <main className="moments-gallery" aria-label="Moments" data-catalog={preview ? 'stub' : undefined}>
      {preview ? <p className="moments-preview">Preview catalog</p> : null}
      {body}
    </main>
  )
}

'use client'

import { useEffect } from 'react'
import type { CatalogMode, MomentsPayload } from '../../lib/catalog/types'
import { previewAllowed } from '../../lib/catalog/request'
import { Gallery } from './gallery'

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
  const unavailable = blocked || moments.state !== 'ready'
  const preview = !blocked && (moments.state === 'ready' || (moments.state === 'unavailable' && moments.preview))
  useEffect(() => {
    if (!unavailable) return
    document.getElementById('moments-unavailable-heading')?.focus()
  }, [unavailable])
  return (
    <main className="moments-gallery" aria-label="Moments" data-catalog={preview ? 'stub' : undefined}>
      {preview ? <p className="moments-preview">Preview catalog</p> : null}
      {unavailable || moments.state !== 'ready' ? (
        <div className="moments-empty" role="status">
          <h2 id="moments-unavailable-heading" tabIndex={-1}>{UNAVAILABLE_HEADING}</h2>
          <p>{UNAVAILABLE_CAUSE}</p>
          <p>{UNAVAILABLE_BODY}</p>
          <button type="button" onClick={() => window.location.reload()}>Try again</button>
        </div>
      ) : (
        <Gallery list={moments.list} search={search} storageOrigin={moments.storageOrigin} />
      )}
    </main>
  )
}

'use client'

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

export function cardPicture(row: CatalogListRow, storageOrigin: string | null): string | null {
  if (row.thumbnail_bucket && row.thumbnail_object_path && storageOrigin) {
    const stored = storageAddress(row.thumbnail_bucket, row.thumbnail_object_path, storageOrigin)
    if (stored) return stored
  }
  return siteCopyPath(row.id)
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
  const frame = cardFrame(row)
  const picture = cardPicture(row, storageOrigin)
  const href = mergeWatch(search, '', 'moments', row.id)
  return (
    <article data-kind="generated" data-moment={row.id} className="moments-card">
      {picture ? (
        <a href={href} aria-hidden="true" tabIndex={-1} className="moments-cover" style={frame ? { aspectRatio: frame } : undefined}>
          <img alt="" decoding="async" loading="lazy" src={picture} />
        </a>
      ) : (
        <div className="moments-cover" style={frame ? { aspectRatio: frame } : undefined} />
      )}
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

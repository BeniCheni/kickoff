'use client'

import { useEffect, useState } from 'react'
import type { CatalogListRow } from '@kickoff/catalog'
import type { ThumbnailSources } from '../../lib/catalog/types'
import { readSavedReferences, writeSavedReferences, type SavedReferences } from '../../../src/lib/momentsSaved'
import { VideoCard, savedIdSet } from './card'
import { applyOrder, matchingRows, shuffleIds, type BrowseOrder, type SubjectFilter } from './order'
import type { MomentSocial } from '../../lib/catalog/types'

const emptySaved: SavedReferences = { ids: [], persistence: 'local', reason: null }

export function Gallery({
  list,
  search,
  thumbnails,
  initialSaved = emptySaved,
  freezeSaved = false,
  random = Math.random,
  initialSubject = 'all',
  initialOrder = 'beni',
  initialSavedOnly = false,
  social,
  videos,
}: {
  list: readonly CatalogListRow[]
  search: string
  thumbnails: Record<string, ThumbnailSources>
  initialSaved?: SavedReferences
  freezeSaved?: boolean
  random?: () => number
  initialSubject?: SubjectFilter
  initialOrder?: BrowseOrder
  initialSavedOnly?: boolean
  social?: Record<string, MomentSocial>
  videos?: Record<string, string | null>
}) {
  const [subject, setSubject] = useState<SubjectFilter>(initialSubject)
  const [order, setOrder] = useState<BrowseOrder>(initialOrder)
  const [savedOnly, setSavedOnly] = useState(initialSavedOnly)
  const [permutation, setPermutation] = useState<string[] | null>(null)
  const [previous, setPrevious] = useState<string[] | null>(null)
  const [saved, setSaved] = useState(initialSaved)
  const [entranceIds] = useState(() => {
    const ids = savedIdSet(initialSaved)
    return applyOrder(matchingRows(list, initialSubject, initialSavedOnly, ids), initialOrder, null).slice(0, 8).map(row => row.id)
  })
  useEffect(() => {
    if (!freezeSaved) setSaved(readSavedReferences())
  }, [freezeSaved])
  const savedIds = savedIdSet(saved)
  const filtered = matchingRows(list, subject, savedOnly, savedIds)
  const shown = applyOrder(filtered, order, permutation)
  const filtersActive = subject !== 'all' || savedOnly
  const noResults = shown.length === 0 && (list.length > 0 || filtersActive)
  const visitOnly = saved.persistence === 'visit-only'
  function clearPermutation() {
    setPermutation(null)
    setPrevious(null)
  }
  function chooseSubject(next: SubjectFilter) {
    setSubject(next)
    clearPermutation()
  }
  function chooseOrder(next: BrowseOrder) {
    setOrder(next)
    clearPermutation()
  }
  function chooseSaved(next: boolean) {
    setSavedOnly(next)
    clearPermutation()
  }
  function shuffle() {
    const current = shown.map(row => row.id)
    const next = shuffleIds(current, random)
    if (next.join('\0') === current.join('\0')) return
    setPrevious(current)
    setPermutation(next)
  }
  function undo() {
    if (!previous) return
    setPermutation(previous)
    setPrevious(null)
  }
  function restore() {
    setOrder('beni')
    clearPermutation()
  }
  function clearFilters() {
    setSubject('all')
    setSavedOnly(false)
    clearPermutation()
  }
  function toggleSave(id: string) {
    const next = savedIds.has(id) ? saved.ids.filter(savedId => savedId !== id) : [...saved.ids, id]
    setSaved(writeSavedReferences(next))
  }
  return (
    <>
      <header className="moments-edition-head">
        <div>
          <p className="moments-eyebrow">Kickoff Studio · generated video</p>
          <h1 id="moments-gallery-heading" tabIndex={-1}>Fenway and Frankenstein.</h1>
        </div>
        <p className="moments-count">{shown.length} of {list.length} videos</p>
        <p className="moments-edition-note">Generated in the Studio · never a match still</p>
      </header>
      <details className="moments-filters" open>
        <summary>Find a video <span>{shown.length} / {list.length}</span></summary>
        <div className="moments-filter-fields">
          <label>
            Subject
            <select aria-label="Subject" value={subject} onChange={event => chooseSubject(event.target.value as SubjectFilter)}>
              <option value="all">All subjects</option>
              <option value="Fenway">Fenway</option>
              <option value="Frankenstein">Frankenstein</option>
            </select>
          </label>
          <label>
            Browse order
            <select aria-label="Browse order" value={order} onChange={event => chooseOrder(event.target.value as BrowseOrder)}>
              <option value="beni">Beni’s order</option>
              <option value="newest">Newest generated</option>
            </select>
          </label>
          <label className="moments-check">
            <input type="checkbox" checked={savedOnly} onChange={event => chooseSaved(event.target.checked)} />
            Saved only
          </label>
        </div>
        <p>A video with both cats matches either subject. All subjects shows every video.</p>
        <p>Newest uses the date generated, read from the record. Ties follow Beni’s order. Every video here is generated; the Generated label is never filtered away.</p>
      </details>
      <div className="moments-order-controls">
        <button type="button" className="moments-button" onClick={shuffle}>Shuffle remaining</button>
        <button type="button" className="moments-button" onClick={undo} disabled={previous === null} aria-disabled={previous === null} tabIndex={previous === null ? -1 : undefined}>Undo shuffle</button>
        <button type="button" className="moments-button" onClick={restore}>Restore Beni’s order</button>
        {order === 'beni' && permutation === null ? <p>Beni’s order for the remainder</p> : null}
      </div>
      {visitOnly ? <p role="status">Saved for this visit only. Browser storage refused the update.</p> : null}
      {noResults ? (
        <div className="moments-empty">
          <h2>No videos match.</h2>
          <p>No video is active. Clear filters to browse the gallery.</p>
          <button type="button" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="moments-cards">
          {shown.map(row => (
            <VideoCard
              key={row.id}
              row={row}
              search={search}
              thumbnail={thumbnails[row.id]}
              saved={savedIds.has(row.id)}
              visitOnly={visitOnly}
              onToggleSave={toggleSave}
              social={social?.[row.id]}
              videoSrc={videos?.[row.id] ?? null}
              enterIndex={entranceIds.indexOf(row.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

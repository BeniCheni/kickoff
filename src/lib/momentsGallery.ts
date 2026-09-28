import type { Moment } from './moments'

/** An isolated harness can exercise a queue without inventing football/source identities. */
export type UnlinkedSelection = {
  id: string
  title: string
  illustration: { label: string; chronology: string }
  fixture?: never
  source?: never
  category?: never
  curatedAt?: never
  editorial?: never
}
export type GalleryMoment = Moment | UnlinkedSelection
export type GalleryFilters = { competition: string; category: string; savedOnly: boolean }
export const ALL_MOMENTS: GalleryFilters = { competition: 'all', category: 'all', savedOnly: false }

export function matchesMoment(moment: GalleryMoment, filters: GalleryFilters): boolean {
  return (filters.competition === 'all' || moment.fixture?.competition === filters.competition)
    && (filters.category === 'all' || moment.category === filters.category)
}
export function momentTitle(moment: GalleryMoment, spoiler: boolean): string {
  if (!spoiler || !moment.fixture) return moment.title
  return moment.editorial?.neutralTitle ?? 'A moment from this fixture'
}
export function momentNote(moment: GalleryMoment, spoiler: boolean): string {
  if (!moment.fixture) return moment.illustration.label
  return spoiler ? moment.editorial?.neutralNote ?? 'Revealing editorial copy is hidden.' : moment.editorial?.note ?? ''
}
export function knownKickoff(moment: GalleryMoment): boolean {
  return !!moment.fixture && moment.fixture.timeConfidence === 'exact'
    && !['postponed', 'cancelled'].includes(moment.fixture.status)
}
/** Unknown instants sort after known fixtures, retaining their authored relative order.
 * Equal verified instants retain editorial ties. No curation/upload chronology is used. */
export function newestMoments(edition: readonly GalleryMoment[]): string[] {
  const time = (m: GalleryMoment) => m.fixture
    ? knownKickoff(m) ? Date.parse(m.fixture.kickoffUtc) : -Infinity
    : Date.parse(m.illustration.chronology)
  return edition.map((m, index) => ({ id: m.id, instant: time(m), index }))
    .sort((a, b) => (a.instant === b.instant ? 0 : a.instant > b.instant ? -1 : 1) || a.index - b.index)
    .map(m => m.id)
}

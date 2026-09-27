import type { Moment } from '../../../src/lib/moments'
import type { UnlinkedSelection } from '../../../src/lib/momentsGallery'
import { historicalObservations } from './historicalObservations'

// R3 archival examples ONLY. Date-only fixture placeholders are explicitly tbd; no
// exact kickoff, present availability or permission is claimed by this harness input.
export const archivalEdition: Moment[] = [
  { id: 'pkEpLtePJm0', category: 'highlights', fixtureId: 'archive:2019-05-07', title: 'The voices of that night.',
    curatedAt: '2026-09-21T00:22:38Z',
    fixture: { home: { name: 'Liverpool' }, away: { name: 'Barcelona' }, competition: 'ucl',
      kickoffUtc: '2019-05-07T12:00:00Z', timeConfidence: 'tbd', status: 'full_time' },
    source: { name: 'Liverpool FC / YouTube', url: 'https://www.youtube.com/watch?v=pkEpLtePJm0', identity: { provider: 'youtube', videoId: 'pkEpLtePJm0' },
      content: { scope: 'commentary-reaction', description: 'Commentary-reaction reel', verification: 'source-described' },
      availability: historicalObservations.pkEpLtePJm0!.observations },
    editorial: { cover: 'voices', note: 'A match remembered through the people calling it. A commentary-reaction reel, not a verified standalone goal clip.', neutralTitle: 'Commentary from the archive', neutralNote: 'Revealing editorial copy is hidden.' } },
  { id: 'iBuTEywEQ6U', category: 'highlights', fixtureId: 'archive:2023-03-05', title: 'Seven. And all that noise.',
    curatedAt: '2026-09-21T00:22:38Z',
    fixture: { home: { name: 'Liverpool' }, away: { name: 'Manchester United' }, competition: 'pl',
      kickoffUtc: '2023-03-05T12:00:00Z', timeConfidence: 'tbd', status: 'full_time' },
    source: { name: 'Liverpool FC / YouTube', url: 'https://www.youtube.com/watch?v=iBuTEywEQ6U', identity: { provider: 'youtube', videoId: 'iBuTEywEQ6U' },
      content: { scope: 'highlights', description: '7–0 highlights compilation', verification: 'source-described' },
      availability: historicalObservations.iBuTEywEQ6U!.observations },
    editorial: { cover: 'seven', note: 'The official highlights, kept with their source context. This upload was owner-blocked in the recorded test; no territory diagnosis.', neutralTitle: 'Match highlights from the archive', neutralNote: 'Revealing editorial copy is hidden.' } },
  { id: 'sXAkBsEcXSo', category: 'celebrations', fixtureId: 'archive:2025-05-25', title: 'Stay for the celebration.',
    curatedAt: '2026-09-21T00:22:38Z',
    fixture: { home: { name: 'Liverpool' }, away: { name: 'Crystal Palace' }, competition: 'pl',
      kickoffUtc: '2025-05-25T12:00:00Z', timeConfidence: 'tbd', status: 'full_time' },
    source: { name: 'Liverpool FC / YouTube', url: 'https://www.youtube.com/watch?v=sXAkBsEcXSo', identity: { provider: 'youtube', videoId: 'sXAkBsEcXSo' },
      content: { scope: 'celebration', description: 'Premier League trophy celebration', verification: 'source-described' },
      availability: historicalObservations.sXAkBsEcXSo!.observations },
    editorial: { cover: 'together', note: 'After the match, the shared release. Ceremony excerpts were observed; the exact initial lift and complete upload were not verified.', neutralTitle: 'A ceremony from the archive', neutralNote: 'Revealing editorial copy is hidden.' } },
]

export const fictionalEdition: UnlinkedSelection[] = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 1), title: `Fictional selection ${i + 1}`,
  illustration: { label: 'Fictional queue example · no fixture, competition or source', chronology: `2000-01-0${i + 1}T12:00:00Z` },
}))

import type { CatalogDetailRow, CatalogListRow } from '@kickoff/catalog'
import { durationClock, generatedDate } from './format'
import { beniOrder } from './order'

const FICTIONAL = 'Fictional players. Fenway and Frankenstein are cats. No real club, player, kit, crest, sponsor or competition is depicted or intended.'
const OPENING = 'Opening a video does not mark it watched.'
const K0 = 'Thumbnail K0, the keyframe the clip starts from'
const HOSTED = 'Hosted clip. Supabase Storage serves the file from the path stored in the record, as video/mp4 set at upload (the thumbnail image/jpeg), and sees each play; it is named on the Privacy page. There is no outside page for a generated clip.'

export function metaLine(detail: CatalogDetailRow): string {
  const parts = [`Generated ${generatedDate(detail.generated_at)}`]
  const clock = durationClock(detail.duration_s)
  if (clock) parts.push(clock)
  if (detail.width !== null && detail.height !== null && detail.width > 0 && detail.height > 0) {
    parts.push(`${detail.width} \u00d7 ${detail.height}`)
  }
  return parts.join(' \u00b7 ')
}

export function provenanceLines(detail: CatalogDetailRow, list: readonly CatalogListRow[]): string[] {
  const ordered = beniOrder(list)
  const place = ordered.findIndex(row => row.id === detail.id) + 1
  const source = [
    'Kickoff Studio',
    `generated ${generatedDate(detail.generated_at)}`,
    detail.kept_at ? `reviewed and kept ${generatedDate(detail.kept_at)}` : null,
    `published ${generatedDate(detail.published_at)}`,
    `Beni\u2019s order ${place} of ${ordered.length}`,
  ].filter((part): part is string => part !== null).join(' \u00b7 ')
  const model = [`Model ${detail.endpoint}`, `pinned ${detail.pinned_on}`]
  if (detail.seed !== null) model.push(`seed ${detail.seed}`)
  const file = [`File ${detail.mime}`]
  if (detail.duration_s !== null) file.push(`${detail.duration_s} s`)
  if (detail.width !== null && detail.height !== null && detail.width > 0 && detail.height > 0) {
    file.push(`${detail.width} \u00d7 ${detail.height}`)
  }
  if (/^[0-9a-fA-F]{64}$/.test(detail.sha256)) {
    file.push(`SHA-256 ${detail.sha256.slice(0, 8)}\u2026${detail.sha256.slice(-4)}`)
  }
  const hosted = detail.mime === 'video/mp4' && detail.thumbnail_mime === 'image/jpeg'
    ? HOSTED
    : `Hosted clip. Supabase Storage serves the file from the path stored in the record, as ${detail.mime} set at upload (the thumbnail ${detail.thumbnail_mime}), and sees each play; it is named on the Privacy page. There is no outside page for a generated clip.`
  return [
    source,
    model.join(' \u00b7 '),
    FICTIONAL,
    detail.attestation_summary,
    file.join(' \u00b7 '),
    detail.thumbnail_is_keyframe === true ? K0 : null,
    hosted,
    OPENING,
  ].filter((line): line is string => line !== null)
}

export function upNextSplit(list: readonly CatalogListRow[], id: string): { earlier: CatalogListRow[]; next: CatalogListRow[] } {
  const ordered = beniOrder(list)
  const index = ordered.findIndex(row => row.id === id)
  if (index < 0) return { earlier: [], next: [] }
  return { earlier: ordered.slice(0, index), next: ordered.slice(index + 1) }
}

const QUOTE_OPEN = '\u201c'
const QUOTE_CLOSE = '\u201d'

export function nextSentence(title: string | null): string {
  return title === null
    ? 'There is no next video in Beni\u2019s order.'
    : `Next opens ${QUOTE_OPEN}${title}${QUOTE_CLOSE}.`
}

export function recoveryCopy(code: 2 | 3 | 4, nextTitle: string | null, autoplayOn: boolean): { heading: string; body: string } {
  const next = nextSentence(nextTitle)
  const stopped = autoplayOn ? ' Autoplay next stopped here. Nothing is skipped past a failure.' : ''
  if (code === 2) {
    return {
      heading: 'The clip did not arrive.',
      body: `The media host did not answer, or the connection dropped. The cause is unknown. Retry asks for the file again. ${next}${stopped}`,
    }
  }
  if (code === 3) {
    return {
      heading: 'The clip arrived but will not decode.',
      body: `This browser could not decode the file. Retry will not change that; another browser may. ${next}${stopped}`,
    }
  }
  return {
    heading: 'No playable file at the published address.',
    body: `The media host served nothing this browser can play. The record is unchanged. ${next}${stopped}`,
  }
}

export function countdownAnnouncement(title: string): string {
  return `Up next in five seconds: ${QUOTE_OPEN}${title}${QUOTE_CLOSE}. Cancel stops it.`
}

export function countdownVisible(seconds: number, title: string): string {
  return `Up next in ${seconds} s \u00b7 ${QUOTE_OPEN}${title}${QUOTE_CLOSE}`
}

export function refusedStatus(title: string): string {
  return `${QUOTE_OPEN}${title}${QUOTE_CLOSE} is loaded. This browser needs a press to start it.`
}

export function nowPlayingStatus(title: string): string {
  return `Now playing ${QUOTE_OPEN}${title}${QUOTE_CLOSE} \u00b7 sound on \u00b7 the soundtrack is generated. Mute in the player.`
}

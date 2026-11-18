import { META, SYNC_STAMP } from '../lib/fixtures'
import { Glyph } from './glyphs'

/** Amber, Kickoff Mono 400, never a control. "SYNCED <stamp>" does not break.
 *  The glyph stays with the version, so a wrap at 360 leaves it on the first line. */
export function ProvenanceLine({ version }: { version: string }) {
  return (
    <p className="provenance" data-provenance="" data-voice="amber">
      <span className="provenance-lead">
        <Glyph name="sync" />
        <span>v{version}</span>
      </span>
      <span className="provenance-chunk">{` · ${META.total} fixtures`}</span>
      <span className="provenance-sync">{` · SYNCED ${SYNC_STAMP}`}</span>
    </p>
  )
}

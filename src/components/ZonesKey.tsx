import { useId, type CSSProperties } from 'react'
import { zoneRange, type LeagueTableMeta, type Zone } from '../lib/competitions'
import { Glyph } from './glyphs'

/**
 * A zone's mark: the 3px band beside a row or a key entry, or the 8px square in a zone header
 * and on the closed key. Colour says where a zone leads; a broken mark says it is not settled
 * yet. The zone names its kind and, where it leads to a competition, that competition's hue;
 * the stylesheet draws the kind. With no zone it draws nothing and keeps its place.
 */
export function ZoneMark({ zone, shape }: { zone: Zone | null; shape: 'band' | 'square' }) {
  return (
    <span
      className={`zone-mark zone-mark-${shape}`}
      data-band={zone?.band}
      style={zone?.color ? ({ '--zone-hue': zone.color } as CSSProperties) : undefined}
      aria-hidden="true"
    />
  )
}

/** "2026-27" for the season that starts in 2026. */
function seasonLabel(start: number): string {
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`
}

/**
 * Zones & key: a 44px disclosure between the league tabs and the table head. Closed, it shows
 * a square per zone. Open, it holds three things in the app's own words and nothing inside it
 * is a control: the qualification zones, the columns, and how ties are broken.
 *
 * When the zone data describes a different season from the snapshot the bands are hidden, the
 * closed bar loses its squares, and the first thing inside the opened key says so, in ink.
 */
export function ZonesKey({
  meta,
  open,
  onToggle,
  zonesCurrent,
  snapshotSeason,
  zonesSeason,
}: {
  meta: LeagueTableMeta
  open: boolean
  onToggle: () => void
  /** The zone ranges describe the season the snapshot holds. */
  zonesCurrent: boolean
  snapshotSeason: number
  zonesSeason: number
}) {
  const panel = useId()
  return (
    <div className="zones-key" data-open={open ? '' : undefined}>
      <button
        type="button"
        className="zones-key-bar"
        aria-expanded={open}
        aria-controls={open ? panel : undefined}
        onClick={onToggle}
      >
        <span className="zones-key-chevron"><Glyph name="chevron" /></span>
        <span className="zones-key-title">Zones &amp; key</span>
        {zonesCurrent && (
          <span className="zones-key-squares">
            {meta.zones.map((zone) => <ZoneMark key={zone.name} zone={zone} shape="square" />)}
          </span>
        )}
      </button>

      {open && (
        <div id={panel} className="zones-key-panel" data-voice="ink">
          {!zonesCurrent && (
            <p className="zones-key-season" data-season-note="">
              Zone bands are hidden: the snapshot is the {seasonLabel(snapshotSeason)} season but the zone
              metadata describes {seasonLabel(zonesSeason)}.
            </p>
          )}

          <p className="zones-key-heading" data-voice="muted">Qualification zones</p>
          <ul className="zones-key-zones">
            {meta.zones.map((zone) => (
              <li key={zone.name} className="zones-key-zone">
                <ZoneMark zone={zonesCurrent ? zone : null} shape="band" />
                <span className="zones-key-zone-name">
                  {zone.name} <span className="zones-key-zone-range" data-voice="muted">{zoneRange(zone)}</span>
                </span>
                <span className="zones-key-zone-note">{zone.note}</span>
              </li>
            ))}
          </ul>

          <div className="zones-key-pair">
            <div>
              <p className="zones-key-heading" data-voice="muted">Columns</p>
              <p className="zones-key-copy">
                <b>Pts</b> points · <b>Pl</b> played · <b>GD</b> goal difference · <b>PPG</b> points per
                game — {meta.phase ? 'different opponents limit the comparison' : 'the honest comparator while clubs have games in hand'} · <b>Form</b> results oldest
                to newest, W / D / L lettered, not colour alone · <b>Next</b> the club's next{' '}
                {meta.phase ? <>match in this competition; domestic and other cup ties are not shown here.</> : <><i>league</i> match — midweek European and cup ties are not shown here.</>}
              </p>
            </div>
            <div>
              <p className="zones-key-heading" data-voice="muted">How ties are broken</p>
              <p className="zones-key-copy">{meta.tieBreak}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

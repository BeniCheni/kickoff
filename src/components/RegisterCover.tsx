/**
 * The Register's short cover: full width, black stock, with an art window of 150 to 250px
 * above the title block.
 *
 * The art window is flat stock. Its photograph, the photograph's caption and the tagline
 * arrive with the photographs, and the title's foil with the motion layer; nothing stands
 * in for them here, so there is nothing on this cover that the snapshot did not supply
 * except the book's name.
 *
 * The line is the app's own: the league being read and "As of matchday N of M", with the
 * phase where the competition has one. It breaks at a middot only. When the page was synced
 * is the band's provenance line, directly above, and the foot's: the standings and the
 * fixtures are written by one sync run, so one stamp serves both (tests/tableProvenance.test.ts).
 */
export function RegisterCover({ league, asOf }: { league: string; asOf: string | null }) {
  return (
    <div className="register-cover" data-stock="black">
      <div className="register-cover-art" aria-hidden="true" />
      <div className="register-cover-block">
        <p className="register-cover-label" data-voice="muted">A Fergie Time Book · The Register</p>
        <p className="register-cover-title" data-voice="ink">The Register</p>
        <p className="register-cover-line" data-voice="ink">
          <span>{league}</span>
          {asOf && <> · <span>{asOf}</span></>}
        </p>
      </div>
    </div>
  )
}

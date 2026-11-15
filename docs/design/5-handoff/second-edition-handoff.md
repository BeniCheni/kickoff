# Fergie Time, second edition — Claude Design's handoff (archived Sat 14 Nov 2026, TZ=America/New_York)

Archived by the PM seat (Claude Code, Opus 5.5) on Beni's word of 14 Nov 2026, unedited below the
line. Paths in it (`images/…`, `fal/…`, `kickoff-revamp-b2.pen`) are the local design folder's,
which stays on Beni's Mac. The boards it names are archived beside it as WebP previews
(`03-…` to `19-…`), the fal record as `fal-provenance.jsonl` with its cost fields and download
links removed, and the photographs it lists as previews in [`../4-photographs/`](../4-photographs/).
The Claude Design canvas it describes was not exported. Its open questions were answered on
14 Nov 2026: see [`../../design-overhaul-plan-review.md`](../../design-overhaul-plan-review.md).

---

# Fergie Time, second edition — design handoff

Written 13 Nov 2026 (Brooklyn) by the Claude Design seat, from the handoff set in `kickoff-revamp-b2/exports/handoff/`. This is the input for the implementation prompt. It is not the prompt. Revised the same day after Beni's review: his rulings and the fix pass are folded into every section, and section 14 lists what the review changed.

**Status.** A proposal, reviewed by Beni on 13 Nov 2026: twelve questions are ruled, one is closed and eight stay open (section 11). The Fergie Time design system has not been changed; Beni publishes the second edition into it after review. No file in the repository was changed, no code was written, no version number was chosen, no photograph was generated, and no real money figure appears anywhere.

**Where the boards are.** The Claude Design project "Fergie Time — second edition", four pages: 01 System (Read me first, Tokens, Voice map, Type, Imagery, Motion), 02 Components (Page chrome, The books, Rows and states, Page controls, The Table), 03 Templates (Poster, Ledger and Table at 390, 360 and 1000 in both themes; Quiet week; UEFA week at 390 and 360; States sheet in both themes; Moments shell), 04 Handoff (Retired, Open questions). This document travels with the canvas's files as `project/handoff/second-edition-handoff.md`.

**Ground truth.** `src/index.css` and `src/lib/competitions.ts` in github.com/BeniCheni/kickoff are the source of truth. Every token below is a proposal that the build moves into `src/index.css`. Data on every board is the snapshot synced 2026-11-11T07:48Z; fixtures, times, results and table figures were copied from the attached boards and nothing else, except the Premier League's W, D and L, which came with the review from the standings snapshot of 11 Nov 2026. Titles, taglines and margin asides are the imprint's fiction. Anything else invented is captioned ILLUSTRATIVE.

**Spec precedence.** Rulings D1 to D14 and the clearing, then the rules note as amended in section 9, then this document, then the Claude Design boards, then the Pen boards. Where a Pen board and this document disagree, section 10 lists the difference.

## 1. What changed in Fergie Time

The second edition is a layer of `fb-` tokens beside the first edition's, never over it. It adds two paper stocks, a black cover stock and a blue-black dark page; blood as the imprint's binding and as the alarm voice; rift green as light only; three type families; photographs behind covers, plates and empty states; and a separate layer of decorative motion with one stop control. It adds these primitives: imprint band, cover face, the Rack, spine, part opener, contents row, Ledger row and the "more" control.

Against the reviewed spike boards it corrects eleven things. LIVE moves from pitch green to the alarm voice. The Brooklyn clock and full-time scores are set in pitch (the boards drew ink). The current rack marker and the reading spine take the pitch underline (the boards used blood and rift). Amber has eight uses, not three. Orbitron, Courier Prime and Caveat are cut. Every stadium clock reads 24-hour then the word local (`20:30 local`), never a zone abbreviation or an offset. The series line is retired from every cover. Controls sit on a 44 px pitch, so the imprint band grows 6 px and the league tabs 28 px. Form-pip letters rise to 10 px and take their own line. The week row's year follows a date rule, not a width. Goals are written GF–GA with an en dash.

## 2. Tokens

Two axes: **mode** is light or dark (the page); **stock** is paper or black (the surface). A dark page resolves every surface to the black-stock voices.

| Token | Paper stock, light | Black stock / dark page | Voice | Used for |
|---|---|---|---|---|
| `fb-pulp` | `#EBDDBE` | `#0E1420` | ground | Page stock: Poster contents, the Table, state notes |
| `fb-typescript` | `#EDE9DD` | `#0E1420` | ground | The Ledger's stock and its imprint band |
| `fb-cover-black` | `#0A0A0C` | `#0A0A0C` | ground | Imprint band, covers, plates, shelf, the Rack, the quiet week |
| `fb-pulp-ink` | `#1C1611` | `#E9E4D4` | ink speaks | Book text, names, table figures, date lines, the W pip |
| `fb-pulp-muted` | `#4E4538` | `#A9A493` | ink, quieter | Venues, stadium clocks, captions, asides, leader dots |
| `fb-cover-ink` | `#F2EBDD` (black stock only) | same | ink speaks | Titles, names and date lines on covers; text on blood and on the paper NEXT pill |
| `fb-cover-muted` | `#A69E8F` (black stock only) | same | ink, quieter | Stadium clocks on covers, ILLUSTRATIVE captions, inactive tabs |
| `fb-pitch` | `#1E5636` | `#56C083` | pitch confirms | Brooklyn clock, full-time score, Today, active tab and marker, the NEXT pill's ground |
| `fb-amber` | `#6E4B00` | `#F7C948` | amber: data trust | Eight uses, section 3 |
| `fb-alarm` | `#B3121B` | `#FF7074` | blood alarms | Alarm words set as bare text: Ledger status words, the 72-hour banner. New token |
| `fb-blood` | `#B3121B` | `#B3121B` | binding; the alarm pill's ground | Imprint foot, spine head, aside rule, part tick, L pip, relegation band. A fill or a rule, never bare text |
| `fb-rift` | `#9DFFC8` | `#9DFFC8` | decoration | The tear, fog tint, the +5 lamp, part labels, spine-title glow. Light only |
| `fb-on-pitch` | `#F2EBDD` | `#0A0A0C` | ink | The word NEXT on its pill |
| `fb-rule` | pulp-ink at 22% | ink at 18 to 20% | line | Hairlines. `fb-rule-strong` is the same ink at 50 to 55% |
| `fb-scrim` | `#0A0A0C` at 92% | same | ground | Under every word over a photograph. Never under 90% |
| `fb-torch` | none | `#E8B36F` at 20% | decoration | Dark Poster only: a 130 px pool under the ink, resting on NEXT |
| `fb-foil` | `#E8D9B8`, `#FF7AB8`, `#C9A2FF`, `#7FE0FF`, `#B8F5A0` | same | decoration | Display titles on black stock, clipped to live glyphs. No stop between 35° and 65° of hue |
| `comp-*` | the fourteen first-edition hues | unchanged | competition | An 8 px dot, a zone band. Never text, never a tint |

Type and measure tokens: `fb-display` Abril Fatface, `fb-book` Libre Caslon Text, `fb-neon` Chakra Petch, `fb-label` Oswald, `fb-mono` IBM Plex Mono; `fb-gutter` 16 px; `fb-measure` 640 px (Poster and Ledger at 1000); `fb-measure-register` 780 px (the Table at 1000).

### Measured pairs

WCAG 2.x contrast ratios computed from the flat values. Body text needs 4.5:1; large text needs 3:1. D9 puts all text on a flat plane, so these are the ratios the page has; the build measures again on rendered pages.

| Text | On | Ratio | Carries |
|---|---|---|---|
| pulp-ink `#1C1611` | pulp `#EBDDBE` | 13.32 | Names, figures |
| pulp-ink | typescript `#EDE9DD` | 14.76 | Ledger rows |
| pulp-muted `#4E4538` | pulp | 7.00 | Venue, stadium clock |
| pulp-muted | typescript | 7.75 | Ledger meta line |
| pitch `#1E5636` | pulp | 6.40 | Brooklyn clock, score, Today |
| pitch | typescript | 7.09 | Ledger clock, score |
| amber `#6E4B00` | pulp | 5.85 | Provenance, time not set |
| amber | typescript | 6.48 | Ledger provenance, KICKED OFF |
| alarm `#B3121B` | pulp | 5.17 | 72-hour banner |
| alarm | typescript | 5.73 | Ledger status words |
| cover-ink `#F2EBDD` | pitch `#1E5636` | 7.26 | NEXT pill on paper |
| cover-ink | blood `#B3121B` | 5.86 | Alarm pills, imprint foot, L pip |
| cover-ink | cover-black `#0A0A0C` | 16.68 | Wordmark, titles, names |
| cover-ink | scrim, worst case `#1E1E1F` | 14.04 | Title block over a photograph |
| cover-muted `#A69E8F` | cover-black | 7.45 | Inactive tabs, stadium clock |
| cover-muted | scrim, worst case | 6.27 | ILLUSTRATIVE caption |
| pitch `#56C083` | cover-black | 8.73 | Brooklyn clock on the cover band |
| pitch `#56C083` | scrim, worst case | 7.35 | The same over a photograph |
| pitch `#56C083` | dark pulp `#0E1420` | 8.13 | Brooklyn clock, dark page |
| amber `#F7C948` | cover-black | 12.62 | Provenance line |
| amber `#F7C948` | scrim, worst case | 10.63 | FIRST KICKOFF NOT SET |
| amber `#F7C948` | dark pulp | 11.76 | Provenance, dark page |
| alarm `#FF7074` | cover-black | 7.37 | A status word on black |
| alarm `#FF7074` | dark pulp | 6.86 | Status words, 72-hour banner, dark page |
| cover-black | pitch `#56C083` | 8.73 | NEXT pill on black and dark |
| pulp-ink `#E9E4D4` | dark pulp | 14.49 | Names, figures, dark page |
| pulp-muted `#A9A493` | dark pulp | 7.39 | Venue, stadium clock, dark page |
| pulp-ink `#E9E4D4` | torch pool, RGB 57 50 43 | 9.92 | Names in the lit pool |
| pulp-muted `#A9A493` | torch pool | 5.06 | The lowest pair on the dark page |
| pitch `#56C083` | torch pool | 5.56 | Clock in the pool |
| amber `#F7C948` | torch pool | 8.05 | Provenance in the pool |
| alarm `#FF7074` | torch pool | 4.70 | A status word in the pool |
| foil, darkest stop `#FF7AB8` | cover-black | 8.22 | Display title, large |
| foil, darkest stop | scrim, worst case | 6.92 | D8's floor is 4.5 |

"Scrim, worst case" is `fb-scrim` at 92% over a pure white pixel, which composites to `#1E1E1F`. No photograph can do worse, so those figures are floors by construction. The torch pool is measured at the spike's lit-paper centre.

Pairs that fail and are not allowed: blood `#B3121B` as text on cover-black, 2.84 (use `fb-alarm`); the first edition's accent `#D85A30` on pulp, 2.88; its floodlight `#C98A00` on pulp, 2.19; its pitch `#2C7A4B` on pulp, 3.91; the spike's amber `#8A5F00` on pulp, 4.20.

Rules that ride with the tokens. Text sits on one of three flat planes: pulp, typescript or cover-black; no paper texture, wear scan or photograph lies under text without the scrim. No text is under 10 px. Blood is a fill or a rule; an alarm read as bare text takes `fb-alarm`. Rift is light; it never carries a fact and never marks a state.

## 3. The voice map

| Voice | Paper · black | Where it appears, in full | Never |
|---|---|---|---|
| Ink speaks | `#1C1611` · `#F2EBDD` | Names, figures, date lines, labels, the FT pill, a live score, the W and D pips, control labels | A tint of another voice |
| Pitch confirms | `#1E5636` · `#56C083` | The Brooklyn clock wherever a kickoff is set; a full-time score; Today; the active tab's underline; the current rack marker and the reading spine; the NEXT pill's ground | LIVE; a kickoff not set; anything the snapshot does not know |
| Amber: data trust | `#6E4B00` · `#F7C948` | The eight uses of rule 4 | Foil, glow, hover, selection, a photograph's grade |
| Blood alarms | `#B3121B` · `#FF7074` | LIVE, POSTPONED, CANCELLED, SUSPENDED, ABANDONED; the staleness banner past 72 hours. Always a shouted word | A digit, a photograph, flicker |
| Rift (not a voice) | `#9DFFC8` | Light: the tear, fog tint, the +5 lamp, the part label, spine-title glow | A clock, score, status, tab, marker or control |
| Blood binding (not a voice) | `#B3121B` | Imprint foot, spine head, aside rule, part tick, L pip, relegation band | Beside a status word; as bare text |

The test that separates the two bloods: blood that says a word about a fixture's status or the data's age is an alarm; blood that says nothing is binding. Competition hues do not change.

**Rule 4, rewritten.** Amber means "check this number's provenance". It has eight uses and no others: (1) the sync line; (2) a kickoff the league has not set, on a row, a count line and a cover's date line (rule 9); (3) KICKED OFF, a match that has kicked off but whose result the snapshot does not have yet; (4) games in hand, the chip beside a club and the note above the table, because the points are not yet like for like; (5) the staleness banner from 24 to 72 hours after the sync, after which the banner passes to the alarm voice; (6) a result corrected at source; (7) a UEFA matchday line that is rescheduled or falls outside UEFA's published windows, while a computed line stays in ink; (8) a stadium clock whose zone is not known, which reads "local time not known". Six of the eight reconcile the rule with the first edition; Beni's ruling of 13 Nov 2026 adds the last two. It is `#6E4B00` on paper stock and `#F7C948` on black stock. Pitch green means confirmed, the opposite. Amber is never foil, glow or decoration, and no photograph is graded warm.

A computed UEFA matchday line stays ink. The word COMPUTED is the honesty there, and amber stays scarce: 445 of the snapshot's 1,484 fixtures already carry it.

**The alarm voice is blood.** Burnt orange `#D85A30` is 2.88:1 on pulp and cannot carry a word; darkened until it passes it becomes a second warm brown beside amber. It is also La Liga's competition hue, byte for byte. Blood is 5.17:1 on pulp and is what the reviewed boards drew for suspended, postponed, cancelled, abandoned and 72-hour staleness. The live app agrees on LIVE: its pill is the accent fill, and its KICKED OFF is the floodlight colour.

**Form pips.** W ink-filled, D outlined, L blood-filled (binding, not alarm), a dot for an empty slot; lettered, 10 px letters in 15 px squares. The first edition's were pitch, muted and accent. Ruled 13 Nov 2026: accepted as drawn.

## 4. Type

| Family | Styles kept | Job | Licence | Verdict |
|---|---|---|---|---|
| IBM Plex Mono | 400, 400 italic, 500, 600 | Every time, date, count, score, table figure, catalogue number; the whole Ledger; margin asides in the italic | SIL OFL 1.1 | Keeps |
| Oswald | 600, 700 | Caps labels: tabs, lens switch, competition names, status pills, imprint foot, captions | SIL OFL 1.1 | Keeps |
| Libre Caslon Text | 400, 400 italic | Team and club names on Poster and Table, taglines, venues, footers, banners | SIL OFL 1.1 | New |
| Abril Fatface | 400 | Display titles under the foil; the proposed wordmark | SIL OFL 1.1 | New |
| Chakra Petch | 700 | Day word, spine titles, part label, FT mark | SIL OFL 1.1 | New |
| Inter | as shipped | Moments' fenced content only; off the Fixtures and Table path | SIL OFL 1.1 | Held |
| Orbitron | none | Its two jobs move to Chakra Petch 700. It ships no Latin Extended subset | SIL OFL 1.1 | Retired |
| Courier Prime | none | Asides move to IBM Plex Mono Italic, already shipped | SIL OFL 1.1 | Retired |
| Caveat | none | One handwritten correction on the Ledger's foot; the line goes | SIL OFL 1.1 | Retired |

Licences were read on 13 Nov 2026 from each family's `METADATA.pb` in the Google Fonts repository (`google/fonts`, `ofl/`); the first edition's three are stated in its own `tokens/fonts.css`. The build self-hosts WOFF2 and keeps each family's `OFL.txt` beside it.

**The font-weight budget.** Ten styles in nine files on the Fixtures and Table path: Oswald as one variable file; IBM Plex Mono 400, 400 italic, 500, 600; Libre Caslon Text 400 and 400 italic; Abril Fatface 400; Chakra Petch 700. No other weight may be requested. Preload only Oswald, Plex Mono 500 and Caslon 400; the rest swap in. Subset to Latin and Latin Extended. Byte and paint budgets are set by measurement on a phone in the build.

**The scale.** Cover title Abril 36/1.02 (33 at 360, 40 on a full face). Day word Chakra Petch 36/1.0, .04em caps. Part label and FT mark Chakra Petch 11, .32em caps. Spine title Chakra Petch 12/1.15. Team names Caslon 17/1.25 (16 on the Table, 13 on the cover band). Tagline Caslon italic 13.5/1.3. Venue and footer Caslon 12/1.4; banner 14/1.35. Brooklyn clock Plex Mono 500 16/1.25 (11 on the cover band; 600 at 11.5 on the Ledger). Stadium clock Plex Mono 400 11/1.4 (10 on the cover band and Ledger), always smaller than the Brooklyn clock. Date line Plex Mono 500 11/1.5, .04em caps. Table figures Plex Mono 500 13/22, points 600 16. Provenance line Plex Mono 400 10/1.5, .03em caps. Aside Plex Mono italic 12.5/1.45. Caps label Oswald 600 10 to 12, .12 to .18em. Status pill Oswald 700 10/16, .1em; pip letter 10/15. Nothing is under 10 px.

**The wordmark (brand decision, still open: question 3).** Proposal A: Abril Fatface at 22 px on every lens, dropping the spike's separate Plex Mono wordmark on the Ledger. B is the first edition's Oswald 700 at the band's size. The templates draw A. The logo files, the K monogram, the +5 badge and the favicons are untouched either way.

**Glyphs (ruled 13 Nov 2026).** Six drawn stroke glyphs are the whole vocabulary: sync, pause, play, moon, filters, chevron. No emoji is set. The clearing only retires the television emoji; dropping the Statue of Liberty, the flags, the star and the magnifier was the spike's choice, and Beni accepted it as drawn. No icon library is introduced.

## 5. Components

Hit-area contract, for every control. (H1) A hit area of at least 44 × 44 px, made by padding; the drawn size stays as designed. (H2) Hit areas never overlap; where two controls sit closer than 44 px, the gap between their drawn edges is split at its midpoint and each takes what it still needs on its free sides. (H3) Controls that stack sit on a 44 px pitch; where a board drew a tighter pitch, the pitch wins and the page grows. (H4) A hit area never covers a line of data; it may cover its own label and empty ground. Focus is the browser's ring. Hover and pressed are ink shifts in 150 ms. Nothing scales or glows.

### Page chrome

**Imprint band.** Fixed chrome; never moves, shakes or sits under an effect; its motion-off still is itself. Black stock on Poster, Table, the quiet week and Moments; typescript stock on the Ledger. Three rows: a 44 px control row, a 44 px tab row, the provenance line. 118 px tall at 390 (the boards drew 112). Full width at 1000.

| Part | Drawn | Hit area | States |
|---|---|---|---|
| Wordmark | 22 px | none | Strap "Brooklyn · ET", 10 px |
| Motion control | 26 px circle | 44 × 44 | Running: outline, pause, "Stop motion". Stopped: filled, play, "Start motion", `aria-pressed="true"`. Persisted. First in reading order after the wordmark |
| Theme toggle | 26 px circle | 44 × 44 | Paper: outline. Dark: filled. 220 ms |
| Lens switch | 2 × 57 × 23 | 57 × 44 each | Poster, then Ledger. On segment ink-filled; thumb 180 ms. Shown on the Table, holding the last lens |
| +5 badge | 26 × 33 | none | The lamp is rift on its own black ground |
| Tabs | 22 px tall | 44 tall, at least 44 wide | Fixtures, Table, Moments. On: ink with the pitch underline `inset 0 -2.5px 0`, 150 ms |
| Provenance line | 10 px mono | none; never a control | Amber. One line at 390 and 1000; wraps at a middot at 360; "SYNCED 2026-11-11 07:48 UTC" is one unit; the glyph stays on the first line. Repeats in every page foot |

Where two meet, settled: the control row and the tab row are each 44 px; the provenance line starts under the tab row's hit area, so no area covers the stamp.

### The books

**Cover face.** A photograph under live type. Layers bottom to top: photograph (the only layer that zooms, shakes or burns), rift and fog, scrim, title block as live text, imprint foot, caption. Title block: title in foil, one date line, tagline, the lower fixtures band. Sizes: 330 × 413 on the Rack at 390; 300 × 413 at 360; 360 × 450 centre at 1000; a full cover is 390 × 488; a short cover (the Register, the quiet week) is full width with a 150 to 250 px art window.

Date-line forms (rule 9, 11 px Plex Mono, no year, breaks at a middot only, never shrinks): normal `FRI 20 NOV · 3 MATCHES · FIRST 2:30 PM ET`; not set `SUN 6 DEC · 22 MATCHES · FIRST KICKOFF NOT SET` with the ending in amber; closed `SUN 8 NOV · 24 MATCHES · FULL TIME`.

The lower band (D13): up to three fixtures in kickoff order, Brooklyn clock in pitch, stadium clock smaller in muted ink. Only a kickoff held by a single match is named; the first shared kickoff ends the list and becomes one count line (`+ 24 more, from 9:00 AM ET`). The band never chooses between tied fixtures. Names wrap to two lines at most; both clocks stay on one line and neither is dropped. Not set: an amber count and no fixture. Closed: results with scores in pitch and a count of the rest.

Band order (confirmed by Beni, 13 Nov 2026): the band follows kickoff order, earliest first, the same order as its date line, on every day including one that mixes groups. The contents rows below it follow the row order (group, then kickoff), so on a mixed-group day the rows lead with the European cups while the band and the date line lead with the day's earliest kickoff, whichever group it is in.

The closed book (D6): the cover turns to the dawn plate and is still, with motion on or off. No stake, price or pay-out.

Motion-off still: the photograph at 100%, the static foil, no drip. Not a control except as a Rack slide.

**The Rack.** Holds the week's matchday books in date order, then The Register (D11). One pass, then it rests on the next matchday's book. It never changes the contents below it; only a tap opens a book. Roles per the APG carousel: `aria-roledescription="carousel"` and `"slide"`; a slide and its marker are named by book and date ("Sixteen Bells, Sunday 22 November, 3 of 4"; "The Register, Premier League table"), never by catalogue number; the current marker carries `aria-current`; the live region is off while it rotates by itself.

| Part | Drawn | Hit area | States |
|---|---|---|---|
| Stop | 24 px tall | 44 px row | "Stop rotation" / "Start rotation"; mirrors the Motion control; first in the Rack's reading order |
| Marker | 34 × 22 | 44 × 44; gaps split at midpoint | Current: pitch underline; hold progress is a 1 px ink line. Four share Stop's row; eight take their own row (8 × 44). At 360 that row has 336 px inside its 12 px padding and eight markers need 352, so it runs 8 px into the padding on each side: all eight on one line at 44 px each, 4 px from the page edge. Nothing wraps or scrolls |
| Slide | the face | the whole face | Tap opens the book. The duration is open (question 21) |

Widths: 360, centre 300 px with 22 px slivers; 390, centre 330 px with 22 px slivers (art alone, no glyphs) and 8 px gutters; 1000, centre 360 × 450 with whole neighbours at 82%, turned about 24°, with live text. Motion-off still: flat faces, a still scorch under a still haze, no void, no recede; books change instantly; it never starts by itself. It stops on touch, focus, hover and a hidden tab; a pause holds the rotation only.

**Spine.** A control; the whole spine is its hit area, 176 px tall and never under 44 px wide. Blood head with the FT mark; title up the spine; catalogue number and match count level at the foot in Plex Mono with no effect. States: default (ink hairline, rift glow on the title); reading (ink frame, pitch underline at the foot, "Now reading", 14 px taller); muted (dashed frame, no glow, a plain line: "Next week · Mon 23 Nov · 3 matches"; it never says "the round"); motion off (calm neon, the pool at rest). At 360 the spines share the row at equal widths; at 1000 the shelf sits in the 640 px measure.

**Part opener.** A black plate, 156 px, clipped, over a photograph, with the part label and the day word on the scrim; then the day's date line on pulp with a hairline and a blood tick. Not a control. The burst plays around the word once on entry. Motion-off still: the calm word.

### Rows and states

Rows are not controls. Both clocks are always on the row and the TV pill is gone, so nothing expands on a fixture row. No row number (D12). No decorative motion.

**Contents row (Poster).** Line one: names in Caslon, a dotted leader, the Brooklyn clock in pitch. Line two: the pill if any, the competition's dot and name, the venue, the stadium clock. **Ledger row.** Line one: the Brooklyn clock in pitch, bold, the names, then a score and a status word if any. Line two: competition, venue, stadium clock, in caps.

Wrap rules (W1, W3): the name wraps; the Brooklyn clock stays on the first line and never wraps, shrinks or moves; on Poster the leader goes under 12 px; on the Ledger the name hangs against the clock column; the meta line breaks only at a middot; "15:30 local" is one unit; no ellipsis. Gutter 16 px at 360 and 390; the 640 px measure at 1000.

Stadium clocks (ruled 13 Nov 2026): every stadium clock reads 24-hour, then the word local: `20:30 local`, the live app's own word. It reads the same on every row, cover band, Table cell and NEXT UP card. It never prints a zone abbreviation (CET, GMT) and never an offset (GMT+5); either reads as a third clock. The Brooklyn clock is unchanged.

Row order, in both lenses, as the live app has it: by group (supercups, then European cups, then domestic leagues), then by kickoff. Fixtures that tie on both keep the snapshot's order and are never re-sorted by name, league or venue. Saturday 21 November at 9:00 AM reads Lazio v Lecce, then Como v Cagliari.

Three honesty states, none of which occurs in the snapshot, so every specimen is captioned ILLUSTRATIVE. They are drawn on the rows board and as K, L and M on the states sheet in both themes.

- **The matchday line outside its window** (amber, rule 4's seventh use): see the UEFA matchday line under Page controls.
- **Local time not known** (amber, rule 4's eighth use): where the stadium's zone is not known, the words "local time not known" take the stadium clock's place, in its face and size, on every row, cover band, Table cell and NEXT UP card. No time is guessed and the Brooklyn clock is unaffected. The Ledger's meta line is caps, so there it reads LOCAL TIME NOT KNOWN.
- **The day note** (muted ink, 10 px Plex Mono, never amber): where the Brooklyn clock falls on a different calendar day from the stadium clock, a note beside the Brooklyn clock names Brooklyn's weekday and which way it differs: "(Thu, prev. day)" or "(Fri, next day)". The note and the clock are one no-break unit, so the name gives way and wraps. On a Poster row the note sits just left of the clock; on a Ledger row it follows the clock; on a cover band it follows the Brooklyn clock and the stadium clock drops under it. The specimens' stadium clocks (15:00 and 21:00) are already on the canvas; their Brooklyn clocks (11:00 PM and 12:00 AM) are not, because no pair on the canvas crosses midnight, and are ILLUSTRATIVE.

**StatusPill.** 10 px Oswald 700 caps in a 16 px box, 2 px corners. Not a control. Never colour alone.

| State | Poster pill | Ledger word | Voice | Notes |
|---|---|---|---|---|
| NEXT | on-pitch on pitch | none | Pitch | The next kickoff in the snapshot |
| LIVE | cover-ink on blood | `fb-alarm` | Alarm | Score in ink, not pitch. ILLUSTRATIVE specimen |
| KICKED OFF | amber outline | amber | Amber | No score shown |
| FT | ink outline | ink | Ink | Score in pitch, en dash |
| POSTPONED, CANCELLED, ABANDONED | cover-ink on blood | `fb-alarm` | Alarm | ILLUSTRATIVE specimens |
| SUSPENDED | cover-ink on blood | `fb-alarm` | Alarm | Real: Rayo Vallecano v Athletic Club, Wed 9 Dec |
| Corrected result | the FT pill | FT | Ink + amber | The corrected score in pitch and an amber line under the row. Wording ILLUSTRATIVE; the app has none yet |

A time not set is not a pill: the Brooklyn clock is an ink dash and an amber italic line reads "Sun 2026-12-06 — kickoff time not yet set by the league".

**StalenessBanner.** Directly under the imprint band, above the Rack and the Ledger's NEXT UP, in the page measure at 1000. A 1.5 px frame with a 4 px left rule, 2 px corners, Caslon 14/1.35. Not dismissible, not a control, never over a photograph. 24 to 72 hours: amber, "Data may have moved. Last synced 1 day ago (2026-11-11). Fixtures get rescheduled — run npm run sync before staking anything on a kickoff time." Past 72 hours: alarm, "Data is stale. Last synced 3 days ago (2026-11-11). …" Amber 5.85 and alarm 5.17 on pulp; 11.76 and 6.86 on the dark page.

### Page controls

**Week row.** One 44 px row: stepper, Today, Filters. Never wraps. Chevrons 44 × 44 with glyph-size glyphs; the range label between them is the stepper's own label and no area covers it; Today and Filters take the row's height; gaps split at the midpoint; Filters runs to the page edge. At 390: previous 0–44, label 44–124, next 124–168, Today 168–219, Filters 229–390 (indicative; the build measures). Year rule: the row shows the year only when the week is outside the current Brooklyn calendar year or crosses New Year, at every width. The filter label has three forms chosen by the room left: "Filters · all 14", "Filters · 14", glyph and count; filtered it reads "3 of 14"; the accessible name is always full. Today is pitch. A chevron with no week beyond it is muted and inert.

**"Hidden by filters".** One muted line under the date line: "19 hidden by filters". The day's count is the count shown. A note, not a control, and not amber.

**The "more" control.** Poster only. A real button with `aria-expanded`; the whole bar is the hit area, full measure wide, at least 44 px tall; expands in place in 180 ms into ordinary contents rows. Label is fiction, the count, day and verb are the record: "Twenty-two more stories · 22 MATCHES · SAT · SHOW". At 360 the count drops under the line. The Ledger has none: it always lists every fixture of the week (D10).

**UEFA matchday line.** "MATCHDAY 5 · COMPUTED — UEFA WINDOW 24–25 NOV". Ink, 10.5 px Plex Mono caps, above the first row it governs in both lenses and under the date line on that night's cover. The word COMPUTED and its source are never dropped. Europa League and Conference League rows carry none. Not a control; breaks only at its middot and after its dash. The computed form takes no amber.

Two other forms are amber (rule 4's seventh use), in the live app's words: "MATCHDAY 5 · RESCHEDULED — NOW OUTSIDE ITS UEFA WINDOW", and "MATCHDAY — · DATE OUTSIDE UEFA'S PUBLISHED WINDOWS", where the app writes FIRST SEEN in place of DATE when it first saw the fixture outside a window. Same face and place as the computed line. Neither occurs in the snapshot; both are drawn as ILLUSTRATIVE specimens on the page-controls board, the rows board and the states sheet (K).

### The Table

Structure untouched (D4): zone band 3 px, position, the club's tile and name, form pips, next fixture, GD over GF–GA, points over played. Read from ESPN's standings feed, never recomputed.

**The two-clock next-fixture cell.** Day, opponent's tile code and (H) or (A) in ink; the Brooklyn clock in pitch; the stadium clock in muted ink, smaller. Clocks are no-break units and drop under the opponent where the line is short. Not set: an amber italic line replaces both clocks. KICKED OFF: amber, no clock, no score. Zone not known: "local time not known" in amber takes the stadium clock's place. (The live app's compact cell is Brooklyn-only; this adds the stadium clock.)

**Form pips.** On their own line at every width, then the next fixture. Each strip has a text alternative. **Games in hand.** Amber: a note above the table with an amber heading and left rule, sentence in ink ("2 clubs have a game in hand — sort by PPG to compare like with like."), and a "+1" chip beside each club that has played fewer.

**Controls.** League tabs drawn 30 px tall, each on a 44 px row (two rows, 88 px); the on tab is black with the pitch underline. Zones & key is a 44 px disclosure, 180 ms. The row's tap is kept from the live app: the whole row is its hit area, opening in 150 ms to W-D-L and PPG on one line under the next fixture (GF–GA and played are already on the row). Arsenal's row is drawn open at 390 on the Table component board: W-D-L 9-0-1, PPG 2.70. The Table · 390 template stays closed.

**At 1000.** The first edition's fifteen columns (zone, Pos, tile, Club, Pl, W, D, L, GF, GA, GD, Pts, PPG, Form, Next) in its 780 px measure. W, D and L are filled from the standings snapshot of 11 Nov 2026, and PPG is points ÷ played, to two decimals.

W-D-L after ten played, by position: 1 ARS 9-0-1; 2 BHA 7-1-2; 3 MNC 7-0-3; 4 LIV 5-3-2; 5 CHE 5-1-4; 6 EVE 4-4-2; 7 BOU 4-3-3; 8 BRE 3-5-2; 9 LEE 3-5-2; 10 AVL 3-4-3; 11 TOT 3-3-4; 12 NEW 3-3-4; 13 HUL 2-5-3; 14 IPS 3-2-5; 15 FUL 2-4-4; 16 NFO 2-3-5; 17 COV 3-0-7; 18 MAN 1-5-4; 19 SUN 2-2-6; 20 CRY 2-1-7.

Motion-off still: none of its own; the cover above and the scorch below are stills.

## 6. Templates

| Template | Artboards | Notes |
|---|---|---|
| Poster | `Poster` (390 paper, the judge), `Poster-390-dark`, `Poster-360`, `Poster-360-dark`, `Poster-1000`, `Poster-1000-dark` | Band, Rack resting on Friday, week row, Part one Friday (3 rows), Part two Saturday (4 rows and the more control), shelf, foot. Dark adds the torch on NEXT |
| Ledger | `Ledger`, `Ledger-390-dark`, `Ledger-360`, `Ledger-360-dark`, `Ledger-1000`, `Ledger-1000-dark` | Typescript band, NEXT UP with both clocks, week row, all 45 fixtures (Fri 3, Sat 26, Sun 16) in the row order, end-of-week count. NEXT UP's countdowns ("8 DAYS", "9 DAYS") are captioned ILLUSTRATIVE, as read on Thu 12 Nov |
| Table | `Table`, `Table-390-dark`, `Table-360`, `Table-360-dark`, `Table-1000`, `Table-1000-dark` | Short cover, league tabs, Zones & key, the Premier League's 20 rows, scorch, black foot. 1000 uses the fifteen-column grid, with W, D and L filled |
| Quiet week | `QuietWeek`, `QuietWeek-360` | Nov 9 – 15, no fixtures; the shop; "A no-bet week is a successful outcome."; Coming next |
| UEFA week | `UefaWeek` (390), `UefaWeek-360` | Nov 23 – 29: eight markers on their own row, which at 360 runs 8 px into the padding on each side; Thursday's Europa and Conference night book; Tuesday's with the matchday line; the eight slides |
| States sheet | `States`, `States-dark` | A time not set, B full time, C the book closes, D suspended, E kicked off, F filtered, G UEFA matchday line, H the Table, I specimens, J staleness, K the matchday line outside its window, L local time not known, M the day note. K, L and M are ILLUSTRATIVE. F's second Saturday row is Tottenham Hotspur v Ipswich Town, by the row order |
| Moments | `Moments` | Shell and tokens only (D5) |

The broadcast template is retired. Poster, Ledger and Table carry a Theme tweak; tabs and the lens switch link between templates in Play.

## 7. Imagery and the asset list

Rules: evoke, never borrow (rule 1); no lettering, digits, real people, real clubs, crests, kits or stadiums (rule 6); cold grade, no amber, orange or gold light (added to rule 6); a scrim under any text (rule 7); every cover and plate captioned ILLUSTRATIVE and the page foot says the photographs are generated; a person looks at every image at full size; hyper-photoreal, never illustrated.

Paths are relative to `kickoff-revamp-b2.pen`. Every fal.ai step is in `fal/provenance.jsonl`. Seven first generations were made in Pen with its Generate tool; their prompts were recovered verbatim on 13 Nov 2026 into `21-pen-source-prompts.md` and are printed below. Their provider is pen.dev and their model is recorded as "not recorded", because Pen does not log which model its Generate used.

| Slot | Pick | Size | Chain | Record |
|---|---|---|---|---|
| Domestic Friday cover | `images/fal/round-2/R3/r3-g9-run2-topaz-hfv2-2x.png` | 1888 × 2208 | `images/generated-9.png` (pen.dev, Generate; prompt below) → FLUX Kontext (`fal-ai/flux-pro/kontext`, request `01a1d6af-642a-7492-bb93-3408ab898edc`, seed 1426921595): fill the black bands → Topaz upscale 2x (`fal-ai/topaz/upscale/image`, `01a1d6b2-3390-7092-ac84-171ca09bff33`). Contains lightning: never animate it | Provider and prompt recorded; edit chain recorded; model not recorded |
| Domestic Saturday cover | `images/fal/round-2/R2/r2-run1-topaz-hfv2-2x.png` | 1888 × 2208 | `images/generated-10.png` (pen.dev, Generate; prompt below) → FLUX Kontext (`01a1d6ac-e8de-73c2-8630-eb69ff7d9464`, seed 488641102): regrade warm light cold → Topaz 2x (`01a1d6b2-3324-7b41-a5ce-6a1885a59429`) | Provider and prompt recorded; edit chain recorded; model not recorded |
| Domestic Sunday cover | `images/fal/round-3/F1/f1-run2-topaz-hfv2-2x.png` | 1760 × 2368 | FLUX 1.1 Ultra (`fal-ai/flux-pro/v1.1-ultra`, `01a1d698-5e3b-77e1-9b85-814c7916949d`, seed 1801254939) → FLUX Kontext (`01a1d6cb-c005-7281-ae43-74057d838031`, seed 1346722524): tear the sky, remove the plaque, keep the goal → Topaz 2x (`01a1d6cc-b44e-7203-a0b1-afd3cd52d740`) | Complete |
| The Register cover | `images/fal/round-2/R3/r3-g12-run2-topaz-hfv2-2x.png` | 1888 × 2208 | `images/generated-12.png` (pen.dev, Generate; prompt below) → FLUX Kontext (`01a1d6b0-af02-7102-8fa7-ed098e4cbf80`, seed 1725695849): fill the black bands → Topaz 2x (`01a1d6b2-dfbd-70f2-9e97-488c2a98d7c7`) | Provider and prompt recorded; edit chain recorded; model not recorded |
| Europa and Conference night cover | `images/fal/round-3/F2/f2-r5-nano-run4-topaz-hfv2-2x.png` | 1856 × 2304 | Nano Banana 2 (`fal-ai/nano-banana-2`, `01a1d6b8-c5d1-7932-a826-0a0fc0821dc7`, seed 1485577584) → Topaz 2x (`01a1d6cc-418a-7e43-ac38-239554350867`) | Complete |
| Quiet week, the shop | `images/fal/round-2/R4/r4-j1-run1-topaz-hfv2-2x.png` | 1888 × 2208 | `images/generated-15.png` (pen.dev, Generate; prompt below) → FLUX Kontext (`01a1d683-79a6-7ba1-a1d9-2a3c745503df`, seed 172323067): remove the sign and the warm lamp → Topaz 2x (`01a1d6b0-af21-7ed1-af1d-4606064ab6a9`) | Provider and prompt recorded; edit chain recorded; model not recorded |
| Street plate, green smoke | `images/fal/round-2/R4/r4-j2-g8-run1-topaz-hfv2-2x.png` | 2784 × 1504 | `images/generated-8.png` (pen.dev, Generate; prompt below) → FLUX Kontext (`01a1d683-e40b-7f80-9bbb-fac61cf1818f`, seed 734164005): regrade sodium lamps cold → Topaz 2x (`01a1d6b1-6865-7ba0-9f05-f9c39e1e1bd1`) | Provider and prompt recorded; edit chain recorded; model not recorded |
| Street plate, fog and doorways | `images/fal/round-2/R4/r4-j2-g11-run1-topaz-hfv2-2x.png` | 3136 × 1344 | `images/generated-11.png` (pen.dev, Generate; prompt below) → FLUX Kontext (`01a1d684-9aa2-73a2-949b-fa9d65e75e8d`, seed 89038728): regrade sodium lamps cold → Topaz 2x (`01a1d6b1-6867-79c0-a8b7-0cce8ecc70d4`) | Provider and prompt recorded; edit chain recorded; model not recorded |
| The book closes | `images/fal/round-1/J7b/j7b-run3-s858205303.png` (alternates: run 4, run 5) | 3136 × 1344 | FLUX 1.1 Ultra (`01a1d69f-98c2-7913-af0d-2b4154451be2`, seed 858205303) | Complete |
| The void | `images/generated-13.png` | 928 × 1152 | Made in Pen (pen.dev, Generate; prompt below) and used as is: no fal step; not in the picks list | Provider and prompt recorded; model not recorded |

The fal prompts are in `fal/provenance.jsonl` under each request id; the seven Pen prompts are below. Depth maps for the crossing: `images/fal/round-2/R3/r3-g9-run2-depth.png` (Friday), `r3-g12-run2-depth.png` (Register), fallback `images/fal/round-2/R2/r2-run1-depth.png` (Saturday); 16-bit, near is dark; Sunday has none and stays flat. Video loops are build assets only.

**D14's record (open, question 14).** Three of ten photographs have a complete record: provider, model and prompt. Seven have a provider and a verbatim prompt but no recorded model: the six with a fal edit chain, and the void. D14 asks for provider, model and prompt before anything ships, so one choice is left for Beni: record those seven with the model marked unknown, or regenerate them. This edition generates nothing.

### Pen source prompts (pen.dev Generate, model not recorded)

Each was a `Generate("ai", node, prompt)` call, recovered from Pen's session logs in `~/.pencil/claude-sessions/` with its line and timestamp. File numbering follows creation order; `generated-14` is the onion-skin texture tile, not a photograph.

**`images/generated-8.png`** · Street plate, green smoke (fal pick r4-j2-g8)

- Pen node: `hero` ("Part hero (ILLUSTRATIVE)")
- Session `26a0714b-6855-4415-8dda-2e749f9c99a1.jsonl`, line 276, 2026-11-12T00:30:03.681Z
- Provider: pen.dev (Generate). Model: not recorded.
- Prompt, verbatim:

> Hyper-photoreal night photograph, 35mm grain, of a small American town main street seen from the end of the block: wet asphalt, one sodium streetlight, low fog, dark closed storefronts with blank awnings and black windows, power lines, and a narrow vertical tear of pale green light opening in the overcast sky above the rooftops, no people, no lettering, no signs, no logos, cinematic cosmic dread, muted cold palette.

**`images/generated-9.png`** · Friday cover, The Fifth Minute (fal pick r3-g9)

- Pen node: `art` ("Cover art · The Fifth Minute (ILLUSTRATIVE)")
- Session `5b0597a8-69f6-4e54-a475-712e862daf1b.jsonl`, line 72, 2026-11-12T17:58:15.755Z
- Provider: pen.dev (Generate). Model: not recorded.
- Prompt, verbatim:

> Photorealistic night photograph, vertical 4:5. A small-town football ground during a violent electrical storm in late autumn. A large old canvas revival tent has been pitched on the halfway line, glowing from inside with a hard blue-white light, faceless silhouettes visible only as shadows on the canvas. A lightning bolt is striking the tallest floodlight pylon at this exact instant, and all four floodlights burn a wrong, too-white blue. Thin arcs of electricity crawl along the crossbar and the chain-link fence. Fog lies on the pitch. Above the tent the storm clouds are parting along a vertical seam onto stars in the wrong places and the suggestion of something vast on the other side, watching. No readable people, no text, letters, digits, logos, crests or kits. 35mm film, fine grain, heavy halation, deep blacks, cold electric blue and teal palette; the top fifth and bottom quarter fall to near black.

**`images/generated-10.png`** · Saturday cover, Twenty-Six Doors (fal pick r2)

- Pen node: `art2` ("Cover art · Twenty-Six Doors (ILLUSTRATIVE)")
- Session `5b0597a8-69f6-4e54-a475-712e862daf1b.jsonl`, line 188, 2026-11-12T18:14:50.653Z
- Provider: pen.dev (Generate). Model: not recorded.
- Prompt, verbatim:

> Photorealistic aerial night photograph, vertical 4:5, from far above a fog-filled river valley in rural New England in November. Twenty-six floodlit football pitches glow through the cloud like open doors of light, scattered across the dark valley, and from this height they are unmistakably arranged as a constellation or sigil, joined by faint threads of green light running under the fog like veins. Small-town roofs, a river, a white church steeple, a brick mill chimney, bare birch woods. Above, the cloud has opened in a perfect circle onto stars that are wrong. No people, no text, letters, digits, logos, crests or kits. Long exposure, 35mm film grain, halation, deep teal-black palette; the top fifth and bottom quarter fall to near black.

**`images/generated-11.png`** · Street plate, fog and doorways (fal pick r4-j2-g11)

- Pen node: `"sdD3J/iX5HK"` (Part opener · Part One · Saturday)
- Session `5b0597a8-69f6-4e54-a475-712e862daf1b.jsonl`, line 254, 2026-11-12T18:20:37.872Z
- Provider: pen.dev (Generate). Model: not recorded.
- Prompt, verbatim:

> Photorealistic photograph, wide 5:2. A small-town main street just before dawn in thick fog. Every front door on the street stands open onto a warm lit hallway, and every hallway is empty. A bus shelter, a parked pickup, wet asphalt, bare trees, and above the rooftops the glow of floodlights from a ground just out of sight. No people, no text, letters, digits, signs or logos. 35mm film grain, halation, cold teal street against warm doorways.

**`images/generated-12.png`** · Register cover (fal pick r3-g12)

- Pen node: `art3` ("Cover art · The Register (ILLUSTRATIVE)")
- Session `5b0597a8-69f6-4e54-a475-712e862daf1b.jsonl`, line 325, 2026-11-12T18:53:44.562Z
- Provider: pen.dev (Generate). Model: not recorded.
- Prompt, verbatim:

> Photorealistic night photograph, vertical 4:5. An empty floodlit football pitch in fog, seen from the front row of the stand. In the far penalty area the turf has collapsed into a perfectly round sinkhole, its edge torn grass and wet black earth, the goal frame tilted toward it, the net hanging down into the dark. From deep inside the hole rises a faint cold green light, and the fog flows down into it. Four floodlights, a chain-link fence, wet plastic seats in the foreground. No people, no text, letters, digits, logos, crests or kits. 35mm film grain, halation, cold teal-black palette; the top fifth and bottom quarter fall to near black.

**`images/generated-13.png`** · The void (used as is, no fal step)

- Pen node: `voidArt` ("Art · The void")
- Session `5b0597a8-69f6-4e54-a475-712e862daf1b.jsonl`, line 457, 2026-11-12T19:41:50.755Z
- Provider: pen.dev (Generate). Model: not recorded.
- Prompt, verbatim:

> Photorealistic deep-space photograph, vertical 4:5. Beyond a field of stars in impossible places, an unimaginably vast dark structure fills most of the frame, only partly lit, its edges lost in nebula, too large to resolve into any shape a person could name; a single faint rift-green light somewhere within it, like an eye that has not yet opened. Cold violet, black and green; no planets, no spacecraft, no creature, no text, letters, digits or logos. Long exposure, fine grain.

**`images/generated-15.png`** · Quiet week, the shop (fal pick r4-j1)

- Pen node: `b6photo` ("Photograph · the empty rack (generated)")
- Session `5b0597a8-69f6-4e54-a475-712e862daf1b.jsonl`, line 663, 2026-11-12T20:36:04.788Z
- Provider: pen.dev (Generate). Model: not recorded.
- Prompt, verbatim:

> Photorealistic photograph, vertical 4:5. A wire spinner rack for paperbacks stands in a closed small-town drugstore at three in the morning, lit by one fluorescent tube and the green glow of a drinks cooler. Every pocket of the rack is empty except one at eye level, which holds a single paperback turned face down. Dust on the wire. Through the front window behind it: rain, a dark empty street, fog, one traffic light. No people, no readable text, no logos, no lettering on anything. 35mm film grain, cold teal and sickly green light.

**The cover library** (ruled 13 Nov 2026: covers are keyed to the day type and reused week to week): domestic Friday, Saturday, Sunday (in hand); domestic Monday and the first Champions League night (landscape plates standing in); a second Champions League night (missing; the void is a stand-in with no recorded model); Europa and Conference night (in hand); domestic midweek (missing); The Register (one for every league); a closed book (the dawn plate); the quiet week (the shop).

**Closest calls for the human check (open, question 16).** A person's look at full size at the Friday cover's small silhouetted figures under the tent and the fog plate's parked car. The recovered prompts asked for both ("faceless silhouettes visible only as shadows on the canvas"; "a parked pickup"). An observation from the same prompt, not a ruling: the fog plate was asked for warm doorways, which the cold grade forbids and the fal regrade was meant to remove, so the same look should check them.

**How they ship.** AVIF with a WebP fallback in a `picture` element; art-directed crops (portrait cover, wide plate, 1000-wide rack) at 1x, 2x and 3x, cut from the source and never upscaled again; the first cover `fetchpriority="high"`, neighbours decoded on idle; crop the source, not the frame. A separate asset licence, not MIT, in the photographs' own folder, with one record per shipped file: provider, model, prompt, seed, request id, date, the source's checksum and who looked at it. The single-file and offline builds ship the motion-off, no-photograph state. The wear scan is cut; no paper texture lies under text.

## 8. Motion contracts

**State changes, unchanged.** 150 ms ease: hover and pressed ink, row expansion, the tab underline. 180 ms cubic-bezier(.2,.7,.2,1): the lens thumb, disclosure, filter state. 220 ms ease: theme and lens cross-fade, the Rack's title-block swap. A tapped cover growing into its book is a state change with no value in this budget: the spike drew 600 ms and the build's prototype sets the duration (question 21). The page below changes only once the cover has finished growing. Data updates are never animated as counts.

**Rules that stay.** At most one WebGL canvas per visible region, one pipeline. Text and digits are live type above the canvas, never pixels in it. The WCAG 2.3.1 gate: a change of 10% or more in relative luminance across most of a face takes at least a third of a second; flicker lives only in thin tongues; saturated red never flickers. With reduced motion on, nothing decorative moves and the stills are chosen before first paint. One clock: a single requestAnimationFrame, page-active seconds only, each region's playhead advancing only while in view. One strong effect at a time, by priority (opening, a crossing the reader starts, an opener's burst, a shelf glitch, the foil sweep, an automatic crossing), with 400 ms of quiet between.

**The Motion control (D7, WCAG 2.2.2).** One persisted control in the imprint band, first in reading order after the wordmark. Named for the action it will take, with `aria-pressed`. It freezes every decorative playhead at its rest still. The Rack's Stop is its local mirror: one switch, one state. State changes keep running.

| Effect | Where | Period | Trigger | Motion-off still | Never touches |
|---|---|---|---|---|---|
| Fog | Cover and plate skies; the quiet week | No finite loop; drift 0.03 × speed per second; grain off | Starts 0.22 s after paint | The fog at t = 0 | Pulp, ink, captions, scrims |
| Rift | The sky of a cover or plate | Breath 17.95 s; stars 6.98 s; spiral 52.36 s; rim hue 20 s | Starts 0.60 s; holds during a strong effect | The tear at t = 0 | Anything outside the sky |
| Push-in and depth | The centre face's photograph | 100% to 105% over the 7 s hold; parallax 0 to 6 px | Each hold | 100%, no depth read | The title block, the foot |
| Foil sweep | A cover title's live glyphs, CSS | One 1.40 s sweep, no loop | 1.40 s after a book opens | The static gradient | The letterforms |
| Drip | The bleed-room under a cover title | Beat 1.25 s; drops every 16.7 to 33.3 s | Starts 3.20 s | Wet edge at t = 0 | A glyph, the date line |
| Burst | Around a part opener's day word | One 1.10 s event | Once on entry; re-arms on re-entry | The calm word | The word's core, a date |
| Spine glitch | Around one spine title | One 0.625 s window, dim included; at least 12 s between spines | Once on shelf entry, then one at a time | Calm neon | Catalogue digits, counts |
| Blood pool | The shelf's floor | Drops every 2.69 to 4.23 s | Starts 1.20 s | The pool at t = 0 | Spine faces, numbers |
| Smoulder and rim fire | The Rack's rims and gutter | Smoulder 1.96 s; sparks 0.7 to 2.3 s | Holds smoulder; a crossing or opening flares | A still scorch | All ink; 4 px inward at most, top and sides |
| Vapour and smoke | The Rack's gutter and rims | Vapour 15.71 s; plume sway 5.7 to 9.0 s; lingers about 3 s | Vapour from 1.60 s; plumes with a crossing | A still haze | Faces' ink; 24 px inward at most; never over 15% of the new cover |
| Crossing and shake | The Rack's photographs, rims, wire, void | Hold 7 s, cross 1.8 s; shake 0.17 to 0.67 s with one 70 ms hit-stop at 0.45 s | First at 9 s after load; a swipe or tap; one pass | Instant change, flat faces | Band, title, date line, foot, marker, caption, any digit; stops 8 px above the title scrim |
| Torch | Dark Poster, under the ink | None; pointer-driven | Follows the pointer; rests on NEXT | Fixed on NEXT | Sits below every glyph |
| Scorch | The Table's foot | Static | None | The same | The last row |

What stops each: the Motion control, a hidden tab and the region leaving view stop all of them. The Rack's rotation also stops on touch, focus and hover; only an explicit Start resumes it. Reduced motion means none start.

**The automatic crossing.** Ignite 0–0.25 s; crossing 0.25–0.95 s; emergence 0.95–1.45 s; embers 1.45–1.80 s. The old photograph burns away 0.25–1.75 s; the next develops 0.95–1.60 s. **The title block** (title, date line, tagline, fixtures band, catalogue number) is one unit. It swaps at 1.45 s as a 220 ms sequential fade: out in 110 ms, then in over 110 ms; the two are never on screen together and neither moves; settled by 1.67 s. The marker's underline and `aria-current` move at 1.45 s. The live region is silent for automatic crossings. In a swipe each face carries its own title block; in an opening the title stays with its cover. With motion off the swap is instant.

**The first nine seconds.** 0.00 still first paint; 0.22 fog, 0.60 rift; 1.40–2.80 one foil sweep; 3.20 drip; 9.00 the first crossing, deferred if another strong effect holds the token.

**Amendments to the spike's motion board.** D8's wording stands. The spine glitch's 45% dim is gated to its 0.625 s window. The wire's ring and the 2% punch ease to zero by 0.67 s. `fog.glsl` and `fog-drift.glsl` are one shader; its per-frame grain is dropped. The slip glow leaves with the pay-out board. Android vibrates only for a crossing the reader starts. The build makes its own stills.

**Not measured.** No phone benchmark has been run. The gate is 16.7 ms a frame at 60 Hz on a real phone; past it, or without WebGL, the page shows the stills.

## 9. The rules note, amended

Rules 1, 2, 5, 7 and 8 are unchanged. Rule 3 is kept with its day-summary exception, which Beni accepted on 13 Nov 2026. Rule 4 is rewritten as in section 3 with eight uses: six reconcile it with the first edition, as the brief asked, and Beni's ruling of 13 Nov adds two. Rule 6 gains the cold grade, which was in the proposal and the cold review asked for it back. Rule 9's text is unchanged; the fixtures band's tie rule is written beside it. Rule 10 stands as D7 and D11 amended it. Rule 11 is unchanged; the title-block swap is now timed against it. The second-edition paragraph's "no text under 10 px" is applied to pill, strap, stamp and pip letters, which the boards had under it.

New rules this handoff adds: the hit-area contract H1 to H4 (section 5); the stadium-clock rule (`20:30 local` on every stadium clock, never a zone abbreviation or an offset, and "local time not known" in amber where the zone is not known); the day note; the row order and the cover band's kickoff order; the 360 rule for the eight-marker row; the week row's year rule; "rows are not controls".

## 10. Retired

Recorded here only; nothing has been deleted from the design system.

**The clearing.** The Broadcast lens, with its template "Kickoff — Broadcast lens", the TickerCard and its marquee gradient (`--marquee-from`, `--marquee-to`), the one sanctioned glow (`--glow`), and the brand book's three-lens description. Where to Watch, interface and data: the WatchPanel, the TV pill and its dashed 1 px outline, the NEW pill, the television emoji. The Monthly view: the MonthView screen, the Weekly / Monthly pair, "month-view dots".

**Replaced by the second edition.** "Flat color only, no imagery" (photographs in three places; flat planes under text). Hard rule 5's budget, gradient and third-accent clauses (state budget unchanged; a decorative layer; foil and scrims; blood). Hard rule 6 as "don't restyle" (skin changes, structure stays). Burnt orange as the alarm. The third ink `--ink-muted` (2.95:1 on its own paper). ClockPill and fixture-row expansion. FormPips' pitch, muted and accent. Inter for body and names (held for Moments). The 780 px measure for Fixtures (640; the Table keeps 780). 9 px pills. The emoji vocabulary (ruled 13 Nov). The Oswald wordmark at 34 px (proposed; still open, question 3).

**Retired from the spike on the way in.** Orbitron, Courier Prime, Caveat. The series line and the price sticker. The wear scan and any paper texture under text. Row numbers. LIVE in pitch. Blood filling the current marker; rift on the reading spine. GF:GA with a colon. Zone abbreviations and offsets on stadium clocks (CET, GMT, GMT+5). The Ledger's own wordmark and handwritten correction. "The round goes on Monday". The pay-out board and its slip glow (fenced, D6). The second fog shader and the fog's grain. The week row's year at 390.

## 11. Questions, as they stand after the review

Beni reviewed the second edition on 13 Nov 2026. Twelve questions are ruled, one is closed and eight stay open. The numbers are the first pass's, so a ruling can be traced: 17 is retired and 21 is new.

Still open, for Beni:

| # | Question | Where it stands |
|---|---|---|
| 3 | **The wordmark.** Abril Fatface, or Oswald? | Drawn: Abril Fatface at 22 px on every lens. A brand decision; the logo files are untouched either way |
| 14 | **D14's record.** Record with the model marked unknown, or regenerate? | Three of ten photographs have a provider, model and prompt. Seven have a provider (pen.dev, Generate) and a verbatim prompt (section 7) but no recorded model. One choice: record those seven with the model marked unknown, or regenerate them |
| 15 | **Missing covers.** | A second Champions League night and a domestic midweek have none. Monday and the first Champions League night use landscape plates as stand-ins |
| 16 | **A full-size look at two photographs**, under rules 1 and 6. | The Friday cover's silhouetted figures under the tent; the fog plate's parked car. A person's check, at full size |

Still open, needing more work:

| # | Gap | What is needed |
|---|---|---|
| 18 | **The filter panel and Zones & key, opened.** | Neither was drawn in the spike or here. They take the tokens; their layout needs a board |
| 19 | **The title swap at 1.45 s.** | Settled on paper. It should be watched on a phone |
| 20 | **No phone benchmark.** | Frame time, image weight and font weight are unmeasured |
| 21 | **How long a tapped cover takes to grow into its book.** | New on 13 Nov. The spike drew 600 ms. It is out of the state-change budget, which stays at 150, 180 and 220 ms. The build's prototype sets the duration |

Ruled on 13 Nov 2026:

| # | Question | Ruling |
|---|---|---|
| 1 | **Rule 3's exception.** | Accepted as drawn. A day summary shows the first kickoff in Brooklyn time only: every cover's date line, part opener, rack face and spine |
| 2 | **The cover library.** | Accepted as drawn. Covers are keyed to the day type and reused week to week: eleven slots |
| 4 | **The alarm voice.** | Accepted as drawn. Blood, with burnt orange retired |
| 5 | **The Brooklyn clock and scores in pitch.** | Accepted as drawn |
| 6 | **Form pips.** | Accepted as drawn. Ink, outline and blood |
| 7 | **Amber's uses.** | Eight. Rule 4's six, plus a UEFA matchday line that is rescheduled or falls outside UEFA's published windows (a computed line stays in ink), and a stadium clock whose zone is not known, which reads "local time not known" |
| 8 | **The emoji vocabulary.** | Accepted as drawn. Six drawn glyphs and no emoji |
| 9 | **The week row's year.** | Accepted as drawn. The year shows only outside the current Brooklyn year or across New Year, at every width |
| 10 | **The measure at 1000.** | Accepted as drawn. 640 for Poster and Ledger, 780 for the Table |
| 11 | **The stadium clock's format.** | "20:30 local" on every row, cover band, Table cell and NEXT UP card: 24-hour, then the word local, never a zone abbreviation. The Brooklyn clock is unchanged |
| 12 | **Page length.** | Accepted as drawn. The band grows 6 px, the league tabs 28 px, and the pips take their own line |
| 13 | **NEXT UP gains the stadium clock.** | Accepted as drawn |
| 17 | **The Table's open row and its W, D, L columns at 1000.** | Closed, not ruled: the figures came with the review, from the standings snapshot of 11 Nov 2026. The columns are filled at 1000 and Arsenal's row is drawn open at 390 |

Also confirmed on 13 Nov 2026, outside the numbered list: the cover's lower band follows kickoff order on a day that mixes groups (section 5).

## 12. What the second edition deliberately does not do

It does not change the Fergie Time design system, the repository or any file in it. It writes no code; the stylesheet behind the boards is a drawing aid and a token proposal. It picks no version number; the provenance line shows the snapshot's own string. It shows no real money figure; the pay-out board stays fenced. It does not restructure the Table. It generates no photograph and retouches none. It does not design Moments beyond its shell. It does not make the Poster list the whole week; the Ledger does. It invents no fixture, kickoff time, matchday number, result or table figure; where neither the boards nor the review hold a figure, the specimen is captioned ILLUSTRATIVE. It does not measure contrast on rendered pages. It does not prototype motion. It does not sequence the build: the clearing ships first and the overhaul follows the Next.js cutover.

## 13. How this was checked

Contrast: every ratio in section 2 was computed by script from the hex values with the WCAG relative-luminance formula. Data: every fixture, time, venue, result, count and table figure on the templates was read off the attached boards (03 to 19) by eye at 2x to 3x zoom and typed once; Friday's 3, Saturday's 26 and Sunday's 16 fixtures sum to the Ledger's 45. The Premier League's W, D and L were typed from the review's list and checked by script: each row's wins × 3 plus draws equals its points, and each row sums to ten played. Provenance: each image's chain was traced through `fal/provenance.jsonl` by script. Live-app behaviour (the `local` word, LIVE and KICKED OFF colours, the pitch score, the Table's desktop columns, games-in-hand copy) was read from `src/lib/time.ts`, `src/components/FixtureRow.tsx` and `src/components/TablePage.tsx` on the default branch of the public repository on 13 Nov 2026. Font licences were read from the Google Fonts repository. The fix pass was checked by script on the files: no stadium clock prints a zone abbreviation; the Ledger's tied kickoffs follow the review's order; every artboard's frame matches the canvas index; and the seven Pen prompts were copied by script from `21-pen-source-prompts.md`, not retyped.

Not checked: the Claude Design artboards were not rendered or screenshotted after they were written, so layout at each width has not been looked at. That holds for the fix pass too: the boards that grew (rows and states, the states sheets, Imagery, the books, the Table component, the new UEFA week at 360) have estimated frame heights. Hit-area coordinates are indicative.

## 14. What the review of 13 Nov 2026 changed

Rulings:

- **Accepted as drawn:** questions 1, 2, 4, 5, 6, 8, 9, 10, 12 and 13. The "Directing session" flags are gone; rule 3's exception and the cover library are rulings.
- **Question 7:** amber has eight uses. Rule 4 is rewritten (section 3) and every "six" is changed.
- **Question 11:** every stadium clock reads "20:30 local". 139 clocks changed on the boards; no zone abbreviation is printed anywhere.
- **Confirmed:** the cover's lower band follows kickoff order on mixed-group days.

Fixes:

- **Eight markers at 360:** the marker row runs 8 px into the padding on each side; the UEFA week is drawn at 360 (`UefaWeek-360`).
- **Three honesty states drawn:** the matchday line's two amber forms, "local time not known", and the day note. Rows board; states sheet K, L and M in both themes; the amber matchday forms also on the page-controls board.
- **Motion:** 600 ms is out of the state-change budget, which keeps 150, 180 and 220 ms. It is question 21.
- **Captions:** the Bayern Munich v FC Cologne KICKED OFF specimens on the rows and Table boards, and the Ledger's NEXT UP countdowns, are captioned ILLUSTRATIVE.
- **Row order:** by group, then kickoff, ties in snapshot order. The Ledger's Saturday and Sunday ties are reordered and states sheet F's second row is Tottenham Hotspur v Ipswich Town.
- **Imagery:** the six photographs with an unrecorded source and the void now carry provider pen.dev, a verbatim prompt and "model: not recorded". The count is three complete, seven without a model. Question 14 is one choice.
- **The Table:** W, D and L are filled at 1000; Arsenal's open row is drawn at 390. Question 17 is closed.

Unchanged by the review: the tokens and every contrast figure in section 2, the type decisions, the hit-area contract, the motion contracts other than the 600 ms line, what is retired (only its flags and the stadium-zone wording moved), and every fixture, kickoff, venue, result and count.

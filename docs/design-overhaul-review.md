# Design overhaul — cold review of the Pen spike (pass 1)

Review record, 13 Nov 2026 (Brooklyn). The first, cold pass of the design-review cycle for the
"Night Fixture / Fergie Time Books" overhaul, briefed by `docs/design-overhaul-review-prompt.md`.
Written by a Claude Code session (Opus 5.5) that did not build the boards and had none of the Pen
chats' context. Nothing in the Pen file, `src/`, `tests/`, data, tokens, workflows or the design
system was changed; nothing is committed. No design brief or build prompt is written here.

`<pen>` below is `~/.pencil/documents/kickoff-revamp-b1/`. Every new export, measurement and
script from this review is under `<pen>/exports/review/` (outside the repository).

## Ground truth read

- Branch `claude/design-overhaul-spike` at `250c5c0`; `src/data` is the snapshot synced
  2026-11-11T07:48:33Z (`faf588c`): 1,484 fixtures (1,114 scheduled, 369 full time, 1
  suspended), of which **1,039 have an exact kickoff and 445 are `round_placeholder`**.
  `package.json` 0.5.3. The branch was not pulled, rebased or synced.
- The Pen file is `<pen>/kickoff-revamp-b1.pen`, read through the pencil MCP: B0 `KMQWH` (rules
  note `bYeE3`), B1 `jAjFv`, B2 `dsa04`, B3 `CEq1y`, B4 `Z2G6jN` (live loop `Y6WsY`), B5
  `qbwYp`, B6 `R5w8l6`, B7 `qnfOI`, B8 `kTGER`, B9 `zJMwP`, trimmed copies `vy9Fu` (B1) and
  `lIP4D` (B2). The A boards, tone cards and the "Now" browser node are still on the canvas,
  superseded by the "develop B" ruling.
- **Artifact over proposal:** the proposal's ground-truth bullet still names
  `~/.pencil/documents/0eaaec9f…/untitled.pen` with "one shader file and four generated images".
  The artifact under review has 14 shaders, 19 generated images and 6 rack renders. The artifact
  wins; the proposal's bullet is stale.
- Fergie Time was read at `~/Documents/Claude/Projects/Fergie Time Design System/` (readme,
  tokens, `components/`), not copied.
- pen.dev's terms of use were read on 13 Nov 2026 (effective 26 Oct 2026). Sources at the end.

## Verdict

**Needs rulings first, then one more design pass before the build ladder.** What the boards
draw is honest: every fixture, kickoff, local time, venue, count, table row, goal figure and
form pip I checked traces to the `faf588c` snapshot. Every invented figure (the $4,096.00 pay-out,
the $2.95 cover price) carries an ILLUSTRATIVE caption, and amber appears only on provenance lines.
The clearing holds on every board: Poster then Ledger, and no Broadcast, Where to Watch or
Monthly anywhere. But five things stop an implementation prompt being written from these boards.
Text fails 4.5:1 on the rendered exports in four places, the provenance line among them. WCAG
2.2.2 has no stop control on the pages without the Rack. The states that carry the honesty rules
(time not set, live, postponed, staleness, UEFA matchday lines) are not designed anywhere, and
30% of the snapshot needs the first of them. Rule 9's date line cannot be filled honestly or fit
on every matchday. And the Poster (and, as drawn, the Ledger) no longer lists the whole week,
which changes what the betting pipeline's Step 0 reads. Each needs a ruling or a design decision,
not a new direction. The direction itself carries the horror half of the brief well. The joy of
winning lives only on B6's one line and on B7, which cannot ship without data.

## Findings

Ranked blocker (data honesty, an accessibility failure, a rule 11 breach), major, minor, polish.
Each names the board, node, the rule or source it breaks, the evidence and a fix.

### Blockers

**B1. Text contrast fails 4.5:1 on the rendered exports in four classes of text** (B0 rule 7,
WCAG 1.4.3; measured, method under *Verification record*).

| Class | Where (node) | Flat colours, by spec | Rendered, 2nd-percentile background |
|---|---|---|---|
| Provenance line on light pulp, 9.5 px, amber `#8A5F00` | footers of B1 `Uvvvx/Da39x`, B1t `UTxv5/Da39x`, B2 `CgPhX/Da39x`, B2t `NOOQL/Da39x`; B5 header `eOCit/Da39x` and footer `LFtJh/Da39x` | 4.20:1 on `#EBDDBE` (5.18:1 on Fergie Time's `#F7F5EE`) | 2.95–3.79:1 |
| Muted pulp ink `#5E5446` on the textured page, 8.5–11 px | B1t venue `U9gELO/e7jcVT` 3.39, local time `CPbPD/CT3SQ` 3.95, footer `qMZxb` 4.28; B2 venue `xbgUU/WWQnR` 2.99, competition label `NC7ln/dVWJd` (8.5 px) 3.38, local time `W3Qi7/u1zRxQ` 3.55; B1 footer `N5Jg2` 3.74 | 5.51:1 | 2.99–4.48:1 |
| Small caps over photographs and the wear overlay, 7.5–9.5 px | series line `g3r0Hv/cTD9I` (B1t, B8) 3.04; B3 series line `S2FXWP/Hc5Sk` 3.10; B3 `ART · ILLUSTRATIVE` `S2FXWP/xO9GL` 2.20; imprint foot `g3r0Hv/kxyUR` 2.49 and catalogue `g3r0Hv/J2dwd` (FT-1120) 2.99; part-opener `ILLUSTRATIVE` `KIE48` 2.59–2.88 | 5.86–7.45:1 | 2.20–3.10:1 |
| NEXT pill on paper stock, 8.5 px | `mJPns/NUuam` (B1t), `I5yU5/NUuam` (B1) | `#F2EBDD` on `#2C7A4B` 4.43:1 | (ring method not valid inside a pill) |

The cause is the new materials, not the ink tokens. Fergie Time's paper is `#F7F5EE`; the pulp
is `#EBDDBE`, darker, and a multiply paper texture darkens it further in blotches. On the covers
the wear overlay (`generated-7.png`, screen blend) is drawn **above** the title block (child 7
over child 5 in `g3r0Hv`), so its white scratches cross the catalogue digits and the series line.
The part-opener caption scrim is 72% opaque and the photograph shows through it: around the
caption the median is 6.36:1, the 98th percentile 2.78:1. B8's contents page, the only area the
spike measured, passes (5.00:1 floor, reproduced); its cover and plates share the failures above.
B7's blood ILLUSTRATIVE caption is borderline at 4.47:1 (flat 5.17:1).
**Fix:** keep data on a flat plane, as Direction A proposed: texture under text bands capped, or
removed. Pulp amber to about `#6E4B00` (5.85:1 flat, still passes at the measured texture floor).
Pulp muted to about `#4E4538` (7.00:1). Wear overlay below the title block. Caption scrims 90%
or more opaque. No caption under 10 px. The NEXT pill on `#1E5636` (Fergie Time's pitch-deep,
7.26:1). These are token-level and go to Beni with the Fergie Time decision (D9).

**B2. WCAG 2.2.2: ambient motion longer than 5 s with no stop control on pages without the
Rack** (B9 `UYACT`, "User Stop freezes all decorative playheads"; only the Rack carries a Stop).
B3 (`CEq1y`) runs fog drift, rift breath (17.95 s) and the foil and drip on "The Register". B6
(`R5w8l6`) runs two fog layers (`GA7j6` speed 3, `YE2SR` speed 1.2), the drip on "A Quiet Week"
and the shelf's CRT spines; its control row reads "Nothing on the rack this week" and holds no
control. B7 runs the slip glow (8.06 s breath). On Poster, the Stop scrolls away with the Rack
while the part openers' rift and the blood pool keep moving below it. `prefers-reduced-motion`
is an OS setting, not the in-page mechanism 2.2.2 asks for. **Fix:** one page-level motion
control in the imprint band, beside the theme button, persisted, that stops every decorative
playhead; the Rack's Stop becomes its local mirror. The alternative is to make every ambient
effect a one-shot that rests within 5 s.

**B3. The states that carry the honesty rules are not designed** (Fergie Time hard rules 1–2,
`README.md` data philosophy). Every board shows one week of exact, scheduled domestic fixtures.
No board shows a time not yet set by the league, which the snapshot holds for **445 of 1,484
fixtures**; the live app's amber italic "kickoff time not yet set by the league" line has no
B-world form. Also absent: live, full time with score, postponed, cancelled, suspended (one in the
snapshot), abandoned and result correction. Also absent: the UEFA computed matchday lines
(`MatchdayLines` in `PosterWeek` and `LedgerWeek`), the 24/72-hour staleness banner, filtered-away
counts, games in hand, and the Table's "Current match / KICKED OFF". Rule 9's date line
(`DAY DD MON YYYY · N MATCHES · FIRST H:MM AM/PM ET`, "nothing else goes on that line") has no
form for a day whose first fixture is a placeholder, so it could only be filled by inventing a
time. **Fix:** a design pass that draws each state in both lenses and on the cover, with a rule
9 variant (for example `FIRST KICKOFF NOT SET` in amber) before any build prompt is written.

**B4. Poster no longer lists the week, and Ledger as drawn does not either** (CLAUDE.md, the
Step 0 contract; proposal "Rotating changes nothing below the rack. Only a tap opens a book").
On B1t (`vy9Fu`) the page lists Friday's 3 and Saturday's first 4, then "Twenty-two more stories
follow." (`D0PEDF`), which is text, not a control. Sunday's 16 are reachable only by tapping a
spine. B2t (`lIP4D`) is Saturday's book alone. B5 (`qbwYp`), the lens the proposal calls "the fast
list the betting pipeline reads", ends Saturday after six rows with "+ 20 more on Saturday, 16 on
Sunday". Step 0 reads the default lens with `?only=` and `&date=`. On these boards it would see 7
of the week's 45 fixtures and no warning. Every count shown is right; the completeness of the
page is what changed. **Fix:** a ruling (D10). Recommended: Ledger always lists every fixture of
the week, and the "more" lines become controls that expand in place with their counts. Step 0
moves to `&lens=ledger`, which is a change for the pipeline skill's owning copy on Beni's word.

**B5. Rule 9's date line does not fit, and shows one clock** (B0 rule 9, rule 3, Fergie Time
hard rule 4). At 11 px IBM Plex Mono each character is 6.6 px and the cover title block is 310 px
wide. Computed for every future matchday in the snapshot: 47-character lines are 310.2 px (41 of
75 matchdays, fitting only by rounding). The 11 lines of 48 characters are 316.8 px and overflow
at 390, for example `THU 26 NOV 2026 · 36 MATCHES · FIRST 10:30 AM ET`. At 360 the face loses
about 30 px and nearly every line breaks. A line that must never wrap also fails 200% text resize
(1.4.4) and text spacing (1.4.12). "FIRST 2:30 PM ET" is a kickoff time with one clock on every
cover, part opener, rack face and B6. This is a blocker only because rule 9 forbids the wrap that
would fix it. **Fix:** drop the year or shorten the counts (`THU 26 NOV · 36 MATCHES · FIRST
10:30 AM ET` is 43 characters, 284 px), allow a second line, add the TBC form from B3, and either
add the local clock or rule the day summary an explicit exception to hard rule 4.

### Major

**M1. B9 and the boards disagree on what the display titles are** (spec precedence; B9 `nDwN7`,
ledger rows `iEVlk` and `uyYNr`). B9 says the title shaders "are appearance studies: port their
surrounding light, bleed and ghost only, not their glyph sampling or displacement", and "never
rasterize/recolour live glyphs". On every board the title's look is a recolour of the glyphs:
`foil.glsl` mixes the glyph colour toward a prismatic film, `blood-drip.glsl` wets the letters,
and `crt-glitch.glsl` slices glyph rows sideways by up to about 6 px. A build that follows B9
will not look like B1. **Fix:** a ruling (D8) before the implementation prompt.

**M2. No 360 px board, and only one ~1000 px frame** (CLAUDE.md browser matrix: 390 judges, 360
is the jury). B4's "1000 WIDE · CROSSING" panel is the only non-390 frame. Measured at 390,
B5's meta line `ioSiH` ("BUNDESLIGA · URSAPHARM-Arena an der Kaiserlinde · 15:30 CET") already
ends at x 383, 7 px into the right gutter. The 323 px provenance line starts at x 32, so in a 360
viewport with 16 px gutters it ends 11 px past the gutter (the live site already wraps "UTC" at
390, audit item 7). The Rack's centre face, neighbour slivers and 30 px margins are undefined at
360. **Fix:** 360 and 1000 frames of B1t, B3, B5 and B6 in the design pass, with wrap rules for
venue lines and the stamp.

**M3. The first fixture a reader sees moved below the fold.** Measured on the live site on 13
Nov 2026 at 390 × 844 (`?date=2026-11-21`, the newer 13 Nov snapshot), the Poster hero names the
next matchday's three fixtures at y 315–413. The week list's first row is at 845 (its text at
853); the proposal measured 856 on 11 Nov. On B1t the first row is at 843 and its text at 854,
below the 844 fold, and nothing above names a fixture: the cover says "3 MATCHES". So the trim
meets Beni's ~850 target, measured on the week list (843 on B1t and 914 on B2t, against ~850 and
~930). But the reader now sees no fixture on the first screen, where today they see three. The
duplication fixed by the trim (audit item 2) was also the only above-the-fold fixture list.
**Fix:** a product call (D13). Accept it, or put the next matchday's first fixtures on the
cover's lower band.

**M4. Generated photographs carry lettering and money imagery** (B0 rule 6; proposal "no
lettering inside a photograph"). `generated-18.png` (B7 hero, visible on the board) has a book
cover with text-like lines, a betting slip with printed marks, a radio dial with a scale, and a
banded stack of banknotes with engraved portraits and numerals. `generated-15.png` (B6) has a
legible "DRINKS" sign on a fridge (`exports/review/zoom-gen15-sign.png`). B6's crop hides it
today, but a desktop crop would show it. The photographs also bring back warm sodium and orange
light (plates `generated-8`/`-11`, B6's street lamp, B7's bulb). That was dropped silently: the
proposal had graded every photograph cold so amber keeps its one meaning. **Fix:** retouch
before any ship, crop the source rather than the frame, and add the grade rule back to the
photograph rules. A human review checklist per image, as the proposal already requires.

**M5. The Rack's content rule is undefined** (B4 `Z2G6jN`, B0 rule 10). Its slides are hard-coded:
The Fifth Minute (Fri), Twenty-Six Doors (Sat) and The Register. Sunday's Sixteen Bells, 16
matches, is not on it. Undefined: what it holds in a UEFA midweek, or when the next matchday is
a Sunday, or whether a Table slide belongs on the Fixtures tab. The hint "swipe for the week"
(`Rlq1g`) promises more than three slides hold. Marker names are catalogue numbers ("FT-1120"),
which a screen reader announces as such. **Fix:** a data rule for the slides (D11), and accessible
names that say the book and its date.

**M6. The Monday spine asserts a round** (B1t `hgTkC/bOOPr`, B2t `pMTim`, B8 `xZfWc`): "The round
goes on Monday 23 Nov · 3 matches", catalogued FT-1123. `startOfWeek` is Monday
(`src/lib/time.ts:116`), the week navigator reads NOV 16 – 22, and B5 correctly leaves Monday
out. ESPN exposes no round for domestic leagues (`src/lib/matchdays.ts`, "ESPN exposes none"),
so "the round" is an unsourced grouping. It is true that three fixtures are on Mon 23 Nov.
**Fix:** drop the spine, or label it "Next week · Mon 23 Nov · 3 matches".

**M7. Invented ordinals sit in the data column** (Fergie Time "never invent matchday numbers";
B0 rule 2). Rows are numbered 1–3 for Friday and 4–7 for Saturday on B1t and B8. On B2t the same
Saturday runs 1–26 under "CHAPTERS 1–15 · 15 MATCHES", so Manchester City v Fulham is 4 on one
board and 1 on another. The numbers are uncaptioned digits beside kickoff times. **Fix:** drop
them (D12), or keep them per day and caption them.

**M8. The pay-out board has no product home** (B7 `qnfOI`; open ruling 6). "Concept only.
Kickoff does not track bets." B7 is the only board that carries the joy of winning, and it shows a
figure, which is the option the proposal recommended against. Its photograph is also the M4 case.
**Fix:** fence B7 out of this release (D6), and say where the joy lives without it (see *The
product*).

**M9. Pen-only artifacts that must not reach a build spec.**
- The neighbour faces `images/rack/s2-face.png` and `s3-face.png` are flattened renders with the
  title, date-line digits, tagline and imprint foot in their pixels
  (`exports/review/zoom-s2-face-bottom.png`). The RGB split and shimmer can reach those glyphs in
  Pen. The build renders neighbour faces as art plus live text.
- `Rim mask` (`WClW2`) sits above the cover's text in z-order (child 8 over the face). Rule 11
  holds in Pen only through shader geometry. The build answer is B9 `nDwN7`: live type above one
  canvas.
- The rim-fire-to-smoke handshake writes "an invisible key (black at about 1% alpha)" so the
  chained effect can find the rims. That is a Pen chaining workaround; one pipeline passes it
  directly.
- `u_titleTop` defaults to 0 and is unset on the live loop `Y6WsY`; the build must pass the title
  block's bounds every time.
- The live loop cycles endlessly; the build makes one pass. "Freeze at" and "Seek" are preview
  controls.
- The B9 still atlas (`exports/b9-stills/`) and the exports are time-zero Pen renders, some with
  glyph pixels (`VKa9N`, `SIln9`). They are references; the build makes its own stills from its
  own pipeline.
- The wear overlay above text is a Pen layering choice; see B1.

**M10. The set departs from Fergie Time at token level in more places than the proposal lists.**
See *Fergie Time fit*. The proposal named three system-level breaks: imagery, the motion budget,
the settled Table. The boards add six more that are not a builder's to make: the pulp paper, the
blue-black dark ground, blood as a new voice, rift green as a second green, six new type
families, and an icon set. They also replace the wordmark. All go to D9.

### Minor

- **m1. CRT's dim is not gated** (`crt-glitch.glsl`, the `dim` line before `gl_FragColor`). B9
  gates the glitch to one 0.625 s window, but `dim = 1 − 0.45·step(0.97, hash(tq))` runs on
  every 15 Hz tick: a 45% full-title dim for 67 ms, about 0.45 times a second, at any time. The red
  ghost (`#B3121B`) jitters at 15 Hz inside a burst. The area is one spine title, far under WCAG
  2.3.1's thresholds, but it contradicts "saturated red never flickers" if that rule is general.
  B9's ledger row omits both.
- **m2. The wire rings past the shake window** (`rack-crossing.glsl`, wire block: start c 0.536,
  `step(wu, 0.7)`). The proposal counts the rattle as a shake cue. The wire still moves 1.3 px at
  0.67 s and about 0.5 px at 0.84 s, against rule 11's 0.5 s shake. The 2% punch also has about 1
  px of residual past 0.67 s. Fix: end both at 0.67 s, or rule the wire out of "shake".
- **m3. One-clock surfaces.** B5's NEXT UP cards show the Brooklyn time only, as the live
  `NextUpStrip` does. B3 improves on the live Table's compact next-fixture cell, which is
  Brooklyn-only (`TablePage.tsx:458–466`), by adding local time.
- **m4. Goals read as a clock.** B3 writes GF:GA as "21:13" with a colon, one line above "17:30
  GMT". The live Table writes `GF-GA`, and Fergie Time uses an en dash in scores. Use the en dash.
- **m5. Form pips change voice.** W is pulp-ink, D an outline and L blood. Fergie Time's
  `FormPips` uses W pitch, D muted and L accent. They stay lettered, which keeps them readable
  without colour, but "pitch confirms" leaves the Table.
- **m6. Target sizes pass WCAG 2.5.8 only through the spacing exception.** Stop is 104 × 23,
  markers 46 × 22, tabs 22 tall, "Today" 37 × 15, Filters 138 × 14, and the week chevrons are
  glyph-sized. All are under 44 px; the 40 px control row has room for 40 px targets.
- **m7. `fog.glsl` and `fog-drift.glsl` are byte-identical** (`cmp`). B0 says fog-drift is "the
  same shader with a Drift speed control"; both have it. The build needs one shader.
- **m8. Stale and crowded copy.** The trimmed footers say "Titles, taglines and the price are
  ILLUSTRATIVE", but the $2.95 sticker survives only on untrimmed B1, B2 and B4. "Twenty-two more
  stories follow." sits flush on the shelf's black band with its descenders touching it.
- **m9. Closest calls on "evoke, never borrow."** None names or copies anything; listed for
  ruling 2.
  - The Friday cover's big-top tent with a crowd under it sits one step from rule 1's banned
    clowns.
  - B6's shop interior with fog at the window is the setting of a famous novella.
  - "Twenty-Six Doors" leans on doors as the horror object.

### Polish

- **p1.** B4 (x 2690–6602) overlaps B5 (from x 6290) on the canvas.
- **p2.** Untrimmed B1 and B2 still sit beside the trimmed copies. The implementation inputs must
  name `vy9Fu` and `lIP4D`.
- **p3.** `rim-fire.glsl` declares `u_reach` ("Tallest tongue") and never uses it; B9 says so.
- **p4.** At 7.70 s the left flank's ember line reads as a near-continuous red outline. The scorch
  band disappears on dark grass. The 7.42 s blaze is far smaller than in `filmstrip-3`
  (`exports/review/loop/compare-742old-742new-770new.png`). This is aesthetic; Beni's call on
  "overwhelming".

## Verification record

What was measured, how, and where the evidence sits. The only Pen control touched was the live
loop's **Freeze at** (`u_freeze` on `Y6WsY`). It was set to 58 values from 6.90 to 8.80 s and 4
stills, then **restored to −1**, confirmed by reading it back. Pen autosaved the file at 13:25
during that call, so the `.pen` file's timestamp moved. Its content should match the original,
but the file is encrypted and could not be diffed. No Seek control was touched. Everything else
was exports, which change nothing in the document.

- **Data.** Every board's text was dumped through the MCP and compared with `src/data` by script:
  week of 16–22 Nov in Brooklyn and local time, venues, counts per day (3, 26, 16), the Saturday
  groupings (15 / 5 / 6) and cycles, "Twenty-two more", "+ 20 more … 16 on Sunday", the empty Mon
  16–Thu 19 and 9–15 Nov, PL ranks, GD, points, GF and GA, all 20 next fixtures, and all 20 form
  strings (recomputed as `standings.ts` does). Also "As of matchday 10 of 38"
  (`matchdayProgress`), the 14 filters and the stamp. All match. Future date lines were generated
  for every matchday to size rule 9.
- **Contrast.** All 9 product boards were exported at 2x (`exports/review/2x/`).
  `scripts/contrast_ring.py` measured 1,151 text boxes. Ink is the rendered glyph core: the 4% of
  box pixels farthest from the background. Background is a ring 1–2.5 CSS px outside each layout
  box, minus every other text box. The ratio is against the ring's 2nd-percentile most adverse
  pixel, with the worst pixel also reported; thresholds follow WCAG 1.4.3 by size and weight.
  Results are in `contrast-text.csv`, the failures by eye in `contrast-fails-sheet.png`.
  - The method reproduces the spike's B8 contents floor exactly (5.00:1).
  - Known false positives, removed by computing the pairs from their spec colours (all pass):
    text inside pills, pips and club tiles (104 of the 189 automated flags are B3's form pips),
    text beside a dark band or a box border, and rotated spines.
  - Glyph masks were first exported per node (`masks/`), but Pen's single-node export renders a
    component's **master** text, not the instance override, and drops the parent's theme. Masks
    were therefore used only to locate boxes.
  - Limits: the background under a glyph is inferred from its surroundings. Shader fills are at
    t = 0. Text over moving fog was not measured at other times.
- **Flashes and the develop gate.** The loop was exported at 30 fps from 6.90 to 8.80 s
  (`exports/review/loop/f30/`) and measured by `scripts/flash_gate.py` over the face (20,20)–
  (370,540). The largest share of the face changing ≥ 0.10 in relative luminance within ⅓ s is
  **22.70%**, worst window 8.233–8.567 s. WCAG's own count: 35.35% of the face sees one flash pair
  in a second (burn, then develop); **0.81%** sees more than three, in thin tongues, far under
  the area threshold. Frames at 30 fps can alias flicker above 15 Hz.
- **Torch.** B8's pool centre on the 2x export, paper pixels only: RGB 57, 50, 43, hue 30.0°, HSL
  saturation 14.0%.
- **Shader timings.** Every B9 ledger row was checked against the `.glsl` source. They match,
  except for the three gaps in m1, m2 and m7. Loop and texture-tap counts per shader went into the
  buildability table.
- **Positions.** Row frames from MCP bounds: B1t 843 (text 854), B2t 914 (916), B1 1241, B2 1373.
  The live site was measured in the built-in browser at 390 × 844, light theme; the viewport was
  reset afterwards. `scrollWidth === innerWidth` was true.
- **Images.** Sizes and transcodes are measured by Pillow, AVIF q55 and WebP q75, at the source size
  and at 780 px wide. The lettering zooms are `zoom-gen15-sign.png` and `zoom-gen18-table.png`.

## The product

- **The horror half lands.** The rift tear, a sky with something in it, the void's half-seen
  form, cold wrong fire, and the small-town fog are photoreal at board scale and read as the
  genre. The taglines are the strongest King-tradition writing in the set ("The lights came back
  on in the ninety-fifth minute. So did something else."). Much of the spectacle sits in the title
  treatments M1 may rule out, and in a crossing that recent passes made quieter (p4).
- **The joy half does not, yet.** Fixtures, the Table and Ledger carry dread only. Joy lives in
  B6's "A no-bet week is a successful outcome." and in B7, which cannot ship (M8). The world has an
  obvious home for joy that is honest: a full-time state with results, the book "closing" on a
  played matchday. It is not designed (B3).
- **B6, the quiet week, is the best screen in the set.** It is data-driven ("Nothing to stake
  until Friday 20 November." is right for the snapshot), short and calm. It needs B2's stop
  control and M4's retouch.
- **B7** is a well-made concept with no data. Fence it (D6).
- **B8, the dark theme,** changes only the pulp; the covers, plates and shelf are already dark.
  On a phone there is no pointer, so the torch is a fixed warm spot on NEXT. Low risk, low payoff.
  It passes contrast on the page and shares B1's failures on the cover and plates.
- **Poster length:** the target is met on the week list (843 / 914) and missed as a reading
  experience (M3).
- **Moments:** untouched beyond the MOMENTS tab in the shell. Fence it (D5): the shell and tokens
  only. Its gallery CSS carries Broadcast references that the clearing removes anyway.

## Fergie Time fit

| Departure | Level | Note |
|---|---|---|
| Photographs, paper and wear textures, scrim gradients, shadows | token / system | "Flat color only"; the proposal names it |
| Motion beyond 150/180/220 ms | token / system | Proposal names it; B9 keeps the three values for state |
| Themed Table | token / system | Hard rule 6; open ruling 4 |
| Pulp `#EBDDBE` replaces `#F7F5EE`; dark pulp `#0E1420` replaces night green `#0E1C15` | token | Root of B1; dark loses the "floodlit pitch" ground |
| `fb-blood #B3121B` as a voice (L pips, imprint foot, captions, spine heads) | token | A third accent beside amber and burnt-orange (hard rule 5) |
| `fb-rift #9DFFC8` neon green (part labels, +5, CRT) | token | A second green beside pitch, which means "confirmed" |
| Six new families: Abril Fatface, Libre Caslon Text, Courier Prime, Orbitron, Chakra Petch, Caveat; Inter gone from team names | token | Plex Mono still sets every data numeral |
| Wordmark in Abril Fatface 22 px (Fergie Time: Oswald 700 34 px) | brand | |
| Icon nodes (sync, rotation, filters, moon, chevrons); 🗽 and flag emoji dropped from clocks | system | "No icon font and no SVG icon set — deliberate" |
| Form pip colours (m5), GF:GA colon (m4) | component | Fair game, but each moves a voice |
| The Rack, spines, shelf, part openers, contents rows, cover face | component | Fair game; new primitives for Fergie Time's second edition |
| Amber on provenance only; 14 competition hues untouched | — | Holds on every board (amber appears in photographs only, M4) |

## Buildability

Phone cost is reasoned from each shader's structure (loops, texture reads, area, duration). It is
**not measured**: B9 `IGDjw` says no phone benchmark has been run, and none was here. All of it
fits the stack without a dependency: raw WebGL2, CSS, and the View Transition API directly
(React is 19.2.8 in both `package.json` files, and `<ViewTransition>` needs 19.3).

| Effect (B9 row) | Technique | Phone cost | Fallback / motion off | Risk | B9 vs file |
|---|---|---|---|---|---|
| Fog, fog drift | Two pre-rendered fog layers moved by CSS transform (compositor), or the 5-octave fbm in the hero canvas | Low (CSS); moderate (shader at full DPR) | t = 0 still | Per-frame hash grain is TV static: drop it | Match; files identical (m7) |
| Rift | Hero canvas, sky region, `mix-blend-mode: screen` over the photo | Moderate (4-octave noise, star cells, about 390 × 250) | t = 0 still | Blend composite cost on Safari | Match (17.95 / 6.98 / 52.36 / 20 s) |
| Foil | CSS `background-clip: text` gradient, one 1.4 s sweep via `@property` | Low | Static gradient | Recolours live glyphs, against B9 (D8); measure the gradient's darkest stop | Match (25 / 50 / 74.8 s) |
| Drip, burst | Small title canvas; glyph alpha mask drawn by 2D canvas `fillText` after `document.fonts.ready`; spray in the bleed room | Low–moderate (24 and 28 × 8 loops, small area; burst one-shot 1.1 s) | Calm still | Mask drifts from DOM text on wrap, zoom or font swap | Match (48 bpm, 0.78, 7 s, +3.5 s, 52 bpm) |
| CRT spine glitch | CSS: RGB `text-shadow` plus `clip-path` slices on `steps()` keyframes, one spine at a time | Low | Calm neon | The ungated dim (m1) must not be ported | Omits the dim |
| Blood pool | Muted, inline, seamless video loop behind the shelf (AV1 / H.264), or the shader | Shader moderate–high (camera, 5 drops, mist layers, continuous); video low | t = 0 still | Continuous ambient: needs B2's control | Match (periods / 2.6) |
| Rim fire, smoke (hold) | Rack canvas; the hold as a still scorch plus a cheap smoulder; the full shader only during a crossing | High if continuous (5–6 texture functions, 8- and 6-step loops plus smoke loops over the stage) | Still = 1 scorch and haze | The 1%-alpha key handshake is Pen-only (M9) | Match; `u_reach` unused |
| Crossing, shake | One WebGL2 canvas under live text; covers, void, flames and smoke as textures; neighbours' jolt by CSS transform | Highest: 983 lines, up to 9 reads per photo during split × smear, two photos during the develop. Compile at idle before the 9 s first crossing; canvas DPR ≤ 1.5 | Instant swap, still scorch | Compile jank; `webglcontextlost` → stills; low-power 30 Hz rAF (timings are time-based, which is right); wire ring (m2) | Match (7 + 1.8 s; shake 0.17–0.67 s with 70 ms stop; develop 0.95–1.60 s) |
| Slip glow | CSS radial gradient, `screen` blend, 8 s opacity breath | Negligible | Still | B7 is fenced (D6) | Match (8.055 s, 0.5) |
| Torch | CSS radial gradient under the content, positioned from `pointermove` via custom properties | Negligible | Fixed pool on NEXT | Must stay under ink; never moves on touch | Match (rest 0.42 / 0.842, keep-clear 174–527) |
| Scorch | Pre-rendered image | None | Same | — | Match (static) |
| State changes, opening | CSS 150/180/220 ms; `document.startViewTransition` for the 600 ms book opening | Low | Instant | Equivalence across the N7 cutover | n/a |
| Rack scroller | Native `scroll-snap`, `IntersectionObserver`, own buttons; `animation-timeline: view()` behind `@supports` | Low | Static, no auto-advance | The proposal's browser-support table was not re-verified here | n/a |

**Weight.** The Poster's first book needs the cover, two neighbour arts (the crossing samples
all three), the void, flames, smoke, wear, page texture and two plates. At 780 px wide that is
about **280 KB as AVIF and 370 KB as WebP**. The wear overlay alone is 98 KB, because grain does
not compress; a tiled texture or shader grain would replace it. Six new font families come on
top. The repository's `single` and `offline` builds (`vite-plugin-singlefile`) inline assets,
which adds a third to their size: they should ship the motion-off, no-photograph state. The
sources are 15.3 MB of PNG in all. The covers are 928 px wide, short of a 330 px face at 3x DPR
(990 px).

## Decisions for Beni

Each is one question. The first option listed is the recommendation; no version number is
chosen here.

1. **Direction** — ruled 11 Nov 2026: develop B. Closed.
2. **References** (open) — Evoke, or Cite? *Evoke*. The closest calls (m9) are within evoke.
3. **Sequence and numbers** (open) — Clear-first, Fold into the cutover release, or After? The
   proposal recommends Clear-first. The clearing is independent of every finding here; the number
   is Beni's alone.
4. **Table** (open) — Extend the skin to the settled Table, or Hold? *Extend, structure
   untouched.* B3's data and structure are sound; its contrast and goal format (B1, m4) need the design pass.
5. **Moments** (open) — Fence or Include? *Fence*: shell and tokens only.
6. **Money** (open) — Motif or Figure? *Motif*; fence B7 out until `positions.json` and a privacy
   ruling exist.
7. **Global motion control** (new, B2) — an imprint-band control that stops all decorative
   motion, or one-shot-only ambient effects? *Imprint-band control.*
8. **Title glyphs** (new, M1) — plain live type with effects in the surround only (B9); live
   glyphs recoloured in CSS for the foil only, with a measured contrast floor; or titles drawn
   in the canvas with hidden live text? *CSS foil on live glyphs; drip, burst and CRT in the
   surround.*
9. **Fergie Time second edition** (new, M10, B1) — accept the token departures as a second
   edition with B1's contrast fixes; confine them to Poster's covers and plates, so data
   surfaces keep Fergie Time's paper, type and voices; or reject them? *Confine:* it fixes B1
   by construction and keeps Ledger the plain list.
10. **Week completeness** (new, B4) — Ledger always lists the whole week and Step 0 moves to
    `&lens=ledger`; Poster lists the whole week too, with books as sections; or one book per
    page in both? *Ledger complete.*
11. **What the Rack holds** (new, M5) — the week's matchday books in order plus the Register;
    only the next two matchdays; or every matchday in the window? *The week's matchday books
    plus the Register, resting on the next.*
12. **Row ordinals** (new, M7) — drop them, or keep them per day and captioned? *Drop.*
13. **First screen** (new, M3) — accept that no fixture is named above the fold on Poster, or
    put the next matchday's first fixtures on the cover's lower band? *Put them on the cover*,
    within rule 11's text exclusions.
14. **Photograph licence and record** (new) — pen.dev gives Beni the outputs "subject to any
    third-party rights", says the provider's terms also apply, and does not warrant
    non-infringement. The repository is MIT. Options: commit photographs under a separate asset
    licence with each image's provider and prompt recorded; serve them uncommitted; or license
    them MIT with the code? *Separate asset licence plus a provenance record per image.*
    Moments already holds generated content until its policy's section two exists, which is the
    precedent.

## What the implementation prompt must carry

Inputs, not the prompt:

- Beni's rulings on D2–D14, and the design pass's answers to B1–B5 and M1–M7 as boards or a
  brief.
- The spec frames by node: trimmed `vy9Fu` and `lIP4D` (not `jAjFv` and `dsa04`); B3, B5, B6 and
  B8, plus the 360 and 1000 frames M2 asks for; B4 for behaviour; B9 for motion, amended by m1
  and m2.
- B0 rules 1–11, with rule 9 rewritten (B5), rule 11's shake scope settled (m2), and rule 6
  extended with the cold grade (M4).
- Spec precedence as CLAUDE.md states it, noting the M1 resolution.
- The token table after D9, with every new ink/paper pair's measured ratio. `src/index.css` and
  `src/lib/competitions.ts` remain the source of truth.
- The state inventory from B3, each state drawn, and the TBC date-line form.
- The architecture contract from B9 04: live text above one canvas per visible region; the build
  owns its stills; the list in M9 of what must not leak.
- The motion-control contract (D7); the APG carousel roles (`aria-roledescription`, slide labels
  that name book and date, a live region off while rotating); 44 px targets.
- Per-effect fallbacks from the buildability table, with a phone frame-time gate (16.7 ms) to be
  measured in the build. Image and font weight budgets, set by measurement.
- The photograph set after M4's retouch, the D14 licence record, and AVIF / WebP art-directed
  crops at 1x–3x.
- The browser matrix (every lens × theme × tab at 360, 375, 390, ~1000, with `scrollWidth`) and
  the contrast method above, run on the built pages.
- The sequencing from the proposal: the overhaul's build after N7; the clearing on its own track.

## Deliberately not done

- No Pen node, shader, image, source, test, data, token, workflow, package or version file was
  changed. Only `u_freeze` was moved temporarily, then restored to −1. Nothing committed.
- Pen's chat was not run. The case for another pass is the decision list: the work is a design
  pass on states, contrast and the 360 / 1000 frames, which belongs to the ladder's design brief
  (Claude Design), not to Pen.
- No phone was benchmarked and no load or paint time was measured. No contrast was measured over
  moving fog at t > 0.
- The image provider for each photograph was not identified (pen.dev routes to Google Gemini,
  OpenAI, Quiver AI, Recraft or Unsplash), so no provider's terms were read.
- The proposal's browser-support claims (Firefox 159 scroll-driven animations, React 19.3's
  component) were not re-verified.
- B0 was read through the MCP (its rules note and data samples), not exported in parts.
- No image was generated. Transcodes for weight were made in memory and not kept.

## Appendix reconciliation (sealed items, read after the findings above)

1. **Confirmed.** At 7.70 s the left flank's ember line reads as a near-continuous red outline,
   with a dark blotch outside the upper-left edge. The scorch band is near-invisible on dark grass
   (`exports/review/loop/zoom-770-leftflank.png`). The 7 px distance was not re-measured.
2. **Confirmed.** The 7.42 s blaze is much smaller than `filmstrip-3`'s, and the plumes are faint
   (`compare-742old-742new-770new.png`). Whether it under-delivers is Beni's call.
3. **Confirmed.** 22.70% here against 22.68%, worst window starting 8.233 s against 8.25 s (frame
   phase). It is also not a WCAG 2.3.1 failure: it is one transition, and 0.81% of the face
   exceeds three flashes a second.
4. **Confirmed, with a scope caveat.** Pool centre RGB 57, 50, 43, hue 30°; saturation 14.0% here
   against 14.7% (a different pixel sample). The 5.00:1 floor is reproduced by an independent
   method; the 7.39:1 "outside" equals the flat `#A9A493` on `#0E1420`, which is consistent.
   `contrast.py`'s method is sound for light-on-dark text, but it excluded the plates, shelf and
   cover, where B8's failures are (B1).
5. **Partly confirmed.** B3's table body text measures at least 4.97:1 here (2nd percentile).
   The figures were not isolated, so 5.3:1 is consistent but not reproduced. The live Table's
   compact next-fixture cell is Brooklyn-only
   (`TablePage.tsx:458–466`), but its expanded detail shows both clocks (lines 359–363). So the
   two-clock break is the compact cell's only. B3 adds local time: confirmed.
6. **Confirmed.** `s2-face.png` holds the title, date digits, tagline and imprint foot as pixels.
   The live-type-above-canvas answer is B9 `nDwN7`.
7. **Confirmed.** `u_titleTop` is unset (default 0) on `Y6WsY`. The 6.5 px distance was not
   re-measured.
8. **Confirmed.** The arrival storyboard (`mHxuX`) has no image fills; B9 is 2,440 px wide.
9. **Confirmed.** $4,096.00 is captioned ILLUSTRATIVE directly under the figure and in the
   footer; ruling 6 is open (D6).
10. **Confirmed.** Row frames are at 843 (B1t) and 914 (B2t). The live site measured 845 for the
    row and 853 for its text on 13 Nov, on a newer snapshot; see M3 for what that comparison
    misses.
11. **Confirmed and extended.** The five spot-checked timings match, and so does every other
    row, except the gaps in m1 (CRT dim), m2 (wire ring) and m7 (identical fog files).

Sources read: [pen.dev terms of use](https://www.pen.dev/terms-of-use) (effective 26 Oct 2026);
the redirect came from [pencil.dev terms of use](https://www.pencil.dev/terms-of-use).

# Design overhaul — the clearing, and Night Fixture

Proposal and spike record, 11 Nov 2026 (Brooklyn). Ladder rung 1: audit, directions, open
rulings. Nothing here is built; no version moves; no number is chosen. Written by a Claude
Code session in-repo from a fresh read, with direction boards drawn in the Pen (pen.dev)
app on Beni's instruction.

**Updated 14 Nov 2026.** The clearing shipped as v0.5.5 that day; the last entries under
"Rulings received" record the cycle, Beni's rulings R1 to R7 and the release. The overhaul is
still unbuilt. This file and its prompts were kept on `claude/design-overhaul-spike` until
then and landed in `docs/` after the release.

## Ground truth

- Read at `origin/main` `250c5c0`. `package.json` 0.5.3, latest annotated tag `v0.5.3`,
  `CHANGELOG.md` `[Unreleased]` empty. Since v0.5.3 the only non-sync commit is the docs PR
  #314. The local `main` checkout was 31 commits behind origin and was left alone; this file
  lives on `claude/design-overhaul-spike`.
- The public site is still the Vite app on Pages. The Next.js reader on the Vercel preview
  imports the same `src/` components through `web/src-allowlist.mjs`, so one edit to `src/`
  changes both. The cutover (N7) has not run and is ruled as v0.6.0.
- Snapshot read: 1,484 fixtures (369 full time, 1,114 scheduled, 1 suspended), header stamp
  2026-11-11 07:48 UTC. A fixture carries `id, competition, kickoffUtc, venueTz, venue,
  venueId, venueCountry, home, away, status, timeConfidence, result, source`. There is no
  broadcast field in any generated file.
- The live site was measured on 11 Nov 2026 in a 390 × 844 viewport, light theme, with
  `document.documentElement.scrollWidth === window.innerWidth` true in Poster and Broadcast.
- `../Fergie Time Design System/` was read (README, tokens, the brand rules). It was not
  edited. It is at `~/Documents/Claude/Projects/Fergie Time Design System/` on this Mac.
- The first boards (A1 to A4, the tone cards and the first B0) were made on 11 Nov 2026 in
  `~/.pencil/documents/0eaaec9f-0dc7-4f73-af58-20e5d6e95aac/`, with one shader and four
  generated images; that file is now the frozen "before". **Updated 13 Nov 2026:** the B boards
  under review are in `~/.pencil/documents/kickoff-revamp-b1/kickoff-revamp-b1.pen`, with 14
  shaders, 19 generated images and 6 rack renders beside it. Both are local-only and not
  committed. The cold review (`docs/design-overhaul-review.md`) found this bullet stale.

## Beni's brief (11 Nov 2026)

Three removals, ruled: the **Broadcast** lens goes and the switch reads **Poster, Ledger**
in that order; **Where to Watch** is deprecated completely, interface and data; the
**Monthly** view goes. One direction, to be designed: fixtures and tables with a cosmic
horror atmosphere in the tradition of Stephen King and Joe Hill, photoreal rather than
drawn, carrying the pathos and joy of betting on football and winning. The reference is the
"Haunted Ledger" page built for the settlement evals. Beni fires the prompts in Pen, Claude
Design, Codex and Cursor; this seat says when.

## Audit of the app as shipped

Measured on `?date=2026-11-21`, a full week, at 390 wide.

1. **The first fixture of the week is below the fold in Poster.** The first row of the
   week list starts at 856 px; the viewport ends at 844. Above it sit the header, the lens
   switch and tabs, the hero, Where to Watch (45 px), Filters (45 px), the Weekly / Monthly
   pair (43 px) and the period nav (50 px). In Ledger the first row starts at 740 px. The
   two controls being removed cost 117 px with their gaps.
2. **Poster shows the next matchday twice.** The hero lists the three Friday fixtures, and
   the Friday day block, which starts about 300 px below the hero, lists the same three.
3. **Three lenses, two ideas.** Broadcast is Ledger's skeleton with amber numerals, mono
   metadata, a ticker and a glow. Poster and Ledger differ in kind: one is loud, one is a
   working list. Removing Broadcast leaves the real contrast.
4. **The default landing this week is empty.** 9 to 15 Nov has no fixtures. The page is the
   hero, the controls, one line reading "NO FIXTURES" and the footer. It is honest and it
   is dead air.
5. **The TV pill is in every row.** The dashed "📺" pill sits in the expanded part of each
   fixture row (45 on that week), so Where to Watch is more than the panel.
6. **The England flag is a black flag here.** The subdivision-flag emoji did not render in
   the Chromium pane on this Mac, on Premier League rows and chips. Worth an ideas row; a
   drawn mark would end it.
7. **Small things.** The sync stamp wraps "UTC" onto its own line at 390. The Dark mode
   button is heavier than the wordmark. Moments is an empty tab on the public site.

## What the brief does to Fergie Time

The design system's four data rules do not move: no kickoff time the league has not set,
no invented matchday numbers or scores, amber means provenance and nothing else, and both
clocks come from one UTC instant. A haunted skin makes those rules more important, so this
proposal adds one: **the fog moves, the numbers never do.** No distortion, flicker or
transition is ever applied to a time, a date, a score, a team or a table figure.

Three written rules are contradicted by the brief and need Beni's word, because the system
says they are not a builder's to change:

- **"Flat color only. No textures, no imagery."** The brief is photographs. Proposed
  replacement: photographs live behind heroes and empty states only; every row of data sits
  on a flat plane.
- **Hard rule 5, the motion budget.** Proposed split: state changes keep 150 / 180 / 220 ms
  exactly; a separate ambient layer (fog, grain) is allowed on heroes, is slow, stops under
  `prefers-reduced-motion` and in a hidden tab, and is absent from Ledger.
- **Hard rule 6, "the Table is settled."** The brief asks for themed tables. The board
  keeps the Table's structure whole (zones, lettered form pips, columns, next fixture) and
  changes the hero, the display type and the ground.

Also retired with Where to Watch: 📺 from the emoji set, the dashed TV pill, the NEW pill
that only `tvNew` used, and the design system's `WatchPanel` mirror. Retired with
Broadcast: its template, the ticker card, and the one sanctioned glow.

One collision is worth naming early. A night scene lit by sodium lamps is amber everywhere,
and amber is the one colour this product reserves for "check where this number came from".
The boards grade every photograph cold (mercury-vapour teal) so amber keeps its single
meaning. Money and the pitch share green, which is also the voice that already means
"confirmed".

## What carries over from the reference

The Haunted Ledger is an illustrated horror comic: Creepster and Bangers type, halftone
dots, hard print offsets, d3 charts, Rough.js, rough-notation, p5.brush paint layers and
perfect-freehand ink borders. Its lasting idea is already Fergie Time's: ink speaks, green
confirms, the lamp is provenance, blood alarms. That mapping carries over unchanged. The
drawing libraries do not: the pivot from drawn to photoreal replaces them with photographs,
a WebGL fog and grain shader, real materials and a 1970s paperback serif.

## The spike in Pen — what was built and what it showed

Eight top-level items on one canvas, all at 390 wide, all on real data from the snapshot
above: a live browser node of today's Poster for comparison; **A1** Poster fixtures, **A2**
Ledger fixtures, **A3** the Premier League table, **A4** the quiet week; tone cards **B**
and **C**; a legend.

- **Photographs.** Four generations, one pass each, none retried. At board scale all four
  held the brief: no people, no lettering, no crest or logo. They are a floodlit ground in
  fog seen from a car park, a players' tunnel, a worn paperback on a pub table, and a
  bookmaker's counter under a green banker's lamp with a banded stack of notes and a blank
  slip. Generated sizes were 768 × 1376, 848 × 1264 and 1376 × 768, about 0.66 MB each as
  PNG. They were not inspected at full resolution.
- **Fog.** A 69-line WebGL 1 fragment shader (`fog.glsl`, beside the Pen file) is laid over
  the A1 and A3 heroes in screen blend. Exporting the A1 hero with the layer on and off
  gives different files, so it renders. Whether it animates on the canvas was not watched.
- **Type.** Fraunces (open licence) at weight 900 stands in for the paperback display face.
  Oswald caps, Inter and IBM Plex Mono keep their Fergie Time jobs, so every data glyph is
  set exactly as it is today.
- **Layout.** With the two controls gone and the hero no longer repeating the rows, the
  first fixture row on A1 starts near 580 px against 856 px live. That is a board, not a
  build.
- **Contrast, flat grounds only.** Computed for the board palette: the weakest pairs are
  muted text on the raised surface and the W form pip, both 4.63:1; body ink is 15.5:1 on
  the ground. **Text over a photograph was not measured.** It sits on a gradient scrim and
  must be measured at its worst pixel in the design cycle.

Board palette, for the designer to accept or replace: ground `#060C0A`, surface `#0D1814`,
raised `#13231C`, ink `#E9E4D4`, secondary `#A9B3A6`, muted `#7E8C80`, pitch `#56C083` and
lamp `#F7C948` (both unchanged from Fergie Time dark), blood `#FF5A40` (the reference's).
The 14 competition hues are untouched.

## Directions

**A — Night Fixture (recommended).** A photograph behind each hero and each empty state, a
cold grade, slow fog, and a flat ledger plane for the data. Poster carries the spectacle;
Ledger carries none of it and stays the fast list the betting pipeline reads. The Table
keeps its structure under a tunnel photograph. The quiet week becomes the best screen in
the app: the pay-out lamp, and the line the brand already owns, "A no-bet week is a
successful outcome." That is where the joy of winning lives without a number on the page.

**B — The Paperback.** Each matchday is a worn mass-market horror paperback with a
foil-stamped date and cover art. Strong and recognisable as an object. It has nowhere to
put a 26-match Saturday, and the photographed book cannot hold live text in perspective.
Kept as a tone card; its serif is already in A.

**C — The Window.** One continuous scene, the bookmaker's shop after closing, with fixtures
as objects in the room. The most ambitious and the hardest to keep readable, fast and
honest at 390. Its photograph is the one A uses for the quiet week.

Recommendation: **A**, with B's type and C's window already folded in.

## Rules for generated photographs

Carried from the fal spikes of 4 to 5 Oct, which found no model honours "no text, no logos"
reliably: no real person, club, kit, crest or ground; no lettering inside a photograph; a
human looks at every one before it ships; the footer says the photographs are generated.
Dread, not gore; no jump scares; nothing that flashes.

On the King and Hill reference: the recommendation is to **evoke and never cite**. No
character, place or title from either author, and no borrowed trade dress, in a public
repository that a LinkedIn reader may clone. A small American town, fog, floodlights and a
lamp are nobody's property. This is Beni's ruling, not this seat's.

On money: the repository is public, so no real profit figure belongs in it or on the page.
The motif carries the feeling. A real figure waits on the `positions.json` bridge, which is
still blocked on the Sportsbooks side, and on a privacy ruling.

## Release shape

Two pieces of work that do not depend on each other.

### The clearing

Remove Broadcast, Where to Watch and Monthly. No new capability and no change to any
generated file or to the sync, so the betting pipeline's data is untouched. The pipeline's
Step 0 uses `?only=` and `&date=`; both stay.

| Removal | `src/` | Tests | `web/` | Also |
|---|---|---|---|---|
| Broadcast | 15 files: `lens.ts`, `theme.ts`, `useThemeController.ts`, `lensSelectors.ts`, `shell.css`, `index.css`, `App.tsx`, `offline.tsx`, `TickerStrip`, `LensSwitcher`, `FixtureRow`, `WeekView`, `LedgerWeek`, and comments in `TabNav`, `FixturesPage` | 15 files, led by `tests/dom/app.test.tsx`, `tests/theme.test.ts`, `tests/dom/theme.test.tsx`, `tests/themeBootstrap.test.ts` | `shell.tsx`, the allowlist, `moments/gallery.css`, 2 tests, 10 proof scripts | `scripts/n6a-proof.mjs`, README |
| Monthly | `FixturesPage`, `MonthView`, `urlCodecs.ts`, `monthCellSummary` in `lensSelectors.ts`, `addMonths` in `time.ts` | 4 files | allowlist, `globals.css`, `check-css.mjs`, 1 test, 2 scripts, `web/README.md` | |
| Where to Watch | `WatchPanel`, its mount in `FixturesPage`, the TV pill in `FixtureRow`, `tv` on all 14 competitions and `tvNew` on 4 in `competitions.ts` | none found | allowlist, `globals.css`, `check-css.mjs`, `web/README.md` | |

Counts are files that contain the term, read by grep at `250c5c0`; the builder re-derives
them. Three raw ESPN test fixtures contain the word "broadcast" as the provider's own
field and are not ours to edit. `docs/` and the committed verification receipts are history
and are not rewritten. Which of the `web/scripts` still run in CI was not checked.

Implementation choices this seat recommends, for the builder to confirm with the diff in
hand: `LENSES` becomes `['poster', 'ledger']`; `?lens=broadcast` already decodes to Poster
and is canonicalised away; `?view=month` should be stripped on load rather than left in the
address bar describing a view that is not shown; the `kickoff-theme-broadcast` storage key
is simply never read again. `hotFixtureIds` and `nextMatchdaySelection` lose their only
visible consumers, the glow and the ticker; keep them and `data-hot`, because the overhaul
wants a "next" marker where the glow was (the NEXT pill on board A1). `tickerSegments` goes
with the ticker.

### The overhaul

Night Fixture across Fixtures and Table, as a minor under one subject line. Build notes for
the implementation rung, none of them decided here: photographs as AVIF with a WebP
fallback and art-directed crops; one small raw-WebGL canvas per hero for fog and grain, so
no new runtime dependency; a static photograph and scrim when motion is reduced, the tab is
hidden or WebGL is absent; a self-hosted variable display face. Image weight and paint time
budgets are to be set by measurement on a phone, not written from a desk.

### Sequence, and a conflict to rule on

`docs/nextjs-migration-plan.md` freezes the look across the cutover: no new animation, the
150 / 180 / 220 ms budget kept, and only Moments and the Privacy foot allowed a deliberate
visual change. An overhaul built before N7 breaks the equivalence proof the cutover rests
on. So the overhaul's **build** belongs after N7. Its **design** touches no code and can
start now.

The clearing is different. Landed before N7 it shrinks the cutover's Fixtures matrix from
three lenses by two views to two lenses by one. But merging it changes the public site at
once, and Beni's SP6 ruling was that the public site and the version string do not move
until the cutover. Clearing first therefore needs that ruling amended, and a number.

## Who fires what

| Step | Where | Who | Waits on |
|---|---|---|---|
| Look at the boards, rule below | Pen file, or the six exported images | Beni | nothing |
| Design cycle: Fergie Time's second edition, the two lenses, Table, quiet states, day theme, contrast measured on photographs | Claude Design | Beni fires a brief this seat writes | rulings 1, 2, 4, 5 |
| Final photograph set at real crops | Pen | Beni, or this seat driving it | ruling 1, 2 |
| Build the clearing | Codex | Beni fires an implementation prompt this seat writes | ruling 3 |
| Cold review of the clearing | Claude Code, `/kickoff-pr-review` | Beni | the PR |
| Build the overhaul | Cursor or Codex, by quota, never the reviewer's vendor | Beni | the design handoff, and N7 |

## Rulings needed from Beni

*All six were ruled by 13 Nov 2026, the first on 11 Nov and the rest through the cold review's
decision list; see "Rulings received". The list below is kept as it was put to Beni.*

1. **Direction** — A, B or C. Recommended: A.
2. **References** — Evoke or Cite. Recommended: Evoke.
3. **Sequence and numbers** — Clear-first, Fold (the clearing ships inside the cutover
   release) or After. Recommended: Clear-first, the overhaul after N7. Every number is
   Beni's; the clearing adds no capability, which this repo has called a patch.
4. **Table** — Extend or Hold. May the settled Table take the new skin with its structure
   untouched. Recommended: Extend.
5. **Moments** — Fence or Include. Recommended: Fence, so Moments takes the shell and the
   tokens and nothing else in this release.
6. **Money** — Motif or Figure. Recommended: Motif.

## Rulings received

- **Direction, 11 Nov 2026 (Beni): develop B.** More cosmic horror and a much stronger King
  feel, with no aesthetic boundaries. The recommendation for A is overruled. The B boards
  are to be built by pen.dev's own chat from paste-ready prompts this seat writes, not by
  this session driving Pen, so the run doubles as a trial of that chat as a design seat.
- **What still binds B.** This seat kept two limits on the prompts: no character, town,
  title or iconic object from King's or Hill's books (ruling 2 is still open, and this is
  the conservative reading of it), and the data rules above. Amber stays provenance only, so
  the foil is prismatic rather than gold.
- **The B world, as prompted.** Fergie Time Books, a 1980s horror paperback imprint that
  never existed. Every matchday is one of its books; the horror is added time, the minutes
  after the ninetieth. Poster is the published paperback, with the fixtures as its contents
  page; Ledger is the author's typescript; the dark theme is reading under the covers by
  flashlight; the Table is the register, with relegation as "the drop".

- **What B0 became, 11 Nov 2026 (read 12 Nov).** Beni ran only the first prompt, then
  steered pen.dev's chat himself. B0 now holds the world bible plus five shaders this seat did
  not ask for: a title that bleeds (`blood-drip`), a day word that bursts (`blood-burst`), a
  perspective pool of blood under a torn sky (`blood-pool`), neon CRT spine titles
  (`crt-glitch`) and a faster fog (`fog-drift`), with Orbitron and Chakra Petch added beside
  the five planned faces. Covers carry a fictional book title ("The Fifth Minute") with the
  real date on a plain Plex Mono line under it, which keeps every digit free of effects. The
  remaining prompts are retrofitted to this look and handed over one at a time.
- **Poster length, 12 Nov 2026 (Beni): trim it.** On the B boards the first match sat
  1,241 px (Friday) and 1,373 px (Saturday) from the top, against 856 px on the live site.
  The cover stays full size; the shelf of spines moves below the contents behind a one-line
  week navigator, and the time-of-day breaks become ruled lines. Target: about 850 px and
  930 px.
- **No coded prototype in Pen, 13 Nov 2026 (Beni): skip it.** The Pen workflow ends with a
  short closing pass (Prompt 12) and then the summary brief for the design-review cycle. The
  swipe, the tap that grows a cover into its book, and the WebGL crossing are proven in the
  repository build instead, under its browser matrix, with B9 as the motion spec.
- **D9, the new look's reach, 13 Nov 2026 (Beni): the whole app, with fixed inks.** The second
  edition's paper, type and voices apply across the app, not only to Poster's covers and plates
  (the cold review had recommended confining them). Contrast is fixed with the review's own
  token changes, measured flat on the pulp `#EBDDBE`: provenance amber `#8A5F00` to about
  `#6E4B00` (4.20:1 to 5.85:1), muted ink `#5E5446` to about `#4E4538` (5.51:1 to 7.00:1), and
  the NEXT pill's ground `#2C7A4B` to `#1E5636` (4.43:1 to 7.26:1). Text sits on a flat plane:
  paper texture is capped or removed under text bands, the cover's wear overlay goes below the
  title block, caption scrims are at least 90% opaque, and no caption is under 10 px. Every new
  ink and paper pair is re-measured on the rendered page in the design pass and again in the
  build. These are token-level changes to Fergie Time's second edition; `src/index.css` and
  `src/lib/competitions.ts` stay the source of truth.
- **The cold review's other twelve decisions, 13 Nov 2026 (Beni): "as recommended".** The
  numbering is the review's (`docs/design-overhaul-review.md`, "Decisions for Beni"); D1 was
  the direction ruling above.
  - **D2 References: evoke.** Nothing names or copies a King or Hill character, town, title or
    iconic object; the closest calls the review listed (the big top, the fogged shop, the doors)
    stay within evoke.
  - **D3 Sequence: clear first.** The clearing (Broadcast, Where to Watch, Monthly) ships on its
    own track; the overhaul's build follows the N7 cutover. **No version number is chosen
    here**: each number is still Beni's to give when that release is scoped.
  - **D4 Table: extend.** The settled Table takes the new skin with its structure untouched.
  - **D5 Moments: fenced.** It takes the shell and the tokens and nothing else.
  - **D6 Money: a motif, never a real figure.** B7 (the pay-out) is fenced out of this release
    until bets are tracked (`positions.json`) and a privacy ruling exists. The design pass gives
    the joy of winning an honest home instead: a full-time state in which a played matchday's
    book "closes" on its real results.
  - **D7 Motion control: one for the whole app.** A persisted control in the imprint band,
    beside the theme button, stops every decorative playhead (WCAG 2.2.2); the Rack's Stop
    becomes its local mirror.
  - **D8 Titles: live type.** The foil is CSS on the live glyphs with a measured contrast floor;
    the drip, burst and CRT glitch play around the letters, never on them. B9's wording is to be
    amended to match.
  - **D10 Whole week: Ledger always lists every fixture of the week,** and its "more" lines
    become controls that expand in place with their counts. The betting pipeline's Step 0 moves
    to `&lens=ledger`. That edit belongs to the pipeline skill's owning copy and lands when the
    build ships, not before.
  - **D11 The Rack holds the week's matchday books in order, plus the Register,** resting on the
    next matchday. Each slide's accessible name says the book and its date, not its catalogue
    number.
  - **D12 Row ordinals: dropped.** No uncaptioned number sits beside a fixture.
  - **D13 First screen: the cover names the next matchday's first fixtures** in its lower band,
    inside rule 11's text exclusions, so a reader sees fixtures above the fold as they do today.
  - **D14 Photographs: a separate asset licence,** not MIT, with each image's provider, model and
    prompt recorded. Pen's logs and session files do not record which image model made each
    existing photograph, so those are re-recorded or regenerated before anything ships.
    *(13 Nov: the prompts themselves were recovered from Pen's session logs; only the model is
    unrecorded. See the second edition's rulings below.)*
- **The second edition's open questions, 13 Nov 2026 (Beni): "as recommended".** Claude Design's
  canvas "Fergie Time — second edition" (claude.ai artifact `S7mxVndS82uRQGqXEVGeiJ`, read at
  version `1794628683-67cf`) ended on twenty open questions. This seat reviewed the canvas
  against the snapshot and the live app first, then recommended an answer for each. Every
  fixture, kickoff, venue, stadium clock, result and count on it matched the snapshot, as did all
  20 Premier League rows and all 40 contrast figures. The numbering is the canvas's.
  - **Accepted as drawn.** 1, rule 3's exception: a day summary shows its first kickoff in
    Brooklyn time only. 2, the cover library keyed to the day type. Both stop being working
    assumptions. 4, blood is the alarm voice and burnt orange retires as the alarm. 5, the
    Brooklyn clock and scores in pitch. 6, form pips in ink, outline and blood. 8, six drawn
    stroke glyphs replace the emoji vocabulary. 9, the week row shows a year only outside the
    current Brooklyn year or across New Year. 10, a 640 px measure for Poster and Ledger at 1000
    and 780 px for the Table. 12, the page grows where the 44 px and 10 px rules need it. 13,
    the Ledger's NEXT UP cards gain the stadium clock.
  - **7, amber: eight uses.** Rule 4's six stand, plus a UEFA matchday line that is rescheduled
    or falls outside UEFA's published windows (a computed line stays in ink), and a stadium
    clock whose zone is not known ("local time not known"). The live app already sets both in
    amber (`MatchdayLines.tsx`, `FixtureRow.tsx`).
  - **11, the stadium clock: "20:30 local" on every row.** 24-hour with the word *local*, never
    a zone abbreviation, so the build keeps no abbreviation table to drift. The Brooklyn clock
    stays ET.
  - **Still Beni's.** 3, the wordmark (a brand call). 14, D14's record for the seven Pen-made
    sources: their prompts are recovered verbatim with session, line and timestamp in
    `~/.pencil/documents/kickoff-revamp-b2/pen-source-prompts.md` (generated-8 to -13 and -15),
    so the choice is between recording them with the model marked unknown and regenerating them.
    15, the two missing covers (a second Champions League night, a domestic midweek), which
    would spend fal credit. 16, a full-size look at the Friday cover's silhouettes and the fog
    plate's parked car.
  - **17, resolved in the fix pass.** The canvas held the Table's W, D and L columns and left
    its open row undrawn only because no board showed those figures; the standings snapshot
    carries them, so the fix prompt supplies all twenty clubs' W-D-L.
  - **Carried to the build.** 18, the filter panel and Zones & key, opened. 19, the title swap
    watched on a phone. 20, a phone benchmark.
  - **Fixes sent back to Claude Design.** The review's corrections and these rulings go back
    in one pass, archived as `docs/design-overhaul-design-fix-prompt.md`.
  - **The fix pass landed, 13 Nov 2026 (canvas version `1794631495-c77b`), and this seat
    checked it.** No zone abbreviation is left; all 159 stadium clocks read "HH:MM local" and
    every real one still matches the snapshot. The Ledger's 45 rows follow the live app's
    order (group, then kickoff, ties in snapshot order; `sortForDisplay`). All 20 W-D-L rows
    match the standings and sum to their points. The seven Pen prompts are on the Imagery board
    verbatim. The eight-marker row runs 8 px into its padding at 360 (exactly 352 px), with a new
    UEFA week board at 360, and 600 ms is out of the motion budget as question 21. The day-note
    specimens use two Brooklyn clocks the canvas did not hold (11:00 PM, 12:00 AM), captioned
    ILLUSTRATIVE. Each pair is still one real instant (a UTC+11 and a UTC−8 ground), though
    neither offset is a European one. Two things wait on Beni: Claude Design's own call that a
    cover's lower band goes by kickoff on a day that mixes cups and leagues (this seat
    recommends confirming it, since the band sits under a FIRST date line), and the go-ahead
    to bring its separate `21-second-edition-handoff.md`, which still predates the rulings, into
    line. That handoff file lives only in the Claude Design chat, not on the canvas.
  - **Band order, 13 Nov 2026 (Beni): kickoff order, confirmed.** On a day that mixes cups and
    leagues, a cover's lower band goes by kickoff while the rows below keep the app's group
    order. Beni also gave Claude Design the go-ahead to update its handoff file and publish it
    onto the canvas as `project/handoff/second-edition-handoff.md`.
  - **The second edition's handoff, verified 13 Nov 2026 (canvas version `1794632108-827d`).**
    Claude Design's handoff document, the input for the implementation prompt, is on the canvas
    at `project/handoff/second-edition-handoff.md` and, byte-identical, at
    `kickoff-revamp-b2/exports/handoff/21-second-edition-handoff.md`. It stays out of this repo
    with the rest of Fergie Time. This seat read it whole. Every ruling and fix is folded in, the
    seven Pen prompts are verbatim, all 18 fal request ids and 10 seeds match
    `fal/provenance.jsonl`, the W-D-L list matches the standings, and it carries no money or
    credit figure. One thing for the implementation prompt to settle: the handoff ranks itself
    above the Claude Design boards, while this repo's rule is template > design brief >
    implementation prompt. The prompt will put Beni's rulings first, then the boards, then the
    handoff, and note every resolution in the PR.
  - **Where the build stands.** The overhaul's build follows N7 (D3). On 13 Nov 2026 `main` has
    N1 to N4d, N6a and N6b merged. N5 (publication delivery, the fallback PR contract and
    privacy) and N7, the cutover, are still to come. The clearing has not
    started (`WatchPanel`, `MonthView` and `TickerStrip` are still in `src/`). An implementation
    prompt written now against the Vite app would go stale before N7, so the overhaul's prompt
    waits for the cutover. The clearing, which ships first on its own, is the next prompt that
    can be written from the repo as it is. *(Corrected 14 Nov: the first version of this bullet
    said "N1 to N3 merged and N4 planned", from a commit-message grep that missed the N4 and N6
    slices. Corrected again on 14 Nov, after the release: the second version said only N7 was
    left, but no N5 commit is on `main`, and `docs/v0.2.6-ideas.md` row 131 names the privacy
    copy N5 will write.)*
- **The clearing's implementation prompt, 14 Nov 2026 (Beni: "Yes, write it").** Written from
  a fresh read of `origin/main` at `ddd9a37` and archived as
  `docs/design-overhaul-clearing-implementation-prompt.md`, for Codex per "Who fires what", with
  the review in Claude Code's `/kickoff-pr-review`. The read re-derived the removal inventory:
  more files than the table above, because `.claude/skills/kickoff-pr-review/`, the Codex skills
  under `.agents/skills/` and two `web/test/` files also name Broadcast. The read also confirmed
  that Step 0 (`../Sportsbooks/CLAUDE.md`) uses only `?only=` and `&date=`. The prompt
  picks no number and forbids a bump, a tag and a merge. Merging the PR changes the public site
  at once, which D3's "clear first" accepts over SP6, but the number and the moment remain
  Beni's. PR #316 (`v0.5.4`, extra-time finals) is open beside it, so the two numbers are his
  to order.
- **The clearing built, 14 Nov 2026: PR #320 (draft, Codex).** Head `0faf606`, four commits,
  57 files, +465/−1054. `verify` and `studio` are green and Vercel deployed. The trusted-main
  preview smoke is red because main's `scripts/vercel-smoke.mjs` still demands the removed
  Weekly button; the PR moves that landmark to "Jump to today", which renders unconditionally in
  `FixturesPage`. Codex reports 96 of 96 browser cells and the first fixture row 143.75 px
  higher in both lenses at 390. Pass 0's cold-review brief is archived as
  `docs/design-overhaul-clearing-review-prompt.md`, for a fresh Claude Code session on Fable 5.2
  at Extra in a worktree of `codex/clearing`, with `--no-merge`. Its questions: whether an
  honesty rule lost its last test with the ticker and month cases, the old links and Step 0,
  the one theme key at first paint, the smoke landmark, test strings escaped to keep the audit
  grep empty, scope, and the matrix at 360. The Pass 2.5 gate will escalate, because the merge
  changes the public site and the number is Beni's.
- **Pass 1 on PR #320, 14 Nov 2026: mergeable after fixes.** A fresh Claude Code session
  reviewed `0faf606` and pushed six commits authored as Claude, moving `codex/clearing` to
  `89b8067`. Its comment is on the PR. It found no defect in either app's behaviour; its fixes
  are to the tests and the words. A hero could print a clock for an unset kickoff with every
  test green, because the ticker's cases were the only ones that rendered a placeholder NEXT
  (`9b3a90a` adds three hero cases). One URL test had been rewritten so it could not fail
  (`b275a56`). The local suite was red in 7 of 9 runs at the head and 0 of 9 at the
  merge-base, through a Git auto-repack in `tests/vercelIgnore.test.ts` that this PR's bytes
  trigger (`961d320`, outside the clearing's file list, in its own commit). Stale two-lens
  wording followed (`d1f32c0`), and rows 125 to 130 went to `docs/v0.2.6-ideas.md`. The PM
  seat's check of the deliverable: the head's typecheck is clean and 950 of 950 tests passed
  twice with no override; CI's `verify` is green at `89b8067`; with the hero rule broken, all
  947 tests still passed at `0faf606` and the new case fails at the head. Two corrections to
  the record. The comment counts five files in conflict with PR #316; at `89b8067` there are
  six, because both PRs add rows after 117 in the ideas file. And the comment says the design
  system and `Sportsbooks/CLAUDE.md` are not on this machine; they are, under
  `~/Documents/Claude/Projects/`, and the Pass 0 brief pointed to the wrong place ("beside
  the main checkout"). The ruling covers the template's mismatch either way. Left open for
  Pass 2 and Beni: the order against #316, the header at 360 and its font-swap shift at 375
  and 390, the escaped spellings, and the number.
- **Pass 1.5 for PR #320, 14 Nov 2026.** The rebuttal brief is archived as
  `docs/design-overhaul-clearing-rebuttal-prompt.md`, for Cursor on Grok 4.7 at Extra High, in
  a fresh worktree, `/Users/benicheni/code/kickoff-pr320-pass2-fresh`. The worktree's local
  branch is `codex/pr320-pass2-fresh`, and it pushes with `HEAD:codex/clearing`. The routing
  moved six times that day; the archive's header gives each step and its reasons. In order:
  Codex as the builder; Cursor on Grok; Codex again in its own worktree; Cursor on Grok 4.7 at
  Extra High at about 12:20 PM in the fresh worktree; Gemini 4 Argon at about 12:45 PM; and
  back to Grok 4.7 at Extra High at about 1:00 PM, because Cursor would not let Beni use Argon.
  That last routing is Beni's. The case for Codex
  rested on first-hand reasons that live only in the thread that built the PR, and a fresh
  session has none of them whichever vendor runs it. Cursor is not the builder, so the brief
  makes Pass 2 a rebuttal on the merits. Cursor may read Codex's `clearing.local/` evidence.
  It does not answer for Codex, and it lists the questions only Codex can answer for Pass 2.5
  to ask. It also discloses that Cursor built #316, so F5 and F3 (b) stay to facts, with no
  view on the order. It puts all nine Pass 1 findings to Cursor for accept, contest, or
  accept the observation and contest the characterisation. It asks for a cold review of Pass 1's six commits, which no one else has
  reviewed. It carries four PM-seat corrections. Decision 6 fenced too much of `docs/`.
  The design system and Sportsbooks paths were wrong. The conflict with #316 is six files. And
  decision 8 left no place for the smoke landmark. The suggested dispositions include keeping
  `961d320` in this PR, trading the escaped spellings for an allow-listed audit test if that
  stays small, and one `[Unreleased]` line for the smoke landmark. Beni's main checkout holds an
  untracked `.agents/skills/kickoff-pr-review/` copy. It is a mechanical rename whose 360 table
  names Codex as Pass 1's reviewer, and it stays his to fix or delete. The fresh worktree does
  not carry it.
- **Pass 2 on PR #320, 14 Nov 2026: Cursor on Grok 4.7 at Extra High.** Comment
  `issuecomment-6882281451`. Four commits authored as Cursor moved `codex/clearing` from
  `89b8067` to `09324fb`; they touch only tests, `CHANGELOG.md` and the ideas file. Dispositions:
  - It accepted all nine findings and contested one severity: F6 is low by its reading,
    medium by Pass 1's.
  - F7 was done in this PR: the literal names are back, and `tests/removalAudit.test.ts` allows
    each remaining occurrence by file and reason.
  - F9 was done: the server test now reads the checked radio.
  - F3 (c) was answered by probe. On Git 2.54 the repack is maintenance's geometric-repack task,
    and `gc.auto` is not the switch, so the comment in the test was corrected. The guard stays.
  - The smoke landmark gained one `[Unreleased]` line.
  - Two new low findings (N1, N2), both stale ideas rows, were fixed.
  - It left two questions only Codex can answer: why `a37299b` swapped in a second `ledger`
    value rather than escaping the retired one, and which tree first showed the ENOTEMPTY.
  - It reports that #316's head also trips the repack and lacks the guard.

  The PM seat's check at `09324fb`:
  - Typecheck is clean, and 951 of 951 tests passed with no override.
  - CI's `verify` and `studio` are green. `vercel-smoke` is red on the known landmark, from
    main's script.
  - The audit test fails on a planted lowercase name, on a planted TV glyph and on a deleted
    allowed case. It does not catch a capitalised "Broadcast". That gap came from the
    implementation prompt's case-sensitive grep. None of the audited paths holds one today.

  Next is Pass 2.5, `/kickoff-pr-review 320 --pass 2.5`, typed by Beni. Its gate will escalate:
  the merge changes the public site, there is no number, #316 is open, and F6's severity is
  still contested.
- **Pass 2.5 opener for PR #320, 14 Nov 2026.** A Pass 2.5 started in a fork on Opus 5.5 at
  Extra and stopped before it posted anything. Its scratch worktree is `claude/pr320-pass25`.
  The PM seat then recommended Fable 5.2 at Extra in a fresh Claude Code session, for four
  reasons: it matches Pass 1, this chat had grown long, a fresh session reads the PM seat's
  own suggestions cold, and it avoids the Learning style. The opener is archived as
  `docs/design-overhaul-clearing-synthesis-prompt.md`. It starts
  `/kickoff-pr-review 320 --pass 2.5 --no-merge` and gives the cycle's state, the record's
  locations and the worktree rules. It flags what is unusual: Pass 2 was not the builder, so
  three vendors count in the gate, and Cursor built #316 on the same model. It also turns off
  the Learning output style, which is Beni's default. Six spot checks travel as a sealed
  appendix, including the audit test's blind spot for a capitalised "Broadcast".
- **Pass 2.5 on PR #320, 14 Nov 2026: corroborated, then escalated.** A fresh Claude Code
  session on Fable 5.2 at Extra ran `--pass 2.5 --no-merge` at `09324fb` and wrote nothing to
  the branch (comment `issuecomment-6882900669`). It re-ran both suites, both builds and a
  96-cell matrix of its own, and corroborated every Pass 1 finding by mutation or measurement
  but one. F6's layout-shift regression at 360 did not reproduce: in ten runs per tree the
  merge-base reached 0.10 three times and the head 0.11 once. F6's severity was therefore the
  only point still contested, and neither vendor asked for CSS. Two new findings:
  `tests/removalAudit.test.ts` walked `src/data/`, so provider text could turn `verify` red on
  a sync PR, and `CLAUDE.md` still said the public site does not change until the cutover,
  with D3 in no tracked file. The gate escalated: a public-site change with no number, #316
  open and in conflict, and one contested severity. Cursor's two questions for Codex did not
  bear on the merge and were not put to Codex. The PM seat's read of that pass found two slips
  in its brief: #316's 11 Nov patch ruling is in that branch's `CLAUDE.md`, not its PR body,
  and the numbering question left out that clearing first with no number would have swept the
  clearing's `[Unreleased]` entries into v0.5.4's section.
- **Beni's rulings on the Pass 2.5 brief, 14 Nov 2026.**
  - **R1.** D3 lets the public site change before the cutover (N7). The full-stack work still
    lands as non-releases.
  - **R2.** PR #316 merges first.
  - **R3.** The clearing is v0.5.5.
  - **R4.** `961d320` and `c4afa12` stay in PR #320.
  - **R5.** The header at 360 and 375 stays as it is until the overhaul, so no CSS in this PR
    (`docs/v0.2.6-ideas.md` row 125).
  - **R6.** All three README football pictures are recaptured: Poster, Ledger and La Liga's
    table.
  - **R7.** v0.5.5 merges on Sat 14 Nov 2026.

  He also moved v0.5.4's merge day from Mon 16 Nov to Sat 14 Nov 2026; the record gave no
  reason for Monday. The `v0.5.4` tag names Cursor as its tagger, because the repository's
  local Git identity is `Cursor`, and he ruled to leave it.
- **v0.5.4 first, 14 Nov 2026.** The date move is archived as
  `docs/extra-time-date-prompt.md`, for Cursor as #316's builder. Its one commit, `8e955ad`,
  changed the four dated places. The Pass 2.5 seat re-read it (#316
  `issuecomment-6884081078`), and Beni merged #316 at `34d078b` and tagged `v0.5.4` that
  afternoon.
- **The release step, 14 Nov 2026.** The prompt that merged `main` into the clearing and
  prepared v0.5.5 is archived as `docs/design-overhaul-clearing-release-prompt.md`, for
  Cursor on Grok 4.7 at Extra High. Its first firing stopped at its precondition, because #316
  had not merged; the archive is the version reissued after it had. Cursor moved
  `codex/clearing` from `09324fb` to `dcb914e` (comment `issuecomment-6884589607`):
  - `217189c`, a merge of `main`, not a rebase, with six conflicts and no seventh;
  - `8ea93e2`, "Release v0.5.5.";
  - `7b7da6b`, the three README pictures from that build;
  - `188b909`, the audit test skipping `src/data` and matching the retired word in any case;
  - `dcb914e`, ideas row 120 closed, row 131 filed and the Pass 2.5 process note.
- **The PM seat's re-read, 14 Nov 2026** (comment `issuecomment-6884640961`). At `dcb914e`:
  typecheck clean, 981 of 981 root and 122 of 122 `web/` tests with no Git override, and
  `verify` and `studio` green. `git show --remerge-diff` listed the six conflict files and no
  seventh, and `[0.5.4]` is byte-identical to main's. With the AET label set to FT, both row
  tests fail. Against `main` at `34d078b`, with identical `src/data`, the first fixture row
  rose 143.75 px at 390 in both lenses and 116.25 px at 1000.
- **v0.5.5 shipped, Sat 14 Nov 2026.** Beni squash-merged PR #320 at `026f9f9` at 5:14 PM
  EST, with a tree identical to `dcb914e`, and tagged `v0.5.5` under his own name. CI, Studio,
  Pages and the preview smoke, now on main's new script, were green on that commit, and the
  live header read `v0.5.5 · 1482 fixtures`. This proposal and the clearing's prompts then
  landed in `docs/` from the spike worktree.

## The Rack — the cover carousel (planned 12 Nov 2026)

Beni asked for a carousel that shows the B1, B2 and B3 cover photographs at a tasteful
interval and invites a tap or a swipe. The design is a 1980s drugstore spinner rack of
paperbacks, because a spinner rack is a carousel that already exists in the world this
direction lives in.

**Where it lives.** The top of Poster's Fixtures tab, in place of the single cover and no
taller than it, so the trim's targets hold. The imprint band (the app's chrome) stays still
above it; only the cover faces move. Slides: The Fifth Minute (Fri 20 Nov), Twenty-Six Doors
(Sat 21 Nov), The Register (Premier League table). The full week, Sunday and the Monday
continuation included, stays on the shelf of spines below the contents.

**Behaviour.**

- The first move comes after 9 s; each cover then holds 7 s and the change takes 1.8 s. The
  rack makes one pass and rests on the next matchday's book. Perpetual rotation is not
  offered.
- Every change is a crossing (below): the cover burns open from its own rift seam onto the
  void, and the next book rises out of it. Titles and date lines cross-fade; they never
  burn or shake.
- A swipe turns the rack under the finger on a cylinder; the fire follows the drag.
- Rotating changes nothing below the rack. Only a tap opens a book: the cover grows into
  that book's cover, and only then does the page below change (or the Table opens, for the
  Register).
- Rotation stops on focus, touch, hover and a hidden tab. A stop/start control is first in
  reading order and its label names the action it will take, as the WAI-ARIA carousel
  pattern requires; WCAG 2.2.2 requires the control because the motion lasts over 5 s.
- With motion off the rack never starts by itself: no tear, no cylinder, no push-in.

**The crossing (Beni, 12 Nov 2026).** He asked for ominous cosmic-horror fire around the
rims of the carousel whenever a swipe, a click or the interval moves it, with a shake as if
reality shifts into another dimension, to carry the genre's theme: people are insignificant
when something vast and unknown wakes. As designed:

- **The fire is wrong.** It is cold, it burns outward from every rim toward the void and
  falls instead of rising. Its colours run from blood-black roots through violet to
  rift-green tongues with near-white cores. There is no orange, yellow or amber in it,
  because amber means provenance in this system, and fire that looks natural would be
  known fire.
- **The beats of an automatic change (1.8 s).** Ignite (0–0.25 s): fire runs the rims and
  the art trembles. Crossing (0.25–0.95 s): the cover burns open from its seam and the void
  shows, a form too vast to see whole; the shake peaks and every face shrinks about 3%, as
  if the rack is being drawn away. Emergence (0.95–1.45 s): the next cover rises out of the
  void. Embers (1.45–1.8 s): ash falls, the shake settles, the titles cross-fade in. During a
  hold, a faint smoulder waits at the corners.
- **Interaction.** A swipe drives the fire by drag distance, leaning against the drag;
  releasing past halfway commits a 0.6 s crossing with one heavy shake, and releasing before
  it lets the fire recede. A tap flares the rim and the fire consumes the rack as the cover
  grows into its book. On desktop the flames nearest the pointer lean toward it.
- **The shake** follows the trauma model from Squirrel Eiserloh's GDC 2016 talk: Perlin
  noise scaled by the square of a decaying trauma value. Beni watched the first live loop on
  12 Nov 2026 and found it "about right", wanting it a little more dramatic so the transition
  is felt as a vibration. The felt version layers the cues game designers use for impact: a
  fine tremor of at most 1.5 px over the sway, building from ignite; an impact at 0.45 s with a
  70 ms hit-stop (community guidance puts hit-stop at 40–100 ms); a refractive shockwave ring
  from the seam; a 2% punch with one overshoot; the neighbours and the rack's chrome wire
  rattling a frame later; a short directional smear. Limits: sway at most 8 px and 0.8°, RGB
  split at most 4 px, the whole shake within 0.5 s. Everything that is not photograph, fire,
  smoke or wire stays still, because a still frame of reference is what makes the shake
  felt.
- **Smoke that hangs (same feedback).** Pale cold vapour hangs along the rims at all times,
  spilling over the edges and pooling in the gutter; dark smoke rises off the fire during a
  crossing and lingers about 3 s. Flow-warped fbm, lit from beneath by the fire and from
  inside by the rift, with a one- or two-step density sample toward the light for volume.
  It stays off every title, date, marker and digit.
- **Haptics, build only.** Android Chrome supports `navigator.vibrate` after a user gesture;
  iOS Safari has no Vibration API (caniuse, read 12 Nov 2026), and the hidden-switch
  workaround was reported patched in iOS 26.5. So only a crossing the reader starts vibrates,
  on Android; automatic crossings never do.
- **Techniques.** Rim fire is an SDF band around each face's rounded rectangle (Inigo
  Quilez's 2D distance functions), filled with domain-warped fbm noise scrolled away from the
  rim; the burn is a noise-threshold dissolve with an ember band just past the threshold.
  Both run in the rack's one WebGL2 canvas, beneath the DOM text.
- **Limits.** The world shifts; the record does not: fire, shake, split, bulge and recede
  touch photographs, rims and the void only, never the chrome, a title, a date, a marker or a
  digit. Fire reaches at most 4 px inside a rim. WCAG 2.3.1 forbids more than three flashes a
  second over a large area, so brightness across most of a face changes over at least a third
  of a second, flicker stays in thin tongues, and saturated red never flickers. With motion off
  (WCAG 2.3.3, `prefers-reduced-motion`) there is no moving fire, shake, void or recede: the
  rim is a still scorch and books change instantly.

**Realism pass (Beni, 12 Nov 2026, after the second fire).** Beni judged the rebuilt fire
"weird and artificial", worse than the first. Reviewed from a 14-frame filmstrip of the live
loop (rendered by freezing its clock) and from `rim-fire.glsl` itself, the causes were:

- the tongues were stamped from a grid of identical cells (23 px and 11 px), so the rim read
  as a sawtooth border;
- they followed each rim's normal, so they stuck out sideways and hung down. That came from
  this seat's "fire that falls" brief, which was a mistake: fire always rises;
- they were painted as near-opaque colour from a dark blood root, which was also this seat's
  brief. Real fire is light: it adds brightness, it is brightest at its base, and it lights
  what is near it;
- length and sway were fixed-rate sine waves, so the motion was mechanical;
- the burn front was a clean glowing outline of constant width, which read as an electric
  crack beside the cover's own lightning, and the emergence was a growing ringed circle,
  which read as a portal;
- the smoke read as static grey marble in the gutters.

The rebuild uses what real-time VFX artists use for believable fire: a photographic flame
element animated by scrolling, noise-distorted UVs (flowmap style), eroded by noise at the
tips and added as light, never painted. Colour is anchored in real coloured flames: boric
acid burns green, potassium lilac, copper chloride blue-green, all translucent with a
brighter core. The fire burns behind each book and rises, so it is backlit and never crosses
text. It lights the photograph's edges and the wire, and a faint heat shimmer rises above
it. The burn becomes a paper burn: scorch, a thin irregular ember line, flaking char, small
flames riding the front. The next book develops out of the dark. Ember red, never orange,
lives in the char line.

**Second realism pass (12 Nov 2026).** The fire now has a physical source, a bed below and
behind the books, with flames climbing the sides, clusters and gaps, glow only where there is
flame, a blaze on the burn front and a broken ember line. What remained: flames clumped along
the mostly vertical burn front instead of rising off it; side fire squeezed into 8–20 px; smoke
as an even haze that veiled the next cover. The next prompt makes the hole grow upward fastest,
as burning paper does, so its upper edges face up and carry the tall flames; lets the side
flames rise in front of the neighbours' text-free slivers instead of widening the layout; and
turns the smoke into distinct plumes that clear off the new cover within a second. Rule 11 is
reworded to separate a face's outer rim (4 px of char, 24 px of smoke) from the burn front,
where fire and smoke may cover the burning photograph but stop 8 px short of the title scrim.

**Third and fourth passes (12 Nov 2026).** Prompt 9 made the hole climb with a flame crown and
built B7 (the pay-out) and B8 (the dark theme), but the hole grew as a smooth egg, the plume
was a flat grey band, the char touched the imprint foot, and B8's torch pool sat over the text.
Prompt 10 ran in a fresh Pen chat on GPT-6 Astra (OpenAI, through Pen's bundled Codex) and did
only its first job, as the prompt allowed: the hole is now lobed, fingered and asymmetric, the
plumes sample the smoke photograph instead of a grey band, the foot stays clean, and the next
cover develops over 0.65 s. Its own check found 24% of the face changing by 10% or more in
relative luminance within a third of a second. That is WCAG 2.3.1's measure, and a single
dark-to-light change is not a flash, so the gate passes; rule 11 is to name that threshold.
Still artificial at 2x: the fine fray renders as loose square specks and thin wavy doubled
lines, and the flanking flames read as narrow vertical columns. The safety cases it could not
certify (shimmer and split over flattened neighbour faces) close by construction in the build:
text is live type above the effects canvas, never pixels in it.

**Prompt 11 (13 Nov 2026), a fresh GPT-6 Astra chat, all three jobs done.** Rule 11 now names
the 10% threshold. B9 · Motion (2440 px wide, four 390 px panels, a 15-row conductor's ledger
and a row of 14 motion-off stills) quotes shader timings that check out against the files
(rift breath 17.95 s, drip 48 bpm, burst 7 s period, foil light 74.8 s, slip glow 8.06 s); it
also found that the crossing's code and its comment disagree on a cutoff (0.7 s against 0.6 s).
The fire's square specks and striped columns are gone: flames are tapering tongues and the edge
is continuous, though now a little too clean. The develop peaks at 22.65% of the face. B8's
torch now sits under the ink, and the lowest text contrast is 5.14:1 inside and 7.39:1 outside,
but it still reads grey: the lit paper at the pool's centre measures about RGB 47, 49, 54. The
`#FFF1E6` tint at 14% over blue-black paper keeps the paper's blue cast.

**Which model ran what, from Pen's own session files (read 13 Nov 2026).** Prompt 1 ran Claude
Fable 5.1 at high effort; Prompts 2 to 9 ran Claude Fable 5.2 at high, through Pen's Claude
agent on Beni's Claude plan. Prompts 10 and 11 ran GPT-6 Astra at medium on every turn, with
3,500 to 5,000 reasoning tokens a run, although Pen's picker showed High: Pen's OpenAI route
does not pass the effort choice through. The closing pass, Prompt 12, goes to a fresh Fable
5.2 chat at High.

**Prompt 12, the closing pass (13 Nov 2026), and the end of the Pen work.** It ran on Fable 5.2
at high effort; the session file confirms both. B8's torch now reads warm: `#E8B36F` at 20%
lights the paper's centre to about RGB 57, 50, 43 (hue 30°, 14.7% saturation), and the lowest
text contrast is 5.00:1 inside the pool and 7.39:1 outside. B9's four blank stills are re-cropped
and the crossing's comment now matches its code (0.7 s). The burn edge gained a 3–6 px scorch
band and a fine irregular outline; this seat reran the develop's brightness gate afterwards
(22.68% of the face, against 22.65% before) and synced B0's rules note and `flashlight.glsl`'s
defaults to the new torch. One PNG per board is in the Pen folder's `exports/final/`. The cold
review that opens the design-review cycle is briefed in `docs/design-overhaul-review-prompt.md`.

**The cold review (13 Nov 2026), `docs/design-overhaul-review.md`.** Opus 5.5 found the boards'
data honest and the clearing intact, and returned "needs rulings first, then one more design
pass". Its five blockers: text contrast under 4.5:1 on the textured pulp and over photographs;
no motion stop on pages without the Rack (WCAG 2.2.2); the honesty states (time not set, live,
postponed, staleness, UEFA matchday lines) undesigned, and 445 of the 1,484 fixtures need the
first; neither lens lists the whole week, which changes what Step 0 reads; rule 9's date line
overflows on 11 of 75 matchdays. This seat re-derived the contrast pairs, the placeholder count,
the week's counts (3, 26, 16, then 3 on Monday) and the date-line width, and all match. It
proposes thirteen decisions, D2 to D14, for Beni; his rulings are to be written back here.

**Baseline and b2, before fal (13 Nov 2026).** At Beni's request `kickoff-revamp-b1` is frozen
as the baseline, the reviewed design before any fal.ai work. `BASELINE.sha256` beside it records
a checksum of the `.pen` file, every shader and every image. Work continues in a full copy,
`~/.pencil/documents/kickoff-revamp-b2/kickoff-revamp-b2.pen`. Beni has a fal.ai account to
spend on the next version. fal publishes an official MCP server (a relay at
`https://mcp.fal.ai/mcp-relay` that signs in by browser OAuth, so no key is stored), and Pen
accepts extra MCP servers for its canvas agents in Settings > MCP. Pen cannot show video, so
fal's video models make build assets only. The planned uses follow the review: retouching the
lettering out of B6's photograph, regrading warm plates cold, upscaling the covers, depth maps
for shader parallax, the Sunday cover the Rack now needs (D11), a plate for the "book closes"
state (D6), and tileable textures. Each run's request id, model and prompt is to be copied
into a local record at run time, because fal keeps them for only 90 days (D14).

**fal round one (13 Nov 2026).** Forty-five requests were run in a separate session, each logged
with its request id, model, prompt and file checksums in b2's `fal/provenance.jsonl`. Kept: B6's
shop photograph with its sign and warm lamp removed (FLUX Kontext); both street plates regraded
cold; Topaz 2x upscales of the Friday and Register covers, which stay truer to the source than
SeedVR2 (SeedVR2 invents detail, so it is used only on abstract plates); depth maps for those two
covers; four tileable textures, which still need contrast; three "book closes" dawn plates; one
Sunday cover for "Sixteen Bells", which needs a small retouch; and a 6 s living loop of the
Register cover whose largest frame-to-frame change in mean brightness is 0.16%. FLUX's safety
filter blanked the first Sunday prompts until the words "horror" and "dread" were removed, and
even then it kept adding people, clock faces and lettering: six of eight runs were rejected,
which bears out the rule that no model honours "no text" reliably. The Saturday cover and its
loop keep amber lights from their source and need regrading first. Nothing is wired into the
`.pen` file yet.

**fal round two (13 Nov 2026).** Twenty-nine more requests, logged the same way. The Saturday
cover is regraded cold and upscaled, with a new 6 s loop (largest brightness step 0.14%). The
Friday and Register covers now fill their frames: Kontext extended the sky and ground into their
black bands, and they were upscaled to 1888 × 2208 with depth maps that separate the tent, the
pylon, the tear, the goal and the seats, ready for parallax in the crossing. Round one's shop and
street edits are upscaled. A UEFA midweek cover came from Nano Banana 2 (floodlit grounds
scattered to the horizon, joined by faint green threads); FLUX ignored the brief and added warm
pitches and figures. The Sunday cover's sky tear worked, but Kontext also removed the goal in
front of the tower, and the void's loop drew fog through space, so both are fallbacks. A
fixes pass then redid the Sunday cover's tear while keeping the goal, and upscaled the midweek
cover. fal's total for the three passes is about $4.10, estimated from list prices because fal
reports no per-request charge. The chosen files are listed in b2's `fal/picks.md`.

**The design pass begins (13 Nov 2026).** It answers the review in three Pen prompts, run in a
fresh Fable 5.2 chat at high effort on `kickoff-revamp-b2.pen`. Prompt 13 covers the inks and
flat text (D9), the app-wide motion control (D7), the date line, the fal photographs, the Rack's
full week (D11), the contents (D12, D13) and the small fixes. Prompt 14 covers the honesty states,
the complete Ledger (D10) and a UEFA-week board. Prompt 15 covers depth parallax in the crossing
and the 360 and 1000 px frames. One call in Prompt 13 is this seat's, not Beni's, and he may
overrule it: rule 3 gains an exception, so a day summary such as a cover's date line shows the
first kickoff in Brooklyn time only, since one day spans several stadium clocks. Every fixture
still shows both clocks. The rewritten rule 9 drops the year so the date line fits at 390 px,
and gains a "FIRST KICKOFF NOT SET" form.

**Prompt 13 landed (13 Nov 2026), Fable 5.2 at high effort, confirmed from Pen's session file.**
All seven jobs ran. This seat re-measured contrast on fresh 2x exports, which match the run's
own exports pixel for pixel, with an independent ring method on flat ink colours. Nothing on
the trimmed copies, B3, B5, B6 or B8 is under 5.3:1; the run's stricter rendered-ink method puts
B8's torch pool lowest at 4.91:1. The covers' lower bands name the first fixtures above the fold
(at y 459 and 460), with times matching the snapshot. The Rack has four slides with live
neighbour faces; the motion control sits beside the theme button; rules 3 and 9 are rewritten.
Left for Prompt 14: the old muted ink on the B0 and B9 documentation boards, markers and the
Rack's Stop under 44 px, the fixtures band on the full cover face, and the stale "price" footer.
Prompt 14 also assumes covers come from a small library keyed to the day type and reused week to
week, because a week can hold seven matchday books. That assumption is this seat's and is
flagged for Beni.

**Prompts 14 and 15 landed (13 Nov 2026), Fable 5.2 at high effort, both confirmed.** Prompt 14
drew B10 (every honesty state, with real snapshot examples where the snapshot has one and
ILLUSTRATIVE specimens where it has none), rebuilt B5 as the complete week (45 rows, checked
against the data) and drew B11 (the Rack in a UEFA week, eight markers on their own row of 44 px
targets). This seat re-checked every date line, result, count, table figure and the
games-in-hand note against the snapshot; all match. Prompt 15 wired the full-bleed covers and
depth maps into the crossing. The parallax is capped at 6 px and measured at 3.95 px at most.
The motion-off still is unchanged pixel for pixel, and the develop's brightness gate still
passes at 26.6% of the face. The depth maps turned out to be near-dark, not near-bright as this
seat's picks list had said; the run read the files, corrected it and set a polarity control.
The run also added 360 and 1000 px frames with eight wrap rules (names wrap, clocks never do),
re-measured B10's contrast from its final layout, and added a "Read me first" index board for the
Claude Design step. One instruction of this seat's was wrong: it told the run to take "KICKED
OFF" out of amber, but the live app sets it in its floodlight colour, which is that amber,
because the snapshot does not yet know the result. A short closing pass puts it back and lists
it in rule 4.

**The Pen work closes (13 Nov 2026).** Prompt 16, the closing pass, restored KICKED OFF to the
provenance amber (5.85:1 on the pulp), listed it in rule 4, made the Rack storyboard's frames 2b,
3 and 4 show the burn hole, and added a build rule: every control gets a 44 by 44 px hit area by
padding. A handoff set of every b2 board, the rules note as text and the fal picks is in
`~/.pencil/documents/kickoff-revamp-b2/exports/handoff/`. The next rung of the ladder, the Claude
Design brief that folds the set into Fergie Time's second edition, is
`docs/design-overhaul-design-prompt.md`. Two inconsistencies with Fergie Time's first edition are
handed to it rather than settled here. Rule 4 lists three uses of amber, while the first edition
also uses amber for games in hand and 24–72 hour staleness. And B10 draws LIVE in pitch green,
the confirm voice, while the first edition puts LIVE in its alarm voice.

**What Pen can and cannot show.** Pen animates only shaders. A shader fill takes image
samplers, `@time` and `@mouse`; there is no timeline, no prototype link, and no text that
changes over time. Presentation mode steps through top-level frames without transitions
(read 12 Nov 2026 at docs.pen.dev). So the Pen boards are a storyboard of states plus one
live, art-only shader loop of the tear. The swipe, the tap and the cover morph can only be
proven in code. Pen's agent can build a Vite, React, TypeScript and Tailwind page and show
it in browser nodes on the canvas; Beni ruled on 13 Nov 2026 to skip that and prove the
motion in the repository build.

**Web technology for the build, read 12 Nov 2026.** Kickoff has no animation dependency
today (root React 19.2.8 on Vite 8; `web/` Next 16.4.1 pinning React 19.2.8; Tailwind
4.3), and the plan keeps it that way.

| Layer | Recommendation | Support, as read | Why |
|---|---|---|---|
| Scroller | Native `scroll-snap` slides | Universal | Swipe, trackpad and keyboard for free |
| Cylinder spin | Scroll-driven animation, `animation-timeline: view(inline)`, behind `@supports` | Chrome, Safari 26, Firefox 159 (web.dev, Oct 2026) | Runs on the compositor and follows the finger |
| Markers and arrows | Our own buttons | CSS `::scroll-marker` / `::scroll-button()` are Chromium-only, and markers were reported missing from the accessibility tree | One implementation everywhere |
| The tear | One WebGL2 canvas over the active slide, a port of `rift.glsl` mixing two textures | Universal | WebGPU still has gaps (Firefox on Android and Linux) and buys nothing here |
| Opening a book | Same-document View Transitions; React `<ViewTransition>` once React is 19.3 | Chrome 111+, Safari 18+, Firefox 144+; the component is stable in React 19.3 (React blog, 9 Sep 2026) | The cover morphs into the book |
| Snap detection | `IntersectionObserver` | Universal | `scrollsnapchange` is Chromium-only |
| Images | AVIF with WebP fallback, the first slide `fetchpriority="high"`, the next decoded on idle | Universal | Three large photographs on a phone |

Rejected: a carousel library (Swiper, Embla) or GSAP or three.js, because the platform now
does each part and the repo carries none of them. Budgets (paint time, image weight, frame
time during a swipe) are to be measured on a phone in the build, not set here.

## Deliberately not done

- No source, test, token or workflow file was changed. No version string moved.
- The design system folder was not edited, and neither it nor the Pen file is in the repo.
- No photograph was committed. pen.dev's terms were read by the cold review on 13 Nov 2026;
  the image provider's terms were not, because no provider is recorded per image (D14).
- No contrast was measured over a photograph; no load or paint time was measured at all.
- The fog shader was not ported to the app.
- The pipeline skill's Step 0 text was not touched. Beni ruled `&lens=ledger` (D10); the edit
  is for the skill's owning copy and lands when the build ships.
- No design brief or build prompt was written yet. The rulings are in; the design pass is next.
  *(As of 11 Nov. Since then the design prompt, the design-fix prompt and the clearing's five
  prompts were written; all are archived beside this file. No overhaul build prompt exists.)*

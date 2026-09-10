# Design spec — the UCL league-phase cycle (transcribed from the canvas)

Archive record, written 8 Sep 2026 by the Round 1 cold review of the design-review cycle
(`docs/design-cycle-ucl-review-pass-1.md`). **The release number for this cycle is open** —
it is not-decided item (f) below and Beni rules on it at Round 3; nothing in this file claims
one. The canvas itself is local-only and unreleased, like `../Fergie Time Design System/`, so
this file is a transcription of its decisions, not a copy of the artifact; the artboards stay
where they are.

## Round 2 correction notice

This file preserves what the canvas said, including its false provider premise; it is not
approval to implement those claims. [Round 2](design-cycle-ucl-review-pass-2.md) supersedes
its factual assertions where measured: ESPN serves all three UEFA club competitions in
probed matchday windows, and the earlier human curl attribution was never established.
The original canvas remains unchanged. Its 1g Moments location conflicts with item (c);
its `--media` ratio is 1.097506:1 (1.10), not 1.14. The sync age at the stated illustrative
"today" is 38.5 hours, not 3. The build must also resolve venue time zones before activating
UCL; the current normalizer assigns Zurich to every venue. These corrections do not choose
items (a)–(g), the VERIFY items, or a release number.

## The artifact

- `../Kickoff European week design/UCL League Phase - Design Cycle.dc.html`, 138306 bytes,
  SHA-256 `7fcd369554f5b0dc87f61bfc20046a83286d330fd7558da80b2a7a89d2d95785`.
- Its `github.md` sync record (SHA-256 `9f9958c736a6e957c75603f67159528136c112ea2df373f1b8776d514135f37c`) says it was read against `22ca01a`
  (v0.3.1), synced 2026-09-08T14:35-04:00, and lists the repo files each artboard recreates.
- Eight artboards: 1a European matchday × three lenses · 1b mixed week · 1c matchday marker
  and its absence · 1d league-phase table · 1e Premier League table, unchanged · 1f colour
  sheet · 1g Moments · 1h never-list amendment and handoff spec.
- The colour sheet's ratios and ΔE figures are computed at render time by the trailing
  `class Component extends DCLogic`; they do not exist as text in the file. The candidate hue is
  a Tweaks prop (`uclCandidate`, default `#5C7CE6`).
- Precedence, from the brief this canvas answers: **design system template > design brief >
  implementation prompt**. The canvas outranks the brief; both outrank any build spec.

## Rulings, as the canvas states them

1. **The matchday is derived and says so** (brief Item 1, option 2). Computed from a
   hand-authored list of UEFA's eight published windows, rendered as one mono
   floodlight-amber provenance line at day level ("MATCHDAY 1 · COMPUTED — UEFA WINDOW 8–10
   SEP"), with an absence state when a fixture's Brooklyn date falls outside every window
   ("MATCHDAY — · DATE OUTSIDE UEFA'S PUBLISHED WINDOWS"). Option 1 (silence) rejected as
   reading like a bug; option 3 (provider round) declared dead on the blocking finding below.
2. **`--comp-ucl` stays `#8B6FE8`.** Identity comes from the ⭐ glyph, the 3px marquee rail no
   domestic row wears, and the day-level treatment — not a hue change that would repaint the
   top band of five domestic tables. The candidate `#5C7CE6` was measured and rejected.
3. **The 36-row table keeps the 3px rail and gains a sticky region header** under the sticky
   column header (mobile, `top-7`) whenever a band is deeper than eight rows, with the range in
   the divider ("KNOCKOUT PLAY-OFFS · 9–24"). No new colours: 1–8 in `--comp-ucl`, 9–24 in
   `var(--floodlight)` (the PLAYOFF precedent), 25–36 in `var(--accent)` (the REL precedent).
   Progress line: "As of matchday 1 of 8 · league phase" from a per-competition season length.
   The Next lane is empty when no UCL fixtures join; it is not hidden.
4. **Moments ship as shape 2** — a linked still on a new `--media` ground inside a 4px card, no
   in-app playback, a third tab, the empty state as the primary artboard. Categories: Pre-match,
   Highlights, Celebrations. Provenance banner first.
5. One never-list rule moved (imagery, with the Moment-still exception), one honesty rule
   narrowed (HONESTY.md rule 3's last sentence), the motion budget untouched.

## The blocking finding the canvas leads with

"ESPN publishes no `uefa.champions` / `uefa.europa` / `uefa.europa.conf` scoreboard (Beni's curl
check, 8 Sep). Item 1 option 3 is off the table, and every Champions League row in this cycle
needs a second provider before a pixel of it can be real. The design is provider-neutral; the
build is not." The Round 1 review re-ran this check; see the review document for the result.

## The two rule amendments, verbatim

**Never-list, Visual foundations › Backgrounds.** Was: "No textures, no imagery, no blur, no
outer shadows." Now: "No textures, no blur, no outer shadows. No imagery, with one exception: a
Moment's still, which sits on the media ground (`--media`) inside a 4px card, is always
attributed and linked to its rights holder, and never plays inside the interface. Elevation
still comes from borders and fill steps."

**HONESTY.md rule 3, last sentence.** Was: "Matchday numbers are not invented either. The
provider exposes none, so the app shows none." Now: "Matchday numbers are not invented either.
Where the provider exposes none and the competition publishes no calendar, the app shows none.
Where the governing body has published the matchday windows, the app may derive the number
from the fixture's date — and must label it computed, name the window, and admit when a date
falls outside every window."

**Token added, flagged.** `--media`: `#e4e0d2` light / `#0a140f` dark, a fifth surface role for
the Moment still's ground. The canvas claims 1.14:1 against `--surface-alt` in light and argues
it needs no ratio (non-text, adjacent to a 1px hairline). Blast radius: Moments only.

**Deliberately not moved.** Hard rule 5's motion budget; the single-gradient rule; the four
colour voices (amber on the Moments banner and the matchday line is provenance); hard rule 4,
both clocks; hard rule 6 — the Table's language is extended, not restyled (1e is the proof);
`--comp-ucl`.

## Data-shape findings (the canvas's own list — "each is a schema change before a pixel lands")

- **F1 — no provider.** `SYNCABLE` cannot reach UCL; rule 1 forbids hand-authoring the gap; a
  second provider is a prerequisite and `source.provider: z.literal('espn')` must widen with it.
- **F2 — season length.** `LeagueTableMeta.matches?: number`; `matchdayProgress` uses
  `meta.matches ?? (teams-1)*2`. UCL: 8. Fixes "1 of 70".
- **F3 — phase label.** `LeagueTableMeta.phase?: string` → "league phase" appended to the
  progress line. Domestic: absent, line unchanged.
- **F4 — matchday windows.** `MATCHDAY_WINDOWS: Partial<Record<CompetitionKey, {md; from; to}[]>>`,
  hand-authored beside `LEAGUE_TABLES`, with its own `ZONES_SEASON`-style season guard.
  Resolver: Brooklyn date of `kickoffUtc` → `md | null`. A day whose fixtures resolve to two
  matchdays renders one line per matchday.
- **F5 — deep bands.** Zones of 16 rows already type-check; `ZoneDivider` needs range text and
  a sticky flag when `to - from + 1 > 8`.
- **F6 — 36-team standings.** `teams: 36` cross-check already exists; `standingRowSchema` needs
  no new field.
- **F7 — Moments record.** New file, new schema: `{id, category:'prematch'|'highlights'|'celebrations',
  fixtureId, title, source:{name, url}, still?:{url, credit}, curatedAt}`. Excluded from the sync
  boundary, the diff engine and the staleness clock by explicit decision.
- **F8 — sub-line wording.** `posterSubLine` counts LEAGUES; when every competition on the day
  is `group !== 'domestic'` it should say COMPETITION(S).
- **F-DS1 — token drift.** The DS `colors.css` carries `--ink-muted #8a9284` and lacks
  `--floodlight-strong`, `--accent-strong` and the lens variables. Repo wins; the canvas mirrors
  the repo in its own head block.

## Per-state tokens (implementable, as written on 1h)

- **Matchday line** — `font-mono text-[10px] font-medium tracking-[0.06em] uppercase
  text-floodlight-strong`; absent adds `italic`. Poster big header: `mt-[3px]` third line.
  Poster small header: inline chip after the count. Ledger/Broadcast: `pb-[5px]` first child of
  the row column, above the `border-t`.
- **Progress line** — unchanged classes; text
  `As of matchday ${played} of ${of}${phase ? ` · ${phase}` : ''} · ${syncedAgo}`.
- **ZoneDivider (sticky)** — mobile: `sticky top-7 z-[1] bg-bg`; adds `font-mono text-[9px]
  font-medium text-ink-muted` range after the name. Desktop: range only, no sticky.
- **UCL zones** — Round of 16 · 1–8 · UCL; Knockout play-offs · 9–24 · PLAYOFF; Eliminated ·
  25–36 · REL. Notes as on 1d. `tieBreak`: VERIFY.
- **Moments banner** — the freshness callout verbatim: `rounded-[5px] border border-line
  border-l-3 border-l-floodlight bg-floodlight-bg px-2.5 py-2`; title `label-caps text-[9.5px]
  text-floodlight-strong`.
- **Moment card** — `rounded border border-line bg-surface overflow-hidden`; frame
  `aspect-video bg-media relative` + absolute 3px rail in the competition colour; title
  `text-[13.5px] font-semibold`; meta `text-[11px] text-ink-muted`; provenance `font-mono
  text-[10px] font-medium text-floodlight-strong`; link-out pill `rounded-full border-[1.5px]
  border-pitch text-pitch text-[10.5px] font-semibold px-[9px] py-[3px]` — solid, because the
  dashed pill is the TV pill's alone.
- **Colour** — no change. Reference: `#8B6FE8` on `#f7f5ee` = 3.48:1 (below AA normal); on
  `#0e1c15` = 4.63:1 (passes).
- **Lens deltas** — none new. The matchday line and the Moments tab are lens-independent;
  `FixtureRow` keeps no lens prop.

## Deliberately not done, and deliberately not decided (the canvas's own lists)

**Not done.** No fourth lens. No opponents lane or strength-of-schedule figure. No hue change.
No in-app playback. No Europa / Conference screens (they inherit F2–F5 and are not designed
here). No Results tab. No change to staleness thresholds, the diff engine, URL policy or the
LIVE window. No matchday marker for domestic leagues — scope, not principle.

**Not decided — the implementation prompt must not invent these.**

- (a) Which second provider, and whether its round string is trusted over the derived window
  when both exist.
- (b) The exact tie-break sentence for the league phase.
- (c) Whether the Moments file lives under `src/data/` — the folder rule 1 protects — or a
  sibling `src/curated/`.
- (d) Whether the Moments tab pushes history like Table does.
- (e) The still's aspect ratio if a rights holder's frame is not 16:9 (the frame is `cover`).
- (f) Release numbering — "this release" throughout; Beni's ruling.
- (g) Whether the sticky divider also fires at ≥8 rows on desktop.

**VERIFY carried forward.** League-phase tie-break order. Saturday 12 Sep's league count
(5, ESTIMATE on the canvas). Whether UEFA's published MD windows shift for any rescheduled tie.

## Repo facts the artboards assert (as drawn; the review recounts them at its head)

Header chrome `v0.3.1 · 1007 fixtures · synced 2026-09-08 00:30 UTC`; Ledger sub-line
`+5 more today` (illustrative: nine invented Wednesday fixtures, four in the cards); filter row
`All 14 competitions shown`; crop notes `FRI 11 (4) · SAT 12 (25) · SUN 13 (14)`; 1b's
Saturday leagues-count marked ESTIMATE; 1e's twenty Premier League rows taken from
`standings.json` with form order and the Next lane captioned illustrative.

## Screen map (from `github.md`)

| Artboard | Repo files it recreates |
|---|---|
| 1a European matchday (3 lenses) | `src/App.tsx`, `TabNav.tsx`, `LensSwitcher.tsx`, `FixturesPage.tsx`, `NextUpStrip.tsx`, `TonightSlate.tsx`, `TickerStrip.tsx`, `WatchPanel.tsx`, `FilterBar.tsx`, `LedgerWeek.tsx`, `PosterWeek.tsx`, `FixtureRow.tsx`, `src/lib/lensSelectors.ts`, `src/index.css` |
| 1b Mixed week | `PosterWeek.tsx`, `FixtureRow.tsx`, `src/data/fixtures.json` (2026-09-11/12 rows) |
| 1c Matchday marker | `PosterWeek.tsx`, `LedgerWeek.tsx`, `docs/HONESTY.md` §3 |
| 1d League-phase table | `TablePage.tsx`, `src/lib/standings.ts`, `src/lib/competitions.ts` (`LEAGUE_TABLES`) |
| 1e Premier League table | `TablePage.tsx`, `competitions.ts`, `src/data/standings.json` (pl) |
| 1f Colour sheet | `competitions.ts`, `src/index.css`, `CompetitionChip.tsx` |
| 1g Moments | `TabNav.tsx`, `WatchPanel.tsx` (hand-maintained precedent), `src/lib/schema.ts` |
| 1h Amendment + spec | `docs/HONESTY.md`, `src/lib/schema.ts`, `src/lib/standings.ts` |

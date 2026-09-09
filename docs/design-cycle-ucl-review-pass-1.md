# Design review, Round 1 — the UCL league-phase canvas against the repo

Cold review by Claude Code (Fable 5.1), 8 Sep 2026, Brooklyn time, of the Claude Design canvas
`../Kickoff European week design/UCL League Phase - Design Cycle.dc.html` (SHA-256
`7fcd369554f5b0dc87f61bfc20046a83286d330fd7558da80b2a7a89d2d95785`). Reviewed against the repo at
`0c37716` — one scheduled sync past the `22ca01a` (v0.3.1) the canvas was read against. This is
the first run of the three-round design-review cycle: Round 2 (Codex) rebuts each finding below;
Round 3 (Beni, then a Claude Code session) adjudicates and writes the build spec. **This cycle is
design-only by Beni's ruling**: nothing under `src/` changes in the review PR, there is no version,
and the release number is the canvas's not-decided item (f).

**Verdict: the design holds as drawn, and its central premise does not.** ESPN publishes the
Champions League scoreboard and standings the canvas says it does not (finding 1), so the
"second provider is a prerequisite" gate that shaped F1 and item (a) is inverted; the sticky
region header the table ruling rests on is not reachable on the Table's current markup
(finding 2); and three of the canvas's own measurements are wrong at the margin (findings 3, 4,
9). Everything else the canvas asserts about the repo either held at the head or moved only
because the sync moved. Handles corrected and ideas row 17 closed in `8ed3b0d`; paper trail in
`67bdc69`; this document in the commit after it. The review PR is BeniCheni/kickoff#34, opened
`--no-merge`; its one PR comment is the review's record on GitHub.

## Pre-flight, environment, baseline

- `origin/main` and the worktree were both at `0c37716` ("npm run sync 09/08/2026 1:17 PM
  ET"), one commit past the prompt's `22ca01a`; that commit changed only `src/data/*.json`
  (`fixtures.json` 1008 lines both ways, `meta.json` and `standings.json` stamps). Every
  count below was recounted at `0c37716`. The main checkout sat on the parallel row-28 hotfix
  branch (`codex/row28-designcycle-live-scope`); this review ran in its own worktree and pushed
  `HEAD:design/ucl-league-phase`.
- `npm run typecheck`: clean. `npm test`: **343 tests in 27 files, all green.** Ideas row 28 did
  not fire — tonight's snapshot holds zero `in_play` rows (Tuesday, no domestic football).
- Port 5173: nothing listening (`lsof`). The app was served from this worktree on **5174**
  (`.claude/launch.json` → `kickoff-dev-worktree`); the header stamp read
  `v0.3.1 · 1007 fixtures · synced 2026-09-08 17:17 UTC`, which is the head's `meta.json` and
  not `22ca01a`'s. The canvas was served over HTTP from its own folder on 8791 (`python3 -m
  http.server`), because `_ds/` and `support.js` are relative and the pane refuses `file://`.
  One tab each; `kickoff-theme` and `kickoff-theme-broadcast` cleared before any theme claim.
- Both local-only folders are present on the machine (`../Kickoff European week design/`,
  `../Fergie Time Design System/`). **The brief is not**: `claude/kickoff-ucl-design-prompt.md`
  is not in the repo and a search of the Claude project folders found no copy, so the brief
  archive (`docs/design-cycle-ucl-brief.md`) is the brief as the canvas and the Round 1 prompt
  restate it, and says so.

## The headline: the provider the design says does not exist

The canvas leads with "ESPN publishes no `uefa.champions` / `uefa.europa` / `uefa.europa.conf`
scoreboard (Beni's curl check, 8 Sep)" and builds F1 and not-decided item (a) on it. The Round 1
prompt notes this reached the design as *routed* evidence from a container with no egress. Re-run
from this Mac at 23:10 EDT (receipts and payloads kept in the session scratchpad; SHA-256 prefixes
`295a6c87`, `55da7fd8`, `8e683efd`, `522b940a`):

| Request | Result |
|---|---|
| `…/soccer/uefa.champions/scoreboard?dates=20260908` | 200, 69,886 B, **6 events**, all `STATUS_FULL_TIME`, `season.type.slug: league-phase` |
| `…/uefa.champions/scoreboard?dates=20260909` and `…=20260910` | 200, 6 scheduled events each — eighteen MD1 fixtures over the three days |
| `…/uefa.champions/scoreboard?dates=20260916`, `20260917` | 200, 0 events (no matchday) |
| `…/uefa.europa/scoreboard`, `…/uefa.europa.conf/scoreboard` | 200, leagues present, no events on the date |
| `apis/v2/sports/soccer/uefa.champions/standings?season=2026` | 200, 143,450 B, one child "League Phase" with **36 entries**, stats `gamesPlayed, wins, ties, losses, pointsFor, pointsAgainst, points, rank, rankChange` — the names `normalizeStandingEntry` reads |

The team ids are ESPN's global ids: 21 of the 36 entries (Barcelona 83, Liverpool 364, Bayern
132, Dortmund 124, Atlético 1068 …) appear in `standings.json` under the same id, so the
`teamId` ↔ `sourceId` join that S2 worried about is the same namespace, not a second one. What
ESPN does **not** carry is a per-event matchday: `week` is undefined and `competitions[0].notes`
is empty on every event, so `scripts/providers/espn.ts` line 183's "ESPN exposes no matchday
number" holds for the Champions League too, and the derived-matchday ruling stands on its own
merits rather than on the absence of a provider. ESPN does carry two things the design hand-authors:
`season.type.slug` and a `leagues[0].calendar` of six phase windows with dates, and a
`note.description` on every standings entry — "Qualifies for round of 16" (1–8), "Knockout phase
playoffs - seeded" (9–16), "- unseeded" (17–24), "Eliminated" (25–36).

I cannot know what Beni's check hit. Round 2 must re-run it from its own network before anything
else, and Beni should say which URL he used; if two networks disagree, that is the finding.

## The hunt classes, and what closed each

**D1 — repo facts the artboards assert.** Recounted at `0c37716`: 1007 fixtures (holds);
`All 14 competitions shown` (`COMPETITION_KEYS.length` is 14; `FilterBar.tsx` line 18 renders
exactly that string); `FRI 11 (4) · SAT 12 (25) · SUN 13 (14)` (4 / 25 / 14 by Brooklyn date,
exact); Saturday's leagues-count 5 (laliga, seriea, bundesliga, pl, ligue1 — the canvas's ESTIMATE
is backed by a count at this head and stays ESTIMATE until the build's); all twenty Premier League
rows in 1e (name, played, W-D-L, GF-GA, Pts) identical to `standings.json`. **Moved:** the header
stamp `synced 2026-09-08 00:30 UTC` matched `22ca01a` (`00:30:24Z`) and is `17:17 UTC` at the
head — a fact about the cycle's freshness (finding 5). `+5 more today` is internally consistent
with the nine invented Wednesday fixtures (four in the cards) and is not a repo claim. The 1d/1e
callout "synced 3h ago" does not agree with the header's own stamp on a "today" of Wed 9 Sep
11:00 EDT (14.5 h) — a low internal inconsistency (finding 15).

**D2 — the numbers the canvas computes.** Read from the rendered 1f: ΔE 12.4 / 36.7 / 48.2 and
3.79 / 3.48 / 4.63 for `#8B6FE8`; 9.8 / 19.2 / 37.6 and 3.83 / 3.51 / 4.58 for `#5C7CE6`.
Recomputed cold in Node: 12.45 / 36.71 / 48.23, 3.793 / 3.477 / 4.631, 9.85 / 19.15 / 37.59,
3.83 / 3.51 / 4.58 — every figure matches to the printed precision. `grade()` is called with
`'AA'` (4.5) for chip text and the two 11 px text lines and the rail verdict uses 3:1 by hand;
each wording matches the level tested. The Tweaks prop was driven with
`window.__dcSetProps(window.__dcRootName(), {uclCandidate: '#2F4B7C'})` and the second swatch
re-rendered as `#2F4B7C · MEASURED`, ΔE 38.0 / 30.6 / **0.0**, contrast 8.68 / 7.96 / 2.02, verdict
"passes on cream only" — all matching a cold computation, so the sheet is live, not cached. The
two sRGB thresholds (S4) cannot disagree on 8-bit input: `10/255 = 0.03922` and `11/255 = 0.04314`
bracket the whole gap (0.03928, 0.04045], so no channel value takes a different branch. Killed.
The one figure on the canvas that is *typed* rather than computed — `--media` 1.14:1 — is wrong
(finding 9).

**D3 — the honesty amendment as a rule.** Worked inputs, with F4's resolver (Brooklyn date →
`md | null`) as the machine: *inside a window, real round differs* — reachable when a tie is
rescheduled **into** another matchday's window; the absence state does not fire and the line
reads "MATCHDAY 2 · COMPUTED" with nothing in the system to say MD1 (finding 11). *Two overlapping
windows* — UEFA's do not overlap, but the hand list can; the resolver takes the first match
silently; no validation is specified. *Outside every window* — the designed absence state, and the
1c artboard illustrates only this, the easy case. *A stale list because UEFA moved a matchday* —
nothing synced carries a matchday, so nothing contradicts it; the honest answer to the prompt's
question is "nothing today". Two derivable checks exist and neither is in the design: a test that
the list is eight disjoint, ordered windows for the synced season, and a sync-time count of UCL
fixtures falling outside every window, where a third of a matchday outside is evidence of
staleness rather than of six reschedulings.

**D4 — rule 1 versus typed content.** The precedent (`tv`, `tieBreak`, `zones`, `WatchPanel`'s
"Hand-maintained", and `note` at `schema.ts` line 43, which the sync preserves by id) is
reference data rendered as prose or colour. A matchday **number** in Plex Mono beside synced
numerals is a different act, and the precedent stretches to it only because of the provenance
treatment: the amber mono "COMPUTED — UEFA WINDOW …" line is doing real work, not labelling — take
it away and rule 3 is broken. Item (c) is load-bearing: `src/data/` is the folder HONESTY.md rule 1
defines as "written only by `npm run sync`", and the canvas's own 1g footer already says Moments
"live in `src/data/moments.json`" while 1h lists (c) as undecided (finding 10). Not resolved here.

**D5 — `matchdayProgress`.** `(36 − 1) × 2 = 70`; the line today would read "As of matchday 1 of
70". F2 fixes it. Pushed past: after MD8 the league-phase table freezes at 36 rows × 8 played
(ESPN's knockout rounds have no standings child), so "matchday 8 of 8 · league phase" stays true;
`rows.length` is still 36 and `LEAGUE_TABLES.ucl.teams: 36` is the cross-check. The confident
lie is elsewhere: mid-matchday, `max(played)` is N while twenty-four clubs sit on N−1, so the
existing callout says "24 clubs have a game in hand — sort by PPG" under a legend that says PPG
compares unlike schedules (finding 16). Also: F3's "league phase" is hand-typed where every ESPN
event carries `season.type.slug: 'league-phase'`.

**D6 — the 16-row band and the sticky divider.** `TablePage.tsx` wraps each divider-plus-row
pair in `<div key={r.teamId}>` (lines 273–274), so a sticky divider's containing block is an 82 px
box. Applied the canvas's exact recipe to the live Champions League divider at 390: nested, it
scrolled to **−118 px**; hoisted to a sibling of the wrappers it stuck at **28 px** under the
28 px sticky header — and kept sticking past the band's last row, over the Europa League divider
(16 px). Buildable only with per-band grouping or every divider sticky and opaque (it is
transparent today); either is a markup change (finding 2). Desktop: the column header is
`position: static`, rows are 46 px, so a 16-row band is **736 px** — taller than most viewports
at 1000 wide (this one was 900). The measurement points toward (g) firing on desktop too, but
there is no sticky header for it to sit under; the ruling stays open.

**D7 — hard rule 6.** Premier League table on the head at 390 and 1000, light and dark, four
cells, `scrollWidth === innerWidth` on each. Computed styles against the 1e board: rail 3 px
`rgb(139,111,232)` (both), divider 9 px / 1.08 px letter-spacing / `#55614f` (both), Pts 19 px
Oswald (both), mobile sticky header 28 px (both), body `#f7f5ee` (both). One difference: row
height **54 px in the app, 55 px on the canvas** — inline `min-height:54px` without `border-box`
adds the hairline; a transcription artefact, but "pixel-identical" is false by 20 px over the
table (finding 14). Sixth chip: injected "⭐ Champions League" (145 px) — 390 and 375 stay at two
rows (63 px), **360 goes to three (97 px)**; and `TABLE_LEAGUES` follows `COMPETITION_KEYS`, in
which `ucl` precedes `laliga`, so the code would render the ⭐ chip **first**, not sixth as drawn
(finding 4). `parseLeague` accepts any `TABLE_LEAGUES` key, so `?league=ucl` needs no codec change.

**D8 — the colour ruling.** ΔE and contrast verified (D2). The 11 px meta line: `#8B6FE8` on
cream 3.48, white 3.79, night bg 4.63, and **4.01 on dark `--surface`**, which is what Broadcast's
`[data-hot]` rows paint — the canvas's "passes on night" measured the page, not the hot row
(finding 8). Pre-existing on screen: every domestic hue fails on cream at 11 px today (pl 3.45,
laliga 3.55, seriea 3.10, ligue1 3.30, bundesliga 3.41) and white chip text fails on every on-chip
(3.39–3.87). **Decision: not a blocker.** The skill's high bar is an AA failure on a *new
surface*; violet at 3.48 is a sixth instance of a failure the surface already carries, and the fix
is the token-mirror patch's, which must list grounds by component before it trusts a two-ground
sheet.

**D9 — Moments at 360 and empty.** `--media` on `--surface-alt`: **1.10:1**, not 1.14 (finding 9);
the argument that a non-text placeholder ground adjacent to a hairline needs no ratio holds under
WCAG 1.4.11. Tab row, measured by injecting a third tab on the head: tabs 194 + gap 16 + switcher
202 = **412 px** against 350 at 390, 335 at 375, 320 at 360 — the switcher stacks above at all
three and the nav grows from 38 to 65 px. The canvas's 1g artboards at 390 render exactly that
(nav 65 px, four boards read); its caption "stacks above under ~375" restates the *two*-tab
threshold (two tabs fit 375 with 1 px of slack, stack at 360) (finding 3). The empty state as the
primary state is right, and the design says so in its own words; `TabNav.tsx` line 15 reserves the
slot for "Results", which the build will reword.

**D10 — the provider.** The headline above. The brief's "the row model needs no new field"
survives for ESPN: same id space, same standings shape; `source.provider: z.literal('espn')` at
`schema.ts` lines 46, 57 and 94 need not widen for this cycle. It survives a *non*-ESPN provider
only with an identity map, exactly as `schema.ts` lines 122–123 already say — a build finding, and
now a hypothetical one. Item (a) narrows to a question the canvas did not ask: what ESPN does not
carry (a matchday), not which provider carries the competition. Left for Round 3.

## Findings

Severity per `pr-comment.md`. "Against" says whether the defect is in the **design** or in the
**repo** the design describes. "Round 2 overturns by" is the handoff.

| # | Sev | Class | Against | Finding | How verified | Fix | Round 2 overturns by |
|---|---|---|---|---|---|---|---|
| 1 | high | D10 | design | The blocking finding F1 is false from this network: ESPN serves `uefa.champions` scoreboard (18 MD1 events, 8–10 Sep) and 36-entry League Phase standings in the shapes the providers already parse; a second provider is not a prerequisite. | `curl` receipts 23:10 EDT; payloads hashed; `normalizeStandingEntry` stat names matched | none (design artifact); ideas row 30 | Reproducing a 404 or an empty `leagues` array from a second network with the exact URL Beni used |
| 2 | medium, load-bearing | D6 | repo, as the design assumes it | A sticky `ZoneDivider` is unreachable on the current mobile markup — the per-row wrapper confines it to 82 px (−118 px nested vs 28 px hoisted at 390); hoisted, it overruns the band. Needs per-band grouping or all-sticky-and-opaque dividers. | JS applied the canvas recipe to the live DOM at 390, three scroll positions | none (src/); ideas row 32 | A CSS-only recipe that sticks under the header for the band's height on the unchanged DOM |
| 3 | medium | D9 | design | Three tabs stack the switcher above the row at 390, 375 and 360 (412 > 350/335/320), nav 38 → 65 px on every mobile screen; the caption says "under ~375". | Third tab injected on the head at three widths; canvas 1g nav read at 65 px | none; ideas row 33 | Real Oswald label widths that fit 350 px, or a caption change accepted by the designer |
| 4 | medium | D7 | design | A sixth chip costs a third picker row at 360 (63 → 97 px), and `TABLE_LEAGUES` order puts ⭐ first, not sixth as drawn. | Chip injected at 390/375/360; `COMPETITION_KEYS` order read | none; ideas row 34 | A reorder the build will make, or a 360 artboard showing the third row is intended |
| 5 | low | D1 | design (freshness) | Header stamp `synced 2026-09-08 00:30 UTC` is `17:17 UTC` at the head; 1007 and the day counts hold. | `meta.json` at `22ca01a` vs `0c37716` | recorded in the spec archive | n/a — a fact about the sync cadence |
| 6 | medium | D4 / S1 | repo | `competitions.ts` lines 4–5 say espnCode-less competitions "carry hand-authored placeholder rows"; there are zero rows for the five. | `fixtures.json` counted by competition at the head | none (src/); ideas row 31 | Showing rows for any of the five keys in any committed snapshot |
| 7 | medium | D5 / S3 | repo | `matchdayProgress` would print "1 of 70" for 36 rows; F2 is the right fix; the sentence stays true after MD8 (table freezes at 36 × 8). | Arithmetic; ESPN standings structure (one League Phase child) | none (src/); the canvas's F2 | Showing ESPN's UCL standings entries change `gamesPlayed` past 8 or lose rows in knockouts |
| 8 | medium | D8 | design | Violet meta line is 4.01:1 on dark `--surface`, the ground Broadcast's hot rows paint; the sheet measured only cream (3.48) and night bg (4.63). Pre-existing class on screen for all five domestic hues (3.10–3.55 on cream). Not a blocker. | Cold contrast over seven grounds; `index.css` line 184 | none; ideas row 35 | A hot-row ground other than `--surface` in Broadcast dark |
| 9 | low | D9 / D2 | design | `--media` vs `--surface-alt` in light is 1.10:1, not 1.14:1; the figure is typed, not computed. | Cold computation; `renderVals()` has no media figure | none; ideas row 37 | Arithmetic |
| 10 | low, load-bearing | D4 | design | 1g's footer places Moments in `src/data/moments.json` while 1h leaves item (c) undecided; `src/data/` is rule 1's folder. | Canvas text | none; ideas row 38 | The designer striking one of the two sentences |
| 11 | medium, load-bearing | D3 / S7 | design | The amended rule 3 admits a confident lie: a tie rescheduled into another matchday's window derives the wrong number and the absence state does not fire; nothing synced contradicts a stale window list. | Inputs worked against F4's resolver; ESPN payload has no per-event matchday | none; ideas row 36 | A synced field, or a designed check, that can contradict the list |
| 12 | low | D10 / S2 | repo | `provider: z.literal('espn')` appears three times in `schema.ts`; the join is ESPN-id-bound. Moot for this cycle (same provider, same ids); survives only for a hypothetical non-ESPN source. | Schema read; 21/36 id overlap measured | none | n/a — reclassified from S2's premise |
| 13 | low | Beni's items / S8 | repo | Three stale skill handles (`CLAUDE.md` 5, 156; `SKILL.md` 38). | grep at the head | `8ed3b0d` | n/a |
| 14 | low | D7 | design | 1e's rows are 55 px to the app's 54 (no `border-box`); "pixel-identical" is off by one hairline per row. | Computed styles both sides | none | n/a |
| 15 | low | D1 | design | "synced 3h ago" on 1d/1e cannot follow from the header's `00:30 UTC` on a Wed 11:00 EDT today. | Arithmetic | none | n/a |
| 16 | low | D5 | design | Mid-matchday the games-in-hand callout ("sort by PPG") argues against the UCL legend's PPG caveat in the same box. | `clubsInHand` read; 36-club arithmetic | none; ideas row 41 | A callout rule for competitions with `phase` set |
| 17 | low | Beni's items | repo | Ideas row 17: `CONTRIBUTING.md` and `CLAUDE.md` described an all-Claude build; README and `git log` (three Codex trailers) did not. | grep; `git log` authorship | `8ed3b0d` | n/a |

### Killed as unreproducible

- **S4 — the two sRGB thresholds move a verdict.** No 8-bit channel value falls in
  (0.03928, 0.04045]; `lum()` and `lab()` agree on every hex input. Verified by recomputing every
  1f figure under both thresholds (identical to three decimals).
- **S2 as stated — "a second provider breaks Form and Next".** The provider the design was
  waiting for is the one it has; the ids are the same namespace (21 of 36 clubs already in
  `standings.json` under the same id). The underlying observation about `z.literal('espn')`
  stands as low finding 12.
- **"Switcher stacks above under ~375" as a wrong artboard.** The canvas's 390 px artboards do
  render the stacked nav; only the caption's threshold is wrong (finding 3 is about the caption
  and the consequence, not the drawing).
- **The design's repo facts.** 1007 fixtures, 14 competitions, 4 / 25 / 14, twenty PL rows: all
  held at the head. A no-finding result on a recount is still a result.

### Precedence resolutions

- Canvas F1 ("no provider") against the repo's own provider module run live — **repo ground
  truth beats any description of it** (`CLAUDE.md`): finding 1.
- Canvas caption (1g, "under ~375") against the canvas's rendered artboards (nav 65 px at 390) —
  the rendered board is the design; the caption is corrected (finding 3).
- Canvas 1g body text (`src/data/moments.json`) against canvas 1h item (c) — same source, two
  answers; neither adopted, both surfaced (finding 10).
- Canvas `--media` 1.14:1 against computation — computation (finding 9).
- The Round 1 prompt's `/football-soccer-deity` against this session's skill listing, which shows
  the plugin-qualified `anthropic-skills:football-soccer-deity` — the prompt's handle is what
  Beni types and was applied; the qualified form is noted here.

### Human-review resolutions

- **Three stale handles** — corrected in `8ed3b0d`; `docs/` archives keep the handle they were
  written with, by design (they are dated records).
- **Ideas row 17** — closed in the same commit, because it was cheap for a reason: both edits
  point at `README.md`'s "Two builders, one repo" table (Beni's own account, PR #24) as the owning
  copy instead of restating the routing, so the three governing docs agree by reference and the
  next routing change is one edit, not three. The alternative — its own row — would have left them
  disagreeing for another cycle over two paragraphs. Struck in `docs/v0.2.6-ideas.md` in `67bdc69`.

### Deliberately not done

- Nothing under `src/` — the false comment (6), `matchdayProgress` (7), the `TabNav` "Results"
  comment, the divider markup (2), `espnCode: 'uefa.champions'` (1). Each is a build item on
  Round 3's spec, stated here.
- No resolution of not-decided items (a)–(g) or the three VERIFY items; no version, CHANGELOG
  section or tag; no token repaint (finding 8 is flagged to the design system); no Round 2 prompt;
  no build spec.
- The brief's text — not on the machine; the archive says so and is written to be replaced.
- A pixel capture of the canvas — the pane would not composite the hidden tab; computed styles
  were compared instead (D7).
- The bot's `sync/scheduled` PR — untouched; `npm run sync` not run in any form.

### Matrix as run

- **Environment:** 5173 unserved; app on 5174 from this worktree (stamp proves the head); canvas
  on 8791; own tabs; theme storage cleared.
- **Unit:** typecheck clean; 343 tests / 27 files.
- **Browser, app:** Table tab, Premier League, at **390 light, 390 dark, 1000 dark, 1000 light**;
  `scrollWidth === innerWidth` asserted on each; theme confirmed by `data-theme` and by body
  background (`#f7f5ee` / `#0e1c15`) per cell. Probes at **375** and **360** (light, Table) for
  the injected sixth chip and third tab, `scrollWidth` asserted. Sticky recipe applied and
  measured at 390 at three scroll positions, DOM restored and confirmed static afterwards.
- **Browser, canvas:** 1f figures read after render and after a Tweaks change; 1e computed styles
  read on the 390 light board; 1g nav geometry read on four boards (three at 390, one at 360).
- **Not the 48-cell matrix:** the diff touches no `src/` or `index.css`, and the browser work
  here is probe-shaped by the prompt's D6, D7 and D9. Four captures taken in-session (PL table,
  both widths, both themes); none committed.
- **Not verified:** the canvas as pixels; the brief's text; `uefa.europa` / `uefa.europa.conf`
  standings shape (only their scoreboards were probed); ESPN's behaviour from any network but this
  one; UEFA's official window dates behind the canvas's "8–10 Sep" and "13–14 Oct" (ESPN's MD1
  events do fall on 8–10 Sep).

## Not-decided items: load-bearing for the build, or riding to Round 3

- **(a) provider and round string — load-bearing, and the evidence changed.** With ESPN carrying
  the competition and no round string, (a) becomes "does the build use ESPN's `uefa.champions`,
  and is the derived window the only matchday source?" Round 2 re-runs the check; Round 3 rules.
- **(c) where Moments live — load-bearing.** Rule 1 names the folder; the canvas says two things.
- **(g) desktop divider — load-bearing only through finding 2**: the markup shape chosen for the
  mobile sticky decides whether desktop can have one at all, and the desktop header is static.
- **(b) tie-break sentence — rides**, provided it is sourced before merge; it renders in the
  legend only.
- **(d) history push, (e) aspect ratio — ride.** Small, local, reversible.
- **(f) numbering — Beni's**, at Round 3.
- **VERIFY:** tie-break order — open. Saturday's league count — 5 at this head (a repo fact; close
  it at the build's head). Whether UEFA's windows shift for a rescheduled tie — open, and finding 11
  shows the harder case is a tie moved *into* another window.

## What remains unresolved, ranked — the input to Round 2

Written for a session with none of this context.

1. **The provider premise.** Re-run `curl -s "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard?dates=20260909"`
   and `…/apis/v2/sports/soccer/uefa.champions/standings?season=2026` from your own network. If
   they answer as above, F1 and item (a) are rewritten and the build path is
   `espnCode: 'uefa.champions'` plus `LEAGUE_TABLES.ucl` (`teams: 36`, three or four zones). If
   they do not, say what you got and from where; two networks disagreeing is itself the finding.
2. **The sticky divider's markup.** Propose the DOM shape (per-band wrapper, or flat with every
   divider sticky and opaque) and prove it on a synthetic 16-row band at 360, 375 and 390 under
   the 28 px header. Say what desktop does given its static header.
3. **What contradicts a stale window list.** Answer finding 11's two cases (rescheduled *into*
   another window; a list UEFA has moved) with a mechanism or an accepted cost written into the
   amended rule 3.
4. **The three-tab stack.** Accept the 27 px push at every phone width, or propose the label or
   switcher change that avoids it, with real widths.
5. **Item (c) and 1g's footer.** One sentence, not two.
6. **Meta-line grounds.** List every ground `FixtureRow`'s meta line renders on, by lens and
   theme, and mark the AA result for all fourteen hues; the token-mirror patch starts from that
   table.
7. **Picker order and the 360 third row.** Confirm the reorder the build must make and whether
   three rows at 360 is acceptable.
8. **Provider-published semantics.** Decide whether F3's phase label and the zone bands may be
   checked against or derived from `season.type.slug` and `note.description` — a rule-1-adjacent
   decision, and one that also halves the 16-row band.
9. **Could not re-run:** the brief's text (paste it and the archive replaces its summary); the
   canvas as pixels; UEFA's official window dates; UEL/UECL standings shape.

## Retro — the skill as the method, and what a design review needed that it lacks

**Right, and reused as written:** §0's pre-flight caught the tree one sync ahead of the prompt's
SHA; §2's real numbers; the one-comment shape; viewport before capture and `scrollWidth` on every
cell; the sealed-appendix discipline — ten suspicions, eight reproduced, one killed by arithmetic
(S4), one whose premise was inverted by evidence (S2's second provider).

**What reviewing a design artifact needed that `/kickoff-pr-review` does not provide — the raw
material for `/kickoff-design-review` (ideas row 40):**

- **A hunt-class home.** §3 is code-shaped; the ten D-classes in the Round 1 prompt had none.
  A design review's classes are: facts the artboards assert, numbers the canvas computes, rules
  amended as rules, typed content against rule 1, arithmetic the design changes, mechanisms a
  designer cannot check on the DOM, a hard rule as a falsifiable claim, colour debts by ground,
  the narrow and empty states, and the provider the design waits for.
- **"Read the diff" had no object.** The artifact was a local-only canvas plus a brief not on the
  machine. The skill needs an artifact step: hash it, serve it, read what it *computes* (the
  numbers were not in the file), drive its Tweaks prop, and transcribe its decisions into
  `docs/` because the folder can never be committed.
- **The dynamic pass has the wrong trigger.** §4 runs a smoke pass when no `src/` changed; here
  nothing changed and the browser was where four findings lived. The rule for a design review is
  "probe the real DOM for every mechanism the design assumes": inject the sixth chip and the third
  tab, apply the sticky recipe, measure at the four widths.
- **Fix policy has no analogue.** "Fix what you can reproduce" cannot apply to an artifact outside
  the repo. A design finding's deliverable is the handoff column — what Round 2 must produce to
  overturn it — and the skill should say so, and say that a docs correction is the only commit a
  design review makes.
- **Routed evidence needs a first-paragraph rule.** The single most consequential step of this
  review was one `curl`. A design review must re-run whatever the design *leads* with, and a
  harness without network must say so before it says anything else.
- **The PR shape was right for the wrong reason.** The branch, PR and comment carry the review,
  not a change; §7 still applies because the paper trail is docs. A design-review skill should
  make that explicit so the reviewer does not look for a merge gate that does not exist.

The retro's method notes are folded into `docs/v0.2.6-ideas.md`'s process notes (this PR is not
tooling; the skill's one edit here is a handle).

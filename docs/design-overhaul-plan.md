# Kickoff design overhaul — the build plan for Fergie Time's second edition on Fixtures and Table, by Claude Code (archived Sat 14 Nov 2026, TZ=America/New_York)

Written by the planning seat (Claude Code, Fable 5.2 Extra High) on Sat 14 Nov 2026 from the brief [design-overhaul-plan-prompt.md](design-overhaul-plan-prompt.md), against main `9b0417e`. It is a plan, not a build brief. The PM seat scored it in [design-overhaul-plan-review.md](design-overhaul-plan-review.md), which also records Beni's revamp-first ruling, the PM seat's adjustments and, once given, Beni's answers to its questions. The plan's working notes (`evidence/` below) stay outside the repo. The vendor and browser rows it cites in brackets, such as [A16], are archived without their quotes in [design-overhaul-plan-sources.md](design-overhaul-plan-sources.md). Paths under `~/.pencil/` and `~/Documents/Claude/Projects/` are Beni's local design files and notes, which are not in this repo. The plan below is unedited; the PM seat's corrections to it are in the review.

---

# Kickoff design overhaul — the build plan for Fergie Time's second edition on Fixtures and Table

Written Sat 14 Nov 2026, from about 8:45 PM EST, by the planning seat (Claude Code, Fable 5.2) in a detached worktree of `origin/main` at `9b0417e`. This is a plan. Nothing was built, committed, pushed, generated or deployed, and no account was touched.

**How to read the citations.** `path:line` is the repo at `9b0417e`. "Handoff §N" is `21-second-edition-handoff.md`. "Board NN" is the Pen export of that number in `~/.pencil/documents/kickoff-revamp-b2/exports/handoff/`. A vendor or browser claim carries its URL, the date read and DOCUMENTED or UNVERIFIED. The notes behind this plan are in `evidence/` beside it.

**What was read, and what was not.** The handoff, the rules note, the fal picks and `docs/design-overhaul-proposal.md` were read whole. Boards 01, 03, 06, 07, 10, 13, 15, 17, 18 and 19 were looked at whole; 09 as an overview; the tops of 05, 12 and 16. Boards 02, 04, 08, 11 and 14 were not opened. The `.pen` file was not opened. **The Claude Design canvas was not read**: it is fenced, and this seat has only the handoff's account of it. The review, the design prompt and the fix prompt were read in their decision and scope sections, not line by line.

## Seven things to know before the map

1. **The tokens are in `src/shell.css`, not `src/index.css`.** `src/index.css:10` imports it. The light palette is `src/shell.css:13-36`, the dark one `:42-59`, the Tailwind mapping and the three font stacks `:61-85`. `src/index.css:12-175` is Moments' own CSS. "`src/index.css` is the token source of truth" holds only as "index.css and what it imports". The Next app takes the same file through `web/app/globals.css:20`.
2. **The exports are Pen boards, and they predate the fix pass.** The PNGs are dated 13 Nov 21:44 and the handoff 23:55. Boards 03, 06, 07, 10, 16, 18 and 19 still print "20:30 CET", board 10 still has a Plex Mono wordmark and a handwritten line, and board 18 still draws LIVE in pitch and scores in ink. Handoff §1 and §10 correct all of these, so the handoff wins on each.
3. **The live Ledger already lists the whole week.** `src/components/LedgerWeek.tsx:17` maps all seven days and `:64-66` renders every shown fixture. So does today's Poster (`src/components/PosterWeek.tsx:71-73`, `:92-94`). D10 keeps the Ledger as it is. What changes is Poster, which stops listing the week, and that is why Step 0 has to move at the same moment.
4. **The Next app scans a fixed list of files for class names.** `web/app/globals.css:1-19` turns automatic scanning off and names seventeen `src/` files; `web/scripts/check-css.mjs:23-30` asserts that exact list. A new component file that is not added to both renders unstyled in the Next app.
5. **Four honesty rules have no test today.** The row order (`sortForDisplay`, `src/lib/fixtures.ts:36-43`) is imported by no test. The Table's unset-kickoff cell (`src/components/TablePage.tsx:359-366`, `:461-463`) has none. CANCELLED has no render test. The word "local" on a fixture row has none. Section 6 pins them before anything is repainted.
6. **The boards draw things the handoff's component list does not name:** the page after a book is opened, "cycles" that group shared kickoffs, time-of-day rules, and titles that spell the day's match count. Section 1.7 lists them. They need a ruling or a look at the canvas before the Poster PR is briefed.
7. **Step 0's owning copy names `http://localhost:5173/`,** the local checkout, in the default lens (`~/Documents/Claude/Projects/Sportsbooks/CLAUDE.md:385-387`; a second copy is in `AGENTS.md:390` there). The brief calls it "the live site". Both read the same code once `main` is pulled, so the plan treats a merge to `main` as the moment Step 0 is affected.

---

## 1. The map

Legend: **Reskin** keeps the component and its behaviour and changes its look. **Rebuild** keeps the data and replaces the markup. **New** has no counterpart. **Retire** is deleted with its tests listed.

### 1.1 Page chrome (handoff §5 "Page chrome")

| Second edition | Today | Kind | What changes |
|---|---|---|---|
| Imprint band, three rows, 118 px at 390 | `AppHeader.tsx:12-26`, `TabNav.tsx:38-61`, `LensSwitcher.tsx:46-73`, composed in `App.tsx:57-65`, `offline.tsx:37-45`, `web/app/shell.tsx:63-75` | Rebuild | One band: a 44 px control row, a 44 px tab row, the provenance line. Black stock on Poster, Table, the quiet week and Moments; typescript stock on the Ledger. The `flex-wrap-reverse` row (`TabNav.tsx:41`) goes, which ends ideas row 125's wrap at 360 by structure (R5, `docs/design-overhaul-proposal.md:540-541`). |
| Wordmark, 22 px | `AppHeader.tsx:14`, Oswald 700 at 34 px | Reskin | Face is question 3, open. |
| Strap "Brooklyn · ET", 10 px | `AppHeader.tsx:15`, 13 px in pitch | Reskin | `tests/appHeaderShared.test.ts:12` pins the string to this one file. |
| Provenance line | `AppHeader.tsx:16-18`: `v{version} · {META.total} fixtures · synced {SYNC_STAMP}` | Reskin | Amber, 10 px mono, with the sync glyph; one unit "SYNCED 2026-11-11 07:48 UTC"; wraps at a middot at 360; repeats in every foot. `SYNC_STAMP` stays `src/lib/fixtures.ts:134`. |
| Motion control | none | New | D7. Section 5. |
| Theme toggle, 26 px glyph | `AppHeader.tsx:20-25`, a text button; label from `App.tsx:60`; the Next shell passes two CSS-switched spans (`web/app/shell.tsx:66-71`) | Rebuild | A glyph has no visible words, so it needs an accessible name that is right in the Next server render, where the theme is not known. |
| Lens switch, 2 × 57 × 23 | `LensSwitcher.tsx:46-73`, a radiogroup with arrow keys | Reskin | Moves to the control row. Keeps its roles and `LENSES` order (`src/lib/lens.ts:6`). Already shown on every tab (`App.tsx:63-65`). |
| +5 badge, 26 × 33 | none in the repo (`public/` holds favicons only) | New | Not a control. An inline drawing. |
| Tabs | `TabNav.tsx:6-10`, `:44-58`; underline `inset 0 -2.5px 0` at `:52` | Reskin | 44 px tall hit area; the underline is already the handoff's. |
| Page measure | one wrapper, `max-w-[780px] px-5`, in three files: `App.tsx:56`, `offline.tsx:36`, `web/app/shell.tsx:62` | Rebuild | 16 px gutter; 640 px for Poster and Ledger at 1000, 780 px for the Table; the band and the Rack span the page (board 15, W8). |
| Feet | `FixturesPage.tsx:102-116`; `TablePage.tsx:486-492` | Rebuild | New wording, section 10. The Table's foot goes to black stock (board 07). |
| StalenessBanner | `StalenessBanner.tsx:10-27`, mounted at `App.tsx:82` | Reskin | 1.5 px frame, 4 px left rule; amber from 24 h, alarm from 72 h; the copy at `:22-25` is already the handoff's, word for word. The 72 h tint `bg-accent/10` (`:19`) becomes a flat plane; `tests/contrast.ts:41-46` reads that class by regex and must be moved to the new pair in the same PR. |
| Error state | `ViewBoundary.tsx:17-24` ("This view couldn’t load.") | Reskin | Not drawn. Follows from the tokens. |

### 1.2 The books (handoff §5 "The books") — all new

| Second edition | What it replaces | Notes for the builder |
|---|---|---|
| Cover face | Poster's hero, `TonightSlate.tsx:30-84` | Layers: photograph, rift and fog, scrim, title block as live text, imprint foot, caption. The date line replaces `slateSubLine` (`src/lib/lensSelectors.ts:82-93`) and `posterSubLine` (`:97-109`). |
| The cover's lower band (D13) | The slate rows, `TonightSlate.tsx:69-80` | Up to three fixtures in kickoff order; the first shared kickoff ends the list. Must skip unset and unsettled kickoffs the way `kickoffBounds` does (`lensSelectors.ts:58-70`); the handoff does not say so. |
| The Rack | nothing | Holds the anchored week's matchday books, then The Register. "Next matchday" comes from `nextMatchdaySelection` (`lensSelectors.ts:151-164`) or `nextMatchday` (`src/lib/fixtures.ts:81`). |
| Spine and shelf | nothing | Each spine is a control, 176 px tall. |
| Part opener | Poster's day headers, `PosterWeek.tsx:47-69` (big) and `:79-90` (small) | A 156 px plate, then the day's date line. |
| Contents rows under a part | `PosterWeek.tsx:70-74`, `:91-95` | See 1.3. |
| NEXT pill | the kept data marker: `hotFixtureIds` (`lensSelectors.ts:189-200`), `data-hot` (`FixtureRow.tsx:41`), `WeekView.tsx:31-34` | This is the consumer ideas row 128 was waiting for. |

Retires with the books: `planPosterWeek` and its `big`/`small`/`gap` blocks (`lensSelectors.ts:208-234`); the competition rail on headers and the hero (`PosterWeek.tsx:51-52`, `TonightSlate.tsx:56-57`), and with it `dominantCompetition` (`lensSelectors.ts:38-50`) unless a new consumer appears; `TodayPill` (`PosterWeek.tsx:9-15`). Their tests are listed in section 6.

### 1.3 Rows and states (handoff §5 "Rows and states")

| Second edition | Today | Kind | What changes |
|---|---|---|---|
| Contents row (Poster) and Ledger row | one component, `FixtureRow.tsx:29-139`, with `poster:` variants (`:60`, `:93`) | Rebuild | Two layouts over one set of facts. |
| Rows are not controls | the row is a button with `aria-expanded` (`FixtureRow.tsx:52-57`, state at `:37`) | Retire | Expansion goes. `web/scripts/clearing.mjs:71-73` finds the first row by `button[aria-expanded]` and must change with it. |
| Brooklyn clock in pitch | `FixtureRow.tsx:60-62`, ink | Reskin | Never wraps, shrinks or moves (W3). |
| Stadium clock on every row, "20:30 local" | only inside the expansion, `FixtureRow.tsx:117-118`, and 12-hour: `zonedParts` sets `hour12: true` (`src/lib/time.ts:44`) | Rebuild | Needs a 24-hour field on `ZonedParts`, formatted from the same `instant` in `fixtureTimes` (`time.ts:89-97`). No second parse. |
| "local time not known", amber | `FixtureRow.tsx:117-118` | Reskin | Same words; caps on the Ledger's meta line. |
| Day note "(Thu, prev. day)" | `FixtureRow.tsx:122-126`, inside the Brooklyn pill | Reskin | Same words; moves beside the Brooklyn clock as one no-break unit. Muted ink, never amber. |
| Brooklyn pill with the statue emoji and EDT/EST | `FixtureRow.tsx:120-121` | Retire | Rows print the bare time; the cover band prints "ET". `brooklynAbbrev` (`time.ts:75`) loses this consumer. |
| Time not set | dash at `FixtureRow.tsx:61`; the amber line at `:100-104` | Reskin | Same words. The count line "· 10 kickoffs, times not yet set by the league" (board 18, A) replaces "N TBC" (`lensSelectors.ts:85`, `:105`). |
| Competition dot, 8 px | flag emoji, `FixtureRow.tsx:95`; `flag` on every competition, `src/lib/competitions.ts:7-20` | Rebuild | No emoji is set (handoff §4 "Glyphs"). |
| Left rail | `FixtureRow.tsx:44-50` | Retire | A hue is a dot or a zone band, never a tint (handoff §2, `comp-*`). |
| "vs" | `FixtureRow.tsx:65` | Reskin | The boards print "v". |
| Score | `FixtureRow.tsx:68-73`, pitch, with the shootout in brackets | Reskin | En dash already. A live score goes to ink (handoff §5 StatusPill table). |
| StatusPill | `STATUS_LABEL`, `FixtureRow.tsx:6-16`; classes at `:74-90` | Reskin | NEXT on pitch; LIVE, POSTPONED, CANCELLED, SUSPENDED, ABANDONED cover-ink on blood (a word in `fb-alarm` on the Ledger); KICKED OFF amber outline; FT ink outline. 10 px, never 9 (`:77`). |
| `fixture.note` | `FixtureRow.tsx:131-133`, inside the expansion; `src/lib/schema.ts:80` | Not drawn | No fixture in the snapshot at `9b0417e` carries one (0 of 1,482, counted). Section 1.7. |

### 1.4 Page controls (handoff §5 "Page controls")

| Second edition | Today | Kind | What changes |
|---|---|---|---|
| Week row, one 44 px row | stepper at `FixturesPage.tsx:86-98` (36 px buttons, `:88`, `:97`), label `:67`, `:90`, "Jump to today" `:91-94`; Filters is a separate `<details>` above it (`FilterBar.tsx:13-21`) | Rebuild | Stepper, Today, Filters in one row. The year shows only outside the current Brooklyn year or across New Year; `niceDate` (`time.ts:124`) always prints one today. |
| "Today" | "Jump to today" | Reskin | **Trap:** main's preview smoke requires a button reading exactly "Jump to today" (`scripts/vercel-smoke.mjs:56`) and runs main's script against every deployment (`.github/workflows/preview-smoke.yml:27-29`). The landmark must move first, on `main`. PR #320 hit the same wall (`docs/design-overhaul-proposal.md:425-429`). |
| Filter label, three forms | `FilterBar.tsx:17-19` ("All 14 competitions shown") | Reskin | "Filters · all 14", "Filters · 14", glyph and count; "3 of 14" when filtered; the accessible name is always full. |
| Filter panel, opened | `FilterBar.tsx:23-63`; chips filled with the competition hue and a flag (`CompetitionChip.tsx:27-29`) | Gap 18 | Never drawn. A filled chip is a tint, which the handoff forbids for `comp-*`, so the tokens alone do not settle it. |
| "Hidden by filters" | `PosterWeek.tsx:37-42`, `LedgerWeek.tsx:31-34`, with a magnifier emoji | Reskin | One muted line under the date line; the day's count is the count shown. |
| The "more" control | none | New | Poster only. A real button with `aria-expanded`, full measure, at least 44 px. |
| UEFA matchday line | `MatchdayLines.tsx:5-13`; text built at `src/lib/matchdays.ts:33-37` | Reskin | The three texts are already the handoff's. Today all three are amber (`MatchdayLines.tsx:10`); the computed form goes to ink and the other two stay amber. `data-matchday-state` (`:9`) is the hook. |
| NEXT UP with both clocks | `NextUpStrip.tsx:56-97`, Brooklyn only, four cards (`:65`) | Reskin | Gains the stadium clock (question 13, ruled). |
| Empty days in the Ledger | one row per empty day, `LedgerWeek.tsx:20-40` | Rebuild | Board 10 merges them: "MON 16 · TUE 17 · WED 18 · THU 19 — NO FIXTURES". |
| End-of-week count | none | New | "END OF WEEK · 45 FIXTURES · FRI 3 · SAT 26 · SUN 16" (board 10). |

### 1.5 The Table (handoff §5 "The Table") — D4: structure untouched

| Second edition | Today | Kind |
|---|---|---|
| Short cover, "The Register" | none | New |
| The cover's line | `TablePage.tsx:192`: "As of matchday N of M", from `matchdayProgress` (`src/lib/standings.ts:156-160`) | Reskin. The number is the live app's own, pinned by `tests/dom/uclTable.test.tsx:40` and `tests/matchdays.test.ts:61`. |
| League tabs, 30 px on two 44 px rows | competition chips, `TablePage.tsx:169-171`, six leagues (`competitions.ts:237`) | Rebuild. `data-table-picker` is read by `web/scripts/clearing.mjs:67`. |
| Zones & key, a 44 px disclosure | `TablePage.tsx:211-250` | Reskin closed; **gap 18** opened. |
| Games-in-hand note and "+1" chip, amber | `TablePage.tsx:190-199`, `InHandChip` `:107-113` | Reskin |
| Row: zone band, position, tile, name, pips, next fixture, GD over GF–GA, points over played | mobile grid `:38`, rows `:262-380` | Reskin |
| The row's tap, opening to W-D-L and PPG | `TablePage.tsx:279-283`, a four-cell grid at `:324-336` | Reskin. Kept (handoff §5 "Controls"). |
| Two-clock next-fixture cell | Brooklyn only when closed; "local" only when open (`:362`) | Rebuild |
| Form pips: W ink, D outline, L blood, 10 px letters in 15 px squares, own line | `FormPips`, `TablePage.tsx:83-105`, 13 px, L in the accent (`:96`) | Reskin |
| Fifteen columns at 1000 | `DESKTOP_COLS`, `TablePage.tsx:39-40`; sort headers `:397-410` | Reskin |
| Scorch at the foot | none | New, static |
| Not drawn, follows from the tokens | rank movement (`:67-71`), GD colours (`:73-80`), the PPG-sorted banner (`:384-386`), "No table in the snapshot…" (`:176-179`), "time TBC" (`:463`), the sticky UCL bands (`tests/dom/uclTable.test.tsx:26`) | Reskin |

### 1.6 Templates (handoff §6)

| Template | Built from | Notes |
|---|---|---|
| Poster | band, Rack, week row, two parts with contents rows and one "more", shelf, foot | `FixturesPage.tsx:73-77` picks the hero by lens; that branch stays. |
| Ledger | typescript band, NEXT UP, week row, every fixture of the week, end-of-week count | Whole week kept from `LedgerWeek.tsx`. |
| Table | short cover, league tabs, Zones & key, rows, scorch, black foot | 1.5 |
| Quiet week | a short cover, the week row, "Coming next" | Today an empty week is the hero's "Next matchday — nothing left today" (`TonightSlate.tsx:60`) and a gap line (`PosterWeek.tsx:36`). Only Poster is drawn (board 13). |
| UEFA week | the Rack with eight markers on their own row | Board 19. |
| States sheet | A to M | A test harness, not a shipped page. There is precedent: `tests/harness/moments.html`. |
| Moments shell | `App.tsx:71-78`; `web/app/shell.tsx:76` | D5: the band and the tokens, nothing else. Section 7. |

### 1.7 What the handoff did not draw, and what each needs

| # | The app shows it today | Where | Needs |
|---|---|---|---|
| 1 | AET and PENS rows, the shootout in brackets | `FixtureRow.tsx:14-15`, `:69-72`; pinned at `tests/dom/fixtureEdges.test.tsx:63`, `:74` | **Tokens.** The FT pill's treatment with its own word; score in pitch. One measured check: "3–3 (2–4)" plus a pill beside the dotted leader at 360. |
| 2 | Suspended and abandoned rows | drawn: States D (real) and I (specimen) | **Nothing new** on rows. On a cover band and in "the book closes" they are not drawn: see 11. |
| 3 | The staleness banner | drawn: States J | **Tokens** for the Table and the Ledger, where no template shows it. |
| 4 | The heroes' empty state (row 126) | `TonightSlate.tsx:43-49`, `NextUpStrip.tsx:69-78`; no test | **Words, not a board.** With the Rack in place the question becomes what the Rack and NEXT UP say when nothing is ahead, and row 126 wants the window's end from `META.window.to`. |
| 5 | "1 MATCHES" (row 129) | `lensSelectors.ts:83`; no test | **Tokens.** `slateSubLine` loses its consumer; the new date line needs a singular ("1 MATCH"), which rule 9 does not give. |
| 6 | The filter panel and Zones & key, opened (gap 18) | `FilterBar.tsx:23-63`; `TablePage.tsx:225-250` | **A board.** |
| 7 | The offline file | `offline.tsx:27-54`, `offline.html`, `vite.config.ts:22-35` | **Tokens,** plus one rule: handoff §7 says it ships "the motion-off, no-photograph state", and no board shows a cover with no photograph. |
| 8 | `fixture.note` | `FixtureRow.tsx:131-133` | **A rule.** Nowhere to show it once rows stop expanding. None exists in the snapshot today. |
| 9 | The page after a book is opened; cycles; time-of-day rules | board 06 and 16 only | **A ruling, or a look at the canvas.** Handoff §5 says the "more" control opens "ordinary contents rows" and that both clocks are on every row; boards 06 and 16 put a shared Brooklyn clock on a "CYCLE OF FIVE" header and leave it off the rows under it. Board 01 calls board 06 the "DESIGN OF RECORD for a heavy day". |
| 10 | Which book the Rack rests on outside the current week; what its counts do under `?only=`; which league The Register's slide shows | handoff §5 is silent; the Table's default league is La Liga (`src/lib/urlCodecs.ts:37-38`) while every board draws the Premier League | **A rule.** Recommended: rest on the first book that is not closed, else the last; counts follow the filters, as States F does; the slide shows the URL's league. |
| 11 | "The book closes" on a day with a postponed, suspended, abandoned, AET or PENS match | rule 9 says "every match of the day is full time" | **A rule and its words.** "24 MATCHES · FULL TIME" is false if one was abandoned. |
| 12 | A corrected result (amber use 6) | no UI and no field: the fixture schema has no correction flag (`src/lib/schema.ts:53-80`); only the sync diff knows (`tests/diff.test.ts:40`) | **Deliberately not built.** It needs a stored field, which is a change to the snapshot. The handoff says so: "the app has none yet". |
| 13 | A KICKED OFF row | States E draws a *scheduled* fixture past its kickoff, with no score | **A ruling.** Today a row says KICKED OFF only for a frozen `in_play` (`FixtureRow.tsx:33-34`) and keeps its score (pinned at `tests/dom/designCycle.test.tsx:47`, score at `:66`). The Table already has the scheduled case (`hasKickedOff`, `lensSelectors.ts:132-134`). |
| 14 | NEXT UP with an unset kickoff; its "+N more today" line | `NextUpStrip.tsx:38-39`, `:88-95`; "TBC" pinned at `tests/dom/designCycle.test.tsx:129` | **Tokens.** Keep "TBC" in amber italic. |
| 15 | The Ledger in a quiet week | board 13 is Poster only | **Tokens.** |
| 16 | The focus ring | `src/shell.css:101-104`, measured at `tests/contrast.ts:73` | Handoff §5 says "the browser's ring". Keep the measured ring; a default ring cannot be measured across browsers. |
| 17 | 375 px | no template is drawn at 375 | **Tokens,** measured in the matrix. |

---

## 2. How it reaches the public site

**The facts each route has to live with.**

- Pages deploys on every push to `main` and on a manual dispatch, and on nothing else (`.github/workflows/pages.yml:19-22`).
- `verify` runs on a pull request into any branch, not only `main` (`.github/workflows/ci.yml:3-6`).
- The sync merges to `main` on its own. In the seven days before this plan `origin/main` took 4 sync commits and 11 others (`git log --since="7 days ago"`, counted). The sync writes `src/data/fixtures.json`, `meta.json`, `standings.json` and `docs/sync-digest.md`, none of which the overhaul edits.
- Vercel builds a preview for a branch push when the web build's inputs changed (`web/scripts/vercel-ignore.mjs:12-17`), and main's smoke script then runs against that deployment (`.github/workflows/preview-smoke.yml:27-29`).
- Step 0 reads the app in its default lens, which is Poster (`src/lib/lens.ts:10`). `&lens=ledger` is already a valid address on v0.5.5 (`src/lib/lens.ts:13-15`), so moving Step 0 never breaks against an old build.
- The cutover's parity proof compares the Next app with "a fresh Vite reference at its merge-base" (`docs/nextjs-migration-plan.md:304`), and the plan allows no new animation and only two deliberate visual changes (`docs/nextjs-migration-plan.md:123`).

### (a) An integration branch, merged to `main` once as the release

Every PR is reviewed into one long-lived branch. `main` and Pages do not change until one release PR.

| Under | Cost |
|---|---|
| The daily sync | The branch falls behind `main` by data every day. `main` is merged into it before each PR's evidence run and once more before the release. No conflict is expected in the data files; `CHANGELOG.md` conflicts if a patch ships from `main` meanwhile. Tests that audit the live snapshot (for example `tests/venueTz.test.ts:87`) run against whatever data the branch last took. |
| The six-pass review | One cycle per PR into the branch, then one more on the release PR. A merge into the branch changes no public page, so the Pass 2.5 gate can let it through; the release PR always escalates, because it changes the public site and takes a number. The branch is not covered by `main`'s ruleset unless Beni adds one. |
| Step 0 | Untouched until the release. One moment to move it. |
| N7's parity proof | One re-baseline, at the release. Until then the Vite reference is today's look. |
| The preview | Each PR and the branch get a Vercel preview of the Next app, so the new look can be opened on a phone before it is public. |

**A reader sees:** nothing until the release PR merges. Then the whole second edition, at once, with its version in the provenance line.

### (b) Dark on `main` behind a flag, switched on at release

Every PR merges to `main`; the new look renders only when a flag is on.

| Under | Cost |
|---|---|
| The daily sync | None. It is `main`. |
| The six-pass review | Every PR must prove two things: the old look is byte-for-byte unchanged, and the new look is right. That doubles the evidence. Each merge ships new code, fonts and photographs to the public bundle even when nothing shows, and whether that is "a public-site change" for the gate is arguable every time. |
| Step 0 | Untouched while the flag is off, if the flag is a build constant. If it is a URL parameter, anyone with the link sees the new look, which is a public change in everything but name: `canonicalSearch` keeps unknown parameters (`src/lib/urlCodecs.ts:43-45`). |
| N7's parity proof | `main` carries two looks. The proof has to name which one it measures, and the Next app inherits both. |
| The repo | Two looks live side by side in `src/` for the length of the build, with a flag mechanism the repo does not have today. |

**A reader sees:** nothing until the flag flips, but downloads more on every visit before it does.

### (c) Piece by piece on `main`

Each PR is a public change.

| Under | Cost |
|---|---|
| The daily sync | None. |
| The six-pass review | Every PR escalates, because every merge changes the public site, and each needs Beni's word. |
| Step 0 | Has to move at the Poster PR, in the middle of the series. |
| N7's parity proof | The baseline moves with every merge. |
| The design | Every in-between state is public and none was drawn: new type in the old layout, a black band over the old rows, new books above an old Table. Each needs its own contrast and overflow proof. The provenance line would also print v0.5.5 over a look that is no longer v0.5.5's, on a page whose first promise is that its numbers are honest. |

**A reader sees:** a different, half-converted app after each merge, for as long as the series runs.

### Recommendation: (a), with one PR on `main` first

**Route (a), preceded by one tests-and-tooling PR on `main` that changes no rendered byte.** That PR (PR 0 below) pins the four untested honesty rules, moves the preview smoke's landmark off the "Jump to today" button, and turns the clearing's 96-cell runner into a general one. It lands on `main` because its value is in being there before the repaint starts: every later review can then show that no assertion was weakened, against tests that were on `main` first. It is not a release, since it ships nothing a reader can see.

After each merge under this route: a Pages reader sees no change; `main`'s Vercel preview sees no change; the branch's Vercel preview shows the build so far. After the release PR: everything, once.

The cost accepted is drift and one large final diff. The release PR's review is a review of the sum, not of the parts again: the matrix in both apps, the weight, the list of every changed assertion against `main`, Step 0, and the seven places a version is written.

---

## 3. The split into PRs

Ten PRs: one on `main`, eight into the integration branch, one release. (Amended Mon 16 Nov 2026: PR 1b, the font split, makes it eleven review cycles. PRs 2 to 9 keep their numbers; see section 4.2. Wed 18 Nov 2026: Beni ruled a trim of the offline set after #341 merges, and section 4.2 proposes it as PR 7b.) The order differs from the brief's example in two places, and both are deliberate. **The rows and their states come before the books**, because a book's contents are rows and the rows carry the honesty rules. **States are not a PR of their own**: each state is built with the surface it lives on, and a states harness grows with them.

Seats for every PR, unless a row says otherwise: **Cursor builds** (Grok 4.7, Extra High); **Pass 1** is a fresh Claude Code session that is not this one; **Pass 2** is Cursor's rebuttal; **Pass 2.5** is Codex's synthesis; **Beni's word** merges. That matches the seats table at `README.md:387-392`, where the synthesis seat is one that "wrote neither the build nor the fixes" (`README.md:376`).

Rollback for PRs 1 to 8 is the same: revert the merge commit on the integration branch. Nothing public moves, so only PR 0 and PR 9 have a rollback a reader could notice.

Two rules ride with every PR that adds a file under `src/components/`: add it to the `@source` list in `web/app/globals.css` and to the expected list in `web/scripts/check-css.mjs:24`; and, if `web/` imports it directly, to `web/src-allowlist.mjs:9-46`.

| PR | Into | What changes | What stays as it is | Size |
|---|---|---|---|---|
| **0 · Pin, then repaint** | `main` | Tests for the four unpinned rules (section 6). The smoke landmark moves to something both looks render (`scripts/vercel-smoke.mjs:56`). A general matrix runner beside `web/scripts/clearing.mjs`, with a contrast sampler, a weight report and a same-origin check. A states harness page under `tests/harness/`. | All of `src/`. The built bundles are identical: prove it with `web/scripts/check-reader-parity.mjs`. | M |
| **1 · Tokens and type** | branch | The `fb-` tokens beside the first edition's in `src/shell.css`, on the two axes mode and stock. The five families and the weight budget; `@font-face` and files if fonts are self-hosted (question 9). The handoff's measured pairs added to `tests/contrast.ts`. | Every component. First-edition tokens stay defined: Moments' CSS reads them (`src/index.css:12-175`, `web/app/moments/gallery.css`). | M |
| **1b · The font split** (amended 16 Nov, section 4.2) | branch | Each of the ten self-hosted files split into a latin half, under today's name, and a latin-ext half, named `-ext`, each with its `unicode-range`. One re-runnable script makes every half. `RECORD.md` records each source and output hash, and a test checks them. The offline and single files inline both halves of the six faces they carry (amended Tue 17 Nov and Wed 18 Nov, section 4.2). | Every page head and preload `href`. Every component. The cache headers. | M |
| **2 · Chrome and the motion control** | branch | The imprint band, provenance line, feet, page measures and the staleness banner, in all three shells (`App.tsx`, `offline.tsx`, `web/app/shell.tsx`). The motion control with its key, its pre-paint read and its tests. The +5 badge and the six glyphs. | The bodies of Fixtures and Table. Moments below the band (D5). | L |
| **3 · The Ledger: rows, states and the week** | branch | Contents and Ledger rows, StatusPill, both clocks on the row, the day note, "local time not known", the matchday line's ink and amber forms, the week row, "hidden by filters", NEXT UP with both clocks, merged empty days, the end-of-week count. AET, PENS and the other undrawn states by the rules of 1.7. | The Ledger's list of every fixture. `?only=` and `&date=`. The Table. No photograph, no decorative motion. | L |
| **4 · The Table's skin** | branch | The short cover without its photograph, league tabs, the two-clock cell, form pips, the games-in-hand note, the fifteen columns, the scorch, the black foot. | The Table's structure, sort, zones and data (D4). | M |
| **5 · Poster's books, still** | branch | Cover face, the cover's band, part openers, contents under a part, the "more" control, the shelf and spines, the quiet week, the UEFA week's eight markers, the closed book. Everything is drawn in its motion-off state on flat black stock. | The Ledger. No photograph yet, no rotation, no canvas. | L |
| **6 · The Rack turns** | branch | Rotation, the swipe, the tap that opens a book, the page after it opens, the carousel's roles and names, the Rack's Stop as the motion control's mirror. CSS and DOM only. | No WebGL. With motion off the Rack is PR 5's. | L |
| **7 · Imagery and its licence** | branch | The photographs as AVIF and WebP crops, their folder, licence file and records, the scrims, the ILLUSTRATIVE captions, the foot's sentence, the offline and single builds' no-photograph state. | Every layout. A cover without its file still reads. | M |
| **8 · The decorative layer** | branch | The one clock, the canvases, the shaders, the CSS effects (foil sweep, spine glitch, torch), the runtime governor, the flash gate. | Every still. With motion off the page is PR 7's, pixel for pixel. | L |
| **9 · The release** | `main` | `main` merged in; the version in its seven places; `CHANGELOG.md`; the README pictures; `docs/nextjs-migration-plan.md` amended (section 7); the Step 0 lines handed to Beni. | The code, unless the sum review finds something. | S |

Per PR, the evidence, and anything particular about rollback or seats:

- **PR 0.** Evidence: `typecheck` and `npm test` green in root and `web/`; each new test shown to fail when its rule is broken on purpose, then restored; the bundle manifest identical before and after; the smoke green on the PR's own preview. Rollback: revert; no reader notices. Seats: as above. It is bounded tooling, which this repo has also given to Codex (`docs/nextjs-migration-plan.md:310`), but Codex holds the synthesis seat here, so it should not build.
- **PR 1.** Evidence: every pair in handoff §2's table reproduced by `tests/contrast.test.ts`, including the five pairs that must fail; the font files' sizes; the network log at first load; the layout-shift score at 360, 375 and 390 against ideas row 125's numbers. Nothing renders differently yet, so the matrix is a smoke pass.
- **PR 1b.** Evidence:
  - font bytes per cold load, per app, tab and lens, for the runner's three weeks, against PR 1's merge head;
  - the 96 cells and the four offline cells pixel-identical to that head once the fonts have loaded;
  - the latin-ext half drawing the venue's two characters on a week that holds them;
  - the layout shift at 360, 375 and 390;
  - the unused-preload gate green;
  - each output hash re-derived by the script.

  Seats: the routing amendment's table for an M PR. It is built beside PR 2, with the two PRs' files kept apart as section 4.2 says, or after PR 2 when only one builder seat is free.
- **PR 2.** Evidence: the 96 cells; hit areas of at least 44 × 44 px with no overlap, measured; the motion control's state before first paint after a reload; the whole-header tests updated in both apps (`tests/dom/appHeader.test.tsx:8`, `web/test/header-shared.test.tsx:14`, `tests/dom/offline.test.tsx:15`); Moments' pixels below the band unchanged.
- **PR 3.** Evidence: the 96 cells plus the states harness, the quiet week and the UEFA week; contrast sampled on the rendered page; every honesty test of section 6 green, with the list of assertions whose selector changed; a count check that the Ledger's rows equal the snapshot's fixtures for the week under three `?only=` sets. This PR is the one a reviewer should break on purpose most.
- **PR 4.** Evidence: the Table's cells for all six leagues; `tests/dom/uclTable.test.tsx` and `tests/dom/tableUnderway.test.tsx` green; the fifteen columns at 1000 without overflow; the two-clock cell at 360.
- **PR 5.** Evidence: the cells; the cover's band checked against the snapshot for five weeks (a single-kickoff day, a shared first kickoff, an unset first kickoff, a closed day, a mixed-group day); the date line's three forms; the eight-marker row at 360.
- **PR 6.** Evidence: keyboard and screen-reader pass on the Rack; the rotation's stops on touch, focus, hover and a hidden tab; reduced motion; the title swap timed in the DOM; a person's watch on a phone (gaps 19 and 21, section 5).
- **PR 7.** Evidence: contrast over every photograph at its worst pixel; image weight per page at 390 and 1000; one record per shipped file; a person's full-size look at each photograph, named and dated in the record; the offline file opened from disk with the network off.
- **PR 8.** Evidence: the phone benchmark (gap 20); the flash gate's measured numbers; the motion control freezing every canvas; a hidden tab and an off-screen region both stopping the clock; WebGL refused, and the page still whole. **The seat question:** this is the one PR where a second opinion on the builder is worth asking for. Its risk is frame time on a phone, and none of the three vendors can hold a phone, so the choice between Cursor and Codex should follow quota, as `README.md:390` says, and the brief should give the builder the benchmark harness from PR 0 rather than ask for a new one.
- **PR 9.** Evidence: the sum review, section 8. Rollback: revert the release merge on `main`; Pages redeploys the old look on that push; the tag stays as history; Step 0's new address still works on the old build, so the Sportsbooks edit need not be undone in a hurry.

---

## 4. Assets and their licence

Vendor and browser claims in sections 4 and 5 were read on Sat 14 Nov 2026. Each carries its row in `evidence/vendor-claims.md` in brackets, for example [A16]; that file has every URL and quote. A claim is DOCUMENTED unless the sentence says UNVERIFIED.

### 4.1 The photographs

**Where they live (recommended; question 7).** One folder in the repo, `public/photographs/`, holding only the files a browser fetches. The sources stay in the design folder.

- The ten picked sources are 56.0 MB of PNG (6.0 to 7.2 MB each for eight, 3.3 MB for the dawn plate, 0.8 MB for the void; `ls -la`, summed). None is near GitHub's 50 MiB warning or 100 MiB block [E6, E7], but committing them would put 56 MB into history for files no reader fetches. GitHub recommends a repository under 1 GB and caps a published Pages site at 1 GB with a soft 100 GB a month of bandwidth [E1, E2, E9].
- Vercel documents no total size cap for static files in a Git-triggered deployment on Hobby: UNVERIFIED [E16]. Its build has a 45-minute limit and no limit on output files [E12, E13]. The site does not use Vercel's image service: the plan is a plain `picture` element.
- A small module lists each slot's files, and the offline and single builds leave it empty (7.4). That files under `public/` are copied and never inlined by the single-file plugin is this seat's understanding of Vite, not checked against a build or a page: UNVERIFIED. The cheap test is one `npm run build:single` with a file in `public/`.
- The Next app takes the same files through a copy step at build time (7.1), not a second committed copy.

**Formats.** A `picture` element with an AVIF source, a WebP source and an `img` whose `src` is the WebP. A browser skips a source type it does not support [D13]. AVIF: Chrome 85, Firefox 93, Safari 16.1 on macOS, and stills from iOS 16.0 [D10, D11]. WebP: Chrome 32, Firefox 65, Safari on iOS 14.0 [D12]. A browser with neither shows the cover's title block on black stock, which is the offline state and already designed for.

**Crops** (handoff §7: portrait cover, wide plate, 1000-wide rack; cut from the source, never upscaled again):

| Crop | Boxes it serves (handoff §5) | Widths to cut |
|---|---|---|
| Portrait cover, 4:5 | Rack face 330 × 413 at 390 and 300 × 413 at 360; full cover 390 × 488 | 390, 780, 1170 |
| Rack at 1000 | centre 360 × 450, neighbours at 82% | 360, 720, 1080 |
| Wide plate | part opener, 156 px tall, page-wide at 390 and 640 wide at 1000 | 390, 780, 1170, 1280 |
| Short cover | the Register and the quiet week, a 150 to 250 px window | 390, 780, 1170 |

The void is 928 × 1152 (handoff §7), so it ships no wider than 928. The first cover takes `fetchpriority="high"`, a hint that Chrome 101, Firefox 132 and Safari 17.2 honour and others ignore [D8, D9]. Every `img` carries its width and height so nothing shifts when it arrives.

**Weight.** The handoff sets budgets "by measurement on a phone in the build" (§4, §8), so the plan sets none as fact. The mark to beat is the cold review's estimate for the Poster's first book at 780 px: about 280 KB as AVIF and 370 KB as WebP (`docs/design-overhaul-review.md:379-381`). PR 7 reports the measured bytes per page and tab, and the PM seat and Beni accept or send it back.

**The record (D14; question 4 open).** One entry per shipped file, in `public/photographs/RECORD.json` with a readable copy beside it: the slot; the file, its bytes and SHA-256; the source's path in the design folder and its SHA-256; each step of its chain with provider, endpoint, request id, seed, prompt and date; "model: not recorded" on the seven Pen-made first generations, if question 4 is answered "Record"; and who looked at it at full size, and when.

- The fal record exists already: `fal/provenance.jsonl` has 78 lines with `time_et`, `job`, `endpoint`, `request_id`, `inputs`, `prompt`, `params`, `outputs`, `cost_usd` and `cost_basis`. **The two cost fields do not go into the repo:** no real money figure appears anywhere.
- fal keeps its own logs for 90 days (`docs/design-overhaul-proposal.md:758-759`), so that local file is the only lasting source. It should be copied somewhere durable now, whatever question 4's answer.
- The Europa and Conference night cover was made with Nano Banana 2; Google says every image from that model carries a SynthID watermark [F15]. Nothing follows from it for the build; it belongs in that file's record.
- A test in the `node` project: every file in the folder has an entry, every entry a file, every checksum matches, and no entry has a cost field.

**Captions and the foot.** "ART · ILLUSTRATIVE" on a cover, "ILLUSTRATIVE" on a plate, and the foot's sentence that the photographs are generated (boards 03, 07, 13). A test: wherever a photograph renders, its caption renders; the foot's sentence is present when the page has a photograph and absent from the offline file.

**The licence file (question 8).** Recommended: a short notice in `public/photographs/LICENCE.md`, and one line each in the root `LICENSE` and the README saying that folder is not under MIT. The notice says what the files are, points to the record, grants no reuse, and notes that the providers' terms may apply. It makes no claim about copyright. What was read, none of it legal advice:

- The US Copyright Office's report says purely AI-generated material is not protected and that prompts alone do not make an author, while a person keeps copyright in what they contribute [F21, F22, F23].
- Creative Commons says its licences cover the human contribution, that the generated part may be uncopyrightable all the same, and that it encourages CC0 for output without significant human creativity [F25, F26, F27].
- pen.dev's terms give the user the outputs "subject to third-party rights" and say third-party services' terms apply [F19, F20].
- fal's Terms of Service say the customer owns its input; no sentence was found that says who owns the output: UNVERIFIED [F1, F2]. They disclaim that outputs are original or non-infringing [F3]. Commercial use is shown per model, by a badge on each model's page [F5, F6]. They restrict using outputs to train competing models [F7].
- Black Forest Labs' developer terms say the developer owns the output, for BFL's own API; that they reach output made through fal is UNVERIFIED [F8, F12].
- Google claims no ownership of generated content [F13]. Topaz's licence has no clause on who owns the processed output and bars using outputs to train models [F16, F17].

### 4.2 Fonts

| Family | Styles (handoff §4) | Reserved name in its `OFL.txt` | What the build may do |
|---|---|---|---|
| Oswald | one variable file | none [A13] | Subset to Latin and Latin Extended, under its own name |
| Libre Caslon Text | 400, 400 italic | none [A6] | The same |
| Chakra Petch | 700 | none [A10] | The same |
| Abril Fatface | 400 | "Abril", "Abril Fatface" [A2] | Ship whole, or subset **and rename** |
| IBM Plex Mono | 400, 400 italic, 500, 600 | "Plex" [A16] | Ship whole, or subset **and rename** |
| Inter | as shipped, for Moments | not looked up | Check its `OFL.txt` first |

All five are SIL OFL 1.1 and all five have a Latin Extended subset [A1, A4, A5, A8, A9, A11, A12, A14, A15, A17]. Orbitron has none [A18], which matches the handoff's reason for retiring it.

**A finding the handoff does not carry.** The handoff says to self-host WOFF2 and "subset to Latin and Latin Extended" (§4). Under the OFL a subset is a Modified Version [A34], a Modified Version may not use a Reserved Font Name without written permission [A23, A38], and the restriction reaches the name a document uses to ask for the font [A37]. A WOFF2 copy is not a modification only if the font data is unchanged apart from compression and the metadata is carried over or omitted, which conversion tools do not guarantee [A32, A33]. So a subset of Abril Fatface or IBM Plex Mono served under those names is a risk. That last step is this plan's reading of the four rows together and no page states it for these two families [A39, UNVERIFIED]; it is not legal advice. The cheap way out is already in the design: both families are reached through tokens (`fb-display`, `fb-mono`), so the subset files can carry another family name in the file and in the stylesheet. The other way is to ship those two whole and pay the bytes.

**What travels with the files.** Every redistributed copy carries the copyright notice and the licence, which may be a text file beside it [A20, A21]; serving a font from your own server is distribution, not embedding [A26, A27, A28]. So each family's `OFL.txt` sits beside its files, as the handoff says.

**Loading.** Preload only Oswald, Plex Mono 500 and Caslon 400 (handoff §4). A font preload needs `crossorigin` even from the same origin [D29]. The rest use `font-display: swap` [D28]. Ideas row 125 measured the layout shift a late Oswald causes and lists a width-matched fallback as one fix (`docs/v0.2.6-ideas.md:159`); PR 1 measures the shift with and without one.

**What each choice does to the network (question 9).**

| | Self-hosted | Google's |
|---|---|---|
| Hosts a reader's browser contacts for type | The site's own | `fonts.googleapis.com` and `fonts.gstatic.com`, on every page of both apps and the offline file (`index.html:11-16`, `offline.html:11-16`, `web/app/layout.tsx:20-22`) |
| What the font host receives | Nothing goes to Google [B5] | The IP address, the requested URL and headers including user agent and referrer [B2, B3]. Google says the API sets and logs no cookies and is not used for ad profiling [B1, B4]. That Google logs addresses, or for how long, is not stated: UNVERIFIED [B6]. |
| The privacy copy N5 writes | "Fonts are served from this site." | Keeps the paragraph the cutover plan already requires (`docs/nextjs-migration-plan.md:294`) |
| Cost | Files in the repo; Inter must come too, because the link that fetches it is in every page's head, not only Moments' (`index.html:14`) | A render-blocking request to a third party stays, and five more styles are added to it |

The cutover plan calls self-hosting "a separately approved" change (`docs/nextjs-migration-plan.md:294`), which is why it is a question and not a build detail.

**One set of files, two apps.** The files live once, under `public/fonts/`. The two apps resolve URLs differently (Vite builds with `base: './'`, `vite.config.ts:15`; Next serves from the root), so there are two `@font-face` lists. A test asserts they name the same families, weights and files.

### Amended Mon 16 Nov 2026: the font split is a PR 1b (proposed by the Track A Planner; approved by Beni the same day)

**Ruling.** Beni approved this amendment as proposed on Mon 16 Nov 2026 at about 9:25 PM EST ("As recommended"). His answers to the three questions at the end of this section:
- **1b.** The split lands in a PR of its own.
- **All.** It covers all ten files.
- **Beside.** It is built beside PR 2 when two builder seats are free, and after PR 2 when only one is.

The rows for PR 1b in section 3's table, its evidence list, and section 8.3 follow from this ruling.

**Why there is a question.** On Mon 16 Nov 2026 Beni ruled that the rendered faces are to be split into latin and latin-ext files, but not in PR 1 (PR #330's cycle, ruling 2, `docs/design-overhaul-pr1-review-prompt.md`). PR 1 self-hosts each face as one file subset to the union of the two ranges Google's stylesheet served (`public/fonts/RECORD.md`). So a cold load of Fixtures or Table fetches 205,174 bytes of fonts where `main` fetches 90,123, and Moments 179,294 where `main` fetches 69,905. All three of #330's review seats measured those figures. Subsetting the four rendered files to the latin range alone gives 107,536 bytes (Pass 1, re-run by Pass 2.5). Four of the 1,446 fixtures hold a character outside that range, all in one venue's name.

**Proposed: a PR 1b, "The font split", into the integration branch.**
- **Its number.** It is 1b, so PRs 2 to 9 keep the numbers every brief, table and ruling cites. It is still an eleventh review cycle, which amends Beni's ruling 2 ("Ten"), so it needs his word.
- **All ten files, not only the four rendered.** The pipeline has to exist anyway. By the handoff's scale (§4), PR 2 first renders Caslon and Kickoff Mono 400 (the provenance line, the footer and the banner), and later PRs render the rest. With every file split once, no later PR touches a font binary. A file no page renders costs a reader nothing. Ruling 2 named the four rendered faces, so this widens it, and that is Beni's call.
- **File names.** The latin half keeps today's name, and the latin-ext half adds `-ext`. Every preload `href` stays as it is, so 1b touches no page head, and PR 2 can add the Caslon preload without a conflict.
- **Re-runnable.** One script, outside the build and the lockfile, with fontTools pinned. It fetches each upstream source at the commit `RECORD.md` names and checks its SHA-256. It subsets each half to Google's range for that half. It renames the two reserved families in code, not by hand. `RECORD.md` gives the command, every source hash and every output hash, and a test compares the output hashes with the files on disk. This also closes #330's finding 9: the rename is prose today, so two files cannot be re-derived.
- **Coverage.** Each face gets a `unicode-range` per half in `public/faces.css`, and the Next copy follows it. The offline and single files inline both halves of the four faces ruling 4 keeps, so they still draw every character the snapshot holds, and their size barely moves. Online, a page fetches a latin-ext half only when it shows such a character.
- **Evidence.**
  - Font bytes per cold load, per app, tab and lens, for the runner's three weeks, against PR 1's merge head.
  - The 96 cells and the four offline cells pixel-identical to PR 1's merge head once the fonts have loaded. Subsetting must not change an outline or an advance. If the upstream source differs from the one PR 1 used, the PR says so.
  - The venue's two characters drawn from the latin-ext half on a week that holds them.
  - The layout shift at 360, 375 and 390, because a second file per face can arrive later than the first.
  - The unused-preload gate from #330's fix round green.
  - Each family's `OFL.txt`, and the reserved-name rule above, kept.
- **Not in it.**
  - Cache headers: #330's finding 6, a cutover decision.
  - A fallback: ruling 3, Leave.
  - Any preload change.
  - Trimming Inter's weight axis to 400 to 600, unless it is measured on its own.
- **Size and seats.** M. The seats follow the routing amendment's table for an M PR, read on Thu 19 Nov. The session that builds it does not review it.
- **When.** After PR 1 merges, beside PR 2's build. The two briefs keep their files apart:
  - 1b owns `public/fonts/`, `public/faces.css`, `scripts/inline-faces.ts` and the font tests;
  - PR 2 owns the shells, the components and the page heads;
  - the line in `RECORD.md` that says which pages load which files belongs to 1b, so PR 2 reports its loads in its PR comment and whichever merges second makes that line true.

  If only one builder seat is free, 1b waits until PR 2 merges. PR 2's weight evidence is then measured on the union files, and says so.

**The alternatives.**

| Instead | What it saves | What it costs |
|---|---|---|
| Fold the split into PR 2 | One review cycle | An L chrome PR also carries font binaries and a font pipeline: the "too large to review cold" cost section 3 gives as the reason for ten PRs |
| Leave it to the release (PR 9) | One review cycle | PRs 2 to 8 measure weight on the union files, and the S release takes a binary change it was not sized for |
| Split only the four rendered faces | Six files' work now | Each later PR that first renders a face splits it then, reopening the pipeline up to three more times |

**Questions for Beni, each answerable in one word.**
1. Where does the split land? **1b** · PR 2 · Release. Recommended: 1b.
2. Which files? **All** · Four. Recommended: All.
3. When? **Beside** PR 2 · After PR 2. Recommended: Beside, when two builder seats are free.

### Amended Wed 18 Nov 2026: the offline set, six faces now and trimmed later (Beni's rulings at #341's Pass 3; the PR is proposed by the Track A Planner)

- **What grew.** On Tue 17 Nov Beni answered "Yes, extend it": the offline and single files carry Caslon 400 and Kickoff Mono 400 beside ruling 4's four faces, so they hold both halves of six faces. #341 built that, and its Pass 2.5 measured the cost at 148,593 bytes a file.
- **The ruling.** On Wed 18 Nov Beni ruled "Trim", and then "Merge now, trim later". #341 merges with all six faces' halves, and a later PR into the integration branch trims the set before v0.6.0. #341's Pass 2.5 found that 106,864 of the 148,593 bytes are five extended halves no character in the snapshot needs. Only Inter's extended half is used today, for the Ş and ğ of Şükrü Saracoğlu.
- **What the trim must keep true.**
  - No glyph changes. For the snapshot a file is built from, the trimmed file draws exactly what the six-face set draws, so the offline cells stay pixel-identical to the merge head before it.
  - A sync never turns `verify` red. Sync PRs merge once `verify` is green (`CLAUDE.md`, "Scheduled sync"). A coverage test that failed when a snapshot brought a new character would hold every fixture update until someone changed the code. So the build must decide from the data it inlines whether a face carries its extended half, or the rule must be conservative enough that no snapshot can need more.
  - Rulings 3 and 9 stand: no `local()` face, and no page contacts a font host.
- **What the brief must settle.** Which faces draw which data fields, on the offline page and in the single file. And how that map stays true when a later PR moves a field to another face: either the evidence runner reads it from the rendered page, or it is declared and a test pins it.
- **When.** After PR 7, proposed as **PR 7b**. PRs 3 to 5 decide which faces draw the rows, the Table and the books, and PRs 2 and 7 set the offline page and its no-photograph state. A map measured before them would describe a page that is about to change. So the brief is written from a fresh read once PR 7 merges, and not before.
- **Size and seats.** S to M. The seats follow the routing amendment's table at the time.

The rulings and their record: `docs/design-overhaul-pr1b-review-prompt.md`, under "The re-run's result, Beni's rulings and the merge handoff".

### 4.3 The new browser-storage key

- **One key,** for the motion control. Working name `kickoff-motion`; values `off` and `on`; absent means "follow the operating system".
- **Read and written the way the theme is** (`src/lib/theme.ts:36-50`): a read can throw when storage is blocked, a write can throw on quota, and a private window may offer storage that holds nothing [D31, D33, D34]. The theme's tests are the pattern (`tests/theme.test.ts:29`, `:35`; `tests/dom/theme.test.tsx:58`, `:86`), and the rig already has a throwing storage and a reduced-motion switch (`tests/dom/rig.ts:76`, `:25`).
- **What the privacy copy must then say:** that the site keeps the reader's motion choice in the browser, under that key, as one word, and sends it nowhere. The full list becomes `kickoff-theme`, `kickoff-motion`, `kickoff-moments-saved-v1` and, in the Next app, `kickoff-moments-autoplay-v1` (`web/app/moments/autoplay.ts:1`); and it should say that an old `kickoff-theme-broadcast` may still sit in a returning reader's browser (ideas row 131, `docs/v0.2.6-ideas.md:165`).

---

## 5. Motion and the WebGL layer

### 5.1 The principle: the still is the page

The server's HTML and the first paint are the motion-off still on every surface: the photograph, the static foil, the calm word. A decorative layer mounts on top afterwards, and only when four things hold: motion is on, the region is in view, the tab is visible, and the layer is supported and inside its budget. So "stills chosen before first paint" needs no decision at run time. There is nothing to un-choose, and every failure (no WebGL, a lost context, a slow phone, a script that never loads) ends on a designed state.

### 5.2 The handoff's section 8, mapped to code

| Contract (handoff §8; board 17) | Where it lives | Notes |
|---|---|---|
| The motion state before first paint | A `data-motion` attribute on `<html>`, set by the same pre-paint script as the theme (`scripts/themeBootstrap.ts:25-34`; in Next, `web/app/layout.tsx:9`, `:18`) | The control then renders in its true state. `prefers-reduced-motion` is widely supported [D1, D2]. |
| One clock | A new pure module, in the manner of `src/lib/clock.ts`: one `requestAnimationFrame` loop, page-active seconds, no catch-up | Time-based, never frame-counted, because the callback rate follows the display [D4]. It stops on `visibilitychange` [D5, D6]; browsers also pause the callback in background tabs [D3]. Testable in the `node` project with an injected time source. |
| Each region's playhead runs only in view | An `IntersectionObserver` per region [D7] | |
| One strong effect at a time, 400 ms of quiet | A small pure scheduler, with the priority order of board 17 panel 01 | Node-testable. |
| At most one canvas per visible region, one pipeline, no dependency | A canvas under the live text, `aria-hidden`, no pointer events | Raw WebGL. The proposal rejected three.js, GSAP and carousel libraries (`docs/design-overhaul-proposal.md:863-865`). |
| WebGL 1 or 2 | The builder's choice, reported | The handoff says "WebGL"; the proposal says WebGL2 (`docs/design-overhaul-proposal.md:646-649`). WebGL 1 is in every browser since 2015 [D15]. WebGL 2 support was not looked up: UNVERIFIED. Recommended: target WebGL 1 unless a shader needs more. |
| Context loss | On `webglcontextlost`, show the still and stop [D16, D17] | Browsers cap live contexts: 16 in Chromium, 8 on Android, 16 in WebKit, with the oldest lost past the cap. This is in browser source only; no documentation page states it [D18, D20, D21]. Rule: never more than four live, and release one when its region leaves view. |
| Text and digits are live type above the canvas (D8) | DOM text; the foil is `background-clip: text` | Unprefixed from Chrome 120 and Safari 14, prefixed before, Firefox from 49 [D25, D26]. A fallback colour sits under it [D27], and that colour is the one whose contrast is measured. |
| CSS-only effects | Foil sweep, spine glitch, torch, scorch | The torch follows a pointer and never a touch. |
| The state budget | Unchanged: 150 ms (`FixtureRow.tsx:109`), 180 ms (`LensSwitcher.tsx:65`), 220 ms (`src/shell.css:108-114`, with the controller's timer at `useThemeController.ts:39`) | Checked on the built CSS (8.2). |
| Reduced motion | Nothing decorative starts | Today's guards are `motion-reduce:` classes and one `matchMedia` check (`useThemeController.ts:33`). The rig can switch it (`tests/dom/rig.ts:25`). |
| A small rule the handoff leaves open | If the system asks for reduced motion and the reader presses Start | Recommended: honour it for the visit and do not store it. |

**The motion control (D7).** WCAG 2.2.2 is Level A: content that moves, starts by itself, lasts more than five seconds and sits beside other content needs a way to pause, stop or hide it, and the criterion covers the whole page [C1, C2, C4]. One control in the band, first in reading order after the wordmark, freezes every decorative playhead at its still. State changes keep running.

**A conflict to settle in PR 2.** The handoff gives the control a name that changes with its state ("Stop motion", "Start motion") and also `aria-pressed="true"` when stopped (§5, §8). The W3C's button pattern allows one or the other: a fixed label with `aria-pressed`, or a changing label without it [C30, C31]. Its carousel pattern uses the changing label and no `aria-pressed` [C26]. Recommended: the changing label, without `aria-pressed`, on both the band's control and the Rack's Stop. It matches rule 10 ("its label names the action") and the pattern the Rack must follow anyway.

**The Rack as a carousel.** A region or group with `aria-roledescription="carousel"`; each slide a group with `aria-roledescription="slide"` [C22, C23]; the rotation control first in the Tab order [C25]; the live region off while it rotates by itself [C27]; rotation stops when focus enters or a pointer hovers, and does not restart unless asked [C28, C29]. The handoff has all of these. One thing it does not have: the pattern says previous and next buttons are needed in every case [C24], and the Rack has one marker per book and a swipe. Whether the markers meet that is for the screen-reader pass in PR 6 to decide.

**The Rack's Stop** is the motion control's mirror: one switch, one state. The pause on touch, focus or hover is a different thing: it holds the rotation only, and only an explicit Start resumes it (handoff §8).

**The flash gate (WCAG 2.3.1, Level A).** Nothing flashes more than three times in a second, or the flash is under the thresholds [C5]. A flash is a pair of opposing changes in relative luminance [C6]; a general flash is a pair of 10% or more where the darker image is under 0.80 [C9]; the area that matters is a quarter of any 10-degree field, which a 341 × 256 px rectangle approximates [C8, C11]; any pair involving a saturated red counts [C10]. The handoff's own rule is tighter: a change of 10% across most of a face takes a third of a second or more, flicker lives in thin tongues, and saturated red never flickers.

- **How it is measured.** In the harness, the clock is stepped a sixtieth of a second at a time through a crossing, the Rack is captured at each step, and relative luminance is computed per pixel. For every third-of-a-second window the script reports the share of each face that moved 10% or more, and the number of opposing pairs in any 341 × 256 px area. The spike measured 22.68% and 26.6% of the face for the develop (`docs/design-overhaul-proposal.md:733-735`, `:819-820`).
- **Pass mark.** No window with more than three opposing pairs a second over a quarter of that area; no opposing pair involving saturated red at all; the handoff's third-of-a-second rule holds for every face.
- The Friday cover holds lightning and is never animated (handoff §7).

**Stops.** The runner asserts that a hidden tab and an off-screen region both stop the clock, and that pressing the control leaves two captures two seconds apart identical.

**Haptics.** The handoff allows a vibration on Android for a crossing the reader starts. `navigator.vibrate` is absent from Safari, needs a user gesture in Chrome for Android, and does nothing in Firefox [D22, D23, D24]. Recommended: leave it out of this release (section 10).

### 5.3 Settling gaps 19, 20 and 21

All three use the harness page from PR 0, which is not shipped. It gains a watch mode in PR 6 and a bench mode in PR 8.

**Devices.** This seat does not know which phones Beni has. The plan needs one iPhone on current Safari, because nobody else in the loop can run WebKit on a phone, and an Android phone on Chrome if one is to hand. Results are read on screen, or through Safari's Web Inspector or Chrome's remote debugging [D40, D41, D42].

**Gap 20, the phone benchmark.**

- **Method.** The bench mode runs fixed scenarios and records the time between animation frames from the callback's own timestamp, which is the one way that works in every browser [D45]; the Long Animation Frames API is Chromium-only [D44]. Scenarios: a 30-second hold on the Rack (fog, rift, smoulder, push-in); five automatic crossings; five crossings the reader swipes; a scroll down the Poster through both openers; fifteen seconds of the shelf. It reports the median, the 95th percentile and the worst frame, frames over 16.7 ms and over 33.4 ms, the device, the browser, and whether Low Power Mode was on.
- **Pass marks (proposed).** Hold and scroll: 95th percentile at or under 16.7 ms. A crossing: no frame over 33.4 ms and at most three over 16.7 ms. A scenario that fails ships as its still.
- **The gate inside the product.** One phone is not every phone, so each canvas also measures its own first second and, if it is over budget, stops and leaves the still for the visit. Nothing is stored. In Low Power Mode WebKit halves the callback rate to 30 a second, so that phone gets the stills; this is in WebKit's source and a tracker comment, and no Apple page states it [D35, D36, D37 UNVERIFIED]. On a 120 Hz iPhone page updates are held near 60 a second by default, again from source only [D38, D39 UNVERIFIED], so 16.7 ms is the right mark there.
- **Weight on a phone connection.** The same session records the transfer size of fonts and images and the time to the first cover on a throttled connection. No mark is proposed; the first numbers are the baseline.

**Gap 21, how long a tapped cover takes to grow into its book.**

- **Method.** The watch mode offers 220, 320, 450 and 600 ms with the spike's curve, `cubic-bezier(.22,1,.36,1)` (board 17, panel 03). Beni watches each at 390 on the phone and at 1000 on a desktop and answers with one number.
- **Pass mark for the number chosen.** No frame over 33.4 ms during the growth on the benchmark phone; the page below changes only when the growth ends, and focus moves to the opened book's heading (board 17, panel 03); with motion off the change is instant.
- **Recommended first candidate: 220 ms,** because it is the only one that leaves the budget of 150, 180 and 220 as it is. Any other value adds a named fourth duration to hard rule 5, which is Beni's ruling to make and the PR's to record.

**Gap 19, the title swap at 1.45 s.**

- **By script.** With the clock stepped, sample every frame: the two title blocks are never both visible; neither box moves; the outgoing block is gone by 1.56 s and the incoming one settled by 1.67 s; the marker's underline and `aria-current` move at 1.45 s, within a frame; the live region stays off (handoff §8).
- **By eye.** Five automatic crossings watched on the phone. If anything looks wrong, an iOS screen recording stepped frame by frame. Pass: Beni's word that it reads as one change.

---

## 6. Data honesty and Step 0

### 6.1 Each rule, where it lives, and the test that pins it

"Today" is the test at `9b0417e`. "PR 0" is a test that does not exist yet and lands on `main` before the repaint. "With the surface" is a test written in the PR that builds the new surface. `evidence/02-honesty-tests.md` has the full list with assertion lines.

| Rule | Enforced in | New surfaces where it must also hold | Pinned today | To add |
|---|---|---|---|---|
| **No clock for an unset kickoff** | `FixtureRow.tsx:36`, `:61`, `:100-104`; `TonightSlate.tsx:11-12`; `NextUpStrip.tsx:28`, `:38-39`; `TablePage.tsx:359-366`, `:461-463`; `kickoffBounds`, `lensSelectors.ts:58-70`; `nextKickoffId`, `:140-147` | The cover's date line ("FIRST KICKOFF NOT SET"), the cover's band (an amber count and no fixture), the count line "+ N more, from H:MM", the part opener, "Coming next", NEXT UP | `tests/dom/fixtureEdges.test.tsx:33`; `web/test/fixture-edges.test.tsx:12`; `tests/dom/poster.test.tsx:7`; `tests/dom/designCycle.test.tsx:112`, `:129`, `:145`; `tests/lensSelectors.test.ts:48`, `:108`, `:166`, `:209`, `:357`; `tests/fixtures.test.ts:50`, `:96`, `:141` | **PR 0:** the Table's cell, mobile and desktop. **With the surface:** a cover whose first kickoff is unset prints no `\d:\d\d` in its title block; "from H:MM" is never a placeholder's time. |
| **Both clocks from one instant** | `fixtureTimes`, `src/lib/time.ts:89-97` | The 24-hour stadium clock on rows, the cover band, the Table cell, NEXT UP | `tests/time.test.ts:38`, `:46`, `:54`, `:62`, `:69`, `:77`; `tests/venueTz.test.ts:13`, `:25`, `:40`; `tests/dom/venueTz.test.tsx:23`, `:30` | **With the surface:** for the eighteen recorded events of `tests/venueTz.test.ts:25`, the 24-hour stadium clock names the same minute as the 12-hour one. A source scan: no file under `src/components/` builds a `Date` from `kickoffUtc`. |
| **"20:30 local", and "local time not known"** | `FixtureRow.tsx:117-118`; `TablePage.tsx:362` | Every row, cover band, Table cell and NEXT UP card | The fallback: `tests/dom/fixtureEdges.test.tsx:39`; `web/test/fixture-edges.test.tsx:18`; `tests/dom/venueTz.test.tsx:23` | **PR 0:** the word "local" beside a time on a row, in today's form. **With the surface:** the form is 24-hour; no row, band or cell matches a zone abbreviation or an offset. |
| **Amber's eight uses** | (1) `AppHeader.tsx:16`; (2) `FixtureRow.tsx:101`, `TonightSlate.tsx:12`, `NextUpStrip.tsx:39`, `TablePage.tsx:365`; (3) `FixtureRow.tsx:80`, `TablePage.tsx:346`, `:460`; (4) `TablePage.tsx:109`, `:190-191`; (5) `StalenessBanner.tsx:19`; (6) not built, 1.7 row 12; (7) `MatchdayLines.tsx:10`; (8) `FixtureRow.tsx:117` | The cover's date line and band; the Ledger's caps forms | Classes at `tests/dom/designCycle.test.tsx:64`, `:139`, `:151`; `tests/dom/venueTz.test.tsx:26`. Contrast: `tests/contrast.test.ts:6`; `tests/europeanContrast.test.ts:32` | **With PR 1:** handoff §2's pairs in `tests/contrast.ts`. **With PR 3:** an inventory test that allows each amber site by file and reason and fails on a ninth, in the manner of `tests/removalAudit.test.ts:69` and `tests/contrast.test.ts:16`. |
| **The matchday line** | `src/lib/matchdays.ts:8-12`, `:23-40`; `MatchdayLines.tsx:5-13` | Under the date line on that night's cover | `tests/dom/matchdays.test.tsx:14`, `:18`, `:23`, `:29`, `:36`; `tests/matchdays.test.ts:16`, `:28`, `:42`, `:52` | **With PR 3:** the computed line carries ink and not amber; the other two carry amber. The numbers' logic is not touched. |
| **The row order** | `sortForDisplay`, `src/lib/fixtures.ts:36-43`; `GROUP_RANK`, `src/lib/competitions.ts:49` | Both lenses; the opened "more" | **Nothing.** | **PR 0:** group, then kickoff, and ties keep the snapshot's order. |
| **The cover band's kickoff order** | new | The cover; "Coming next" | none | **With PR 5:** kickoff order across groups; only a kickoff held by one match is named; the first shared kickoff ends the list; a tie is never broken. |
| **The book closes on real results (D6)** | new | The closed cover and its band | none | **With PR 5:** the band prints only stored results; a closed book never appears while a match of the day is not final. A source scan with an allow-list: no currency sign, price, stake or pay-out in `src/components/`, the two existing "staking" sentences allowed by file (`FixturesPage.tsx:114`, `StalenessBanner.tsx:25`). |
| **AET, PENS, suspended, abandoned** | `STATUS_LABEL`, `FixtureRow.tsx:6-16`; `unsettledStatus`, `src/lib/schema.ts:191-193` | Both row layouts; the closed band | `tests/dom/fixtureEdges.test.tsx:49`, `:63`, `:74`; `web/test/fixture-edges.test.tsx:23`, `:37`, `:48`; `tests/standings.test.ts:215`; `tests/lensSelectors.test.ts:53`, `:112`; `tests/fixtures.test.ts:28`, `:89`, `:176` | **PR 0:** CANCELLED renders its word. **With PR 3:** each state's word is present in both lenses, never colour alone. |
| **LIVE and KICKED OFF** | `FixtureRow.tsx:33-34`; `believablyLive`, `lensSelectors.ts:174-178`; `hasKickedOff`, `:132-134` | Rows, the Table cell | `tests/dom/designCycle.test.tsx:47`, `:73`; `tests/dom/tableUnderway.test.tsx:76`; `tests/standings.test.ts:185` | See question 13 before anything here changes. |
| **Staleness** | `StalenessBanner.tsx:13-14` | Under the band on every tab | `tests/dom/requestClock.test.tsx:103`, `:117` | The two banner pairs in `tests/contrast.ts:75-77` move to the flat planes with the same 4.5 floor. |
| **The sync stamp** | `src/lib/fixtures.ts:134`; `AppHeader.tsx:16-18` | The band and every foot | The format only: `tests/time.test.ts:24` | **PR 0:** the header prints the stamp and `META.total`. |
| **`?only=` and `&date=`** | `FixturesPage.tsx:22-25`, `:39-43`; `src/lib/urlCodecs.ts:15-32`, `:46-64` | The Rack: its week and its counts | `tests/urlCodecs.test.ts:12`, `:15`, `:18`; `tests/dom/urlState.test.tsx:157`; `tests/dom/clearing.test.tsx:40` | **With PR 3 and 5:** the same popstate test under `lens=ledger`; the Rack holds the anchored week's books; a cover's count is the count shown. |

The snapshot at `9b0417e` holds 347 full-time, 1,134 scheduled and one suspended fixture, 465 of them with an unset kickoff (counted from `src/data/fixtures.json`). Every other state is evidenced only by synthetic fixtures, which already exist and are shared with the Next app (`tests/fixtures/edgeFixtures.ts`, `web/src-allowlist.mjs:45`).

### 6.2 How "no assertion is weakened" is shown

1. **A table in every PR body**, one row per assertion touched: file and line before, file and line after, and one of four kinds: a selector or class renamed; words changed by a named ruling; moved to the surface that replaced the old one; removed with its component. The fourth kind is allowed only when the same rule is asserted on the replacing surface in the same PR.
2. **A mutation receipt per rule**: break the rule in the code, show the named test fail, restore. PR #320's review worked this way (`docs/design-overhaul-proposal.md:447-449`).
3. **Assertions that will move, known now:** `tests/dom/poster.test.tsx:7` (the "3 TBC" sub-line becomes the date line's amber ending); `tests/dom/matchdays.test.tsx:23` (the italic on an absent line becomes the amber voice, since the handoff sets all three forms in one face); the class assertions that spell `text-floodlight-strong` (`tests/dom/designCycle.test.tsx:64`, `:139`, `:151`; `tests/dom/venueTz.test.tsx:26`); the whole-header tests; `tests/dom/designCycle.test.tsx:47`, if question 13 is answered "Drop".
4. **A recommendation to the builder, not a rule:** mark a text element's voice with a data attribute (ink, pitch, amber, alarm) and assert that, so a test pins the meaning and not a class string. The contrast sampler and the amber inventory can read the same attribute.

### 6.3 D10 and Step 0

- **What changes for Step 0.** Today both lenses list the week. After the release the Poster's resting page shows the next matchdays' first rows and a "more" bar with its count; the Ledger lists every fixture. A Step 0 that opens the app without a lens would read the Poster.
- **Both parameters keep working in both lenses.** They are read above the lens branch (`FixturesPage.tsx:22-25`, `:39-43`, branch at `:73-77`) and that does not move. The Rack takes the same anchor and the same filter set.
- **A check the Ledger gives Step 0.** The end-of-week line states the week's count by day, and "N hidden by filters" states what a filter removed. The two together say whether the list is whole.
- **The edit.** Three places hold the address: `~/Documents/Claude/Projects/Sportsbooks/CLAUDE.md:385-387`; `AGENTS.md:390` in the same folder, which repeats the sentence; and the pipeline skill's own text. This seat did not find the skill's file on disk and did not look further. Kickoff's own `CLAUDE.md` names the address too (its opening paragraph); that line changes in PR 9.
- **When and how.** At the release, not before (D10). In order: the release PR merges; the Pages run is green and the live header prints the new version; the PM seat hands Beni the exact replacement lines, which add `&lens=ledger`; Beni edits the owning copy. The edit is acknowledged by Beni, not inferred from a repo change, which is the cutover plan's own rule for an outside-repo edit (`docs/nextjs-migration-plan.md:378`). Because `&lens=ledger` works on v0.5.5 as well, a rollback of the app does not strand the new address.

---

## 7. The Next app and the cutover

### 7.1 What the Next preview inherits, and what it does not

- **Inherited through imports.** `web/app/shell.tsx:4-19` imports the header, tabs, lens switch, banner, boundary, `FixturesPage` and `TablePage` from `src/`. Whatever those import comes with them: the allowlist is a ceiling on what `web/` imports directly, and "transitive imports made by these modules are their own" (`web/src-allowlist.mjs:5-8`). So the books, rows and controls reach the Next app without an allowlist change unless `web/` imports one by name.
- **Inherited through the stylesheet.** `web/app/globals.css:20` imports `src/shell.css`; `web/scripts/write-shell-css.mjs` builds it into `web/generated/shell.css`, and `web/app/layout.tsx:10`, `:23` put it inline in the head. The `fb-` tokens therefore reach the Next app the moment they are in `src/shell.css`.
- **Not inherited: the class scan.** Every new component file goes into `web/app/globals.css:3-19` and `web/scripts/check-css.mjs:24`. This is the likeliest way for the Next app to drift from the Vite one, and `web/`'s `check:css` script is the test that catches it.
- **Not inherited: the shell.** `web/app/shell.tsx:61-84` repeats `App.tsx:55-87`: the wrapper, the header's props, the order of banner and page. PR 2 changes both and `offline.tsx:35-52`.
- **Not inherited: the head.** Fonts are linked in `index.html:11-16`, `offline.html:11-16` and `web/app/layout.tsx:20-22`. The theme's pre-paint script reaches Vite through `scripts/themeBootstrap.ts:25-34` and Next through `web/generated/theme-boot.txt` (`web/app/layout.tsx:9`, `:18`; built by `web/package.json:10`, `:13`). The motion control's pre-paint read goes through the same two doors.
- **Not inherited: static files.** `web/public/` holds real copies of the favicons, checked by `web/test/favicons.test.ts`. Fonts and photographs need one committed copy and a build step that places it for Next, in the manner of `write-shell-css.mjs`, so the binaries are not committed twice. The step's inputs go into `web/scripts/vercel-build-inputs.mjs`, or a preview will not rebuild when a photograph changes.
- **Server render.** "The next matchday" depends on the clock. The Next app renders with a request-time snapshot (`web/app/layout.tsx:13-14`, `:27`), and `tests/dom/requestClock.test.tsx` already covers that path. Canvases mount on the client only. The server's HTML is the motion-off still by construction (section 5).

### 7.2 What `web/`'s own CSS needs

Nothing for Fixtures and Table beyond the scan list. `web/app/moments/gallery.css` is untouched.

### 7.3 How D5's fence holds for Moments

- Moments takes the band and the tokens. In the Next app that is `MomentsRegion` under the shared shell (`web/app/shell.tsx:76`); in the Vite app it is `MomentsPage` (`App.tsx:71-78`).
- Moments' rules are scoped under `.moments-gallery`, asserted by `web/scripts/moments-css.mjs:23-31`, and read first-edition tokens. Those tokens stay defined with their values. That is the handoff's own rule: the `fb-` layer sits "beside the first edition's, never over it" (handoff §1).
- Moments' motion has its own allow-list and its own setting (`web/scripts/moments-css.mjs:37-66`; `web/app/moments/autoplay.ts:1`). The band's motion control is shown on Moments but governs nothing there in this release. That is a seam to state in the PR, not a bug: D7 says one control for the whole app and D5 says Moments takes nothing else.
- The `data-moments-background` attributes on the header, tabs and route (`AppHeader.tsx:12`, `TabNav.tsx:40`, `App.tsx:73`, `:80`) stay on the new band.
- Evidence: Moments' cells in the matrix differ from the baseline only inside the band's box.
- This is one reading of "the shell and the tokens". The other repaints Moments' ground and inks with the second edition's and leaves its layout alone. The `Moments` artboard on the canvas would settle it, and this seat did not see it (10.1, row 7).

### 7.4 The offline file

- `npm run build:offline` builds `offline.html` into one file (`vite.config.ts:22-35`; `package.json:14`); `build:single` does the same for the whole app (`package.json:13`). N0-Q2 kept the offline file (`vite.config.ts:12`).
- It ships the motion-off, no-photograph state (handoff §7; the review gives the reason, `docs/design-overhaul-review.md:383-384`: inlining adds a third to every asset). A cover without its file is the title block on flat black stock, with no ART caption and no sentence about photographs in the foot.
- No canvas code is in it. `scripts/scan-offline-bundle.ts:4-25` gains markers for a shader source, an inlined photograph and a font host, and `tests/offline-bundle-scan.test.ts:5` fails on each.
- Fonts are the one open point. Today the "offline" file links Google Fonts (`offline.html:11-16`), so it is not offline for type. If fonts are self-hosted (question 9), the offline and single files either inline the three preloaded faces or fall back to system faces. Recommended: inline Oswald, Plex Mono 500 and Caslon 400 only, and measure the file.

### 7.5 Re-baselining N7's parity proof

- The proof needs no new mechanism. It compares against a Vite build "at its merge-base" (`docs/nextjs-migration-plan.md:304`), so once the release is on `main` the reference is the second edition.
- Four lines of the cutover plan go stale and are amended in PR 9, by the PM seat: the matrix is 48 base cells, not 72, since the clearing; "no new animation" and "only D7 Moments and the Privacy foot may have deliberate visual deltas" (`:123`) apply from the release tag forward; "same font availability" (`:304`) is met by self-hosted files rather than by a network that happens to answer; and the fonts paragraph (`:294`) changes if question 9 is "Self".
- Parity is measured with motion off. A decorative layer is not repeatable frame for frame; the stills are. Motion gets its own receipt: the control, reduced motion, the flash gate.
- Ideas row 130 still stands: eleven proof scripts drive a retired lens or view (`docs/v0.2.6-ideas.md:164`). The general runner from PR 0 replaces the ones N7 would lean on.
- The privacy copy N5 will write has two new facts to carry: the motion control's key, and the font hosts (section 4).

---

## 8. Evidence per PR

### 8.1 The matrix

- **Base:** 3 tabs × 2 lenses × 2 themes × 360, 375, 390 and 1000 px = 48 cells in each app, 96 in both. That is the loop `web/scripts/clearing.mjs:53-55` already runs and asserts at `:103`.
- **Plus three weeks,** on Fixtures in both lenses and themes at 360, 390 and 1000: a heavy week, a quiet week and a UEFA week. `clearing.mjs:57` hard-codes `date=2026-11-21`. The snapshot is a rolling window (`2026-10-15` to `2027-04-13` at `9b0417e`, `src/data/meta.json`), so the runner should pick each week by rule from the committed snapshot: the first week with forty or more fixtures, the first with none, the first with a league-phase Champions League night.
- **Plus the states,** from the harness page, in both themes at 360 and 390: the handoff's A to M (handoff §6), and the ones it did not draw: AET, PENS, cancelled, the Table's unset and kicked-off cells, a filtered week with nothing left, the window's end, a cover with no photograph.
- **Every capture** sets the viewport first (`clearing.mjs:27`, and again at `:76`), asserts `scrollWidth === innerWidth` (`:60`) and an empty console (`:23-26`, `:69`), and keeps its PNGs and receipt outside the repo (`:1`).

### 8.2 What a script checks, and what needs a person

The runner is an extension of `web/scripts/clearing.mjs`, not a new start: same `puppeteer-core`, same two origins, same receipt file.

| Check | How | Who |
|---|---|---|
| Overflow at four widths | `scrollWidth === innerWidth`, per cell | Script |
| Console and page errors | as `clearing.mjs:23-26` | Script |
| Honesty rules | `npm test` in root and `web/`; the mutation receipts of 6.2 | Script, then the reviewer |
| Contrast on the rendered page | For each text element: read its computed colour, hide the text, capture, take the worst pixel inside the text's boxes, compute the ratio. Report the minimum per ink and ground. Floors: 4.5, and 3 for large text. Run on flat planes and over every photograph and scrim. | Script |
| Hit areas (H1, H2) | Every control's box is at least 44 × 44 px and no two overlap | Script |
| A hit area never covers a line of data (H4) | Look | Person |
| Reduced motion | Emulate the media feature; assert no canvas, no running decorative animation, and a Rack that has not moved after ten seconds | Script |
| The motion control | Press it; assert its state, its stored value, and after a reload its state in the first frame; assert two captures two seconds apart are identical | Script |
| The state budget | Every duration in the built CSS is 150, 180 or 220 ms or belongs to a named decorative keyframe on an allow-list, the way `web/scripts/moments-css.mjs:37-66` already checks Moments | Script |
| The flash gate (WCAG 2.3.1) | Section 5 | Script, numbers reported |
| Third-party requests | Intercept every request on a cold load; list the hosts | Script |
| Weight | Transfer size by type (fonts, images, script, style) on a cold load at 390 and 1000, per tab; the offline and single files' sizes | Script |
| The offline file | Open `dist-offline/index.html` from disk with the network off; run the Fixtures and Table cells | Script |
| The carousel with a screen reader | VoiceOver on iOS and macOS; TalkBack if a device is to hand | Person |
| Every photograph at full size | Rules 1 and 6; name and date into the record | Person (Beni) |
| The phone benchmark, the title swap, the cover's growth | Section 5 | Person, with the harness |
| WebKit | A real iPhone. The simulator on this Mac listed no usable iOS runtime on 14 Nov 2026 (this seat's saved note from the PR #320 review) | Person |
| The torch | A desktop pointer; it must not move on touch | Person |

### 8.3 What each PR owes

| PR | Matrix | States and weeks | Contrast | Motion | Weight | Offline |
|---|---|---|---|---|---|---|
| 0 | 96, unchanged from `main` | harness exists, old look | the sampler runs | — | baseline recorded | baseline |
| 1 | smoke | — | token pairs by test | — | fonts | — |
| 1b | 96, pixel-identical to PR 1 | weeks that hold a latin-ext character | — | — | fonts, per half | yes, both halves |
| 2 | 96 | — | band, banner, feet | the control | fonts | yes |
| 3 | 96 | all rows' states; three weeks | rows on pulp and typescript, both themes | reduced motion | — | yes |
| 4 | Table's 32, six leagues | Table states | Table | — | — | yes |
| 5 | 96 | three weeks; closed book | covers on flat black | reduced motion | — | yes |
| 6 | 96 | UEFA week | — | Rack stops; control; person's watch | — | — |
| 7 | 96 | all | over every photograph | — | images | yes |
| 8 | 96, motion off | — | torch pool | benchmark, flash gate, control | script | no canvas in it |
| 9 | 96 in both apps, at the release head | all | all | all | all | yes |

---

## 9. Questions for Beni

Eighteen. Each takes one word. The recommendation is the first word offered, except on the number, where none is made. Questions 3 to 6 are the handoff's own 3, 14, 15 and 16.

| # | Question | Answer with | Recommended, and why | What the other answer costs |
|---|---|---|---|---|
| 1 | **How does it reach the public site?** | Branch · Flag · Pieces | **Branch.** One public change, one moment for Step 0, one re-baseline for N7 (section 2). | *Flag:* two looks in `src/` and double evidence on every PR. *Pieces:* undrawn in-between states in public, and a gate that escalates every time. Branch itself costs a daily merge from `main` and one large release review. |
| 2 | **The split.** | Ten · Fewer | **Ten** (section 3). Each is reviewable alone and the honesty PRs stay small enough to break on purpose. | *Fewer* folds 5 into 6 and 7 into 8: two fewer review cycles, and two PRs too large to review cold. |
| 3 | **The wordmark** (handoff 3). | Oswald · Abril | **Oswald,** on cost only; the look is yours. Oswald is already preloaded. Abril would be fetched on the Ledger and the Table for one word, and it swaps in inside the fixed band, which is the shift ideas row 125 measured. | *Abril:* the templates draw it. It needs a preload of its own or a six-letter subset, and a measured layout-shift score. *Oswald:* the builder sets the band at a size no template shows. |
| 4 | **D14's record for the seven Pen-made photographs** (handoff 14). | Record · Regenerate | **Record,** with the model written as "not recorded". The provider and the verbatim prompts are in hand (handoff §7). | *Regenerate:* fal spend, a new full-size look at seven images, and covers that are no longer the ones you reviewed. *Record:* seven of ten records stay without a model for good. |
| 5 | **The two missing covers** (handoff 15). | Reuse · Generate | **Reuse** for this release: the second Champions League night takes the first night's plate, a domestic midweek takes the Friday cover. Covers are already keyed to the day type and reused (question 2 of the second edition, ruled). | *Generate:* fal credit, approved by you in the session that spends it, and a person's look, before PR 7 can merge. *Reuse:* two books in a UEFA week share a photograph. |
| 6 | **Will you look at the Friday cover and the fog plate at full size before PR 7 is briefed** (handoff 16)? | Yes · No | **Yes.** The rule is that a person looks at every image. The same look should check the fog plate's doorways for warm light (handoff §7). | *No:* PR 7 cannot merge with those two files. |
| 7 | **Where do the photographs live?** | Repo · Bucket | **Repo:** the shipped AVIF and WebP crops only, in one folder with its own licence file. The 6 to 7 MB sources stay out (section 4). | *Bucket:* a second host every reader's browser contacts, a line in the privacy copy, and a cover that fails when the bucket does. *Repo:* binaries in Git history for good. |
| 8 | **Under which licence?** | Notice · CC | **Notice:** a short file saying the photographs are generated, are not under the repository's MIT licence, and are not offered for reuse. It claims nothing about copyright that the record cannot support (section 4). This is not legal advice. | *CC:* a Creative Commons licence covers the human contribution, and the generated part may have nothing to license; Creative Commons itself points to CC0 for such output, which would give the photographs away (section 4). |
| 9 | **Fonts: self-hosted or Google's?** | Self · Google | **Self.** The handoff asks for it (§4). A reader's browser then contacts no font host, the offline file can carry its type, and parity stops depending on a network (7.5). | *Google:* no font files in the repo, and the privacy copy keeps its font paragraph. *Self:* nine files plus Inter for Moments, each with its `OFL.txt`, and one more thing to keep in step across two apps. |
| 10 | **When does Step 0 move to `&lens=ledger`?** | Release · Later | **Release:** in the same sitting as the release merge, once the live header shows the new version (6.3). | *Later:* any Step 0 between the merge and the edit opens the new Poster, where part of the week sits behind "more". |
| 11 | **Do ideas rows 126 and 129 fold in?** | Fold · Separate | **Fold.** Both strings are rewritten anyway: the function behind "1 MATCHES" loses its only consumer, and the empty state row 126 complains about is replaced. | *Separate:* a patch on `main` now, on text that the overhaul deletes, plus a conflict in the integration branch. |
| 12 | **The version number.** | Six · Patch · None | **No recommendation; the number is yours.** The overhaul is a minor by this repo's own usage: a new capability under one subject line. | *Six:* the overhaul is v0.6.0. The cutover, "planned as v0.6.0" (`CLAUDE.md`, "Roadmap pointers"), takes the next minor, and that line and the cutover plan are amended. *Patch:* v0.5.6 keeps v0.6.0 for the cutover, and calls a new look a patch, against the rule the repo has kept since v0.1.0. *None:* the overhaul lands as a non-release, like the full-stack work, and v0.6.0 at the cutover carries both; until then the provenance line prints v0.5.5 over the second edition, and `[Unreleased]` holds a release's worth of entries. |
| 13 | **A LIVE row gone stale: keep its last score or drop it?** | Keep · Drop | **Keep.** Today the row turns to KICKED OFF in amber and keeps the snapshot's score, and a test pins it (`tests/dom/designCycle.test.tsx:47`, the score at `:66`). | *Drop* follows the handoff's table ("KICKED OFF · no score shown") and changes a data-honesty assertion, which needs your word. The handoff's own specimen is a different case, a scheduled match past its kickoff, which rows do not mark today (1.7, row 13). |
| 14 | **The filter panel and Zones & key, opened** (gap 18). | Board · Tokens | **Board:** one short Claude Design pass before PR 3 is briefed. A competition chip filled with its hue is a tint, which the second edition forbids, so the tokens do not decide it. | *Tokens:* the builder keeps today's layout and swaps the inks; it may be redrawn after the designer sees it. |
| 15 | **A heavy day on the Poster: cycles and time-of-day rules?** | Drop · Keep | **Drop,** unless the canvas's Poster template shows them, which this seat could not check. The handoff says both clocks are on every row; a cycle puts the Brooklyn clock on a header and takes it off the rows (boards 06 and 16). | *Keep:* a new grouping rule, an exception to rule 3 that needs wording, and three more italic lines to approve. |
| 16 | **Titles: one per day type, or one that spells the day's count?** | Fixed · Counted | **Fixed.** "Twenty-Six Doors" on a 26-match Saturday (board 03) is a number set as a display title under the foil. Fixed titles keep every count on the date line, in Plex Mono, where rule 5 wants it. | *Counted:* a number-to-words rule, a title pattern for each of eleven slots, an answer for what the title says under a filter, and data-derived text inside an effect's surround. |
| 17 | **The words** (section 10's list). | Approve · Edit | **Approve,** after reading them. Every tagline, aside and caption on the boards is the imprint's fiction and none has been approved as copy for the public site. | *Edit:* say which; the list is numbered. |
| 18 | **When is a book closed, if one match of the day did not finish?** | Strict · Loose | **Strict:** a book closes only when every match of its day is FT, AET or PENS. A day with a postponed or abandoned match stays open, with that row in the alarm voice. No new words are needed and "FULL TIME" is never printed over a match that was not played. | *Loose:* the book closes once nothing is left to play, and its line needs new wording that you would have to approve. |

Four of the handoff's gaps are not questions yet, because each needs work before there is anything to answer: 18 is question 14; 19, 20 and 21 are settled by the methods in section 5, and the cover's growth ends with one word from you after you have watched it.

---

## 10. Risks, unknowns and Not verified

### 10.1 Risks and unknowns, each with the cheapest test that would settle it

| # | Risk or unknown | Cheapest test |
|---|---|---|
| 1 | **WebKit on a real phone.** Nothing in this plan, the handoff or the spike was run on one. The foil clip, the font swap in the band, the canvases and the eight-marker row at 360 are the likeliest to differ. | Open the integration branch's Vercel preview on an iPhone after PR 2 and again after PR 5. Ten minutes each. Whether that preview opens without a sign-in was not checked. |
| 2 | **Frame time on a phone.** No benchmark exists (handoff §8, "Not measured"). | The bench mode, 5.3. |
| 3 | **Page weight on a phone connection.** Fonts and photographs are unmeasured (handoff gap 20). | A cold load at 390 with the browser's network throttle gives a first number at a desk; the bench session gives the real one. |
| 4 | **Contrast over photographs.** The handoff's "worst case" ratios are floors only while every scrim under text is at least 90% opaque (handoff §2). | The sampler of 8.2 in PR 7, plus an assertion that every scrim under text computes to 0.9 or more. |
| 5 | **The first render.** The handoff says its artboards "were not rendered or screenshotted" and that frame heights and hit-area coordinates are estimates (§13). The build is the first time the second edition is laid out. | PR 2 and PR 5 report every measured figure beside the handoff's (118 px, 44 px rows, the 352 px marker row) and name each difference. |
| 6 | **The canvas was not read.** Whether the Poster template shows cycles, time-of-day rules or the opened book is unknown to this seat (1.7, row 9). | The PM seat opens the `Poster` and `Moments` artboards. |
| 7 | **What "the tokens" means for Moments (D5).** Section 7.3 reads it as: the band is the second edition's, and everything under `.moments-gallery` keeps the first edition's tokens and values. The other reading repaints Moments' ground and inks and leaves its layout. The `Moments` artboard would say which. | The same look at the canvas. |
| 8 | **Reserved font names** (4.2). | Read Inter's `OFL.txt`; then rename the two subset families, which costs nothing. |
| 9 | **The photographs' licence** (4.1). This plan is not legal advice. | Beni's answer to question 8; a lawyer's read if he wants one. |
| 10 | **Step 0 reads the Poster after the release.** Part of the week is then behind "more". | The edit at the release (6.3); the first Step 0 afterwards checks the Ledger's end-of-week count. |
| 11 | **Drift on the integration branch.** It falls behind `main` by data every day, and some tests audit the live snapshot. | Each brief starts with "merge `main`, then run the suite". |
| 12 | **The preview smoke's landmark** (`scripts/vercel-smoke.mjs:56`). | PR 0 moves it. |
| 13 | **The Next app's class scan.** `verify` runs `check:css` (`.github/workflows/ci.yml:47-48`), which pins the list of scanned files, so a file added to one list and not the other fails. A file added to neither passes and renders unstyled. | The matrix compares both apps cell by cell; a missing class shows as a difference. |
| 14 | **Previous and next buttons.** The W3C's carousel pattern asks for them in every case; the Rack has markers and a swipe (5.2). | The screen-reader pass in PR 6. |
| 15 | **Live WebGL contexts.** The caps are known from browser source only. | The runner counts live contexts and fails over four; one scroll of the whole Poster, twice, on the iPhone. |
| 16 | **Low Power Mode.** The governor will show stills on such a phone (5.3). That is accepted, but unseen. | Run the bench once with Low Power Mode on. |
| 17 | **Words that are true for one league only.** "Twenty names go in. Three are already falling." is wrong for an eighteen-club league and for the Champions League's thirty-six. | Question 17. |
| 18 | **The contrast helper reads two colour forms only** (`tests/contrast.ts:34`). A token written another way makes it throw. | Write the `fb-` tokens as hex or `rgb()`, or extend the helper in PR 1. |
| 19 | **Old proof scripts** find a fixture row by `button[aria-expanded]` (`web/scripts/clearing.mjs:71-73`) and drive retired lenses (ideas row 130). | The general runner in PR 0 replaces them. |
| 20 | **The offline file's size** with three faces inlined. | Measure it in PR 1. |
| 21 | **A patch from `main` during the build** would conflict in `CHANGELOG.md` and move the baseline. | Hold patches, or merge them into the branch the same day. |
| 22 | **The release PR is one large diff.** | Its review is of the sum (section 3, PR 9), against receipts from the nine before it. |

### 10.2 Not verified

- **No test was run by this seat.** `npm ci` was not run. The counts this plan could cite are the PM seat's at v0.5.5: 981 root tests and 122 in `web/` (`docs/design-overhaul-proposal.md:565`).
- **No page was rendered and nothing was measured.** No headless Chrome, no contrast figure, no weight, no frame time. The handoff's forty contrast ratios were not recomputed here.
- **Not read:** the Claude Design canvas; boards 02, 04, 08, 11 and 14; the lower halves of 05 and 12; most of 16; the `.glsl` files (listed only); the `.pen` file; the review and the two design prompts outside their decision and scope sections.
- **The honesty-test table** (6.1) was gathered by a search agent. This seat checked thirty-odd of its line numbers against the worktree and found none wrong; the rest are as reported in `evidence/02-honesty-tests.md`.
- **The vendor claims** were gathered by a second agent: 181 rows, 169 read at a primary page and 12 marked UNVERIFIED (`evidence/vendor-claims.md`). This seat did not re-fetch them. Those the plan leans on and marks UNVERIFIED: WebGL 2 support (not looked up); Inter's licence (not looked up); a size cap for static files on Vercel Hobby; that Black Forest Labs' terms reach output made through fal; who owns fal output; that Google logs addresses; an Apple page for the Low Power Mode throttle; a documentation page for WebGL context caps; and this plan's own reading of the font licence for subsets.
- **Not found:** the pipeline skill's file on disk.
- **Not known:** which phones Beni has; whether a Vercel preview opens on a phone without a sign-in; the sync's rate beyond the last seven days.

### 10.3 Deliberately not done

By the release, as this plan scopes it:

- **No corrected-result line.** Amber's sixth use needs a stored field, which is a change to the snapshot (1.7, row 12).
- **No pay-out board and no money figure** (D6).
- **No change to Moments below the band** (D5), **to the Table's structure** (D4), or **to the sync, the schema or any generated file.**
- **No new runtime dependency:** no animation, carousel or icon library, no three.js, no WebGPU.
- **No haptics.** The handoff permits a vibration on Android; it is one more behaviour to prove on a phone nobody in the loop holds.
- **No video loops** (the handoff calls them build assets only), **no paper texture or wear scan** (cut by the handoff), **no new or retouched photograph** unless question 5 is answered "Generate".
- **No N5 or N7 work,** and no privacy page; section 4.3 only says what that page must later carry.

By this plan: no code, branch, commit or PR; no build brief; no number; no file in the repo touched; the evidence stays outside the repo.

### 10.4 Every new user-facing string, for Beni's approval

**(E)** is in the app today, word for word. **(H)** is in the handoff. **(B)** is on a board only. **(N)** is needed and written nowhere. Titles, taglines and asides are the imprint's fiction; nothing else below is.

*The band and the feet*

1. (E) "Brooklyn · ET"
2. (E, set in caps) "v0.5.5 · 1482 fixtures · synced 2026-11-14 07:41 UTC", with the app's own numbers
3. (H) "Stop motion" / "Start motion"
4. (H) "Stop rotation" / "Start rotation"; (B) the hint "Tap to open · swipe" (board 03) or "Tap a cover to open it · swipe for the week" (board 19). One of the two.
5. (B) "FERGIE TIME BOOKS" and the catalogue number "FT-1120", from the date
6. (H) "ART · ILLUSTRATIVE" on a cover; "ILLUSTRATIVE" on a plate; (B) "ART & TITLE · ILLUSTRATIVE" on the quiet week
7. (B) Poster's foot: "Fixtures from the snapshot synced 2026-11-11 07:48 UTC. Times are Brooklyn unless marked local. Always verify in the book before staking." and "The cover and plates are generated photographs. Titles and taglines are ILLUSTRATIVE."
8. (B) The Table's foot: "Table read from ESPN's standings feed by npm run sync, never recomputed locally. Form and next fixture join to the fixtures snapshot." and "The cover is a generated photograph. The title and tagline are ILLUSTRATIVE." and "Zones & key, opened, reads: form runs oldest to newest. A dot is an empty slot: the snapshot holds fewer than five finished results for that club."
9. (B) The Ledger's foot: "Always verify in the book before staking." Board 10 also prints a sentence about ruling D10 and the betting pipeline's Step 0. **Recommended: do not ship that sentence;** it is a note to the designer, about a private workflow, on a public page.
10. (B) The quiet week's foot: "The photograph is generated."

*Covers*

11. (H) The date line: "FRI 20 NOV · 3 MATCHES · FIRST 2:30 PM ET"; "SUN 6 DEC · 22 MATCHES · FIRST KICKOFF NOT SET"; "SUN 8 NOV · 24 MATCHES · FULL TIME". (N) The singular, "1 MATCH", which rule 9 does not give.
12. (H) The band's count line: "+ 24 more, from 9:00 AM ET"; (B) "9 matches, from 12:45 PM ET"; (B) closed, "+ 22 more results"
13. (B) Titles: The Fifth Minute; Twenty-Six Doors; Sixteen Bells; Three After Dark; Nine Lamps; The Second Night; Thirty-Six Windows; The Five; Twenty Rooms; The Tower Counts; The Register; A Quiet Week; The Long Whistle. Question 16 decides whether a title may carry a count.
14. (B) Taglines, each with its title:
    - "The lights came back on in the ninety-fifth minute. So did something else."
    - "Sixteen bells rang for full time that Sunday. Nobody had hung the sixteenth."
    - "Three matches on a Monday. The week has not finished with you."
    - "Nine grounds lit at once, a continent apart. Something walks between them."
    - "Nine more. Whoever slept through Tuesday will not sleep now."
    - "Thirty-six windows lit across the map. Count them again. One is watching back."
    - "Five matches. The fifth minute is waiting in every one of them."
    - "Twenty rooms, and a clock in each that stops at ninety."
    - "Twenty bells this time. The tower has learned to count."
    - "Twenty names go in. Three are already falling." (true of a twenty-club league only)
    - "Twenty-four whistles blew, and every one was answered. You made it to morning."
    - Twenty-Six Doors' tagline is on board 09 at a size this seat could not read with confidence; it needs copying from the Pen file.
15. (B) The Register: "A FERGIE TIME BOOK · THE REGISTER"; (E) "As of matchday 10 of 38", the app's own line
16. (B) The quiet week: "NOV 9 – 15, 2026 · NO FIXTURES"; "Nothing to stake until Friday 20 November."; "A no-bet week is a successful outcome."; "Nothing on the rack this week"; "COMING NEXT"; "NEXT VOLUME ›"

*Parts, the shelf and "more"*

17. (B) "PART ONE", "PART TWO"; in an opened book, "THIS VOLUME" and the line back, "‹ Friday the 20th · 3 matches · in The Fifth Minute"
18. (H) "Twenty-two more stories · 22 MATCHES · SAT · SHOW"; (B) "HIDE" when open
19. (B) "ON THE SHELF THIS WEEK"; "NOW READING"; "FT-1120 · 3 MATCHES"; (H) "Next week · Mon 23 Nov · 3 matches"; (B) "MON 16 – THU 19 · no books this week"
20. (B) Asides: "Fifteen minutes between doors. The house likes them close."; "Five doors at once. Nobody can watch five doors."; "Three names at the foot of every register. The paper knows before they do."; "The typescript knows the ending. It was typed first."
21. (B) Only if question 15 is "Keep": "MORNING", "MIDDAY", "UNDER THE LIGHTS"; "At noon there are no shadows to warn you."; "The lamps come on before anyone asks for them."; "A CYCLE OF FIVE"

*Rows, states and controls*

22. (H) "20:30 local"; (E) "local time not known"; (H) "LOCAL TIME NOT KNOWN" on the Ledger
23. (E) The day note: "(Thu, prev. day)", "(Fri, next day)"
24. (E) "Sun 2026-12-06 — kickoff time not yet set by the league"; (B) the count line "10 kickoffs, times not yet set by the league"
25. (E, without its emoji) "19 hidden by filters"
26. Pills: (H) NEXT; (E) LIVE, KICKED OFF, FT, AET, PENS, POSTPONED, CANCELLED, SUSPENDED, ABANDONED
27. (E) "TBC" on a NEXT UP card; (E) "Today", "Tomorrow", "8 days" as its countdown
28. (B) "NEXT UP"; "MON 16 · TUE 17 · WED 18 · THU 19 — NO FIXTURES"; "END OF WEEK · 45 FIXTURES · FRI 3 · SAT 26 · SUN 16"
29. (H) "Today"; "Filters · all 14", "Filters · 14", "3 of 14"
30. (E) The three matchday lines and the two staleness sentences, unchanged
31. (E) "2 clubs have a game in hand — sort by PPG to compare like with like."; (B) "ATH 11 PLAYED · RAY 11 PLAYED · 18 CLUBS 12 PLAYED"; (B) "ZONES & KEY"
32. (H) The Rack's spoken names: "Sixteen Bells, Sunday 22 November, 3 of 4"; "The Register, Premier League table"
33. (N) What the Rack and NEXT UP say when nothing is ahead in the snapshot, and when the filters hide everything. Today both say "No upcoming fixtures match your filters." in either case (ideas row 126).
34. (N) The theme button's spoken name, now that it has no visible words
35. (N) The photographs' licence notice (question 8), and the one line each in `LICENSE` and the README

### 10.5 Where the sources disagree

Beni's rulings come first, then the Claude Design boards, then the handoff, then the build spec. The handoff ranks itself above the boards (its "Spec precedence"); the repo's rule and the proposal put the boards first (`docs/design-overhaul-proposal.md:399-402`). This seat saw the handoff and the Pen exports, not the canvas, so each line below says which it followed.

| # | Disagreement | Followed |
|---|---|---|
| a | Pen boards print "20:30 CET" and "GMT+5"; the ruling is "20:30 local" | The ruling (handoff §5, §11 question 11) |
| b | Board 10 has a Plex Mono wordmark on the Ledger; the handoff draws one face on every lens | Open, question 3 |
| c | Board 18 draws LIVE in pitch and scores in ink; the handoff sets LIVE in the alarm voice and scores in pitch | The handoff (§1). The app already sets scores in pitch (`FixtureRow.tsx:69`). |
| d | Board 01 says amber has three uses | The ruling: eight |
| e | Boards 06 and 16 draw cycles and time-of-day rules; the handoff's rows carry both clocks and "more" opens ordinary rows | Open, question 15 |
| f | The handoff says the overhaul "follows the Next.js cutover" (§12) | Beni's revamp-first ruling of 14 Nov, as the brief states it |
| g | The handoff's KICKED OFF shows no score; the app keeps a stale LIVE row's score, by test | Open, question 13 |
| h | The handoff gives the motion control a changing label and `aria-pressed`; the W3C's patterns allow one or the other | The W3C pattern, to be noted in PR 2 (5.2) |
| i | The handoff says focus is "the browser's ring"; the app has a measured ring | The app's, so the measurement is kept (1.7, row 16) |
| j | The app sets an out-of-window matchday line in italic, by test; the handoff sets all three forms in one face | The handoff; the assertion moves to the amber voice (6.2) |
| k | The handoff says WebGL; the proposal says WebGL2 | The builder's choice, reported (5.2) |
| l | "Jump to today" in the app and in main's smoke; "Today" in the handoff | The handoff, after PR 0 moves the landmark |
| m | The brief and `CLAUDE.md` name `src/index.css` as the token source; the tokens are in `src/shell.css` | The repo |
| n | The brief says Step 0 reads the live site; the owning copy names `http://localhost:5173/` | The owning copy; both change at a merge to `main` |
| o | The handoff asks for Latin subsets of every family; two families reserve their names | The licence text (4.2) |

---

*End of the plan. Written section by section and saved after each; all ten sections are present. The worktree at `/Users/benicheni/kickoff-overhaul-plan-tree` is removed when this file is closed.*

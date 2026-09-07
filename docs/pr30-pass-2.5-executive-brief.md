# Executive Summary Brief — PR #30 · Pass 2.5 · Mon 7 Sep 2026 (TZ=America/New_York)

Archived by the Pass 2.5 (synthesis) session of the six-pass 360 cycle. PR-based filename because no release number is presumed on the branch; the number is Beni's. Every number below was produced by a command run in this session against head `cc143b3a7ac090e34675ad5c355c4d35454cd341`; a number attributed to a vendor is that vendor's claim.

**Decision: escalated** — the merge is yours; the handoff block is at the end. Why: `--no-merge` was given, and the gate's "nothing still contested between the vendors" clause fails on one label (item 5's severity: medium vs low) and one end-state (underway-first as the permanent layout). Neither touches the code that ships. Every other clause holds: not a release (no bump, no new `CHANGELOG.md` section, no tag to follow); no numbering presumed on the branch; every high finding has a fix commit; `verify` green at the head (run 34153646630); no change to the `?only=` / `&date=` contract, to `sync.yml`'s gates, or to `src/data/*.json`.

## What ships

- The Table's NEXT lane tells the time the way every other lens does. A fixture whose league-set kickoff has passed while the snapshot still says `scheduled` shows as **KICKED OFF** — v0.3.0's word for "kicked off, outcome unknown to this snapshot" — never as an upcoming kickoff time. On 7 Sep the shipped app said `NEXT · Mon · CEL (H) · 1:00 PM EDT` for Getafe through the whole of Getafe–Celta; the branch says `Mon · CEL (H) / KICKED OFF`.
- Opponent and state on a Table row always describe one fixture, in all three layouts (desktop lane, collapsed mobile row, expanded mobile card) and in the row's accessible name (`Kicked off: CEL H`). Codex's build had put Sunday's opponent over Monday's marker.
- The club's *most recent* kicked-off fixture is the one shown. A `scheduled` row a sync outage left behind weeks ago cannot hide today's match.
- A TBC placeholder retires by its Brooklyn calendar date, never its UTC one; the pure layer never reads the system clock by default.
- The app still refuses to claim what the snapshot does not know: no LIVE badge, no minute, no score, no finished/unfinished verdict.

## Where it sits

No version is presumed: the entry sits under `CHANGELOG.md` `[Unreleased]` with #28 and #29, already written in the section's product voice at `cc143b3`. If released, this is patch-shaped under `CLAUDE.md` "Release management" — fixes, no new user-visible capability — and both vendors and Beni's stated fallback name **v0.3.1**. The public roadmap is unmoved: **v0.4.0 remains the sync theme** by Beni's 6 Sep ruling, and a minor here would have to be v0.4.0 and push sync to v0.5.0, a renumbering only Beni can make. Candidate scope for the same patch, from `docs/v0.2.6-ideas.md`: row 28 (new — the sync's own verify step fails during live matches), row 26 (what the NEXT lane shows mid-match — "Both"), row 25 (the Fixtures lens's third state, designer-owned).

## What the 360 found

| # | Pass 1 (Claude, cold) | Pass 2 (Codex, rebuttal) | Pass 2.5 (this session, independently) | Evidence re-run here | Sev | Fix |
|---|---|---|---|---|---|---|
| 1 | Render precedence `next ?? underway` put Sunday's opponent over Monday's KICKED OFF | Accept | Confirmed. | DOM test red with `7a4feed`'s two files (first post-kickoff assertion), green at head; 48 browser cells + 18 expanded cards show `Mon · CEL (H)` with the marker and never `DEP`. | high | `40eec07` |
| 2 | `underway` took the oldest kicked-off row; a stale row hides today's match | Accept | Confirmed, latent. | `tsx` probe: stale 17 Aug + current 7 Sep at 17:40Z → `underway=CurOpp`; test red at `7a4feed`; browser stub (ghost row 17 Aug) → lane still `CEL` at 390/1000 × light/dark. | high, latent | `f37c2c7` |
| 3 | UTC-midnight date floor admits a Brooklyn-yesterday placeholder as next | Accept | Confirmed, latent. | Probe: `round_placeholder` 02:00Z → Monday `next=null`, Sunday `next=PH`; test red at `7a4feed`; browser stub (Barcelona placeholder) → lane still `Sun · LEV (A)` at 390/1000 × light/dark. | medium, latent | `f37c2c7` |
| 4 | Aria said "in-progress", named the other fixture | Accept | Confirmed. | Label `Kicked off: CEL H` in all 18 mobile cells; card heading "Current league match" unchanged (Beni's item 1). | medium | `40eec07` |
| 5 | `nowUtcIso = new Date().toISOString()` default beside "never read internally" | Accept the fix; contest severity (low) | Facts converge: one app caller and fourteen test call sites all pass the instant; the doc comment was false; the default is gone. Label: `pr-comment.md` puts "a wrong or stale claim" at medium and "a comment that overclaims" at low, and SKILL §3's Clock class names default-argument clock reads as a checked hazard. Recorded **medium by class, no runtime defect demonstrated**. Does not touch the gate. | Read `standings.ts:83` at `7a4feed`; `git grep tableFor(` at head. | medium / low (label) | `f37c2c7` |
| 6 | Two mis-indented lines; no formatter in CI | Accept | Confirmed fixed; `ci.yml` runs typecheck, test, build only. | Read. | low | `f37c2c7`, `40eec07`; row 27 |
| 7 | DOM test vacuous (`if (!wasUnderway)`, one fixture) | Accept | Confirmed; the rewritten test is one of the three red at `7a4feed`. | Red-then-green. | low | `40eec07` |
| A | `underway` does not expire (mirrors FixtureRow's KICKED OFF) | Accept | Accept. Probe: 6 Sep fixture still `underway` on 8 Sep and 20 Sep; `believablyLive` true at +1 h, false at +5 h (4 h window); `hasKickedOff(in_play) = false`. **Unanimous**, and Beni's stated fallback agrees. | Probe + test "keeps a kicked-off fixture underway until the snapshot resolves it". | decision | `f37c2c7` |
| B | Underway-first in every layout | Accept as interim; contest as permanent; prefer Both, next first | Accept as the interim invariant — it is the fix. The permanent layout is a product call (row 26); Claude's position: **ship #30 with underway-first now, design Both after** with a design pass, implementation, tests and a fresh review. Codex's own condition ("Both only if its design and verification finish before release") says the same. **Converged on the path; the end state is Beni's.** | 48 cells: `Sun · DEP (H)` absent everywhere after kickoff. | decision | `40eec07` |

Killed by Pass 1, re-tried here, still dead: marker overflow — 57 px in the 120 px lane, line 2 `scrollWidth ≤ clientWidth`; card block 328/343/358 px inside 332/347/362 at 360/375/390.

## Verification as re-run

- Head `cc143b3`, base `f649f27` (unmoved since the PR opened), MERGEABLE / CLEAN, `verify` success (run 34153646630, `pull_request`, 18:56–18:57Z). Codex added no commits in Round 2 (four commits on the branch, as it said).
- `npm run typecheck` clean; `npm test` **343 tests / 27 files**; `npm run build` green (pre-existing chunk-size warning); `npm run build:single` green (`dist-single/index.html` 752.19 kB, gzip 136.26 kB). Diff vs `origin/main`: 8 files, +398 / −48.
- Red-then-green: with `7a4feed`'s `standings.ts` and `TablePage.tsx` under the head's tests, **3 failed / 13 passed** across 2 files (most-recent-kicked-off, placeholder floor, the DOM test); the head's files, 16 / 16. Working tree clean after.
- Fixed instants on the branch's own snapshot: 16:00Z `next=CEL 09-07, underway=—`; 17:00:00.000Z, 17:40Z, 20:00Z, 08 Sep 03:30Z `next=DEP 09-13, underway=CEL 09-07`. Boundary at 16:59:59.999Z / 17:00:00.000Z / 17:00:00.001Z: still-to-kick-off true/false/false, kicked-off false/true/true.
- Browser: port 5174 served by this worktree at the head (`lsof` → pid → cwd), 5173 free, one tab of my own, viewport set before every read, theme storage cleared after. **48 cells** — 3 lenses × 2 tabs × 2 themes × 360/375/390/1000 — with `data-theme` confirmed per cell and `document.documentElement.scrollWidth === window.innerWidth` on all 48. **18 expanded mobile Table cells**: card `CURRENT LEAGUE MATCH / vs Celta Vigo · Mon / KICKED OFF`, no Deportivo, no 🗽, block `scrollWidth === clientWidth`, page still unscrolled. Desktop at 1000: lane `Mon · CEL (H) / KICKED OFF`, marker 57 px in the 120 px lane, mono advance 5.7 px at 9.5 px (Codex's arithmetic basis), grid columns sum 773 px in a 740 px container — pre-existing, in-table scroll, no page overflow. Contrast from computed rgb: light `rgb(138,95,0)` on surface 5.65:1 and on surface-alt 4.69:1; dark `rgb(247,201,72)` 9.71:1 and 8.68:1. **8 synthetic cells** (stale ghost row; Sunday-evening placeholder; 390 and 1000; light and dark) with a positive control — the served `fixtures.ts` module held 1009 rows including both stub ids, and the ghost row rendered in the 17 Aug week — then the stub reverted and the tree confirmed clean. The Fixtures-tab row for the same match reads `1:00 PM · Getafe vs Celta Vigo`, no pill, three hours after kickoff (row 25, confirmed in the browser).
- A first 24-cell attempt is discarded: its theme toggle never fired (the finder matched an aria-label the button does not carry); the tell was identical marker colours across the "two" themes. The 48 above replaced it.
- **Not re-run:** Codex's 36 synthetic browser cases at that count (8 run here; the two scenario shapes are corroborated); sampled-pixel contrast (computed rgb only; the 4.69:1 hover pair is above the 0.05 margin where v0.3.0 says to sample); the deployed Pages build.

## Risks and accepted costs

- **Underway-first hides the club's genuine next fixture** for the match's duration plus however long the snapshot stays unresolved. Step 0 exposure: a reader looking for Sunday's kickoff in Monday afternoon's NEXT column does not find it there; the Fixtures tab still lists it. Row 26.
- **`underway` never expires** (Decision A). Under a dead sync, `Mon · CEL (H) / KICKED OFF` would still read the following Monday, and the lane shows a weekday, not a date. The staleness banner is the signal for that condition, as it is for FixtureRow's KICKED OFF.
- **Found outside this PR, reproduced, urgent:** `tests/dom/designCycle.test.tsx` mutates one snapshot fixture to `in_play` and asserts with an unscoped `getByText('LIVE')`; a snapshot that already holds a live match renders two pills and the query throws. `sync.yml`'s "Verify the written snapshot" step runs `npm test` on the freshly fetched snapshot, so the 20:00Z scheduled sync (run 34157750491) fetched cleanly (`report: changed=true changes=4 urgent=4 … merge=hold`) and then went red — six tests, no commit, no PR. It is the first failure in the 39 `sync.yml` runs GitHub lists (38 successes), and it recurs on every cron slot that coincides with a live match — most weekend slots. `main`'s snapshot is still 00:02Z; **production Pages at `f649f27` therefore still shows the original bug** (`NEXT · 1:00 PM EDT` for a match that ended around 18:50Z). Merging #30 makes that stale row honest (KICKED OFF) before the data catches up; freshness returns when a sync lands during a slot with no live match, or when row 28 is fixed. Reproduced here without the sync: one `scheduled` row set to `in_play` in an uncommitted copy of `src/data/fixtures.json`, `npx vitest run tests/dom/designCycle.test.tsx` → 6 failed / 3 passed, reverted. `../Sportsbooks/CLAUDE.md`'s "check the sync run succeeded before trusting the app" now has its first live case.
- Pre-existing: the desktop grid's 773 px minimum inside a 740 px container at 1000 px (in-table scroll). Any "Both" design widens the lane and must clear this first.

## Handed to the designer / the next patch

- Row 25 — the Fixtures lens's third state for `scheduled` rows past kickoff (designer; `hasKickedOff` is the selector). Confirmed in the browser at the head.
- Row 26 — what the NEXT lane shows mid-match; "Both, next first" is both vendors' preferred end state; needs a design pass against the 773-in-740 grid, implementation, regression coverage and a fresh review.
- Row 27 — a formatter, or a stated decision not to have one.
- Row 28 — `designCycle.test.tsx`'s unscoped LIVE query blocks the sync during live matches; one-file hotfix with the reproduction above.

## Questions for the CEO

Each answerable in one word. Your stated fallbacks travel beside each; both vendors' positions are named.

1. **Card copy** — "Kicked off" for the expanded card's heading (both vendors; your fallback). Aria follows for parity; Codex proposes the fuller `Kicked off: Celta Vigo at home, 7 September 2026`, Claude accepts either form that mirrors the card's own text. *One word: keep / Kicked off.*
2. **Layout** — ship underway-first now and design "Both" after (both vendors), or hold #30 for Both. *One word: now / hold.*
3. **Number** — v0.3.1 patch (both vendors; your fallback), with v0.4.0 untouched. Timing is the real question: cut v0.3.1 from this PR, or merge as `[Unreleased]` now and cut v0.3.1 once row 28 lands beside it. Claude recommends the second: production is showing the original bug on stale data, and one patch that lets both the app and the sync survive a live match reads better than two. *One word: release / unreleased.*
4. **Decisions A and B** — A unanimous; B unanimous as interim. *One word: accept.*
5. **Item 5's label** — medium by class, no runtime defect; retiring the last contested row. *One word: recorded.*

## Handoff block

See `docs/pr30-pass-3-adjudication-prompt.md` for the full paste-ready Pass 3 prompt, including the executable non-release and release paths, the squash title and body with both trailers, the PR-body update, the row-28 hotfix task, and the closure evidence.

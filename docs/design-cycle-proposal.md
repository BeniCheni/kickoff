# Design cycle — honest snapshot states and readable status colors

Implementation spec of record, 6 Sep 2026, amended by Pass 2 below. Beni approved v0.3.0;
the design project's v0.2.6 label is a cycle name, not a release-number decision.

## Ground truth and precedence

Read the complete design spec, KickoffRow reference, token CSS and `github.md` screen map
from `../Kickoff v0.2.6 Design Cycle/` before implementation. Precedence is **design spec >
`docs/design-cycle-brief.md` > implementation request**. The row canvas supplies geometry
and lens deltas, not React code to port.

- `Kickoff v0.2.6 - Design cycle spec.dc.html` SHA-256:
  `b14f902e7a1d2404554ba4fb51f33a3cadbfa4e3de8ced07120b62873223aacd`.
- `KickoffRow.dc.html` SHA-256:
  `6da68c06da73caef8c48d32f31a0119bcba8748b373f1b03687c7161bfdfc2d5`.
- Fresh `origin/main` was `272804d`, after `e6ab866` and sync PR #22. Package and latest
  annotated tag agree at 0.2.5. The merged snapshot is now `2026-09-05T23:59:27.066Z`,
  1007 fixtures: 876 scheduled, 131 full_time, **zero in_play**, 437 round placeholders.
  Window: 2026-08-06 through 2027-02-02. No snapshot file changes in this implementation.
- The shared checkout was on **main**, not the branch named in the request. Its wanted
  CLAUDE paragraph and untracked brief were copied into the isolated
  `codex/design-cycle-honesty` worktree, based on fresh `origin/main`. The shared branch,
  edit, and untracked `Claude outputs/` were left alone.

## Scope and behavior

- **`docs/v0.2.6-ideas.md` row 8:** an in_play fixture remains LIVE through exactly
  `LIVE_WINDOW_MS`; after it, the row says **KICKED OFF** in a hollow amber pill. Its
  1px border replaces the filled pill's 1px vertical padding. All three lenses share
  those classes. Stored status, score, rail, metadata and expansion are unchanged.
- **`docs/v0.2.6-ideas.md` row 9:** muted text is `#646c61` light / `#8a9c8e` dark.
  `--floodlight-strong` is `#8a5f00` light / base floodlight dark.
  `--accent-strong` is `#b4431e` light / base accent dark. All explicit floodlight/accent
  **text** classes consume their strong variants. Ledger/Poster LIVE fills use accent-strong;
  Broadcast LIVE keeps floodlight. Base accent/floodlight fills and competition hexes stay put.
- **`docs/v0.2.6-ideas.md` row 10, marquee states only:** choose NEXT by the earliest
  eligible Brooklyn date, including today's placeholders even after their filler instant.
  An exact time retires at kickoff; a placeholder retires at Brooklyn midnight. On an
  all-placeholder date, one fixture names its teams, several say “N kickoffs, times not
  yet set by the league.” Both use a real date and italic amber TBC in the time slot.
  A mixed date selects its earliest exact kickoff and appends “· +N TBC”. The ticker
  still reads the whole snapshot. The marquee and glow share `nextMatchdaySelection`;
  only its exact fixture can glow, so an all-TBC first date has no next-kickoff glow.
- If **NEXT is empty**, emit its own segment with
  “NEXT — nothing scheduled in this snapshot · window ends {posterDayTitle(META.window.to)}”.
  Keep existing LIVE/FT alongside it. When empty NEXT is the only segment, render statically
  with no animated class, duplicate track or pause button; results still use the moving track.
  The static line is focusable and horizontally pannable on narrow screens. `inline-block`
  retains the same 39px line box as the moving strip, so subsequent content does not move.

The original brief is retained as the cycle's historical input, with a prominent supersession
notice. It is useful evidence of what the designer corrected; deleting it would erase that
context. STATUS_LABEL still has five stored entries (POSTPONED and CANCELLED spelled out),
the old fill belongs to the pill, the ticker is unfiltered, and Poster focus-ring debt does
not reproduce. No ticker speed or general reduced-motion-control redesign is inferred from
that brief.

## Decisions and reasoning

1. **Time reaches the row as a `stale` prop.** `staleLiveIds` is beside `believablyLive` in
   `lensSelectors.ts`, and selects `in_play && !believablyLive(...)`. There is one threshold
   constant and no second duration. WeekView and MonthView use the existing `useNow` clock;
   LedgerWeek and PosterWeek forward the set. FixtureRow stays clock-free and takes no lens prop.
2. **Keep the score pitch.** The snapshot's number is retained; the pill says why it is not
   a claim about the current result. A second amber element would dilute the status cue.
3. **No second sync-age line.** The existing 24h/72h banner owns snapshot age; an extra line
   would add noise to lists already carrying 437 placeholder explanations.
4. **Fix both residual pill debts.** FT uses text-secondary over its existing border fill.
   POSTPONED becomes hollow in accent-strong; CANCELLED follows the existing shared unsettled
   family so it does not retain the same failing tint. These are intentionally two additional
   status-family adjustments. Their borders replace vertical padding, as for KICKED OFF.
5. **Deepen accent-strong one further step.** The complete `text-accent` inventory is
   FixtureRow's unsettled pill, StalenessBanner's 72h alarm, and TablePage's negative rank
   movement and negative goal difference. The Table values sit on surface normally and
   **surface-alt on desktop hover**. `#bd4720` is 4.27:1 there; `#b4431e` reaches 4.64:1
   and carries white LIVE text at 5.58:1. There is another backdrop distinction: the actual
   72h banner uses accent/10 over bg, not floodlight-bg. The chosen value clears that at
   4.55:1. Base accent stays unchanged, preserving rails, relegation bands and tints.
6. **Numbering approved by Beni: v0.3.0.** The `Added` states and marquee behavior are new
   user-visible capabilities under one honesty subject. The reserved sync theme becomes
   v0.4.0. Package/lock, CHANGELOG and README move together; historical released sections
   and cycle filenames stay as written, superseded forward. The annotated tag and squash
   remain Beni's acts at merge.
7. **Carry the wanted CLAUDE edit in this PR**, so it lands through the same reviewed branch.
   Reword both live hold-reason lists: current standings failures abort before reports or
   PR changes; `standings=failed` remains only a legacy defensive policy input.
8. **`docs/v0.2.6-ideas.md` row 15 is deferred with a trigger.** Record Beni's 5 Sep
   adjudication and the procedural owner in `../Sportsbooks/CLAUDE.md`. The historical
   basis was 30 runs since 1 Sep with zero failures, not a freshly counted claim. Reopen
   when observed failures make the procedural reader inadequate. The first failure prompts
   a rate and operational-burden review; no numeric rate threshold has been approved.
9. **Mirror the implemented tokens locally.** Updated only `tokens/colors.css` and
   `tokens/tokens.json` in `../Fergie Time Design System/`. The historical cycle export is
   preserved. `docs/design-cycle-token-mirror.patch` records the exact two-file mirror diff;
   the local-only DS folder is not committed into Kickoff.

## Contrast evidence

See `docs/design-cycle-contrast.md` for every foreground/background pair, independent
reproduction of the old and proposed values, and browser confirmation. The permanent
`tests/contrast.test.ts` asserts unrounded ratios from the actual CSS token source;
`tests/contrast.ts` keeps alpha composites fractional until luminance calculation.

## Verification evidence — implementation at `9445671` (historical)

- Node 24.15.0. `npm run typecheck`, `npm test`: 25 files, 316 tests pass. Normal and
  single-file production builds pass. The normal build retains Vite's bundle-size warning.
- Selector tests pin LIVE_WINDOW_MS − 1ms, exactly LIVE_WINDOW_MS, and +1ms; each checks
  the complement, ticker membership, hot-row membership and unmodified stored status.
  Other stored statuses never become stale LIVE. DOM tests drive the real parent wiring
  through WeekView (all three lenses) and MonthView using in-memory illustrative statuses.
- DOM and selector tests cover single/multiple TBC, mixed dates, shuffled inputs, a filler
  instant already passed today, Brooklyn midnight, omitted cancelled/postponed candidates,
  no-segment snapshots, and preservation of LIVE/FT without a NEXT (superseded by Pass 2).
- **Production matrix:** 48 lens × theme × Fixtures/Table × width cells at
  360/375/390/1000px, plus 24 Monthly checks and captures. Viewport set first; exact
  `document.documentElement.scrollWidth === innerWidth` before every screenshot; zero
  console errors. Monthly captures scroll past the long Poster hero to the calendar.
- **Synthetic stale matrix:** 24 lens × theme × width cells. Read LIVE at the boundary,
  the unchanged minute-floored clock at +1ms, then KICKED OFF at the next minute.
  Both pills measure 15.5px high; stale backgrounds are transparent and no row glows.
  The browser changes only in-memory fixtures. Every injected status/score is illustrative.
- **Empty strip:** eight theme × width transitions assert node identity, 39px height and
  identical next-element top before/after the final scheduled kickoff. Keyboard ArrowRight
  pans the static copy at 360px without a pause control. No track or pause
  button; repeated under reduced motion after a forced screenshot/rendering opportunity.
- **Approximate NEXT:** 24 synthetic single/multiple/mixed × theme × width cells. Italic
  TBC and date/count grammar pass; an explicitly empty `only=` confirms the ticker still reads all fixtures.
- **Computed contrast:** 2,238 readings over 12 production surfaces including Table hover;
  lowest checked full-opacity semantic text ratio 4.52:1. This is scoped evidence, not an
  app-wide AA certification. Competition colors and dimmed inactive calendar cells are outside it.
- Local driver scripts, JSON receipts, screenshots and contact sheets are retained under
  `/tmp/kickoff-design-qa/`; they are not remote PR attachments. Reproduce with a private
  Chrome profile, the checked-out dev/preview servers, fixed clocks and the cases above.
  Clock shims capture the real clock before installation and compute every target offset
  from that original value; no offset is calculated from an already shifted Date.now().

## Accepted costs / deliberately not done

- The minute clock is unchanged. Pure selection flips at +1ms, but a mounted app displays
  it on the first minute tick strictly past four hours (or a catch-up after that tick).
  There is no second timer, invented match minute or automatic full-time status.
- KICKED OFF keeps the snapshot score without an extra age line. Hollow POSTPONED/CANCELLED
  extends the hollow grammar to the existing unsettled family. No FT claim is fabricated.
  The hollow shape widened from “the app declines to assert” to “unresolved or terminal”
  when CANCELLED joined it because the 15% tint still read 4.29:1 with the new token; the
  alternative was a third treatment for CANCELLED, and the labels differ so the states are
  not distinguished by hue alone.
- Muted text has less visual separation from secondary; dark metadata is brighter.
  Broadcast light's leading text/focus accent deepens with floodlight-strong. LIVE's orange
  fill deepens beyond the designer's initial value to clear the actual backgrounds.
- Empty copy is one static line: narrow screens require horizontal panning to read its
  window end. This preserves strip height and exposes the full copy to keyboard and AT.
- Ticker duration remains 36 seconds, independent of content width. The existing nonempty
  reduced-motion track's inert pause control remains open under `docs/v0.2.6-ideas.md`
  row 10; only the new empty state's no-control rule is implemented here.
- Ticker filters remain independent of Next-up/Tonight's slate. Placeholder rows never
  glow, and a later exact date cannot outrank an earlier all-TBC date for the glow.
- Competition hex text debts remain a separate DS pass (`docs/v0.2.6-ideas.md` row 9,
  remaining competition-color portion). FixtureRow's em-dash-to-TBC migration stays deferred.
- No work from `docs/v0.2.6-ideas.md` rows 1–7 or 11–14; no provider, sync-boundary,
  auto-merge, dependency, package-manager or deployment changes. The failure reader remains
  procedural until `docs/v0.2.6-ideas.md` row 15's trigger warrants product work.
- No merge or tag. Beni approved the number and hollow-pill disposition; both review passes
  are recorded below. The designer owns the hollow-family follow-up in `docs/v0.2.6-ideas.md` row 23.

## Review resolutions — Pass 1 (Claude Code cold review of PR #26, 6 Sep 2026)

Recorded here because the spec of record carries a review's resolutions and accepted costs;
the PR comment carries the evidence. Pass 2 (Codex's rebuttal) and Beni's adjudication follow.

- **Precedence, recognised as resolved by this build.** The design spec's `--accent-strong`
  `#bd4720` measures 4.27:1 on light surface-alt (the Table's desktop hover ground) and 4.19:1
  on the 72h banner's actual accent/10-over-bg ground; the built `#b4431e` clears both (4.64
  and 4.55 unrounded; 4.53 against the rendered pixel). AA on the actual ground wins over the
  template's literal — the repo's own precedent (`src/index.css`, Broadcast light). Recomputed
  independently in the review; `tests/contrast.test.ts` goes red on the spec's value.
- **Precedence, extended beyond the spec's offer.** The spec offered a hollow POSTPONED and
  kept CANCELLED in the tinted "alarm at low volume" shape; this build hollows both so
  CANCELLED does not keep the failing 15% tint (4.29:1 even with the new token). The hollow
  shape now covers two unresolved states (KICKED OFF, POSTPONED) and a resolved one
  (CANCELLED); the labels differ, so the states are not distinguished by hue alone. Left as
  built; the shape grammar is the designer's to reopen.
- **Deferred to adjudication, not changed by the review.** (1) The empty-state gate is
  `segments.length === 0`, while the spec defines the state on NEXT alone ("no scheduled
  fixture after now, exact or placeholder"): on a day carrying LIVE or FT segments with nothing
  scheduled after, the strip renders those segments and no `window ends …` provenance. The
  build's own test pins that reading; `docs/v0.2.6-ideas.md` row 18 holds the alternative.
  (2) `tickerSegments` resolves NEXT within the first eligible Brooklyn date while
  `hotFixtureIds` resolves it across all fixtures, so an all-placeholder earliest date makes
  the marquee and the Broadcast glow name different fixtures on one screen — the accepted cost
  above, reproduced in the browser; `docs/v0.2.6-ideas.md` row 19.
- **Fixed by the review on the branch.** The empty strip's focusable line is
  `role="region"` named "Ticker" (Chrome's accessibility tree exposed a focusable generic with
  an empty name). `tests/dom/designCycle.test.tsx` restores fixtures by deleting the keys a
  test added before `Object.assign`, and selects the Month cell by the fixture's own date
  rather than the month's first match-day.
- **The reworded `standings=failed` text is accurate.** `prepareStandings` throws through
  `runSync` to exit 2 before any report line; `mergeVerdict` keeps the value as a defensive
  input; `sync.yml`'s regex still accepts it. The workflow's own header comment, its warning
  branch and `mergeVerdict`'s doc comment still describe the retired soft failure —
  `docs/v0.2.6-ideas.md` row 21.
- **Accepted costs above stand as written.**


## Review resolutions — Pass 2 (Codex rebuttal of PR #26, 6 Sep 2026)

Read the full merge-base diff from `272804d`, and each Claude commit separately (`d1cec6a`,
`dcbc9ea`). These resolutions supersede Pass 1's deferrals and the implementation's former
whole-list gate / later-date glow cost. Scope remains `docs/v0.2.6-ideas.md` row 8, row 9's
semantic palette and row 10's marquee states, plus Beni's approved numbering; the same work
is `docs/v0.3.0-ideas.md` rows 4, 10 and 11. No candidate implementation was pulled in from
`docs/v0.2.6-ideas.md` rows 1–7 or 11–14.

| Finding | Verdict | Reproduction / resolution | Merge disposition |
|---|---|---|---|
| `docs/v0.2.6-ideas.md` row 18 | **accept-but-contest-the-characterisation** | Twenty synthetic FT fixtures on 31 Jan with no scheduled future returned twenty FT and no NEXT. The new regression failed against `dcbc9ea`; a test pinning that behavior establishes intent, not correctness. The spec's definition explicitly includes the window tail. `tickerSegments` now accepts `windowTo` and emits empty NEXT beside LIVE/FT. Static rendering is only for the sole empty-NEXT segment. | P2; should block until fixed. Fixed and re-proved. |
| `docs/v0.2.6-ideas.md` row 19 | **accept-but-contest-the-characterisation** | A passed Saturday filler plus Sunday's exact fixture produced Saturday TBC in the ticker and Sunday in the hot set; the new test failed against `dcbc9ea`. Disclosing this does not make two opinions about NEXT honest. The spec's exact-time glow rule says placeholders never glow; it does not require skipping the first matchday. Both instruments now consume `nextMatchdaySelection`. Mixed dates glow on the same exact fixture as NEXT; all-TBC dates have no next-kickoff glow. | P2; should block until fixed. Fixed and re-proved. |
| `docs/v0.2.6-ideas.md` row 20 | **contest** the deferral; the duplication itself is real | Moving the gate creates no cycle: `fixtures → lensSelectors → time → competitions`; the schema import in the pure module is type-only. The test imports both modules and asserts function identity. `fixtures.ts` imports and re-exports the single predicate owned by `lensSelectors.ts`. A live behavioral divergence was never required to remove the exact drift mechanism this release is about. The predicate move itself is XS; verification dominates its cost. | Required before this release given its one-rule claim. Fixed; no cycle. |
| `docs/v0.2.6-ideas.md` row 21 | **accept-but-contest-the-characterisation** | `tests/sync.test.ts` executes fixture/standings failures and asserts exit 2, no writes and no report. The review skill's existing wording is correct. Finish the same prose sweep in the workflow header, its legacy warning and `mergeVerdict`'s comment. The defensive regex, branch and verdict are retained. Three residual descriptions are not three reachable failure paths. | Nonblocking alone; fixed here because this PR already owns the doctrine sweep. |
| `docs/v0.2.6-ideas.md` row 22 | **accept-but-contest-the-characterisation** | The test already parsed hex tokens; calling it merely a receipt understates its live assertions. Its alpha / inventory gaps were real. It now parses `--border`, `--floodlight-bg` and the banner's Tailwind opacity. All 40 published pairs reproduce identically; five explicit tint pairs were added. Mutating each source alpha changes the measurement and fails AA. Only dark muted-on-tint is excluded, guarded by all three source sites and mounted banner/Table descendants across all five leagues, including PPG sort. | Required before claiming durable contrast coverage. Fixed within the stated inventory; not an app-wide AA claim. |
| Hollow pill grammar | **accept** Beni's disposition | Pixels stay as built. The widened meaning and 4.29:1 forcing cost are written above. `docs/v0.2.6-ideas.md` row 23 assigns the three-shape grammar to Claude Design, XS–S. | Does not block; designer follow-up. |

### Claude's two commits, reviewed on their own terms

**`d1cec6a` is correct as made.** On the same scroll node, Chrome exposes `region / Ticker`,
`group / Ticker`, and (with only aria-label) `generic / Ticker`. A group is possible but loses
landmark navigation; this is Broadcast's one hero and its snapshot provenance is worth
navigating to, so region is an accurate, bounded choice, not a role invented for scrolling.
The static label identifies the instrument; its child text carries the state. The [WAI region
pattern](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/region.html) supports a
labelled section important enough to navigate to. Eight theme/width cells verify its AX name,
39px height and unchanged next-element top; ArrowRight pans all three narrow widths.
No real screen-reader speech was tested.

The fixture restore is also correct for these tests: they change scalar fields and replace
`result`, never mutate nested team/result objects or splice/reorder `FIXTURES`. Delete then
assign removes a test-added result and restores each original object, including the objects
held by `BY_DATE`. Pass 2 selects a fixture originally lacking a result and compares the entire
array with a deep pristine copy after every case. All 333 tests also pass with shuffled file
and test order, seed 26. The shallow backup is not a general deep-mutation reset, and no such
mutation is present. Month selection by the fixture's own date is correct independently of
snapshot order.

**`dcbc9ea` is an accurate historical review record, not a correct final disposition.** Its
rows and evidence are retained; its claim that an existing test or a pure-module constraint
justifies deferring `docs/v0.2.6-ideas.md` rows 18–20 is rejected above. The original Pass 1
section stays as written so the rebuttal remains auditable. Rows 18–22 are marked implemented
in place, with merge still pending.

### Pass 2 verification and numbering

- `npm run typecheck`; `npm test`: **26 files / 333 tests**. Shuffled seed 26 also green.
  Normal and single-file production builds pass; the normal build retains its bundle-size warning.
- **72 production captures:** three lenses × two themes × Week/Month/Table ×
  360/375/390/1000px. Viewport set before capture, document scrollWidth equals innerWidth
  before every screenshot, no browser console errors. Provenance reads
  `v0.3.0 · 1007 fixtures · synced 2026-09-05 23:59 UTC`.
- **Eight empty → FT transitions** preserve the strip node and 39px height; empty is static,
  named, pannable and has no track/control, including reduced motion. FT reintroduces the
  track with empty NEXT provenance beside the result. **32 approximate-NEXT states** cover
  single, multiple, mixed and Brooklyn-midnight transitions in both themes at every width.
  The exact window-tail reproduction now renders twenty FT segments plus NEXT provenance,
  even with an empty `only=` filter. Pure tests additionally re-prove shuffled mixed dates,
  expired fillers and excluded statuses.
- **24 stale-state cells** re-prove all lenses/themes/widths at K+4h−60s, K+4h+1ms
  (still LIVE on the minute clock), then K+4h+60s (KICKED OFF, no glow, transparent fill,
  unchanged stored in_play and score). Both pills stay 15.5px high.
- Rendered pixels settle both sub-0.05 margins: the light 72h banner ground is RGB
  `(243,229,218)`, **4.5268:1** versus 4.55 predicted; muted on surface-alt is
  `(239,234,217)`, **4.5190:1**. Banner ratios light 24h / dark 24h / dark 72h are
  **4.9466 / 8.2286 / 7.5282**. No token or pill pixels changed in Pass 2.
- Local scripts, logs, captures and JSON receipts are in `/tmp/kickoff-pass2/`; they are
  local evidence, not GitHub attachments. Every clock jump uses a real Date captured before
  the shim, and prints `now`, `real`, `offset`. Pure and mounted tests remain the remote proof.
- Release date came from `TZ=America/New_York date`: **2026-09-06 14:28:51 EDT (-0400)**.
  Beni approved **v0.3.0**, reserving **v0.4.0** for the sync theme. `package.json`, both
  lockfile versions, CHANGELOG and README badge/heading/Lineage now agree. CHANGELOG uses
  one honesty subject and leaves palette work under Fixed and the numbering note under
  Deliberately not done.
- Living sync targets moved in `docs/v0.2.6-ideas.md` (head note, rows 3–7), README, HONESTY,
  CLAUDE and the workflow header. `docs/README.md` explains the retained cycle filename.
  No released CHANGELOG section changed; earlier proposals, prompts, filenames and citations
  remain historical records. The PR body contains the complete final grep receipt and its
  classification. `docs/v0.3.0-ideas.md` itself is unchanged.

**No unresolved merge blocker after these fixes and checks.** Beni alone merges and tags.
The squash body must name Codex as builder and Pass 2 rebuttal, Claude Code as Pass 1 cold
reviewer, and carry both `Co-authored-by: Codex <noreply@openai.com>` and
`Co-authored-by: Claude <noreply@anthropic.com>` trailers, as v0.2.5 did.

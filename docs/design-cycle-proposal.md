# Design cycle — honest snapshot states and readable status colors

Implementation spec of record, 6 Sep 2026. Release numbering awaits Beni; the design
project's v0.2.6 label is a cycle name, not a release-number decision.

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
  still reads the whole snapshot; `nextKickoffId` and the glow remain exact-time-only.
- If the **whole segment list** is empty, keep the strip mounted with
  “NEXT — nothing scheduled in this snapshot · window ends {posterDayTitle(META.window.to)}”.
  No animated class, duplicate track or pause button. Existing LIVE/FT segments are retained
  when no NEXT exists; absence of a future kickoff does not discard known current results.
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
6. **Numbering recommendation: a minor, subject to Beni's ruling.** New visible states and
   new marquee behaviors meet this repo's minor policy; the cycle folder and candidate-list
   names suggest a patch but do not override it. Recommend v0.3.0 and move the reserved sync
   theme to v0.4.0 only if Beni approves that public roadmap change. A v0.2.6 corrective-patch
   exception is also Beni's decision. Until the ruling, package/lock/README release strings
   stay at 0.2.5 and the CHANGELOG entry stays Unreleased. No roadmap has been renumbered.
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

## Verification evidence

- Node 24.15.0. `npm run typecheck`, `npm test`: 25 files, 316 tests pass. Normal and
  single-file production builds pass. The normal build retains Vite's bundle-size warning.
- Selector tests pin LIVE_WINDOW_MS − 1ms, exactly LIVE_WINDOW_MS, and +1ms; each checks
  the complement, ticker membership, hot-row membership and unmodified stored status.
  Other stored statuses never become stale LIVE. DOM tests drive the real parent wiring
  through WeekView (all three lenses) and MonthView using in-memory illustrative statuses.
- DOM and selector tests cover single/multiple TBC, mixed dates, shuffled inputs, a filler
  instant already passed today, Brooklyn midnight, omitted cancelled/postponed candidates,
  no-segment snapshots, and preservation of LIVE/FT without a NEXT.
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
- Muted text has less visual separation from secondary; dark metadata is brighter.
  Broadcast light's leading text/focus accent deepens with floodlight-strong. LIVE's orange
  fill deepens beyond the designer's initial value to clear the actual backgrounds.
- Empty copy is one static line: narrow screens require horizontal panning to read its
  window end. This preserves strip height and exposes the full copy to keyboard and AT.
- Ticker duration remains 36 seconds, independent of content width. The existing nonempty
  reduced-motion track's inert pause control remains open under `docs/v0.2.6-ideas.md`
  row 10; only the new empty state's no-control rule is implemented here.
- Ticker filters remain independent of Next-up/Tonight's slate, and exact-time glow can
  point beyond an earlier all-TBC date. Placeholder rows never glow.
- Competition hex text debts remain a separate DS pass (`docs/v0.2.6-ideas.md` row 9,
  remaining competition-color portion). FixtureRow's em-dash-to-TBC migration stays deferred.
- No work from `docs/v0.2.6-ideas.md` rows 1–7 or 11–14; no provider, sync-boundary,
  auto-merge, dependency, package-manager or deployment changes. The failure reader remains
  procedural until `docs/v0.2.6-ideas.md` row 15's trigger warrants product work.
- No merge or tag. This PR is the implementation pass; cold review, rebuttal and Beni's
  adjudication still follow. Release numbering remains explicitly pending his ruling.

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

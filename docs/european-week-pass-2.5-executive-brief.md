# Executive Summary Brief — PR #39 · Pass 2.5 · Thu 10 Sep 2026, 16:10 EDT

Claude Code (Fable 5.1, Extra), the synthesis seat, in its own worktree (`distracted-pike-bb001f`,
local branch `pass25/european-week`) at the builder's head `e6affeade8d124340ece394e08165d6c9934c960`
against `origin/main` `782613ba964d49a7029ccdbfc0ef31610767430c`. Every number below comes from a
command or a browser read in this session; a vendor's figure is labelled as that vendor's. The
assignment is `european-week-pass-2.5-prompt.md`; the record it re-runs is the Pass 1 comment
([5622669182](https://github.com/BeniCheni/kickoff/pull/39#issuecomment-5622669182)), the Pass 2
comment ([5623385175](https://github.com/BeniCheni/kickoff/pull/39#issuecomment-5623385175)) and
`european-week-pass-2-rebuttal.md`.

**Decision: escalated.** The merge and the tag are Beni's; the handoff is at the end. The Pass 2.5
merge gate fails on three clauses before any corroboration is read: the PR regenerates
`src/data/*.json`, the release number is open (item (f), decision D12), and one design decision
(the shared chips, finding 2) is his. The corroboration itself found nothing still contested
between the vendors and no new blocker: all six findings reproduce as the rebuttal states them, the
new `--baseline-dir` option holds up under its own adversarial check, and the 375 px geometry is a
display-scale condition, not a defect. **The implementation head is release-ready once he rules; the
one operational hazard is that the bot's next sync will re-conflict the branch, so a re-sync must
sit between his rulings and his click.**

## What ships

- **The Champions League joins the schedule.** 144 league-phase fixtures beside the 1,055 domestic
  rows (1,199 in all, the header says so), every European day carrying its provenance line:
  "MATCHDAY n · COMPUTED — UEFA WINDOW …". A fixture that moves out of its window reads RESCHEDULED;
  one first seen outside every window is shown without a number. The app never invents a matchday.
- **Stadium clocks follow the ground, not the competition.** Venue country plus venue-id overrides
  set the zone; six MD1 clocks that the old rule put an hour wrong now read 7:45 PM Athens and
  Istanbul, 8:00 PM Lisbon and London. An unmapped venue says "local time not known" beside the
  Brooklyn clock instead of showing the viewer's own zone.
- **The 36-club table.** Round of 16 · 1–8, Knockout play-offs · 9–24, Eliminated · 25–36; "As of
  matchday 1 of 8 · league phase"; the play-off band's header sticks under the column header on
  phones and on desktop and releases at the band's end. The five domestic tables are unchanged to
  the pixel.
- **Moments, empty first.** A third tab reading "No moments curated yet.", fed by a hand-curated
  `src/curated/moments.json` outside the sync boundary, validated at build.
- **The sync learns two words.** The report line gains `zones-unknown` and `standings-degraded`; a
  league-phase table that structurally ends after the last window degrades UCL alone instead of
  freezing six competitions.

## Where it sits

The next minor after v0.3.2, under one subject line, "Kickoff learns the European week". Its number
is item (f), Beni's; the PM packet recommended leaving v0.4.0 to the sync theme (ideas rows 3, 4, 7
with row 29) and placing this release after it, provisionally v0.5.0, and that remains a
recommendation until he says the word. Two releases are therefore in flight on the roadmap, this one
and the sync theme, and their order is D12. `docs/v0.2.6-ideas.md` already strikes rows 30–34,
36–39, 41 and 42 as "implemented in #39; release pending"; rows 35 (the fourteen-hue contrast
inventory) and 40 (the design-review skill) stay open, and this pass adds rows 43 and 44.

## What the 360 found

| # | Pass 1 | Pass 2 | Pass 2.5, re-run | Blocks adjudication? |
|---|---|---|---|---|
| 1 | medium: the league-phase guard required exactly one child named for the phase; an extra ESPN child during the phase aborted the whole snapshot. Fixed `b9c888d`. | accept; one wording correction (the warning prints the child count and the chosen child's name, not every extra child's name). | **Reproduced red then green.** The head's `tests/uclSync.test.ts` run in a `git archive` of `fea6497`: 2 failed, 7 passed (exit 2 where 0 was expected); filtered to the two intact-child cases: 2 failed, 7 skipped. At `e6affea`: 9 passed. Read in code: the phase child is found by name wherever it sits, every child's entries are validated, rows come from the phase child alone, `phaseChanged` is "no phase child or wrong row count", and it degrades only after the last window. Codex's wording correction is right; Pass 1's "names the others in its log" overstated the `console.warn`. | No. |
| 2 | medium: an unbriefed visible change to all fourteen competition chips (ink by luminance, inactive fade removed); Beni's keep or revert. | accept; recommends keep with the full case. | **Arithmetic reproduced to three decimals** on all fourteen fills and both inactive grounds in both themes (`pass-2-chip-math.ts` at the head). **Rendered styles read** in 24 table cells: selected UCL chip `rgb(0,0,0)` on `rgb(139,111,232)`, inactive text `rgb(85,97,79)` light and `rgb(169,185,172)` dark at opacity 1, 1.5 px border. "White where white passes 4.5, black otherwise" is exactly `chipInk.ts`. Restoring the mirror's 0.5 fade would put inactive text at 2.15 / 2.22 light and 3.10 / 2.94 dark; restoring white would put the UCL chip at 3.79. | **Yes, Beni's word.** Decision paragraph below. |
| 3 | low: the zone `refine` built an `Intl.DateTimeFormat` per row at boot, 28.8 ms → 0.15 ms memoised. Fixed `27c5978`. | accept-but-contest-the-characterisation: 42.9 → 15.8 ms cold, 29.3 → 1.8 ms warm, seven fresh processes. | **Measurement wording, no remaining defect.** The archived harness on the *same* snapshot (`fea6497` vs `eba4e80`, Node 24.15.0, seven fresh processes each, JSON and imports outside the timer): median first full-schema parse **41.94 → 15.31 ms**, immediate second parse **29.21 → 1.91 ms**. Zone-only at the head: first pass 10.0 ms, second 0.14 ms; 1,199 `Intl` constructions cost 26 ms, the 15 distinct ones 0.4 ms. Pass 1's figures were the zone cost, Codex's the whole parse; both are right about what they timed. Invalid / valid / invalid is false / true / false in every process. | No. |
| 4 | low: README said "on the review branch". Fixed `d5d7219`. | accept. | Read at the head: "v0.3.2 is the current release. The European week below is built and unreleased; the number it ships under is Beni's decision." True before and after the merge; the release preparation rewrites it. | No. |
| 5 | low: no index row for the verification record. Fixed `d5d7219`. | accept; the rebuttal record indexed in `e6affea`. | `docs/README.md` rows for the verification record, the Pass 2 brief and the rebuttal record are present; `verification/european-week/` holds 17 receipt files and `screenshots/european-week/` 21 captures. | No. |
| 6 | low: every domestic row carried the provider's `phase` and `season`, unread. Not fixed (needs a sync). | accept: `f1ab7f3` retains them for `league-phase` only; `1832b2c` regenerates. | **Consumers traced**: fixture `phase`/`season` are read only by `matchdays.ts` (lines 26–27) and the normaliser's round derivation; `TablePage` reads `LEAGUE_TABLES` meta `phase` and the standings file's `season`, different things. **Head snapshot**: 1,055 rows without either field, 144 league-phase rows with both; the normaliser test covers domestic, league-phase and qualifying. **Savings on the same snapshot** (Python 3 zlib): 61,913 bytes raw, 3,251 at gzip level 6, 2,604 at level 9 (Codex's 3,348 used Node's zlib). Actual file 759,584 → 697,671 bytes (gzip 6: 57,586 → 54,340). Production JS at the head 864.28 kB / 145.78 kB gzip (Vite's own figure); the 913.5 kB "before" is Pass 1's and Pass 2's measurement, not re-built here. | No. |

**The chip decision, in one paragraph.** Keep gives every selected chip a label above 4.5:1 (white
on five fills, black on nine) and inactive labels at 6.00 / 6.54 light and 8.55 / 7.40 dark; its cost
is that nine chips, La Liga, the Premier League and Serie A among them, now carry black text on
their fill where the design system's mirror says white, and the designer must re-mirror the chip in
Fergie Time. Revert restores the mirror exactly and costs the new UCL chip its passing label
(3.79:1), leaves the five domestic selected chips below 4.5 as they were, and puts inactive labels at
2.15 / 2.22 light and 3.10 / 2.94 dark; all of it is already recorded as debt in ideas row 35. A
middle path, black only where white fails while restoring the fade, would fix the selected labels
and knowingly keep the inactive failures, and could not be called AA-complete; a UCL-only exception
is the thing the brief ruled out. Both vendors recommend keep; the rendered styles show the change
as described and nothing else. The choice is a design-system one and is his.

**The baseline option, audited.** `--baseline-dir` changes reads only: `previousPath` is called at
two sites, the fixtures baseline (`scripts/sync.ts` line 116) and the standings baseline (line 69),
and the three writes at lines 216–221 target `src/data/` unconditionally. Both baselines pass through
the Zod file schemas; a missing named file throws "Missing explicit sync baseline" before the
provider is called (fixtures) or before any write (standings); a corrupt file throws in `JSON.parse`
before the fetch; every throw becomes exit 2 in `runSync`. With the flag absent the path is exactly
`main`'s. `preserveContext` carries `note` and `round` by id and deletes a fetched round when the
stored fixture had none, so first-seen absence survives. The five tests in `tests/syncBaseline.test.ts`
assert those behaviours rather than their names: reads are limited to the two baseline paths (any
other read throws "Must not read conflict-marked output files"), writes go to the three `src/data`
paths, the missing and corrupt cases exit 2 with no write and no fetch, and a present or absent
round survives a later in-window move. The workflow does not use the flag. One observation, not a
defect: an explicitly empty `--baseline-dir=` silently means "no baseline" (ideas row 43).

**What the sync commit establishes.** `1832b2c` differs from its first parent `f1ab7f3` in the three
generated files only, and from `main` in the 91 files the branch carries. A diff cannot say how the
bytes were produced, so three checks stand in: by id, `f1ab7f3` → `1832b2c` changes `phase` and
`season` (removed) on exactly the 1,055 non-league-phase rows and `source.fetchedAt` on all 1,199,
with zero round changes and 18 fixtures on each of matchdays 1–8; every one of `main`'s 1,055 rows
(the bot's own 17:02Z snapshot) equals the head's row on every field except the two evidence fields
the branch adds, `venueId` and `venueCountry`, so a hand-typed resolution is excluded by the provider
itself; and the standings file is equal to its baseline apart from `fetchedAt`, with `main`'s five
domestic tables equal to the head's. `changed=false` with changed bytes is by construction: the diff
engine compares the fixture facts its nine kinds name and the standings rows, and neither `phase`,
`season` nor `fetchedAt` is among them. The snapshot's `lastSyncAt` is `2026-09-10T18:06:15.099Z`,
which is the commit title's 2:06 PM ET.

## Verification as re-run

- **Commands at `e6affea`** (Node 24.15.0): `npm run typecheck` clean; `npm test` **457 tests in
  37 files**, both projects; `npm run build` clean (`validate-moments`: 0; `index-DWmKvYuw.js`
  864.28 kB / 145.78 kB gzip, CSS 29.12 kB); `npm run build:single` clean (895.11 kB / 153.09 kB
  gzip). Diff against `origin/main`: 97 files, +28,464 / −9,303.
- **`verify`**: the PR's own `pull_request` run at `e6affea`,
  [34513292753](https://github.com/BeniCheni/kickoff/actions/runs/34513292753), success. The docs
  commit this pass adds moves the tip; the PR comment names the run at that tip.
- **Snapshot**: 1,199 fixtures = `META.total`; 144 UCL; tables 36 / 20 / 20 / 20 / 18 / 18; window
  2026-08-11 to 2027-02-07.
- **Browser, 72 cells**: the pane's Chromium 152.0.7977.76 at device pixel ratio 2, this worktree
  served on port 5174 (no other Kickoff server was listening on 5173, 5174, 5186 or 5187), viewport
  set before every read, fonts awaited, theme keys set explicitly and cleared afterwards. 3 lenses ×
  2 themes × 3 tabs at 360, 375, 390 and 1000 × 850: `scrollWidth === innerWidth` in all 72,
  `#root` mounted, tab, lens and theme attributes as requested; tab row 65 px at the three phone
  widths and 37.5 at 1000; picker 96.75 / 62.5 / 62.5 / 28.25 px with 3 / 2 / 2 / 1 chip rows and ⭐
  last; three COMPUTED lines on the MD1 week in every Fixtures cell; 8 / 16 / 12 rows in both table
  DOMs in every Table cell; "No moments curated yet." in every Moments cell.
- **The six MD1 clocks**, expanded at 390 Ledger light: AEK Athens 7:45 PM · 12:45 PM; FC Porto
  8:00 PM · 3:00 PM; Liverpool 8:00 PM · 3:00 PM; Sporting CP 8:00 PM · 3:00 PM; Fenerbahce 7:45 PM
  · 12:45 PM; Manchester United 8:00 PM · 3:00 PM. Read at 16:04 EDT wall-clock: the clock shim was
  injected but its offset cancelled to zero, so the rows were measured at real time, after two of
  the six had kicked off; both clocks render either way.
- **The state family**, through the served `fixtures.ts` module at 390 Ledger light, one MD1
  fixture mutated in memory and restored: round set to 2 renders "MATCHDAY 2 · RESCHEDULED — NOW
  OUTSIDE ITS UEFA WINDOW" beside the day's COMPUTED line; round deleted renders "MATCHDAY — · FIRST
  SEEN OUTSIDE UEFA'S PUBLISHED WINDOWS"; zone deleted renders "local time not known" in
  `rgb(138,95,0)` IBM Plex Mono with the Brooklyn 12:45 PM intact; restored, three COMPUTED lines.
- **Sticky, re-run.** Mobile at 390 × 850: the play-off divider holds at 28 px under the 28 px
  header at scroll 900, 1100, 1300, 1500, 1650 and 1700 and reads −15.5 at 1750 as the 891.5 px band
  leaves. Desktop at 1000 × 700: the column header holds at 0 (34 px) and the divider at 34 at
  scroll 850, 1000, 1150 and 1300, then 29.5 at 1450 and −20.5 at 1500 as the 766.25 px band leaves.
- **Hard rule 6, re-measured.** The Premier League table at 390 and 1000: all 24 row and divider
  boxes are identical relative to the table's top, table heights 1218 and 1123.25, `scrollWidth`
  equal, against the builder's `domestic-after.json`, whose `before` equals its `after`; the
  absolute offsets differ by the third tab's 27.5 px and a header line (31 px at 390, 2.5 at 1000).
  `src/` differs from `fea6497` only in `schema.ts`'s seven memo lines and the data files.
- **The 375 claim, resolved.** Headless Chrome 153.0.8010.37 on this Mac, CDP-driven, 360 / 375 /
  390 × 850, `innerWidth`, `visualViewport.width` and `scrollWidth` all equal to the width, picker
  335 px at 375: the default launch gives **three rows, 93.75 px picker, 63.5 px nav, 1 px computed
  border, six chips summing 607.03 px**; `--force-device-scale-factor=2` gives **two rows, 62.5 px,
  65 px, 1.5 px border, 600.96 px**. The emulated device scale factor (1, 2 or 3) changes none of
  these. The pane at DPR 2 agrees with the second. Both vendors measured honestly under different
  host scales; a phone at DPR 2 or 3 gets two rows, a desktop window narrowed to 375 on a non-Retina
  display gets three (ideas row 44).
- **Live provider, no write**: `npm run sync -- --check` at 15:56 EDT reported
  `changed=true changes=2 urgent=2 standings=changed rank-moves=11 merge=hold zones-unknown=0
  standings-degraded=none` (PSV v Shakhtar and Fenerbahce v Roma `scheduled → in_play`; eleven UCL
  rank moves); `git status` on `src/data/` clean. The bot's last `sync.yml` run is still the 17:02Z
  one and `origin/main` is still `782613b` at 16:07 EDT.
- **Not verified**: a physical phone; Moments populated (empty in all 24 cells; Pass 1 injected
  cards at 390 light); the bot's next sync against the new report grammar, which cannot run until
  the merge; the production bundle at `fea6497` (the before figure is the earlier passes'); the
  clock driven back before kickoff (see the clocks note).

## Risks and accepted costs

- **The conflict will return before the merge.** The drift above means the next cron slot
  (`23 1,4,7,10,13,16,19,22 * * *` UTC) writes a sync PR that merges itself into `main`, and the
  branch goes CONFLICTING again on the three data files. The `--baseline-dir` option makes the
  builder's re-sync safe and repeatable; the handoff sequences it after Beni's rulings and
  immediately before his click.
- **Settled by the design record**, restated: a fixture already moved between windows before the
  app first saw it is numbered by the window it was found in, the one case rule 3 cannot detect; the
  venue override map is empty this season and structurally required; the eight windows are
  confirmed against Annex C, the individual numbers stay COMPUTED.
- **Step 0 consequences for the betting track.** 144 Champions League rows join the fixture source
  (`?only=ucl` works, `&date=` unchanged); the report line grows by two appended fields and the
  workflow's regex mirrors them; UCL in-play statuses at European kickoffs will produce more
  `merge=hold` reports on midweeks, which is reader-facing only; a structurally ended UCL table
  degrades UCL alone, so a February reshape no longer freezes the domestic data Step 0 reads.
- **Bundle**: 864.28 kB / 145.78 kB gzip at the head, against 740.8 / 130.7 kB on `main` by Pass 1's
  measurement; the 144 rows are the legitimate part.

## Handed to the designer and the next patch

- **Chips (row 35)**: keep means the designer re-mirrors `CompetitionChip` in Fergie Time (ink by
  luminance, no inactive fade) and row 35 narrows to the fourteen-hue inventory; revert means the
  builder restores the mirror's treatment and row 35 records the UCL chip at 3.79.
- **Copy and still confirmations, the designer's**: "N clubs have played fewer matches"
  (`TablePage.tsx`); "MATCHDAY N · RESCHEDULED — NOW OUTSIDE ITS UEFA WINDOW" and "FIRST SEEN
  OUTSIDE" (`matchdays.ts`); the degraded-table sentence; the still's letterbox tolerance, item (e).
- **Row 43**: an empty `--baseline-dir=` should fail closed. **Row 44**: the 375 px picker's zero
  slack. **Row 40**: the design-review skill. From Pass 1: `<main aria-label="Moments">` is the
  app's only `<main>` landmark.
- **The PR body** still carries the builder's original "375 uses three rows" table; the Pass 2
  comment and `european-week-verification.md` supersede it. Worth one edit at release time.

## Questions for the CEO

1. **Chips**: keep or revert.
2. **Release number**: the version this ships under.

## Handoff block

The Round 3 adjudication handoff is delivered in chat with this brief and reproduced in the PR
comment's pointer; it collects the two rulings, hands the builder the bounded release preparation
(the seven version places, the CHANGELOG section folded from `[Unreleased]` with the Brooklyn date,
the README wording, the chip commit if reverted, one `main` merge plus one `--baseline-dir` re-sync
when the bot has moved `main`, `verify` green at the exact tip), and then the merge-day checklist
and the squash subject and body with both trailers. No version is guessed and no tag command is
written; the number is Beni's.

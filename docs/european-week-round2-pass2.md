# European week — refreshed cycle, Round 2 / Pass 2

12 Sep 2026, Codex builder rebuttal. **Contest the unqualified “no findings” conclusion:**
two valid snapshot states fail the publication test gate at the reviewed head. Both are
fixed in tests here; no application or generated-data change is required. The live PR
description also still presented the pre-refresh tip as current when this pass began.
The final exact-tip CI and PR-body update receipts belong to the one Pass 2 PR comment.
This record does not authorize release. Pass 2.5 must independently corroborate it.

## Anchors and method

- Reviewed head: `25b77a46981d19b157c7278c6a19a16b35f1aca8`.
- Base: `77c5dd23ae9c8a1b8ade41f58fe64336746cc019`.
- Merge parents: `17c24b01aab97e8284901aff39b97e38b3edb028`, then the base above.
- [Refresh comment](https://github.com/BeniCheni/kickoff/pull/39#issuecomment-5646668198).
- [Pass 1](https://github.com/BeniCheni/kickoff/pull/39#issuecomment-5646924381).
- Initial fresh PR state: OPEN, MERGEABLE/CLEAN; `sync.yml` disabled manually.
- Initial exact-head pull-request CI: [34700740910](https://github.com/BeniCheni/kickoff/actions/runs/34700740910), success.
- Worktree: `Kickoff-European-Week-Refresh`, branch `codex/european-week-refresh-v0.5.0`;
  the remote target remains `HEAD:codex/european-week`.

The read-only review method and repository review skill supplied evidence standards;
neither was invoked as a mutating Pass 2 mode. This explicit builder prompt governs.
The repo remains ground truth, with honesty above template > design brief > implementation
prompt and Beni's rulings above an older canvas. Historical handoffs remain historical.

The full PR diff was 104 paths, +29,260/−9,369. The first-parent refresh delta was 32,
+3,533/−1,686; excluding `src/data/` and `docs/`, 16 paths, +910/−106. The exact
`git diff 17c24b0 25b77a4 -- src/ ':(exclude)src/data/'` was zero bytes. That does not
make the refresh code-empty: publication workflow, scripts, tests, docs and provenance
require review. All 21 paths whose result differed from both parents were recomputed;
the set and structural data comparisons are in [the provenance receipt](verification/european-week/round2-provenance.json).
Both parent comparisons and the combined merge diff were considered separately.

## Findings and fixes

**F1 — P2, latent publication failure on valid UCL degradation.** `tests/dom/uclTable.test.tsx`
read the current `STANDINGS.leagues.ucl` to establish populated-table assertions. With that
table legitimately absent and both degradation metadata fields set to `['ucl']`, three
tests failed: progress text, games-in-hand `.map`, and PPG sorting. The explicit degraded
UI test passed, and the provider's degradation tests passed; the failure is downstream
in `npm test`, which `sync.yml` runs before publishing any snapshot. Full-suite result:
3 failed / 497 passed. This is introduced by PR #39, predates this merge refresh, and is
not a demonstrated live production outage.

Fix: seed populated UCL tests from the recorded ESPN standings response, restoring globals
after each test. Require exactly two table DOMs before checking both 8/16/12 bands, so
empty iteration cannot pass. Keep the degraded-state and return-to-domestic assertions.

**F2 — P2, latent publication failure on an honest unknown zone.** The live-snapshot audit
in `tests/venueTz.test.ts` required every retained country/id to map, then required every
domestic row to use its competition's reference clock. A valid UCL row with an unmapped
country and no `venueTz` failed that audit, despite the normalizer, schema, report and UI
explicitly supporting this state. The domestic blanket assumption also contradicts the
venue-first rule for neutral grounds. Focused result: 1 failed / 14 passed.

Fix: keep the fail-on-unmapped assertion against the recorded activation sample; audit
every current row against its actual venue evidence, including required absence for an
unknown zone and a null local clock. Add retained-but-unmapped evidence, five ordinary
domestic clocks and a known neutral venue through the real normalizer. Brooklyn identity
and invalid-IANA rejection remain asserted. This changes a one-time activation inventory
assumption into a recorded-data check, not a permission to invent a local clock. The
historical ruling's “every domestic zone unchanged” was independently corroborated on
the present snapshot; it is not a valid invariant for every future neutral venue.

**F3 — P2, stale PR description.** At inspection the opening still said “Hold for v0.4.0
sync PR #41”, the current-tip receipts named `17c24b0` / run `34555194072`, 457 tests in
37 files and 1,199 fixtures, and the ending said to ship v0.4.0 first. The current truth
was `25b77a4`, 500 tests in 39 files, 1,198 fixtures, and v0.4.0 plus v0.4.1 already shipped.
The final body must identify the final Pass 2 head and separate these historical receipts
from the current summary; the posted Pass 2 comment records the verified update.

**F4 — P3, live log descriptions overclaimed.** CHANGELOG and HONESTY said the standings
warning named the other children. The real warning records child count and selected phase
name, not each extra name. Correct both descriptions and pin that exact warning in the
existing real-provider test. Also distinguish during-phase abort from valid after-phase
degradation in CHANGELOG. The old review records are not rewritten.

## Falsification receipts

All deliberate regressions ran in `git archive` scratch trees with shared `node_modules`.
Only scratch code/test modules were altered; no generated file was edited, even there.

| Probe | Deliberate regression | Restored/fixed result |
|---|---|---|
| Actual `Read the sync report` YAML shell, extracted and executed by `tests/syncPublication.test.ts` | Old six-field regex: 4 failed / 23 passed. It rejected valid eight-field reports and accepted the forbidden six-field report. | 27 passed. Six fields rejected; `zones-unknown=2 standings-degraded=ucl` accepted. External `gh` calls use the rig's mock. |
| `VENUE_TZ_CHANGED` rank reset to 8 | 1 failed / 48 passed in `tests/diff.test.ts`. `[zone,rename]` yielded zone first; reversed input happened to pass. Thus an input-order collision, not two independently failing orders. | 49 passed; both inputs yield `TEAM_RENAMED`, then `VENUE_TZ_CHANGED` at rank 9. |
| Removed PR #34 CHANGELOG bullet | Byte comparison only: all 478 bytes equal the `[0.4.0]` bullet (SHA-256 in receipt). | No remaining `[0.5.0]` bullet exactly duplicates an older bullet; semantic sweep found no other re-announced shipped work. `[0.4.1]` and everything older remain byte-identical to main. |
| Both supported snapshot states above | [Replay harness](verification/european-week/round2-resilience.mjs) against `25b77a4`: 4 failed / 496 passed, two files. | Same in-memory shapes against the fixed tests: 506 passed / 39 files. |

Replay the last row from the repo root with
`node docs/verification/european-week/round2-resilience.mjs 25b77a4`, then the final head.
It prints the scratch directory and keeps `run.log`. A red exit on the old ref is expected.
No live sync, workflow execution or GitHub write occurs in this harness.

The only `RANK` consumer is the fixture-change sort comparator. `mergeVerdict` uses kind
names and urgency, so the rank fix does not change approval semantics. All twelve kinds
remain: NEW, DISAPPEARED, HOME_AWAY_INVERTED, DATE_MOVED, TIME_CHANGED, STATUS_CHANGED,
VENUE_CHANGED, VENUE_TZ_CHANGED, TIME_CONFIDENCE_CHANGED, RESULT_CHANGED, TEAM_RENAMED,
TEAM_CHANGED. The printer, workflow regex, diff test grammar, sync test, publication-rig
fixtures, venue grammar check and live HONESTY example all retain eight fields. Archived
six-field release/digest records and deliberately invalid test inputs remain historical
or negative cases; the digest formatter treats its input as opaque text.

## Disposition ledger

| Item | Disposition | Deciding evidence |
|---|---|---|
| 1. Overall no findings | contest | F1–F4 above; F1/F2 fail the actual test gate on supported inputs. |
| 2. No application/design change | accept-but-contest-the-characterisation | The requested `src/` comparison is empty; the refresh still has 16 non-data/non-doc paths. |
| 3. Publication report shape | accept | Actual extracted shell red/green, including six-field rejection and non-default extras. |
| 4. RANK collision | accept | Deliberate rank regression, both input orders, all consumers audited. |
| 5. CHANGELOG duplicate | accept-but-contest-the-characterisation | Byte-identical duplicate removed, older sections unchanged. Pass 1's “all three red-then-green” heading overstates its own two-mutation matrix. |
| 6. Generated provenance | accept | Fresh recount, stable-id/round comparison to both parents, window test below. |
| 7. Check-only sync | accept | Current report differs; file bytes, mtimes and tracked status are identical before/after. |
| 8. Data honesty | accept-but-contest-the-characterisation | Runtime gates and existing assertions corroborated; F1/F2 show the publication suite did not admit all supported honest states. Nine `uclSync` tests, not the 15 quoted in Pass 1. |
| 9. Killed leads | accept | Super Cup/window disproof and current/main postponed-row mount; neither is a new refresh regression. |
| 10. Browser evidence | accept | Fresh 72 cells plus six actual 2× launch cells; geometry difference reproduced. |
| 11. Version/release state | accept-but-contest-the-characterisation | Seven in-tree strings across four files; annotated tag absent intentionally. Correctly prepared does not mean released. |
| 12. Workflow state | accept | Disabled manually; static mocked-shell exercise only. CI runs typecheck/tests/standard build, not `build:single`; both builds were run locally. |

## Generated-data provenance and the current check

1,198 fixtures = META.total; 144 UCL; six standings tables with 36/20/20/20/18/18 rows
(132 total); matchdays 1–8 have 18 fixtures each; 15 venue zones, zero unknown zones;
zero degraded tables; zero curated Moments. Statuses: 172 FT, 12 in-play, 1,014 scheduled.
Confidence: 796 exact, 402 round placeholders. All 1,054 non-UCL fixtures omit `phase`
and `season`; the 144 UCL fixtures retain both.

Against `17c24b0`, 1,198 ids survive, none are added, and all 144 present / 1,054 absent
first-seen round identities survive unchanged. Only source fetch stamps (1,198), statuses
(23), venue names (four Fenerbahçe rows), and newly supplied home/away results (11 each)
differ. Kickoffs, team identity, venue zones and all other shared fixture facts match.
The sole removed id is `supercup:401873624`, 12 Aug 2026 at 19:00Z, before the new window's
13 Aug start. It is absent from main too; this is not an omission of an in-window game.

Against main, all 1,054 non-UCL ids survive and the 144 additions are UCL. Shared row
differences are retained venue id/country (1,054 each), source fetch stamps (1,054),
status (13) and one newly completed home/away result. Standings comparisons are keyed by
team id: all 132 teams survive the first-parent comparison; all 96 main teams survive.
The changed statistical/rank fields and counts, plus fetchedAt, are enumerated in the receipt.
The baseline-path function itself is byte-identical to the first parent; Beni's ruling
to retain it is respected, including the known empty-argument behavior.

The guarded [check-only log](verification/european-week/round2-check.txt) exits 1:

```text
report: changed=true changes=7 urgent=7 standings=changed rank-moves=34 merge=hold zones-unknown=0 standings-degraded=none
```

The seven fixture changes are six in-play→FT transitions plus Strasbourg–Monaco entering
play. There are 41 changed standings rows and 34 rank moves, separately counted. This is
provider movement since the committed snapshot, not permission to stage or regenerate it.
SHA-256, nanosecond mtimes and full tracked status are identical before and after the command.
The receipt retains both sides. No writing sync was run in this pass.

## Browser and baseline

At the reviewed head, typecheck passed; 500 tests / 39 files passed; both builds passed.
Standard build: 133 modules, JS 864.17 kB / 145.89 gzip, CSS 29.14 / 6.70; single build:
895.02 / 153.22. The standard-build >500 kB advisory remains. Fixed tests total 506 / 39.

[78 measured cells](verification/european-week/round2-browser.json): the full 72 at widths
360/375/390/1000 × three lenses × two themes × three tabs, plus all six 375px Table cells
with an actual `--force-device-scale-factor=2` launch. Chrome **153.0.8010.37** on macOS;
height 900. The default launch has DPR 1, 2× launch DPR 2. CDP deviceScaleFactor is
0 (no DPR override), not a substitute for the launch flag. Fonts are loaded; viewport is
applied before navigation/measurement; lens/theme/tab and v0.5.0 / 1,198 header are asserted.
Every cell has `document.documentElement.scrollWidth === innerWidth`, no error-boundary
text, and no runtime exception. Both UCL table DOMs have 36 rows in 8/16/12 bands.
Fixtures use the week of 13 Oct, UCL-only; Moments use the actual empty curated file.

The Vite listener was PID 95141 on port 5197, whose `lsof` cwd was this exact worktree.
Only tests/docs changed after the implementation anchor; served application/data bytes match it.
At 375, all six normal cells have a 335px picker, 3 rows / 93.75px high, nav 63.5px,
1px computed borders, total chip widths 607.03125px. The actual 2× launch gives
2 rows / 62.5px, nav 65px, 1.5px borders, total widths 600.9609375px. Representative
screenshots were visually inspected; this is an environmental wrap threshold, not a new
layout defect or a reason to revisit “chips stay”.

Placeholder clocks, exact-time selectors, unknown-local pills, in-play/underway rows,
Moments' independent snapshot boundary and degraded UCL wiring were rerun through the
full suite. A separate disposable DOM probe rendered an exact-time postponed fixture
with its POSTPONED badge and old clock using both current and main's `FixtureRow` source:
both pass that observation. Pre-existing does not mean desirable; no status policy is
changed here. Apparent branch/main divergence consists of the enumerated feature,
metadata and provider deltas, not unexplained data loss.

## Boundaries and not verified

Beni's v0.5.0 and chips-stay rulings stand. No merge, tag, release-number change, deployment,
Pages dispatch, sync dispatch/enablement, writing sync, generated-file mutation, dependency
change or architecture change. PR #39 stays open. The historical Pass 1 release handoff
predates this Round 2 and must be regenerated only after final-tip Pass 2.5.

Not verified in this pass: real scheduled publication/delivery after merge, a physical
phone, every browser build, renewed populated-Moments/sticky-scroll screenshot families,
or the discarded intermediate refresh baseline. The current matrix is genuine, and
the full suite exercises synthetic honest states; older screenshots and intermediate
refresh receipts are not promoted into new live execution evidence.

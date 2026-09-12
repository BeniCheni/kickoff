# Executive Summary Brief — PR #39 · refreshed cycle, Pass 2.5 · 12 Sep 2026 EDT

**Decision: mergeable after fixes, escalated.** Pass 2's two P2 publication-test
failures reproduce at Pass 1's `25b77a4` tip and are fixed at implementation head
`0eb2617d6ff5b6101737246d14289c42ad16390d`. No remaining implementation defect was
reproduced. This is nevertheless a data-bearing release PR whose report contract changes,
`--no-merge` was explicit, and `sync.yml` is deliberately paused. The merge, annotated tag,
workflow re-enablement and release observation remain Beni's. The docs-only Pass 2.5
recording tip and its exact-head CI belong in the one live review comment; neither changes
the implementation judgment.

## What ships

- The UEFA Champions League league phase joins the domestic calendar: 144 fixtures over
  eight matchdays, each retaining its first-seen round identity and source provenance.
- Venue clocks follow the venue rather than the competition. When the provider supplies no
  mapped zone, Kickoff says local time is unknown instead of inventing one.
- The Table adds a 36-club league-phase view with two tables and contained 8/16/12 bands;
  the UCL view degrades without suppressing the domestic tables.
- Fixtures and Broadcast understand the European matchday, while Moments arrives as an
  empty-first curated tab outside the generated snapshot boundary.
- The sync report adds zone and standings-degradation fields, preserves a fail-loud
  eight-field publication contract, and places venue-zone changes after team renames.

## Where it sits

The proposed squash subject is **`v0.5.0 — Kickoff learns the European week (#39)`**.
It follows the shipped v0.4.0 sync release and v0.4.1 publication patch. Beni has settled
both the v0.5.0 number and “chips stay”; this pass does not reopen either decision. PR #39
is the last release in the currently settled train. No later version or scope has been
approved. Open ideas remain candidates, including the component-ground contrast inventory
(row 35), a design-review skill (row 40), the release-placeholder review gap (row 52), the
retained empty-baseline behavior (row 53), and the display-scale picker note (row 54) in
`docs/v0.2.6-ideas.md`.

## What the refreshed 360 found

### Severity-ordered findings

| Finding | Pass 2.5 disposition | State at the final implementation head |
|---|---|---|
| **F1 · P2 — valid degraded UCL state made three populated-table tests fail** | **Accept.** The replay harness fails 3 tests at `25b77a4`; recorded rows now seed populated assertions, exactly two table DOMs are required, and degraded navigation remains covered. | **Fixed in `0eb2617`.** |
| **F2 · P2 — valid unmapped venue zone failed the live-snapshot audit** | **Accept.** The old head fails one test. The fix keeps the recorded activation inventory strict, checks each future row against its actual evidence, retains invalid-IANA and Brooklyn assertions, and exercises five domestic clocks plus a neutral venue. | **Fixed in `0eb2617`.** The agreed unknown-local fallback is preserved, not weakened. |
| **F3 · P2 — live PR description presented historical receipts as current** | **Accept.** The old opening, counts and next step were stale. | **Fixed in PR metadata.** Historical receipts are labelled; the Pass 2.5 recording tip must be the final current header. |
| **F4 · P3 — release copy overclaimed what the extra-child warning logs** | **Accept.** The real warning gives the child count and selected phase name, not every extra child name. | **Fixed in `0eb2617`.** The provider test pins the actual warning. |

There are **zero remaining actionable findings** at the reviewed implementation head.

### Disposition ledger

| Dispute | Disposition | Independent deciding evidence |
|---|---|---|
| Pass 1's unqualified “no findings” | **Contest.** | The supported-state replay at its exact tip has two failed files, four failed tests and 496 passes. The stale body and misleading live descriptions also existed then. |
| “No application/design implementation change” | **Accept, but contest the characterisation.** | `git diff 17c24b0 25b77a4 -- src/ ':(exclude)src/data/'` is empty. The refresh still changes publication workflow, scripts, tests, docs and provenance: 16 non-data/non-doc paths, +910/−106. |
| Eight-field publication report | **Accept.** | Restoring main's six-field regex in a disposable archive makes the real extracted workflow shell fail 4/27 tests; restoring the head passes 27/27, rejects six fields and accepts non-default `zones-unknown`/`standings-degraded`. |
| `VENUE_TZ_CHANGED` rank 9 | **Accept.** | Rank 8 fails 1/49 and makes order depend on input; rank 9 passes 49/49 for both orders. `RANK` has one reader, while `mergeVerdict` uses kind names. |
| Duplicate CHANGELOG bullet | **Accept, but contest the characterisation.** | The removed 478 bytes are identical to v0.4.0. No remaining v0.5.0 bullet duplicates an older bullet; v0.4.1 and older are byte-identical to main. This is byte-comparison evidence, not a third red/green mutation. |
| Generated provenance | **Accept.** | Counts, ids, first-seen rounds and shared fields were recomputed against both parents and main; the apparent Super Cup loss is outside the 13 Aug window and absent from main. |
| Check-only sync receipt | **Accept as point-in-time evidence.** | This pass observed 17 fixture changes, 17 urgent, 36 rank moves and merge hold. Hashes, nanosecond mtimes and Git status are identical before/after. It supersedes the earlier 7/34 observation only as the current live reading. |
| Data-honesty coverage | **Accept, but contest the characterisation.** | Runtime gates and strict assertions survive. F1/F2 show the former publication suite rejected two supported honest states. `tests/uclSync.test.ts` contains nine tests, not Pass 1's quoted fifteen. |
| Killed leads | **Accept.** | The Super Cup precedes the window. Main and head both render an exact postponed row with its badge and clocks, so that behavior is pre-existing—not necessarily desirable, but not introduced here. |
| Browser result and “chips stay” | **Accept.** | 72 matrix cells plus six real 2×-launch cells pass. The two-vs-three-row 375 px difference follows the launch scale; CDP emulation was zero and is not a substitute. |
| Version state | **Accept, but contest any release implication.** | Seven release markers across four files agree on v0.5.0. The annotated tag is intentionally absent: prepared is not released. |
| Workflow and CI characterization | **Accept with correction.** | `sync.yml` is `disabled_manually`. CI runs typecheck, tests and standard build, not `build:single`; both builds were rerun locally. |

## Verification as re-run

- Anchors: PR OPEN, MERGEABLE/CLEAN; base `77c5dd23ae9c8a1b8ade41f58fe64336746cc019`;
  implementation head and remote branch `0eb2617d6ff5b6101737246d14289c42ad16390d`;
  implementation CI [34706462154](https://github.com/BeniCheni/kickoff/actions/runs/34706462154)
  succeeded with that exact `headSha`; `sync.yml` remained disabled manually; no local or
  remote v0.5.0 tag existed.
- Scope: original PR 104 paths, +29,260/−9,369; refresh 32, +3,533/−1,686; refresh outside
  data/docs 16, +910/−106; final implementation PR 109, +30,388/−9,369. The 21 paths whose
  merge results differ from both parents were independently recomputed.
- Gates at `0eb2617`: typecheck; **506/506 tests in 39 files**; standard build, 133 modules,
  JS 864.17 kB / 145.89 gzip and CSS 29.14 / 6.70; single-file build 895.02 / 153.22.
- Resilience replay: `25b77a4` = **4 failed / 496 passed** across two files; `0eb2617` =
  **506 passed**. The harness changes only scratch test modules and supplies the degraded and
  unknown-zone states in memory.
- Generated snapshot: **1,198 = META.total**, 144 UCL, six tables with
  36/20/20/20/18/18 rows, eight rounds of 18, zero unknown zones, zero degraded tables and
  zero Moments. All 1,054 domestic rows omit phase/season; every shared first-seen identity
  remains unchanged.
- Guarded live check: `changed=true changes=17 urgent=17 standings=changed rank-moves=36
  merge=hold zones-unknown=0 standings-degraded=none`; 12 in-play rows became full-time and
  five scheduled rows entered play. No tracked byte, nanosecond mtime or status changed.
- Browser: **78/78 cells**—360/375/390/1000 × three lenses × two themes × three tabs,
  plus all six 375 px Table cells under an actual `--force-device-scale-factor=2` launch.
  Fonts loaded, viewport set first, requested state/version/count asserted, both UCL table
  DOMs present, no error boundary/runtime error and `scrollWidth === innerWidth` throughout.
  Normal launch measured DPR 1 and a 3-row/93.75 px picker; actual 2× measured DPR 2 and a
  2-row/62.5 px picker.
- Release markers: package manifests, CHANGELOG and README supply seven v0.5.0 places across
  four files. `[Unreleased]` is empty and v0.5.0 remains untagged.

## Risks and accepted costs

- The committed snapshot is a dated release input, not a promise that live scores and ranks
  stop moving. The guarded check proves drift without authorizing regeneration.
- `sync.yml` must remain paused through the merge; leaving it paused afterward freezes the
  snapshot and will surface the 24-hour stale warning. Re-enable only as Beni's explicit
  post-merge release step, then observe the first scheduled publication.
- The standard bundle remains above Vite's 500 kB advisory. This is known size debt, not a
  newly reproduced functional defect.
- Step 0 still begins with the latest successful sync run. This release improves European
  venue-time honesty but does not turn Kickoff into settlement evidence or betting advice.

## Handed to the designer / next patch

- Row 35: finish the component-by-ground competition-color contrast inventory. “Chips stay”
  is settled for this release; the designer should re-mirror the shipped component.
- Row 40: turn the design-cycle verification lessons into a dedicated design-review skill.
- Row 53: Beni has accepted the empty `--baseline-dir=` behavior; retain the decision as a
  known recovery-tool edge unless he reopens it.
- Row 54: preserve both honest 375 px picker outcomes in future canvases and browser evidence.

## Questions for the CEO

None on scope or design: **v0.5.0** and **chips stay** are confirmed. The remaining decision
is the release act itself. No merge or tag is inferred from review approval.

## Beni's release handoff

Use the exact Pass 2.5 recording tip printed in the verified PR comment. Fail closed if its
diff from `0eb2617` is anything other than this brief, the docs index and the ideas-file
process notes, or if CI's `headSha` is not that tip. If Brooklyn's date has changed, update
every live release-date site in a new reviewed commit before tagging.

```text
PR #39 is mergeable after fixes. Do not merge until you have freshly confirmed that the PR
is OPEN and MERGEABLE/CLEAN; its base is 77c5dd23ae9c8a1b8ade41f58fe64336746cc019;
its head is the exact Pass 2.5 recording tip in the verified review comment; verify succeeded
with that exact headSha; sync.yml is still disabled_manually; and v0.5.0 does not exist locally
or on origin.

Squash-merge PR #39 with:

v0.5.0 — Kickoff learns the European week (#39)

The Champions League joins Kickoff: 144 league-phase fixtures across eight matchdays, honest
first-seen provenance and venue-local clocks, a 36-club two-table view with 8/16/12 bands,
European matchdays in all three lenses, and an empty-first Moments tab outside generated data.

The refreshed publication contract keeps all eight report fields, rejects honest-state test
false positives for degraded UCL and unknown venue zones, and preserves Beni's v0.5.0 and
chips-stay rulings. Refreshed Pass 1 was run by Claude; Pass 2 and independent Pass 2.5 were
run by Codex; Beni adjudicates and releases.

Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Claude <noreply@anthropic.com>

After GitHub reports the squash merged, resolve and inspect that merge SHA explicitly. From
the dedicated refresh worktree—never by switching the shared main checkout—run:

git fetch origin
MERGE_SHA="$(gh pr view 39 --json mergeCommit --jq '.mergeCommit.oid')"
test -n "$MERGE_SHA"
test "$(git rev-parse origin/main)" = "$MERGE_SHA"
git tag -a v0.5.0 -m "v0.5.0 — Kickoff learns the European week" "$MERGE_SHA"
git push origin v0.5.0
MAIN_CHECKOUT=/Users/benicheni/Documents/Claude/Projects/Kickoff
test "$(git -C "$MAIN_CHECKOUT" branch --show-current)" = main
test -z "$(git -C "$MAIN_CHECKOUT" status --porcelain)"
git -C "$MAIN_CHECKOUT" pull --ff-only
test "$(git -C "$MAIN_CHECKOUT" rev-parse HEAD)" = "$MERGE_SHA"
cd "$MAIN_CHECKOUT"
npm run typecheck
npm test
npm run build

Then enable sync.yml, confirm its state is active, and observe the first scheduled run. Report
snapshot merged, Pages deployment requested, and live bundle/header verified as three separate
facts. If the run is change-bearing, its current provider movement is expected; do not replace
the committed release snapshot by hand.
```

## Not verified

- A real scheduled sync publication after this release merge, its resulting PR/merge behavior,
  or the requested Pages deployment and live bundle: all require Beni's release action first.
- A physical phone, Safari/Firefox/other browser builds, or renewed populated-Moments and
  sticky-scroll screenshot families.
- The discarded intermediate refresh baseline as an independent truth source; both surviving
  parents and current main were used instead.
- Provider state after the guarded 12 Sep 2026 check. Its exact counts are expected to drift.

PR #39 remains open, `sync.yml` remains disabled manually, v0.5.0 remains untagged, and every
release action remains Beni's.

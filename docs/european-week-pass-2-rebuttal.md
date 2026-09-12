# European week — Pass 2 rebuttal evidence

10 Sep 2026, Codex builder seat, PR #39. This records the work behind the single Pass 2
PR comment. The cold review is [comment 5622669182](https://github.com/BeniCheni/kickoff/pull/39#issuecomment-5622669182).
The ten design rulings and Beni's canvas-plus-rulings-plus-corrections approval stand.
Beni decides the chips and release number in Round 3 after Pass 2.5; neither is changed here.

## Dispositions

| # | Severity | Disposition | Reproduction / disproof in this session | Commit |
|---|---|---|---|---|
| 1 | medium | accept | Exported `fea6497` to a disposable directory, copied the current `tests/uclSync.test.ts`, and ran `npm test -- tests/uclSync.test.ts -t 'intact league-phase child'`: both cases fail (exit 2 instead of 0). Current `npm test -- tests/uclSync.test.ts`: all 9 pass, including malformed-extra-child failure and ended-phase degradation. An intact phase child beside another valid child does not prove the phase ended. | Reviewer `b9c888d`; retained. |
| 2 | medium | accept | It was an unbriefed visible shared-component change. Read the design-system mirror and measured all fourteen fills plus both inactive grounds in both themes. The case for keeping it is below; no chip edit in Pass 2. | No new chip commit; Beni's ruling pending. |
| 3 | low | accept-but-contest-the-characterisation | Accepted-zone caching helps; the reviewer's 0.15 ms is not reproduced as a full cold schema parse. Seven fresh Node 24.15.0 processes per version, same 1,199-row pre-sync snapshot: median first parse 42.894667 → 15.766416 ms; immediate warmed parse 29.334083 → 1.811750 ms. JSON parsing/import are outside the timer. Invalid/valid/invalid remains false/true/false in every process; the regression test also exercises both orders. | Reviewer `27c5978`; retained. |
| 4 | low | accept | `git show d5d7219 -- README.md` and the current file: “built and unreleased” remains true after merge; the release number remains Beni's. | Reviewer `d5d7219`; retained. |
| 5 | low | accept | `git show d5d7219 -- docs/README.md` and the current index contain the verification record and raw-receipt path. | Reviewer `d5d7219`; retained. |
| 6 | low | accept | `rg -n '\.phase\|\.season' src scripts --glob '!*.json'` traces fixture consumers to matchday guarding, distinct from standings season/meta. `normalizeEvent` now retains these fields only for `league-phase`; a recorded-payload test covers domestic, league-phase and qualifying cases. Sync removes them from 1,055 non-league-phase rows, including all 1,051 domestic rows and four one-off trophies. | `f1ab7f3` code/tests; `1832b2c` generated snapshot. |

One wording correction to finding 1: the warning reports the child count and selected phase
name, not the names of every extra child. The code validates all children's entries and
publishes only the selected phase child's rows. The logging wording does not change that result.

## The chip case for Beni

**Recommend keep.** The measured selected-label ratios, **mirror white → current ink**, are UEFA Super Cup 5.71→5.71, Community Shield 8.63→8.63, Trophée des Champions 4.27→4.92, DFL-Supercup 8.68→8.68, Supercoppa Italiana 9.54→9.54, Supercopa de España 8.92→8.92, UCL 3.79→5.54, UEL 2.61→8.04, UECL 2.39→8.77, La Liga 3.87→5.42, Premier League 3.76→5.59, Serie A 3.39→6.20, Ligue 1 3.59→5.84 and Bundesliga 3.72→5.64. All current labels clear 4.5:1, with white retained on five fills and black on nine. Inactive **current → mirror's 0.5 opacity**, on bg/surface respectively, is light 6.00→2.15 / 6.54→2.22 and dark 8.55→3.10 / 7.40→2.94. These selectable controls are not disabled. The mirror would cost the new UCL chip its passing selected label (5.54→3.79) and leave inactive labels below AA on all four ground/theme pairs; reverting would retain nine selected-fill failures plus those inactive failures in open ideas row 35 (`docs/v0.2.6-ideas.md`). “Keep white where white passes, black only where it does not” is already the shared rule, not a narrower alternative. Applying that rule to every competition while restoring fade would be a consistent policy, not a UCL exception, but it would knowingly retain the inactive contrast failures and could not be called AA-complete. Applying the correction to UCL alone would be the exception. Keeping this shared change preserves every fill and requires the designer to re-mirror it after Beni's approval; the component and helper remain byte-for-byte unchanged in this pass.

## Main merge and the one generated sync

Merged `origin/main` **782613ba964d49a7029ccdbfc0ef31610767430c**, the PR #40 data merge,
into `codex/european-week`. The three files conflicted. No side was selected and no row
was typed. `f1ab7f3` first added a validated input-only recovery option because a sync
cannot parse Git conflict markers and must retain the branch's first-seen UCL rounds.
`git show f1ab7f3:src/data/{fixtures,standings}.json` exported each baseline into a temporary
directory outside `src/data`; then exactly one live command generated all three outputs:

```sh
npm run sync -- --baseline-dir=/tmp/p2-sync-baseline
```

Merge/sync commit **1832b2c504ff5d259d251458e85e2ef3f4fb60d2**, titled
`npm run sync 09/10/2026 2:06 PM ET`, has parents `f1ab7f3` and `782613b` and this full report:

```text
report: changed=false changes=0 urgent=0 standings=unchanged rank-moves=0 merge=auto zones-unknown=0 standings-degraded=none
```

[Full sync output](verification/european-week/pass-2-sync.txt). `changed=false` describes the
fixture/standings diff contract: storage cleanup and fresh fetch timestamps still change the
files. Comparison by id proves all first-seen rounds and other fixture facts unchanged;
`phase`/`season` disappear from the non-league-phase rows, and `source.fetchedAt` refreshes.
The sync-only commit differs from its first parent solely in the three generated files.
Future bot merges at `23 1,4,7,10,13,16,19,22 * * *` UTC may recreate a conflict until PR #39 merges.

## Recount, checks and browser correction

- Fixture array **1,199 = META.total 1,199**; **144 UCL** events; six tables with
  UCL/La Liga/PL/Serie A/Ligue 1/Bundesliga counts **36/20/20/20/18/18**.
  `lastSyncAt` is **2026-09-10T18:06:15.099Z**; window 11 Aug 2026–7 Feb 2027.
- **457 tests in 37 files**, both Vitest projects; typecheck and production build green
  before the preparation and merge/sync commits. No honesty assertion was weakened.
  The five baseline-recovery cases cover missing/corrupt input, write destinations, retained
  first-seen round, and retained absence; the normalizer adds one evidence-scope case.
- Same-snapshot metadata-only experiment: **61,913 bytes raw / 3,348 gzip** saved.
  Actual JSON **759,584 → 697,671 bytes**, gzip **57,105 → 53,763** (fetch stamps also changed).
  Same-environment production JS **913.54 → 864.28 kB**, gzip **147.90 → 145.78 kB**.
  The reviewer's main-build and gzip figures are prior evidence, not these measurements.
- **72 browser cells**: 3 lenses × 2 themes × 3 tabs × 360/375/390/1000, height 850.
  All assert root scroll width equals viewport width, correct lens/theme/tab and a mounted
  application. All 24 Table cells contain both mobile and desktop **8/16/12** bands.
  Moments remains empty. Six real MD1 clock pairs pass again at 390 Ledger:
  AEK/Fenerbahce **19:45 local / 12:45 PM EDT**; Porto/Liverpool/Sporting/Manchester United
  **20:00 local / 3:00 PM EDT**.
- The unconditional **375 = three rows** claim is withdrawn. At the same verified 375 px
  effective width, default headless Chrome on this Mac reproduces three rows / 93.75 px
  picker / 63.5 px nav; launching Chrome with `--force-device-scale-factor=2` reproduces
  the reviewer's **two rows / 62.5 px / 65 px**, in all six lens/theme cells. Computed chip
  borders change from 1 to 1.5 px and glyph widths differ. Both probes used CDP emulated
  device scale 1; the evidence records the launch flag as well as the emulated setting.
  `docs/european-week-verification.md` now distinguishes the two conditions. No CSS changed.

Raw [Pass 2 receipt](verification/european-week/pass-2.json) includes every cell, clock text,
contrast ratio, seven timing runs per version and both layout probes. The timing command
was `node /tmp/p2-benchmark.mjs`; its [archived parameterized harness](verification/european-week/pass-2-benchmark.mjs)
takes before/after checkout paths, used at `fea6497` and `eba4e80` with dependencies available
and before the re-sync. The chip command was `./node_modules/.bin/tsx /tmp/p2-chip-math.ts`;
the [archived calculation](verification/european-week/pass-2-chip-math.ts) imports repo tokens
and the independent contrast helper. Browser commands were `node /tmp/p2-matrix.mjs`,
`node /tmp/p2-clocks.mjs` and the two layout probes; selectors and measured boxes are in the
receipt. The 375 screenshot is linked from the corrected implementation record.

## Not done

No PR merge, version bump, tag or release section; Beni cuts the number in Round 3 after
Pass 2.5. No chip revert, extension or design-system edit before Beni's ruling. No replay
of the reviewer's sticky, domestic-box, synthetic-state or populated-Moments checks: the
re-sync changes none of those fixture facts or UI code, and the requested refreshed matrix,
clocks and bands were rerun. Existing designer copy/still confirmations remain open.
Pass 2.5 independently reruns these claims and writes the Executive Summary Brief.

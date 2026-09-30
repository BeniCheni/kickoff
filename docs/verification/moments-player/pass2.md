# PR #128 — Pass 2 verification

Codex, 29 September 2026. This is rebuttal evidence, not merge, release, live-provider or
publication approval. The architecture records Beni's five rulings. Production remains `[]`.

## Provenance

- Baseline `76a0421a2240f159b689ad6d672c8c61b3d8a549`: typecheck, 688 tests / 51 files.
- Brief archive `07ad532`: same source/test tree and baseline checks.
- Fixes `529af8c4da0bcb39e32a9c01b3fbd7723e240806`: typecheck, 717 tests / 51 files.
- Final application source `5d68da3d850cff1e4ebb87bac94937a08171e9de`: typecheck, 719 tests /
  51 files; both builds. Subsequent receipt/checker edits do not change the application.
- Base `8cb9d87c531ffce3c609f98e0da557c26027d432` shares the PR's generated-data snapshot.
  Newer main was not merged or rebased.
- Runtime: Chrome 154.0.8037.58, existing Playwright 1.62.1, headless, DPR 1, reduced motion.
  `localhost:5189` serves a frozen archive of application source `5d68da3` at
  `/Users/benicheni/kickoff-pr128-pass2/frozen`. Ports 8863/8864 serve base/tip production builds.
  The frozen copy has two scratch probe entries; they are not production imports or committed.

The [machine summary](pass2.json) records measurements and hashes of the underlying local
receipts. Original builder and Pass 1 receipts remain historical. Detailed local evidence and
adapted copies of Pass 1's probes are in `/Users/benicheni/kickoff-pr128-pass2`; the original
`/Users/benicheni/kickoff-pr128-review` was not used as an execution/output directory.

## Results

- Inert: **72/72** equal body text, **72/72** PNGs (advisory), **144/144** overflow-free
  loads, no media elements, page errors or provider requests; **634** font requests.
- Player: **1260 cells / 404 journeys / 17 captures**, no page errors or provider,
  unexpected or failed requests; **6906** font requests. Original 290 journeys plus 24
  Play→Next hit-tests and 90 unreadable-read feedback journeys. Cinema DOM/AX checked per cell.
- Markup: **35/35** normalized markup and URL comparisons (29 Fixtures/Table/error/query,
  six empty Moments). Exactly three raw differences per cell.
- Layout: **180/180** equal element-box comparisons (30 cells × six scroll offsets).
- Six independent checker mutations fail; restored full checker passes.
- Geometry: 72 contrast cells, minimum **5.44:1**, no failures, minimum type **10px**.
  D-04 360 Broadcast: action bottom **779.11**, vertical margin **64.89** in both themes.
- Coordinate-click Cinema entry/exit holds document scroll at **120/120/120** at 390/1000.
- Real adapter against stub: returning item keeps position **42** and resume feedback;
  both permitted iframe attributes present; no iframe before Play. Nine provider requests
  attempted and aborted; zero reached the provider. Real playback is not verified.
- Retry fault probe: position **7** preserved, status **paused**, primary **Play**, no frame;
  retrying the host does not reopen Cinema. Owner fault removes inert before focus and leaves
  the shell available. All 12 copied scratch probes run successfully after path/dependency repair.
- Final application source: typecheck and **719 tests / 51 files**, both production builds,
  clean bundle isolation. Six 390px Fixtures lens/theme captures and five player captures
  (phone stage, phone Cinema recovery/playing, and 888px Cinema) visually inspected.


Beni accepted exactly one route wrapper and the header/tab background data attributes on
Fixtures and Table, **29 Sep 2026**. Removing exactly those three gives identical markup and
URL state in 29 shell/error/query cases. Six empty Moments cells independently show the same
three; his yes named Fixtures/Table. A fourth difference is not covered by the ruling.

The AX mutation originally stayed green because Chrome exposes the CSS-uppercase labels in
uppercase, while the checker compared title case. Names now compare case-insensitively. The
independent AX mutation removes header inert and the dialog's modal hint after DOM assertions;
otherwise either isolation mechanism can keep the background out of the AX tree. All six
mutations now fail at their intended assertion. The nonempty-enumeration mutation also guards
against vacuous success. Capture order is tested by moving capture after row scrolling.

Earlier runs are not passing receipts: a live dev reload stopped one matrix at 672 cells;
the first 1260-cell run failed an old keyboard journey after the deliberate F12 behavior
change; a journey preflight completed 390 behaviors but failed its request check on one
interrupted local request. Final runs use frozen source, the corrected key sequence and AX
normalization. PNG hashes remain advisory; old Pass 1 counts of six differing images were
not rederived. Current captures precede row scrolling.

## Reproduce the primary checks

Use a fresh output directory per run. Start a Vite server from the reviewed checkout without
editing it during a run. Build the base and tip from the same snapshot into separate scratch
folders and serve their `dist` directories on the two loopback ports. No install is required.
The scripts abort provider hosts; do not remove that protection.

```sh
RT=/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ORIGIN=http://localhost:5189
OUT=/absolute/path/to/new-pass2-evidence
npm run typecheck
npm test
npm run build
npm run build:single
node docs/verification/moments-player/check-player.mjs "$RT" "$CHROME" "$ORIGIN" "$OUT/player"
node docs/verification/moments-player/check-mutations.mjs "$RT" "$CHROME" "$ORIGIN" "$OUT/mutations"
node docs/verification/moments-foundation/check-browser.mjs "$RT" "$CHROME" http://127.0.0.1:8863 http://127.0.0.1:8864 "$OUT/inert"
rg -n 'moments-player-mock|Moments gallery verification harness|Fictional selection|pkEpLtePJm0|iBuTEywEQ6U|sXAkBsEcXSo|tests/harness' dist dist-single
```

The last command must print nothing (exit 1 for no matches). Each provider URL, `player fault`,
`autoplay; encrypted-media` and `strict-origin-when-cross-origin` occurs once per build;
`ytimg` and `googlevideo` do not. `src/main.tsx` passes neither player prop and no `src` module
imports tests. Package files, index.html, workflows, generated data and curation are unchanged.

## Regression and supplementary probes

All file swaps were in disposable scratch copies, never the served frozen app.

- `python3 /Users/benicheni/kickoff-pr128-pass2/reproduce-pass1.py`: swaps the earlier adapter,
  host, recovery and session files under `76a0421` tests. F1/F9, F2, F4, F5 and F6 go red against
  their parents and green restored. Logs identify each source SHA.
- `python3 /Users/benicheni/kickoff-pr128-pass2/reproduce-pass2.py`: in a fresh scratch archive,
  uses `git show 529af8c^:<path>` under new tests. R1/R4/R5 adapter, R2 storage, F12 keyboard,
  F20 host and reducer go red, then green at `529af8c`. It separately mutates the retired-state
  guard and proves the new F14 test fails. Script refuses reuse of its scratch destination.
- `python3 /Users/benicheni/kickoff-pr128-pass2/f14-original.py`: the retired-guard mutant at
  `f632e10` still passes all 21 original adapter tests. This confirms the old coverage gap.
- Two additional tests in `tests/dom/momentsPlayer.test.ts` named `a second Play during an
  unsettled resume` fail at `529af8c` and pass at `5d68da3`, with/without retirement. They
  require the 42-second seek on the second load and no pre-start position/label.
- `U=npx vitest run` with `tests/momentsRecovery.test.ts`, `tests/dom/momentsPlayer.test.ts`,
  `tests/dom/momentsPlayerHost.test.tsx`, `tests/momentsQueue.test.ts` gives durable regressions.
  The fake no longer fabricates state 5 after load. Method absence before ready is a stress
  condition, not a statement that the reference requires absence.

The adapted copied probes use the same `$RT`, `$CHROME`, `$ORIGIN` arguments above:

```sh
P=/Users/benicheni/kickoff-pr128-pass2/pass1
E=/absolute/path/to/new-supplementary-evidence
node "$P/cinema-probe.mjs" "$RT" "$CHROME" "$ORIGIN" "$E/cinema.json"
node "$P/cinema-back.mjs" "$RT" "$CHROME" "$ORIGIN" > "$E/cinema-back.log"
node "$P/geometry.mjs" "$RT" "$CHROME" "$ORIGIN" "$E/geometry.json"
node "$P/focus-exits.mjs" "$RT" "$CHROME" "$ORIGIN" > "$E/focus-exits.log"
node "$P/tab-frames.mjs" "$RT" "$CHROME" "$ORIGIN" > "$E/tab-frames.log"
node "$P/layout-probe.mjs" "$RT" "$CHROME" http://127.0.0.1:8863 http://127.0.0.1:8864 "$E/layout.json"
node "$P/real-adapter.mjs" "$RT" "$CHROME" "$ORIGIN" "$E/real-adapter.json" "$PWD/dist-single/index.html"
PR128_OUT="$E/markup.json" node "$P/pr128-reproduce.mjs" HEAD 8cb9d87 "$E/markup-scratch"
```

`geometry`, `focus-exits` and `real-adapter` need the copied `_probe_real.html/.tsx` dev entries.
Copy them only into a disposable served checkout. The markup script strips its invalid
`MomentCard` export and runs its Node-output probe independently of application typecheck.
It covers 29 Fixtures/Table/query/error cases and the six added empty Moments cases. Scratch
probe symlinks must point at this checkout's dependency copy, not the original review checkout;
otherwise two React copies cause invalid-hook-call errors. That failed setup run was discarded.

The real-adapter stub now accepts the documented object load as well as the old positional
form, emits synthetic -1/3 at zero, then applies startSeconds before playing. It simplifies
asynchronous behavior, nearest-keyframe seeking and user/provider playback restrictions.
The provider-free browser run attempted nine provider requests, all aborted (also DNS blocked),
with **zero allowed through**. Mock/inert runs have zero provider attempts. Script-error Retry
removes each failed script; zero retained elements after errors does not mean no attempted load.

## Not verified

Physical devices, Safari/Firefox, screen-reader speech, browser zoom, unlisted widths, Android
or iOS Back, CloseWatcher, exhaustive navigation timing, and third-party API-ready callback
interoperation. No real-provider playback, rights, ads, readiness duration, error153, Pages
Referer, one-press autoplay, attribute preservation, 16:10 letterboxing, or continued decoding
in a parked/clipped instance was verified. File-origin output was measured in Chrome only.
Row 65's Cinema reading order, row 66's copy, row 68's single-file Play decision and the other
unsealed designer strings remain deliberately deferred. No provider run is authorized here.

# Slice 1 builder validation receipt

This is builder acceptance evidence, not independent review or release approval. The exact PR
head is recorded in the PR body; `browser-receipt.json` identifies the tested source/build bytes
without attempting to embed a commit's own hash inside itself.

- Base: `c108e6894a28902e585a3099bd6b3efcf9b9e186`, refreshed from origin/main.
- Isolated worktree: `/Users/benicheni/.codex/worktrees/moments-foundation/Kickoff`.
- Branch: `codex/moments-foundation`.
- Original checkout: detached `f124e150e91df86504fda2f62ae0033fe66bde8c` with existing tracked
  package/lock, generated data, competitions and ESPN-test changes plus untracked files.
  Those files were not imported or changed. Existing installed dependencies were copied into
  the isolated worktree, not installed or symlinked back to the main checkout's writable cache.
- Baseline: typecheck passed; 522 tests in 41 files passed; standard build passed.
- Foundation: typecheck passed; **581 tests in 44 files passed**; standard and single-file builds
  passed, both validating zero curated moments. The standard build retains its baseline large
  bundle warning. No data-honesty assertion was changed.

## Browser comparison

Installed Chrome **154.0.8037.58**, headless via an existing bundled Playwright runtime (no
project dependency/install). Both actual static production builds served on separate loopback
ports. Device scale 1, reduced motion, frozen browser clock `2026-09-27T02:40:00Z`, identical
`date=2026-09-26` query and committed data. The freeze permits deterministic screenshot comparison;
it does not claim live-clock or normal-motion acceptance.

All **72 cells**: widths 360/375/390/1000 × Ledger/Poster/Broadcast × light/dark ×
Fixtures/Table/Moments. Viewport explicitly set before each capture. Every cell passed
`scrollWidth === innerWidth`, contained zero iframe/video/audio elements, and had identical
full-page screenshot and body-text hashes to the base build. Zero page errors. All 72 viewport
regions were visually inspected on 12 labelled contact sheets; no exhaustive below-fold visual
inspection is claimed. Existing Moments stays empty/link-only in every lens/theme.

Media-provider requests: **0**, including subdomains of youtube.com, youtube-nocookie.com,
ytimg.com and googlevideo.com. A route guard records and blocks attempted provider requests;
any attempt fails the check, so an aborted request cannot masquerade as zero intent.

Google Fonts, separately: **317 requests per build** (73 fonts.googleapis.com stylesheet
requests, 244 fonts.gstatic.com font requests), including the initial warm-up page. These are
expected from the unchanged index.html. No other external requests or request failures recorded.

These are the original builder run's results, not a guarantee of byte-identical future captures.
Pass 1's independent rerun recorded 72/72 equal text hashes but only 69/72 equal PNG hashes on
first capture: Poster 360 light Moments, 360 dark Fixtures and 390 dark Table differed. The
reviewer reported matching hashes on both subsequent recaptures of all three cells. Preserve
that flake alongside the original receipt rather than rewriting its historical measurements.

The compact checked-in JSON has all original cell results, capture hashes and build/source identities.
Raw PNGs, contact sheets and the full request ledger are local under
`/tmp/moments-foundation-browser/`; they are not published as design artifacts.

To reproduce, build the named base and PR head in separate isolated checkouts using existing
dependencies, serve their `dist` directories on separate loopback ports, and run:

```sh
node docs/verification/moments-foundation/check-browser.mjs \
  /absolute/path/to/existing/playwright/index.mjs \
  /absolute/path/to/installed/Chrome \
  http://127.0.0.1:8841 http://127.0.0.1:8842 /tmp/moments-foundation-browser-rerun
```

The script only measures/captures; it does not build, install, sync, mutate source data or access
a provider. A nonidentical text result, media-provider or unexpected-host attempt, external
request failure, page error or overflow fails. PNG identity is advisory: recapture mismatches
and visually inspect persistent differences; text identity alone cannot establish layout parity.
Fonts remain an expected external dependency. Use the script from this PR against both
builds, not R3's sealed scripts.

## Not verified

This original receipt did not verify independent review. Pass 1 and Pass 2 results are recorded
separately in PR #113's comments. Still not verified: independent R3 review; populated future gallery/Cinema;
integrated stable-owner/player-host behavior; genuine provider playback, completion, continuity,
seek, ads/audio/captions/focus; current asset availability/rights/territory; physical phones;
Safari/other engines; actual screen readers; normal-motion/zoom acceptance; production performance;
initial collection publication and live deployment. Slice 1 supplies no adapter or live request.

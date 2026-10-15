# N1 verification receipts

Baseline: main `2837b011c9830ff37260d15907ad597efcea529e`. Local environment:
Node 24.15.0, npm 11.12.1, macOS. Read date: 2026-10-15, after running
`TZ=America/New_York date`. Receipts describe the N1 build, not public delivery.

## Reader identity (step 5)

Before edits: `npm ci --no-audit --no-fund`, `npm run typecheck`, `npm test`,
`npm run build`, `npm run build:single`: all passed; 879 tests in 56 files.
Complete baseline trees are preserved outside the checkout at
`/Users/benicheni/kickoff-n1-evidence/baseline/`.

After steps 1–4: the same root typecheck/tests/builds passed; 883 tests in 57 files
(the four new root isolation assertions). Run the comparison after both builds:

```sh
node web/scripts/check-reader-parity.mjs /Users/benicheni/kickoff-n1-evidence/baseline
```

[reader-parity.json](reader-parity.json) records every relative path, byte count and
SHA-256: all 7 files in dist/ and all 5 in dist-single/ are identical to the
merge-base copies. This includes the 39,043-byte stylesheet and the 1,080,818-byte
single-file HTML. For this inert slice, the brief explicitly accepts byte identity
as the reader's 72-cell parity proof. No migrated-app parity or playback is claimed.

## Deliberate failures (steps 2–3)

Each break was removed before committing. CSS checks fail with the reader's web
exclusion removed; with web's explicit sources widened to src/; and with its sources
widened to docs/. For the latter two probes only, Turbopack's root was also widened
in the uncommitted config, because its configured web root independently rejects
outside sources. Restored builds pass: web's probe is present, absent from the
reader, and 343 reader utility selectors plus the archived-doc markers are absent
from web. Studio's existing reader marker is absent too.

`node web/scripts/prove-isolation.mjs <evidence-directory>` reproduces five red/green
pairs in disposable copies: src → web; web → Studio; root Vitest discovering web;
root TypeScript selecting web; web Vitest discovering root tests. It then fails
13 separate injected client markers, and passes after removing them. The scanner
requires at least one built JS file; the clean build has 9. The actual test outputs
and exit codes are retained in the local evidence directory's isolation-red-green/.
No real credentials or real database addresses are test inputs.

The first CI Studio scan caught literal URL-scheme markers in the two new scanner
scripts as possible credentials. The markers are now assembled from pieces at
runtime, preserving the full leak checks; Studio's tests and scanner are unchanged.

## CI (step 4)

Exactly one job, verify, remains in ci.yml, without path filters or conditional
skips. Root install/typecheck/tests/build run first; then web install/typecheck/tests/
build, client scan and both CSS directions. Both lockfiles participate in the npm
cache. Telemetry is disabled at job scope and in all Next package scripts; no secret
is referenced. Data-only PRs match the same unfiltered pull_request trigger and run
the same commands. A new real sync-bot merge is not performed by N1.

Baseline main run [38757569687](https://github.com/BeniCheni/kickoff/actions/runs/38757569687)
ran verify in 54 seconds. Step-4 run
[38762967117](https://github.com/BeniCheni/kickoff/actions/runs/38762967117) at
434cda391aec31454bed1fbef330a15ab4419e42 passed in 71 seconds: +17 seconds wall time.
This is an observed runner comparison, not a performance guarantee; cache and runner
load differ. Later exact-tip receipts belong in the PR body.

pages.yml, sync.yml and studio.yml are unchanged. src/index.css makes studio.yml run
under its existing filter. Its original reader-CSS probe still passes; verify now
also checks the same marker. No workflow dispatch, merge or deployment is requested.

## Final inventory and local scaffold check (steps 6–7)

`node web/scripts/probe-server-imports.mjs` records eleven modules in two fresh
Node processes each; [server-imports.json](server-imports.json) includes exact
accessing lines and reader call sites. The [contract inventory](../../docs/nextjs-migration-n1-inventory.md)
maps every current list/detail column, the missing design facts, private Studio
states, grants, sources and versions. After writing it, root typecheck, 883 tests
in 57 files, both root builds, web typecheck, 2 tests in 2 files, web build and both
bundle guards passed. All 12 reader build files still matched the baseline.

The production scaffold was opened at 127.0.0.1:5174 in the built-in browser.
At measured widths 360, 375, 390 and 1000, document scroll width equalled viewport
width. Its only content was the unreleased-scaffold heading and disclosure; zero
image/video/iframe elements and no page warning/error logs. Temporary tabs and
viewport overrides were cleaned up. This is a scaffold smoke check, not a migrated
reader matrix. The explicit byte-identity acceptance rule covers the reader here.

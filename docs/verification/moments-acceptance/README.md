# Moments slice 4 — S2–S3 builder evidence

A green stub is not playback. These receipts exercise the real adapter against a locally
fulfilled API and empty frame, and the archival gallery against its deterministic mock.
They establish no provider playback, rights, ads, actual readiness timing or seek accuracy.
Production curation remains `[]`; readers see the same empty shelf and no player request.

## Sources and runtime

- Merge base / snapshot: `7636b0871c9a10db53e9a00ad3811cc7093efa6c`.
- Claude docs cherry-pick / pre-gate source: `070a625d5d3f734b93379e3998db917c9e57a843`.
- Application, build and test source: `75dcb944067f2ced3d1bd69ccc2b07f75d4f0373`.
  Later commits contain verification tooling, documentation and receipts only.
- Google Chrome **154.0.8037.58**, Playwright **1.62.1**, Node **24.15.0**; headless,
  DPR 1, reduced motion. No dependency was added. `npm ci` ran once in the build worktree.
- Frozen archives under `/tmp/kickoff-moments-s4/{base,tip}`, sharing that dependency copy.
  Production ports **8871/8872**; base/tip harness ports **5191/5192**; acceptance **8873**.
  No served archive was edited during a run. Base and tip have identical generated data.
- `fixture-provenance.json` copies six rows from snapshot
  `1fad3427dfeeeae4a642b6996fe1a114f4640d63`. The edition projects those facts, and its node
  test asserts absence from the current snapshot. All five video IDs are fictional.
  `parseMoments` skips fixture cross-checks for these absent IDs; only the node test compares
  their facts with `fixture-provenance.json`, and no automated check compares that file with
  `1fad342` itself (the same validation limit applies to a real edition outside the window).

Every JSON receipt wraps the original checker result with the build provenance. The
[manifest](receipts/provenance.json) names all five served builds. Machine geometry,
hit-tests and state transitions carry the assertions; generated screenshots stay in the
local run directories, with hashes in the matrix receipts, except the two 360px captures
that document the label-wrapping limitation below. PNG equality is advisory.

## Results

| Check | Result | Machine evidence |
|---|---|---|
| Base checks | Typecheck; 720 tests / 51 files | [log](receipts/base-tests.log) |
| Application checks | Typecheck; 738 tests / 53 files | [log](receipts/application-tests.log) |
| Permission regression | Before: 16 fail / 1 pass; after: 17 pass | [red/green](receipts/permission-red-green.json) |
| Base player matrix | 1,260 cells; 404 journeys; 17 captures; zero errors/provider requests | [summary](receipts/base-player.json), [cells](receipts/base-cells.json) |
| Tip player matrix | 1,260 cells; 404 journeys; 17 captures; zero errors/provider requests | [summary](receipts/tip-player.json), [cells](receipts/tip-cells.json) |
| Checker mutations | All six fail at the intended assertion, at base and tip | [base](receipts/base-mutations.json), [tip](receipts/tip-mutations.json) |
| Production inert | 72/72 equal body text; 72/72 equal PNGs; 144 overflow-free loads; no media, errors or provider requests | [inert](receipts/inert.json) |
| Production layout | 180/180 equal element-box lists, including the shared route wrapper; equal URLs and no overflow | [layout](receipts/layout.json) |
| Real adapter / local stub | Both method-timing variants × 360/390/1000; 72 runs, 324 checkpoints; zero provider egress | [stub](receipts/real-adapter.json) |
| Build isolation | Both production forms exclude every acceptance ID and marker; poison environment and explicit acceptance mode cannot substitute; replacement works; invalid schema/fixture input fails before bundling | [builds](receipts/build-isolation.json) |

The permission regression covers permitted, no permission, unknown, denied, revoked,
expiry at/before now, future checkedAt, unverified/missing content, unknown scope, legacy
links, clock-tick lapse from loading/playing/blocked/ended, focus catch-up, and direct Play
or Replay creating no attempt or adapter call. Archival examples receive no permissions.

The stub journeys cover cold Play, stage/Cinema, park/return on the same frame and parent,
Next/Previous with `startSeconds: 42`, a zero sample without the resume sentence followed
by a positive sample with it, 150/2/100/153, explicit Retry, failing permissions on both
surfaces, player-lost Retry and tab return. A one-shot browser layout getter fault at Cinema
entry drives the real player boundary; no application test prop or dev entry is added.
Five navigation actions also run between construction and ready, in both stub variants at
all three widths. These are simplified synchronous API states, not provider observations.

All browser contexts abort the complete provider predicate (`youtube.com`, `youtu.be`,
`youtube-nocookie.com`, `ytimg.com`, `googlevideo.com`, `ggpht.com`, plus subdomains).
Only the stub locally fulfils `/iframe_api` and the two fictional nocookie frame URLs.
The passing stub run fulfils 138 provider-shaped requests locally, aborts zero additional
provider requests, and lets zero reach the provider.
It also disables service workers and DNS resolution for those domains. Every checkpoint
asserts no horizontal overflow and at most one iframe; pre-Play checkpoints permit only
Google Fonts outside the loopback app. Provider responses outside local routing fail the
run. Production and mock runs have zero provider attempts.

## Reproduce

Run from an isolated checkout at the reviewed tip. The commands below do not install a
browser/runtime, contact a provider, dispatch a workflow or change curation. Keep all served
source frozen. Use new scratch/output directories; the mutation, isolation and regression
scripts deliberately refuse reuse. The acceptance command requires Git history because it
validates against the committed snapshot.

```sh
RT=/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
BASE=$(git merge-base HEAD origin/main)
TIP=$(git rev-parse HEAD)
REPO=$PWD
RUN=$(mktemp -d /tmp/kickoff-s4-XXXXXX)
mkdir "$RUN/base" "$RUN/tip" "$RUN/evidence"
git diff --exit-code "$BASE" "$TIP" -- src/data

git archive "$BASE" | tar -x -C "$RUN/base"
git archive "$TIP" | tar -x -C "$RUN/tip"
ln -s "$REPO/node_modules" "$RUN/base/node_modules"
ln -s "$REPO/node_modules" "$RUN/tip/node_modules"
npm run typecheck
npm test
(cd "$RUN/base" && npm run build)
(cd "$RUN/tip" && npm run build && npm run build:single)
npm run build:acceptance
cp -R dist-acceptance "$RUN/tip/dist-acceptance"
```

Start these in separate terminals (substitute the printed `$RUN` path). Each static server
and harness gets its own loopback port. Do not change those directories until all runs end.

```sh
python3 -m http.server 8871 --bind 127.0.0.1 --directory "$RUN/base/dist"
python3 -m http.server 8872 --bind 127.0.0.1 --directory "$RUN/tip/dist"
python3 -m http.server 8873 --bind 127.0.0.1 --directory "$RUN/tip/dist-acceptance"
(cd "$RUN/base" && npm run dev -- --host 127.0.0.1 --port 5191 --strictPort)
(cd "$RUN/tip" && npm run dev -- --host 127.0.0.1 --port 5192 --strictPort)
```

From the reviewed checkout, using the same variables:

```sh
P=docs/verification/moments-player
A=docs/verification/moments-acceptance
node "$RUN/base/$P/check-player.mjs" "$RT" "$CHROME" http://127.0.0.1:5191 "$RUN/evidence/base-player"
node "$P/check-player.mjs" "$RT" "$CHROME" http://127.0.0.1:5192 "$RUN/evidence/tip-player"
node "$RUN/base/$P/check-mutations.mjs" "$RT" "$CHROME" http://127.0.0.1:5191 "$RUN/evidence/base-mutations"
node "$P/check-mutations.mjs" "$RT" "$CHROME" http://127.0.0.1:5192 "$RUN/evidence/tip-mutations"
node docs/verification/moments-foundation/check-browser.mjs "$RT" "$CHROME" http://127.0.0.1:8871 http://127.0.0.1:8872 "$RUN/evidence/inert"
node "$A/layout-probe.mjs" "$RT" "$CHROME" http://127.0.0.1:8871 http://127.0.0.1:8872 "$RUN/evidence/layout.json"
node "$A/real-adapter.mjs" "$RT" "$CHROME" http://127.0.0.1:8873 "$RUN/evidence/real-adapter.json"
node "$A/reproduce-permission.mjs" 070a625 75dcb94 "$RUN/evidence/permission"
node "$A/check-build-isolation.mjs" "$RUN/evidence/isolation"
```

Build isolation scans `dist/` and `dist-single/` for every edition ID, all five video IDs,
the title/root markers and a replacement sentinel. It builds with nonexistent input paths
in `MOMENTS_EDITION`, `VITE_MOMENTS_EDITION` and `MOMENTS_ACCEPTANCE_EDITION`, plus
`MODE=acceptance` and `VITE_MODE=acceptance`. It also tries `npm run build -- --mode acceptance`.
All scans are empty. This is backed by the structural boundary: no acceptance plugin or path
reader exists in `vite.config.ts`; only the separate script installs the replacement plugin.
This claim concerns the build's supported configuration, not arbitrary executable injection
through Node or shell environment variables. The replacement and two validation failures are
run in the checkout's ignored output, separate from the already frozen served bundles.

The equivalent grep (no matches, exit 1) is:

```sh
rg -n 'S4Accept00[1-5]|acceptance-[1-6]|Moments acceptance|momentsAcceptance|Fictional acceptance|S4Replace01|Replacement sentinel' dist dist-single
```

S4 can pass a replacement file without editing committed curation:

```sh
npm run build:acceptance -- /absolute/path/to/authorized-edition.json
```

That builds a local artifact only. It grants no authority to load its IDs from a provider.
The committed stub intentionally fulfils only its two fictional identities.

## Probe repair and remaining limitation

The first immediate-coordinate probe timed out after Next at 360px: the first selection
remained active and the parent received no Next pointer/click event. [Event log](receipts/unsettled-pointer.log), [partial diagnostic receipt](receipts/unsettled-pointer.json).
Explicit scroll settlement (two animation frames) plus a checked center hit fixes the probe
without an application change. This is not proof of a product bug or proof that rapid reader
interaction is safe. Ideas row 71 preserves that uncharacterized boundary. To reproduce the
original sequence, prefix the real-adapter command with `UNSETTLED=1`; that is deliberately
not the acceptance receipt. Initial probe failures are not passing evidence.

The 360px Ledger-light stage wraps Pause inside the word beside the long archival source
link and Save reference, at both [base](receipts/base-360-ledger-light-stage-playing.png)
and [tip](receipts/tip-360-ledger-light-stage-playing.png). This is not horizontal overflow;
ideas row 72 records the unchanged populated-layout issue. The 390px Poster-dark Cinema
capture was also visually inspected. No screenshot establishes playback.

## Not verified

Real playback, content, rights, ads, ready-window duration, nearest-keyframe seeking,
one-press autoplay, real-provider attribute retention, parked decoding, Pages Referer or
error 153, physical devices, Safari/Firefox, screen-reader speech, browser zoom, Android/iOS
Back, CloseWatcher, and exhaustive rapid navigation timing. Rows 65, 66 and 68 remain as
written. The stub's green results are builder evidence, not independent review or approval.
No version, tag, release, publication, workflow change or dispatch belongs to this PR.

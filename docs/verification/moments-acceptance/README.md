# Moments slice 4 — S2–S3 builder evidence

A green stub is not playback. These receipts exercise the real adapter against a locally
fulfilled API and empty frame, and the archival gallery against its deterministic mock.
They establish no provider playback, rights, ads, actual readiness timing or seek accuracy.
Production curation remains `[]`; readers see the same empty shelf and no player request.

## Sources and runtime

- Merge base / snapshot: `7636b0871c9a10db53e9a00ad3811cc7093efa6c`.
- Claude docs cherry-pick / pre-gate source: `070a625d5d3f734b93379e3998db917c9e57a843`.
- Original gate source: `75dcb944067f2ced3d1bd69ccc2b07f75d4f0373` (historical permission regression).
- Focus-fix application, test and probe source: `a23c7f8391e74331d1c9c756846b2ad15ce9c3c4`.
  The red control is untouched `c846fa0e338ab96f83cf177ab86452922b9419be`.
  The starting docs-only tip was `3092fa0f0bb8a076748b9613c8e2ac12d66d22a6`;
  its application, tests and build source matched that red control byte for byte.
  The subsequent receipt commit contains no application change.
- Rebuttal baseline: `0a9a3c2b83a1daba8adaa1544f425746fb470f93`; brief archive: `895c637`.
- Google Chrome **154.0.8037.93**, Playwright **1.62.1**, Node **24.15.0**; headless,
  DPR 1, reduced motion. No dependency was added or installed for this focus fix; the existing dependency copy was shared.
- Fresh frozen archives under `/tmp/pr138-focus-receipts-p_1epuvu/{base,tip,red}`,
  sharing the existing dependency copy. Production ports **9111/9112**;
  base/tip harness ports **5211/5212**; acceptance **9113**; replacement lapse edition
  **9114**; untouched red lapse bundle **9115**. Temporary local Git commits only
  enable snapshot validation; their tree hashes match the named source archives.
  No served archive was edited during a run. Base and tip have identical generated data.
- `fixture-provenance.json` copies six rows from snapshot
  `1fad3427dfeeeae4a642b6996fe1a114f4640d63`. The edition projects those facts, and its node
  test asserts absence from the current snapshot. All five video IDs are fictional.
  `parseMoments` skips fixture cross-checks for these absent IDs; only the node test compares
  their facts with `fixture-provenance.json`, and no automated check compares that file with
  `1fad342` itself (the same validation limit applies to a real edition outside the window).

Current checker receipts wrap each fresh result with build provenance; the manifest,
integrity record and unchanged historical diagnostics keep their own shapes. The
[manifest](receipts/provenance.json) names the served builds. Machine geometry,
hit-tests and state transitions carry the assertions; generated screenshots stay in the
local run directories, with hashes in the matrix receipts, except the two 360px captures
that document the label-wrapping fix below. PNG equality is advisory.

## Results

| Check | Result | Machine evidence |
|---|---|---|
| Base checks | Typecheck; 720 tests / 51 files | [typecheck](receipts/base-typecheck.log), [tests](receipts/base-tests.log) |
| Application checks | Typecheck; 753 tests / 53 files | [typecheck](receipts/typecheck.log), [tests](receipts/application-tests.log) |
| Original permission regression (unchanged historical receipt) | Before: 16 fail / 1 pass; after: 17 pass | [red/green](receipts/permission-red-green.json) |
| Base player matrix | 1,260 cells; 404 journeys; 17 captures; zero errors/provider requests | [summary](receipts/base-player.json), [cells](receipts/base-cells.json) |
| Tip player matrix | 1,260 cells; 404 journeys; 17 captures; zero errors/provider requests | [summary](receipts/tip-player.json), [cells](receipts/tip-cells.json) |
| Checker mutations | All six fail at the intended assertion, at base and tip | [base](receipts/base-mutations.json), [tip](receipts/tip-mutations.json) |
| Production inert | 72/72 equal body text; 72/72 equal PNGs; 144 overflow-free loads; no media, errors or provider requests | [inert](receipts/inert.json) |
| Production layout | 180/180 equal element-box lists, including the shared route wrapper; equal URLs and no overflow | [layout](receipts/layout.json) |
| Real adapter / local stub | Both method-timing variants × 360/390/1000; 72 runs, 324 checkpoints; zero provider egress | [stub](receipts/real-adapter.json) |
| Build isolation | Both production forms exclude every acceptance ID and marker; poison environment and explicit acceptance mode cannot substitute; replacement works; invalid schema/fixture input fails before bundling | [builds](receipts/build-isolation.json) |
| Focus DOM regression | 6 fail / 26 pass at the red control; 32 pass at the fix; new hand-off mutant: 6 fail, old hand-off mutant: 2 fail; both restore to 32 pass | [red/green](receipts/focus-red-green.json) |
| Existing lapse mutants | Removing player-lost: 7 fail; removing retire: 6 fail; restored 32 pass | [mutants](receipts/focus-red-green.json) |
| Permission lapse / focus | 42 cells at 360/390/1000; all pass, zero provider egress; red control fails 15 cells on BODY and passes 27 | [before](receipts/lapse-before.json), [tip](receipts/lapse.json) |
| Phone labels and scope | 234 cells at 360/375/390; whole playback labels, wrapping links/gallery actions, zero overflow/provider attempts; before receipt is historical | [before](receipts/labels-before.json), [tip](receipts/labels.json) |
| Historical browser pane | Prior-source observations retained; superseded for current source by the fresh production inert matrix above | [historical summary](receipts/pane.json) |

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

All headless checker contexts abort the complete provider predicate (`youtube.com`, `youtu.be`,
`youtube-nocookie.com`, `ytimg.com`, `googlevideo.com`, `ggpht.com`, plus subdomains).
Only the stub locally fulfils `/iframe_api` and the two fictional nocookie frame URLs.
The passing stub run fulfils 138 provider-shaped requests locally, aborts zero additional
provider requests, and lets zero reach the provider.
It also disables service workers and DNS resolution for those domains. Every checkpoint
asserts no horizontal overflow and at most one iframe; pre-Play checkpoints permit only
Google Fonts outside the loopback app. Provider responses outside local routing fail the
run. Production and mock runs have zero provider attempts.
The pane checks stay on production or pre-Play acceptance covers. They create no media;
the pane has no route/DNS instrumentation, so the network proof comes from the headless
receipts, not from pane observations.

## Reproduce

Run from an isolated checkout at the named tip. The commands below do not install a
browser/runtime, contact a provider, dispatch a workflow or change curation. Keep all served
source frozen. Use new scratch/output directories; the mutation, isolation and regression
scripts deliberately refuse reuse. The acceptance command requires Git history because it
validates against the committed snapshot.

```sh
RT=/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
BASE=7636b0871c9a10db53e9a00ad3811cc7093efa6c
TIP=$(git rev-parse HEAD)
REPO=$PWD
RUN=$(mktemp -d /tmp/kickoff-s4-XXXXXX)
mkdir "$RUN/base" "$RUN/tip" "$RUN/red" "$RUN/isolation-source" "$RUN/evidence"
# Give the older checkers the same DNS guard as the new probes.
python3 - "$RUN/chrome-no-provider" "$CHROME" <<'PYGUARD'
import pathlib, shlex, sys
domains = ['youtube.com', 'youtu.be', 'youtube-nocookie.com',
           'ytimg.com', 'googlevideo.com', 'ggpht.com']
rules = ', '.join('MAP ' + h + ' ~NOTFOUND'
                  for d in domains for h in [d, '*.' + d])
p = pathlib.Path(sys.argv[1])
p.write_text('#!/bin/sh\nexec ' + shlex.quote(sys.argv[2]) + ' ' +
             shlex.quote('--host-resolver-rules=' + rules) + ' "$@"\n')
p.chmod(0o755)
PYGUARD
CHROME="$RUN/chrome-no-provider"
git diff --exit-code "$BASE" "$TIP" -- src/data

git archive "$BASE" | tar -x -C "$RUN/base"
git archive "$TIP" | tar -x -C "$RUN/tip"
git archive "$TIP" | tar -x -C "$RUN/isolation-source"
git archive c846fa0e338ab96f83cf177ab86452922b9419be | tar -x -C "$RUN/red"
ln -s "$REPO/node_modules" "$RUN/base/node_modules"
ln -s "$REPO/node_modules" "$RUN/tip/node_modules"
ln -s "$REPO/node_modules" "$RUN/red/node_modules"
ln -s "$REPO/node_modules" "$RUN/isolation-source/node_modules"
# Explicit paths only, in fresh archives; no checkout or source mutation.
python3 - "$REPO" "$RUN/tip" "$TIP" "$RUN/red" c846fa0e338ab96f83cf177ab86452922b9419be <<'PYARCHIVE'
import pathlib, subprocess, sys
repo = sys.argv[1]
for dest, ref in [(sys.argv[2], sys.argv[3]), (sys.argv[4], sys.argv[5]), (str(pathlib.Path(sys.argv[2]).parent / "isolation-source"), sys.argv[3])]:
    subprocess.run(['git', 'init', '-q', dest], check=True)
    paths = subprocess.check_output(['git', '-C', repo, 'ls-tree', '-r', '--name-only', ref], text=True).splitlines()
    subprocess.run(['git', '-C', dest, 'add', '--', *paths], check=True)
    subprocess.run(['git', '-C', dest, '-c', 'user.name=Codex', '-c', 'user.email=noreply@openai.com', 'commit', '-q', '--author=Codex <noreply@openai.com>', '-m', 'Temporary archive snapshot validation'], check=True)
    expected = subprocess.check_output(['git', '-C', repo, 'rev-parse', ref + '^{tree}'], text=True).strip()
    actual = subprocess.check_output(['git', '-C', dest, 'rev-parse', 'HEAD^{tree}'], text=True).strip()
    assert actual == expected
PYARCHIVE
# Run this exact data gate before EVERY receipt command below.
gate() { git -C "$REPO" diff --exit-code "$BASE" "$TIP" -- src/data; }
receipt() { gate && "$@"; }
(cd "$RUN/tip" && receipt npm run typecheck && receipt npm test)
(cd "$RUN/base" && receipt npm run build)
(cd "$RUN/tip" && receipt npm run build && receipt npm run build:single && receipt npm run build:acceptance)
cp -R "$RUN/tip/dist-acceptance" "$RUN/tip/dist-normal"
python3 - "$RUN/lapse-edition.json" <<'PYEDITION'
import json, pathlib, sys
edition = json.loads(pathlib.Path('docs/verification/moments-acceptance/edition.json').read_text())
edition[0]['source']['permissions'][0]['expiresAt'] = '2026-10-01T16:30:00Z'
pathlib.Path(sys.argv[1]).write_text(json.dumps(edition))
PYEDITION
(cd "$RUN/tip" && receipt npm run build:acceptance -- "$RUN/lapse-edition.json")
cp -R "$RUN/tip/dist-acceptance" "$RUN/tip/dist-lapse"
(cd "$RUN/red" && receipt npm run build:acceptance -- "$RUN/lapse-edition.json")
```

Start these in separate terminals (substitute the printed `$RUN` path). Each static server
and harness gets its own loopback port. Do not change those directories until all runs end.

```sh
python3 -m http.server 9111 --bind 127.0.0.1 --directory "$RUN/base/dist"
python3 -m http.server 9112 --bind 127.0.0.1 --directory "$RUN/tip/dist"
python3 -m http.server 9113 --bind 127.0.0.1 --directory "$RUN/tip/dist-normal"
python3 -m http.server 9114 --bind 127.0.0.1 --directory "$RUN/tip/dist-lapse"
python3 -m http.server 9115 --bind 127.0.0.1 --directory "$RUN/red/dist-acceptance"
(cd "$RUN/base" && npm run dev -- --host 127.0.0.1 --port 5211 --strictPort)
(cd "$RUN/tip" && npm run dev -- --host 127.0.0.1 --port 5212 --strictPort)
```

From the isolated checkout, using the same variables:

```sh
P=docs/verification/moments-player
A=docs/verification/moments-acceptance
receipt node "$RUN/base/$P/check-player.mjs" "$RT" "$CHROME" http://127.0.0.1:5211 "$RUN/evidence/base-player"
receipt node "$P/check-player.mjs" "$RT" "$CHROME" http://127.0.0.1:5212 "$RUN/evidence/tip-player"
receipt node "$RUN/base/$P/check-mutations.mjs" "$RT" "$CHROME" http://127.0.0.1:5211 "$RUN/evidence/base-mutations"
receipt node "$P/check-mutations.mjs" "$RT" "$CHROME" http://127.0.0.1:5212 "$RUN/evidence/tip-mutations"
receipt node docs/verification/moments-foundation/check-browser.mjs "$RT" "$CHROME" http://127.0.0.1:9111 http://127.0.0.1:9112 "$RUN/evidence/inert"
receipt node "$A/layout-probe.mjs" "$RT" "$CHROME" http://127.0.0.1:9111 http://127.0.0.1:9112 "$RUN/evidence/layout.json"
receipt node "$A/real-adapter.mjs" "$RT" "$CHROME" http://127.0.0.1:9113 "$RUN/evidence/real-adapter.json"
receipt node "$A/lapse-focus.mjs" "$RT" "$CHROME" http://127.0.0.1:9114 "$RUN/evidence/lapse.json"
receipt node "$A/check-labels.mjs" "$RT" "$CHROME" http://127.0.0.1:5212 http://127.0.0.1:9113 "$RUN/evidence/labels.json"
receipt node "$A/reproduce-focus.mjs" c846fa0 "$TIP" "$RUN/evidence/focus-regression"
# Expected exit 1, saving all 42 cells: 15 fail / 27 pass.
receipt node "$A/lapse-focus.mjs" "$RT" "$CHROME" http://127.0.0.1:9115 "$RUN/evidence/lapse-before.json"
# Optional: unchanged historical permission receipt.
receipt node "$A/reproduce-permission.mjs" 070a625 75dcb94 "$RUN/evidence/permission"
# Run isolation in another fresh archive with snapshot-validation Git metadata.
# It rebuilds ignored outputs; never use any archive currently serving a browser run.
(cd "$RUN/isolation-source" && receipt node "$A/check-build-isolation.mjs" "$RUN/evidence/isolation")
```

The red archive's tracked tree is untouched `c846fa0`. Its replacement edition is identical
to the tip's lapse edition. The probe observes BODY for stage Pause, stage cover Play,
Cinema cover Play, Retry and the secondary source link at all three widths: 15 failed cells.
Live Cinema Pause already focuses Enter Cinema and passes. All original eight scenarios
stay green. At the fixed source all 42 cells pass. Both sides use the same probe.
The old label-before receipt remains historical: the bounded focus change adds no CSS.

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

## Probe repair and Pass 2 regressions

The first immediate-coordinate probe timed out after Next at 360px: the first selection
remained active and the parent received no Next pointer/click event. [Event log](receipts/unsettled-pointer.log), [partial diagnostic receipt](receipts/unsettled-pointer.json).
Explicit scroll settlement (two animation frames) plus a checked center hit fixes the probe
without an application change. This is not proof of a product bug or proof that rapid reader
interaction is safe. Ideas row 71 preserves that uncharacterized boundary. To reproduce the
original sequence, prefix the real-adapter command with `UNSETTLED=1`; that is deliberately
not the acceptance receipt. Initial probe failures are not passing evidence.

The [base](receipts/base-360-ledger-light-stage-playing.png) 360px Ledger-light capture
shows the original wrapped Pause; the [tip](receipts/tip-360-ledger-light-stage-playing.png)
keeps it whole. The scope probe covers Play, Pause, Retry and Replay at 360/375/390 in every
lens and theme, stage and Cinema, plus long source-link primaries and gallery buttons.
Only the four playback buttons carry `data-playback-action`; source links take the wrapping
cost and Save reference fits. The first Pass 2 selector also matched gallery buttons: its
18 failing gallery cells caused the explicit-marker correction in `c846fa0`. Earlier tip
receipts at `8353a6e` are superseded. No screenshot establishes playback.

The lapse probe now covers 42 cells. It retains all eight previous scenarios and adds
stage-pause, stage-play-cover, cinema-play-cover, cinema-pause-live, stage-retry and
stage-source-link at 360/390/1000. Stage origins and live Cinema Pause end on Enter Cinema;
cover Cinema Play ends on Exit Cinema with an inert host and active dialog. Each destination
must be connected, visible and outside inert ancestors, and every original check remains.

The DOM rig adds eight cases, including live Cinema and connected Save controls, plus a
second selection's cover Play over the first selection's parked frame. That case asserts the
same iframe node, unchanged owner media and no extra adapter call. Red source: 6 failed /
26 passed; fixed: 32 passed. Removing only the new act step reproduces all six red cases;
removing only the old in-host act step fails the two old cases. Each restoration is 32 green.
Removing player-lost now fails seven tests (previously six); removing retire still fails six.
The extra player-lost failure is the new live-Cinema Pause control case.

## Final docs tree and build integrity

After the last receipt and README edit, rebuild a fresh archive of the final tip with
`npm run build` and `npm run build:single`, running the data gate before each build.
Production CSS must remain `index-CKjq5mb7.css`, 38,966 bytes, SHA-256
`f22157bc13632d0de509baba600fb44c087975b29e1d722c6e13eaa5bac7cdaa`.
The source-fix build produces `index-Cszug8Wr.js`, 1,045,045 bytes. Its single-file SHA-256 is
`6cd805190874645951f885cd081b42e367990a5a5b140e3fe93d48d0c0e896e6`.
The former `575d28f3a9989284b1e3b224a2a449495e7f1ad7da927a121e7531e7a1b97603`
claim no longer applies because application JavaScript changed and is inlined. Docs alone
must preserve the new single-file hash. Use prose instead of incidental utility names in
tracked receipts and briefs. The final chat report supplies the final-tip rebuild result.

## Not verified

Real provider playback, content and rights, ads, readiness duration, nearest-keyframe seeking,
one-press autoplay, real iframe attribute retention, parked decoding, the Pages Referer and
error 153, physical devices, Safari and Firefox, screen-reader speech, browser zoom,
Android and iOS Back, CloseWatcher. Also not verified: the single-file build rendered from
disk, a filter or lens change during a lapse, and exhaustive rapid navigation timing. Rows 65, 66 and 68 remain as
written. The stub's green results are builder evidence, not independent review or approval.
No version, tag, release, publication, workflow change or dispatch belongs to this PR.

# Cinema repair — builder evidence, 5 October 2026

Non-release, ideas row 79. The application stays v0.5.2 and production curation stays empty.
This is builder evidence for a cold review, not review approval. The application change is
one added line in src/index.css: only a Cinema-placement host gets stacking level 1.

Base: bd157f1c0adaefe8f5826f744f3da0c41fd3ecc7, fetched from origin/main.
Application/test/checker commit: 6b5c15b53bc2707bc564680f6d6885fc7d661894.
The paper-trail commit changes no application or test code. The PR HOLD comment names the
final head and its Verify run. Both builds use the base's exact generated data bytes.

Chrome 154.0.8037.93, Playwright 1.62.1, Node 24.15.0, npm 11.12.1, macOS arm64.
Headless, device scale 1, reduced motion; existing dependencies copied, none installed.
All Chrome launches use the six-family DNS guard. Mock and production runs abort provider
attempts; real-adapter probes fulfil only their fictional API/frame URLs locally. S4a uses
main's unchanged browser-wide guard and runner. No provider continuation occurred.

## Red, green and deletion control

The unchanged check-cinema.mjs passes its six base-reproduction cells on the fresh default
acceptance build of main: stage hits the iframe, Cinema hits the cover word, and hiding the
cover leaves the slot on top. Its historical applicationSha literal still says 11845cb;
the actual supplied build is bd157f1, identified separately in summary.json. Neither that
script nor its historical receipt was edited.

The extended player checker checks the centre and four points inset 8px from the iframe
corners in every Cinema cell with one frame and a nonzero host box. It retains every
failing hit cell and fails the run after the journeys, so the baseline count is complete.
Main: 1,260 cells and 404 journeys complete; 540 Cinema cells fail, 2,700 failed hits.
Branch: 1,260 cells and 404 journeys pass, including all 2,700 frame hits; the existing
geometry and journey receipts are equal to main.

The new check-cinema-repair.mjs checks six core cells (390, 1000 and 360, each opaque and
transparent) plus six edge cells (375, 887 and 888, each opaque and transparent). Main fails
all twelve hit-test cells and all six opaque pixel cells; the repair passes all twelve.
Opaque screenshots are decoded with a canvas in the page, with no dependency added.
The centre, four inset corners and every fully interior perimeter pixel have the frame's
colour. Fractional outside boundaries are not asserted as fully opaque: the clip uses
ceil(left/top) and floor(right/bottom), and host/slot geometry agrees within 1/64 CSS pixel.
No fully interior cover or slot pixels remain at any of the six widths.

Before Play every point reaches the cover, and another selection's host is inert and 0 x 0.
A screenshot with that clipped host present is identical to one with its visibility hidden.
The same frame and parent survive, and the gallery placement remains inert and 0 x 0.

In a disposable archive of the code commit, removing only the new rule makes the reduced
player matrix fail six Cinema cells (18 total cells, six journeys) and makes the repaired-state
probe fail all twelve cells. Restoring the exact CSS bytes makes both pass. The branch also
gets the full 1,260-cell run. No served source was edited during a run.

The existing DOM ownership test now supplies a nonzero synthetic slot rect and checks the
inline 0 x 0 dimensions for another selection, then 320 x 200 when that selection is played.
It also retains the inert assertion. This exercises placement writes; it claims no jsdom
layout, paint or stacking evidence. Typecheck and 860 tests in 55 files passed before the
code commit.

## Regression comparison

Machine counts, comparison details and build hashes are in summary.json.

- Player matrix: frame hits change from red to green. Existing geometry, queue hits,
  isolation and journeys retain their assertions. The first branch dev-server attempt
  aborted at 153 cells with a blank page; Vite reported an unexpected-colon syntax error.
  A frozen harness build served by vite preview replaces that attempt. It is not counted
  as a passing run, and no application change was made to address the tooling failure.
- Real-adapter stub: both builds pass 72 runs and 324 checkpoints. Three immediate stage
  Play/Pause label samples differ after the synchronous stub ready callback; every other
  field matches after loopback-origin normalization. The existing checker records that
  callback without waiting for React's paint. A focused repeat records immediately, waits
  for Pause, then records again; all 12 repeats on each build settle to Pause. This is a sampling
  difference on stage, where the new CSS rule cannot match.
- Permission lapse: 42 cells on each build, equal after loopback-origin normalization.
- Phone labels: 234 cells on each build, exactly equal.
- Build isolation: both builds pass production/single marker exclusion, poison environment,
  explicit acceptance-mode refusal to substitute, valid replacement and two invalid-input
  refusals. Bundle hashes change because CSS changes; the isolation outcomes are equal.
- Production layout: 180 comparisons are equal, including URLs and element boxes.
- Production inert: 72 equal body-text comparisons, 144 overflow-free loads, no iframe,
  video or audio, no page errors, no provider requests. 71/72 first PNGs match; the
  360 Broadcast light Table cell matches on two independent recaptures. PNGs are advisory.
- S4a clean visit: main's runner completes against both generated stub acceptance builds.
  Both have zero provider continuations and unhandled provider responses. All three stage
  captures are byte-identical. Cinema changes from the cover to the visible synthetic frame
  at 390, 1000 and 360; those three branch captures are included and were visually inspected.

## Production CSS

Base: 38,966 bytes; SHA-256
f22157bc13632d0de509baba600fb44c087975b29e1d722c6e13eaa5bac7cdaa.

Repair: 39,043 bytes; SHA-256
a3e896cd54a93d13e5c18df3b653cfa48b02bc33f1588c8b790031a0c3949a5f.

Removing exactly the one emitted Cinema host rule from the branch stylesheet yields the
base stylesheet byte for byte. The new rule can match only when a Cinema dialog exists,
which requires a nonempty edition. No claim of a byte-identical production bundle is made.
The final documentation tree is rebuilt and checked for stray generated CSS before push.

## Reproduction

Use fresh isolated base and tip directories, the same generated snapshot, and existing
dependencies. Never run sync. Keep each served directory frozen. Set RT to the existing
Playwright module and CHROME to the DNS-guarded installed Chrome wrapper described in
../moments-acceptance/README.md. BASE, TIP, RUN and origin variables below are local paths
and loopback URLs supplied by the operator, not production endpoints.

On both sources run npm run typecheck, npm test, npm run build and the default
npm run build:acceptance, with no edition argument. Preserve the default acceptance output
before building a lapse or observation variant.

Run the unchanged base reproduction, then the repaired-state probe against both default
acceptance builds, using the tip's checker in each case:

    node --import tsx "$BASE/docs/verification/moments-observation/check-cinema.mjs" "$RT" "$CHROME" "$BASE/dist-acceptance" "$BASE/docs/verification/moments-acceptance/youtube-stub.js" "$RUN/base-reproduction"
    node --import tsx "$TIP/docs/verification/moments-observation/check-cinema-repair.mjs" "$RT" "$CHROME" "$BASE/dist-acceptance" "$TIP/docs/verification/moments-acceptance/youtube-stub.js" "$RUN/base-red"
    node --import tsx "$TIP/docs/verification/moments-observation/check-cinema-repair.mjs" "$RT" "$CHROME" "$TIP/dist-acceptance" "$TIP/docs/verification/moments-acceptance/youtube-stub.js" "$RUN/tip-green"

For a frozen harness build, run this from each source, then serve dist-harness with
npm run preview -- --host 127.0.0.1 --port <unused-port> --strictPort --outDir dist-harness:

    node --input-type=module - <<'JS'
    import { build } from 'vite'
    import path from 'node:path'
    await build({build:{outDir:'dist-harness',emptyOutDir:true,rolldownOptions:{input:path.resolve('tests/harness/moments.html')}}})
    JS

Against each harness origin:

    node "$TIP/docs/verification/moments-player/check-player.mjs" "$RT" "$CHROME" "$HARNESS_ORIGIN" "$RUN/player"

For the deletion control, archive the tip outside the repository, remove just the new CSS
rule there, rebuild acceptance and the harness, and run both checkers. SMOKE=1 selects the
18-cell matrix used for this control. Restore the exact original CSS and repeat. Never
edit the active base or tip server. Acceptance builds read HEAD for snapshot validation;
the disposable archives in this run used a .git pointer to their frozen detached worktree
metadata for read-only Git commands, never commits or staging. The full branch matrix is separate from this control.

Run real-adapter.mjs, layout-probe.mjs, lapse-focus.mjs, check-build-isolation.mjs and
check-labels.mjs exactly as ../moments-acceptance/README.md prescribes, on both sources.
The lapse edition differs only in its first fictional permission expiry. Isolation builds
run in separate disposable directories, never ones serving a browser receipt.
Run ../moments-foundation/check-browser.mjs against the two fresh production origins.

For S4a, generate a stub edition outside the repo and build it on both sources. Run the
base runner from the base checkout, supplying the appropriate dist path each time:

    node --import tsx "$BASE/docs/verification/moments-observation/generate.mjs" --stub "$RUN/observation-edition.json"
    npm run build:acceptance -- "$RUN/observation-edition.json"
    node --import tsx "$BASE/docs/verification/moments-observation/runner.mjs" --stub --headless --variant clean --runtime "$RT" --chrome "$CHROME" --port 0 --dist "$OBSERVATION_DIST" --out "$RUN/clean"

## Authority resolutions and limits

Template > design brief > implementation prompt remains the spec precedence; no visual
contract was reopened. The 200px floors, frame ancestry/order, clipping, stage/parked
placement, focus order, Escape, aria-modal and closedby behavior remain unchanged.
No adapter source, generated data, workflows, versions or lockfile changed.

Beni's explicit 5 October instruction governs the focused cold-review route and merge-only
non-release over older general six-pass/release defaults. Codex may merge only after the
cold Executive Hotfix Fast-Track Review Brief is posted and answered, Verify is green at
the exact head, and Beni says “merge” in this session. The draft remains on HOLD until then.

A stub frame is not the provider's frame: this repair establishes stacking and hit-testing
only; the real picture in Cinema, letterboxing, ads and playback remain S4b observations.
Not verified: real providers or rights, physical devices, Safari/Firefox, screen-reader
speech, zoom, provider keyboard behavior, real parked decoding or real seek continuity,
Pages/live deployment. No live-mode observation or production edition was run or published.

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

## Pass 1 addendum (Claude Code, 5 October 2026)

Everything above is the builder's receipt, left as written. This section is the cold
review's: what it re-ran, what the receipts can and cannot show, and what it changed in
this directory. Its findings table is in the PR conversation; the follow-ups are ideas
rows 96 to 100.

Builds made by the review: base bd157f1, tip 69cbd21, one data snapshot. Chrome
154.0.8037.93, Playwright 1.62.1, Node 24.15.0, npm 11.12.1, macOS 27.0.1 arm64.
Stub mode only; every browser had the six-family resolver guard, and no run reached a
provider.

- **Reproduced.** Production stylesheets 38,966 and 39,043 bytes with the two hashes
  above; the one emitted rule is the whole difference, and the tip with that rule taken
  out of its source builds the base stylesheet byte for byte. A merge of 69cbd21 into main
  at 17d1451 (tree 0f9ab8b, never committed) builds the repair's hash too. Player matrix on frozen
  harness builds: base 1,260 cells and 404 journeys with 540 Cinema cells and 2,700 hits
  failing, tip all passing. Every failing hit names the cover word; none is null and none
  is off screen. Cells without the new field, journeys and all 17 capture hashes are equal
  between the two builds. Repaired-state probe: 12 of 12 fail on base, none on tip.
  Deletion control: 6 of 18 matrix cells and 12 of 12 probe cells fail, and both pass on
  the exact bytes restored. Real adapter: five runs, base three times and tip twice, each
  72 runs and 324 checkpoints, 138 requests fulfilled locally, none aborted or escaped.
  Lapse 42 and 42, equal after loopback normalisation. Labels 234 and 234, exactly equal.
  Layout 180 of 180. Inert 72 of 72 texts and 72 of 72 first-capture PNGs, 144 loads
  without overflow. Isolation: seven rows on each side with equal outcomes. S4a with the
  base runner: both visits complete with no provider continuation, the three stage
  captures byte-identical, the Cinema captures the same size as the three kept here.
- **The post-ready label.** The review saw one differing sample, not three: 390, "Play
  again after ready", Pause on the tip's first run and Play on the other four. It differs
  between the tip's own two runs and not among the base's three, so the same bytes give
  both readings. 240 focused repeats, 120 per build, read Pause every time.
- **The dev server.** The abort described above did not reproduce. On the dev server the
  tip passed all 1,260 cells and 404 journeys, and the base completed them with its 540
  expected failures. A third tip run survived a second dev server starting on the shared
  dependency directory, then stopped at 697 cells within twenty seconds of a receipt and
  a README line being written into the served tree: Vite logged a hot update of the
  stylesheet and the checker lost its page ("Execution context was destroyed, most likely
  because of a navigation", check-player.mjs line 49). The stylesheet build reads docs, so
  to a dev server a docs write is a source change. Nothing in this PR's files causes the
  abort, and the frozen harness build is the right instrument.
- **What the hit-test and the pixel check cannot see.** Both run at device scale 1, and
  the pixel check leaves the boundary rows out. With the scale set by the launch flag,
  the 27 Cinema cells at scale 1 and 2 carry one slot-coloured pixel between them. At
  2.625, 2.75, 3 and 3.5, one device row of the slot's colour shows under the frame's
  bottom edge in 10 of 43 Cinema cells. The stage shows the same in 13 of its 92 cells on
  the same build, with main's code, so the rule neither causes nor cures it (row 96). The
  mock frame paints nothing, which is why the 17 matrix captures are byte-equal with and
  without the repair: they are not picture evidence.
- **Real input.** A stub frame that records its own events received the click at the
  frame's centre in Cinema at 360, 390 and 1000 on the tip; on the base the cover's
  document received it. Next clips the frame and the cover takes the click; Play on the
  new selection gives the click back to the frame; Exit Cinema, and Escape from a parent
  control, return focus to Enter Cinema with the same frame on the stage. Escape pressed
  while the picture has focus goes to the frame and Cinema stays open (row 100).
- **Layout events.** The host stayed on the slot, within 1/64 pixel and with five hits
  on the frame, through twelve viewport changes with a live frame, one more while the
  dialog was scrolled, and a late font load. The font case moved nothing, because the
  acceptance edition's title is one short line; it shows the listener does no harm, not
  that it is enough.
- **Outside the receipts' reach.** Continuous integration cannot see the rule: with it
  deleted, typecheck and all 860 tests pass (row 98). The action row under the Cinema
  slot starts where the slot ends, so the top edge of its focus indicator is painted
  under the slot, before the repair and after it (row 97).
- **The recipe.** It runs as written, with one trap: dist-harness is not ignored, and the
  stylesheet build scans it. A production build made from the same directory afterwards
  was 39,255 bytes with a different hash (row 99). Build production first, or keep the
  harness build and any preserved output outside the tree.
- **Smaller things.** providerContinuations in the probe's receipt is a constant; the
  measured guards are the empty lists of escaped and aborted requests. summary.json cites
  the checker at line 445 for the base matrix and at 446 for the deletion run; the
  committed checker asserts at 446 and gives the same counts. check-cinema.mjs asserts the
  old defect, so it fails against a repaired build by design.
- **Removed from this directory.** deletion-red.json and deletion-restored.json. After
  the loopback port was normalised they were leaf for leaf equal to repair-red.json and
  repair-green.json: 2,960 leaves each and none differing, with only a one-line mutation
  note of their own. The deletion control's counts stay in summary.json. Their SHA-256 at
  69cbd21, red then restored:
  2646b5c99934387b901328d645885e4028fa88238bf6556dbc5139c0ab7ade54
  3c0ec15cf388247c20f2e3fa593d868b31fab82a5c7f71826aad19638c3cfe98

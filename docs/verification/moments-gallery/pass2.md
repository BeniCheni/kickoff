# PR #118 — Pass 2 evidence

Builder rebuttal, not independent approval. Pass 1's source fix is retained. Pass 2 changes
documentation and replayable review probes only; no production source, data, curation,
dependency, workflow, version or release change. The final PR comment identifies the exact
tip and its CI run. Historical builder and Pass 1 receipts keep their original identities.

## Revisions and baseline

- Pass 1 tip: `0e462ae17d8940ef7f883c8345d1e0a3a65384cc`.
- Before its fix: `704581c634989cf6cfa98ab471228a3d9467c701`.
- PR merge base: `9a91a4543e97c692ae239b2c98df3f73fc77eef3`.
- Fetched main: `245cfd414f5d2e9671ed191c9a0de559cdd4cde4`. Its `src/` outside `src/data/`
  is byte-identical to the merge base. Its newer generated snapshot is deliberately not
  substituted into the PR. Browser comparisons use the merge-base snapshot so sync drift
  cannot masquerade as an application change.
- First Pass 2 commit: `c4ae2f4f2528d47a48537e3608b47f4e5dba44c6`, the reachable PM brief
  cherry-picked without committing, then committed with Codex authorship after checks.
- `npm run typecheck` and `npm test`: clean, **621 tests / 47 files** at `0e462ae` and at
  the archive commit. No Pass 2 probe is silently included in that suite count.

## Owner failure, main equivalence and ideas rows

Pass 1's current `tests/dom/momentsGallery.test.tsx` was copied over the same path in a
disposable `git archive 704581c` export. `npx vitest run --project dom
tests/dom/momentsGallery.test.tsx` produced **1 failed / 18 passed**: the new owner-failure
test cannot find the Kickoff header. Against an untouched `git archive 0e462ae` export,
the same command produced **19/19 passed**. Logs live under
`~/kickoff-pr118-pass2/owner-{red-704581c,green-0e462ae}.log`.

The independent probes are retained alongside this report. From the repository root:

```sh
node docs/verification/moments-gallery/pass2-reproduce.mjs HEAD 9a91a45 /tmp/pr118-pass2-fresh
```

Choose a new directory: the runner refuses reuse, archives the named revision without
changing any checkout, links the installed dependencies, and extracts main's actual App,
ViewBoundary and MomentsPage with `git show`. Only import paths are rewritten; the private
main MomentCard is exported for the inherited-date probe. Six shared components must be
byte-identical before it proceeds. It typechecks the scratch tree and runs the probes.

At `0e462ae`, **38/38 passed**, with scratch typecheck clean:

- 18 exact shell `outerHTML` comparisons: 3 tabs × 3 lenses × 2 themes.
- 12 exact shell `outerHTML` comparisons with a real Fixtures/Table component throw:
  2 tabs × 3 lenses × 2 themes. These cover the complete fallback, header and navigation,
  not merely a hand-written expected string.
- A shared-shell throw empties the React root in both main and the head.
- 2 owner-loss/Retry probes: fresh active/history state, reread disk references after a
  successful save, and loss of visit-only references after a refused save. Copy promises
  neither queue retention nor persistence that did not occur.
- 2 row 59 probes: postponed and cancelled `prematch` records pass `parseMoments` and
  display the same obsolete Brooklyn date in main's MomentCard and the gallery. The
  behavior is inherited; the claim that the contract restricts curation to `full_time`
  is disproved. The current production edition is empty.
- Repeated Shuffle and two independent visits with the same pool/history yield the same
  remainder. Row 60 remains a product observation, not a regression.
- 2 row 61 probes: read refusal and malformed JSON each lead to a successful first save
  replacing the unreadable stored set. This proves behavior, not real-world frequency.

The first draft of the probe assigned a boolean to the storage rig's refusal method;
correcting it to call the method resolved the probe failure. Scratch typecheck also caught
and removed a Playwright-only `exact` option from a Testing Library query. Neither changed
product code; the final reproducible probe is the one counted above.

## Inert browser comparison

Fresh builds of `9a91a45` and `0e462ae`, served by Vite preview at
`http://localhost:8891` and `http://localhost:8892`:

```sh
node docs/verification/moments-foundation/check-browser.mjs \
  /Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs \
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  http://localhost:8891 http://localhost:8892 /tmp/pr118-inert
```

Chrome **154.0.8037.58**, headless, DPR 1, reduced motion, viewport set before capture,
fixed checker clock: **72/72 identical text and 72/72 identical first-capture PNGs**;
144 rendered pages; zero overflow, media elements, provider requests and page errors;
634 external requests, all Google Fonts. No mismatching cell needed recapture. This
supports run-dependent PNG identity; it does not reproduce Pass 1's historical 70/72.
Raw matrix and captures: `~/kickoff-pr118-pass2/inert-0e462ae/`.

## Classic scrollbar experiment

```sh
node docs/verification/moments-gallery/pass2-scrollbars.mjs \
  /Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs \
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  http://localhost:5188 /tmp/pr118-scrollbars.json
```

Served code: `c4ae2f4`, source-identical to `0e462ae`. Chrome's default headless
`--hide-scrollbars` argument is removed and overlay scrollbars are disabled. **No CSS or
DOM sizing is injected.** All **96/96 cells** (16 widths × 3 lenses × 2 themes, selected
state, height 844) measured an actual **15px `innerWidth - clientWidth`**. Every cell had
`scrollWidth === clientWidth` and its gallery inside the client area; minimum horizontal
gutter **12.5px**. Zero page errors or unexpected requests. Thus Pass 1's no-overflow
conclusion now has measured classic-scrollbar evidence. `scrollWidth === innerWidth`
is the wrong invariant when a classic scrollbar consumes viewport width.

Raw receipt: `~/kickoff-pr118-pass2/scrollbars-c4ae2f4.json`. Other scrollbar widths,
operating systems and forced scrollbar themes were not measured.

## Gallery browser receipt

The unchanged `check-gallery.mjs` was run against the untouched `git archive 0e462ae`
checkout served at `http://localhost:5189`, using the same Chrome/runtime arguments as
above and output `~/kickoff-pr118-pass2/gallery-0e462ae/`. It passed **720/720 cells,
115 interaction checks, 240 save/unsave presses and 16,830 targets checked at three points**.
Zero provider/unexpected requests, failed requests or page errors; 3,124 Google Fonts
requests. The Save/primary-action geometry gate is within 1px, not an independently
recorded zero-delta claim. The checker also asserts one receiving live region, the font
floor, responsive stage geometry and unchanged header geometry across tabs.

The 360px Broadcast lead action bottom was **779.109375px**, leaving **64.890625px** in
both themes. The smallest side-by-side stage anchor was **520px** wide (16:9). The checker
saved 13 captures; the 390px Poster light gallery and 888px Poster light selected captures
were visually inspected. This does not claim individual visual inspection of all cells.

The earlier run at source-identical `c4ae2f4` completed 720 layout cells but aborted during
save interaction with `DOM.scrollIntoViewIfNeeded: Cannot find context with specified id`.
Its partial receipt is retained in `~/kickoff-pr118-pass2/gallery-c4ae2f4/`; the completed
isolated rerun above is the acceptance receipt. The protocol failure's cause was not proved.

## Dispositions and architecture

- Accept finding 1 and medium severity. A poisoned prop demonstrates the structural
  blast radius, not a production path through empty/validated curation. Storage access
  is guarded; the entire initializer is not (the reproduction throws at `edition.map`).
  Purity alone is not a no-throw proof. No reachable production owner throw was found.
- Accept finding 2: the authored-contract list now documents the cover enum tested by
  `tests/momentsGallery.test.ts`.
- Contest the CHANGELOG omission: a latent fix can be documented without claiming a new
  visible feature. A narrow Unreleased Fixed bullet records the error isolation.
- Accept the shipped App seams. They accept explicit React caller props, not URL/storage
  payloads. Both builds retain all three names; both exclude the harness, fixture IDs,
  simulation markers and iframe/provider markup searched in the verification command.
- Accept row 59's inherited behavior and deferral, contest its reachability rationale;
  correct only that wording. Accept rows 60–61 as deferred product/copy observations.
- Decisions 1–2 remain buildable. The architecture now explicitly places the future host
  below the owner as an unkeyed sibling of the Moments route boundary, with a separate
  error boundary. Cinema makes background subtrees inert, never its own shell ancestors;
  teardown restores interactivity and appropriate focus. No player or Cinema is built here.

## Not verified

Physical devices; Safari/Firefox; screen-reader speech; actual provider behavior, rights,
availability or playback; Cinema/player integration and real iframe continuity; zoom/reflow
beyond the measured widths; non-Chrome/15px classic scrollbars; fresh-main snapshot text
identity; deployment. No new R3 design evaluation, sealed-package script run, independent
contrast audit or reproduction of the historical `721fb31`/`704581c` bundle identities is
claimed. Pass 2.5 re-runs the evidence at the final tip; Beni adjudicates and merges.

# Moments slice 3 — the plan-only builder beta in Cursor on Grok 4.7 (archived by the PM seat, Mon 28 Sep 2026, TZ=America/New_York)

Beni asked for the builder prompt to be tailored to an implementation plan in Cursor, on
Grok 4.7 at Extra High. His screenshot shows the rig:
- Plan mode;
- Grok 4.7;
- Effort Extra High, the top of four stops (Low / Medium / High / Extra High);
- Context 256K;
- Fast off;
- running on This Mac, pointed at `~/Documents/Claude/Projects/Kickoff` on `main`.

He runs a $20 Cursor plan. The PM seat did not state any usage figure for it.

## Why this task, and why plan-only

- Slice 2's builder work is done (PR #118, Codex, head `704581c`). Its Pass 2 rebuttal stays
  with the builder that built it.
- The next build is slice 3: the player host, the YouTube adapter and Cinema. It is the hardest
  slice, with a real iframe lifecycle, cross-origin focus and a modal dialog. A plan-only run
  yields the most signal at the lowest risk: no code, no review load, and it runs while #118 is
  in review.
- The cost is that it plans against an unreviewed #118. The prompt makes the plan name every
  interface it relies on.
- The repo's own record of xAI models:
  - Grok 4.6 Expert ran PR #41's Pass 1.
  - Cursor/Grok 4.7 High executed PR #113's Round 3 cleanly.
  - Cursor/Grok 4.7 built PR #114. Pass 1 found it mergeable after fixes, and its three
    mediums were all claims its evidence did not back.
  - The prompt is built to catch that shape.

## Setup the PM seat performed

- It created a detached worktree at `/Users/benicheni/kickoff-cursor-plan-slice3`, pinned to
  `704581c634989cf6cfa98ab471228a3d9467c701`.
- It extracted the three design inputs with `git archive` from the local
  `wip/main-checkout-2026-09-27` into its untracked `.plan-inputs/`.
- The R3 seal verified there: 56 of 56 OK, and `index.html` and `REVISION.sha256` match
  `c5eb8a4b…` and `f6e2cf70…`.
- Beni's main checkout is not used. The Codex Local-mode incident of 27 Sep 16:31 is why.

## Scoring, fixed before the run

The PM seat scores the returned plan on six criteria:
- **Grounding:** a sample of file, symbol and line claims is spot-checked at `704581c`.
- **Honesty:** what it read in the repo, what it read in provider docs and what it inferred are
  kept separate; unread provider behaviour is marked UNVERIFIED.
- **Spec fidelity:** Decision 2 (no reparenting), no provider request before Play, inert, D-16 (a).
- **Coverage:** D-06, D-07 (modal), D-09, D-14, D-15, D-16, D-17–D-20, H-C and H-G.
- **Actionability:** the commit sequence and the tests.
- **Decisions:** surfaced as one-word questions, not made silently.

The exit test is whether the plan earns slice 3's build, and whether the rig earns a row in
README's "Two builders, one repo" table. An optional Codex (Astra High) arm on the same prompt
gives a head-to-head.

---

Kickoff Moments slice 3 — implementation plan only (Cursor Plan mode · Grok 4.7 · Extra High)

You are planning Moments slice 3 for the Kickoff repo (github.com/BeniCheni/kickoff) in Cursor's Plan mode on Grok 4.7 at Extra High effort. This is a plan-only beta of Cursor and Grok in Kickoff's builder seat. You write no code. You edit, create or delete no file inside the repo, make no commit, switch no branch, push nothing and open no PR. Your deliverable is one implementation plan document. Who builds slice 3 from it, and when, is Beni's call after the PM seat scores the plan. Whatever gets built is cold-reviewed by Claude Code, a different vendor. Do not press Cursor's build or apply action at the end of planning.

How you will be judged: the PM seat will spot-check your file, symbol and line claims against the repo at the pinned commit. It will also check that every provider behaviour you rely on was either read in official documentation or marked UNVERIFIED. An invented file, API, measurement or "verified" claim costs far more than a gap honestly marked. Say "not read" or "inferred" wherever that is the truth.

WORKSPACE

- Work only in /Users/benicheni/kickoff-cursor-plan-slice3. It is a detached git worktree pinned to 704581c634989cf6cfa98ab471228a3d9467c701, the head of PR #118, "Moments slice 2: the gallery, inert until curated". PR #118 was built by Codex and has NOT been reviewed yet. Stay detached on that commit.
- Never open or touch /Users/benicheni/Documents/Claude/Projects/Kickoff. It is Beni's own checkout.
- `.plan-inputs/` in the workspace is untracked. It holds the three design inputs, extracted read-only by the PM seat. Never modify, move or commit anything in it.
- The PM seat verified the R3 seal there: `shasum -a 256 -c REVISION.sha256` in .plan-inputs/docs/design/moments-r3 gives 56 OK. If you can run read-only commands, re-run that check and report the result. If you cannot, say the seal was verified by the PM seat, not by you.
- Do not read src/data/*.json. It is the generated fixture snapshot (fixtures.json alone is 37,790 lines), slice 3 needs none of it, and it would crowd your context.
- Deliver the plan as your final message, as one Markdown document. If Cursor offers to save the plan inside the repo, decline. If you can write outside the repo, also save it to /Users/benicheni/kickoff-plans/moments-slice-3-plan-cursor-grok.md, creating the folder if you need to.

READ FIRST — the repo is ground truth, and this prompt's summary is not evidence

- AGENTS.md, then CLAUDE.md: "Verification discipline", "Release management" and "Fergie Time".
- docs/moments-architecture.md, all of it. Pay particular attention to:
  - Decision 1 (the visit owner above the keyed boundary);
  - Decision 2 (one mounted DOM host that never moves the iframe);
  - the queue state machine, including the media status, attempt and failure rules;
  - "Slice 2 implementation decisions", especially "Inert path and selected anchor" and its closing list of what slice 3 inherits.
- docs/moments-gallery-implementation-prompt.md, for Beni's standing rulings and constraints.
- docs/verification/moments-gallery/README.md and docs/v0.2.6-ideas.md rows 56–58, plus that file's "Process notes" tail.
- Code:
  - src/App.tsx
  - src/components/MomentsSessionProvider.tsx, MomentsPage.tsx, ViewBoundary.tsx, MomentCover.tsx
  - src/lib/moments.ts, momentsQueue.ts, momentsSaved.ts, momentsReferences.ts, momentsGallery.ts, lens.ts, theme.ts
  - the Moments section of src/index.css
  - index.html
- Tests: tests/dom/rig.ts, tests/dom/momentsGallery.test.tsx, tests/fixtures/moments/ and tests/harness/.
- Design inputs in .plan-inputs/:
  - docs/moments-implementation-handoff-2026-09-25.md. Its product contract governs; its opening skill line and its seat routing are superseded.
  - docs/design/moments-r3/: review.html, decision-brief.md, evidence-index.md, and the stage and Cinema states in index.html, studio.js and studio.css. Read them; never run its scripts.
  - docs/design/moments-r3-cold-review.md: findings D-16–D-20, hazards H-A–H-G, and §12.
- Precedence is template > design brief > implementation prompt:
  - the template is the sealed R3 package;
  - the design brief is the 25 Sep handoff, as amended by the cold review's §12 and Beni's rulings;
  - the implementation prompt is the architecture doc and this prompt.
  Name every precedence call you make.

BENI'S STANDING RULINGS (27 Sep 2026)

1. Inert until curated. src/curated/moments.json stays [], and the live site must not change. With an empty edition, the player host renders nothing and makes no request. Slice 2 landed as a non-release on this basis. Assume slice 3 does the same, and list that assumption as a question for Beni to confirm.
2. The shared header stays 780px on every tab. The gallery is scoped to 1160px and Cinema to 1440px, as Moments-only exceptions.
3. D-16 remedy (a). The stage and the queue stack through 887px and sit side by side from 888px. Wherever they are side by side, the real player is at least 480 × 270.
4. Seats. Claude Code is the independent reviewer of whatever is built. This plan is a beta; routing the build is decided after it.

SLICE 3 SCOPE (set by the PM seat)

- MomentsPlayerHost. Mount it as an unkeyed sibling of the Moments route boundary, under the session owner, with its own error boundary. A player failure must not take down the route, Fixtures or Table.
  - One fixed host DOM container owns the only iframe.
  - Stage and Cinema placement changes by CSS alone, measured from the in-flow `data-moments-stage-anchor` versus the Cinema viewport.
  - Never render the iframe inside the keyed boundary, and never portal or reparent it.
  - At gallery-only or on another tab, hide the host and pause the player, keeping its DOM instance where that is safe.
  - Say how you will measure the anchor across resize, scroll, lens switches and breakpoint changes.
- src/lib/momentsPlayer.ts. Write one small typed YouTube adapter with no new dependency.
  - It captures (item ID, attempt) and rejects stale callbacks at its boundary.
  - It verifies origin, instance, source and event semantics before dispatching the reducer's provider or failure actions.
  - It dispatches at most one terminal failure per attempt.
  - It maps error codes to the reducer's failure kinds from the official documentation. The architecture treats 150 as an owner block and never a territory claim, and row 56 treats 2/5/100 as unavailable.
  - It samples the last finite, nonnegative provider-reported position and never estimates it.
  - It never blocks navigation waiting on a cross-origin reply.
  - Resuming an earlier item after the single instance served another source is reload-and-seek, only on explicit Play, labelled as resuming from the last known position, and only after seek success is observed.
- Intent gate. No provider request of any kind before an explicit Play: no IFrame API script, thumbnail, preconnect or iframe. After intent, allow at most one provider instance. Say whether you recommend the privacy-enhanced embed host, and make it a decision for Beni rather than a silent default.
- Cinema. An accessible modal that shares its subtree with the host, with the rest of the app inert.
  - Focus containment must account for the cross-origin frame.
  - Escape and Exit return focus to the right place.
  - Provider controls and attribution stay unobscured.
  - H-C, whether Cinema pushes a history entry: set out the options, with Android and iOS back behaviour, and recommend one for Beni's ruling.
- Recovery.
  - The 150 owner block is a labelled entry with Retry as the primary action and the source link beside it.
  - A timeout is neutral.
  - Recovery copy names the real Next item from queueNeighbours (D-08).
  - Resolve H-G, the duplicate Next controls.
- Acceptance in scope:
  - D-06: the player stays in its column and never covers the queue; hit-test every row.
  - D-07, including the in-modal live region.
  - D-09 and D-14 as real adapter journeys.
  - D-15: choosing a lower phone-Cinema queue row brings the player and action into view and restores useful focus.
  - D-16's player half.
  - D-17 to D-20 in stage and Cinema.
  - The inert proof again.
- Deterministic validation. Use a mock adapter behind the same interface for tests and the unshipped harness, with zero media-provider requests in deterministic runs. The mock and any simulation controls must never reach either production bundle; say how you will prove that.
- Not in slice 3:
  - any real provider request, which belongs to slice 4 and needs Beni's narrow authorisation;
  - curation or a first edition;
  - src/data, workflows, URL parameter meanings or the Fixtures and Table behaviour;
  - a version bump or CHANGELOG version section;
  - a new dependency.

WHAT THE PLAN MUST CONTAIN, in this order

1. Ground truth: the commit you planned against; every file you actually opened; the seal result and who verified it; anything you could not read.
2. Dependencies on unreviewed PR #118. List each slice-2 interface the plan relies on: the owner API, the route boundary, the stage anchor, the harness. Say what changes if Pass 1 moves it. In particular, MomentsSessionBoundary and MomentsSessionProvider currently wrap the whole App shell.
3. Architecture:
   - a text component tree;
   - a file ownership table;
   - the host placement mechanics;
   - an adapter lifecycle state diagram per attempt, covering cancellation, stale-callback rejection, StrictMode double mounting, the error boundaries, tab away and back, lens switches during play, and gallery return.
4. Provider contract. For each YouTube behaviour you rely on, give the official documentation section you read and what it says, in your own words:
   - script loading, player readiness, state changes, error codes, current time, seeking and origin handling;
   - the embed host.
   Mark every claim you did not read UNVERIFIED.
5. Cinema, dialog and focus plan, with the H-C options and your recommendation.
6. Build sequence:
   - an ordered list of commits, each keeping npm run typecheck and npm test green;
   - whether this should be one PR or two (for example host and adapter, then Cinema), with reasons;
   - a size estimate in files and lines, labelled as an estimate.
7. Test plan:
   - unit tests of the adapter against a fake provider;
   - DOM tests that extend tests/dom/rig.ts rather than reinvent it;
   - the inert receipt (72 cells, 3 lenses × 2 themes × 3 tabs × 360/375/390/1000, base against head, identical body text);
   - a slice-3 browser matrix: stage and Cinema across ready, loading, playing, paused, ended, blocked and timeout, plus gallery return, tab away and back, and a lens switch during play, at 360/375/390/761/768/800/855/887/888/1000/1100/1250/1440/1920 × 3 lenses × 2 themes;
   - geometry hit tests for D-06, and real keyboard and focus tests;
   - the viewport set before every capture, and scrollWidth === innerWidth checked on every cell.
8. Acceptance map: every D- and H- item in scope, mapped to the test or evidence that will prove it.
9. A real-provider validation plan for Beni's narrow authorisation in slice 4: the exact requests, environments, items, evidence to capture and stop conditions. It is written now, executed never, by you.
10. Risks, ranked, each with what would disprove it.
11. Decisions for Beni, each answerable in one word, with your recommendation. Include at least the inert non-release landing for slice 3, H-C, the embed host and the one-or-two PR split.
12. An honesty ledger in three lists: read in the repo; read in provider documentation; inferred. Then a Not verified list: physical devices, Safari and Firefox, screen-reader speech, real provider behaviour, and anything else.

Keep the plan specific to this repo. Where the architecture document already decides something, cite it and follow it rather than re-deciding. Where you disagree with it, say so plainly as a question for Beni instead of planning around it.

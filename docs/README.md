# The paper trail

Every version of Kickoff moves through a ladder of up to four documents, and whatever a cycle
wrote is archived here — receipts and all, and honestly incomplete where a cycle skipped a
rung. This is the back office: the front door is [README.md](../README.md), the house rules
are [HONESTY.md](HONESTY.md), and what follows is the paper trail from a hand-typed dashboard
to here, filed by release. Two things a cold reader needs first:

- **Doc-cycle names and release numbers diverge on purpose.** The v0.1.0 release shipped
  from the v0.0.3 design cycle and kept its working name; v0.2.1's proposal plans v0.2.2
  through v0.3.1. Never infer one from the other — the table says which release each file
  belongs to.
- **The rungs.** (1) *proposal* — an audit and the spec of record, written from a fresh read
  of the repo; (2) *design prompt* — the Claude Design brief, on real tokens and data;
  (3) *implementation prompt* — the Claude Code build spec; (4) *review prompt* — the
  adversarial review and merge instructions, which since v0.2.1 is the repo command
  `/kickoff-pr-review` (`.claude/skills/kickoff-pr-review/`) plus a per-PR appendix. Precedence
  when they disagree: design template, then brief, then build spec.

## 📖 Reader-facing pages

| File | What it is |
|---|---|
| 📜 [HONESTY.md](HONESTY.md) | The house rules — the UTC instant, the diff engine, fail-loud guards, staleness as a state — as a first-class argument. Start here. |
| 🗺️ [ARCHITECTURE.md](ARCHITECTURE.md) | The data flow ESPN → app, the file map, where the pure layer ends, one skeleton and three lenses, the two ESPN traps. |

## 📚 The archive, by release

| File | Release | Rung | Notes |
|---|---|---|---|
| `v0.0.3-design-prompt.md` | v0.1.0 | design prompt | The lens system's brief: "one instrument, three lenses". No proposal was archived for this cycle. |
| `v0.0.3-implementation-prompt.md` | v0.1.0 | implementation prompt | The build spec for Ledger, Poster and Broadcast. |
| `v0.0.3-review-prompt.md` | v0.1.0 | review prompt | The adversarial review of PR #2. |
| `v0.2.0-ideas.md` | — | ideas | The ranked candidate list written cold after the v0.1.0 review; the fuller text for rows later carried into `v0.3.0-ideas.md`. |
| `v0.2.0-scoping-prompt.md` | v0.2.0 | scoping (pre-ladder) | The PM prompt that fixed v0.2.0's scope and dropped PR #5's version bump — a data refresh is not a release. |
| `v0.2.0-proposal.md` | v0.2.0 | proposal | "The app learns to tell time": the ticking clock, the loud sync, the scheduled PR, and the auto-merge decision as first argued. No design brief or build spec was written for this cycle. |
| `v0.2.0-review-prompt.md` | v0.2.0 | review prompt | The adversarial review of PR #8. |
| `v0.3.0-ideas.md` | — | ideas | The list inherited by v0.2.5, written cold after the v0.2.0 review, with the accumulated process notes that still bind verification. Rows are struck through in place as releases consume them. Its v0.3.0 label is a cycle name, not a release-number decision; the sync rows it still holds now target v0.4.0. |
| `v0.2.1-pr-review-skill-plan.md` | v0.2.1 | plan | The deep-dive plan for the review command (then `/beni-pr-review`; `/kickoff-pr-review` since v0.2.4) before it was built. |
| `v0.2.x-patch-train-scoping-prompt.md` | v0.2.1 | scoping | The PM prompt that shaped the v0.2.x train. |
| `v0.2.x-one-shot-ultracode-prompt.md` | v0.2.1 | scoping | The one-shot prompt v0.2.1 was built from. |
| `v0.2.1-proposal.md` | v0.2.1 | proposal | "The review becomes a command", plus the release plan for the whole train and two rounds of review resolutions. Its train table is superseded on numbering by the next row. |
| `v0.2.2-proposal.md` | v0.2.2 | proposal | "The front door": Poster by default, the heroes on one clock, the sync's merge verdict, GitHub Pages, and these docs. |
| `v0.2.4-scoping-and-build-prompt.md` | v0.2.4 | scoping | The PM brief v0.2.4 was built from — the two-project rig, five affordances, two regressions, the review command renamed — with a head note listing where the repo disagreed with it. |
| `v0.2.4-proposal.md` | v0.2.4 | proposal | "Tests reach the wiring": the rig and its Node floor, each dependency's reason, both regressions quoted red then green, and what v0.2.5 inherits — including that it splits cleanly. |
| `v0.2.5-proposal.md` | v0.2.5 | proposal | "The resilience patch": the authoritative snapshot boundary and its availability cost, implementation choices, test and browser evidence, and dispatch receipts. |
| `design-cycle-proposal.md` | v0.3.0 | proposal | Snapshot states say what is known; design decisions, both review passes and the forward supersession of the sync theme to v0.4.0. |
| `v0.2.6-ideas.md` | — | ideas | **The current ranked list**, with original row numbers, explicit provider follow-ups and process notes from the v0.2.5 build. A candidate list, not a new release scope. |
| `v0.3.2-fast-track-brief.md` | v0.3.2 | executive brief (fast-track) | The Pass 1 cold review of PR #33 and its rulings: what shipped, what the review found, the verification as re-run, and the release handoff. |
| `Kickoff Standings.html` | v0.0.2 | reference | The standings design reference the Table was built from — the one hand-made artefact left, kept as history. |
| `screenshots/v0.0.3/` | v0.1.0 | evidence | The six-combo matrix (lens × theme, 390 px) as v0.1.0 shipped. |
| `screenshots/v0.2.2/` | v0.2.2 | evidence | The same six cells at v0.2.2, Poster as default. |
| `pr30-pass-2.5-executive-brief.md` | v0.3.1 | executive brief (Pass 2.5) | The synthesis of PR #30's six-pass 360: corroboration of both vendors, the merge gate, and the escalation to Beni. |
| `pr30-pass-3-adjudication-prompt.md` | v0.3.1 | adjudication handoff (Pass 3) | Beni's five rulings, the non-release and release paths, the squash body, closure evidence, and the row-28 hotfix task. |
| `design-cycle-ucl-brief.md` | open (item f) | design brief | The European week, the league-phase table and the Moment gallery, as the artifacts that consumed the brief restate it — the brief's own text was not available to the archiving session and is to be pasted in. Release number deliberately unclaimed. |
| `design-cycle-ucl-spec.md` | open (item f) | design spec | Transcription of the local-only Claude Design canvas (eight artboards, SHA-256 recorded): the four rulings, the two rule amendments verbatim, the data-shape findings F1–F8, per-state tokens, and the seven not-decided items. |
| `design-cycle-ucl-review-pass-1.md` | open (item f) | design review (Round 1) | PR #34. The cold review of that canvas against the repo — hunt classes D1–D10, the findings table with the Round 2 handoff column, what remains unresolved ranked, and the retro that seeds a `/kickoff-design-review` skill. |
| `design-cycle-ucl-round-1.5-brief.md` | open (item f) | executive brief (Round 1 → PM) | The Round 1 reviewer's handoff to the Chief TPM / Product seat: the seventeen findings condensed with what overturns each, ten logistics decisions for Round 2 with recommendations, the reproduction recipes Round 2 re-runs, and the shape the Round 2 prompt must take. |
| `design-cycle-ucl-review-pass-2.md` | open (item f) | design rebuttal (Round 2) | Independent dispositions for all seventeen findings, corrected provider receipts and layout measurements, a new venue-clock build finding, and ranked questions for Round 3. |
| `design-cycle-ucl-round-3-decision-packet.md` | open (item f) | decision packet (Round 3, PM) | The Chief TPM seat's synthesis after Round 2: the twelve-row decision table with recommendations and alternatives, findings 1–18 accounted for, the VIP sign-off packet's requirements, the provisional release placement, and the ten decisions Beni makes next. Archived from `../Sportsbooks/`. |
| `design-cycle-ucl-round-3-cto-prompt.md` | open (item f) | technical-resolution prompt (Round 3) | The bounded CTO assignment: nine questions in the order they block approval, each with the evidence to return and its closure criterion; docs and disposable probes only. Archived from `../Sportsbooks/`. |
| `design-cycle-ucl-round-3-technical-resolution.md` | open (item f) | technical resolution (Round 3, CTO) | The CTO seat's answers: finding 18 reproduced and the absent-zone render measured, UEFA Articles 17/18/23/27 sourced, the grouped sticky band proven layout-neutral, every layout number re-read, and the five one-word questions Beni's evidence changed. |
| `design-cycle-ucl-round-3-rulings.md` | open (item f) | rulings (Round 3, Beni) | Beni's five one-word rulings on the technical resolution, 9 Sep 2026, quoted verbatim: venue-clock fallback yes, round identity option A, desktop divider sticky, Moments under `src/curated/`, a structurally ended table degrades with a report line. Then the second set the same afternoon: the scoped sticky rule upheld, the callout reworded, ESPN confirmed with the round-string precedence, the picker and tab layout approved, the curl line removed. What each fixes for the build and the canvas, the items tracker after them, and what remains release-side. |
| `design-cycle-ucl-round-3-vip-correction-prompt.md` | open (item f) | VIP correction prompt (Round 3 → Claude Design) | The designer's bounded assignment after all ten rulings: one corrected revision of the same canvas, artboard by artboard (the three matchday states, the "local time not known" pill, the desktop sticky header and divider, one Moments path, the rewritten F1 and F4, the sourced tie-break sentence, the corrected captions and figures), the two designer decisions it records, the contrast choice within design-system rule B4, and the three sign-offs against one revision hash. Delivered in chat; this is the archive. |
| `design-cycle-ucl-implementation-prompt.md` | open (item f) | implementation brief (Round 3 → Codex) | The post-merge build brief for "Kickoff learns the European week": the executive brief and roadmap, six workstreams in dependency order (venue zones, UCL activation with the first-seen matchday baseline and the degrade-not-abort standings guard, the 36-row table with grouped sticky bands on both widths, the European matchday in all three lenses, Moments as a curated content class outside the sync boundary, docs), the acceptance criteria and verification matrix, the resolutions the builder records, and the PR shape the 360 review expects. Delivered in chat; this is the archive. |
| `european-week-verification.md` | open (item f) | implementation verification (PR #39, Codex) | The builder's own evidence for the European week: the ten rulings as implemented, sources, the browser matrix as run, contrast tables, the resolutions it recorded and the open design confirmations. `verification/european-week/` holds its raw receipts (matrix, sticky, domestic before/after boxes, contrast, sync reports) and `screenshots/european-week/` twenty captures. Evidence for the cold review, not a review. |
| `european-week-pass-2-brief.md` | open (item f) | rebuttal brief (PR #39, Pass 1.5) | The Pass 2 prompt for the builder after the cold review: the six findings with the reviewer's evidence and what each disposition needs, the re-sync the builder owns after the bot's merge made the PR conflicting, Beni's two process rulings (the chip case is argued in the rebuttal and ruled in Round 3; the number is cut in Round 3), and the comment shape. Delivered in chat; this is the archive. |

Counts drift; `ls docs` is the truth. Ideas files are ranked candidate lists, not release
scopes — turning one into a release is the proposal's job, and the deferral reasons in each
proposal are the part a reader six months out actually needs. A hotfix has no rung: v0.2.3
(the workflows on Node 24 actions, 4 Sep 2026) is recorded only in `CHANGELOG.md`, and it is
why the train's numbers in the two proposals above carry dated notes instead of rewrites.

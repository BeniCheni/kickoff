# The paper trail

Every version of Kickoff moves through a ladder of up to four documents, and whatever a cycle
wrote is archived here — receipts and all, and honestly incomplete where a cycle skipped a
rung. This is the back office: the front door is [README.md](../README.md), the house rules
are [HONESTY.md](HONESTY.md), and what follows is the paper trail from a hand-typed dashboard
to here, filed by release. Two things a cold reader needs first:

- **Doc-cycle names and release numbers diverge on purpose.** The v0.1.0 release shipped
  from the v0.0.3 design cycle and kept its working name; v0.2.1's proposal plans v0.2.2
  through v0.3.0. Never infer one from the other — the table says which release each file
  belongs to.
- **The rungs.** (1) *proposal* — an audit and the spec of record, written from a fresh read
  of the repo; (2) *design prompt* — the Claude Design brief, on real tokens and data;
  (3) *implementation prompt* — the Claude Code build spec; (4) *review prompt* — the
  adversarial review and merge instructions, which since v0.2.1 is the repo command
  `/beni-pr-review` (`.claude/skills/beni-pr-review/`) plus a per-PR appendix. Precedence
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
| `v0.3.0-ideas.md` | — | ideas | **The current ranked list**, written cold after the v0.2.0 review, with the process notes that bind how a PR is verified here. Rows are struck through in place as releases consume them. |
| `v0.2.1-pr-review-skill-plan.md` | v0.2.1 | plan | The deep-dive plan for `/beni-pr-review` before it was built. |
| `v0.2.x-patch-train-scoping-prompt.md` | v0.2.1 | scoping | The PM prompt that shaped the v0.2.x train. |
| `v0.2.x-one-shot-ultracode-prompt.md` | v0.2.1 | scoping | The one-shot prompt v0.2.1 was built from. |
| `v0.2.1-proposal.md` | v0.2.1 | proposal | "The review becomes a command", plus the release plan for the whole train and two rounds of review resolutions. Its train table is superseded on numbering by the next row. |
| `v0.2.2-proposal.md` | v0.2.2 | proposal | "The front door": Poster by default, the heroes on one clock, the sync's merge verdict, GitHub Pages, and these docs. |
| `Kickoff Standings.html` | v0.0.2 | reference | The standings design reference the Table was built from — the one hand-made artefact left, kept as history. |
| `screenshots/v0.0.3/` | v0.1.0 | evidence | The six-combo matrix (lens × theme, 390 px) as v0.1.0 shipped. |
| `screenshots/v0.2.2/` | v0.2.2 | evidence | The same six cells at v0.2.2, Poster as default. |

Counts drift; `ls docs` is the truth. Ideas files are ranked candidate lists, not release
scopes — turning one into a release is the proposal's job, and the deferral reasons in each
proposal are the part a reader six months out actually needs. A hotfix has no rung: v0.2.3
(the workflows on Node 24 actions, 4 Sep 2026) is recorded only in `CHANGELOG.md`, and it is
why the train's numbers in the two proposals above carry dated notes instead of rewrites.

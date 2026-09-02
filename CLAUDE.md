# Kickoff — project instructions

Big-5 European football fixtures + standings tracker, Brooklyn time (`README.md` has the data
philosophy: **generated and diffed, never typed**). This project is the **build track** of the
unified `/beni-betting-pipeline` skill — the same skill that runs the betting work in
`../Sportsbooks/` also generates the prompts and reviews that build this app. Kickoff is also
that pipeline's Step 0 fixture source (`http://localhost:5173/`, `?only=` and `&date=` URL
filters), so data honesty here is betting-grade: never render a kickoff time the league hasn't
set, never invent matchday numbers, both clocks derive from one UTC instant.

## How this repo gets built (the prompt ladder, proven on the v0.0.3 doc cycle — shipped as
release v0.1.0; doc-ladder naming and release semver diverge, don't assume they match)

Versions move through four documents, all archived in `docs/` and all **generated from a fresh
read of the repo, never from recollection** — treat the repo as ground truth and my description
of it as unreliable:

1. `docs/vX.Y.Z-proposal.md` — audit + directions (written by a Claude Code session in-repo).
2. `docs/vX.Y.Z-design-prompt.md` — the Claude Design brief, built on real tokens/data.
3. `docs/vX.Y.Z-implementation-prompt.md` — the Claude Code build spec.
4. `docs/vX.Y.Z-review-prompt.md` — the adversarial review + merge instructions.

Rules that earned their place: **spec precedence is template > design brief > implementation
prompt** (note every resolution in the PR); every prompt is delivered in the chat message in a
fenced block, ready to paste — the `docs/` copy is the archive, never the delivery; review
sessions get prior findings only as a sealed "verify independently" appendix, never as
conclusions; model routing that worked — Fable 5 **High** for design/build, **Extra** for the
review pass.

## Verification discipline (from that v0.0.3-doc-cycle / v0.1.0-release review)

- `npm run typecheck` and `npm test` green at every commit; data-honesty test assertions are
  never weakened to make a redesign pass.
- Browser-verify before declaring done: every lens × theme × tab at 390px and ~1000px, and
  check `document.documentElement.scrollWidth === viewport width` — **set the viewport before
  capturing any screenshot**; a clipped capture cost a review pass proving a non-bug.
- Commits authored as `Claude <noreply@anthropic.com>` so GitHub attribution stays clean.
- `.claude/worktrees/` entries look "prunable" from cloud/VM sessions because their absolute
  gitdir paths only resolve on the Mac — don't prune them from a mounted session.

## Scheduled sync (v0.2.0)

`.github/workflows/sync.yml` runs `npm run sync` twice a day — `0 4,16 * * *`, midnight and
noon EDT, an hour early under EST because GitHub's cron is UTC — and opens or updates one
rolling PR (`sync/scheduled` → `main`) carrying the diff report — it never pushes straight
to `main` and **never auto-merges its own PR**: this repo feeds real betting decisions, so a
human reads the change report (every DATE_MOVED / TIME_CHANGED / HOME_AWAY_INVERTED /
STATUS_CHANGED line is a Track A Step 0 re-verification trigger) before it lands. Full
reasoning in `docs/v0.2.0-proposal.md`. `workflow_dispatch` (with a `dry_run` input mapped
to `npm run sync -- --check`) lets a session test the workflow without waiting for the
schedule. Needs the repo's "Allow GitHub Actions to create and approve pull requests"
setting on (enabled 2026-09-01) — no secret, no PAT. The workflow commits only when the diff
engine's report line (`report: changed=…`, the last line `npm run sync` prints) says
something moved — a fixture change of any kind or a standings row — so a quiet run leaves no
commit and no PR. Consequence, accepted: the app's `synced` stamp and staleness banner
measure time since the last *change-bearing* sync a human merged, and go amber then red
through an international break even though the bot verified nothing moved. The fix
(auto-merging an empty report) is deliberately not in v0.2.0 — see the proposal's "Review
resolutions".

## Fergie Time (the design system)

`../Fergie Time Design System/` — the exported Claude Design system (tokens, 15 component
mirrors, the three lens prototype templates) — is **local-only and unreleased**; Beni is
holding it back until he's satisfied with its quality. References to it in `docs/` are
deliberate teasers, not broken links — leave them be, and never commit the folder into this
repo. `src/index.css` + `src/lib/competitions.ts` remain the token source of truth; the DS
mirrors them, not the reverse.

## Roadmap pointers

`docs/v0.2.0-ideas.md` (written from the v0.1.0 review; restaged from v0.1.1 when that
number shipped as PR #4's housekeeping patch) carries the ranked candidate scope.
Separately, `README.md`'s "Beyond" section names the standing bridge to the betting track:
fixtures carry stable ids so a later `positions.json` join — plus a token-expiry-vs-kickoff
feature — can badge fixtures holding an open position or an expiring token. Not yet on the
ranked list; blocked on defining those files in `../Sportsbooks/`.

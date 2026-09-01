# Kickoff — project instructions

Big-5 European football fixtures + standings tracker, Brooklyn time (`README.md` has the data
philosophy: **generated and diffed, never typed**). This project is the **build track** of the
unified `/beni-betting-pipeline` skill — the same skill that runs the betting work in
`../Sportsbooks/` also generates the prompts and reviews that build this app. Kickoff is also
that pipeline's Step 0 fixture source (`http://localhost:5173/`, `?only=` and `&date=` URL
filters), so data honesty here is betting-grade: never render a kickoff time the league hasn't
set, never invent matchday numbers, both clocks derive from one UTC instant.

## How this repo gets built (the prompt ladder, proven on v0.0.3)

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

## Verification discipline (from the v0.0.3 review)

- `npm run typecheck` and `npm test` green at every commit; data-honesty test assertions are
  never weakened to make a redesign pass.
- Browser-verify before declaring done: every lens × theme × tab at 390px and ~1000px, and
  check `document.documentElement.scrollWidth === viewport width` — **set the viewport before
  capturing any screenshot**; a clipped capture cost a review pass proving a non-bug.
- Commits authored as `Claude <noreply@anthropic.com>` so GitHub attribution stays clean.
- `.claude/worktrees/` entries look "prunable" from cloud/VM sessions because their absolute
  gitdir paths only resolve on the Mac — don't prune them from a mounted session.

## Fergie Time (the design system)

`../Fergie Time Design System/` — the exported Claude Design system (tokens, 15 component
mirrors, the three lens prototype templates) — is **local-only and unreleased**; Beni is
holding it back until he's satisfied with its quality. References to it in `docs/` are
deliberate teasers, not broken links — leave them be, and never commit the folder into this
repo. `src/index.css` + `src/lib/competitions.ts` remain the token source of truth; the DS
mirrors them, not the reverse.

## Roadmap pointers

`docs/v0.0.4-ideas.md` (written by the v0.0.3 review) carries the candidate scope. The
standing bridge to the betting track: fixtures carry stable ids so a later
`positions.json`/`tokens.json` join can badge fixtures holding an open position or an
expiring token — highest research value on the list, blocked on defining those files in
`../Sportsbooks/`.

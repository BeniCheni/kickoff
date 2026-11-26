# Kickoff — project instructions

Big-5 European football fixtures + standings tracker, Brooklyn time (`README.md` has the data
philosophy: **generated and diffed, never typed**). This project is the **build track** of the
unified `/anthropic-skills:football-soccer-deity` skill (`/beni-betting-pipeline` until 7 Sep
2026) — the same skill that runs the betting work in `../Sportsbooks/` also generates the
prompts and reviews that build this app. Kickoff is also that pipeline's Step 0 fixture source
(`http://localhost:5173/`, the `?only=` competition filter and the `&date=` week anchor), so
data honesty here is betting-grade: never render a kickoff time the league hasn't set, never
invent matchday numbers, both clocks derive from one UTC instant.

## How this repo gets built (the prompt ladder, proven on the v0.0.3 doc cycle — shipped as
release v0.1.0; doc-ladder naming and release semver diverge, don't assume they match)

Since 22 Nov 2026, review depth follows four risk tiers. Tier 3 gets the six-pass 360.
The [README](README.md#-how-it-gets-built) owns the tiers and seats.
[AGENTS.md](AGENTS.md#review-tiers) lists the Tier 3 paths.

Versions move through four documents, all archived in `docs/` and all **generated from a fresh
read of the repo, never from recollection** — treat the repo as ground truth and my description
of it as unreliable:

1. `docs/vX.Y.Z-proposal.md` — audit + directions (written by a Claude Code session in-repo).
2. `docs/vX.Y.Z-design-prompt.md` — the Claude Design brief, built on real tokens/data.
3. `docs/vX.Y.Z-implementation-prompt.md` — the build spec.
4. `docs/vX.Y.Z-review-prompt.md` — the adversarial review brief. Since v0.2.1
   the method lives in the repo skill `/kickoff-pr-review` (`.claude/skills/kickoff-pr-review/`;
   `/beni-pr-review` until v0.2.4); the archived prompt for a release is the per-PR part —
   number, spec files, human-review items, the sealed appendix — not the method. Since v0.3.0
   the skill also carries the **six-pass 360 cycle** for a Tier 3 PR — Pass 0 brief →
   1 cold review → 1.5 rebuttal brief → 2 rebuttal →
   2.5 synthesis and Executive Summary Brief → 3 Beni's adjudication. Pass 2.5 scores the gate
   and escalates. The merge takes Beni's word. `/kickoff-pr-review` owns this cycle.
   The pipeline skill's B1.6 is an older PM-side copy that predates the tiers.

Rules that earned their place: **spec precedence is template > design brief > implementation
prompt** (note every resolution in the PR); every prompt is delivered in the chat message in a
fenced block, ready to paste — the `docs/` copy is the archive, never the delivery; review
sessions get prior findings only as a sealed "verify independently" appendix, never as
conclusions. See the [README seats table](README.md#-how-it-gets-built) for model routing.

**Generated prompts are never hand-wrapped — see `../Sportsbooks/CLAUDE.md`, "Generated copy-paste
content is NEVER hand-wrapped" (5 Sep 2026), which is the owning copy.** In short: one line per
paragraph in every Claude Design / Claude Code prompt delivered in chat, however long that line
runs, and a four-backtick outer fence when the block carries its own ```-fenced sub-blocks. It does
NOT apply to files in this repo — `docs/`, `CLAUDE.md`, `README.md` and `CHANGELOG.md` keep their
existing wrapped style.

## Verification discipline (from that v0.0.3-doc-cycle / v0.1.0-release review)

- `npm run typecheck` and `npm test` green at every commit; data-honesty test assertions are
  never weakened to make a redesign pass.
- The web app ships on Vercel Hobby: request work must fit 300 s, 250 MB uncompressed and 2 GB;
  generation and embedding run in the Studio
  ([limits](https://vercel.com/docs/functions/limitations), read 19 Oct 2026).
- Since v0.2.4 `npm test` runs two vitest projects (`vite.config.ts`, `test.projects`): `node`
  — the pure layer, `tests/**/*.test.ts` minus `tests/dom`, what always ran — and `dom` — the
  component wiring, everything under `tests/dom/` (`*.test.ts` or `.tsx`) under jsdom +
  Testing Library, typed by `tsconfig.test-dom.json`.
  The rig is `tests/dom/rig.ts`: drive the app's own clock store with fake timers and a focus
  catch-up, URL state by `replaceState` + a synthetic popstate, StrictMode's double subscribe,
  a stubbed `matchMedia`, a `localStorage` that throws, a contained throw under a boundary.
  Extend it; do not re-invent it. What it does *not* cover is the next bullet — jsdom knows
  nothing of layout, contrast or `scrollWidth`, so the browser matrix stands.
  Node floor: jsdom 30 needs `^22.22.2 || ^24.15.0 || >=26.0.0`, mirrored in `package.json`
  `engines` (npm warns, it does not block); CI runs Node 24.
- Browser-verify before declaring done: every lens × theme × tab at 360, 375, 390 and
  ~1000px (390 is the judge, 360 the jury) when the diff touches `src/` or `index.css`, a
  smoke pass when it is docs or tooling, and check
  `document.documentElement.scrollWidth === window.innerWidth` — **set the viewport before
  capturing any screenshot**; a clipped capture cost a review pass proving a non-bug.
- Commits may be authored by Claude, Codex or Cursor. Use the identity of the agent
  doing the work; Codex commits use `Codex <noreply@openai.com>`. Explicit session
  authorship instructions take precedence.
- `.claude/worktrees/` entries look "prunable" from cloud/VM sessions because their absolute
  gitdir paths only resolve on the Mac — don't prune them from a mounted session.

## Scheduled sync (v0.2.0, amended v0.2.2)

Read [`.claude/rules/sync.md`](.claude/rules/sync.md) before working on the workflow, its scripts,
the generated snapshot or the rolling `sync/scheduled` PR.

**Step 0 starts with the sync check.** Before any Step 0 that a position depends on, confirm the
latest `sync.yml` run on `main` succeeded and read the Step 0 contract in the sync rules. A failed
run means every open position gets independent primary-source re-verification rather than a re-read
of this app. The owning procedure is in `../Sportsbooks/CLAUDE.md` ("Check the sync run succeeded
BEFORE trusting the app").

## Fergie Time (the design system)

Moved to [`.claude/rules/design-system.md`](.claude/rules/design-system.md), unchanged. Read it
before design-system, token or UI work.

## Release management — semver, the CHANGELOG, and who decides what (added 3 Sep 2026)

Read [`.claude/rules/releases.md`](.claude/rules/releases.md) before scoping, numbering or cutting
a release. Escalate numbering forks to Beni. Each release merge and tag remains Beni's.

## Roadmap pointers

Moved to [`docs/roadmap-pointers.md`](docs/roadmap-pointers.md), unchanged. It says what the next
release is and why; read it before planning one.

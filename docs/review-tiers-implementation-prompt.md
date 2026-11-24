# Kickoff: review depth by risk tier, and Codex as the default builder (build brief, drafted Sun 22 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sun 22 Nov 2026, from `main` at `0662e96`. It
carries three answers Beni gave that day:
- **R1:** how deeply a PR is reviewed depends on what a mistake in it would cost, in four tiers.
- **R4:** Codex is the default builder.
- **Two vendors.** Kickoff stays two vendors, as the Tue 17 Nov amendment in
  `docs/design-overhaul-plan.md` says ("two vendors, and no seat for Cursor or Grok"). That
  amendment is on open PR #328, not on `main`.

R6, which lets the Claude Code Action run on same-repo PRs only, is recorded here but changes
nothing in this PR.

**Seat: Codex, on `gpt-6.2-sol` at `xhigh`.** That is the M-size builder in #328's "When Codex
builds" column.

**This PR is tier 3 under its own rules**, because it changes `CLAUDE.md` and `AGENTS.md`. The
six-pass 360 follows in that same column:
- the PM seat writes Passes 0 and 1.5;
- a fresh Claude Code session on `claude-fable-5-2` at `xhigh` sits Pass 1, report-only;
- Codex answers Pass 2 and every fix round;
- a fresh Claude Code session on `claude-opus-5-5` at `xhigh` sits Pass 2.5 and writes nothing;
- Beni's word merges.

Read fresh for it:
- `README.md`, "🤖 How it gets built": the six-pass table near line 336 and the seats table near
  line 352;
- #328's two-vendor table, near line 302 of
  `git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md`;
- `CLAUDE.md`'s "How this repo gets built" and `AGENTS.md`.

Line numbers are from `0662e96`. The builder re-reads them; this brief does not pin them.

````text
FIRST: before anything else, read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/review-tiers-archive:docs/review-tiers-implementation-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so in your first message.
You are the builder for one Kickoff PR. Seat: Codex, `gpt-6.2-sol`, `xhigh`. Commit as `Codex <noreply@openai.com>` with a per-commit `git -c`, never `git config`. Claude wrote this brief and will review your PR, so Claude builds none of it.
WHY. On Sun 22 Nov 2026 Beni ruled R1: how deeply a PR is reviewed depends on what a mistake in it would cost, in four tiers. He ruled R4: Codex is the default builder, and Claude builds only when Beni routes a PR to it. He also confirmed that Kickoff stays two vendors, as his Tue 17 Nov amendment says: no standing seat for Cursor or Grok. Today `README.md` still says every change gets all six passes, and its seats table still lists Cursor as a builder. This PR writes the rulings into the files that state the routing. It changes no app code and no data.
WHERE. Work in a worktree of `/Users/benicheni/code/kickoff` (`git -C /Users/benicheni/code/kickoff worktree add`), cut from `origin/main` after `git fetch origin`, on a branch named `codex/review-tiers`. It has to be a worktree of that repo, not a fresh clone: the archive branch is local and has not been pushed, so a clone cannot see it. Do not work in Beni's main checkout itself. In your first message, name the folder and when it can be removed. Make your first commit `git cherry-pick claude/review-tiers-archive`. That is one commit, and it adds this brief as `docs/review-tiers-implementation-prompt.md`, the spec of record.
THE TIERS AS RULED. A PR takes the highest tier that any file in it reaches.
Tier 0, generated: the bot's sync PRs. Unchanged: `verify` passes, then the workflow merges the PR itself.
Tier 1, docs: only prose changes (`docs/`, prose in `README.md`) and no file that tier 3 names. Review: one cold read by the other vendor. An automated read is planned for later, and it will run only on PRs from branches in this repo, never on forks. Beni merges.
Tier 2, code: app or tooling code outside tier 3. Review: the builder, then one cold read by the other vendor with `/kickoff-pr-review`, which merges when the skill's §7 gate passes. A release never merges this way: Beni merges and tags every release.
Tier 3, sensitive: data honesty, the sync, the workflows, the schema and the clocks, the instructions every agent reads, and releases and numbering. Review: the six-pass 360, unchanged. Beni's word merges.
Until a labeler exists, the builder names the tier in the PR body, along with the file that sets it. Any reviewer may raise a tier. Only Beni lowers one.
THE TIER 3 PATHS. Put the exact list in `AGENTS.md`, read fresh from the repo. Start from this list and verify each entry: `src/data/**`; `.github/workflows/**`; the sync's scripts as the `paths:` in `.claude/rules/sync.md` list them; `src/lib/schema.ts` and `src/lib/time.ts`; the tests that hold a data-honesty assertion (find them by reading, not by guessing from names); `CLAUDE.md`, `AGENTS.md`, `.claude/**` and `.agents/**`; and the release files `.claude/rules/releases.md` names. Add what the repo shows is missing, drop what it shows is wrong, and say which in the PR body.
THE SEATS. Replace the README's seats table with the two-column shape of #328's table, generalised beyond the overhaul: one column for when Codex builds (the default since 22 Nov) and one for when Claude builds. #328 is not on `main`. Read its table with `git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md` (the table starts near line 302), and do not edit, rebase or merge #328. Copy its seats. When Codex builds: the PM seat writes the brief and Passes 0 and 1.5, a fresh Claude Code session sits Pass 1, Codex answers Pass 2 and every fix round, and a fresh Claude Code session sits Pass 2.5 and writes nothing. When Claude builds: Codex sits Passes 0, 1, 1.5 and 2.5, and Claude Code answers Pass 2 and every fix round. Keep the PM, designer and CEO rows. Name model families the way the README does now (Fable 5.2, Opus 5.5, GPT-6.2), not effort settings; the briefs carry those.
THE EDITS.
1. `README.md`, "🤖 How it gets built": the line "Every feature and fix gets a cross-vendor review, in six passes" overstates what now happens. Put a short reader-facing tier table first, then say that tier 3 gets the six passes, then keep the six-pass table and the rebuttal story as they are. Replace the seats table as above. Keep the H2 heading exactly as it is, because `CLAUDE.md`, `.claude/rules/releases.md` and the briefs cite it, and changing its emoji would move its anchor.
2. `CLAUDE.md`, "How this repo gets built": add at most four lines saying that since 22 Nov 2026 review depth follows four risk tiers, that the six-pass 360 is tier 3, that the README section owns the tiers and the seats, and that `AGENTS.md` lists the tier 3 paths. The line "model routing that worked — Fable 5 High for design/build, Extra for the review pass" no longer describes the routing: point it at the seats table. This file was cut to 99 lines on 20 Nov, so do not grow it past that by more than those lines.
3. `AGENTS.md`: the tier rules in short, and the exact tier 3 path list, so every Codex session reads them.
4. Other statements of the routing: grep `CLAUDE.md`, `AGENTS.md`, `.claude/rules/`, `README.md` and `docs/README.md` for `Cursor`, `builder`, `per task shape` and `six passes`. Make each one agree, or point it at the README, or list it under "deliberately not done" with the reason. Leave the archived briefs and records in `docs/` as they are, because they record what ran at the time.
DO NOT TOUCH. `.claude/skills/kickoff-pr-review/`: an audit of it is pending, with its own diff. If the skill contradicts the tiers, list where under "deliberately not done". Do not touch #328, keel, elenchus, app code or `src/data/`. Leave `CHANGELOG.md` `[Unreleased]` alone, because no app behaviour changes. Leave the README's 14 Nov counts (316 PRs, 981 tests) as they are and list them under "deliberately not done".
CHECKS. `npm run typecheck` and `npm test` on the head, with the real counts. The smoke pass `CLAUDE.md` asks of a docs or tooling PR. Every link and anchor your change touches resolves on GitHub. No fenced code block in the README runs wider than 30 columns, because a 390 px GitHub screen shows only 30. Before your final run, fetch `origin/main`. If it has moved, rebase, re-run, and say so.
LANDING. Open the PR as a draft against `main`, with the repo's PR template filled in and the tier named in the body ("Tier 3: changes CLAUDE.md and AGENTS.md"), then stop. Do not mark it ready and do not merge it. Report the PR number, the head SHA, the real test counts, and anything you could not do.
````

## Handed over again (Mon 23 Nov 2026)

The brief above was handed over on Sun 22 Nov and queued behind #352, and Codex never started it:
`git ls-remote origin 'refs/heads/*tiers*'` printed nothing at 11:38 AM EST today. Two later
briefs called it "the open `codex/review-tiers` PR" without checking. #364's Pass 2.5 caught that.

#352 merged at 10:07 PM EST on Sun 22 Nov as `45b7bc6`, so the queue is clear. Beni said "Yes,
hand it over" at about 11:50 AM EST. The PM seat checked the brief against `main` at `ffc5cac`:
- `git diff --stat 0662e96 origin/main -- README.md CLAUDE.md AGENTS.md .claude/rules` prints
  nothing, and `CLAUDE.md` is still 99 lines.
- Only two files the brief reads have moved. `CHANGELOG.md` gained #364's `[Unreleased]` line,
  and `docs/README.md` gained two rows from #368.

This addendum is a second commit on the archive branch, so the cherry-pick line changes. Delivered
in chat in a four-backtick fenced block, one line per paragraph. This copy is the archive.

```bash
codex -m gpt-6.2-sol -c model_reasoning_effort=xhigh -s workspace-write -a on-request -C /Users/benicheni/code/kickoff
```

````text
FIRST: read the whole brief and this addendum from the archive with `git -C /Users/benicheni/code/kickoff show claude/review-tiers-archive:docs/review-tiers-implementation-prompt.md`: the brief first, then its last section, "Handed over again (Mon 23 Nov 2026)". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so in your first message.
Kickoff: the review-tiers build (R1 and R4 into the repo), handed over again on Mon 23 Nov 2026
WHAT THIS IS. The brief was handed over on Sun 22 Nov and queued behind #352, which merged that night as `45b7bc6`. It was never started, and no `codex/review-tiers` branch exists. Build it now, as the brief says, with the four changes below. The seat is unchanged: Codex on `gpt-6.2-sol` at `xhigh`, committing as `Codex <noreply@openai.com>` with a per-commit `git -c`.
1. THE CHERRY-PICK. The archive branch now holds two commits: the brief, and this addendum. Make your first commits `git cherry-pick 0662e96..claude/review-tiers-archive`, not the single-commit cherry-pick the brief names. Together they add `docs/review-tiers-implementation-prompt.md`, the spec of record.
2. WHAT MOVED ON MAIN, now `ffc5cac`. `README.md`, `CLAUDE.md`, `AGENTS.md` and `.claude/rules/` are unchanged since `0662e96`, so the brief's line references still hold; re-read them anyway. #364 added `.claude/hooks/session-start.mjs`, its `.d.mts` file and a `hooks` block in `.claude/settings.json`. All of that falls under `.claude/**`, which is already on the tier 3 list. #364 also added one `### Added` line under `CHANGELOG.md` `[Unreleased]`; leave it, and the rest of `CHANGELOG.md`, alone. #368 added two rows to `docs/README.md`; re-read that file for edit 4.
3. TIER 2, THE PM SEAT'S RESOLUTION, NOT BENI'S RULING. The brief's tier 2 says the cold reader "merges when the skill's §7 gate passes". But §7 has a reviewer push fixes, and a reviewer that commits and then merges becomes the only cold reader of its own commits. On #365, the first tier 2 PR, the PM seat ran it like this: the cold read is report-only on code; fixes go back to the builder; the reviewer re-reads each fix round and merges only on "Mergeable now". Write tier 2 that way. Name it in the PR body as the PM seat's resolution for Beni to confirm at Pass 3. List the skill's §7 wording under "deliberately not done", because the pending skill audit owns `.claude/skills/`.
4. CODEX'S QUEUE. #328, at line 271 of `git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md`, says the review-loop track's Codex builds wait while Codex builds an overhaul PR. Today no overhaul PR is building, because the Track A Planner's next step is a Claude Design pass. If Beni routes an overhaul build to you before this PR opens, say so and ask him which comes first.
Everything else in the brief stands: the worktree, the tiers, the tier 3 paths, the seats, the four edits, DO NOT TOUCH, the checks and the landing. In your first message, name your worktree folder and say when it can be removed: when this PR merges or closes.
````

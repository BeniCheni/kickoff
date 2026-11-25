# Kickoff: two headless PM chores, the Pass 0 skeleton and the Unreleased draft (build brief, drafted Sun 22 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sun 22 Nov 2026, from `main` at `0662e96`. This is
item B5 of the studio tune-up plan. Beni ruled that day to build B1 and B5 side by side, with a
different vendor on each: Codex builds B1 (the SessionStart hook), and a fresh Claude Code session
builds this one, because it is tooling for Claude's own command line.

**Seat: Claude Code, on `claude-fable-5-2` at `xhigh`**, from #328's "When Claude builds" column.

**Tier 2**: new tooling under `scripts/pm/` and its tests, with no tier 3 file touched. Under
Beni's R1 of the same day, the review is one cold read by Codex with `/kickoff-pr-review`, which
merges when the skill's §7 gate passes.

The plan's B5 named three chores. This brief builds two:
- **Built:** the Pass 0 skeleton and the `[Unreleased]` draft. Both produce drafts that a person
  reads before using.
- **Dropped:** the sync-digest summary. Step 0 must read each fixture-change line itself
  (`CLAUDE.md`, "Step 0 starts with the sync check"), and a model's paraphrase of those lines is
  what a betting check should not trust.

````text
FIRST: before anything else, read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/pm-chores-archive:docs/pm-chores-implementation-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so in your first message.
You are the builder for one Kickoff PR. Seat: Claude Code, `claude-fable-5-2`, `xhigh`. Commit as Claude with a per-commit `git -c user.name=Claude -c user.email=noreply@anthropic.com commit`, never `git config`. Codex gives the cold read, so Codex builds none of it.
WHY. The PM seat repeats two chores by hand on every PR and release. It builds a Pass 0 skeleton: who wrote which commit, which files changed, and the builder's claims sealed for a reviewer to verify independently. It also drafts the `CHANGELOG.md` `[Unreleased]` section from the PRs merged since the last tag. Build both as scripts that use `claude -p` for the one part that needs a model and plain code for everything else.
WHERE. You are in your own worktree of `/Users/benicheni/code/kickoff`. Run `git fetch origin` first. Your branch may start from a stale local `main`, so put it on `origin/main` before your first commit (nothing is on it yet). Name the branch `claude/pm-chores`. Make your first commit `git cherry-pick claude/pm-chores-archive`. It adds this brief as `docs/pm-chores-implementation-prompt.md`. In your first message, name your worktree folder and when it can be removed.
CHORE 1, `scripts/pm/pass0.ts <PR number>`. Read `gh pr view <N> --json number,title,url,headRefName,headRefOid,baseRefName,files,commits,body`. With plain code, print markdown with: the PR line and head SHA; an authorship table of commits by author name and email, so each vendor's share is visible (Claude, Codex, Cursor, or a person); the files with their additions and deletions; and the total count. Then make one model call that pulls out the builder's checkable claims from the PR body and commit messages, things like test counts, "no data change", or "every link resolves". Print them under "Sealed appendix: claims to verify independently, never conclusions".
CHORE 2, `scripts/pm/unreleased.ts`. Find the latest tag (`git describe --tags --abbrev=0`) and its date. List the PRs merged into `main` since then, leaving out the bot's sync PRs (head `sync/scheduled`, or titles starting `npm run sync` or `sync: verified unchanged`). Then make one model call that drafts an `[Unreleased]` section in the shape `.claude/rules/releases.md` describes: one lead sentence, then Added, Changed and Fixed, then "Deliberately not done", with each line citing its PR number. Print the draft. Never write `CHANGELOG.md`: a person reads the draft and applies it.
THE MODEL CALL. One shared helper for both chores. Verify every flag against `claude --help` on this machine, because flags change. Run `claude -p` with `--model claude-sonnet-5-5`, `--output-format json`, a `--json-schema` for the shape you need, and one turn. The call gets no tools at all, because PR bodies and commit messages are untrusted text, and with no tools an injected instruction can do nothing. Pass the text on stdin, never in argv. Fence the untrusted text in the prompt and tell the model it is data. Validate the returned JSON against the schema. If `claude` is missing, not signed in, or returns something invalid, print the plain-code part, then one line saying the model part failed and why, and exit non-zero. Never print a partial result as if it were complete.
TESTS. Keep the logic pure and test it with fixtures: the authorship table, the sync-PR filter, the prompt assembly with its fencing, and JSON validation, including invalid and missing output. Put the model runner and the gh runner behind injected functions. No test may call GitHub or Claude.
HOW TO RUN. Run the scripts with `npx tsx scripts/pm/pass0.ts 352` and `npx tsx scripts/pm/unreleased.ts`. Explain both in `scripts/pm/README.md`, including that each run uses Claude Max usage. Do not add `package.json` scripts: `package.json` is a release file and tier 3.
DO NOT TOUCH. `README.md`, `CLAUDE.md` and `AGENTS.md`: Codex's `codex/review-tiers` PR is editing them now. `.claude/`: Codex's `codex/session-start-hook` PR is adding files there. Also leave alone `package.json`, `package-lock.json`, `CHANGELOG.md`, the sync scripts, the workflows, `src/` and `src/data/`.
CHECKS. `npm run typecheck` and `npm test` on the head, with the real counts. Run both scripts for real once: `pass0.ts` on PR 350 and `unreleased.ts` as of today. Paste their real output into the PR body, and say how many model calls the two runs made. Before your final run, fetch `origin/main`. If it has moved, rebase, re-run, and say so.
LANDING. Push `claude/pm-chores` and open a draft PR against `main`, with the repo's PR template filled in and "Tier 2: new tooling under scripts/pm/, no tier 3 file" in the body. Then stop. Codex's cold read marks it ready and merges it when the gate passes. Report the PR number, the head SHA, the real test counts and anything you could not do.
````

# Kickoff: a SessionStart hook for the Step 0 check and the live folders (build brief, drafted Sun 22 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sun 22 Nov 2026, from `main` at `0662e96`. This is
item B1 of the studio tune-up plan. Beni ruled that day to build B1 and B5 side by side, with a
different vendor on each: Codex builds this one, and a fresh Claude Code session builds B5 (the
headless PM chores).

Two rules depend on someone remembering them:
- `CLAUDE.md`'s "Step 0 starts with the sync check". Codex's cold read of #350 had to put it back
  by hand.
- The live-folder protocol.

The 18 Nov worktree losses show that memory fails. A SessionStart hook runs every time a session
opens, so the check no longer depends on anyone remembering it.

**Seat: Codex, on `gpt-6.2-sol` at `xhigh`**, from #328's "When Codex builds" column.

**This PR is tier 3**, because it adds files under `.claude/`. The six-pass 360 follows in that
column. Pass 1 matters most here: Codex cannot run Claude Code to see the hook fire, so the fresh
Claude Code session does that.

Facts read for it on `0662e96`:
- `.claude/settings.json` holds only `permissions.allow`, and no `.claude/hooks/` exists.
- `gh run list --workflow=sync.yml --branch main --limit 1` answered in 0.8 s.
- Five tests already run scripts as subprocesses (`tests/publishGate.test.ts`,
  `tests/syncPublication.test.ts` and others).

````text
FIRST: before anything else, read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/session-hook-archive:docs/session-start-hook-implementation-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so in your first message.
You are the builder for one Kickoff PR. Seat: Codex, `gpt-6.2-sol`, `xhigh`. Commit as `Codex <noreply@openai.com>` with a per-commit `git -c`, never `git config`. Claude wrote this brief and sits Pass 1, so Claude builds none of it.
WHY. Two rules depend on someone remembering them. First, `CLAUDE.md` says "Step 0 starts with the sync check": before any Step 0 a position depends on, confirm that the latest `sync.yml` run on `main` succeeded. Second, every round that uses a worktree must name its live folders first. Both have been missed. Build a Claude Code SessionStart hook that puts both facts in front of every Claude session when it opens, resumes, clears or compacts, so nobody has to remember them.
WHERE. Work in a worktree of `/Users/benicheni/code/kickoff` (`git -C /Users/benicheni/code/kickoff worktree add`), cut from `origin/main` after `git fetch origin`, on a branch named `codex/session-start-hook`. It has to be a worktree of that repo, not a fresh clone: the archive branch is local and has not been pushed. Do not work in Beni's main checkout itself. In your first message, name the folder and when it can be removed. Make your first commit `git cherry-pick claude/session-hook-archive`. It adds this brief as `docs/session-start-hook-implementation-prompt.md`.
WHAT THE HOOK PRINTS. At most eight short lines, because every line costs every session context:
1. The sync check. Report the conclusion and age of the latest `sync.yml` run on `main`, and its URL. If that run did not succeed, say so plainly, and say that Step 0 then needs independent primary-source re-verification (point at `CLAUDE.md`, "Scheduled sync"). If the check cannot run (gh missing, offline, not signed in, timed out), print that the sync status is unknown and must be checked before any Step 0. Never print or imply green unless gh said `success`.
2. The live folders. List the worktrees from `git worktree list --porcelain`, each with its path and branch, at most six, then "+N more".
3. Where the session stands: the current branch, and its PR if one exists (number, state, draft or not). "No PR" is a normal answer, not an error.
HOW IT MUST BEHAVE. It reads and never writes: no file writes, no git writes, no network calls except read-only gh. It never blocks or breaks a session: every outside call has its own timeout of about 3 s, the whole hook finishes within about 8 s, it always exits 0, and an error becomes one line of output instead of a crash. macOS has no `timeout` command, so do not rely on one. Write the hook in Node (an `.mjs` file under `.claude/hooks/`) with `child_process` timeouts, unless you show something simpler that meets every point above.
HOW IT IS WIRED. Add a `hooks.SessionStart` entry to `.claude/settings.json` and keep the existing `permissions` block exactly as it is. Read Claude Code's current hooks documentation for the SessionStart event: how its output reaches the model (plain stdout or JSON `additionalContext`), the matcher values (startup, resume, clear, compact), the input JSON on stdin, and the hook-level `timeout` field. Cite the page and the date you read it in the PR body. If you cannot reach the docs, say so and write down what you assumed.
TESTS. Keep the logic pure and test it: a function that turns the raw gh and git results, including failures and timeouts, into the printed lines. Test with fixtures: a success, a failure, an unknown sync status, no PR, a draft PR, zero worktrees, and more than six worktrees. Add one subprocess test that runs the hook with a fake `gh` and `git` first on `PATH` and checks its exit code and output, following the pattern in `tests/publishGate.test.ts`. No test may call GitHub.
DO NOT TOUCH. `README.md`, `CLAUDE.md` and `AGENTS.md`: another Codex PR, `codex/review-tiers`, is editing them now. Put the hook's explanation in a header comment in the hook file and in the PR body. Also leave alone `.claude/skills/`, the sync scripts, the workflows, `src/` and `src/data/`.
CHECKS. `npm run typecheck` and `npm test` on the head, with the real counts. Run the hook by hand from your worktree, giving it the stdin JSON the docs describe, and paste its real output into the PR body. Time the run. Before your final run, fetch `origin/main`. If it has moved, rebase, re-run, and say so.
LANDING. Open the PR as a draft against `main`, with the repo's PR template filled in and "Tier 3: adds files under .claude/" in the body, then stop. Do not mark it ready and do not merge it. Report the PR number, the head SHA, the real test counts, the hook's measured run time, and anything you could not do, above all whether you saw the hook fire inside a real Claude Code session. Pass 1 checks that next.
````

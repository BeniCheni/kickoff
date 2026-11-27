# Kickoff: tests that start git stop inheriting Git's repository variables (build brief, Mon 23 Nov 2026, TZ=America/New_York)

Written by the Track A PM seat (Claude Code, `claude-fable-5-2` at `xhigh`) on Mon 23 Nov 2026 at
about 12:00 PM EST, from `origin/main` at `ffc5cac`. That morning, at about 10:40 AM EST, Beni
ruled that the leak in `tests/vercelIgnore.test.ts` is fixed now, in a small PR on `main` that
Codex builds, before PR 5's build starts. It is ruling 3 of the four recorded in the second
section of [`design-overhaul-planner-handoff.md`](design-overhaul-planner-handoff.md). The
delivery was the fenced block in chat. This copy is the archive.

**Seat: Codex, on `gpt-6.2-sol` at `xhigh`**, the model #328's "When Codex builds" column gives
an M PR.

**This PR is tier 2** under R1 (Beni, Sun 22 Nov 2026): code outside the sensitive paths. Codex
builds, one fresh Claude Code session reads it cold, and Beni's word merges. It stays tier 2 only
while it changes tests and test tooling. `scripts/publish-gate.ts` is on the sync rules' path
list, so the brief fences `scripts/` off.

## What the PM seat measured

The runs used `origin/main`'s tests at `ffc5cac`, with Git 2.54.0 and Node 24.15.0 on macOS. They
ran in the archive worktree, where
`git diff --stat origin/main -- tests scripts web/scripts vite.config.ts package.json` prints
nothing, with vitest from the main checkout's install. The decoy is a fresh repository under the
temp folder.

| Run | Result | The decoy afterwards |
|---|---|---|
| The three files, clean environment | 74 tests, all pass | not used |
| `tests/vercelIgnore.test.ts` under `GIT_DIR` | 17 of 20 fail | `config` gains `[user]`, `[maintenance]` and `[gc]`; commits by `Fixture` on `main`; 296 loose objects |
| `tests/publishGate.test.ts` under `GIT_DIR` | 1 of 7 fails | `config` unchanged; two `snapshot` commits by `t <t@example.com>` |
| `tests/vercelSmoke.test.ts` under `GIT_DIR` | the file does not load | nothing written |
| The whole suite, clean environment | 82 files, 1,058 tests: 1,056 pass, 2 fail | not used |
| The whole suite under `GIT_DIR` | 1,011 tests collected: 990 pass, 21 fail, in 4 files | the same three sections; 1 ref, 7 commits, 306 loose objects |

Two of those failures are this seat's and not the repository's. The worktree has no
`node_modules` of its own, and `tests/web-isolation.test.ts` runs `node_modules/vitest/vitest.mjs`
and `node_modules/typescript/bin/tsc` under the root, so its two tests fail there in a clean
environment as well. The variable alone costs 19 failures (18 in `vercelIgnore`, 1 in
`publishGate`) and the 47 tests of `vercelSmoke`, which are never collected.

The reproduction, for one file:

```sh
D="$TMPDIR/leak-decoy" && rm -rf "$D" && mkdir -p "$D" && git init -q "$D/repo"
cp "$D/repo/.git/config" "$D/config.before"
GIT_DIR="$D/repo/.git" node node_modules/vitest/vitest.mjs run --project node tests/vercelIgnore.test.ts
diff "$D/config.before" "$D/repo/.git/config"
git --git-dir="$D/repo/.git" log --all --format='%h %an <%ae> %s'
```

Other reads, each with its command:

- `git grep -l "node:child_process" origin/main -- tests` lists nine files.
- `git rev-parse --local-env-vars` prints fifteen names on Git 2.54.0.
- In a throwaway repository, a pre-commit hook that prints `env | grep '^GIT_'` saw, in a linked
  worktree, `GIT_DIR` (the worktree's own git directory), an absolute `GIT_INDEX_FILE` and
  `GIT_PREFIX`. In the main checkout it saw no `GIT_DIR` and `GIT_INDEX_FILE=.git/index`.
  `git rebase -x` in the linked worktree exported `GIT_DIR` too.
- `env | grep '^GIT_'` in this session shows that Claude Code's sandbox sets `GIT_CONFIG_COUNT=2`
  (two `safe.directory` entries) and `GIT_CONFIG_PARAMETERS` on every command.
  `env -u GIT_CONFIG_COUNT -u GIT_CONFIG_PARAMETERS git rev-parse --short HEAD` still answered.
- The incident's record is line 962 of `docs/design-overhaul-pr3-review-prompt.md` and the repair
  note that `ac120be` added to that file.

Not checked by this seat: Linux, where CI runs, and what `git clone` does with an inherited
`GIT_DIR` (line 84 of the test).

## The brief

````text
FIRST: before anything else, read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/track-a-archive-8:docs/test-git-env-implementation-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so in your first message. The branch is local and not pushed, so you need a worktree of that repository, not a fresh clone.

You are the builder for one small Kickoff PR on `main`. Seat: Codex, `gpt-6.2-sol`, `xhigh`. Commit as `Codex <noreply@openai.com>` with a per-commit `git -c`, never `git config`. Claude wrote this brief and gives the PR its one cold read, so Claude builds none of it. Read `AGENTS.md` and `CLAUDE.md` first; they bind you.

WHY. Three test files start `git` with the environment they inherited. When that environment names another repository, the commands act on that repository and not on the throwaway one the test made. Git sets such variables for the programs it starts. In a throwaway repository on Git 2.54.0, a pre-commit hook in a linked worktree saw `GIT_DIR` (the worktree's own git directory), an absolute `GIT_INDEX_FILE` and `GIT_PREFIX`, and `git rebase -x` exported `GIT_DIR` as well. The repository's record says it has bitten once: on Sat 21 Nov 2026 a test run under an inherited `GIT_DIR` wrote `core.bare`, a fixture identity and two maintenance keys into the config of Beni's checkout (`docs/design-overhaul-pr3-review-prompt.md`, line 962), and the PM seat repaired the file by hand that night (`git show ac120be`). Every review brief since tells its reader to run `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_COMMON_DIR -u GIT_OBJECT_DIRECTORY npm test`. On Mon 23 Nov 2026 Beni ruled that the leak is fixed now, in a small PR on `main` that Codex builds, before the overhaul's next build starts. This is that PR. When it merges, later briefs drop the workaround.

ROUTING. This PR is tier 2 under Beni's ruling R1 of Sun 22 Nov 2026: code outside the sensitive paths. You build it, one fresh Claude Code session reads it cold, and Beni's word merges it. Codex builds by his ruling R4 of the same day. Neither ruling is in the repository's tables yet, so where `README.md`'s seats table reads differently, the rulings are newer. The PR stays tier 2 only while it changes tests and test tooling, which is why FENCES below is strict.

WHERE GIT STARTS, on `origin/main` at `ffc5cac`. Check each line before you rely on it. `git grep -l "node:child_process" origin/main -- tests` lists nine files, and three of them reach real `git`:
- `tests/vercelIgnore.test.ts`. Line 17 is the helper, `execFileSync('git', args, { cwd: root, … })`, with no `env`. Through it `history()` runs `git init` (line 18) and four `git config` writes (`user.name` and `user.email` on line 19, `maintenance.auto` and `gc.auto` on line 28), then `add`, `commit`, `rev-parse` and `rev-list`. Lines 37 to 40 start `scripts/vercel-ignore.mjs` inside the copied `web/` with `env: { ...process.env, … }`, and that script's lines 14 and 15 run `git cat-file` and `git diff`. Lines 84 and 85 run `git clone` and `git cat-file`, again with no `env`.
- `tests/publishGate.test.ts`. Lines 44 to 48 are a second helper with no `env`. It runs `init`, `add` and `commit`, and it passes its identity with `-c`, so it writes no config. The tests then call `committedLastSyncAt(root)` in their own process (lines 63, 64, 69, 74 and 75), and line 22 of `scripts/publish-gate.ts` runs `git show` with whatever environment that process has.
- `tests/vercelSmoke.test.ts`. Its calls mean the real repository. Line 11 runs `git rev-parse HEAD` as the file loads, and line 234 runs `git show`. `digestAt` runs `git show` in the test's process (`scripts/vercel-smoke.mjs`, line 40), and line 273 starts that script with `env: { ...process.env, … }`.
I found no real `git` behind the other six. `tests/sessionStartHook.test.ts` puts a fake `git` first on `PATH` (lines 158 to 165, and 177). `tests/syncPublication.test.ts` runs `scripts/finish-sync.sh`, `scripts/ensure-pages.sh` and three steps cut from `sync.yml` behind a fake `gh`; the steps of `sync.yml` that call `git` are only read as text, never run. `tests/sync.test.ts`, `tests/syncPrBody.test.ts`, `tests/web-isolation.test.ts` and `tests/momentsBrowserCheck.test.ts` start scripts in which I found no `git` call. Confirm that yourself, and say so if you find one.

WHAT I MEASURED, on those tests, with Git 2.54.0 and Node 24.15.0 on macOS. The decoy is a fresh repository under the temp folder, `git init -q "$D/repo"`, and each run is `GIT_DIR="$D/repo/.git" npx vitest run …`.
- In a clean environment the three files pass: 74 tests.
- `tests/vercelIgnore.test.ts` alone under the decoy: 17 of 20 tests fail, most on `git commit -m base`. The decoy's `config` gains `[user]` with `name = Fixture` and `email = fixture@example.invalid`, `[maintenance]` with `auto = false`, and `[gc]` with `auto = 0`. Its `main` gains commits by `Fixture` titled "base" and "fabricated history", and it holds 296 loose objects.
- `tests/publishGate.test.ts` alone: 1 of 7 fails. "publishes when there is no committed snapshot to read" is handed the decoy's snapshot. The config is untouched, and two "snapshot" commits by `t <t@example.com>` land on the decoy's `main`.
- `tests/vercelSmoke.test.ts` alone: the file does not load, because `git rev-parse HEAD` on line 11 fails in a decoy that has no commit. Nothing is written.
- The whole suite under the decoy: 21 tests fail in four files and 47 are never collected, against 1,058 tests in a clean environment. The decoy ends with the same three config sections, one ref, seven commits and 306 loose objects.
So the leak is wider than the config: commits and objects land in the other repository too. Two of those 21 failures are mine and not the variable's. I ran from a worktree with no `node_modules` of its own, and `tests/web-isolation.test.ts` fails there in a clean environment as well. Your counts, after `npm ci`, are the ones of record.

WHAT TO BUILD. One outcome: every `git` the root suite starts runs without Git's repository variables, whether a test starts it directly, a script the test runs starts it, or a function the test calls starts it. With the fix in, the suite gives the same result with `GIT_DIR` set as without it, and nothing outside the throwaway folders is written. How you get there is yours to choose and to defend in the PR body. What I can tell you:
- Git names the set itself. `git rev-parse --local-env-vars` printed fifteen names here: `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_CONFIG`, `GIT_CONFIG_PARAMETERS`, `GIT_CONFIG_COUNT`, `GIT_OBJECT_DIRECTORY`, `GIT_DIR`, `GIT_WORK_TREE`, `GIT_IMPLICIT_WORK_TREE`, `GIT_GRAFT_FILE`, `GIT_INDEX_FILE`, `GIT_NO_REPLACE_OBJECTS`, `GIT_REPLACE_REF_BASE`, `GIT_PREFIX`, `GIT_SHALLOW_FILE` and `GIT_COMMON_DIR`. The workaround's five are among them. Remove that set, either by asking Git for it or from a pinned list that a test compares with Git's answer, and say which you chose. CI's Git may print a different list.
- Do not sweep by pattern. A sweep of every name that contains `GIT_` would take `VERCEL_GIT_COMMIT_REF`, `VERCEL_GIT_PREVIOUS_SHA` and `VERCEL_GIT_COMMIT_SHA`, which `tests/vercelIgnore.test.ts` sets on purpose. A sweep of every name that starts with `GIT_` would take `GIT_SSH_COMMAND` and `GIT_EDITOR`, which are not repository variables.
- Two of the fifteen arrive in ordinary agent runs. Claude Code's sandbox sets `GIT_CONFIG_COUNT` (two `safe.directory` entries) and `GIT_CONFIG_PARAMETERS` on every command, and `git -c … commit` hands its `-c` pairs to a hook in `GIT_CONFIG_PARAMETERS`. With both removed, `git rev-parse HEAD` in this repository still answered here. Say what you do with those two for the calls that mean the real repository.
- Some calls cannot be fixed where they are made. `committedLastSyncAt`, `digestAt` and the two scripts the tests start all read the environment of the process that runs them, and FENCES keeps you out of `scripts/` and `web/`. So the test side has to hand them a clean environment: through `env` for a child script, and in the test process itself for a function called in-process. A setup file for the `node` project would do the second for every file at once. Adding that one `setupFiles` entry to the `node` project in `vite.config.ts` is allowed, and nothing else in that file is.
- Keep `maintenance.auto=false` and `gc.auto=0` in the fabricated repository, with the comment above them (lines 20 to 27). They fix a different failure, found in PR #320's review.
- No existing assertion is weakened, removed or skipped. I expect you to touch none. If you touch one, list it in the PR body with its reason.

THE TEST THAT PROVES IT. Add a test in the `node` project that would have caught the leak.
- It makes a decoy repository under the OS temp folder and records the bytes of the decoy's `config`.
- It points `GIT_DIR` at the decoy in the environment the code under test sees. A second case also sets the workaround's other four variables into the decoy: `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_COMMON_DIR` and `GIT_OBJECT_DIRECTORY`.
- It then runs the real fixture code, not a copy of it: `history()` with one `commit()` and one `run()`, and `repoWithSnapshot()` with `committedLastSyncAt()`. Both builders are private to their files today (`tests/vercelIgnore.test.ts` line 11, `tests/publishGate.test.ts` line 42). You may move them to a shared module under `tests/` so the new test can call them.
- It asserts that the decoy's `config` is byte for byte what it was, and that the decoy has no ref and no object.
- It also asserts that the work really happened elsewhere: the throwaway repository has its commits, and `run()` and `committedLastSyncAt()` return what they return in a clean environment. A test that passes because nothing ran proves nothing.
- It restores every variable it set, whether it passes or fails, and it never points `GIT_DIR` at anything outside the temp folder.
Then show that it bites. Run the new test against today's behaviour, for instance with your change to the helpers reverted in your worktree, and put the failing output in the PR body beside the passing output. The cold reader will repeat that.

BY HAND, FOR THE PR BODY. Run this once on `origin/main` before your change and once on your head: `D="$(mktemp -d)" && git init -q "$D/repo" && cp "$D/repo/.git/config" "$D/config.before" && GIT_DIR="$D/repo/.git" npm test; diff "$D/config.before" "$D/repo/.git/config"; git --git-dir="$D/repo/.git" for-each-ref; git --git-dir="$D/repo/.git" count-objects`. On your head the same tests pass as in a plain `npm test`, `diff` and `for-each-ref` print nothing, and `count-objects` prints `0 objects, 0 kilobytes`. Then run it once more on your head with the workaround's five variables all set into the decoy. Paste the outputs.

FENCES. Change files under `tests/` only, plus the one `setupFiles` entry in `vite.config.ts` if you use one. Do not change `scripts/`, `web/`, `studio/`, `src/`, `src/data/`, `.github/`, `.claude/`, `package.json`, any lockfile, `CLAUDE.md`, `AGENTS.md`, `README.md` or `CHANGELOG.md`. `scripts/publish-gate.ts` is on the sync rules' path list (`.claude/rules/sync.md`), so a change there would make this a tier 3 PR. If the outcome cannot be reached inside these fences, stop and say what blocks it; do not widen the diff. Never run `npm run sync`. Do not add this brief to your PR: the PM seat's docs PR carries the archive. Do not edit the workaround lines in the archived briefs under `docs/`; they are records. Propose one `[Unreleased]` line for `CHANGELOG.md` in the PR body and leave the file alone.

NOT IN THIS PR. Isolating the fabricated repositories from a developer's own global Git config is a different job. `tests/publishGate.test.ts` passes `commit.gpgsign=false` and `tests/vercelIgnore.test.ts` does not. If you think that deserves an issue, say so in the PR body and stop there. The same goes for `web/` and `studio/`, where I read nothing beyond a grep: `studio/secrets/scan.ts` line 34 runs `git ls-files`.

WHERE. Work in a worktree of `/Users/benicheni/code/kickoff` (`git -C /Users/benicheni/code/kickoff worktree add`), cut from `origin/main` after `git fetch origin`, on a branch named `codex/test-git-env`. Do not work in Beni's main checkout. In your first message, name the folder and say when it can be removed. Until your fix is in place, run the suite with the workaround, `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE -u GIT_COMMON_DIR -u GIT_OBJECT_DIRECTORY npm test`, and never from inside a hook, a rebase or a bisect. The only runs with `GIT_DIR` set are the deliberate ones above, and they point at a decoy under the temp folder.

CHECKS. `npm ci`, `npm run typecheck` and `npm test` on your head, with the real counts for both vitest projects. Then the other root steps of the `verify` job in `.github/workflows/ci.yml`, in its order: `npm run build`, `npm run build:offline` and the offline bundle scan. The job's `web/` and `studio/` steps run in CI on the draft PR, on Ubuntu, where I measured nothing; report what `verify` says there. Before your final run, fetch `origin/main`. The sync bot commits to it several times a day. If it has moved, rebase, re-run and say so.

LANDING. Open the PR as a draft against `main`, with `.github/PULL_REQUEST_TEMPLATE.md` filled in and "Tier 2: tests and test tooling only" in the body, then stop. Do not mark it ready, and do not merge it. Report the PR number, the head SHA, the files you changed, the real test counts with and without `GIT_DIR`, the before and after outputs of the by-hand run, which variables you remove and where the list comes from, what you did about the two config variables, and anything you could not do or did not check.
````

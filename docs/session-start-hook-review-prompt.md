# PR #364 — Pass 1 of the 360 for the SessionStart hook: the cold-review brief (archived Sun 22 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) on Sun 22 Nov 2026, after Codex opened draft #364
from `docs/session-start-hook-implementation-prompt.md` (item B1 of the tune-up). This is Pass 0 of
the 360 cycle in `/kickoff-pr-review`.

The PR is **tier 3** under Beni's R1 of 22 Nov, because it adds files under `.claude/` and edits
`CHANGELOG.md`. Codex built it, so the review takes the "When Codex builds" column of #328's
two-vendor amendment:
- Passes 0 and 1.5: the PM seat.
- Pass 1: a fresh Claude Code session on `claude-fable-5-2` at `xhigh`, report-only. Beni
  starts it himself, because `start_session` cannot start a session above the PM seat's model.
- Pass 2 and every fix round: Codex on `gpt-6.2-sol` at `xhigh`, the builder.
- Pass 2.5: a fresh Claude Code session on `claude-opus-5-5` at `xhigh`, writing nothing.
- Pass 3: Beni, whose word merges.

What the PM seat found at head `6d16d3b`:
- Two commits: `0827248` (Claude, the cherry-picked brief) and `6d16d3b` (Codex, the hook).
- Six files: `.claude/hooks/session-start.mjs` (+157), `.claude/hooks/session-start.d.mts`
  (+11), `.claude/settings.json` (+14), `CHANGELOG.md` (+4), the brief (+43) and
  `tests/sessionStartHook.test.ts` (+134).
- `verify`, Vercel and `vercel-smoke` green; mergeable; still a draft.

It read the PR body, the hook, the `.d.mts` file, and the settings and `CHANGELOG.md` diffs. It did
not read the test file, and it ran no test, no hook and no session.

Codex told Beni that its builder worktree, `/Users/benicheni/code/kickoff-session-start-hook`, can
go. Keep it until #364 merges, for two reasons:
- Pass 2 and the fix rounds are Codex's.
- Pass 1 runs the hook there to see the PR line, because its own detached worktree has no branch.

Delivered in chat in a four-backtick fenced block, one line per paragraph. Beni runs the two
commands below first. Claude Code may ask him to trust the new folder, and the hook runs only once
it is trusted. This copy is the archive.

```bash
git -C /Users/benicheni/code/kickoff fetch origin && git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr364-review 6d16d3b
```

```bash
cd /Users/benicheni/code/kickoff-pr364-review && claude --model claude-fable-5-2 --effort xhigh
```

---

````text
/kickoff-pr-review 364 --no-merge
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/session-hook-review-archive:docs/session-start-hook-review-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so. If the command above did not load the skill, read `.claude/skills/kickoff-pr-review/SKILL.md`, `pr-comment.md` and `browser-matrix.md` and follow them as written.
Kickoff PR #364 (B1, the SessionStart hook): Pass 1, cold review
You are Pass 1 of the 360 cycle for PR #364 in github.com/BeniCheni/kickoff, branch `codex/session-start-hook` into `main`. You are a fresh Claude Code session that built none of this, started by Beni in `/Users/benicheni/code/kickoff-pr364-review`, a detached worktree at the PR's head `6d16d3b`. Run `/kickoff-pr-review` on #364 with `--no-merge`. The skill outranks this brief on process, except where FIX SCOPE below says otherwise; this brief adds the PR's particulars. Run on `claude-fable-5-2` with `--effort xhigh`, and name the model and effort that actually ran at the top of your comment. Read `CLAUDE.md` and `AGENTS.md` first. The PM seat (Claude Code, Opus 5.5) wrote this on Sun 22 Nov 2026 from #364 at `6d16d3b`, with `verify`, Vercel and `vercel-smoke` green and no review yet. It read the PR body, `.claude/hooks/session-start.mjs`, `.claude/hooks/session-start.d.mts`, and the `.claude/settings.json` and `CHANGELOG.md` diffs. It did not read `tests/sessionStartHook.test.ts`, and it ran no test, hook or session. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment.
WHO BUILT IT, AND THE ROUTING. Codex built #364 on `gpt-6.2-sol` at xhigh, from the brief that is its first commit: `0827248`, cherry-picked from the local branch `claude/session-hook-archive`. Under Beni's R1 ruling of Sun 22 Nov 2026, the PR is tier 3 because it adds files under `.claude/`, so it gets the full 360. That ruling is not in the README yet; the open `codex/review-tiers` PR writes it. The review follows the "When Codex builds" column of #328's two-vendor amendment, approved by Beni and not yet on `main`. Read it with `git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md`, under "Amended Tue 17 Nov 2026". Pass 1 is yours, and it is report-only. Pass 2 and every fix round are Codex's. Pass 2.5 is a fresh Claude Code session on `claude-opus-5-5` that writes nothing, and Beni's word merges. Built beside this PR is #365 (B5, the headless PM chores, built by Claude, tier 2). Do not review it. Its `scripts/pm/model.ts` starts `claude -p` with `--setting-sources ""`, and its builder says that keeps this hook out of that child. You may confirm that under item 6, as a fact about where this hook runs, not as a review of #365.
THE PASS'S FIRST JOB: SEE IT FIRE. The builder ran the hook only by hand, and the brief makes this check Pass 1's job. Your own session is a real one: you started in a worktree whose `.claude/settings.json` carries the hook. (a) Quote, word for word, the SessionStart context you received at startup, and say where you saw it: in your context, or in this session's transcript file under `~/.claude/projects/`. If you received none, that is a high finding. Find out why (folder trust, the settings, the hook's command form) before anything else. (b) Drive whatever other sources you can (resume, clear, compact) from headless runs in this worktree, with `claude -p` and the flags `claude --help` lists on this Mac. Make at most four nested `claude` runs, because each one uses Beni's Claude Max usage. Say which sources you saw fire and which you could not drive. (c) Run the hook by hand with `cwd` set to `/Users/benicheni/code/kickoff-session-start-hook`, the builder's worktree on `codex/session-start-hook`, to see the PR line. Only read in that folder.
WHAT TO CHECK. Reproduce each item before you report it, and say how.
1. The house is green. Run `npm ci` first, because a sibling worktree does not share the main checkout's `node_modules`. Then run `npm run typecheck` and `npm test` at the head with the real counts, and check `verify` at the tip.
2. The wiring matches today's docs. Read Claude Code's hooks documentation for SessionStart and for the command hook fields, and cite the page and the date you read it. Check four things against it. Does a command hook accept an `args` array and expand `${CLAUDE_PROJECT_DIR}` inside it, as `.claude/settings.json` assumes? Does an omitted matcher mean every source? How does plain stdout reach the model? What happens when the hook-level `timeout` fires? Also check that the `permissions` block is unchanged byte for byte.
3. It never claims a green it did not see. Read `syncLine` against the Step 0 contract in `.claude/rules/sync.md`. Check each case: success only when `gh` says the run completed with `success`; a queued or in-progress run; a failed or cancelled run; `gh` missing, signed out, offline or timed out; a run URL from another repository. Say whether the in-progress line is what the Step 0 contract asks for.
4. It never breaks a session. Check that it always exits 0, that each outside call stops near 3 s, and that the whole hook finishes inside the 8 s handler timeout. Try it with stdin that never closes, with malformed JSON, and with a relative or missing `cwd`. Time a stalled run yourself.
5. It reads and never writes. Look for file writes, git writes (`GIT_OPTIONAL_LOCKS` is set), and any `gh` call that is not read-only. Say whether any command can prompt or write config, for example through `gh`'s update notifier, an extension, or an auth refresh.
6. Where else it runs. The hook fires in every Claude Code session that loads this repo's project settings: a headless `claude -p` here, the planned Claude Code Action (B4), and any child that loads project settings. Say what it costs there in time, context and `gh` calls, and whether any caller in the repo today runs `claude` without `--setting-sources ""`. Codex does not read `.claude/settings.json`; confirm that.
7. The tests test it. `tests/sessionStartHook.test.ts` should cover the seven cases the brief names: success, failure, unknown, no PR, draft PR, zero worktrees and more than six. It should also have a subprocess test that runs the configured hook with a fake `gh` and `git` first on `PATH`, and no test may call GitHub. Say which cases have a real assertion and which are covered only by a test's name.
8. The CHANGELOG entry. The PR adds an `[Unreleased]` "Added" line. Read `.claude/rules/releases.md` on what `[Unreleased]` is for. #365, built beside this PR, left `CHANGELOG.md` alone because nothing a reader of the app sees changed. Say which reading the rule supports, so the two PRs can agree.
ONE JUDGEMENT CALL, YOURS TO MAKE AND EXPLAIN. The live-folder rule asks every round that uses a worktree to name its live folders. This Mac has about three dozen worktrees, most of them detached or prunable. The builder's run in the PR body shows six of them and then "+30 more". Say whether that serves the rule. If it does not, describe the smallest ordering or filter that would, as a finding for Codex. Do not build it.
FIX SCOPE. None. This pass is report-only, and on this point it overrides the skill, which would push fixes. Push no commit, and edit no file in the PR or its body. #328 gives every fix round to the builder, and a commit of yours would move the branch under Pass 2. Write each fix as a finding: the file and line, the command that shows it, what you expected and what you observed, and the smallest change you would make. Keep anything you write to probe with, such as a fake `gh` or a stdin file, in `$TMPDIR`, outside the repo.
THE COMMENT. Leave one PR comment on #364 in `pr-comment.md`'s shape. At the top, give the model and effort that actually ran and the head you read. Include:
- the hook output you saw, verbatim;
- which sources fired and which you could not drive;
- your timings;
- a "Not verified" list;
- how many nested `claude` runs you made.
Then stop and reply in this chat with the comment's link and the verdict. Do not mark the PR ready, and do not merge it.
SEALED APPENDIX: the builder's claims, from the PR body and Codex's report to Beni. These are claims, not conclusions. Verify each one independently, and report any that does not hold.
- The archive cherry-pick `0827248` passed 81 files and 1,031 tests. The head `6d16d3b` passed 82 files and 1,043 tests.
- `origin/main` was still at `0662e96` at the final fetch.
- A direct run with the documented SessionStart JSON (`source: startup`, the worktree as `cwd`) exited 0 in 0.77 s real time.
- With stalled fake commands, it exited 0 in 5.83 s and reported the unavailable lookups as unknown.
- Plain stdout reaches Claude's context, and with the matcher omitted the hook runs for startup, resume, clear, compact and fork. The builder read this on 22 Nov 2026 at code.claude.com/docs/en/hooks.
- Each child command is capped at 3 s, the handler timeout is 8 s, and the independent lookups run in parallel.
- Data-honesty assertions and generated snapshots match the base, and so does the `permissions` block.
- The hook uses only Node built-ins, Git and the GitHub CLI.
- In a 390 px headless Chrome smoke, `scrollWidth === innerWidth === 390`, and the Fixtures Previous button was visible.
- The builder did not see the hook fire inside a Claude Code session.
````

## Pass 1.5: the rebuttal brief for Codex's Pass 2 (written Sun 22 Nov 2026)

Pass 1 posted at 4:03 PM EST ([comment](https://github.com/BeniCheni/kickoff/pull/364#issuecomment-7085753815)).
It ran on `claude-fable-5-2` at `xhigh` and reviewed `6d16d3b`. Its verdict was **mergeable after
fixes**: nine findings, five medium and four low, none high.

- **The hook fired on all five sources.** Startup fired in Pass 1's own session (548 ms, exit 0).
  Compact, clear, resume and fork fired in headless runs.
- **The house is green:** 1,043 tests in 82 files.
- **Report-only:** Pass 1 pushed nothing.

The PM seat read the comment in full and #364's state. The head is still `6d16d3b`, still a
draft, with `verify` green and the two Vercel checks pending. `main` is now `a318c7b`, after two
sync commits since the head.

The PM seat's resolutions, named as its own:
- **Row 6 precedence.** The B1 brief's "did not succeed" was the PM seat's wording, and it is
  looser than `CLAUDE.md`'s "a failed run". `CLAUDE.md` owns the rule. If Codex contests it, the
  call goes to Beni.
- **The CHANGELOG question.** #364 keeps its `[Unreleased]` line, with row 9's wording fixed.
  #365 adds none: `CHANGELOG.md` is on its tier 3 do-not-touch list, so adding a line would
  change its tier mid-review. Its line arrives when the next release drafts `[Unreleased]` with
  `scripts/pm/unreleased.ts`, which will list #365.
- **Pass 1's two ideas-list items** are the `.codex/hooks.json` wiring and the green `dry_run`
  dispatch. The PM seat files them in the docs PR that lands this cycle's briefs. Pass 1's
  retro notes for the skill wait for the pending skill audit, because `.claude/skills/` is off
  limits here.

Delivered in chat in a four-backtick fenced block, one line per paragraph. Paste it into the Codex
session that built #364. If that session is gone, start a fresh one with the command below. This
copy is the archive.

```bash
codex -m gpt-6.2-sol -c model_reasoning_effort=xhigh -s workspace-write -a on-request -C /Users/benicheni/code/kickoff-session-start-hook
```

````text
FIRST: read this brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/session-hook-review-archive:docs/session-start-hook-review-prompt.md`, section "Pass 1.5". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so.
Kickoff PR #364 (B1, the SessionStart hook): Pass 2, the builder's rebuttal
You are Pass 2 of the 360 cycle for PR #364 in github.com/BeniCheni/kickoff, branch `codex/session-start-hook` into `main`. You are Codex on `gpt-6.2-sol` at xhigh, the builder, working in your builder worktree `/Users/benicheni/code/kickoff-session-start-hook`. Claude Code's Pass 1 cold review, on `claude-fable-5-2` at xhigh, reviewed `6d16d3b` and posted at 4:03 PM EST on Sun 22 Nov 2026: https://github.com/BeniCheni/kickoff/pull/364#issuecomment-7085753815. Its verdict is "mergeable after fixes", with nine findings: five medium, four low, none high. Pass 1 was report-only, so the branch has not moved. This brief is Pass 1.5, written by the PM seat (Claude Code, Opus 5.5). Your Pass 2 answers every Pass 1 finding and makes the fixes you accept. Your deliverables are fix commits and one PR comment. Stop at the comment. Read `CLAUDE.md` and `AGENTS.md` first. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
FIRST MESSAGE. Name your worktree folder and say when it can be removed: when #364 merges or closes.
READ THE REVIEW. Read Pass 1's comment in full before you change anything: `gh api repos/BeniCheni/kickoff/issues/comments/7085753815 --jq .body`. It is the record. It gives each finding's line numbers, the command that shows it, and the smallest fix Pass 1 would make. Re-run each reproduction yourself at `6d16d3b`, then answer each row with one of three: accept; contest; or accept but contest the characterisation. A contest needs evidence that a reader can re-run. Pass 1's suggested fix is a suggestion, not the spec. Make the smallest change that resolves the finding, and say why if you choose a different fix.
THE ROWS. Summarised here only so you can see them all at once; the comment is the source.
1. Medium: a detached session is told "No PR" without any lookup (lines 92 and 146), and `tests/sessionStartHook.test.ts:63-64` pins that text. An Actions checkout of a PR is detached too, so the planned Claude Code Action (B4) would read the same line.
2. Medium: a detached session's own folder is missing from the list, because the hoist on line 71 matches by branch name.
3. Medium, the judgement call: six worktrees in Git's path order do not serve the live-folder rule. On this Mac they are `main` plus five `~/.codex/worktrees/*` trees from 17 Nov, and every `~/code/kickoff-*` round folder is hidden. Pass 1 suggests the session's own tree first, then newest first by the mtime of each tree's `.git` entry, then prunable last.
4. Medium: the sync line has no "as of" time, and injected context stays for the whole session. Pass 1 suggests the check time in Brooklyn time.
5. Medium: the tests cannot fail five of the hook's guards: a foreign run URL, a cancelled run read as success, the 3 s cap, any `gh` exit 1 read as "No PR", and a future `createdAt`. The code handles all five correctly today, so this is coverage, not behaviour.
6. Low: a run that has not finished gets the failed-run remedy.
7. Low: the hook prints nothing and exits 0 when its own path contains a symlink (line 155). Pass 1 showed this is not reachable by starting Claude Code in a symlinked folder on 2.1.330.
8. Low: a stale success, say 40 days old, prints as plain green.
9. Low: `CHANGELOG.md:13` says sessions "show" the three facts, but the text goes into the model's context, not the interface.
RULINGS AND RESOLUTIONS THAT TRAVEL WITH THIS BRIEF.
- Beni's R1 ruling of Sun 22 Nov 2026 makes this PR tier 3, because it adds files under `.claude/`: the full 360. The order is your Pass 2, then a fresh Claude Code session on `claude-opus-5-5` for Pass 2.5, which writes nothing, then Beni's word. The routing is the "When Codex builds" column of #328's amendment, which Beni approved and which is not yet on `main`.
- Row 6 precedence, the PM seat's resolution. The build brief's "did not succeed" was the PM seat's own wording, and it is looser than `CLAUDE.md`'s "a failed run". `CLAUDE.md` owns the rule, so an unfinished run should not get the failed-run remedy. If you contest that, say so with your reasoning, and the call goes to Beni.
- The CHANGELOG entry, the PM seat's resolution. Pass 1 found that `.claude/rules/releases.md` supports an `[Unreleased]` line for this PR, so keep it and fix its wording under row 9. #365 adds no line, because `CHANGELOG.md` is on that PR's tier 3 do-not-touch list. Nothing for you to do there.
- Pass 1's two ideas-list items, the Codex `.codex/hooks.json` wiring and the green `dry_run` dispatch, are out of scope. The PM seat files them, so do not build them.
FIX SCOPE. Fix only inside this PR's own files: `.claude/hooks/session-start.mjs`, `.claude/hooks/session-start.d.mts`, `tests/sessionStartHook.test.ts`, the `[Unreleased]` line in `CHANGELOG.md`, and `.claude/settings.json` only if a fix truly needs it. Keep the `permissions` block byte for byte. The build brief's DO NOT TOUCH list still holds: `README.md`, `CLAUDE.md` and `AGENTS.md` (the `codex/review-tiers` PR edits them), `.claude/skills/`, the sync scripts, the workflows, `src/` and `src/data/`. The hook must stay read-only, within at most eight lines, with each call capped near 3 s, inside the 8 s handler timeout, and always exiting 0. Any new file read, such as a `statSync` for row 3, must neither write nor start a process the build brief did not allow.
HOW. Commit each fix on top of `6d16d3b`, one row per commit where that comes naturally. Each message says what broke, how it was shown, and how the fix was verified. Commit as `Codex <noreply@openai.com>` with a per-commit `git -c`, never `git config`. Every behavioural fix gets a test, and row 5's new tests must fail against the mutation Pass 1 used. Do not rebase and do not force-push: Pass 2.5 reads your fixes as `6d16d3b..head`. `main` has moved to `a318c7b` through two bot syncs that change only `src/data/` and `docs/sync-digest.md`. Make your last commit a merge of `origin/main`, then run the final checks on that head.
CHECKS. Run `npm run typecheck` and `npm test` on the final head, with the real counts. Run the hook by hand from your worktree, and again with stdin `cwd` set to a detached worktree for rows 1 and 2. `/Users/benicheni/code/kickoff-pr365-review` is one; only read there. Paste both outputs into your comment and time them. Repeat Pass 1's stalled-`gh` and worst-sequential timing. You may make at most two nested `claude` runs to show the new lines reach a session, because each one uses Beni's Claude Max usage. Say how many you made.
THE COMMENT. Leave one PR comment on #364 in the same table shape as Pass 1's. For each of the nine rows give your answer (accept, contest, or accept but contest the characterisation), the fix commit or the evidence for the contest, and how you verified it. Then give the hook's new output, the timings, the real counts, the head SHA, and a "Not verified" list. Do not mark the PR ready, do not merge it, and do not enable auto-merge. Reply in this chat with the comment's link and the head SHA.
````

## Pass 2.5: the synthesis brief (written Sun 22 Nov 2026)

Codex's Pass 2 posted at 9:22 PM EST
([comment](https://github.com/BeniCheni/kickoff/pull/364#issuecomment-7089893257)). It ran on
`gpt-6.2-sol` at `xhigh` and left the PR a draft at `a2ed154`.
- **Answers:** it accepted all nine rows. On row 3 it accepted the fix but contested the
  characterisation.
- **Claimed checks:** 1,058 tests in 82 files, 27 of them hook tests; typecheck and build
  clean; `verify`, Vercel and `vercel-smoke` green.
- **Nested runs:** two, both on Haiku 5.5. The first model said it saw no hook output.

What the PM seat checked at `a2ed154`, at 9:36 PM EST:
- **The range `6d16d3b..a2ed154`** holds eight commits, one row each, all `Codex
  <noreply@openai.com>`, then a merge of `origin/main` at `a318c7b`. The merge's remerge-diff is
  empty, and it brings only `src/data/*.json` and `docs/sync-digest.md`.
- **The rebuttal's own diff** is four files, +183 / −50: the hook, its `.d.mts`, the test file
  and the `CHANGELOG.md` line. `.claude/settings.json` is unchanged since `6d16d3b`.
- **GitHub:** the four checks are green, the PR is mergeable and clean, and it is still a draft.
- **Its other observations** went into the sealed appendix, not here, so Pass 2.5 verifies them
  rather than inherits them.

The PM seat ran no test, no hook and no session at the head. It made the Pass 2.5 worktree,
`/Users/benicheni/code/kickoff-pr364-synthesis`, detached at `a2ed154`, and ran `npm ci` there
(134 packages).

Tier 3 means Beni's word merges, so Pass 2.5 runs with `--no-merge`. It evaluates the merge gate
and escalates. Delivered in chat in a four-backtick fenced block, one line per paragraph. Beni
starts the session with the command below. Claude Code may ask him to trust the new folder, and
the hook runs only once it is trusted. This copy is the archive.

```bash
cd /Users/benicheni/code/kickoff-pr364-synthesis && claude --model claude-opus-5-5 --effort xhigh
```

````text
/kickoff-pr-review 364 --pass 2.5 --no-merge
FIRST: read this brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/session-hook-review-archive:docs/session-start-hook-review-prompt.md`, section "Pass 2.5". A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so. If the command above did not load the skill, read `.claude/skills/kickoff-pr-review/SKILL.md`, `executive-brief.md`, `pr-comment.md` and `browser-matrix.md` and follow them as written.
Kickoff PR #364 (B1, the SessionStart hook): Pass 2.5, synthesis
You are Pass 2.5 of the 360 cycle for PR #364 in github.com/BeniCheni/kickoff, branch `codex/session-start-hook` into `main`. The skill gives this seat to the PM seat. The PM seat (Claude Code, Opus 5.5, the author of every brief in this cycle) hands it to you, a fresh session, so the re-runs start from clean context. You built nothing here and ran neither review pass. Beni started you in `/Users/benicheni/code/kickoff-pr364-synthesis`, a detached worktree at the PR's head `a2ed154`; the PM seat already ran `npm ci` there. Run on `claude-opus-5-5` with `--effort xhigh`, and name the model and effort that actually ran at the top of your comment. The skill outranks this brief on process, except where WRITE SCOPE below says otherwise. Read `CLAUDE.md` and `AGENTS.md` first, and run `TZ=America/New_York date` before you write any date.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverables: no Learn-by-Doing request, no TODO(human), and no insight box in the brief or the PR comment.
FIRST MESSAGE. Name your worktree folder and say when it can go: once your comment is posted and Beni has the brief. A fix round would move the head, and a later sitting would get a fresh folder.
THE RECORD. Pass 1, on `claude-fable-5-2` at xhigh, reviewed `6d16d3b`: `gh api repos/BeniCheni/kickoff/issues/comments/7085753815 --jq .body`. Its verdict was mergeable after fixes, with nine findings: five medium, four low, none high. Pass 2, Codex on `gpt-6.2-sol` at xhigh, answered them at `a2ed154`: `gh api repos/BeniCheni/kickoff/issues/comments/7089893257 --jq .body`. It accepted all nine rows. On row 3 it accepted the fix and contested the characterisation. The Pass 1 and Pass 1.5 briefs are in the archive above, and so are the PM seat's resolutions on row 6 and on the CHANGELOG. Pass 2 is the rebuttal range `6d16d3b..bf080b7`, eight commits, then `a2ed154`, a merge of `origin/main` at `a318c7b`. Read each rebuttal commit on its own, then the head's full diff against `origin/main`.
THE PASS'S FIRST JOB: SEE IT FIRE AT THE HEAD. Pass 2's "Not verified" list starts with delivery to the model at the final head. In its first nested run, the model said it saw no hook output. Your own session is the cheapest proof: it started in a worktree whose `.claude/settings.json` carries the hook at `a2ed154`. Quote, word for word, the SessionStart context you received at startup, and say where you saw it: in your context, or in this session's transcript under `~/.claude/projects/`. If you received none, find out why before anything else: folder trust, the settings, or the command. Treat it as a blocker in the brief. You may make at most one nested `claude` run, and only if your own startup gave you nothing, because each run uses Beni's Claude Max usage. Say how many you made. The other four sources (resume, clear, compact, fork) depend on wiring Pass 1 observed at `6d16d3b`. Check that `.claude/settings.json` is unchanged since then and record them as observed at the baseline, not at the head.
RE-RUN, DON'T READ. Every figure in your brief comes from a command you ran:
1. The house: `npm run typecheck`, `npm test` with the real counts, and the builds the skill names, all at the head. Also `verify` at the tip.
2. Every row, red then green. For each of the nine rows, show the old behaviour at `6d16d3b` and the new behaviour at `a2ed154`, checked against the code and not against Pass 2's table. Take base files with `git show 6d16d3b:<path>` into `$TMPDIR`. Do not move this worktree's HEAD.
3. Row 5's five mutations. Re-apply each one, and confirm that each now fails a test you can name. Mutate a copy, never the worktree, for example `git archive HEAD | tar -x -C "$TMPDIR/mut"` with `node_modules` linked in.
4. The two timings. Repeat the stalled `gh` and the worst sequential path. Pass 2 reports 3.13 s and 6.47 s against the 8 s handler timeout.
5. The browser. The diff touches no `src/` or `index.css`, so `CLAUDE.md` asks for a smoke pass, not the matrix. Set the viewport before any capture.
Anything you could not re-run goes on your "Not verified" list, never in the verified column.
THE ONE OPEN CHARACTERISATION. Row 3 is the only row whose characterisation is still contested between the two vendors. Settle it with evidence. Say what a `.git` timestamp measures for a linked worktree and for the main checkout, and whether the new ordering serves the live-folder rule in `~/.claude/CLAUDE.md`. Then say whether that leaves anything "still contested" in the sense of the merge gate.
THE GATE, AND WHERE YOU STOP. Report every clause of the skill's Pass 2.5 merge gate, each as holding or failing, with its evidence. Name the `CHANGELOG.md` reading you used: the PR adds an `### Added` line under `[Unreleased]` and bumps no version. Whatever the gate says, do not merge, because the PR is tier 3 under Beni's R1 ruling of Sun 22 Nov 2026 and Beni's word merges it. That ruling is not on `main` yet; the open `codex/review-tiers` PR writes it. End the Executive Summary Brief with the §7 step 8 handoff block. Include the squash subject and body with both `Co-authored-by:` trailers, ready to paste. Finish with the questions for Beni, each answerable in one word. The first is whether to merge #364.
WRITE SCOPE. This pass writes no code. Push no commit, edit no file in the worktree or in the PR body, do not mark the PR ready, and do not merge or enable auto-merge. Keep every probe, fake `gh` or copy in `$TMPDIR`. End with `git status --short` empty, and paste that. You may write two things: the Executive Summary Brief, in `executive-brief.md`'s shape, delivered in this chat; and one short PR comment on #364 that records the corroboration and the escalation. The skill puts Pass 2.5's retro into `SKILL.md` for a tooling PR, but `.claude/skills/` is off limits in this cycle. Put your retro notes in the brief's last section, and the PM seat carries them to the pending skill audit. A learning that applies beyond this PR may go into a vault note or memory; say which you wrote.
THE REPLY. When the comment is posted, reply in this chat with the brief, the comment's link, the head you verified, and the verdict.
SEALED APPENDIX: the PM seat's own observations at `a2ed154`, made at 9:36 PM EST on Sun 22 Nov 2026. These are claims, not conclusions. Verify each one independently, and report any that does not hold.
- The range `6d16d3b..a2ed154` holds eight one-row commits by `Codex <noreply@openai.com>` with no co-author trailer, then the merge `a2ed154`. Its remerge-diff is empty, and it brings only `src/data/*.json` and `docs/sync-digest.md` from `main`. `.claude/settings.json` is byte-identical to `6d16d3b`. The rebuttal touches four files: the hook, the `.d.mts`, the tests and `CHANGELOG.md`.
- The 10-hour stale threshold fits the schedule. `sync.yml`'s two crons, `23 1,7,13,19 * * *` and `23 11,12,14-18,20-23 * * *`, leave a longest scheduled gap of six hours, 01:23 to 07:23 UTC. `.claude/rules/sync.md` says runs have arrived up to about four hours late and that some slots never appear. So a skipped overnight slot can make a healthy sync read as stale.
- For a linked worktree, `.git` is a file written at creation, and its mtime stays at its birth time. `stat` showed birth equal to mtime for `kickoff-session-start-hook` and `kickoff-pr364-review`. For the main checkout, `.git` is a directory whose mtime moves with most Git commands; it was born 18 Oct and changed today. So "newest first" ranks linked folders by when they were created, and it keeps `main` near the top.
- The hook canonicalises the session `cwd` with `realpathSync`, but compares it with the worktree paths Git prints, which it does not canonicalise. Whether that matters depends on whether any worktree can be registered under a symlinked spelling, such as `/tmp` against `/private/tmp` on macOS.
- `git worktree list` shows 20 worktrees on this Mac, so the hook shows six and then "+14 more".
- The PM seat ran no test, no hook and no session at the head. Its only writes were this worktree and its `npm ci`.
````

# PR #387 — Pass 0 of the 360 for the second edition's refresh: the handoff to Codex (archived Wed 25 Nov 2026, TZ=America/New_York)

Written by the Overall Planner seat (Claude Code, Opus 5.5) at about 1:00 PM EST on Wed 25 Nov
2026. This seat also built #387, under Beni's "Yes, refresh first", so it does not write the
Pass 1 opener. The README's seats table, "When Claude builds" column, gives Passes 0 and 1.5 to
Codex on GPT-6.2 Astra. This file hands Pass 0 over, and adds no findings.

Beni's rulings so far, all on Wed 25 Nov 2026:
- "Yes, refresh first": merge `main` into `overhaul/second-edition` before PR 6 is briefed.
- "Yes, push": push the merge and open the PR. Draft #387 opened soon after noon EST, after a
  GitHub Pull Requests incident had failed three tries.
- "Keep Tier 3" at 12:51 PM EST. He declined to lower the tier.

State at 12:51 PM EST:
- Head `39d67bbf2223509d1f45b268fca9a5053691a516`, author Claude. Parents are `bf7b82b` (the
  branch after #377) and `bafb1f1` (main).
- `verify`, `tier`, Vercel, Vercel Preview Comments and `vercel-smoke` are SUCCESS. The label is
  `tier-3`, and the PR is MERGEABLE and still a draft.
- Commands: `gh pr view 387 --repo BeniCheni/kickoff --json labels,statusCheckRollup,mergeable`
  and `git log -1 --format='%H %P' 39d67bb`.

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive.

## The handoff, as delivered

````text
You are the Pass 0 seat for Kickoff PR #387 (the 360 cycle's cold-review brief), running as a fresh Codex session on GPT-6.2 Astra at high effort. If you are not that seat, or you built or reviewed any part of #387, stop and say so.

Start by reading the archived copy of this handoff, which wins over anything pasted: `git --git-dir=/Users/benicheni/code/kickoff/.git show claude/second-edition-refresh-review-archive:docs/second-edition-refresh-pass-0-prompt.md`. That branch is local only, and the ref is shared by every worktree on this Mac.

Make your own detached worktree, and list it with a KEEP note and an end date in your first message: `git --git-dir=/Users/benicheni/code/kickoff/.git worktree add --detach /Users/benicheni/code/kickoff-pr387-pass0 39d67bbf2223509d1f45b268fca9a5053691a516`. Never work in Beni's checkout at /Users/benicheni/code/kickoff, which holds his untracked files, or in another session's worktree. Put receipts under /Users/benicheni/code/kickoff-receipts/pr387/. Run `TZ=America/New_York date` before you write any date.

What #387 is: draft PR https://github.com/BeniCheni/kickoff/pull/387 merges main at `bafb1f1` into `overhaul/second-edition` at `bf7b82b`. Claude Code (Opus 5.5) built it, and it holds Pass 2 and the fix rounds. The PR body says what the builder claims: eight conflicts, how each was resolved, and the gates it ran. Those are claims to check, not facts.

Beni's rulings, his own words, all on Wed 25 Nov 2026: "Yes, refresh first" (merge main into the branch before PR 6 is briefed); "Yes, push"; and "Keep Tier 3" at 12:51 PM EST, when he declined to lower the tier.

Routing: the README's seats table ("How it gets built", the "When Claude builds" column) owns this. Passes 0 and 1.5 go to Codex on GPT-6.2 Astra. Pass 1 is a fresh Codex session on GPT-6.2 Astra, report-only. Pass 2 is the builder. Pass 2.5 is a fresh Codex session on GPT-6.2 Sol, read-only. Pass 3 is Beni. `.claude/skills/kickoff-pr-review/SKILL.md` holds the method (`.agents/skills/kickoff-pr-review/SKILL.md` points Codex at it), but its seat and model names predate Beni's 22 Nov rulings. Where it differs from the README table or the "Review tiers" section of `AGENTS.md`, those win. Say so in the opener.

Your job: read #387 and the repo fresh, then write the Pass 1 opener. It goes to a fresh Codex session on GPT-6.2 Astra (you name the effort), which runs the skill's Pass 1 report-only, with no merge. Pass 1 commits nothing to the PR branch; it leaves one PR comment in the skill's `pr-comment.md` shape and stops there. The opener's first line names its seat ("You are… if not, stop"). Its second line points at `git show` of the opener's own archived copy. Below that come the tailored context, then a sealed appendix headed "verify independently", which holds leads and never conclusions.

Two landing facts the opener must carry, each with its command. First, earlier refreshes of this branch landed as merge commits, not squashes (`git log --merges --format='%h %s' origin/overhaul/second-edition -8` shows #334 and #336), while the skill's Pass 2.5 gate speaks of a squash. Second, #387 changes `src/data/*.json`, which the skill's gate counts as an escalation, so Beni gives the word on this merge whatever the passes find.

Archive the opener as `docs/second-edition-refresh-review-prompt.md`, with a row in `docs/README.md`, committed as Codex (`git -c user.name=Codex -c user.email=noreply@openai.com commit`) on a local branch `codex/second-edition-refresh-review-archive` cut from `origin/main`. Leave this handoff's branch alone. Deliver the opener in chat as one fenced block, one line per paragraph, with a four-backtick outer fence if it holds fences of its own. Then stop and wait; don't ask whether Beni will paste it.

Limits: no push, no PR, no comment, review, label change, merge or approval on GitHub. No writes to the PR branch. Never `npm run sync`, and leave `sync/scheduled` alone. Nothing from Sportsbooks, money matters, keel's user data folder or the yith vault goes into this public repo. You may run the gates and commands you need, and every figure you write carries the command that reproduces it, run in your session.

Sealed appendix, verify independently: leads the builder's seat could not settle about its own work. These are not findings, and whether each holds is for you to decide.
L1. The builder ran no browser matrix and called the snapshot the only `src/` change. `CLAUDE.md`'s "Verification discipline" asks for the full matrix "when the diff touches `src/` or `index.css`". Decide what Pass 1 must run and against which diff (the PR against the branch, or the resolution against main).
L2. `tests/helpers/gitFixtures.ts` keeps the branch's `'package.json'` entry from `ab93663`. Check whether main's newer tests, especially `tests/tier.test.ts` and its fixtures, behave the same with it.
L3. The PR's diff against the branch is 20 files (`git diff --stat bf7b82b 39d67bb`), all of them main's work that was already reviewed in #382, #385 and the 4:53 AM sync. Against main, the resolution differs only in `tests/helpers/gitFixtures.ts` among the eight conflicted files. Decide how Pass 1 should check the resolution without re-reviewing #382 and #385.
L4. The skill's stale seats and model names; see the routing paragraph above.
````

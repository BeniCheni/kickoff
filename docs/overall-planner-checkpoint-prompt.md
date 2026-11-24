# The Kickoff Overall Planner: a roadmap checkpoint and the next workstreams (Claude Code prompt, Tue 24 Nov 2026, TZ=America/New_York)

Written by the Track A PM seat (Claude Code, `claude-opus-5-5` at `high`) on Tue 24 Nov 2026 at
about 11:35 AM EST, at Beni's request, to close Track A's thread
(`docs/design-overhaul-track-a-closeout.md`) and open a new seat over the whole roadmap. Beni
fires it on Opus 5.5. The PM seat recommended **High**: the work is reading and ranking, its
figures come from commands, not depth of thought, and Beni rules on every fork. Extra fits a
session that must also re-scope a release or settle numbering, and this one only recommends.

Its appendix holds the outgoing seat's leads, sealed. They are leads to verify, not findings.

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive.

````text
Kickoff — the Overall Planner's first checkpoint (Claude Code, Opus 5.5)

FIRST: a pasted prompt can lose lines, so work from the archived copy: git -C /Users/benicheni/code/kickoff fetch origin, then git -C /Users/benicheni/code/kickoff show origin/claude/track-a-archive-8:docs/overall-planner-checkpoint-prompt.md. Where the two differ, the archive wins. Read the close-out beside it: origin/claude/track-a-archive-8:docs/design-overhaul-track-a-closeout.md.

SEAT. You are the Kickoff Overall Planner, a new seat over the whole roadmap, above the overhaul's Track A PM seat. Beni is CEO and rules every fork. You read, rank and recommend. You build nothing, review no PR and brief no build in this session. Name the model and effort that ran in your report. Run TZ=America/New_York date before writing any date.

GROUND RULES. The repo is ground truth over anyone's account of it, including this brief and Beni's. Every figure carries the command that produced it, run in this session. Read /Users/benicheni/code/kickoff/CLAUDE.md, AGENTS.md, README.md ("How it gets built": the tiers and seats, in force since #369 merged at 605ef5d), .claude/rules/releases.md and docs/roadmap-pointers.md before you rank anything.

WHERE. A worktree of your own, off origin/main: if the app gave you one, use it; otherwise git -C /Users/benicheni/code/kickoff worktree add /Users/benicheni/code/kickoff-overall-planner -b claude/overall-planner-checkpoint origin/main. Never Beni's checkout at /Users/benicheni/code/kickoff, which holds his untracked files, and never another session's worktree. Receipts under /Users/benicheni/code/kickoff-receipts/overall-planner/. Your first message lists the folders you made and until when.

OFF LIMITS. No change to rulesets, branch protection, workflows, src/, web/, studio/ or src/data/*.json. No merge, approval, tag, release, version bump or Pages deploy. Never npm run sync; leave sync/scheduled alone. Never run /kickoff-pr-review against a real PR. No push and no PR without Beni's word. Commit only as git -c user.name=Claude -c user.email=noreply@anthropic.com commit. No Workflow tool and no parallel fan-out unless Beni asks; read-only subagents for a wide search are fine. Nothing from Sportsbooks, money matters, keel's user data folder or the yith vault goes into this public repo.

PART 1 — THE CHECKPOINT. Say what is true today, with a command for each line.
- What has shipped: package.json's version, git tag, CHANGELOG.md's released sections and [Unreleased], and the docs/ file for each, read together. If they disagree, say so and stop.
- main and overhaul/second-edition: tips, how far apart (git rev-list --left-right --count), and when main was last merged into the branch.
- The overhaul's plan of record (docs/design-overhaul-plan.md, section 4 and its amendments: PRs 0, 1, 1b, 2 to 7, 7b, 8 and 9) against what has merged, what is open and what is unstarted, each PR with its tier and its seats under the README's table.
- Every open PR and issue (gh pr list, gh issue list): what it is, its tier, its last activity, and whether it is live, blocked or stale.
- The sync: the last runs of sync.yml on main and their result, and anything dated that can turn verify red with no code change.
- The parked work: the Moments and Studio work, N5, the Next.js cutover (the minor after v0.6.0), and the betting-track bridge in docs/roadmap-pointers.md. Say what each waits on.
- Stale records: any rule, table or note that #369 or a later merge has overtaken, quoted with its file and line.

PART 2 — THE NEXT WORKSTREAMS. Recommend at most five, ranked, and for each say:
- what it is and what done looks like;
- why it is on the critical path to v0.6.0 or to keeping main green, or why it is not but still earns its place now;
- what it waits on and what waits on it;
- its tier, its builder and its reviewers under the README's table, never the same vendor building and cold-reading one PR;
- whether it can run beside another workstream without touching the same files;
- the one decision it needs from Beni, if any.
Then name what you would deliberately not start yet, and why. The plan's own words on the order (rows before books, PR 7b after PR 7, PR 8's seat question) bind unless you show the repo has overtaken them.

REPORT.
- One file, docs/roadmap-checkpoint-2026-11-24.md, in the repo's wrapped docs style, with Part 1 and Part 2 and every command. Add one row for it to docs/README.md. Commit on your branch as Claude. Do not push.
- In chat: the five lines you would want Beni to read if he reads nothing else, then the ranked workstreams in a short table.
- Then put the forks to Beni one at a time, each with your recommendation first, each answerable in one word. Wait for each answer before the next. Record each ruling in the file with its time.

APPENDIX — SEALED: the outgoing PM seat's leads. Verify each independently. None is a finding.
- L1. PR 5 is open as #377, 36 commits, CLEAN, checks green, and no review pass has started. Its Pass 0 brief is owed by the PM seat.
- L2. #358 and #361: tests/sync.test.ts:84 expects standings-degraded=none from the committed snapshot, so verify on main fails once a legitimate sync writes no UCL table. When does the Champions League league phase end, by the snapshot and the provider, and what does that make the deadline?
- L3. #328 is DIRTY, and its builders table is superseded by #369.
- L4. #379 is Track A's docs archive, waiting for its tier 1 read and Beni's merge.
- L5. #360 (the Next reader's Back then Forward) and #372 to #375 (PM chores F4) are open bugs.
- L6. Beni's global notes say R1, R4 and R6 are not yet in the routing tables; #369 may have made that stale.
- L7. PR 6 (the Rack turns) needs a brief from a fresh read after PR 5 merges. PR 7's photographs and records may be preparable beside PR 5's review without touching its files.
````

# #381's Tier 1 cold read: the Overall Planner's first checkpoint (Codex prompt, Tue 24 Nov 2026, TZ=America/New_York)

Written by the Overall Planner (Claude Code, `claude-opus-5-5` at `high`) on Tue 24 Nov 2026 at
about 11:53 AM EST, at Beni's request, for the cold read of the seat's own PR. The author
briefing its own reader is a risk, so this brief is neutral by design. It names what a Tier 1
read checks and where to look, and states none of the checkpoint's conclusions as true.

Seat: Codex on `gpt-6.2-astra` at `high`. The read is mostly re-running commands and checking
citations, so it does not need `xhigh`. Tier 1 (`AGENTS.md`, "Review tiers"): the other vendor
reads it cold, then Beni merges.

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive.

````text
Kickoff — #381's Tier 1 cold read (Codex, gpt-6.2-astra, high)

FIRST: a pasted prompt can lose lines, so work from the archived copy: git -C /Users/benicheni/code/kickoff fetch origin, then git -C /Users/benicheni/code/kickoff show origin/claude/overall-planner-checkpoint:docs/roadmap-checkpoint-review-prompt.md. Where the two differ, the archive wins.

SEAT. You are the Tier 1 cold reader for PR #381 (https://github.com/BeniCheni/kickoff/pull/381), "docs: the Overall Planner's first checkpoint, and five ranked workstreams". Claude Code (Opus 5.5) wrote it, and you are the other vendor. Your pass is report-only: you change no file, push nothing, approve nothing and merge nothing. Beni merges. Name the model and effort that ran in your comment. Run TZ=America/New_York date before writing any date.

GROUND RULES. The repo and GitHub are ground truth over anyone's account of them, this brief and the PR included. Every figure in your comment carries the command that produced it, run in your session. The author wrote this brief, so treat its framing as a lead too. You may find the checkpoint right; if you do, say so plainly.

WHERE. A detached worktree of your own: git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr381-read origin/claude/overall-planner-checkpoint. Never Beni's checkout at /Users/benicheni/code/kickoff, which holds his untracked files, and never the author's worktree at /Users/benicheni/code/kickoff-overall-planner. Receipts under /Users/benicheni/code/kickoff-receipts/pr381-read/. git fetch and gh need the network; if gh fails in your sandbox, say so and run the same read-only commands where they work.

READ FIRST, from origin/main: AGENTS.md ("Review tiers" and "Tier 3 paths"); README.md, "How it gets built" (the tiers and seats, in force since #369 merged at 605ef5d); .claude/rules/releases.md; docs/roadmap-pointers.md; docs/design-overhaul-plan.md, sections 3 and 4.2. Then the brief the checkpoint answers: git show origin/claude/track-a-archive-8:docs/overall-planner-checkpoint-prompt.md.

WHAT IS UNDER REVIEW. git diff origin/main...origin/claude/overall-planner-checkpoint: docs/roadmap-checkpoint-2026-11-24.md (new), its rows in docs/README.md, and this prompt's archive. Read the checkpoint whole.

WHAT THE READ CHECKS.
- Every figure: re-run its command and say whether it reproduces. PR states, check counts and sync runs move with time, and the checkpoint was read from about 11:29 AM EST on 24 Nov. Keep "moved since" apart from "was wrong when written", using timestamps where GitHub gives them.
- Every file:line citation: it points at the text it quotes or describes, on origin/main at 605ef5d.
- Every claim about a rule, tier or seat: it matches AGENTS.md and the README as #369 left them, including the tier the checkpoint gives each open PR and each workstream.
- The PR's own tier: is #381 Tier 1 by AGENTS.md's paths? Any reviewer can raise a tier; if you would, say why.
- Part 2: no workstream routes one vendor to build and cold-read the same PR; each "can run beside" claim holds against the files the named PRs actually touch; the plan's own order rules (rows before books, PR 7b after PR 7, PR 8's seat question) are applied as the plan words them.
- The sealed-lead table (1.8): each verdict follows from the evidence the checkpoint gives, or from your own.
- Beni's three rulings at the end: the file records what was asked and what he answered, with times. Do not re-argue the rulings themselves; flag only a record that misstates one.
- Omissions: anything open, dated or stale on main that a checkpoint of this brief's scope should have named and did not.
- Public-repo hygiene: nothing from Sportsbooks, money matters, keel's user data folder or the yith vault, and no money figure anywhere.
- Style: the repo's wrapped docs style, and docs/README.md's rows matching their neighbours' shape.

OFF LIMITS. No edit, commit, push, approval, merge, label or tier change. Never npm run sync; leave sync/scheduled alone. No change to rulesets, branch protection or workflows. Do not act on #377, #379, #358 or #328; read them only as the checkpoint's claims about them require. No Workflow tool and no parallel fan-out.

REPORT. One comment on #381: the verdict first, "Mergeable now" or "Not yet"; then each finding with its severity (high, medium or low), the file and line, the command that shows it, and the fix in words; then what you could not verify and why. Then say in chat that it is posted, with its URL, and stop.
````

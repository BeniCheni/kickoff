# #328's cold read: the review loop's plan of record (Codex prompt, Wed 25 Nov 2026, TZ=America/New_York)

Written by the Planner seat for the review-loop track (Claude Code 2.1.330, `claude-opus-5-5`
at `high`) on Wed 25 Nov 2026, at Beni's request ("Write the brief"), for the cold read of the
seat's own PR. The author briefing its own reader is a risk, so this brief is neutral by design.
It names what the read checks and where to look, and states none of the PR's claims as true.

Seat: Codex on `gpt-6.2-astra` at `high`. The read is mostly checking citations and records
against GitHub and the repo, as for #381. PR 328 carries the `tier-2` label: the `tier` workflow
applied it, and one file, `docs/verification/review-loop/cursor-models-2026-11-15-super.txt`, is
not prose. Two departures from `AGENTS.md`'s Tier 2 row, both put to Beni:

- **No `/kickoff-pr-review`.** The Planner found the skill pushes commits even with
  `--no-merge`, so this read is report-only by hand, as #381's was.
- **Beni merges.** He chose a cold read, then his own merge after any fixes, over the Tier 2
  row's merge by the reviewer. Merging runs the Pages deploy, since `pages.yml` runs on every
  push to `main`.

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive.

````text
Kickoff — #328's cold read (Codex, gpt-6.2-astra, high)

FIRST: a pasted prompt can lose lines, so work from the archived copy: git -C /Users/benicheni/code/kickoff fetch origin, then git -C /Users/benicheni/code/kickoff show origin/docs/review-loop-plan:docs/review-loop-plan-review-prompt.md. Where the two differ, the archive wins.

SEAT. You are the cold reader for PR #328 (https://github.com/BeniCheni/kickoff/pull/328), "docs: the review loop's plan of record, and the overhaul's routing around 19 Nov". Claude Code seats wrote it, and you are the other vendor. Your pass is report-only: you change no file, push nothing, approve nothing, label nothing and merge nothing. Beni merges. Name the model and effort that ran in your comment, with their source. Run TZ=America/New_York date before writing any date.

GROUND RULES. The repo and GitHub are ground truth over anyone's account of them, this brief and the PR included. Every figure in your comment carries the command that produced it, run in your session. The author wrote this brief, so treat its framing as a lead, not a finding. You may find the PR right; if you do, say so plainly.

WHERE. A detached worktree of your own: git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr328-read origin/docs/review-loop-plan. Never Beni's checkout at /Users/benicheni/code/kickoff, which holds his untracked files. Receipts under /Users/benicheni/code/kickoff-receipts/pr328-read/. Record the tip you read (git rev-parse origin/docs/review-loop-plan) at the start and again before you post; if it moved, say so and read the new commits. git fetch and gh need the network; if gh fails in your sandbox, say so and run the same read-only commands where they work.

READ FIRST, from origin/main: AGENTS.md ("Review tiers" and "Tier 3 paths"); README.md, "How it gets built"; .claude/rules/releases.md. Then the PR's description and its comments.

WHAT IS UNDER REVIEW. git diff origin/main...origin/docs/review-loop-plan: 44 files under docs/, about 10,150 added lines, almost all new archive files for the review-loop track and the design overhaul's routing, plus rows in docs/README.md. Among its last commits, fc3fa30 merges main into the branch and af015cd records Beni's rulings on D8, D10 and D11; read the merge's resolution of docs/README.md with git show --remerge-diff fc3fa30. docs/review-loop-proposal.md is the plan of record; read its sprint plan and "Rulings received" whole, and sample the rest.

WHAT THE READ CHECKS.
- Tier: does any changed path fall in AGENTS.md's Tier 3 list? Any reviewer can raise a tier; if you would, say why. Only Beni can lower one.
- Public-repo hygiene, every file: no email address, token, key, password or credential value; nothing from Sportsbooks, money matters, keel's user data folder or the yith vault; no money figure. Name any hit by file and line, and do not quote a secret.
- Records against GitHub: for each archived comment link, PR number, commit SHA, merge, tag or run id in the plan's Sprint 3 and Sprint 4 entries and in "Rulings received", check that it exists and says what the plan says. Sample at least twenty, spread across sprints, and list each with its command and result. Keep "moved since" apart from "was wrong when written".
- Links: every relative link in the changed files resolves on the branch.
- docs/README.md: every new file has a row or sits in a row's file list, every row's files exist, and the rows match their neighbours' shape. The merge kept both sides' rows; check that none was lost or doubled against main.
- Rulings: each entry in "Rulings received" records what was asked and what Beni answered, with a date. Do not re-argue a ruling; flag only a record that misstates one or contradicts another entry.
- Consistency: where the plan states a current fact (a model route, a tier, a seat, a decision's status), it matches AGENTS.md and the README on main, or says it is older than them.
- Cross-repository references: the plan names elenchus pull requests as links or plain text; flag any owner/repo#number form inside elenchus-bound text (briefs addressed to elenchus seats).
- Style: the repo's wrapped docs style, and archived prompt files keep their fenced block intact.

OFF LIMITS. No edit, commit, push, approval, merge, label or tier change. Do not run /kickoff-pr-review or any review skill: it pushes commits. Never npm run sync; leave sync/scheduled alone. No change to rulesets, branch protection, workflows, environments or settings. Write nothing in BeniCheni/elenchus or BeniCheni/keel; read them by GET only, as the checks need. Do not read ~/.codex/auth.json, ~/.git-credentials or any Keychain item. No Workflow tool and no parallel fan-out.

REPORT. One comment on #328: the verdict first, "Mergeable now" or "Not yet"; then each finding with its severity (high, medium or low), the file and line, the command that shows it, and the fix in words; then what you could not verify and why; then the tip you read. Then say in chat that it is posted, with its URL, and stop.
````

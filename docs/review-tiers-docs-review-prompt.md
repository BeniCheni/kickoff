# PR #380 — the Tier 1 cold read of #369's docs follow-up (archived Tue 24 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) at about 11:40 AM EST on Tue 24 Nov 2026. Codex
opened draft #380 at `84252f4` from `docs/review-tiers-docs-implementation-prompt.md`. It is
**Tier 1**, the first PR reviewed under the tiers #369 wrote. Codex built it, so a fresh Claude
Code session gives the one cold read, report-only, and Beni merges. The model is
`claude-sonnet-5-5` at high, because Beni's standing default puts docs and records on Sonnet
5.5.

What the PM seat found at 11:35 AM EST:
- Five commits on `605ef5d`. `9b945af` (author Claude) is the brief, identical to the archive
  `6c80587`. Codex wrote the other four: `d68c67a`, `6586a17`, `b1216e3` and `84252f4`.
- Four files, +290/−4. `verify`, Vercel, Vercel Preview Comments and `vercel-smoke` are
  SUCCESS. The merge state is CLEAN.
- `docs/review-tiers-review-prompt.md` at the head is blob `7a0ce51`, the archive's.

The worktree exists: `git worktree add --detach /Users/benicheni/code/kickoff-pr380-read
84252f4…` ran at 11:35 AM EST. Delivered in chat in a four-backtick fenced block, one line per
paragraph. This copy is the archive.

```bash
cd /Users/benicheni/code/kickoff-pr380-read && claude --model claude-sonnet-5-5 --effort high
```

````text
/kickoff-pr-review 380 --no-merge
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/review-tiers-docs-archive:docs/review-tiers-docs-review-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so. If the command above did not load the skill, read `.claude/skills/kickoff-pr-review/SKILL.md` and `pr-comment.md` and follow them where this brief does not override them.
Kickoff PR #380 (#369's docs follow-up): the Tier 1 cold read
You are the one cold reader for PR #380 in github.com/BeniCheni/kickoff, branch `codex/review-tiers-docs` into `main`. You are a fresh Claude Code session on `claude-sonnet-5-5` at `--effort high`, and you wrote none of it. Beni started you in `/Users/benicheni/code/kickoff-pr380-read`, a detached worktree at the head `84252f47d461f71e546b10e44d7a6eb5da3a1066`. Name the model and effort that actually ran at the top of your comment. Read `CLAUDE.md` and `AGENTS.md` first. Since #369 they define the review tiers, and this is the first PR reviewed under them. The PM seat (Claude Code, Opus 5.5) wrote this at about 11:40 AM EST on Tue 24 Nov 2026. Treat the repository as ground truth and this brief as a map of it. Run `TZ=America/New_York date` before you write any date.
OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment.
THE TIER, AND WHAT YOU MAY DO. Tier 1: one cold read by the other vendor, then Beni merges. Your read is report-only, and on this point the tiers outrank the skill's fix and merge steps. Push no commit, and edit no file, PR body or draft state. Write every fix as a finding for Codex, the builder. Do not merge. Check the tier first. If any change at the head reaches a Tier 3 path in `AGENTS.md`'s list, or a Tier 3 spot in `README.md` (the `badge/version-` line, the `What it does today (vX.Y.Z)` heading, the list under Lineage), the PR is Tier 3. Say so as a high finding.
THE SPEC. `docs/review-tiers-docs-implementation-prompt.md`, the PR's first commit `9b945af`. Its author is Claude, and it is the spec, not your subject. Confirm it matches the archive: `git diff 6c80587 9b945af` prints nothing. Your subject is Codex's four commits, `d68c67a`, `6586a17`, `b1216e3` and `84252f4`. The calls they apply are Beni's, ruled at #369's Pass 3 and recorded in that squash body: `git show -s 605ef5d`.
WHAT TO CHECK. Reproduce each item before you report it, and say how.
1. The house. Run `npm ci`, `npm run typecheck` and `npm test`, with the real counts; `main` passed 1,167 tests in 88 files at `605ef5d`. Read `verify` at the tip. Codex reports that one Vercel-render test timed out on a first run and passed on the rerun. Name the test if it times out for you, and run it alone three times. The diff is docs only, so `CLAUDE.md` asks for a smoke pass: one lens, theme and tab at 390 px and one at about 1,000 px, with `scrollWidth === innerWidth` and the viewport set before load.
2. Call 5. `README.md:31-33` now carries the brief's sentence word for word, with only that paragraph re-wrapped. Say whether the sentence is true against the README's tier table and `AGENTS.md`. "Every change but the sync bot's gets a cold read from a different vendor": check Tiers 1, 2 and 3. "For sensitive changes, the builder answers in writing and Beni rules on whatever is still contested": check Tier 3.
3. Call 7. The seats table's build row reads "Claude Code (Opus 5.5)" in the "When Claude builds" column, and Pass 1's "Fable 5.2" is unchanged. Codex's grep found two older model statements in the `docs/README.md` index, for overhaul PR 4 (Fable 5.2) and #365's fix rounds (Opus 5.5). Say whether either is a live statement of the routing or a record of what ran. Find any other live statement of Claude's build model that now disagrees.
4. The record. `git rev-parse HEAD:docs/review-tiers-review-prompt.md` prints `7a0ce51feacca338c7d54d0b8c1d9b240fd943a1`, the same as `git -C /Users/benicheni/code/kickoff rev-parse bb3ae98:docs/review-tiers-review-prompt.md`. It is the PM seat's record, so read it for anything a public repo must not carry, not to edit its prose. That means no content from the Sportsbooks project, money matters, keel's user data or the yith vault, no email address, and no secret. Report anything you find as a high finding.
5. The index row. The new `docs/README.md` row sits after the `pm-chores-review-prompt.md` row, in its shape. Check every fact in it against the record and `git show -s 605ef5d`: the four sections and their models, 0/8/6, the seven rulings, `57c1531`, eight questions, `605ef5d`. Its last sentence says calls 5 and 7 "landed in this follow-up". Say whether an index reader can tell which PR that is.
6. Rendering. Check that `README.md` and `docs/README.md` render on GitHub at the head, with their links and anchors resolving: `gh api 'repos/BeniCheni/kickoff/contents/README.md?ref=84252f4' -H 'Accept: application/vnd.github.html'`. No code fence changed. Prose stays wrapped in the file's existing style.
7. Scope. `git diff --stat 605ef5d 84252f4` shows only `README.md`, `docs/README.md` and the two new files under `docs/`.
THE COMMENT. Leave one PR comment on #380 in `pr-comment.md`'s shape. Give the model, effort and head at the top, then the test counts, the smoke pass and a "Not verified" list. Use the verdict "Mergeable now" only if nothing needs a fix; otherwise list the fixes for Codex. Then stop, and reply in this chat with the comment's link and the verdict. Do not mark the PR ready, and do not merge it.
SEALED APPENDIX. These are claims, not conclusions. Verify each one independently, and report any that does not hold. The first group is Codex's, from its report to Beni. The second is the PM seat's, with the command and the time it ran.
- Codex: typecheck and 1,167 tests in 88 files passed at the base and at all five commits.
- Codex: the base and head builds passed with the same bundle-size warning, and Chrome showed no horizontal overflow or console errors at 390 px and 1,000 px.
- Codex: both READMEs render on GitHub at the head, with their links and anchors resolving.
- Codex: the archived brief matched the paste, and the review record matches blob `7a0ce51`.
- PM seat, 11:35 AM EST: `gh pr view 380` showed head `84252f4`, a draft, CLEAN and MERGEABLE, with `verify`, Vercel, Vercel Preview Comments and `vercel-smoke` SUCCESS. There are 4 files, +290/−4.
- PM seat, 11:38 AM EST: `git diff --stat 6c80587 9b945af` prints nothing, and both commits have tree `8a38d0f`, so the brief in the PR is the archive's.
- PM seat, 11:35 AM EST: `git rev-parse origin/codex/review-tiers-docs:docs/review-tiers-review-prompt.md` printed `7a0ce51feacca338c7d54d0b8c1d9b240fd943a1`. `origin/main` was still `605ef5d`.
````

# Overhaul PR 4, the Table's skin — the PM seat's Codex Pass 0 opener (archived Fri 20 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) in the Track A planning session at about 2:40 PM
EST, before the PR opened. Claude Code was then building PR 4 beside PR 3 in
`/Users/benicheni/code/kickoff-pr4`, on `claude/overhaul-pr4-table`, unpushed. Its last report,
which Beni relayed, said the evidence run was in progress and that it would push and open the PR
when the run finished. The PM seat checked that report against the worktree and its receipts:
- twelve commits after `d9b97d4`, all committed as `Claude <noreply@anthropic.com>`: ten feature
  commits and two merges of `main`, the second at `1851196`;
- a clean working tree, with the head's `src/data` equal to `1851196`'s;
- a base receipt at `kickoff-receipts/pr4/base/receipt.json` reading 1,946 rows, 16 below the floor
  and none unread, the 16 being R2's white L on `rgb(216, 90, 48)` at 3.87:1.

**The routing.** PR 4 takes the "When Claude builds" column of PR #328's two-vendor amendment:
Codex on `gpt-6.2-astra` at `xhigh` writes Passes 0 and 1.5 and sits Pass 1 in a fresh session,
Claude Code on `claude-fable-5-2` at `xhigh` answers Pass 2 and every fix round, Codex on
`gpt-6.2-sol` at `xhigh` with `--sandbox read-only` sits every Pass 2.5, and Beni's word merges.
The amendment gives the review briefs to the reviewing vendor "so the side that built never steers
its own reviewer", and the PM seat is Claude, the builder's vendor. So the PM seat asked Beni
whether to hand Codex an opener with no suspicions in it, and he answered **"Yes, neutral opener"**
(Fri 20 Nov 2026, in this session, shortly before the opener was written). The opener below names the PR, the seats and the
arrangements and says nothing about the code. It follows the thin opener the PM seat wrote for
#342's Codex Pass 0 (in [design-overhaul-pr2-review-prompt.md](design-overhaul-pr2-review-prompt.md)),
without that one's "material" section: there is no Claude draft here for Codex to check.

The PM seat's observations of the build are kept out of the opener, including the base receipt's
1,946 rows above. Codex reads the PR fresh, and Pass 1 re-derives every figure itself.

Started from Beni's own checkout, which is on `main`, with a read-only sandbox, so the session
cannot touch his untracked files. `gh` and `git fetch` ask for approval:

```bash
codex -C /Users/benicheni/code/kickoff -m gpt-6.2-astra -c model_reasoning_effort=xhigh -s read-only -a on-request
```

````text
Kickoff design overhaul — overhaul PR 4 (the Table's skin): Pass 0, write the Pass 1 brief

You are Pass 0 of the 360 cycle for overhaul PR 4, the Table's skin, in github.com/BeniCheni/kickoff, in a fresh Codex session on gpt-6.2-astra at xhigh. Name the model and effort that actually ran, read from your session file, on the first line of what you deliver. Read CLAUDE.md and AGENTS.md first; they bind you. Then read .claude/skills/kickoff-pr-review/SKILL.md, whose six-pass table says what Pass 0 reads and what it leaves behind. This checkout is Beni's, on main, and holds untracked files of his: read the PR's files at its head with git show, and change nothing here. The PM seat (Claude Code, Opus 5.5) wrote this opener on Fri 20 Nov 2026 at about 2:40 PM EST, before the PR opened, and kept it thin for the reason under WHY YOU: it names the PR, the seats and the arrangements, and nothing the PM seat thinks of the code. Treat the repository as ground truth; where this opener disagrees with it or with #328, the repository wins, and you say so beside your brief. Run TZ=America/New_York date before writing any date.

FIND THE PR. Claude Code builds PR 4 on claude-fable-5-2 at xhigh, on branch claude/overhaul-pr4-table into the integration branch overhaul/second-edition, from docs/design-overhaul-pr4-implementation-prompt.md, which is on main since #348. When this was written the branch was not yet pushed. Find the PR with gh pr list --repo BeniCheni/kickoff --head claude/overhaul-pr4-table. If none is open, stop and tell Beni. Record the head and base SHAs you read, and use them throughout your brief.

WHY YOU. PR 4 takes the "When Claude builds" column of PR #328's two-vendor amendment, approved by Beni on Tue 17 Nov 2026 and not yet on main; read it with git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md, under "Amended Tue 17 Nov 2026: two vendors, and no seat for Cursor or Grok". Passes 0 and 1.5 are yours, on gpt-6.2-astra at xhigh. Pass 1 is a fresh Codex session on gpt-6.2-astra at xhigh, report-only. Pass 2 and every fix round are Claude Code's, on claude-fable-5-2 at xhigh. Pass 2.5, every sitting, is Codex on gpt-6.2-sol at xhigh with --sandbox read-only, and writes nothing. Pass 3 is Beni. The amendment gives the review briefs to the reviewing vendor "so the side that built never steers its own reviewer". The PM seat is Claude, the builder's vendor, so Beni ruled on Fri 20 Nov 2026 that it hand you a neutral opener ("Yes, neutral opener"), and the brief is yours.

WHAT YOU LEAVE BEHIND. One Pass 1 brief for a fresh Codex session on gpt-6.2-astra at xhigh, delivered in chat in a four-backtick fenced block, one line per paragraph and never hand-wrapped, ready for Beni to paste, with the command that starts that session above it. Shape it as the skill's Pass 0 row says: the method, the PR's particulars, and a sealed appendix of claims for Pass 1 to re-derive, never conclusions. Pass 1 names the model and effort that ran on its comment's first line. Pass 1 is report-only, because the amendment gives every fix round to the builder: your brief overrides the skill's fix, archive and landing steps, and Pass 1 puts each fix in its comment as a finding. You change nothing either. Read the PR, its body, its commits and the repository fresh, with git and gh, and run no test, build, server or browser; that is Pass 1's work. Make no commit, push nothing, post no PR comment, and write no file outside a scratch directory. Beni brings your brief to the PM seat, which archives it under docs/ word for word with your seat named, and edits nothing in it.

PARTICULARS YOUR BRIEF MUST CARRY. These are rulings and arrangements, not findings. Check each against its source.
- Beni's rulings, named as his. The build brief's section "RULINGS THAT BIND IT" lists those that bind PR 4, with their sources; read each at its source and carry it as his. Beni's word merges every overhaul PR: nobody in an agent seat approves, merges, enables auto-merge, bumps or tags.
- PR 3, the Ledger's rows and the week (#349, built by Codex), is building and in review beside PR 4, by Beni's "Beside PR 3" (Fri 20 Nov 2026, about 12:10 PM EST). It has its own review, and Pass 1 does not review it. The two build briefs share one contract for time.ts's clock24 field and for CompetitionChip.tsx, src/lib/chipInk.ts and the chip cases in tests/europeanContrast.test.ts; read it in this PR's brief under "IF PR 3 IS BUILDING AT THE SAME TIME" and in PR 3's. What that contract leaves to whichever PR merges second is an arrangement, not a finding against this one. If PR 3 has merged into overhaul/second-edition when Pass 1 runs, Pass 1 reviews PR 4 against the new base and says so.
- Where Pass 1 works: detached worktrees /Users/benicheni/code/kickoff-pr4-review at the head and /Users/benicheni/code/kickoff-pr4-review-base at the base, made through the common .git, with npm ci at the root and in web/ of each. The head has merged main, so your brief says how Pass 1 renders both trees from the same snapshot without committing anything. Servers on 7773, 7774 and 7775 for the head's Vite preview, Next production and states harness, and 7873, 7874 and 7875 for the base's, with KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN set explicitly, each listener's PID and cwd confirmed with lsof, and no process stopped that Pass 1 did not start. Port 5173 is Beni's, 7173 to 7275 are PR 3's builder's, 7373 to 7475 are PR 4's builder's, and 7573 to 7575 and 7673 to 7675 belong to #349's Pass 1, which may be running at the same time.
- Never Beni's checkout at /Users/benicheni/code/kickoff, the builders' worktrees kickoff-pr3, kickoff-pr3-base, kickoff-pr4 and kickoff-pr4-base, or #349's review worktrees kickoff-pr349-review and kickoff-pr349-review-base. Receipts go under /Users/benicheni/code/kickoff-receipts/pr<number>-pass1/, where a restart cannot empty them (Beni, Thu 19 Nov 2026), never in /private/tmp.
- Pass 1 builds, serves, drives a browser, makes worktrees through the common .git and posts with gh, so the command that starts it must allow those writes and that network; --sandbox read-only is Pass 2.5's.
````

Codex's Pass 0 reply and its Pass 1 brief join this file when Beni brings them back.

## Pass 1 posted (Sat 21 Nov 2026, 12:09 PM EST)

Codex's Pass 1 posted at 12:09 PM EST:
https://github.com/BeniCheni/kickoff/pull/352#issuecomment-7066252100. Its first line names
`gpt-6.2-astra` at `xhigh`, and its heading reads "Not mergeable at `ebd5331`". At about 12:35 PM
the PM seat read the comment from GitHub. The head was still `ebd5331`, with 21 commits and no
review, so the pass pushed nothing. Beni relayed its report in chat: all 132 per-commit gates
passed on the committed data; the head's contrast enforcement found no failure and no unread
sample; both detached review worktrees were left clean; and #349 was still open, so the combined
tree is unverified.

Its eleven findings for Claude's fix round, by Pass 1's own titles:
1. High. A successful sync can fail the new provenance gate.
2. High. New tests require a nonempty UCL table and at least one incomplete form strip.
3. Medium. The computed name can belong to the wrong action.
4. Medium. An invisible focus ring passes the runner.
5. Medium. A La Liga proof can display Serie A.
6. Medium. A KICKED OFF club can acquire a clock and a score without failing the state proof.
7. Medium. The foot's unqualified explanation of a dot can be false.
8. Medium. The unset cell abbreviates approved string 24.
9. Medium. The active league has lost the board's competition dot.
10. Medium. Inherited Next history mismatch.
11. Low. The historical "identical, row for row" claim goes beyond the receipts.

It recommended an answer to each of the PR body's ten questions: Text (1); yes to the last place,
with the words qualified (2); Keep the cover's standings age (3); Yes (4, 5, 6, 7); Local (8);
yes to removal (9); yes to ink (10). Beni has answered none of them. Its receipts are under
`~/code/kickoff-receipts/pr352-pass1/run-01/`. It could not open the local Fergie Time
design-system templates, so it compared the committed boards 07 and 08 directly.

Codex's Pass 0 reply and the Pass 1 brief it wrote have still not been brought back, so this file
does not yet hold them.

## The Pass 1.5 handoff to Codex (Sat 21 Nov 2026, about 12:40 PM EST)

Under #328's "When Claude builds" column, Pass 1.5 is Codex's, on `gpt-6.2-astra`. As for #342,
the PM seat recommended the Codex session that ran Pass 0, which has already read the PR, or a
fresh session on the same model if that one is gone. The handoff is as neutral as the Pass 0
opener, under the same ruling ("Yes, neutral opener"): it gives the comment, the counts by
severity, the seats and the arrangements, and nothing the PM seat thinks of the findings. Pass 2
goes to PR 4's builder, the seat that built the PR and holds its worktree. Its worktree holds a
four-line comment the builder left uncommitted for Beni beside question 1, and an untracked
`.agents/skills/kickoff-pr-review/`; the handoff names both so that no fix round commits them.

````text
Pass 1 has posted on #352: https://github.com/BeniCheni/kickoff/pull/352#issuecomment-7066252100 (Sat 21 Nov 2026, 12:09 PM EST), from a fresh Codex session on gpt-6.2-astra at xhigh. Its verdict is not mergeable at ebd5331, with eleven findings: two High, eight Medium and one Low. The head has not moved, and the PR has no review. You hold Pass 1.5 under #328's "When Claude builds" column, so write the Pass 2 brief now. If you are not the session that ran Pass 0, first read the Pass 0 opener in docs/design-overhaul-pr4-review-prompt.md on the local branch claude/track-a-archive-7 (git show claude/track-a-archive-7:docs/design-overhaul-pr4-review-prompt.md), then the Pass 1 comment. The Pass 1 brief that Pass 0 wrote is not archived yet; if you do not have it, say so beside your brief.

WHO PASS 2 IS. PR 4's builder: the Claude Code session on claude-fable-5-2 at xhigh that built #352 in /Users/benicheni/code/kickoff-pr4, on claude/overhaul-pr4-table, or a fresh Claude Code session on the same model and effort in that worktree if Beni cannot resume it. It answers Pass 2 and runs every fix round. The skill's 1.5 row says what the brief carries: every finding for the builder to accept, contest, or accept while contesting its characterisation, with what it needs to reproduce each, and Beni's rulings so far, named as his. The PR body asks Beni ten questions, and Pass 1 recommended an answer to each; Beni has answered none of them. Carry them as open. Pass 2 recommends; it does not settle them.

ARRANGEMENTS, NOT FINDINGS. The builder's worktree holds two changes that are not the PR's: an uncommitted four-line comment in src/components/TablePage.tsx, which the builder left for Beni beside question 1, and an untracked .agents/skills/kickoff-pr-review/. Pass 2 commits by path, never with git add -A or git commit -a, and leaves both as they are unless Beni says otherwise. PR 3 (#349) is still open on the same base, so the two build briefs' rules for whichever merges second still apply, and the combined tree is still unverified. Pass 1's receipts are under /Users/benicheni/code/kickoff-receipts/pr352-pass1/run-01/, for Pass 2 to read; Pass 2 writes its own under /Users/benicheni/code/kickoff-receipts/pr4/. The builder's ports stay 7373 to 7475.

WHAT YOU LEAVE BEHIND. The same as Pass 0: one brief in chat in a four-backtick fenced block, one line per paragraph and never hand-wrapped, ready for Beni to paste, with a short note beside it. Change nothing: no commit, no push, no PR comment, and no file outside a scratch directory. Beni brings your brief to the PM seat, which archives it word for word.
````

Codex's Pass 2 brief joins this file when Beni brings it back.

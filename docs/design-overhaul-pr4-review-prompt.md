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

## Codex's Pass 0 reply and its Pass 1 brief, read from its session file (Sat 21 Nov 2026, about 1:00 PM EST)

Codex's Pass 0 ran in Beni's checkout from 11:10 to 11:16 AM EST on Sat 21 Nov, on
`gpt-6.2-astra` at `xhigh` by its session's `turn_context` record. Its reply never reached the PM
seat, so on Beni's word ("Read Codex's log", Sat 21 Nov) the PM seat read it from Codex's session
file, `~/.codex/sessions/2026/11/21/rollout-2026-11-21T11-10-51-01a1fedf-f177-7533-accc-fed28c30088e.jsonl`,
as that session's final answer. It is archived below word for word, with two exceptions. The two
short progress notes before it are left out. So is the hidden `<oai-mem-citation>` block Codex
appends to its answers, which the chat does not show and which names only Codex's own memory files.
A second file opened in the same second, `…-f205-…`, is a guardian sub-agent that approved one
read-only `gh` query.

Pass 1 had already run and posted by then, so the PM seat checked nothing in the brief and edited
nothing. Under #328 the reviewing vendor writes the review briefs, and Claude answers Pass 2.
The Pass 1.5 handoff above told a session that lacked the brief to say so. Once this commit
exists, a Pass 1.5 session can read it with
`git show claude/track-a-archive-7:docs/design-overhaul-pr4-review-prompt.md`.

Delivered by Codex in chat. This copy is the archive.

gpt-6.2-astra · xhigh · Pass 0, confirmed from this session’s `turn_context` record.

[PR #352](https://github.com/BeniCheni/kickoff/pull/352) opened after the neutral opener was written. Its head is `ebd5331e076c7a31804a137577fc793243558160` and its integration base is `d9b97d402991328aed94f07f9d459815a58886d3`. PR #349 is still open. The opener’s seat assignments agree with the corrected amendment. [PR #349](https://github.com/BeniCheni/kickoff/pull/349) · [PR #328 amendment](https://github.com/BeniCheni/kickoff/blob/4ee003a30cec1128078bea919c6344516d0684f0/docs/design-overhaul-plan.md#amended-tue-17-nov-2026-two-vendors-and-no-seat-for-cursor-or-grok-proposed-by-the-review-loop-planner-approved-by-beni-the-same-day)

One time-sensitive correction matters for the review. The PR body’s statement that its data equal `origin/main` described the builder’s run. `main` has since advanced. I verified the head’s data against the named sync commit, and the brief uses that immutable tree for the comparison. Pass 0 read Git objects and GitHub records only. I ran no tests, build, server or browser, changed no files, and posted nothing.

```bash
codex -C /Users/benicheni/code --model gpt-6.2-astra -c 'model_reasoning_effort="xhigh"' --sandbox workspace-write -c 'sandbox_workspace_write.network_access=true' --ask-for-approval on-request
```

````text
/kickoff-pr-review 352 --pass 1 --no-merge

Kickoff design overhaul PR 4, the Table’s skin. You are Pass 1, the fresh, independent Codex reviewer for github.com/BeniCheni/kickoff#352. Read CLAUDE.md and AGENTS.md first, from the PR head via the common Git directory until your review worktree exists. Then read .claude/skills/kickoff-pr-review/SKILL.md, browser-matrix.md and pr-comment.md. Run `TZ=America/New_York date` before writing any date. Read the model and effort that actually ran from this session’s own turn_context. Name both when you start and on the first line of your PR comment. The assigned seat is gpt-6.2-astra at xhigh. If the record differs or cannot be verified, tell Beni before conducting the review.

Authority. This is report-only. Follow the skill’s cold reading, verification, severity and one-comment method. This brief overrides its fix, ideas-file, retro-edit, archive, push and landing steps. Put every proposed fix in the comment as a finding with a reproduction. Temporary counterexamples in your own detached worktrees are permitted. Restore them and verify the restoration. Make no commit, push, approval, merge, auto-merge, version bump, tag, settings change or workflow dispatch. Beni’s word merges every overhaul PR. The PM seat archives this Pass 0 brief word for word with Codex named as its author.

Seats. Read `git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md`, “Amended Tue 17 Nov 2026: two vendors, and no seat for Cursor or Grok”, including the Thursday correction. Pass 0 read #328 at 4ee003a30cec1128078bea919c6344516d0684f0. Beni approved the “When Claude builds” column. Claude Code on claude-fable-5-2 at xhigh built PR 4 and owns Pass 2 and every fix round. Codex on gpt-6.2-astra at xhigh owns Passes 0 and 1.5 and this fresh Pass 1. Every Pass 2.5 sitting belongs to Codex on gpt-6.2-sol at xhigh with --sandbox read-only and writes nothing. Beni is Pass 3. His “Yes, neutral opener” gave the builder-vendor PM seat the arrangements and left the review brief to Codex.

Pin the review. H=ebd5331e076c7a31804a137577fc793243558160 on claude/overhaul-pr4-table. B=d9b97d402991328aed94f07f9d459815a58886d3 on overhaul/second-edition, the #342 squash. Read live `gh pr view 352 --repo BeniCheni/kickoff --json state,title,body,commits,files,headRefName,headRefOid,baseRefName,baseRefOid,statusCheckRollup` and check #349’s state, target and merge commit. Fetch the refs through the common Git directory. Record H, B and their merge base. If #349 has merged into the integration branch, review #352 against the new base, record the new SHA and say whether H contains it. Inspect the base-tip difference as well as the PR’s three-dot diff when those answer different questions. Any untested combination stays explicitly unverified. If the head moves, identify the replacement and rerun affected evidence before attaching a verdict to it. Check both refs again immediately before posting.

Read the whole change. At Pass 0’s pins, `git diff B...H` is 44 files, +18,137/−11,437. The implementation, tests and tooling account for 33 files, +2,853/−413, outside docs/ and src/data/. GitHub lists 21 reachable commits. `git log --first-parent --reverse B..H` gives the PR’s 12, including its two merges of main. Read each first-parent change against its first parent, every implementation and test hunk, and account for the imported docs and generated blobs by provenance. The merge commits are c27cb8e and c0c6dee. Their main parents are 4257bcc and 1851196 respectively. Use the integration base throughout.

Read the design lineage. Start with docs/design-overhaul-proposal.md D4, docs/design-overhaul-plan.md §§1.5, 1.7 rows 3/6/16, 3, 6.1–6.2, 8.1–8.3 and 10.4–10.5, then docs/design-overhaul-plan-review.md. Read docs/design/5-handoff/second-edition-handoff.md §§2, 3, 5, 6 and 11, the Table sections and final rulings in gap-18-addendum.md, and the Register boards 07 and 08, including the foot at 390. Read docs/design-overhaul-pr4-implementation-prompt.md in full, PR 0’s R2 and PR 2’s “So PR 4 now owes” in their review archives. Read the current and preceding process notes named by H’s CLAUDE.md, including docs/v0.2.6-ideas.md and docs/v0.3.0-ideas.md. Apply plan §10.5: Beni’s rulings first, then the boards, handoff and build brief, with the later addendum governing the sections it updates. Record each material conflict and its resolution. Identify any local-only template you could not inspect. Establish your own review notes before opening the sealed appendix or borrowing a builder probe.

Beni’s rulings on scope and copy. D4 extends the settled Table’s skin. ESPN supplies the official order, points and records. Preserve the existing sort, zone ranges, seasons and fixture joins, including the existing GD, PPG and games-in-hand derivations. Plan-review rulings 1 “Branch”, 2 “Ten” and 12 “Six” put this work on the integration branch. The public change and v0.6.0 belong to the release. PR 4 has no version, tag or CHANGELOG section. Ruling 17 “Approve” covers plan §10.4’s words with its exclusions. Check string 15’s Register label and snapshot-derived matchday/phase, 22’s stadium clock and unknown-zone words, 24’s unset kickoff wording, 31’s note, played line and “Zones & key”, and string 8’s third sentence against the actual key, form and board placement. The build brief permits omission of the played line with an explanation. PR 7 owns the photograph, caption and photograph sentence. PR 8 owns foil and decorative motion.

Beni’s design rulings. In the handoff §11, ruling 6 gives W an ink fill, D an outline, L a blood fill and an empty slot a dot. Ruling 7 limits amber to eight named uses. Ruling 10 gives the Table 780 px at 1000. Ruling 11 keeps Brooklyn’s clock and sets the stadium clock to zero-padded 24-hour time followed by “ local”, without an abbreviation or offset. Ruling 12 allows the league tabs to grow 28 px and gives the pips their own line. In the gap-18 addendum, ruling 22 makes a play-off band its destination’s hue, 4 px on and 3 px off. Relegation play-offs use broken blood and relegation solid blood. Ruling 23 gives Eliminated solid muted ink. Ruling 26 hides the bands and disclosure squares on a season mismatch and puts the two actual seasons first inside the opened key, in ink, with “Update LEAGUE_TABLES.” omitted. Ruling 29 keeps both clocks on the Fixtures rows for a scheduled match past kickoff. The Table’s KICKED OFF cell shows neither clock nor score. CLAUDE.md binds both clocks to one UTC instant and forbids an invented kickoff, matchday or weakened honesty assertion.

Beni’s four carry-forwards. From PR 0, R2, confirmed “Yes”: PR 4 ends the loss-pip exception. Reproduce the base’s white L on #D85A30, historically 16 light Table failures at 3.87:1, and run head --enforce with no exemption. From PR 2, “All five as recommended” gives PR 4 the first row’s entire focus ring below its own long-zone divider. “Yes, in PR 4” requires W, D and L to be plain text or working sorts on the snapshot’s figures. Text leaves six desktop sort controls. “Later, in PR 4” requires the runner to verify each header’s browser-computed accessible name. Exercise the original counterexample in Chromium, where a visibly correct Pts button acquires Pl’s name through aria-labelledby.

PR 3 runs beside this review. Beni’s “Beside PR 3”, Fri 20 Nov at about 12:10 PM EST, is recorded in both build briefs. #349, the Ledger’s rows and week, was open when Pass 0 read it and has its own review. Read only the shared agreement in the two implementation briefs. Both add precisely `clock24: string` to ZonedParts through zonedParts’ cached formatter, same instant, zero-padded HH:MM, hourCycle 'h23'. Brooklyn’s time, clock and meridiem stay intact. PR 3 owns tests/time.test.ts and tests/venueTz.test.ts. PR 4 tests through the Table cell. Whichever builder merges second integrates the first implementation and its tests, drops the duplicate, keeps both sides’ harness, runner, contrast, edge-fixture and Next scan-list additions, consolidates the kickoff-date scan and reruns suite and evidence. CompetitionChip.tsx, src/lib/chipInk.ts and the chip cases in tests/europeanContrast.test.ts stay until both consumers are gone. The second builder then deletes the obsolete component, helper and cases, records the assertion retirement, and checks that hue survives only in a dot or zone band. PR 3 owns the amber inventory, updated for the final Table sites by whichever merges second. These are merge-order obligations. Review PR 4’s present behavior and its compliance with that agreement.

Worktrees and receipts. From /Users/benicheni/code use `git --git-dir=/Users/benicheni/code/kickoff/.git` for fetch and worktree administration. Use `worktree add --detach /Users/benicheni/code/kickoff-pr4-review "$H"` and `worktree add --detach /Users/benicheni/code/kickoff-pr4-review-base "$B"` with that Git prefix. Check the physical paths, detached SHAs and cleanliness. An existing directory needs an identity check before reuse. Leave other sessions’ files and processes alone. Run no checkout, install, build or server in Beni’s kickoff checkout, kickoff-pr3, kickoff-pr3-base, kickoff-pr4, kickoff-pr4-base, kickoff-pr349-review or kickoff-pr349-review-base. Put review logs, browser captures, mutations, receipts and the comment body in distinct subdirectories of /Users/benicheni/code/kickoff-receipts/pr352-pass1/. Beni chose this persistent location after a restart emptied /private/tmp. Preserve earlier runs.

Match the snapshot before comparing pixels, behavior or coverage. First record native B and H results. At the listed pins, H:src/data is db4e8a9c9c0e77fc7a34cd64563f20d94572ab4d, identical to sync commit b2919c003817ae590a8f347cd529124034385913 on main and to c27cb8e:src/data. B:src/data is 7439dcce57c2d1640472e21cb94dc413e8f7690e. Verify the tree IDs and the three blob IDs yourself. In the clean detached base worktree only, use `git restore --source="$H" --worktree -- src/data/` to materialize the entire committed head snapshot. Verify `git diff --quiet "$H" -- src/data/`, that the index is clean, HEAD is still B and only those three inputs differ from B. Rebuild every served and file artifact after the overlay. Label that run “base code / head snapshot”. Record the clock and use the same instant and week anchor for causal comparisons. After the servers stop, restore only your overlay with `git restore --source="$B" --worktree -- src/data/` and verify cleanliness. No hand edits to generated data, data refresh, merge or commit.

Build and serve. Use the repo-supported Node 24 and record the actual Node, npm and browser versions. Run `npm ci` at root and `npm ci --no-audit --no-fund --prefix web` in each worktree. Run the head baseline clean: root typecheck, both npm test projects, build, build:single, build:offline and `node node_modules/tsx/dist/cli.mjs scripts/scan-offline-bundle.ts`; web typecheck, test, build, check:client and check:css. Check the conditional Studio admin-token gate against the actual --font-* diff. Re-derive the builder’s per-commit gate claim on its 12 exact first-parent SHAs, sequentially in your detached review worktree before serving, returning it clean to H. Record actual exits, test/file counts, Next build attempts and any unverified SHA or command. Never follow a build notice into next upgrade or an audit fix.

Reserve 7773/7774/7775 for head and 7873/7874/7875 for base. In each triple, start the root built Vite preview, web’s Next production server and root Vite dev states harness, respectively. Bind 127.0.0.1, with --strictPort for Vite. Preflight each port with `lsof -nP -iTCP:<port> -sTCP:LISTEN`. After launch, record the actual listener PID and `lsof -a -p <pid> -d cwd` for all six. The Next listeners should be in the corresponding web/ directories. For every runner invocation explicitly set KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN to the three http://127.0.0.1 origins for that tree. Port 5173 belongs to Beni, 7173–7275 to PR 3’s builder, 7373–7475 to PR 4’s builder, and 7573–7575 and 7673–7675 to #349’s Pass 1. If an assigned port is occupied, preserve the listener and report the conflict. Shut down only processes you started and still own.

Run each tree’s own `node web/scripts/evidence.mjs <durable-output-dir>` in report mode, then with --enforce in a separate directory. Keep actual exit codes, partial receipts, every below-floor sample and every unread sample. Run `node scripts/n6b-proof.mjs <durable-json-path>` on the clean head production build. It starts its own temporary Next listener and invokes scripts/vercel-smoke.mjs over /, /?tab=table, /?tab=moments and /api/snapshot. Verify the landmarks, deployed SHA, committed snapshot digest and gallery dispositions. Check live verify, Vercel and vercel-smoke at the reviewed head. Record hosted status, which revision supplied its checker, and what you exercised locally as separate evidence.

Inspect what a reader gets. Run the full 96-cell matrix across Vite and Next, Poster and Ledger, light and dark, Fixtures, Table and Moments, at 360, 375, 390 and 1000. Identify the Table’s 32 cells. Set the viewport before capture, check console and page errors and `document.documentElement.scrollWidth === innerWidth` per cell. Exercise all six leagues in both themes at 360, 390 and 1000 on both apps and both file builds. Open dist-offline/index.html and dist-single/index.html from disk with the network disabled, and observe requests through the key and row interactions. Check actual rendered faces, wrapping and clocks. Save paired 390 captures and the 360 and 1000 evidence for consequential differences. Compare the matched Fixtures and Moments controls for regressions introduced by the shared CSS, clock field or PageFoot.

Drive the Table yourself. Check the default La Liga and ?league=, history navigation, ?only= and &date= preservation, provider order, all fifteen columns and their contents in the 780 px measure, alternate sorts, ties, canonical Pos and restoration of zones. Measure tab faces and hit boxes, the opened key, the whole-row hit target, sort targets and overlap. Walk a phone’s first row and UCL row 9 with a real Tab press as the divider pins. Inspect the rendered ring on all four edges. Read the accessibility tree for the actual header-to-action mapping, form strips, row names and expanded figures. Measure light and dark contrast on the cover, key, note, row, pips, both clocks and black foot. Check the 150/180 ms row and key interactions and the static, aria-hidden scorch under both motion preferences. Inspect actual captures beside the Register boards.

Drive the synthetic states using tests/harness/table.html and its TablePage entry. Scope assertions to the visible layout and the named club. Cover an unset next kickoff, exact kickoff, unknown venue zone, KICKED OFF, games in hand, one opened row, desktop PPG, the mismatched season, the UCL league phase and an empty table. Prove forbidden clocks and scores are absent from the affected cell. Exercise the two-clock cell at 360, midnight and the EU/US DST mismatch from a single independently chosen instant. Verify both halves of the foot’s form claim against eligible fixtures. Run tests/standings.test.ts, tests/dom/uclTable.test.ts and tests/dom/tableUnderway.test.tsx by their actual filenames in the tree, alongside the full suite; the UCL DOM test is tests/dom/uclTable.test.tsx.

Audit changed assertions against plan §6.2. Build your own before/after file-and-line inventory, then reconcile it to the builder’s table. For each changed rule, name the preserved behavior and its replacement assertion. The four specified dispositions are a selector rename, words or voice changed under a named ruling, movement to a replacement surface, and removal with a component whose rule is covered on its replacement. Account for additions and exceptions explicitly. Break each touched rule locally, observe the named test or real runner fail for the intended reason, restore it and rerun green. Record whether each failure concerns the shipped UI, the verifier or a source-text assertion. Keep synthetic data in the test or browser harness. Restore your own probes and confirm both detached trees at their recorded SHAs before posting.

Deliver one ordinary PR comment with `gh pr comment 352 --repo BeniCheni/kickoff --body-file <persistent-body-file>`. Use the actual model and effort on line one, followed by Pass 1, verdict and reviewed SHA. Adapt pr-comment.md. Include the base and snapshot provenance, findings numbered by severity with file:line, expected and observed behavior, exact reproduction and proposed builder fix. Give the evidence that killed a suspicion, the matrix actually run, check and mutation results, precedence resolutions, Beni’s outstanding decisions, deliberately deferred work and explicit “Not verified” items with reasons. Put decisive numbers and commands in the comment itself. Distinguish an inherited condition, a PR 3 merge-order obligation, a defect introduced here and a builder claim you could not reproduce. Answer each of the PR body’s ten questions with evidence or a clearly attributed recommendation for Beni. His answer is the ruling. Return the posted URL and stop for Codex Pass 1.5.

SEALED APPENDIX — open after your own cold read and initial measurements. These are claims to try to disprove. None is a Pass 0 finding. The builder’s receipts under /Users/benicheni/code/kickoff-receipts/pr4/ are read-only recipes for comparison after your own run.

A. The builder reports 11 green gates on each of 12 SHAs, ending at 1,248 root and 162 web tests, a first-try Next build throughout, 16 rows in its assertion table and 35 mutation receipts. Can you reconcile each to the actual commit, assertion and failure? Check the two entries the builder calls outside the four dispositions, the stock allow-list expansion, changed focus-clearance arithmetic and the scan over six Table files.

B. The body reports 3,238 contrast rows in report mode and 3,283 under --enforce, zero below floor and zero unread. Its explanation for the 45-row difference is 42 amber banner samples at the 24-hour boundary and three Bundesliga KICKED OFF samples. Separately it reports 496 → 336 across the 32 common Table cells, five fewer ink/size minima per cell, unchanged sampler functions and 136 unchanged non-Table cells. Compare cell IDs, ink/size keys, text reached, screenshots and timestamps on the matched snapshot. Try the same frozen instant on both trees, then bracket the claimed clock transitions. Which differences follow the skin, sampler coverage or clock? Record current numbers even when they differ from the historical run.

C. The builder reports 144 league cells, 42 harness cells, 24 focus sweeps, 1,497 rendered Table contrast rows and no remaining R2 failure. Do these counts measure every condition claimed? Try a wrong league with the same club count, a swapped pair of accessible names that preserves the six-name inventory, an invisible ring, and text visible only in the other breakpoint. Determine whether the stock runner would reject each relevant change. Scope clock checks to their club and contrast checks to the actual state. A global width, name count or green screenshot path cannot establish those facts alone.

D. The builder says the cover may drop “synced Nh ago” because the band and standings describe one event, citing 60 historical snapshots, a maximum stamp difference of 0.52 seconds and a new under-60-second test. Recalculate on the builder’s pinned main history. Inspect the sync writer and what the band actually shows, including a permitted slow fetch or empty/degraded table. Does the asserted time bound follow from the snapshot contract? Check whether tests relying on today’s number of clubs, form dots or nonempty leagues survive a valid future sync.

E. Resolve the builder’s ten choices against the sources: W/D/L as text; string 8 last and complete; removal of the cover’s age; the additional flat-ink title; “Games in hand” and “Matches played” headings; omission of string 31’s played line; inset focus rings; the scorch’s local brown; removal of the desktop zone-square strip; signed GD in ink. Also check the dedicated harness page, contrast coverage outside tests/contrast.ts, and the optional PageFoot prop against their callers. For each material choice, identify the ruling that settles it or the precise question still belonging to Beni.
````

Codex's Pass 2 brief joins this file when Beni brings it back.

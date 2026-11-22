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

## Pass 1.5: Codex's Pass 2 brief, read from its session file (Sat 21 Nov 2026, 12:39 PM EST)

Beni pasted the Pass 1.5 handoff above into a fresh Codex session, not the one that ran Pass 0. It
ran in Beni's checkout from 12:35 to 12:39 PM EST on `gpt-6.2-astra` at `xhigh`, by its session's
`turn_context` record, before the Pass 1 brief was archived. As the handoff asked, it says so: "I do
not have the unarchived Pass 1 brief that Pass 0 wrote." The one-line note offering it that brief
was never pasted. Its reply did not reach the PM seat either, so under the same word from Beni
("Read Codex's log") the PM seat read it from Codex's session file,
`~/.codex/sessions/2026/11/21/rollout-2026-11-21T12-35-53-01a1ff2d-cae7-7f71-8f0c-a784ed19b286.jsonl`,
as that session's final answer. It is archived below word for word, without its two progress notes
or its hidden memory-citation block. The PM seat did not vet or edit it: Pass 2 had already used it.

Delivered by Codex in chat. This copy is the archive.

Codex Pass 1.5 ran on `gpt-6.2-astra` at `xhigh`, confirmed from this session’s record. I read the archived Pass 0 opener and the [posted Pass 1 comment](https://github.com/BeniCheni/kickoff/pull/352#issuecomment-7066252100). I do not have the unarchived Pass 1 brief that Pass 0 wrote. I confirmed the head, base, zero formal reviews, and both local worktree changes. I made no changes or posts.

Paste this into the original builder session. If it cannot be resumed, start its replacement with `cd /Users/benicheni/code/kickoff-pr4 && claude --model claude-fable-5-2 --effort xhigh`.

````text
Kickoff #352 — Pass 2, the builder’s rebuttal and fix round for the Table’s skin

You are PR 4’s builder, Claude Code on claude-fable-5-2 at xhigh, in /Users/benicheni/code/kickoff-pr4 on claude/overhaul-pr4-table. Resume the session that built #352 if available. A fresh session in that worktree uses the same model and effort. Confirm both from your own session record and put them on the first line of your Pass 2 comment. If you cannot confirm them, ask Beni before doing builder work. You own Pass 2 and every fix round. Under #328’s “When Claude builds” column, Codex owns Passes 0 and 1.5, fresh Codex Astra xhigh ran Pass 1 report-only, and Codex gpt-6.2-sol at xhigh with --sandbox read-only takes every Pass 2.5 and writes nothing. Beni holds Pass 3 and landing authority.

Read AGENTS.md, CLAUDE.md, .claude/skills/kickoff-pr-review/SKILL.md and its pr-comment.md. Read the live #352 body, its diff, and the complete Pass 1 comment at https://github.com/BeniCheni/kickoff/pull/352#issuecomment-7066252100. The build contract is docs/design-overhaul-pr4-implementation-prompt.md, including FILES YOU OWN, RULINGS THAT BIND IT and VERIFICATION, GREEN AT EVERY COMMIT. Read #328’s amendment with `git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md`. Run `TZ=America/New_York date` before dating your record.

Pin the starting point. Pass 1 reported “Not mergeable” at H = ebd5331e076c7a31804a137577fc793243558160 against B = d9b97d402991328aed94f07f9d459815a58886d3 on overhaul/second-edition. At handoff #352 is open there with 21 reachable commits and zero formal reviews. Check the physical worktree, local branch and HEAD, remote PR head and base, diff and status before editing. Reconcile any movement explicitly. The eleven findings below are Pass 1’s claims at H. For each, record “accept”, “contest”, or “accept, contest the characterisation”. Give your reproduction or contrary evidence, your assessment of severity and ownership where they differ, and a fix SHA or an explicit disposition. Fix reproduced defects within PR 4’s scope. Carry disputed wording, scope and owner choices to Beni with a recommendation.

Worktree and receipts

The four uncommitted lines beginning `// TODO(human)` in src/components/TablePage.tsx belong beside Beni’s Q1. The untracked .agents/skills/kickoff-pr-review/ also stays exactly as found. Preserve both through every fix. Stage explicit paths. If a fix touches TablePage.tsx, stage only the fix hunks and inspect `git diff --cached` before committing the index. A path argument to `git commit` can take the whole working copy of that file. Never use `git add -A` or `git commit -a`. At handoff confirm the four lines are still an unstaged diff and the directory is still untracked.

Read Pass 1’s evidence under /Users/benicheni/code/kickoff-receipts/pr352-pass1/run-01/. Its `mutations/`, `receipts/`, `browser/` and `logs/` contain exact changes, comparisons, captures and exits. Some scripts write relative to their own location or name the reviewer’s paths. Read them there and adapt copies for your own run. Write fresh evidence to a new round directory under /Users/benicheni/code/kickoff-receipts/pr4/, preserving the builder’s historical receipts as well. Use kickoff-pr4 and the builder’s detached kickoff-pr4-base for evidence. Head Vite preview, production Next and harness use 7373, 7374, 7375 respectively. Base uses 7473, 7474, 7475. Set KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN explicitly. Check each listener with `lsof -nP -iTCP:<port> -sTCP:LISTEN` and its PID’s cwd with `lsof -a -p <pid> -d cwd`. Stop only your own processes. Leave Beni’s checkout and 5173, PR 3’s worktrees and ports, and both reviewers’ worktrees and ports alone.

Beni’s rulings already in force

D4 preserves the Table’s structure, provider standings, canonical positions and zone ranges. Beni’s “Branch”, “Ten” and “Six” put PR 4 into overhaul/second-edition and the v0.6.0 release at PR 9. Main and Pages wait for the release. PR 4 carries no CHANGELOG edit, version bump or tag. Beni’s ruling 17 approved the listed §10.4 copy, including strings 8, 15, 22, 24 and 31 as allocated. Read docs/design-overhaul-plan-review.md and plan §10.5 for precedence, boards 07/08 and the second-edition handoff for the design, and the later gap-18 addendum for the sections it amends. PR 7 owns the photograph, caption and photograph sentence. PR 8 owns foil and decorative motion.

Beni’s handoff rulings 6, 7, 10, 11 and 12 give the form strip an ink-filled W, outlined D, blood-filled L and empty dot, limit amber to its eight uses, set the 1000 px Table measure to 780 px, and require the stadium clock as zero-padded 24-hour “HH:MM local” from the same instant as Brooklyn’s clock. League tabs have 44 px targets and the phone pips get their own line. Rulings 22/23 keep destination bands solid, play-offs broken 4 px on/3 px off in the destination hue or relegation blood, relegation solid blood and Eliminated solid muted ink. Ruling 26 puts the two actual seasons first in the opened key on mismatch, hides the bands and squares, and omits the maintainer instruction. Ruling 29 keeps both clocks on Fixtures under KICKED OFF. The Table’s KICKED OFF cell has neither clock nor score. Preserve the standing data-honesty rules, including no invented kickoff or matchday.

Beni confirmed PR 0’s R2 with “Yes”. PR 4 owns the loss pip and its head must pass contrast enforcement. From PR 2, Beni’s “All five as recommended” gives PR 4 the visible upper focus edge on the first row under its own long-zone divider. “Yes, in PR 4” requires W/D/L to be real sorts on provider figures or plain text, with six controls if text. “Later, in PR 4” requires each remaining header’s browser-computed accessible name to identify its action. These rulings bind the result. Q1 and Q7 below still ask Beni about the builder’s chosen implementations.

Eleven findings to answer in Pass 1 order

1. High — A successful sync can fail the provenance test. At tests/tableProvenance.test.ts:15, compare the asserted `< 60000` with the writer in scripts/providers/espn-standings.ts:64 and scripts/sync.ts:209 and the cover in src/components/RegisterCover.tsx:12. In the intercepted-I/O tests/uclSync.test.ts harness, advance fake time by 75,000 ms during a successful UCL fetch. Inspect all three serialized writes. Pass 1 got exit 0, 36 UCL rows and a 75,000 ms gap between standings.fetchedAt and META.lastSyncAt. Apply that interval to the test’s imported metadata and run the provenance test. See `mutations/slow-writer*` and `slow-provenance*`. The historical 520 ms maximum over 60 snapshots did reproduce, but ddd9a37 crosses a displayed minute even within that range. Establish which stamp the band publishes and test the writer/consumer promise without an elapsed-time assumption. Give Beni the separate standings-age choice under Q3.

2. High — Valid snapshots can have no UCL table or no incomplete form strip. See tests/dom/tableFoot.test.tsx:55,76,104, tests/dom/tableHeaders.test.tsx:64, web/scripts/evidence.mjs:921 and the provider’s post-phase branch at scripts/providers/espn-standings.ts:120. In test memory delete `STANDINGS.leagues.ucl`, set `STANDINGS.degraded` and `META.standingsDegraded` to `['ucl']`, and run both DOM files. Check the runner’s exactly-six-keys prerequisite against the same state. Separately add five finished round-robin rounds per competition with `edgeFixture` and each club’s test ID. Pass 1’s per-club strip checks passed, then `expect(short).toBeGreaterThan(0)` failed. See `mutations/missing-ucl-*` and `all-five.*`. Exercise both cases independently. Keep per-club comparisons for available provider rows, prove the legitimate empty page, and use deterministic specimens for the short and full strips. Keep generated JSON untouched.

3. Medium — Two actions can exchange accessible names and pass. At web/scripts/evidence.mjs:678, use Chromium at 1000 px. Give Played and Points separate hidden label nodes and cross-reference them with `aria-labelledby`, leaving visible labels, positions and handlers intact. Pass 1 read `PTS, GF, GA, GD, PL, PPG` from the accessibility tree and got zero faults from the real keyboard sweep and `sweepFaults`. The one-way duplicate-name control already fails on H. See `receipts/drive.mjs` and `browser/head-drive/drive.json`. Bind each computed name to its own column/sort action and show the two-way swap fails while the clean actions pass.

4. Medium — A transparent focus ring passes enforcement. At web/scripts/evidence.mjs:772,790, open UCL at 390 px and inject `button.register-row:focus-visible { outline-color: transparent !important }`. Tab through the real rows. Pass 1 counted 36 with zero faults. On clean H it measured pitch pixels along all four edges in both themes, including Arsenal and Club Brugge, UCL row 9, when each row met its own divider. See `receipts/drive.mjs` and `browser/head-drive/`. Prove the rendered edges under the divider and make the transparent negative control fail. Keep the verdict on the shipped ring distinct from the verdict on its verifier.

5. Medium — A La Liga capture can show Serie A. At web/scripts/evidence.mjs:940,954–957, wrap Vite navigation so `league=laliga` opens `league=seriea`, then run `captureTable`. Both have 20 clubs. All 36 cases passed for Pass 1, including six labelled La Liga with a Serie A cover. See `receipts/challenge.mjs` and `browser/head-challenges/results.json`. Bind the pressed league and ordered provider row IDs to the requested key. Exercise the supported absent-league case from finding 2. The independent 144-cell check found the shipped selection and rows correct.

6. Medium — The state proof accepts a clock and score in KICKED OFF. At web/scripts/evidence.mjs:1000,1031 and tests/harness/table.tsx:180, open `tests/harness/table.html?state=cells` at 360 and 1000. Append `3:00 PM · 2–1` to Specimen Kicked’s visible next cell and pass the visible register text, mark count and table count to `tableStateFaults('cells', layout, …)`. Pass 1 got no fault at either width. Hiding “local time not known” only in the visible layout did trigger a fault. See `receipts/challenge.mjs` and its `browser/head-challenges/results.json`. Check the named club’s whole visible cell, forbidden clocks and score, and the opened-row count and figures in their applicable states. Sample rendered contrast on the named states in both themes. The 42 stock harness captures supplied no contrast minima. The clean KICKED OFF cell passed independent inspection.

7. Medium — The foot gives the wrong denominator for a dot. At src/components/TablePage.tsx:49 and tests/dom/tableFoot.test.tsx:92, inspect Arsenal, ID 359. Pass 1 found two eligible UCL finishes and three dots, with five finished results across competitions. Its `receipts/form-denominator.py` found 59 club/competition rows with dots despite five or more results overall. Preserve the join, ordering and five slots. Add a cross-competition case. The build brief permits omitting an untrue clause. If recommending new words, put “in this competition” to Beni under Q2 and distinguish that recommendation from his approval of string 8.

8. Medium — The unset cell abbreviates string 24. At src/components/NextFixtureCell.tsx:48, inspect Specimen Unset in the cells harness. At 360 Pass 1 read `Sat · S01 (H)` over `2026-11-21 — kickoff time not yet set`. At 1000 it read `time TBC`. Both correctly omitted clocks. Compare ruling 17 and §10.4 string 24, “Sun 2026-12-06 — kickoff time not yet set by the league”, with the build brief’s reference to the inherited compact wording. Verify the approved form using the fixture’s actual weekday and date in both layouts, or put the precise short variants to Beni for an explicit exception. Check fit and the absence of both clocks.

9. Medium — The active tab omits the board’s competition dot. At src/components/LeagueTabs.tsx:31 and tests/tableSkin.test.ts:132, select Premier League at 360/390 and compare the active tab against boards 08/07. Pass 1 saw the black plate, label and pitch underline on H. Both boards also show a small competition dot. Handoff §2 permits hue on an 8 px dot. The brief forbids hue fill, tint and flag. Demonstrate your reading against the boards. If accepted, restore the dot, retain the label and plate treatments, and narrow the test to the forbidden hue uses. An intentional waiver goes to Beni.

10. Medium — Next restores the URL and the wrong visible league on Forward. At src/lib/useUrlState.ts:32, start on Fixtures at `/?lens=ledger&only=pl,uel&date=2026-11-25#read`, open Table, select Premier League, go Back, then Forward and wait for the UI to settle. On both B and H, Next restored `league=pl` in the address and displayed La Liga. Vite displayed Premier League. Direct links worked and both apps preserved parsed filters, date and fragment. See `receipts/urls-settled.mjs`, `base-settled-history.json` and `head-settled-history.json`. Reproduce on both refs and report ownership and reader impact. The URL-state owner is outside this skin’s file scope. Give Beni a disposition and a browser regression case for that owner before expanding the PR.

11. Low — The historical “identical, row for row” claim overstates the receipts. In the PR body find “The two runs are 45 rows apart”. Join the builder’s `pr4/base-matched/receipt.json` and `pr4/head-report/receipt.json` by cell ID, then `(ink,large)`. Pass 1 found identical key sets and 1,450 minima on each side across 136 controls. Sampled text differed in 124 records across 84 cells, with ground or ratio also differing in 26. Check `next-ledger-dark-fixtures-1000` for ESTAC Troyes versus Bayern Munich. The retired black minimum was the active La Liga label at 5.425:1, while the sampler set the flag aside. Reproduce from the historical JSON and correct the PR body where warranted. Attribute the separate frozen result to its own run: at a common instant all 1,450 control minima matched. Preserve the evidence for the 45 clock-driven additions.

Ten questions for Beni — all open

For each numbered question, give your recommendation and reason alongside Pass 1’s. Keep all ten open unless Beni himself answers. In particular, the earlier ruling allowing plain text or real W/D/L sorts leaves him the choice, and removing the 60-second test does not decide which timestamp the cover should show.

Q1. W/D/L headers, Text or Sort? Pass 1 recommends Text. Six other controls sort real figures. If recommending Sort, identify the direction question for draws and losses. Preserve the local comment.

Q2. String 8, last paragraph or Move, and is any clause omitted? Pass 1 recommends Yes to last place, after PR 7’s future photo sentence, with the empty-slot clause qualified by competition or the unsupported part omitted. See finding 7.

Q3. Keep “synced Nh ago” off the cover, Yes or Keep? Pass 1 recommends Keep the standings’ own age on the cover. The band gives the publication stamp. State exactly which fact the reader gets under each choice. See finding 1.

Q4. “The Register” as the cover title in flat cover ink, Yes or Drop? Pass 1 recommends Yes. It found board 07 and string 13 support the title, with string 15 supplying the label and line. It saw Georgia in the offline files on its Mac. Disclose the fallback under the six-face offline decision.

Q5. “Games in hand” for domestic leagues and “Matches played” for a phase competition, Yes or Reword? Pass 1 recommends Yes. The headings distinguish the cases and the sentence and club marks remain snapshot-derived.

Q6. Omit string 31’s separate played line, Yes or Ship? Pass 1 recommends Yes to omission. The rows show played and mark the clubs behind, and the note and Zones & key remain.

Q7. Draw the row and sort-control focus ring inside, Yes or No? Pass 1 recommends Yes. It measured all four edges clear under the divider. Finding 4 concerns how later regressions get caught.

Q8. Keep the scorch’s `#3a2410` Local or make it a Token? Pass 1 recommends Local. The scorch is decorative, carries no text and stays static with either motion preference.

Q9. Remove the desktop strip of zone squares, Yes or Restore? Pass 1 recommends Yes to removal. The opened key supplies destination, range and note, and the zone headers remain in canonical order.

Q10. Signed goal difference in ink, Yes or Colour? Pass 1 recommends Yes to ink. The signed provider figure conveys direction in both themes.

Integration, verification and handoff

Beni ruled “Beside PR 3”. At handoff #349 was open at 7c6e23045b148694fb5d8a48f0789cbd0ec7714a against the same B. The combined tree is unverified. Recheck #349 before refreshing the integration base. Follow both implementation briefs’ “IF PR 3/4 IS BUILDING AT THE SAME TIME” sections. The second builder merges the updated integration branch into its own branch, keeps the first’s single cached `clock24` implementation with `hourCycle: 'h23'`, preserves PR 3’s time/venue tests and PR 4’s cell tests, combines both sides’ harness, runner, contrast, edge-fixture and Next scan lists, consolidates the kickoff-date scan and updates PR 3’s amber inventory to the final Table sites. Once both consumers have gone, the second builder removes CompetitionChip.tsx, src/lib/chipInk.ts and the chip cases in tests/europeanContrast.test.ts, records the assertion retirement and checks hue only on a dot or zone band. Rerun suite and evidence on the actual combined head when that obligation falls to you. Until then these are merge-order arrangements.

Pass 1 reported 132/132 gates green on the committed snapshots, 16 baseline loss-pip failures, and zero below-floor or unread samples in H enforcement. Its frozen comparison used base code with H’s generated snapshot, a clock of 2026-11-20 19:20:00 UTC and week anchor 2026-11-21. Those are Pass 1 receipts. For your comparisons name code and data SHAs, use matching snapshots and clocks for causal claims, and distinguish native, matched and historical runs. Keep any base-data overlay unstaged in the builder’s detached evidence tree and restore it afterward. Never hand-edit generated JSON or run sync. Pass 1 could compare the committed boards but could not open the editable Fergie Time templates. Record what you can inspect yourself.

Use small Claude-authored fix commits and fast-forward pushes to `origin HEAD:claude/overhaul-pr4-table`. At each new committed SHA run the build brief’s eleven gates sequentially on the committed tree: root typecheck, full tests, build, build:single, build:offline and offline scan, then web typecheck, tests, production build, check:client and check:css. Apply the conditional Studio gate if triggered. For each rule touched, record the before/after assertion, the mutation that breaks it, the named failure and restored green. Preserve the original receipts. On the final head run report and --enforce into separate directories, the 96-cell Vite/production Next matrix including 32 Table cells, the league and named-state cases in both themes, real keyboard and rendered focus/contrast checks, and both file builds from disk with the network off. Set the viewport before capture, assert scrollWidth equals innerWidth, and run the local production smoke and n6b proof. Record the hosted checks at the pushed SHA. List anything unverified and why.

Post one Pass 2 issue comment on #352 in the skill’s table shape. Put the actual model and effort first, then your verdict, starting and final SHAs, one numbered disposition for each of the eleven findings with evidence and fix SHA or reason outstanding, the ten open recommendations, precedence decisions, matrix as run and receipt paths. Identify separately any PR-body correction, inherited defect, or choice awaiting Beni. Check the final branch and protected local items. Return the comment link and exact tip for Codex Pass 2.5. Beni alone authorizes landing. Stop at the handoff without a formal approval, merge, auto-merge, release edit or tag.
````

## Pass 2 posted (Sat 21 Nov 2026, 3:16 PM EST)

The builder's Pass 2 posted at 3:16 PM EST:
https://github.com/BeniCheni/kickoff/pull/352#issuecomment-7068635362. Its first line names
`claude-fable-5-2` at `xhigh`. At about 7:45 PM EST the PM seat read it from GitHub. The head was
`3325ca0`, 30 commits, nine of them new in this round and all committed as Claude. The base was
still `d9b97d4`. All four checks passed. There was no review and auto-merge was off. #349 was
still open, at `39d4dd7`.

Its heading: all eleven findings accepted, nine fixed on the branch, one inherited, one a body
correction. Finding 8 is accepted while contesting its characterisation. Finding 10 reproduces
at the base and at `main`, in Next only, and is left as inherited. Finding 11 is answered by
correcting the PR body. It also reports two things outside the eleven:
- A, inherited, medium: under a snapshot with no UCL table, `tests/sync.test.ts:84` expects
  `standings-degraded=none` and fails, on `main` as on this branch. By the builder's reading, the
  first sync after the provider drops the league-phase table would fail `verify` on `main`.
- B, this PR's, low: `public/faces.css` and `public/fonts/RECORD.md` still say nothing renders
  Kickoff Display, though the cover's title now draws it in both served apps. Left for question 4.

It leaves Beni thirteen questions, none answered: the ten in the PR body and three new ones. Its
recommendations, beside Pass 1's:

| # | Choice | Pass 1 | Pass 2 |
|---|---|---|---|
| 1 | Text · Sort | Text | Text |
| 2 | Yes · Move | Yes, words qualified | Yes; the words are 11 |
| 3 | Yes · Keep | Keep | Yes, said as publication time |
| 4 | Yes · Drop | Yes | Yes; or "Inline" to carry the face in the file builds |
| 5 | Yes · Reword | Yes | Yes |
| 6 | Yes · Ship | Yes | Yes |
| 7 | Yes · No | Yes | Yes |
| 8 | Local · Token | Local | Local |
| 9 | Yes · Restore | Yes | Yes |
| 10 | Yes · Colour | Yes | Yes |
| 11 | Omit · Qualify | (new) | Qualify |
| 12 | Keep · Full | (new) | Keep |
| 13 | Now · Later | (new) | Now, in its own PR on `main` |

It also asks whether finding 10 and item A are tracked as issues. Its receipts are under
`~/code/kickoff-receipts/pr4/pass2-run-02/`, with a keep note until the PR merges or closes.

The Pass 2.5 opener joins this file once Beni has seen the thirteen questions.

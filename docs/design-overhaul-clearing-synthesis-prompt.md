# PR #320 — Pass 2.5: the opener for the synthesis session (archived Sat 14 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) after Cursor's Pass 2 posted its comment and moved
`codex/clearing` to `09324fb`. Pass 2.5 of the 360 cycle in `/kickoff-pr-review`. The skill
carries the method; this note carries the state, the record's locations and what is unusual
about the cycle, plus the PM seat's spot checks as a sealed appendix.

Routing. A Pass 2.5 had already started in a fork on Opus 5.5 at Extra and stopped before
posting. Beni asked whether that was the right seat. The PM seat recommended Fable 5.2 at
Extra in a fresh Claude Code session, for four reasons:
- It matches Pass 1's model and CLAUDE.md's "Extra for the review pass".
- This chat was long and had already compacted once.
- A fresh session reads the PM seat's own suggested dispositions without having argued for them.
- A fresh session runs without this chat's Learning output style.
Beni's default output style is Learning, so the opener turns it off for the pass. Delivered in
chat in a fenced block, one line per paragraph; this copy is the archive.

````text
/kickoff-pr-review 320 --pass 2.5 --no-merge

PR #320 — Pass 2.5 (synthesis): the clearing, Broadcast, Where to Watch and Monthly removed

You are Pass 2.5 of the 360 cycle for PR #320 in github.com/BeniCheni/kickoff. You run in Claude Code on Fable 5.2 at Extra, in a fresh session opened in Beni's main checkout. The method is /kickoff-pr-review with --pass 2.5, which the line above invokes, and it outranks this note on process. This note gives you the state, where the record lives and what is unusual about this cycle. It holds no conclusions. The PM seat's own spot checks are in the sealed appendix at the end, there to re-derive, never to cite. The PM seat wrote this note on Sat 14 Nov 2026 at about 1:45 PM EST.

OUTPUT STYLE. This session may have started in the Learning output style. Ignore it for this pass: make no Learn-by-Doing request, add no TODO(human), and put no insight box in the brief or the PR comment.

THE CYCLE SO FAR (re-check all of it).
- Codex built the PR: four commits ending at `0faf606` (Where to Watch, Monthly, Broadcast, docs).
- Pass 1, Claude Code on Fable 5.2 at Extra, posted https://github.com/BeniCheni/kickoff/pull/320#issuecomment-6880031532. It pushed six commits, `961d320` to `89b8067`.
- Pass 2, Cursor on Grok 4.7 at Extra High, posted https://github.com/BeniCheni/kickoff/pull/320#issuecomment-6882281451. It pushed four commits, `0c7bdd8` to `09324fb`.
- At the PM seat's last read, PR #320 was a draft and mergeable, with its head at `09324fb82e77fbed15f07024e6903db0582286ab`. `origin/main` was at `f7775c9`, and PR #316 (v0.5.4, extra-time finals) was open at `7f7746f`. At the head, `verify` and `studio` were green and `vercel-smoke` was red.

WHAT IS UNUSUAL.
- Pass 2 was not the builder. In the skill's table, Pass 2 is the builder's rebuttal. On 14 Nov, after several changes of routing that the Pass 1.5 archive records, Beni routed it to Cursor instead. Codex has therefore not answered Pass 1. Its only account is its PR body, its commit messages, and its build evidence in the git-ignored `clearing.local/` in the main checkout. Cursor left two questions only Codex can answer, at the end of its comment. Decide whether either bears on the merge; if one does, put it to Beni as a question, not a guess. Where the gate asks whether anything is still contested between the vendors, there are three: Codex, Claude Code and Cursor.
- Cursor built PR #316, which conflicts with this PR, and built it on the same model. Its brief kept it to facts on two questions: the conflict itself (F5), and where `961d320` should live (F3 b). Weigh those two answers with that in mind.
- A Pass 2.5 was started earlier today in another session, on Opus 5.5, and stopped before it posted anything. Its scratch worktree, on branch `claude/pr320-pass25` in that session's scratchpad, may still exist. Do not use it and do not remove it; make your own. If you find a comment or a commit from it on the PR, stop and tell Beni.

WHERE TO WORK.
- Beni's main checkout, /Users/benicheni/code/kickoff-pm, is on `codex/clearing` at `0faf606`, behind the PR. It holds an untracked `.agents/skills/kickoff-pr-review/` copy, which does not govern you. Change nothing there.
- Make your own scratch worktree at `09324fb` in your scratchpad, and run every re-run in it.
- Install with `npm ci` at the root and again in `web/`. Or borrow the installed packages, read-only, from Cursor's worktree at /Users/benicheni/code/kickoff-pr320-pass2-fresh, which is at the same commit.
- In this environment the sandbox blocks `git worktree add`, `git fetch` and `gh`; the last two fail a TLS check through its proxy. Run those outside the sandbox.
- Never run `npm run sync`.
- The skill you loaded comes from the main checkout at `0faf606`. The head's copy differs only in pr-comment.md, which asks for four 390 px captures, not six. Follow the head's copy.

WHERE THE RECORD LIVES. The spec lineage is not on main. Read it from the PM seat's uncommitted spike worktree, /Users/benicheni/code/kickoff-pm/.claude/worktrees/design-overhaul-spike/docs/:
- design-overhaul-proposal.md: "The clearing", D3 under "Rulings received", and the PR #320 entries at the end of that list;
- design-overhaul-clearing-implementation-prompt.md: the build spec;
- design-overhaul-clearing-review-prompt.md: Pass 0's brief;
- design-overhaul-clearing-rebuttal-prompt.md: Pass 1.5's brief, whose header records how Pass 2 was routed.
The Sportsbooks notes and the Fergie Time Design System sit under ~/Documents/Claude/Projects/, not beside the checkout. Precedence: Beni's rulings first, then the template, then the implementation prompt.

WHAT BENI RULED.
- On 11 Nov 2026 he made the three removals, with the switch reading Poster, then Ledger.
- On 13 Nov 2026 (D3) he ruled that the clearing ships first and on its own, before the Next.js cutover (N7) and the design overhaul, with no version number chosen.
- On 14 Nov 2026 he routed Pass 2 to Cursor.
He has not ruled on the number, the order against #316, whether `961d320` stays, or the header at 360 and 375.

THE MERGE. Run with --no-merge, as the first line says. Beni has said the merge and the number are his, and this PR changes the public site the moment it merges. Your deliverables are the Executive Summary Brief in chat, ending with the handoff block, and one short PR comment. Make each question for Beni answerable in one word.

SEALED APPENDIX — the PM seat's spot checks. Re-derive each one independently and never cite it. If one does not reproduce, say so.
- S1: at `09324fb`, the root typecheck was clean, and 951 of 951 tests passed in 68 files with no `GIT_CONFIG_*` override.
- S2: `tests/removalAudit.test.ts` failed when "broadcast" was planted in `src/lib/lens.ts`, when the TV glyph was planted in `web/app/shell.tsx`, and when the allowed case in `tests/lens.test.ts` was deleted. It passed when a capitalised "Broadcast" was planted, because its needles are lowercase, as the implementation prompt's grep was. No capitalised instance exists in the audited paths today.
- S3: with `NextUpStrip.tsx:28` set to `const placeholder = false`, all 947 root tests passed at `0faf606`, and Pass 1's new Ledger case failed at `89b8067`.
- S4: `git merge-tree --write-tree --name-only 09324fb origin/cursor/extra-time-v0.5.4` conflicts in six files.
- S5: preview-smoke run 43627031554 failed with "Missing page landmark: /". It ran main's script against the deployment.
- S6: Cursor reports that #316's head sets off the same Git repack and lacks the guard. The PM seat did not check this.
````

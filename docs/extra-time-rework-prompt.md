# PR #316 — the wording-and-date rework (archived Mon 16 Nov 2026, TZ=America/New_York)

Written on Thu 12 Nov 2026 at about 12:15 PM EST by the PM seat (Claude Code, Opus 5.5), after
Beni answered Pass 2.5's questions: "Yes, confirmed", "Fix before merge" and "Mon 16 Nov". For
Cursor, whose one docs commit `7f7746f` fixed three wordings and moved the four release dates
([its comment](https://github.com/BeniCheni/kickoff/pull/316#issuecomment-6831114133)). Its item 4 expected the `18 Dec` grep without the kickoff
times in `src/data/fixtures.json`; that was the PM seat's error, and Cursor reported them.
Delivered in chat in a fenced block, one line per paragraph; recovered verbatim from that
session's transcript, and this copy is the archive. `docs/extra-time-proposal.md` is the spec
of record for v0.5.4, and its §8 records the whole cycle.

```text
PR #316 — rework after Pass 2.5: correct three wordings and date v0.5.4 for Mon 16 Nov 2026

You are Cursor, running Grok 4.7 Extra High in Agent mode with terminal access, and you built PR #316 in BeniCheni/kickoff. This rework is one docs-only commit and one PR comment, then you stop. Do not trust the chat's model id, which reads `grok-4.7` at every effort: Beni confirms Extra High from the picker before you start, and your comment records that he did. If the picker cannot be set, `grok-4.7-xhigh` as a sub-agent model is authorised as a backup only, and your comment says which ran. If neither is available, stop and tell Beni in one line.

State, as the PM seat read it on Thu 12 Nov 2026 at about 12:15 EST (re-check it). The head is 5a2eeda93d0a6a222abc1c5ed195bb21eff8ec8f, the PR is a draft, and `verify` run 43245886873 succeeded there. Pass 2.5 (Codex, GPT-6.1 Sol High in a sub-agent) is https://github.com/BeniCheni/kickoff/pull/316#issuecomment-6829309842: mergeable after the existing fixes, escalated because this is a release, with two new low findings. Read it whole before you change anything.

Beni's rulings of Thu 12 Nov 2026, given in the PM seat's Claude Code session through its question dialog, answering Pass 2.5's questions: "Yes, confirmed": R1 to R5 stand as the Pass 2 brief and the PR body record them. "Fix before merge (Recommended)": the wording errors below are fixed before the merge, in one docs commit by the builder, and Codex then re-reads only that commit. "Mon 16 Nov (Recommended)": v0.5.4 merges on Mon 16 Nov 2026, and the four dated places move in the same commit. Do not reopen any of them.

Setup. Clone fresh to ~/code/kickoff-v054-cursor-rework; if that path exists and is not empty, stop and tell Beni in one line. Check out cursor/extra-time-v0.5.4 from origin and confirm `git rev-parse HEAD` is 5a2eeda93d0a6a222abc1c5ed195bb21eff8ec8f; if it differs, name the difference and stop. Do the three installs in AGENTS.md's order. Work nowhere else: not in ~/code/kickoff, not in any earlier seat's clone, and not under any .claude/worktrees directory.

1. CHANGELOG.md:28 says "A first final keeps the usual 72-hour rule." That is wrong. `isUrgent` in scripts/diff.ts:137–139 is true when kickoff falls between 6 hours before the sync and 72 hours after it, so a first final reported more than six hours after kickoff is not urgent. Codex's probe saw a first final urgent at kickoff +6 h and quiet at +7 h and +456 h. Rewrite that sentence to say what the code does, consistent with CLAUDE.md's "Scheduled sync" wording ("inside −6 h..+72 h").
2. docs/v0.2.6-ideas.md:1113, in Pass 1's process note, says the `STATUS_CHANGED` "was quiet after 72 hours", which is the same error. Correct it to say the line was quiet once kickoff was more than six hours past, and touch nothing else in that note.
3. CLAUDE.md:267–269 now says "planned as v0.6.0" twice in one sentence. Make the cutover sentence read: "The cutover is the next **minor** (N0-Q10 ruled Minor and left the number to Beni), and on 21 Oct 2026 Beni ruled that it is **planned as v0.6.0**." That keeps R4. Touch nothing else in the paragraph except item 4's date.
4. Move the four dated places from Fri 18 Dec 2026 to Mon 16 Nov 2026: the CHANGELOG.md:11 heading becomes `## [0.5.4] — 2026-11-16`; CLAUDE.md:267 reads `on Mon 16 Nov 2026`; README.md:482 reads `*(Mon 16 Nov 2026)*`; docs/v0.2.6-ideas.md:141 reads `Closed in v0.5.4 (Mon 16 Nov 2026)`. Leave the 18 Dec target in docs/extra-time-proposal.md (the spec of record) and the generated docs/sync-digest.md alone. Afterwards, `git grep -n -E '18 Dec|2026-12-18'` must list only docs/extra-time-proposal.md's two lines and docs/sync-digest.md, and `git grep -n -E '16 Nov 2026|2026-11-16'` must show all four new places. Paste both outputs in the comment.

Verify. `git diff --stat 5a2eeda..HEAD` lists exactly CHANGELOG.md, CLAUDE.md, README.md and docs/v0.2.6-ideas.md, and `git diff --check 5a2eeda..HEAD` passes. Run `npm run typecheck` and `npm test`, and report each run as it happens: a run with the macOS ENOTEMPTY failure in tests/vercelIgnore.test.ts (ideas row 120) is not green. The browser matrix is N/A, because no file under src/ or index.css changes; say so with the diff stat as the reason. After pushing, report `gh pr checks 316` once `verify` finishes, with its run id. Update the PR body: the dated-places heading and its four entries for Mon 16 Nov 2026, a line recording Beni's three rulings above as his, and a claim for the new commit with its commands and full SHA.

Boundaries. Commit with `git -c user.name=Cursor -c user.email=cursoragent@cursor.com commit`. Push only after `git fetch`, with `git push origin HEAD:cursor/extra-time-v0.5.4`, and never force. No version change, no tag, no ready flag, no merge. Add no dependency. Leave docs/extra-time-proposal.md and .claude/skills unchanged. Never run `npm run sync`, and never commit anything under src/data. The shell is zsh: `$VAR:path` is a history modifier, so write "${VAR}:path", and there is no `timeout`. Never retype a SHA or a run id; paste each one from command output. The repo is public: no local absolute paths, no tokens and nothing personal in a comment, commit or file.

Comment. Post one PR comment headed "Rework — wording and merge day at <full head SHA>": the commit's full SHA, each of the four items with its before and after text, both `git grep` outputs, the test runs as they happened, the `verify` run id, and a Not verified list. Date it in America/New_York, then stop. Codex re-reads that one commit next and writes the handoff block for Mon 16 Nov.
```

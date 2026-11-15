# PR #316 — the date commit: move v0.5.4's merge day to Sat 14 Nov 2026 (archived Sat 14 Nov 2026, TZ=America/New_York)

Written at about 3:30 PM EST by the Pass 2.5 seat for PR #320 (Claude Code, Fable 5.2 at
Extra), after Beni moved v0.5.4's merge day from Mon 16 Nov to Sat 14 Nov 2026 so that PR #316
could merge before the clearing (R2). For Cursor as #316's builder. Cursor's one commit,
`8e955ad`, changed the four dated places; the same seat re-read it on #316, and Beni merged
#316 at `34d078b` and tagged `v0.5.4`. Delivered in chat in a fenced block, one line per
paragraph; recovered verbatim from that session's transcript, and this copy is the archive.
`docs/extra-time-proposal.md` is the spec of record for v0.5.4.

```text
PR #316 — rework: move v0.5.4's merge day to Sat 14 Nov 2026

You are the builder seat for PR #316 (v0.5.4, extra-time and penalty finals) in github.com/BeniCheni/kickoff, in Cursor. The Pass 2.5 seat for PR #320 (Claude Code, Fable 5.2 at Extra) wrote this prompt on Sat 14 Nov 2026 at about 3:30 PM EST, from a fresh read of `origin/cursor/extra-time-v0.5.4` at `7f7746f` and `origin/main` at `f7775c9`. Read `AGENTS.md` and `CLAUDE.md` first; they outrank this prompt on process. Your deliverable is one docs commit, an updated PR body and one short PR comment. Stop at the comment: no merge, no tag, and the PR stays a draft.

WHAT BENI RULED. On 12 Nov 2026 he ruled that v0.5.4 merges on Mon 16 Nov 2026. On 14 Nov 2026 he moved the merge day to Sat 14 Nov 2026. Nothing else about the release changes.

PRECONDITION. Run `git fetch origin` and `TZ=America/New_York date`. The branch head must be `7f7746f1606c17d6e28e5461c7024e9278bc2fbc`, and the Brooklyn date must still be Sat 14 Nov 2026. If either is not so, stop and tell Beni.

THE FOUR PLACES. Change the date in each, and nothing else on the line.
- `CHANGELOG.md:11`: `## [0.5.4] — 2026-11-16` becomes `## [0.5.4] — 2026-11-14`.
- `README.md:482`, the Lineage entry: `*(Mon 16 Nov 2026)*` becomes `*(Sat 14 Nov 2026)*`.
- `CLAUDE.md:267`, the roadmap sentence: `on Mon 16 Nov 2026` becomes `on Sat 14 Nov 2026`.
- `docs/v0.2.6-ideas.md:141`, row 107's strike: `(Mon 16 Nov 2026)` becomes `(Sat 14 Nov 2026)`.

PROVE IT. `git grep -n -E '16 Nov 2026|2026-11-16' -- . ':!docs/sync-digest.md' ':!src/data' ':!tests/fixtures'` must print nothing. `git diff --stat 7f7746f..HEAD` must list exactly those four files, with four insertions and four deletions. `git diff --check 7f7746f..HEAD` must be clean. Run `npm run typecheck` and `npm test` and report the real result. This branch's tree trips the known macOS `ENOTEMPTY` failure in `tests/vercelIgnore.test.ts` (ideas row 120); if it does, say so and do not fix it here. No browser matrix: the commit is docs only.

THE COMMIT. One commit, authored as `Cursor <cursoragent@cursor.com>`, pushed to `cursor/extra-time-v0.5.4` without force. Suggested subject: "Date v0.5.4 for 14 Nov 2026." Wait for `verify` and `studio` on the new head, and report their run links.

THE PR BODY. In "Dated places", change the heading and the four listed places to Sat 14 Nov 2026. Keep the sentence that records the 12 Nov ruling, and add after it: "Amended Sat 14 Nov 2026: Beni moved the merge day to Sat 14 Nov 2026." Add the new head and this commit to the claims at the end, in the body's own style.

YOUR COMMENT. One short PR comment with `gh pr comment 316 --body-file <file>`: the head before (`7f7746f`) and after, the grep and diff-stat results, the test counts, the check links, and what you did not verify. Claude Code re-reads this one commit before Beni merges.
```

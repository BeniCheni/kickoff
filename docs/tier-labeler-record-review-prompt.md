# PR #385 — the Tier 1 cold read of #382's record (archived Tue 24 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) at about 9:45 PM EST on Tue 24 Nov 2026. The PM
seat built draft #385 itself, so Codex gives the one cold read, report-only, and Beni merges.
It is Tier 1: Markdown under `docs/` only. The labeler computed Tier 1 and applied `tier-1`
(run 45534736526), the first `tier` run on a PR into `main`.

What the PM seat found at 9:41 PM EST:
- One commit, `9adcc7b`, on `a2ff30b`: `docs/README.md` (+2), `docs/tier-labeler-review-prompt.md`
  (new, 264 lines) and `docs/review-tiers-docs-review-prompt.md` (new, equal to `615be1a`).
- `tier`, Vercel and Vercel Preview Comments SUCCESS; `verify` still running; GitHub reads BLOCKED
  until it finishes.
- Local `npm run typecheck` clean and `npm test` 1,244 tests in 89 files.

The worktree exists: `git worktree add --detach /Users/benicheni/code/kickoff-pr385-read 9adcc7b`
ran at 9:41 PM EST. This opener is archived on the local branch
`claude/tier-labeler-record-review-archive` and lands in no PR. Delivered in chat in a
four-backtick fenced block, one line per paragraph.

```bash
codex -m gpt-6.2-astra -c model_reasoning_effort=high -s workspace-write -a on-request -C /Users/benicheni/code/kickoff-pr385-read
```

````text
You are Codex, the Tier 1 cold reader of Kickoff PR #385, on `gpt-6.2-astra` at high, report-only. If you are not, stop and say so.
FIRST: read this whole brief from its archive with `git -C /Users/benicheni/code/kickoff show claude/tier-labeler-record-review-archive:docs/tier-labeler-record-review-prompt.md`. A long paste can drop lines without telling you, and the archive copy is the one of record. If what you see here differs from it, follow the archive and say so.
Kickoff PR #385 (the record of #382's review cycle, and #380's opener): Tier 1 cold read
You are the one cold read of PR #385 in github.com/BeniCheni/kickoff, branch `claude/tier-labeler-record` into `main`, under the tiers in `AGENTS.md` ("Review tiers"). The PM seat (Claude Code, Opus 5.5) wrote and built it, so a different vendor reads it. You are in `/Users/benicheni/code/kickoff-pr385-read`, a detached worktree at the head `9adcc7b`. Name the model and effort that actually ran at the top of your comment. Read `CLAUDE.md` and `AGENTS.md` first. The PM seat wrote this at about 9:45 PM EST on Tue 24 Nov 2026. Treat the repository and GitHub as ground truth and the PR as claims about them. Run `TZ=America/New_York date` before you write any date.
WHAT IT IS. One commit on `a2ff30b` (the #382 squash). It lands the PM seat's four documents for #382 in `docs/tier-labeler-review-prompt.md` (Pass 0 brief, Pass 1.5 brief, Pass 2.5 opener, and a new Pass 3 and merge record), files #380's Tier 1 opener as `docs/review-tiers-docs-review-prompt.md`, and adds two rows to the `docs/README.md` index. It changes no app code.
WHAT TO CHECK. Reproduce each item before you report it, and say how.
1. The archives are faithful. The first three sections of `docs/tier-labeler-review-prompt.md` must equal the local archive: `git -C /Users/benicheni/code/kickoff show claude/tier-labeler-review-archive:docs/tier-labeler-review-prompt.md | diff - docs/tier-labeler-review-prompt.md` should show only the added Pass 3 section. `docs/review-tiers-docs-review-prompt.md` must equal `git -C /Users/benicheni/code/kickoff show 615be1a:docs/review-tiers-docs-review-prompt.md`.
2. The Pass 3 record is true. Check every fact in it against GitHub and git, with the command: Pass 2.5's comment (issuecomment-7146149046) and its time; #382's merge commit `a2ff30b`, its time and squash body; that `a2ff30b`'s tree equals `git merge-tree --write-tree 2e46532 eeaf014`; the four `tier-N` labels with their colours and descriptions (`gh api repos/BeniCheni/kickoff/labels/tier-0` and so on); Actions policy 17532 and its scope (`gh api repos/BeniCheni/kickoff/actions/policies/17532`); run 45531073426 on #377, its summary lines and #377's `tier-3` label; and the test counts on `main`. Beni's six answers come from chat and you cannot see them; say so, and check only that they match Pass 2.5's six questions as its comment states them.
3. The "handed on" list is complete and fair. Compare it with Pass 2.5's "handed to the next patch" items in its comment and with Pass 1's notes for the PM seat (issuecomment-7140639619, "Deliberately not done"). Say if anything was dropped or overstated.
4. The two index rows. Each must agree with its documents and with GitHub: #380's merge as `86155da`, its cold read's one low fix, the `4f71cf8` commit pushed from the reader's session and Codex's confirmation of it on #380; #382's counts (0 high, 4 medium, 12 low), the fix commit `eeaf014`, policy 17532, squash `a2ff30b`, and the live run on #377. Check the table still renders with the right column count on GitHub: `gh api 'repos/BeniCheni/kickoff/contents/docs/README.md?ref=9adcc7b' -H 'Accept: application/vnd.github.html'`.
5. Public-repo hygiene. Nothing from Sportsbooks, money matters, keel's user data or a private vault; no email address but the `noreply` ones; no secret or token. The policy ID and run IDs are fine.
6. The house. `npm run typecheck` and `npm test` with the real counts after `npm ci`, and read `verify` and `tier` at the head. The diff is docs only, so `CLAUDE.md` asks for a smoke pass; if the sandbox refuses the dev server, compare `npm run build` output at `a2ff30b` and `9adcc7b`, and say so. Repo prose stays wrapped in the existing style; the index rows are single table lines by design.
FIX SCOPE. None. This read is report-only. Push no commit, edit no file, and do not touch the PR body, labels or draft state. Write each problem as a finding: the file and line, the command that shows it, what you expected and what you saw, and the smallest change. Keep any probe in `$TMPDIR`, outside the repo.
THE COMMENT. Leave one PR comment on #385 in the shape of `.agents/skills/kickoff-pr-review/pr-comment.md`: the model and effort, the head, the checks you ran with their results, findings by severity, and a "Not verified" list. End with a verdict, "Mergeable now" or "Mergeable after fixes", and any one-word question for Beni. Then stop, and reply in this chat with the comment's link and the verdict. Do not mark the PR ready and do not merge it: under Tier 1, Beni merges.
SEALED APPENDIX. These are the PM seat's claims, with the command and the time it ran. Verify each one independently and report any that does not hold.
- 9:08 PM EST: `gh api repos/BeniCheni/kickoff/labels/tier-N` for N = 0 to 3 returned `0e8a16`, `0075ca`, `fbca04`, `b60205` with the descriptions in the record.
- 9:09 PM EST: `POST repos/BeniCheni/kickoff/actions/policies` returned id 17532, enforcement `active`, `workflow_path` include `.github/workflows/tier.yml`, rule `restrict_action_events` with `allowed_events` `["pull_request_target"]`.
- 9:09 PM EST: `gh pr view 382` reads MERGED with merge commit `a2ff30bf37ad7fc9ffaffde20b42c22e066955d1` at 02:09:29Z; `git merge-tree --write-tree 2e46532 eeaf014` and `git rev-parse a2ff30b^{tree}` both print `a0cab85a70c3b0d4adcc3eaae17e643d0f4a0d0b`.
- After the pull: `npm run typecheck` clean, `npm test` 1,244 tests in 89 files, `npm run build` green on `a2ff30b`.
- 9:10 PM EST: run 45531073426 on #377 succeeded; its log reads "Tier 3 list from commit `a2ff30b…`", "Computed **Tier 3**" and "PR label: `tier-3`".
- 9:41 PM EST: run 45534736526 on #385 computed Tier 1 from three Markdown files under `docs/`, read "PR body names **Tier 1**" and applied `tier-1`.
````

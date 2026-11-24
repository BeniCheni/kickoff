# Track A's close-out: PR 4's squash to #370's squash (Mon 23 – Tue 24 Nov 2026, TZ=America/New_York)

Written by the Track A PM seat (Claude Code, `claude-opus-5-5` at `high`) on Tue 24 Nov 2026 at
about 11:30 AM EST, to close the thread that began with the Track A Planner's handoff after PR 4
(`8f825fe`, Mon 23 Nov 9:03 AM EST). The figures below were read from the repo and GitHub in that
session. A reader should re-run them, not trust them: the commands are given where they matter.

## Where things stand

- **`main`** is at `605ef5d` (#369, the risk tiers, merged by Beni at 11:12 AM EST on 24 Nov),
  over `b399001` (#370, the `GIT_DIR` leak fix, squashed by Beni at 10:54 AM EST).
  `package.json` says `0.5.5`, and the newest tag is `v0.5.5`. The last three `sync.yml` runs on
  `main` succeeded (`gh run list --workflow sync.yml --branch main --limit 3`).
- **`overhaul/second-edition`** is at `45b7bc6` (#352, PR 4), 28 commits ahead of `main` and 12
  behind (`git rev-list --left-right --count origin/main...origin/overhaul/second-edition`).
  PRs 0, 1, 1b, 2, 3 (with #359's follow-up) and 4 have merged.
- **PR 5 is open as #377** (`codex/overhaul-pr5-books` into the integration branch, 36 commits,
  head `81101fe`, opened by Codex at 11:00 PM EST on 23 Nov). `verify`, `vercel-smoke` and Vercel
  pass, and its merge state is CLEAN. **No review pass has started.** It is tier 3, so it takes the
  six-pass 360. Passes 0 and 1.5 belong to the PM seat, Pass 1 to a fresh Claude Code session on
  Fable 5.2 and Pass 2.5 to a fresh one on Opus 5.5 (README, "When Codex builds").
- **This thread's archive is #379** (`claude/track-a-archive-8` into `main`, docs only). It waits
  for its tier 1 read and Beni's merge.

## What this thread did

### Rulings recorded (Beni's word, each answerable in one word)

- **23 Nov, about 10:40 AM EST.** Codex builds PR 5 at tier 3. Keep's 510.5 px is a ceiling, not
  the expected result. The `tests/vercelIgnore.test.ts` leak gets fixed now, before PR 5.
- **After the 4 PM reset: "Leak, then Design."**
- **#370 stays tier 2** ("Yes, tier 2", about 6:50 PM EST), on the condition that no assertion in
  a tier 3 test changed.
- **Questions 30 to 39 on Claude Design's Poster pass, all Yes** (7:40 to 9:56 PM EST), recorded
  in `docs/design/5-handoff/poster-pass-addendum.md`. They cover the band's order, four rows and
  "More stories", one aside to a part, five new titles, one tagline to a slot, the Mon–Sun slot
  rule, the all-hidden day's 35.5 px line, no TODAY mark on the Poster, and counts that follow the
  filters.
- **#370's finding 1: "Yes, fix first"** (about 10:21 PM EST).
- **#370's finding 4: "Reader's line"** (24 Nov, about 9:00 AM EST), with the line re-seated
  from Codex to Cursor on Grok 4.7 Medium (about 9:15 AM EST).
- **#370 kept at tier 2 after round 3** ("Yes, tier 2", about 10:50 AM EST), although
  `CHANGELOG.md` is a tier 3 path in #369's list.
- **Push and open the archive PR: "Yes!"** (about 11:05 AM EST), which became #379.

### Prompts written and delivered (all archived in `docs/`, rows in `docs/README.md`)

| File | For | Commit |
|---|---|---|
| `design-overhaul-planner-handoff.md` | the next PM seat, after PR 4, and the Fable 5.2 seat's notes | `8f825fe`, `a298fec`, `8329c7a`, `997654f` |
| `test-git-env-implementation-prompt.md` | Codex, #370's build | `84b82fe` |
| `design-overhaul-poster-design-prompt.md` | Claude Design, the Poster pass | `887348f` |
| `test-git-env-review-prompt.md` | Claude Code (Opus 5.5 High), #370's cold read | `7ffbac3` |
| `design/5-handoff/poster-pass-addendum.md` | the record of Claude Design's pass and rulings 30 to 39 | `229c31f`, `1c1e92d` |
| `design-overhaul-pr5-implementation-prompt.md` | Codex (gpt-6.2-astra xhigh), PR 5's build | `7477622` |
| `test-git-env-fix-prompt.md` | Codex, #370's fix round | `314fb9c` |
| `test-git-env-reread-prompt.md` | the cold reader, round 2 | `6f7b98c` |
| `test-git-env-changelog-prompt.md` | Cursor (Grok 4.7 Medium), the changelog line | `cc1816b`, `4233fc4` |
| `test-git-env-reread-3-prompt.md` | the cold reader, round 3 | `0e17db5` |

### #370, end to end

Codex built it (`0b37b92`). The cold read found the `setupFiles` wiring untested (finding 1,
medium). Codex added a child-vitest case under an empty `GIT_DIR` decoy (`6015fe0`), and round 2
read "Mergeable now". Cursor added the [Unreleased] line (`cd48aa8`), and round 3 read "Mergeable
now" with no findings. Beni squashed it as `b399001`. Three vendors touched one PR and none
reviewed its own work. With `tests/setupGitEnv.ts` on `main`, later briefs drop the
`env -u GIT_DIR …` workaround (`git log --oneline origin/main -- tests/setupGitEnv.ts`).

## Handed on

- **PR 5's six-pass 360** (#377). Pass 0's brief is owed. Pass 1 needs the full browser matrix,
  the honesty suites and the questions the brief asked the build to put in the PR (the mixed
  set/unset day names FIRST, and the proposed shelf line for an all-hidden week).
- **#379**, the archive, at tier 1.
- **Two dated risks and stale records**, for the Overall Planner to rank:
  - #358 / #361: `tests/sync.test.ts:84` fails `verify` on `main` once a legitimate sync writes
    no UCL table, which the end of the league phase will bring.
  - #328 is DIRTY and its builders table is superseded by #369.
  - #360 (the Next reader's Back then Forward) and #372 to #375 (PM chores F4) are open bugs.
  - The global note that R1, R4 and R6 are "not yet in those tables" is stale since #369.
- **Live folders.**
  - `.claude/worktrees/track-a-archive`, until #379 merges.
  - `~/code/kickoff-pr5` and `~/code/kickoff-pr5-base`, with
    `~/code/kickoff-receipts/pr5-build/`, until PR 5 merges.
  - `~/code/kickoff-pr370-changelog`, `~/code/kickoff-pr370-read` and
    `/private/tmp/kickoff-test-git-env` can go now that #370 has merged. Keep
    `~/code/kickoff-receipts/pr370-*`.

## Lessons worth keeping

- **A third vendor keeps the rule cheap.** When the builder and the reader were both spoken for,
  a one-line docs change went to Cursor in a detached worktree of its own, pushing to the PR's
  branch as a fast-forward. No vendor reviewed its own work and no folder was shared.
- **The PM seat's description is a lead, too.** The round-3 brief said no tier 3 path moved, and
  the reader checked that against #369's list and found `CHANGELOG.md` on it. The brief was
  wrong; the read was right.
- **A branch whose upstream is `main` is pushed by full refspec**
  (`git push origin HEAD:refs/heads/<branch>`), never by a bare `git push`.

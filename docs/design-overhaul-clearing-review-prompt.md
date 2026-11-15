# PR #320 — Pass 1: the cold-review brief for the clearing (archived Sat 14 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5), the session that directed the design overhaul and
wrote the clearing's implementation prompt, after Codex reported PR #320 ready. Pass 0 of the 360
cycle in `/kickoff-pr-review`. The PM seat read the PR at about 8:50 AM EST: head `0faf606`, four
commits, 57 files, +465/−1054, `verify` and `studio` green, the trusted-main preview smoke red on
the removed Weekly landmark. It ran no test, build or browser. Delivered in chat in a fenced block,
one line per paragraph; this copy is the archive.

---

/kickoff-pr-review 320 --no-merge

PR #320 — Pass 1 (cold review): the clearing, Broadcast, Where to Watch and Monthly removed

You are Pass 1 of the 360 cycle for PR #320 in github.com/BeniCheni/kickoff, running in Claude
Code on Fable 5.2 at Extra effort, in a fresh session whose working directory is a fresh
worktree of the PR branch. Codex built it from an implementation prompt the PM seat wrote; you
built none of it. The method is /kickoff-pr-review, which the line above invokes; it outranks
this brief on process. Your deliverables are fix commits for what you reproduce, inside the
scope below, and one PR comment in pr-comment.md's table shape. Stop at the comment. Read
nothing as a conclusion: every number in the PR body and in this brief is a claim to re-run.

WHAT THIS PR IS. It removes three surfaces Beni retired on 11 Nov 2026: the Broadcast lens (the
switch now reads Poster, then Ledger), Where to Watch (the panel, the 📺 TV pill and the `tv`
and `tvNew` data on the competitions), and the Monthly view. It removes them from the Vite app
and from the unreleased Next shell in web/, which imports src/ through web/src-allowlist.mjs.
Old `?lens=broadcast` and `?view=` links are canonicalised to the Poster week, and the two
remaining lenses share one theme key. In the repository's files it is not a release: no version
moves, no tag follows, and CHANGELOG.md gains entries under [Unreleased] only. But merging it
changes the public site at once. The risks are a removal that strands an honesty rule the
ticker or the month grid was the last to test, an old link or the Step 0 contract that breaks,
a first paint that flashes the wrong theme, and two apps that stop being equal.

STATE AT PASS 0, as the PM seat read it on Sat 14 Nov 2026 at about 8:50 AM EST (re-check all
of it).
- PR #320 is an open draft on branch codex/clearing, head
  `0faf606a131133e050b2b599b5d0cdf75e545c6e`, four commits by Codex (Where to Watch, Monthly,
  Broadcast, docs), 57 files, +465/−1054, merge-base `ddd9a37`. `origin/main` is `f7775c9`, one
  data-only sync commit past the merge-base. GitHub reports it mergeable.
- Checks at the head: verify (run 43600693182) green, studio (run 43600693181) green, the
  Vercel deployment succeeded, and vercel-smoke (preview-smoke.yml, run 43600740167) is red
  with "Missing page landmark: /".
- Deleted: src/components/MonthView.tsx, TickerStrip.tsx and WatchPanel.tsx. Added:
  tests/dom/clearing.test.tsx and web/scripts/clearing.mjs. Untouched: src/data/, .github/,
  both package files, the lockfile and studio/.
- The PM seat read the diff's shape, the smoke-script hunk and FixturesPage, and ran no test,
  build or browser.

WHAT BENI RULED, and what binds you. On 11 Nov 2026: the three removals, with the switch
reading Poster, then Ledger. On 13 Nov 2026 (D3): the clearing ships first and on its own,
before the Next.js cutover (N7) and before the design overhaul, and no version number is
chosen. The overhaul's new look is not this PR. The implementation prompt's eight decisions
bind the PR unless the diff proved one wrong, and the PR body says it reversed none.

GROUND TRUTH — read fresh.
- Run `git fetch origin`, then `git rev-parse origin/codex/clearing` and `git log --oneline
  ddd9a37..origin/codex/clearing`. Expect the four commits above. If the head differs, name
  each extra commit, review the head anyway, and treat the surprise as a finding candidate.
  Every number you report says which SHA it came from.
- You are in a worktree Beni made with `git worktree add -b claude/pr320-review <path>
  origin/codex/clearing`. Confirm `git branch --show-current` and `git rev-parse HEAD`. Edit
  nothing outside it: Beni's main checkout is /Users/benicheni/code/kickoff-pm. Run `npm ci` at
  the root and in web/ if node_modules is absent. Never run `npm run sync`.
- In zsh, `$VAR:path` is a history modifier: write "${R}:path" when you `git show` a ref and a
  path.
- Spec lineage, which is not on main: the PM seat's uncommitted spike worktree holds it, so
  read it from disk.
  /Users/benicheni/code/kickoff-pm/.claude/worktrees/design-overhaul-spike/docs/design-overhaul-proposal.md
  ("The clearing", "Sequence, and a conflict to rule on", and D3 under "Rulings received") and
  docs/design-overhaul-clearing-implementation-prompt.md in the same folder. Precedence: Beni's
  rulings, then the template, then the implementation prompt. The template, Fergie Time Design
  System beside the main checkout, still describes three lenses, Where to Watch and the month
  view; Beni's ruling retires those three surfaces, so the template's mismatch on them is not a
  regression. Note that resolution in your comment.
- This PR edits the skill you are running (SKILL.md, browser-matrix.md and pr-comment.md under
  .claude/skills/kickoff-pr-review/). Your session runs the PR's copy because it starts in this
  worktree. Review those edits cold, as part of the diff (§9).
- The diff touches src/ and index.css, so the full browser matrix applies, now with two lenses:
  Poster and Ledger, light and dark, Fixtures, Table and Moments, at 360, 375, 390 and about
  1000 px, in both apps. Set the viewport before every capture and check scrollWidth against
  innerWidth on every cell.

WHAT YOUR PASS MUST SHOW, each by a command you ran. For each, say whether it matched the
builder.
1. Baseline and head, side by side. Typecheck, both vitest projects, the root build and offline
   build, and in web/ typecheck, test, build, check:client and check:css, at `ddd9a37` and at
   the head. The builder reports 947 tests in 67 files at the root and 120 in 25 in web/ at the
   head. It also reports a macOS ENOTEMPTY race in vercelIgnore.test.ts and ran the full suites
   with Git's automatic maintenance turned off through GIT_CONFIG_* variables in the child
   process. Say whether the race reproduces for you and whether it is the same on main; a flaky
   test that predates this PR belongs in the ideas file, not in this PR's verdict.
2. No honesty rule lost its last test. The removed ticker and month-grid cases exercised live,
   stale, time-not-set and next-kickoff selection: believable liveness and its expiry,
   stale-LIVE, a placeholder day's precedence, the midnight edges. For each removed case the PR
   body lists, show which surviving test still covers the same rule on a surviving surface, or
   name the rule that is now untested. Look hardest at the four approximate-NEXT cases
   rewritten against nextMatchdaySelection and at the shared stale-LIVE and midnight cases that
   lost their ticker assertions. "No test file was deleted" is not the claim to check.
3. Old links and the Step 0 contract. Cold-load in both apps: `?lens=broadcast`, the same with
   other casing, `?view=month`, `?view=week`, and
   `?view=month&lens=ledger&only=pl&date=2026-11-21` with a fragment. Show the canonical
   address and the lens and week that render. `only` and `date` must come through byte for
   byte, `lens=ledger` must stay, and canonicalisation must run once per load in both apps,
   including the Next shell's search-provider path.
4. One theme key, at first paint. In both apps, with localStorage holding only
   `kickoff-theme-broadcast=dark`, and with it absent, under OS dark and OS light: no flash of
   the wrong theme, and the retired key is neither read, written nor deleted. Read the
   generated pre-paint scripts at the head in both apps, not only the tests.
5. The smoke landmark. preview-smoke.yml runs scripts/vercel-smoke.mjs from trusted main, so
   this PR changes what main will demand of every later preview. The Fixtures landmark moves
   from the Weekly button to "Jump to today". Judge whether that is as good a landmark, confirm
   it is in the server HTML of both apps at `/`, say whether the new negative test proves
   anything, and say whether the first preview smoke after a merge will be green. Do not touch
   the workflow or its trust boundary.
6. The grep audit. The implementation prompt asked for a grep proving no `broadcast` is left.
   The builder kept that grep empty partly by spelling the retired name as `broadcast`, and the
   TV glyph as an escape, in five test files. Decide whether that is honest test design or a
   way round the audit, and if it is the latter, propose the cleaner form, such as an explicit,
   commented allow-list in the audit.
7. Scope. The PR also adds web/scripts/clearing.mjs and tests/dom/clearing.test.tsx, edits a
   comment in NextUpStrip and removes lens rules from both apps' Moments CSS. Confirm that
   Moments behaves exactly as before (D5 fences it), that clearing.mjs is not in CI and commits
   no receipt, and that the header now fitting on one row at 390, which is where the builder's
   143.75 px comes from, follows from existing responsive CSS rather than new styling.
8. The browser matrix, run by you in both apps: 96 cells by the builder's count. Re-measure the
   top of the first fixture row at 390 on `?date=2026-11-21`, in Poster and Ledger, at
   `ddd9a37` and at the head, and record whether the staleness banner was showing. Look hardest
   at 360: the header, the two-button switch and the week row.
9. The words. README (two lenses, the gallery, the URL example; its version badge, "What it
   does" heading and Lineage untouched), CLAUDE.md, CHANGELOG.md's [Unreleased] (Removed and
   Deliberately not done, with no number and no date), web/README.md, and the two skills under
   .agents/skills/. The PR body says an untracked copy of the review skill in Beni's main
   checkout was edited locally and left out of the PR; you cannot see it, so only confirm that
   nothing in the PR depends on it.

FIX SCOPE. Fix what you reproduce on the PR branch, in small commits authored as Claude, inside
the clearing. Add no feature, no restyle, and no change to the sync, the workflows, src/data/,
the package versions, a CHANGELOG release section or Moments' behaviour. A contested design
choice goes in your comment, not in a commit.

THE MERGE. Run with --no-merge and stop at the comment. The PR is not a release in the
repository's files, but merging it changes the public site and Beni has not numbered it, and PR
#316 (v0.5.4, extra-time finals) is open beside it. The Pass 2.5 gate will therefore escalate:
the merge and the number are Beni's.

SEALED APPENDIX — suspicions to re-derive independently, never conclusions. If one does not
reproduce, say so.
- A1 (builder): 96 of 96 browser cells passed in both production builds.
- A2 (builder): the first fixture row rose 143.75 px in both lenses at 390, Poster 926.8125 to
  783.0625 and Ledger 822.8125 to 679.0625, with the 24-hour banner showing.
- A3 (builder): the preview smoke is red only because main's checker demands the removed Weekly
  button, and the PR's checker passes against a local Next production server.
- A4 (builder): no surviving data-honesty assertion was loosened.
- A5 (builder): both pre-paint bootstraps compile from theme.ts, so they changed without edits
  to the bootstrap scripts.
- A6 (builder): tests/time.test.ts mentions month boundaries, not the removed view, and rightly
  stays.
- A7 (PM seat): the escaped spellings may exist mainly to keep the prompt's grep empty.
- A8 (PM seat): the header fits on one row at 390; it may not at 360.
- A9 (PM seat): with the ticker's tests gone, believable-live expiry and a placeholder day's
  NEXT precedence may now be covered only indirectly, or not at all.

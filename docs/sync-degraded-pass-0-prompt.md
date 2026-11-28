# PR #358 — the degraded-standings sync test's review cycle, Pass 0 to the merge (27 Nov 2026, TZ=America/New_York)

Written by the Overall Planner seat (Claude Code, Opus 5.5) at about 9:40 PM EST on Fri 27 Nov
2026, on Beni's "Yes, write it". Claude built #358, so Claude does not write the Pass 1 opener.
The README's seats table, "When Claude builds" column, gives Passes 0 and 1.5 to Codex on
GPT-6.2 Astra. This file hands Pass 0 over, and adds no findings.

Beni's rulings so far:
- "Now", question 13 on #352, Sat 21 Nov 2026 at 7:49 PM EST: fix the assertion in its own PR
  on `main`, apart from #352. This comes from #358's body, so it is the builder's account.
- "Yes, now", fork 3 of the Overall Planner's checkpoint, Tue 24 Nov 2026 at 11:49 AM EST:
  start #358's six-pass 360 now. A refresh onto `main` is his word, and Pass 1 may recommend
  one. It is recorded in `docs/roadmap-checkpoint-2026-11-24.md`, "Beni's rulings on the
  forks", item 3, with its amendment that Pass 2 is Claude Code on Opus 5.5.

State at 9:36 PM EST:
- Head `99757f31b945bb06147cfafb3fa85cc3935f2623`, one commit by Claude, on `b2206cf`. The
  branch is 31 commits behind `main` at `613d2bd` and merges cleanly
  (`git rev-list --count pr358..origin/main`; `git merge-tree --write-tree --name-only
  origin/main pr358`).
- The diff is `tests/sync.test.ts` only, +13 −4 (`git diff --stat origin/main...pr358`). That
  file is on `AGENTS.md`'s Tier 3 list. The PR carries no tier label: it predates the `tier`
  workflow, and no PR event has run it since.
- `verify`, Vercel, Vercel Preview Comments and `vercel-smoke` are SUCCESS at the head, and the
  PR is MERGEABLE and not a draft (`gh pr view 358 --json statusCheckRollup,mergeable,isDraft`).
- None of the files #358's body cites has changed on `main` since `b2206cf`
  (`git diff --stat b2206cf origin/main --` over them printed nothing).
- The deadline is the first publishing sync on or after Thu 28 Jan 2027, 62 days away
  (`echo $(( ($(date -j -f %Y-%m-%d 2027-01-28 +%s) - $(date -j -f %Y-%m-%d 2026-11-27 +%s)) / 86400 ))`).

Delivered in chat in a fenced block, one line per paragraph. This copy is the archive. It lives on
the local branch `claude/sync-degraded-review-archive` in `kickoff-pr358-pm`, not pushed. The
cycle's record adds its `docs/README.md` row.

## The handoff, as delivered

````text
You are the Pass 0 seat for Kickoff PR #358 (the 360 cycle's cold-review brief), running as a fresh Codex session on GPT-6.2 Astra at high effort. If you are not that seat, or you built or reviewed any part of #358, stop and say so.
Start by reading the archived copy of this handoff, which wins over anything pasted: git -C /Users/benicheni/code/kickoff-pr358-pm show claude/sync-degraded-review-archive:docs/sync-degraded-pass-0-prompt.md. That branch is local to that clone and not pushed. Read it there and leave that folder alone.
Where to work. Beni's main checkout is gone, so make your own clone and list it with a KEEP note and an end date in your first message: git clone https://github.com/BeniCheni/kickoff.git /Users/benicheni/code/kickoff-pr358-pass0, then git fetch origin pull/358/head:pr358 and confirm its full SHA is 99757f31b945bb06147cfafb3fa85cc3935f2623. Never work in another session's folder. Put receipts under /Users/benicheni/code/kickoff-receipts/pr358/. Run TZ=America/New_York date before you write any date.
What #358 is: PR https://github.com/BeniCheni/kickoff/pull/358 into main, one commit by Claude on b2206cf, touching only tests/sync.test.ts (+13 −4). It splits the sync round-trip test into two availability cases, every table present and UCL degraded after its league phase, each with its own exact standings-degraded value, so the test stops inheriting that fact from the generated src/data/standings.json. It closes #361. Claude Code (Opus 5.5) built it, and it holds Pass 2 and the fix rounds. The PR body says what the builder claims: what step 1 found, the design, the gates and a mutation matrix. Those are claims to check, not facts. Its line that review is "one fast-track Codex pass" predates the tiers and is stale.
Beni's rulings, in his own words. "Now", question 13 on #352, Sat 21 Nov 2026 at 7:49 PM EST: fix it in its own PR on main. That one reaches you through the PR body, so Pass 2.5 asks him to confirm it. "Yes, now", Tue 24 Nov 2026 at 11:49 AM EST: start #358's six-pass 360 now. A refresh onto main is his word, and Pass 1 may recommend one. The second is recorded in docs/roadmap-checkpoint-2026-11-24.md, under "Beni's rulings on the forks", item 3.
Why it matters, and by when. tests/sync.test.ts is on AGENTS.md's Tier 3 list. sync.yml runs npm test on the snapshot it has just written, so once a sync writes degraded: ["ucl"], main's sync fails its verify step and publishes nothing. The earliest date is the first publishing sync on or after Thu 28 Jan 2027, 62 days from today. The roadmap checkpoint's section 1.5 has the chain, with its commands.
Routing: the README's seats table ("How it gets built", the "When Claude builds" column) owns this, and .claude/skills/kickoff-pr-review/SKILL.md now agrees with it. Passes 0 and 1.5 go to Codex on GPT-6.2 Astra. Pass 1 is a fresh Codex session on GPT-6.2 Astra, report-only. Pass 2 is the builder, Claude Code on Opus 5.5. Pass 2.5 is a fresh Codex session on GPT-6.2 Sol, read-only. Pass 3 is Beni, and the merge, a squash onto main, takes his word.
Your job: read #358 and the repo fresh, then write the Pass 1 opener. It goes to a fresh Codex session on GPT-6.2 Astra (you name the effort), which runs /kickoff-pr-review 358 --pass 1 report-only. Pass 1 commits nothing to the PR branch, leaves one PR comment in the skill's pr-comment.md shape, and stops there. The opener's first line names its seat ("You are… if not, stop"). Its second line points at git -C <your clone> show of the opener's own archived copy. Below that come the tailored context, then a sealed appendix headed "verify independently", which holds leads and never conclusions. Carry the five leads below into it as you judge them, and add your own.
What the opener must make Pass 1 settle. First, that the split weakens no assertion: compare git show b2206cf:tests/sync.test.ts with the head, assertion by assertion. Second, which base Pass 1 runs the gates on: the head as it is, the merge with today's main (git merge-tree --write-tree origin/main pr358 gives the tree), or both. Third, whether Pass 1 recommends a refresh before Pass 2, which Beni then rules on. This PR touches no src/ or index.css, so the browser matrix does not apply; say so with that reason.
Archive the opener as docs/sync-degraded-review-prompt.md, committed as Codex (git -c user.name=Codex -c user.email=noreply@openai.com commit) on a local branch codex/sync-degraded-review-archive in your clone, cut from origin/main. Add no docs/README.md row; the cycle's record does that. Deliver the opener in chat as one fenced block, one line per paragraph, with a four-backtick outer fence if it holds fences of its own. Then stop and wait; don't ask whether Beni will paste it.
Limits: no push, no PR, no comment, review, label change, merge or approval on GitHub. No writes to the PR branch. Never npm run sync, and leave sync/scheduled alone. Nothing from Sportsbooks, money matters, keel's user data folder or the yith vault goes into this public repo. You may run npm ci, the gates and the tests you need in your clone, and every figure you write carries the command that reproduces it, run in your session.
Sealed appendix, verify independently: leads from the Overall Planner seat's read at 9:36 PM EST. These are not findings, and whether each holds is for you to decide.
L1. The mutation receipts are gone. The body cites ~/code/kickoff-receipts/sync-degraded/ and its matrix.sh, and ls on that folder says it does not exist. Its matrix, two snapshots by three versions of scripts/diff.ts:442, may need rebuilding from the body's description rather than re-running.
L2. The body's check of other snapshot readers may be incomplete. It names tests/syncBaseline.test.ts and two DOM tests, then says "No other finding for Beni". The checkpoint's section 1.5 found that tests/moments.test.ts:6 takes the first ucl: fixture from src/lib/fixtures while the module loads, so a snapshot whose window holds no UCL fixture fails that suite, on a run on Sat 27 Feb 2027 at the earliest. That is a fixtures risk, not the standings one #358 fixes. Decide whether it is a #358 finding, an ideas-note candidate or a new issue, and make the question for Beni one word.
L3. The gates in the body ran at 99757f3 on the old base: 81 files, 1,032 tests. main has gained 31 commits since, so the counts at the head and on today's main may differ; this seat did not run them. None of the files the body cites has changed on main since b2206cf (git diff --stat b2206cf origin/main -- tests/sync.test.ts scripts/diff.ts scripts/providers/espn-standings.ts scripts/sync.ts src/lib/competitions.ts printed nothing).
L4. The PR has no tier label and no tier check: it opened on 22 Nov, before the tier workflow, and no event has run it since. Its body names no tier. The computed tier is 3 by path. A refresh push would run the workflow.
L5. The UCL-degraded case builds its standings by deleting leagues.ucl from the committed rows. Check that this is the shape scripts/providers/espn-standings.ts and scripts/sync.ts actually write (the body cites lines 120-122, 142-148 and 219-224), and that the case does not pass for a reason the writer never produces.
````

## After Pass 1: Beni's rulings and the note to the Pass 1.5 seat (Fri 27 Nov 2026)

Codex's Pass 0 seat archived its Pass 1 opener as `dc6b6f7` on `codex/sync-degraded-review-archive`
in `kickoff-pr358-pass0`. Pass 1, a fresh Codex session on GPT-6.2 Astra at high, posted
[its review](https://github.com/BeniCheni/kickoff/pull/358#issuecomment-7233294109) at 10:42 PM
EST at head `99757f3`: "Mergeable after fixes", with one required test fix (finding 1, medium)
and three PR-body corrections (findings 2 to 4).

The Overall Planner put Pass 1's three recommendations to Beni. He ruled at about 10:47 PM EST:

| Question | Beni |
|---|---|
| Refresh #358 onto `main` before Pass 2? | **No** |
| The `tests/moments.test.ts` collection risk: its own issue, folded into #358, or not now? | **File** |
| One `[Unreleased]` / Fixed line in `CHANGELOG.md`, added in Pass 2? | **Yes** |

The note below went to the Pass 1.5 seat.

````text
You are the Pass 1.5 seat for Kickoff PR #358 (the rebuttal brief), Codex on GPT-6.2 Astra, the seat that wrote Pass 0. If you are not that seat, or you built or cold-reviewed any part of #358, stop and say so.
FIRST: read this note from its archive with git -C /Users/benicheni/code/kickoff-pr358-pm show claude/sync-degraded-review-archive:docs/sync-degraded-pass-0-prompt.md, from the heading "After Pass 1" on. If a paste differs, the archive wins.
Pass 1 reported "Mergeable after fixes" at 99757f31b945bb06147cfafb3fa85cc3935f2623: https://github.com/BeniCheni/kickoff/pull/358#issuecomment-7233294109. The head has not moved since. Finding 1 (medium, required): once the committed snapshot loses UCL, the "every table available" case no longer catches a writer that drops the UCL table. Findings 2 to 4 (low, medium, low) correct the PR body. Pass 1's receipts are in /Users/benicheni/code/kickoff-receipts/pr358/pass1/.
Beni's rulings, Fri 27 Nov 2026 at about 10:47 PM EST, put to him by the Overall Planner seat. "No": no refresh onto main before Pass 2, so the builder fixes on the current branch. "File": the tests/moments.test.ts collection risk becomes its own issue, apart from #358, and is not a #358 finding. The Overall Planner files it; cite its number once it exists. "Yes": the builder adds one line under CHANGELOG.md's [Unreleased] / Fixed in Pass 2. It is not a release: no version bump and no tag. Attribute each to Beni in his words.
Your job: write the Pass 2 brief for the builder, Claude Code on Opus 5.5, per the skill's Pass 1.5 row. Package each of the four findings with Pass 1's reproduction, to accept, contest, or accept but contest the characterisation, with a fix SHA or a disposition for each. Carry the three rulings and the CHANGELOG line, and ask for the writer mutant from finding 1 to be shown red at 99757f3 and green at the fix, under both snapshots. The builder's original folder is gone, so tell it to make its own clone, push only to claude/sync-test-degraded-standings-88bd26, and leave one Pass 2 comment. Carry #352 question 13 ("Now") forward to Pass 2.5 for Beni's one-word confirmation.
Archive the brief as docs/sync-degraded-rebuttal-prompt.md, committed as Codex on codex/sync-degraded-review-archive in your clone. Deliver it in chat as one fenced block, one line per paragraph, then stop. The limits from Pass 0 still hold: no push, no PR, comment, label change, merge or approval, and never npm run sync.
````

On Beni's "Yes, file it", the Overall Planner filed the Moments risk as
[#402](https://github.com/BeniCheni/kickoff/issues/402) at 10:49 PM EST. The Pass 1.5 brief
cites that number.

## After Pass 2: the note to the Codex seat for the Pass 2.5 opener (Fri 27 Nov 2026)

Codex's Pass 1.5 brief is archived as `47eb017` on `codex/sync-degraded-review-archive`. The
builder, Claude Code on Opus 5.5, posted
[Pass 2](https://github.com/BeniCheni/kickoff/pull/358#issuecomment-7233748684) at 11:09 PM EST.
It accepted all four findings, with fix SHA `7159d8b` (two commits, `ec68470` and `7159d8b`, on
the unchanged base `b2206cf`). At the fix, `tier` computed Tier 3 and labelled the PR `tier-3`,
`verify` and `tier` are SUCCESS, and the PR merges cleanly with `main` at `13d4ebe`
(`git merge-tree --write-tree --name-only origin/main pr358b`). The diff against `main` is
`CHANGELOG.md` +1 and `tests/sync.test.ts` +25 −4 (`git diff --stat origin/main...pr358b`).

As in #387's cycle, the Codex seat that held Passes 0 and 1.5 writes the Pass 2.5 opener, so the
builder's vendor does not brief the synthesis. The note below went to that seat.

````text
You are the Codex seat that wrote Pass 0 and Pass 1.5 for Kickoff PR #358, on GPT-6.2 Astra. Your next job is the Pass 2.5 opener. If you are not that seat, stop and say so.
FIRST: read this note from its archive with git -C /Users/benicheni/code/kickoff-pr358-pm show claude/sync-degraded-review-archive:docs/sync-degraded-pass-0-prompt.md, from the heading "After Pass 2" on. If a paste differs, the archive wins.
Where it stands. The builder, Claude Code on Opus 5.5, posted Pass 2 at 11:09 PM EST on Fri 27 Nov 2026: https://github.com/BeniCheni/kickoff/pull/358#issuecomment-7233748684. It accepts all four findings. Fix SHA 7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a, two commits (ec68470, the test fix and the CHANGELOG line; 7159d8b, which moves that line to clear a conflict with main) on the unchanged base b2206cf, per Beni's "No" to a refresh. At the fix the tier job computed Tier 3 and labelled the PR tier-3, verify and tier are green, and the PR merges cleanly with main at 13d4ebe. The diff against main is now two files, CHANGELOG.md and tests/sync.test.ts. The builder's receipts are in /Users/benicheni/code/kickoff-receipts/pr358/pass2/. Re-pin the head before you trust any of this.
Your job: write the Pass 2.5 opener for a fresh Codex session on GPT-6.2 Sol, read-only (you name the effort), per the skill's Pass 2.5 row and its executive-brief.md template. As in #387's cycle, you write it so the builder's vendor does not brief the synthesis. Read Pass 2 fresh and decide what the synthesis must re-run. At least: the gates at 7159d8b and on the merge with today's main; finding 1's writer mutant, red at 99757f3 and green at 7159d8b under both snapshots; the formatter matrix; that the CHANGELOG line is an [Unreleased] / Fixed edit only, with no version bump, no release heading and no tag; each body correction against Pass 1's findings 2 to 4; and every clause of the merge gate.
Rulings for the Executive Summary Brief to confirm in one word each. "Now" on #352, question 13 (Sat 21 Nov 2026, 7:49 PM EST), which reaches the cycle only through the PR body. Beni's three rulings on Pass 1, Fri 27 Nov 2026 at about 10:47 PM EST, put to him by the Overall Planner seat: "No" to a refresh, "File" for the Moments risk, and "Yes" to the CHANGELOG line. #402 holds the Moments risk and is outside #358. The handoff block is a squash onto main, pinned to the reviewed head, on Beni's word.
Archive the opener as docs/sync-degraded-synthesis-prompt.md, committed as Codex on codex/sync-degraded-review-archive in your clone. Deliver it in chat as one fenced block, one line per paragraph, then stop. The limits from Pass 0 still hold: no push, no PR, comment, label change, merge or approval, and never npm run sync.
````

## Pass 2.5's Executive Summary Brief, as delivered (Fri 27 Nov 2026, 11:28 PM EST)

Copied word for word from the Pass 2.5 session's final assistant message, from its heading on.
The session log is local to Beni's Mac and stays out of this repo.

````markdown
## Executive Summary Brief — PR #358 · Pass 2.5 · November 27, 2026, Brooklyn time

**Decision at `7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a` — Mergeable now on the evidence, escalated to Beni for Pass 3.** All eight technical gate clauses are met. I corroborated all four findings and their resolutions. GitHub’s green `verify` ran on the same prospective merge tree I tested locally. The word to squash is Beni’s separate decision. I posted and verified one [Pass 2.5 comment](https://github.com/BeniCheni/kickoff/pull/358#issuecomment-7234038722).

### Merge gate

The fetched PR tip matched `gh pr view 358`, targeting `main`. Fetched `main` was `13d4ebe846e97d19c691d11012774c639eca60f3`. I recomputed the merge base as `b2206cfc714dbeddf735d69f4af671fd40bbb01c` and the prospective merge tree as `2f50ae6185f5834298d124940a9848849e47d772`. Both remote refs still matched immediately before posting.

| Clause | Result | Evidence |
|---|---|---|
| 1. Non-release | **Met** | The three-dot delta adds one `[Unreleased]` / Fixed line. Package and lockfile versions, the README release record, and release headings are unchanged. The PR body specifies no tag to follow. |
| 2. No numbering fork | **Met** | Head and current `main` both declare `0.5.5`. The delta leaves the roadmap and release-number assignments intact. |
| 3. Verified fixes for standing high findings | **Met** | Neither pass left a High finding. The required Medium writer finding was fixed in `ec684704f4ed8c2ea63c32631fafcf36c8e5ee6d` and independently verified at the final tip. |
| 4. No unresolved cross-vendor dispute | **Met** | Pass 2 accepted every finding. This pass corroborated each disposition. Beni owns the four ruling confirmations below. |
| 5. Green hosted `verify` at the tip | **Met** | `gh pr checks 358` returned success immediately before posting. The linked run checked out GitHub’s merge commit `8ba2da3923b29dac5bbf17fb853b0721cf8b2f75`. I fetched it and matched both parents and its tree. [Verify run](https://github.com/BeniCheni/kickoff/actions/runs/46105976494/job/140858686361) |
| 6. `?only=` / `&date=` contract | **Met** | The three-dot delta contains only the test and CHANGELOG. Comparing current `main` to the prospective merge also showed no URL codec or state changes. |
| 7. `sync.yml` gates | **Met** | `.github/workflows/sync.yml` has no delta in either comparison. |
| 8. `src/data/*.json` | **Met** | Generated snapshots have no PR delta. The prospective merge retains current `main`’s snapshot files byte for byte. |

### What ships

- Sync verification accepts a valid snapshot after a qualifying reshape makes the Champions League league-phase table unavailable.
- The round-trip test checks both table states even when the committed standings have already lost UCL. The available case uses the checked-in ESPN recording and the provider’s own row normalizer.
- Both cases check the complete written standings and the exact report suffix. One Fixed entry records the change for the next release.

### Where it sits

This is the separate sync tooling fix for [#361](https://github.com/BeniCheni/kickoff/issues/361). It lands directly on `main` in workstream 3 of the roadmap checkpoint, apart from #352 and the second-edition release train. The complete PR delta is two files, +26/−4. I replayed `git merge-tree --write-tree` against the builder’s pinned `main`. The intermediate `ec68470` conflicted in `CHANGELOG.md` and exited `1`. The final `7159d8b` exited `0` and preserves both sides’ Fixed entries. [Roadmap checkpoint](https://github.com/BeniCheni/kickoff/blob/13d4ebe846e97d19c691d11012774c639eca60f3/docs/roadmap-checkpoint-2026-11-24.md#L331)

### What the 360 found

| Finding | Pass 1 → Pass 2 → Pass 2.5 |
|---|---|
| **1 · Medium, required** | Pass 1 found the available case could inherit a missing UCL table and let a broken writer escape. Pass 2 accepted and restored UCL from the ESPN recording. My serializer-only replay reproduced the old escape and caught it on both inputs at the fixed standings equality. |
| **2 · Low, PR body** | Pass 1 found the sort-coverage claim overstated the venue test. Pass 2 accepted and narrowed the claim to syntax. Removing only `.sort()` left `npx vitest run tests/venueTz.test.ts` green, exit `0`, 21 tests. The workflow grammar accepts `ucl,uel` and `uel,ucl` and rejects a trailing comma or embedded space. |
| **3 · Medium, PR body** | Pass 1 located the failure before publication and narrowed the provider-test claim. Pass 2 accepted both corrections. On writer-shaped input at `b2206cf`, `npx vitest run tests/sync.test.ts` exited `1` with one failure in 12 tests at `:84:59`, expecting `none` and receiving `ucl`. The current body matches the workflow sequence and the test evidence below. |
| **4 · Low, PR body** | Pass 1 found the old fast-track wording and missing tier. Pass 2 accepted and corrected both. Current `AGENTS.md:77–81`, the README’s “When Claude builds” column, the live body and the hosted tier summary agree. Codex Astra held Passes 0, 1 and 1.5, Claude Code Opus 5.5 held the build, Pass 2 and fixes, fresh Codex Sol held Pass 2.5, and Beni holds Pass 3. |

[Pass 1 findings](https://github.com/BeniCheni/kickoff/pull/358#issuecomment-7233294109) · [Pass 2 dispositions](https://github.com/BeniCheni/kickoff/pull/358#issuecomment-7233748684)

The shape probe ran the recorded **League Phase** entries through `normalizeStandingEntry`, rank sorting and schema parsing. On both inputs the available case contained `bundesliga`, `laliga`, `ligue1`, `pl`, `seriea` and `ucl`, with 36 UCL rows, 36 distinct team IDs and no degraded marker. The degraded case kept the five domestic keys and `degraded: ["ucl"]`. Comparing the base, Pass 1 head and fix confirmed the pre-write guard, exit `0`, exact `fixtures.json` → `meta.json` → `standings.json` order, and both payload equalities. The final log assertion retains the full suffix `report: changed=true changes=1 urgent=0 standings=changed rank-moves=0 merge=auto zones-unknown=0 standings-degraded=` with a case-specific `none$` or `ucl$`. [Fixed test](https://github.com/BeniCheni/kickoff/blob/7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a/tests/sync.test.ts#L78-L105)

Each mutation cell ran `npx vitest run tests/sync.test.ts`. Exit `0` means all 13 passed. Exit `1` means the named case alone failed.

| Tree and writer | Committed input | UCL-removed input |
|---|---|---|
| Pass 1 `99757f3`, original | `0` | `0` |
| Pass 1 `99757f3`, serializer mutant | `1` at `:92:55` | `0`, mutant escaped |
| Fixed head, original | `0` | `0` |
| Fixed head, serializer mutant | `1` at `:104:55` | `1` at `:104:55` |

The writer failures were all in **every table available**, at deep equality of the parsed standings write, with the expected `ucl` block missing. The applied writer diffs matched Pass 2’s patch byte for byte.

| Fixed-head formatter | Committed input | UCL-removed input |
|---|---|---|
| Original | `0` | `0` |
| Constant `none` | `1` at `:105:59` | `1` at `:105:59` |
| Drop first, fallback `none` | `1` at `:105:59` | `1` at `:105:59` |

All four formatter failures were in **UCL degraded after its league phase**, at the exact suffix, with `none` received where `ucl` was required. Scratch tracked files were restored and verified clean.

### Verification as re-run

I installed the pinned root, web and Studio dependencies with offline `npm ci` under Node `24.15.0`. The two detached checkouts matched the trees below before the gates ran. Each command in a row returned the recorded exit status on that tree.

| Command | Fixed head `3d10be578aac76fdd8093a7096fde4ac1b78d086` | Prospective merge `2f50ae6185f5834298d124940a9848849e47d772` |
|---|---|---|
| Root `npm run typecheck` | `0` | `0` |
| Root `npm test` | `0` · 1,032 tests / 81 files | `0` · 1,245 tests / 89 files |
| Root `npm run build` | `0` | `0` |
| Root `npm run build:offline` and offline bundle scan | Both `0` | Both `0` |
| `web/` typecheck and `npm test` | Both `0` · 124 tests / 25 files | Both `0` · 124 tests / 25 files |
| `web/` `npm run build` | `0` | `0` |
| `web/` client and CSS boundary checks | Both `0` | Both `0` |
| `studio/` typecheck and `npm run test:contract` | Both `0` · 46 tests / 7 files | Both `0` · 46 tests / 7 files |

- **Writer-shaped full suite.** Fixed head in a separate Git checkout, with `leagues.ucl` removed and `degraded: ["ucl"]` set, ran `npm test` at exit `0`, 1,032 tests in 81 files.
- **Recorded-provider integration.** `npx vitest run tests/uclSync.test.ts` exited `0`, nine tests. With intercepted writes, the real provider path checks reshape detection, retained domestic keys, the metadata marker, one fixture write and a report substring. In-phase and invalid responses exercise refusal before writes. The mocked round trip independently pins the complete standings payload and the full report suffix.
- **Tooling smoke.** Loopback listening returned `EPERM`. The skill’s substitute ran `npm run build` on the pre-PR base and fixed head, then `diff -qr` on their normal `dist/` outputs. Both builds and the byte comparison exited `0`. The two-file delta calls for tooling smoke. Browser rendering and captures are **Not verified**.
- **Hosted tier and preview.** The `pull_request_target` run is associated with #358 at the reviewed head and followed the final push, consistent with `synchronize`. The summary used default-branch `13d4ebe846e97d19c691d11012774c639eca60f3`, matched `tests/sync.test.ts` and reported `tier-3`. The issue event records the bot applying that label earlier. Vercel reported **Canceled by Ignored Build Step**. Its repo command compares `VERCEL_GIT_PREVIOUS_SHA` and `VERCEL_GIT_COMMIT_SHA` over web build inputs. Replaying with the prior deployed tip `99757f3` and the reviewed tip exited `0` and printed “No web build inputs changed; skip.” The actual Vercel comparison SHA is **Not verified**. The reviewed tip had no `vercel-smoke` result. The prior tip had its own passing result. [Tier summary](https://github.com/BeniCheni/kickoff/actions/runs/46105974482) · [Ignore command](https://github.com/BeniCheni/kickoff/blob/7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a/web/scripts/vercel-ignore.mjs)

[Pass 2.5 receipts](/Users/benicheni/code/kickoff-receipts/pr358/pass2.5/) and the [review clone](/Users/benicheni/code/kickoff-pr358-pass25) are **KEEP through December 11, 2026, Brooklyn time**, and longer if adjudication remains open.

### Risks and accepted costs

- **January 28, 2027 is the earliest eligible Brooklyn date.** I exercised `afterPhaseWindows` across Brooklyn midnight. The configured 2026 season changes from false to true after the January 27 window. An unmatched season stays false. ESPN must also return a validated reshape, with the phase child missing or its row count changed. A valid intact table stays available. A future live ESPN reshape and publishing run are **Not verified**. [Provider](https://github.com/BeniCheni/kickoff/blob/7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a/scripts/providers/espn-standings.ts#L79-L148) · [Date gate](https://github.com/BeniCheni/kickoff/blob/7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a/src/lib/matchdays.ts#L14-L19)
- **Publication risk.** On a non-dry run with `publish=true`, “Verify the written snapshot” tests the locally written files. The old assertion would stop that run before the change digest, rolling-branch push and PR creation or update. A fresh quiet run skips that step, and a dry run skips writes and publication. This PR removes that specific false failure. Step 0 still requires primary-source re-verification for every open position after a red sync. [Workflow sequence](https://github.com/BeniCheni/kickoff/blob/7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a/.github/workflows/sync.yml#L175-L248)

### Handed to the designer / the next patch

- The Overall Planner filed **#402** as the first tooling follow-up. A snapshot with no `ucl:` fixture can break Moments test collection independently of the standings table. February 27, 2027 is the first date whose 30-day lookback excludes the last league-phase night. The failure still requires the whole window to lack a UCL fixture. The issue records Pass 1’s reproduction and proposes a deterministic specimen. Future fixture coverage is **Not verified**. [Issue #402](https://github.com/BeniCheni/kickoff/issues/402)
- PM record follow-up. The linked #361 issue still uses the old publication wording. The corrected sequence is in the current PR body and this brief. [Issue #361](https://github.com/BeniCheni/kickoff/issues/361)

### Questions for the CEO

1. The builder’s PR body is this cycle’s source for your **“Now”** on #352 question 13, November 21, 2026, 7:49 PM EST, to fix the assertion in its own PR on `main`. **Confirmed?**
2. The Overall Planner recorded your **“No”** to refreshing the branch before Pass 2 around 10:47 PM EST on November 27, 2026. **Confirmed?**
3. The Overall Planner recorded your **“File”** for the separate Moments issue around 10:47 PM EST on November 27, 2026. **Confirmed?**
4. The Overall Planner recorded your **“Yes”** to one `[Unreleased]` / Fixed line around 10:47 PM EST on November 27, 2026. **Confirmed?**

### Handoff block

Run in a clean Kickoff checkout on `main` only after you authorize the squash.

```bash
(
set -euo pipefail

reviewed=7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a
reviewed_main=13d4ebe846e97d19c691d11012774c639eca60f3
expected_tree=2f50ae6185f5834298d124940a9848849e47d772

if [ "$(git branch --show-current)" != main ] || [ -n "$(git status --porcelain)" ]; then
  printf 'Run from a clean Kickoff main checkout.\n' >&2
  exit 1
fi

git fetch --no-tags origin refs/heads/main:refs/remotes/origin/main
git fetch --no-tags origin refs/pull/358/head
live_head=$(git rev-parse FETCH_HEAD)
live_main=$(git rev-parse refs/remotes/origin/main)
if [ "$live_head" != "$reviewed" ] || [ "$live_main" != "$reviewed_main" ]; then
  printf 'Review pin changed. Re-verify before squashing. Main %s, PR head %s.\n' \
    "$live_main" "$live_head" >&2
  exit 1
fi
preflight_tree=$(git merge-tree --write-tree "$live_main" "$live_head")
if [ "$preflight_tree" != "$expected_tree" ]; then
  printf 'Prospective tree mismatch. Expected %s, got %s.\n' \
    "$expected_tree" "$preflight_tree" >&2
  exit 1
fi

gh pr merge 358 --squash --match-head-commit 7159d8b5eb7f3b07e19620269b5f548bcd0d7e3a \
  --repo BeniCheni/kickoff \
  --subject 'test(sync): verify available and degraded UCL standings' \
  --body-file - <<'SQUASH_MESSAGE'
Verify both standings states independently of the generated snapshot, preserving the exact written payload and report assertions. Record the tooling fix under Unreleased / Fixed. Closes #361.

Codex GPT-6.2 Astra held Passes 0, 1 and 1.5. Claude Code Opus 5.5 built the change, ran Pass 2 and made the fixes. Fresh Codex GPT-6.2 Sol ran the read-only Pass 2.5 synthesis. Beni adjudicated Pass 3 and authorized the squash.

Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Codex <noreply@openai.com>
SQUASH_MESSAGE

squash=$(gh pr view 358 --repo BeniCheni/kickoff --json mergeCommit --jq '.mergeCommit.oid // empty')
if [ -z "$squash" ]; then
  printf 'GitHub has not returned an actual squash SHA. Check the PR state.\n' >&2
  exit 1
fi

git fetch --no-tags origin "$squash"
actual_tree=$(git rev-parse "${squash}^{tree}")
first_parent=$(git rev-parse "${squash}^1")
printf 'Squash %s\nFirst parent %s\nActual tree %s\nReviewed tree %s\n' \
  "$squash" "$first_parent" "$actual_tree" "$expected_tree"

if [ "$actual_tree" != "$expected_tree" ]; then
  printf 'Tree differs from the reviewed tree. Checking against the landing base.\n' >&2
fi

landing_expected=$expected_tree
if [ "$first_parent" != "$reviewed_main" ]; then
  printf 'Main moved during landing. Recomputing against %s.\n' "$first_parent"
  if ! landing_expected=$(git merge-tree --write-tree "$first_parent" "$reviewed"); then
    printf 'Could not compute the landing tree. Report squash %s and first parent %s.\n' \
      "$squash" "$first_parent" >&2
    exit 1
  fi
fi
if [ "$actual_tree" != "$landing_expected" ]; then
  printf 'Squash tree mismatch. Report squash %s, parent %s, expected %s, actual %s.\n' \
    "$squash" "$first_parent" "$landing_expected" "$actual_tree" >&2
  exit 1
fi
printf 'Squash tree verified against landing base %s.\n' "$first_parent"

git pull --ff-only origin main
git merge-base --is-ancestor "$squash" HEAD
npm ci
npm run typecheck
npm test
npm run build
)
```
````

## Pass 3 and the landing (Fri 27 Nov 2026)

Codex's Pass 2.5 opener is archived as `19dc5e9` on `codex/sync-degraded-review-archive`. Pass
2.5, a fresh Codex session briefed as GPT-6.2 Sol at high, posted
["Mergeable now"](https://github.com/BeniCheni/kickoff/pull/358#issuecomment-7234038722) at
11:26 PM EST at `7159d8b`, with all eight gate clauses met, and escalated. Its comment does not
itself name the model that ran; the session's own log records `gpt-6.2-sol` at `high`.

The Overall Planner put Pass 3 to Beni. His answers:

| Question | Beni |
|---|---|
| "Now" on #352, question 13 (Sat 21 Nov 2026, 7:49 PM EST), seen only in the PR body | **Confirmed** |
| "No" to a refresh, "File" for the Moments risk (#402), "Yes" to the CHANGELOG line | **Confirmed** |
| Squash #358 onto `main` with Pass 2.5's handoff block | **Merge** |

On "Merge", the Overall Planner ran the handoff block from a clean `main` in
`kickoff-pr358-pm`. Both pins held: `main` `13d4ebe`, head `7159d8b`, prospective tree `2f50ae6`.
GitHub squashed #358 at 11:37 PM EST as `13f1f017365e961b706831032b334da36d4b25f7`, with
first parent `13d4ebe` and tree `2f50ae6185f5834298d124940a9848849e47d772`, equal to the
reviewed tree. The squash carries both co-author trailers, and #361 closed with it. After the
pull, on `main`: `npm ci`, `npm run typecheck`, `npm test` (1,245 tests in 89 files) and
`npm run build` all passed, and the script exited 0.

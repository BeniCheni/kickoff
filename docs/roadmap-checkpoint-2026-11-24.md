# The Overall Planner's first checkpoint: what is true on Tue 24 Nov 2026, and the next five workstreams (TZ=America/New_York)

Written by the Kickoff Overall Planner (Claude Code, `claude-opus-5-5` at `high`) on Tue 24 Nov
2026 from about 11:29 AM EST, in the worktree `/Users/benicheni/code/kickoff-overall-planner` on
`claude/overall-planner-checkpoint`, cut from `origin/main` at `605ef5d`. The brief is
`docs/overall-planner-checkpoint-prompt.md` on `origin/claude/track-a-archive-8` (`8e198de`), read
from the archive after `git fetch origin`; the pasted copy matched it. The Track A close-out
beside it was read whole.

This seat reads, ranks and recommends. It built nothing, reviewed no PR, briefed no build, ran
no sync and pushed nothing. Every figure below carries the command that produced it, run in this
session from the worktree. The receipts are in `~/code/kickoff-receipts/overall-planner/`, one
file per command group.

---

## Part 1 — the checkpoint

### 1.1 What has shipped: v0.5.5, and the four records agree

| Record | Reads | Command |
|---|---|---|
| `package.json` | `0.5.5` | `node -p 'require("./package.json").version'` |
| `package-lock.json` | `0.5.5` at lines 3 and 9 | `grep -n '"version"' package-lock.json \| head -2` |
| Newest tag | `v0.5.5`, annotated, 14 Nov 2026 5:14 PM EST, on `026f9f9`, an ancestor of `main` | `git tag --sort=-creatordate \| head -5`; `git for-each-ref refs/tags/v0.5.5 --format='%(objecttype) %(taggerdate:iso) %(*objectname:short)'`; `git merge-base --is-ancestor v0.5.5 origin/main` |
| `CHANGELOG.md` | `[Unreleased]` at line 9, `[0.5.5] — 2026-11-14` at line 24 | `grep -n '^## \[' CHANGELOG.md` |
| README | badge `0.5.5` (line 4), "What it does today (v0.5.5)" (line 205), Lineage leads with v0.5.5 (line 442) | `grep -n 'badge/version-\|What it does today' README.md` |
| `docs/` | the clearing's five prompts, `design-overhaul-clearing-*.md`, for PR #320 | `ls docs \| grep clearing` |

They agree. `[Unreleased]` holds four lines (`sed -n 9,24p CHANGELOG.md`): the SessionStart
hook's context (#364), the preview smoke's new landmark (PR 0), the stylesheet no longer
changing when docs change (#323) and the `GIT_DIR` isolation (#370). None of them is
user-visible, so none of them is a release on its own (`.claude/rules/releases.md:44-48`).

### 1.2 `main` and `overhaul/second-edition`

Commands: `git log -1 --format='%h %ad %s' --date=iso origin/main` (and the same for the
branch); `git rev-list --left-right --count origin/main...origin/overhaul/second-edition`;
`git merge-base origin/main origin/overhaul/second-edition`;
`git log --merges --first-parent origin/overhaul/second-edition`.

- **`main`** is at `605ef5d` (#369, 24 Nov 11:12 AM EST).
- **`overhaul/second-edition`** is at `45b7bc6` (#352, PR 4, 22 Nov 10:07 PM EST).
- **Apart:** `main` has 28 commits the branch lacks; the branch has 12 `main` lacks.
- **Main last merged in:** #336 (`34b5160`, 17 Nov 1:42 PM CST, so 2:42 PM EST). The merge base
  is `2aea6c8` (#335). PRs 1b to 4 were squashed, so the refreshes #352 took before its squash
  are in its tree but not in the ancestry.
- **PR 5 carries a newer `main`.** #377's head holds Codex's `9720754` ("Merge main into the
  Poster books build", 23 Nov 10:25 PM EST), which reaches `2b624a1` (#365) and not #376, #370,
  #369 or the sync commit `cfff1c2`
  (`git log --merges origin/overhaul/second-edition..origin/codex/overhaul-pr5-books`;
  `git merge-base --is-ancestor <sha> origin/codex/overhaul-pr5-books` for each). When PR 5
  merges, the branch takes `main` through #365, and the three-dot diff GitHub shows for #377
  (74 files, +13,271/−6,530) includes that merge. A cold reader must be told which part is PR 5's.

### 1.3 The overhaul's plan of record against what has merged

The PR list is section 3 of `docs/design-overhaul-plan.md` (lines 213-260). Its amendments are
in section 4.2 (PR 1b at line 340, PR 7b at line 390). The brief's "section 4" names the
amendments' home, not the table's.

Seats are read from the README's table (`README.md:368-378`) as #369 left it: when Codex builds,
the PM seat holds Passes 0 and 1.5, a fresh Claude Code session on Fable 5.2 holds Pass 1, Codex
holds Pass 2, and a fresh Claude Code session on Opus 5.5 holds Pass 2.5. When Claude builds,
Codex holds Passes 0, 1, 1.5 and 2.5, and Claude Code on Fable 5.2 holds Pass 2. Beni holds
Pass 3 in both.

| PR | State | Evidence | Tier | Seats |
|---|---|---|---|---|
| 0 · Pin, then repaint | merged to `main`, `2fd2466`, 16 Nov | `git merge-base --is-ancestor 2fd2466 origin/main` | 3 | ran under the Sun 15 routing |
| 1 · Tokens and type | merged, `3733fd9`, 17 Nov | first-parent log above | 3 | ran under the Sun 15 routing |
| 1b · The font split | merged, `8173066` (#341), 18 Nov | same | 3 | Cursor built; Codex column from Pass 1 |
| 2 · Chrome and the motion control | merged, `d9b97d4` (#342), 19 Nov | same | 3 | Cursor built; Claude column from Pass 1 |
| 3 · The Ledger | merged, `1e09592` (#349), 21 Nov, and `52fe62b` (#359), 22 Nov | same | 3 | Codex built |
| 4 · The Table's skin | merged, `45b7bc6` (#352), 22 Nov | same | 3 | Claude built |
| 5 · Poster's books, still | **open, #377**, no pass started | 1.4 below | 3 (`src/lib/lensSelectors.ts`, `src/lib/time.ts`, `tests/dom/poster.test.tsx`) | Codex built: the Codex column |
| 6 · The Rack turns | unstarted, no brief | `ls docs \| grep pr6` is empty | 3 at least (it touches Poster's tests) | Codex by default (R4) |
| 7 · Imagery and its licence | unstarted, no brief | `ls docs \| grep pr7` is empty | 3 likely | Codex by default |
| 7b · The offline trim | unstarted; brief after PR 7 merges (`docs/design-overhaul-plan.md:399`) | | 2 or 3 by its paths | Codex by default |
| 8 · The decorative layer | unstarted; the seat question is open (`:257`) | | 3 likely | Beni's word |
| 9 · The release | unstarted | | 3 (release) | the 360, Beni merges and tags |

`ls docs | grep -E 'pr[6-9]'` returns nothing, which is the evidence for "no brief".

### 1.4 Every open PR and issue

Commands: `gh pr list --state open --json number,title,headRefName,baseRefName,mergeStateStatus,updatedAt,createdAt,changedFiles`
and `gh pr view <n> --json commits,headRefOid,statusCheckRollup,reviews,comments`;
`gh issue list --state open --json number,title,labels,createdAt,updatedAt`. The two `gh`
commands ran outside the sandbox, whose proxy fails `gh`'s certificate check. Times are EST.

| # | What | Tier | Last activity | State |
|---|---|---|---|---|
| [#377](https://github.com/BeniCheni/kickoff/pull/377) | PR 5, the Poster's books, into the integration branch. 36 commits (11 Codex, 10 `main` squashes, 15 sync), head `81101fe`. CLEAN; `verify`, `vercel-smoke` and Vercel green; 0 reviews | 3 | opened 23 Nov 11:00 PM, updated 11:26 PM | **Live.** Waits for its Pass 0 brief |
| [#379](https://github.com/BeniCheni/kickoff/pull/379) | Track A's archive, 14 files, all under `docs/`, none on the Tier 3 list. CLEAN, `verify` green, 0 reviews | 1 | opened 24 Nov 11:00 AM, updated 11:22 AM | **Live.** Waits for its tier 1 read by Codex, then Beni's merge |
| [#358](https://github.com/BeniCheni/kickoff/pull/358) | `tests/sync.test.ts` states the degraded list instead of inheriting it; closes #361. One file, one commit by Claude (`99757f3`), 12 behind `main`, merges cleanly (`git merge-tree --write-tree origin/main origin/claude/sync-test-degraded-standings-88bd26` exits 0). CLEAN, checks green, 0 reviews | 3 (`tests/sync.test.ts`, `AGENTS.md:76`) | updated 21 Nov 9:37 PM | **Idle, with a deadline** (1.5) |
| [#328](https://github.com/BeniCheni/kickoff/pull/328) | The review loop's plan of record and the overhaul's routing to 19 Nov, 41 files under `docs/`. DIRTY on `docs/README.md` only (`git merge-tree --write-tree --name-only origin/main origin/docs/review-loop-plan`); only Vercel ran, so no `verify` | 1 | Claude commits at 10:28 and 11:22 AM today (`git log -6 origin/docs/review-loop-plan`) | **Live**, in another session's hands (it is archiving elenchus PR 9's passes). Not this seat's to touch |
| [#361](https://github.com/BeniCheni/kickoff/issues/361) | `tests/sync.test.ts:84` fails once the snapshot lacks a UCL table | (#358's) | 21 Nov 9:37 PM | open; #358 closes it |
| [#360](https://github.com/BeniCheni/kickoff/issues/360) | Next reader: Back then Forward to the Table shows La Liga under `league=pl` | 2 (3 if the fix touches `src/lib/useUrlState.ts`) | 21 Nov 9:37 PM | open; the Next reader is not public |
| [#372](https://github.com/BeniCheni/kickoff/issues/372)–[#375](https://github.com/BeniCheni/kickoff/issues/375) | PM chores F4: four link and SHA edge cases in `scripts/pm/`, labelled `bug` | 2 | 23 Nov 10:05 PM | open; tooling only, no reader sees them |

### 1.5 The sync, and the one dated risk

- **The runs.** The last ten `sync.yml` runs on `main` all succeeded, the latest at 6:01 AM EST
  today on `cfff1c2` (`gh run list --workflow sync.yml --branch main --limit 10`). Of the last
  100, back to 1 Nov, 99 succeeded and one failed, run `41709751644` on 3 Nov
  (`gh run list --workflow sync.yml --branch main --limit 100 --json conclusion,databaseId,createdAt`).
- **The risk, L2, verified.** `tests/sync.test.ts:24` reads the committed
  `src/data/standings.json` as `table`, and line 84 expects the report to end
  `standings-degraded=none`. ESPN's provider returns a league with no rows, and so writes
  `degraded: ['ucl']`, only when the UCL payload changes shape **and**
  `afterPhaseWindows` is true (`scripts/providers/espn-standings.ts:119-123`). That function is
  true when the Brooklyn date is later than the last window's `to`
  (`src/lib/matchdays.ts:16-19`), which is `2027-01-27`, matchday 8, from UEFA's Annex C as read
  on 10 Sep 2026 (`src/lib/competitions.ts:137-150`). The snapshot agrees: 90 UCL fixtures, all
  `league-phase`, the last at `2027-01-27T20:00Z`, round 8; and today's standings carry a
  36-row UCL table and no `degraded` key (two `node -e` reads of `src/data/*.json`, receipt 10).
- **What it does.** `sync.yml` runs `npm test` on the snapshot it has just written
  (`.github/workflows/sync.yml:211-216`, "Verify the written snapshot"). So the first sync on or
  after **Thu 28 Jan 2027** that finds ESPN's league-phase table gone or short writes the
  degraded file, fails its own verify step, and publishes nothing. Every run after it fails the
  same way, and every Step 0 that day must re-verify each open position from primary sources
  (`CLAUDE.md`, "Scheduled sync"). That is **65 days** from today
  (`echo $(( ($(date -j -f %Y-%m-%d 2027-01-28 +%s) - $(date -j -f %Y-%m-%d 2026-11-24 +%s)) / 86400 ))`).
- **Not verified:** whether and when ESPN drops or reshapes the league-phase table after 27 Jan.
  This seat did not call ESPN, as the brief forbids a sync. If ESPN keeps the 36 rows, nothing
  degrades and the test stays green. The deadline is the earliest date the failure can happen,
  not a date it will.
- **Nothing else dated** was found that turns `verify` red with no code change. The other tests
  that read `src/data/` (`grep -rln 'src/data/' tests web/test`, 16 files) were not each proved
  date-safe; that is a limit of this read.

### 1.6 The parked work, and what each waits on

- **Moments and the Studio.** Parked by Beni on 14 Nov "while he rethinks the user journey"
  (`docs/roadmap-pointers.md:20-22`; `README.md:405-407`). Waits on that rethink, which has no
  date.
- **N5** (publication delivery, the fallback PR contract and privacy,
  `docs/nextjs-migration-plan.md:352`). Parked with Moments by the same line. A
  `docs/nextjs-migration-n5-plan-prompt.md` sits untracked in Beni's checkout, which this seat did
  not open; it is not on `main`.
- **The Next.js cutover.** The minor after v0.6.0, its number Beni's when it is scoped
  (`docs/roadmap-pointers.md:20-21`; plan review ruling 12). Waits on v0.6.0, then N5 to N7.
- **The betting-track bridge.** Fixture ids joined to a `positions.json` and a token-expiry
  badge. "Not yet on the ranked list; blocked on defining those files in `../Sportsbooks/`"
  (`docs/roadmap-pointers.md:50-54`). Waits on the Sportsbooks side.

### 1.7 Stale records

Each is quoted from `main` at `605ef5d` (`grep -n` on the file named).

1. **The review skill contradicts #369 on four points.** `.claude/skills/kickoff-pr-review/SKILL.md`
   - line 38: Pass 0 is "a Claude Code session, Fable 5.1 High". The README gives Passes 0 and 1.5
     to the PM seat, and Beni's notes forbid Fable 5.1.
   - line 39: Pass 1 runs on "Fable 5.1 Extra" and leaves "fix commits for what it reproduced".
     The README says Pass 1 is report-only and the builder commits every fix (`AGENTS.md:47-48`).
   - line 41: the builder is "Codex, GPT-6 Astra Extra High"; line 42 gives Pass 2.5 to "the PM
     seat". The README gives it to a fresh Opus 5.5 session that writes nothing.
   - lines 56-62: the Pass 2.5 merge gate auto-merges a non-release PR. Since #369 a Tier 3 merge
     "takes Beni's word" (`AGENTS.md:48`), and every 360 is Tier 3.
   - line 26: "Model routing: `CLAUDE.md`'s routing line". `CLAUDE.md:40` now points to the
     README for routing.

   The Codex pointer, `.agents/skills/kickoff-pr-review/SKILL.md`, says the README owns the
   routing, which softens line 38's to 42's seat names for Codex but not the Pass 1 or merge-gate
   rules. The skill was last touched by #320 on 14 Nov
   (`git log -3 -- .claude/skills/kickoff-pr-review/SKILL.md`).
2. **`CLAUDE.md:32-33`**: the cycle runs "with the Pass 2.5 merge gate that decides auto-merge
   versus escalation". Overtaken by Tier 3's "merge takes Beni's word".
3. **`docs/design-overhaul-plan.md:217`**: "**Cursor builds** (Grok 4.7, Extra High) … **Pass 2.5**
   is Codex's synthesis", citing `README.md:387-392` and `:376`, lines that now hold other text
   (`sed -n 376p README.md`; `sed -n 387,392p README.md`). The Tue 17 Nov amendment that
   replaced this paragraph exists only on #328's branch, not on `main`.
4. **`docs/design-overhaul-plan.md:257`**: PR 8's choice "between Cursor and Codex should follow
   quota, as `README.md:390` says". Line 390 is now the "📍 Where we are" heading, and
   since #369 Codex builds by default.
5. **#328's routing tables (L3).** Its Tue 17 Nov amendment gives Pass 2.5 in the Codex column to
   "a fresh Claude Code session on `claude-fable-5-2` at `xhigh`"; the README since #369 gives it
   to Opus 5.5. #328 is live in another session, so this is a note for that seat, not an edit.
6. **Beni's global notes (L6, outside this repo).** `~/.claude/CLAUDE.md` says R1, R4 and R6 are
   "not yet in those tables". #369 put R1 in the README's tier table (`README.md:340-345`) and
   `AGENTS.md:37-55`, R4 in "Codex is the default builder" (`README.md:368`), and R6 in Tier 1's
   "will run only on branches in this repo" (`README.md:343`). The note is stale. It is Beni's
   file.
7. **`docs/README.md:28-29`**: "The current release sequence is **v0.4.0 sync first, v0.5.0
   European week second**". v0.5.5 has shipped and v0.6.0 is next.
8. **`README.md:398-400`**: "Next: the second edition, as v0.6.0. The first build brief (the
   tests-only pull request) … were written on 14 November." Five of the ten PRs have merged
   since.
9. **`docs/roadmap-pointers.md:35`**: "`docs/v0.2.6-ideas.md` is the **current** ranked candidate
   list". It is still the newest ideas file (`ls docs/v*-ideas.md`), but the overhaul plan, not
   an ideas file, has scoped the next release since 14 Nov. Tier 3 path.

Carry-overs on record, owed to later briefs: PR 4's "Later" items, among them the runner's pinned
clock and the `syncedAgo` set-aside (`docs/design-overhaul-pr4-review-prompt.md:683`, `:978`); and
PR 7b's trim (`docs/design-overhaul-plan.md:390-402`).

### 1.8 The sealed leads, each checked

| Lead | Verdict |
|---|---|
| L1 · PR 5 open as #377, 36 commits, CLEAN, green, no pass | **Holds.** Add: its head carries a `main` merge through #365 (1.2) |
| L2 · `tests/sync.test.ts:84` and the end of the league phase | **Holds, with a date:** earliest failure Thu 28 Jan 2027, and it fails the sync run itself, not only `verify` on `main` (1.5) |
| L3 · #328 DIRTY, its builders table superseded | **Holds.** DIRTY on `docs/README.md` alone; the table is superseded in its Pass 2.5 seat; and #328 is live, not stale |
| L4 · #379 waits for its tier 1 read and Beni's merge | **Holds.** No path in it is on the Tier 3 list |
| L5 · #360 and #372 to #375 are open bugs | **Holds.** #372–#375 carry the `bug` label; #360 and #361 carry none |
| L6 · Beni's note on R1, R4, R6 is stale | **Holds** (1.7, item 6) |
| L7 · PR 6 needs a fresh read after PR 5; PR 7 may be preparable beside PR 5 | **Holds in part.** PR 6: yes. PR 7: its brief must follow Beni's full-size look at the Friday cover and the fog plate (plan review ruling 6), and that look needs no repo file. The photographs themselves land in `public/photographs/`, which #377 does not touch (`git diff --name-only origin/overhaul/second-edition...origin/codex/overhaul-pr5-books`), but their crops serve PR 5's and PR 6's boxes, so a build before PR 6 would measure a layout about to change |

---

## Part 2 — the next workstreams

The plan's order binds: rows before books is done (PR 3 merged before PR 5 opened); PR 7b
waits for PR 7; PR 8's seat is Beni's. Nothing in the repo overtakes them.

| Rank | Workstream | Tier | Builder | Reviewers | Beside others? |
|---|---|---|---|---|---|
| 1 | PR 5's six-pass 360 (#377) | 3 | Codex (built) | P0, P1.5: a PM seat · P1: fresh Fable 5.2 · P2.5: fresh Opus 5.5 · P3: Beni | yes |
| 2 | The review skill and `CLAUDE.md:33` catch up with #369 | 3 | Codex | P0, P1.5: PM seat · P1: fresh Fable 5.2 · P2.5: fresh Opus 5.5 · P3: Beni | yes, files apart from #377 |
| 3 | #358's review, before 28 Jan 2027 | 3 | Claude (built) | P0, P1, P1.5, P2.5: Codex · P2: Claude Code Fable 5.2 · P3: Beni | yes, one file on `main` |
| 4 | #379's tier 1 read and merge | 1 | Claude (wrote it) | one cold read by Codex · Beni merges | yes; touches `docs/README.md` |
| 5 | PR 7's pre-brief look (plan review ruling 6) | none | Beni | none | yes, no repo file |

### 1. PR 5's six-pass 360

- **What, and done.** Pass 0's brief, written by a PM seat from a fresh read of #377 at its head,
  then Passes 1 to 3 as the README's Codex column gives them. Done is #377 merged into
  `overhaul/second-edition` on Beni's word, with the cycle archived as
  `docs/design-overhaul-pr5-review-prompt.md` and a row in `docs/README.md`.
- **Why.** It is the critical path. PRs 6, 7, 7b, 8 and 9 all wait on it, and nothing else in the
  overhaul can start.
- **Waits on:** a PM seat. Track A's closed its thread this morning. **Waits on it:** PR 6's
  brief, and everything after.
- **What the brief must carry** (from this read, not from the build's claims): the `main` merge
  inside #377 (`9720754`, 1.2), so Pass 1 reviews PR 5's own diff; the Tier 3 tests it touches;
  the full matrix; and, while item 2 is open, the line that the README's tiers outrank the
  skill's table where they differ.
- **Beside:** yes. It is a branch PR; items 2 to 5 touch other files.
- **Decision for Beni:** who opens the PM seat for Pass 0.

### 2. The review skill catches up with #369

- **What, and done.** One PR to `main` that brings `.claude/skills/kickoff-pr-review/SKILL.md`
  lines 26, 38 to 42 and 56 to 62, and `CLAUDE.md:32-33`, into line with the README's tiers and
  seats: Pass 1 report-only, the builder fixing, Pass 2.5 a fresh seat that writes nothing, a
  Tier 3 merge on Beni's word, no Fable 5.1. Done is the skill and the README saying one thing.
- **Why now.** PR 5's 360 is the next run of this skill. A Pass 1 seat that follows line 39 would
  commit to the PR branch, and a Pass 2.5 seat that follows lines 56 to 62 could auto-merge a
  Tier 3 PR. The Pass 0 brief can override both for PR 5, but #358's cycle and every later one
  would have to repeat the override.
- **Waits on:** nothing. **Waits on it:** nothing hard; it makes items 1 and 3 cheaper to brief.
- **Beside:** yes. #377's own commits do not touch `.claude/skills/`. It must leave
  `docs/design-overhaul-plan.md` (items 3 and 4 in 1.7) alone, because #328 rewrites that
  paragraph in a live session.
- **Decision for Beni:** whether it keeps Tier 3. Only Beni can lower a tier. This seat
  recommends Tier 3: these are the instructions that decide who merges.

### 3. #358, before the league phase ends

- **What, and done.** The 360 the README gives a Claude-built Tier 3 PR, run on a one-file diff.
  Pass 1 must check that the split into two cases weakens no assertion
  (`git diff origin/main...origin/claude/sync-test-degraded-standings-88bd26`). Done is #358
  merged to `main` and #361 closed before Thu 28 Jan 2027.
- **Why.** It keeps `main`'s sync green past the earliest date the snapshot can lose its UCL
  table. A red sync is what every Step 0 that day would pay for.
- **Waits on:** a Codex seat for Passes 0 and 1. The branch is 12 behind `main` and merges
  cleanly; whether it refreshes before Pass 1 is the reviewer's call to recommend and Beni's to
  give. **Waits on it:** nothing.
- **Beside:** yes; one test file on `main`, touched by nothing else open.
- **Decision for Beni:** when it starts. This seat recommends now, while it is small and Codex
  is not yet building PR 6.

### 4. #379, the Track A archive

- **What, and done.** The tier 1 cold read by the vendor that did not write it, Codex, then
  Beni's merge. Done is #379 squashed onto `main`.
- **Why.** It is not on the critical path, but it is the record PR 5's Pass 0 seat reads first,
  and every later brief cites it from the archive branch until it lands.
- **Waits on:** a Codex read. **Waits on it:** nothing hard.
- **Beside:** yes, except for `docs/README.md`, which #379, #328 and this checkpoint's branch all
  add rows to. Whichever merges second resolves a row conflict.
- **Decision for Beni:** none until the read reports.

### 5. PR 7's pre-brief look

- **What, and done.** Beni looks at the Friday cover and the fog plate at full size, the fog
  plate's doorways included (plan review ruling 6), and the fal provenance file is copied
  somewhere durable outside the repo, with its cost fields left where they are
  (`docs/design-overhaul-plan.md`, section 4.1: fal keeps its own logs for 90 days). Done is the
  look's date and verdict, to be written into PR 7's brief when it is drafted.
- **Why.** It is the only PR 7 work that touches no file PR 5 or PR 6 will change, and the
  ruling makes it a gate on PR 7's brief.
- **Waits on:** Beni's time. **Waits on it:** PR 7's brief.
- **Beside:** yes.
- **Decision for Beni:** none beyond doing it.

### Deliberately not started

- **PR 6's brief.** The plan's order, and L7: it must be written from a fresh read after PR 5
  merges, or it describes a Poster still under review.
- **PR 7's brief and build, PR 7b, PR 8, PR 9.** Each waits on the PR before it
  (`docs/design-overhaul-plan.md:399` for 7b). PR 8's seat question stays Beni's, read now as
  Codex by default under #369 unless he routes it.
- **A `main` refresh of the integration branch.** #377 already carries `main` through #365; a
  separate refresh now would move PR 5's base under its review.
- **The stale lines in `docs/design-overhaul-plan.md`** (items 3 and 4). #328 owns that paragraph
  in a live session.
- **#360.** The Next reader is behind Vercel's sign-in; the fix belongs with the cutover's work.
- **#372 to #375.** Tooling edge cases that no reader sees. Batch them after PR 5's cycle.
- **Moments, the Studio, N5, the cutover and the betting bridge.** Parked by Beni, or blocked
  outside this repo (1.6).

---

## Beni's rulings on the forks

Put one at a time in chat, each with this seat's recommendation first. Each ruling is recorded
here with its time.

1. **Fork 1, PR 5's Pass 0: "Yes"** (Tue 24 Nov 2026, 11:46 AM EST). A fresh PM seat on Opus 5.5
   at High writes PR 5's Pass 0 brief now, for #377 at its head. The brief carries the points
   under workstream 1: the `main` merge at `9720754`, the Tier 3 tests, the full matrix, and the
   README's tiers outranking the skill's table while workstream 2 is open. This seat writes no
   brief; it only records the ruling.
2. **Fork 2, the review skill's tier: "Yes, Tier 3"** (Tue 24 Nov 2026, 11:48 AM EST). Workstream
   2, which brings `.claude/skills/kickoff-pr-review/SKILL.md` and `CLAUDE.md:32-33` into line
   with #369, keeps Tier 3 and takes the six-pass 360 in the README's Codex column, with the
   merge on Beni's word. Its brief stays out of `docs/design-overhaul-plan.md`, which #328
   rewrites.

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
| README | badge `0.5.5` (line 4), "What it does today (v0.5.5)" (line 205), Lineage leads with v0.5.5 (line 442) | `grep -n -e 'badge/version-' -e 'What it does today' README.md`; `grep -n '^- \*\*v0\.5\.5' README.md` |
| `docs/` | the clearing's five prompts, `design-overhaul-clearing-*.md`, for PR #320 | `ls docs \| grep clearing` |

They agree. `[Unreleased]` holds four lines (`sed -n 9,24p CHANGELOG.md`): the SessionStart
hook's context (#364), the preview smoke's new landmark (PR 0), the stylesheet no longer
changing when docs change (#323) and the `GIT_DIR` isolation (#370). They are unreleased. None
is user-visible, but the release rule allows a patch made of tooling or docs
(`.claude/rules/releases.md:44-48`), so whether they ship as a patch before v0.6.0 or inside it
is Beni's call. This seat recommends neither. (*Corrected after #381's cold read:* this
paragraph first said that none of them is a release on its own.)

### 1.2 `main` and `overhaul/second-edition`

Commands: `git log -1 --format='%h %ad %s' --date=iso origin/main` (and the same for the
branch); `git rev-list --left-right --count origin/main...origin/overhaul/second-edition`;
`git merge-base origin/main origin/overhaul/second-edition`;
`git log --merges --first-parent origin/overhaul/second-edition` (the last `main` merge);
`git log --first-parent --format='%h %as %s' 2fd2466^..45b7bc6` (the squashes and their dates,
which `--merges` omits).

- **`main`** is at `605ef5d` (#369, 24 Nov 11:12 AM EST).
- **`overhaul/second-edition`** is at `45b7bc6` (#352, PR 4, 22 Nov 10:07 PM EST).
- **Apart:** `main` has 28 commits the branch lacks; the branch has 12 `main` lacks.
- **Main last merged in:** #336 (`34b5160`, 17 Nov 1:42 PM CST, so 2:42 PM EST). The merge base
  is `2aea6c8` (#335). PRs 1b to 4 were squashed, so the refreshes #352 took before its squash
  are in its tree but not in the ancestry.
- **PR 5 carries a newer `main`.** #377's head holds Codex's `9720754` ("Merge main into the
  Poster books build", 23 Nov 10:25 PM EST). Its second parent is `425abcf` (#376), so it
  reaches `main` through #376 and not #370, #369 or the sync commit `cfff1c2`
  (`git log --merges origin/overhaul/second-edition..origin/codex/overhaul-pr5-books`;
  `git show -s --format='%h %s' 9720754^2`; `git merge-base --is-ancestor <sha> 81101fe` for
  each). *Corrected after #381's cold read:* this line first said "through #365", because only
  `2b624a1` was tested; `425abcf` is an ancestor too. When PR 5 merges, the branch takes `main`
  through #376. GitHub's comparison for #377 is 74 files, +13,271/−6,530
  (`git diff --shortstat 45b7bc6...81101fe`) and includes that merge. The Poster commits after
  the merge change 35 files, +1,161/−439 (`git diff --shortstat 9720754..81101fe`). A cold
  reader needs both comparisons, and the merge's own conflict resolutions read separately.

### 1.3 The overhaul's plan of record against what has merged

The PR list is section 3 of `docs/design-overhaul-plan.md` (lines 213-260). Its amendments are
in section 4.2 (PR 1b at line 340, PR 7b at line 390). The brief's "section 4" names the
amendments' home, not the table's.

Seats are read from the README's table (`README.md:368-378`) as #369 left it: when Codex builds,
the PM seat holds Passes 0 and 1.5, a fresh Claude Code session on Fable 5.2 holds Pass 1, Codex
holds Pass 2, and a fresh Claude Code session on Opus 5.5 holds Pass 2.5. When Claude builds,
Codex holds Passes 0, 1, 1.5 and 2.5, and Claude Code holds Pass 2. Beni holds Pass 3 in both.
*Amended 24 Nov, about 12:05 PM EST:* #380 (`86155da`, merged 12:01 PM) changed the "When Claude
builds" column's build and Pass 2 seat from Fable 5.2 to Opus 5.5 (`git diff 605ef5d 86155da --
README.md`). This file was read before it; where it named Fable 5.2 for that seat, the README now
says Opus 5.5, and the README wins.

The tier column classifies each PR by today's Tier 3 paths (`AGENTS.md:56-101`). For a merged PR
that is a retrospective reading of its diff (`gh pr diff <n> --name-only` against that list).
Every numbered PR that has merged took the six-pass 360 whatever this column says; #359, PR 3's
follow-up, took a single fast-track read (`docs/design-overhaul-pr3-review-prompt.md:932-934`).
For an unbuilt PR the column is a forecast, since its paths are not yet known. (*Corrected after
#381's cold read:* the column first gave every merged PR Tier 3, PR 1b included.)

| PR | State | Evidence | Tier (today's paths) | Seats |
|---|---|---|---|---|
| 0 · Pin, then repaint | merged to `main`, `2fd2466`, 16 Nov | `git merge-base --is-ancestor 2fd2466 origin/main` | 3 (`scripts/vercel-smoke.mjs`) | ran under the Sun 15 routing |
| 1 · Tokens and type | merged, `3733fd9`, 17 Nov | first-parent log above | 3 (`scripts/scan-offline-bundle.ts`) | ran under the Sun 15 routing |
| 1b · The font split | merged, `8173066` (#341), 18 Nov | same | 2: no path on the list; it took the 360 then | Cursor built; Codex column from Pass 1 |
| 2 · Chrome and the motion control | merged, `d9b97d4` (#342), 19 Nov | same | 3 | Cursor built; Claude column from Pass 1 |
| 3 · The Ledger | merged, `1e09592` (#349), 21 Nov, and `52fe62b` (#359), 22 Nov | same | 3 | Codex built |
| 4 · The Table's skin | merged, `45b7bc6` (#352), 22 Nov | same | 3 | Claude built |
| 5 · Poster's books, still | **open, #377**, no pass started | 1.4 below | 3 (`src/lib/lensSelectors.ts`, `src/lib/time.ts`, `tests/dom/poster.test.tsx`) | Codex built: the Codex column |
| 6 · The Rack turns | unstarted, no brief | `ls docs \| grep pr6` is empty | forecast 3, if it touches `tests/dom/poster.test.tsx` | Codex by default (R4) |
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
| [#328](https://github.com/BeniCheni/kickoff/pull/328) | The review loop's plan of record and the overhaul's routing to 19 Nov, 41 files under `docs/`. DIRTY on `docs/README.md` only (`git merge-tree --write-tree --name-only origin/main origin/docs/review-loop-plan`); only Vercel ran, so no `verify` | 2: it carries a non-Markdown file under `docs/`, `docs/verification/review-loop/cursor-models-2026-11-15-super.txt`, and Beni's Pass 3 on #369 keeps such files Tier 2 (`git show -s --format=%B 605ef5d`). *Corrected after #381's round-2 read;* first written as 1 | Claude commits at 10:28 and 11:22 AM today (`git log -6 origin/docs/review-loop-plan`) | **Live**, in another session's hands (it is archiving elenchus PR 9's passes). Not this seat's to touch |
| [#361](https://github.com/BeniCheni/kickoff/issues/361) | `tests/sync.test.ts:84` fails once the snapshot lacks a UCL table | (#358's) | 21 Nov 9:37 PM | open; #358 closes it |
| [#360](https://github.com/BeniCheni/kickoff/issues/360) | Next reader: Back then Forward to the Table shows La Liga under `league=pl` | 2 (3 if the fix touches `src/lib/useUrlState.ts`) | 21 Nov 9:37 PM | open; the Next reader is not public |
| [#372](https://github.com/BeniCheni/kickoff/issues/372)–[#375](https://github.com/BeniCheni/kickoff/issues/375) | PM chores F4: four link and SHA edge cases in `scripts/pm/`, labelled `bug` | 2 | 23 Nov 10:05 PM | open; tooling only, no reader sees them |

### 1.5 The sync, and its dated risks

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
  36-row UCL table and no `degraded` key
  (`node -e 'const f=require("./src/data/fixtures.json").filter(x=>x.competition==="ucl").sort((a,b)=>a.kickoffUtc.localeCompare(b.kickoffUtc));console.log(f.length,[...new Set(f.map(x=>x.phase))],f.at(-1).kickoffUtc,f.at(-1).round)'`;
  `node -e 'const s=require("./src/data/standings.json");console.log(s.leagues.ucl.length,s.degraded)'`).
- **What it does.** `sync.yml` runs `npm test` on the snapshot it has just written
  (`.github/workflows/sync.yml:211-216`, "Verify the written snapshot"). So the first publishing
  sync on or after **Thu 28 Jan 2027** that finds ESPN's league-phase table gone or short writes
  the degraded file, fails its own verify step, and publishes nothing. Each publishing run that
  still receives the degraded table fails the same way. A run that gets an intact table again
  does not, and nor does a dry run or a fetch-only quiet check, both of which skip that step
  (its `if`, `.github/workflows/sync.yml:212`). Every
  Step 0 after a failed run must re-verify each open position from primary sources
  (`CLAUDE.md`, "Scheduled sync"). That is **65 days** from today
  (`echo $(( ($(date -j -f %Y-%m-%d 2027-01-28 +%s) - $(date -j -f %Y-%m-%d 2026-11-24 +%s)) / 86400 ))`).
- **Not verified:** whether and when ESPN drops or reshapes the league-phase table after 27 Jan.
  This seat did not call ESPN, as the brief forbids a sync. If ESPN keeps the 36 rows, nothing
  degrades and the test stays green. The deadline is the earliest date the failure can happen,
  not a date it will.
- **A second risk, conditional on future fixtures** (*added after #381's cold read*).
  `tests/moments.test.ts:6` takes `FIXTURES.find(f => f.id.startsWith('ucl:'))!` from
  `src/lib/fixtures`, and line 8 reads its `id` while the module loads. A valid snapshot whose
  window holds no `ucl:` fixture fails that suite's collection, and so the sync's verify step.
  The window is 30 days back to 150 forward (`scripts/sync.ts:110-111`). In the committed data,
  the 555 fixtures from 28 Jan 2027 on include no UCL one
  (`node -e 'const f=require("./src/data/fixtures.json").filter(x=>x.kickoffUtc.slice(0,10)>="2027-01-28");console.log(f.length,f.find(x=>x.id.startsWith("ucl:"))?.id)'`
  prints `555 undefined`). That proves only what Kickoff has stored, not what ESPN lists. The
  normaliser keeps eligible UCL events of any phase under a `ucl:` id
  (`scripts/providers/espn.ts:233`, `:341-345`) and copies the phase slug only for
  `league-phase` (`:272-276`), so a stored knockout tie satisfies the test by its id even with no
  phase. The risk is real only if a whole window holds no UCL event. The window is inclusive
  (`scripts/window.ts:4-9`), so a run on 26 Feb 2027 still reaches back to 27 Jan, and
  **Sat 27 Feb 2027** is the first run date whose window leaves out the last league-phase night
  (`TZ=America/New_York date -j -v-30d -f '%Y-%m-%d' 2027-02-27 '+%F'` prints `2027-01-28`).
  Not verified: whether and when ESPN lists the knockout ties. (*Corrected after #381's round-2
  read:* this paragraph first gave "about 26 Feb" and leaned on the schema, which describes what
  a stored fixture may hold, not what the normaliser keeps.)
- **Nothing else dated** was found. This read's first search, `grep -rln 'src/data/' tests
  web/test` (16 files), finds only literal paths and missed `tests/moments.test.ts`, which reads
  the snapshot through `src/lib/fixtures`. The other consumers of that module were not each
  proved date-safe; that is a limit of this read.

### 1.6 The parked work, and what each waits on

- **Moments and the Studio.** Parked by Beni on 14 Nov "while he rethinks the user journey"
  (`docs/roadmap-pointers.md:20-22`; `README.md:405-407`). Waits on that rethink, which has no
  date.
- **N5** (publication delivery, the fallback PR contract and privacy,
  `docs/nextjs-migration-plan.md:352`). Parked with Moments by the same line. A
  `docs/nextjs-migration-n5-plan-prompt.md` sits untracked in Beni's checkout, which this seat did
  not open; it is not on `main`.
- **The Next.js cutover.** The minor after v0.6.0, its number Beni's when it is scoped
  (`docs/roadmap-pointers.md:20-21`; plan review ruling 12). N6a (#231) and N6b (#236) are
  already on `main` (`git log origin/main --oneline --grep='N6[abc]'`). What is still owed is
  v0.6.0, then N5 and the cutover itself, N7 (`docs/nextjs-migration-plan.md:352`, `:372`), and
  whatever of N6 remains, which this seat did not audit.
- **The betting-track bridge.** Fixture ids joined to a `positions.json` and a token-expiry
  badge. "Not yet on the ranked list; blocked on defining those files in `../Sportsbooks/`"
  (`docs/roadmap-pointers.md:50-54`). Waits on the Sportsbooks side.

### 1.7 Stale records

Each is quoted from `main` at `605ef5d` (`grep -n` on the file named).

1. **The review skill contradicts #369 at several points.** `.claude/skills/kickoff-pr-review/SKILL.md`
   - line 38: Pass 0 is "a Claude Code session, Fable 5.1 High". The README gives Passes 0 and 1.5
     to the PM seat, and Beni's notes forbid Fable 5.1.
   - line 39: Pass 1 runs on "Fable 5.1 Extra" and leaves "fix commits for what it reproduced".
     The README says Pass 1 is report-only and the builder commits every fix (`AGENTS.md:47-48`).
   - line 41: the builder is "Codex, GPT-6 Astra Extra High"; line 42 gives Pass 2.5 to "the PM
     seat". The README gives it to a fresh Claude Code session on Opus 5.5 that writes nothing
     when Codex builds, and to a fresh read-only Codex session on GPT-6.2 Sol when Claude builds
     (`README.md:368-379`).
   - lines 230-245, section 5's fix policy, tell the reviewer to fix and commit; lines 266-281,
     the landing steps, tell it to push to the PR branch and squash-merge on "mergeable" or
     "mergeable after fixes" (*added after #381's cold read*).
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
5. **#328's routing tables (L3).** *Corrected after #381's cold read.* The Fable 5.2 synthesis
   line this item first quoted belongs to the earlier conditional table (Sun 15 Nov amendment,
   line 265 at `afdd4a0`). The approved Tue 17 Nov amendment's seats table already gives Pass 2.5
   to Opus 5.5 when Codex builds (line 308), as #369 does. What #369 overtakes is its per-PR
   builder table, lines 318-322: it names Claude for PR 5, which Codex built, and alternates the
   two vendors PR by PR, where #369 makes Codex the default builder (`README.md:368`). Commands:
   `git show afdd4a0:docs/design-overhaul-plan.md | nl -ba | sed -n '261,265p;302,308p;318,322p'`.
   #328 is live in another session, so this is a note for that seat, not an edit.
6. **Beni's global notes (L6, outside this repo).** `~/.claude/CLAUDE.md` says R1, R4 and R6 are
   "not yet in those tables". #369 put R1 in the README's tier table (`README.md:340-345`) and
   `AGENTS.md:37-55`, R4 in "Codex is the default builder" (`README.md:368`), and R6 in Tier 1's
   "will run only on branches in this repo" (`README.md:343`). The note is stale. It is Beni's
   file.
7. **`docs/README.md:28-29`**: "The current release sequence is **v0.4.0 sync first, v0.5.0
   European week second**". v0.5.5 has shipped and v0.6.0 is next.
8. **`README.md:396-398`**: "Next: the second edition, as v0.6.0. The first build brief (the
   tests-only pull request) … were written on 14 November." Six planned PRs have merged since
   (0, 1, 1b, 2, 3 and 4), with #359 as PR 3's follow-up
   (`git log --first-parent --format='%h %s' 2fd2466^..45b7bc6`).
9. **The count of PRs.** `README.md:121-124` ("in ten pull requests … The next eight are reviewed
   into one integration branch") and `docs/roadmap-pointers.md:22-24` ("built as ten PRs")
   predate the two amendments, which make twelve review cycles
   (`docs/design-overhaul-plan.md:215`). The roadmap-pointers line is a Tier 3 path; the README
   lines are not. *Corrected after #381's cold read:* this item first called
   `docs/roadmap-pointers.md:35` stale, but an ideas file can still be the current candidate list
   while the overhaul plan scopes the release, so that claim is withdrawn.

Carry-overs on record, owed to later briefs: PR 4's "Later" items, among them the runner's pinned
clock and the `syncedAgo` set-aside (`docs/design-overhaul-pr4-review-prompt.md:683`, `:978`); and
PR 7b's trim (`docs/design-overhaul-plan.md:390-402`).

### 1.8 The sealed leads, each checked

| Lead | Verdict |
|---|---|
| L1 · PR 5 open as #377, 36 commits, CLEAN, green, no pass | **Holds.** Add: its head carries a `main` merge through #376 (1.2; first written as #365) |
| L2 · `tests/sync.test.ts:84` and the end of the league phase | **Holds, with a date:** earliest failure Thu 28 Jan 2027, and it fails the publishing sync run itself, not only `verify` on `main`; a second, conditional risk sits in `tests/moments.test.ts:6` (1.5) |
| L3 · #328 DIRTY, its builders table superseded | **Holds.** DIRTY on `docs/README.md` alone; its per-PR builder table is superseded by #369 (1.7, item 5; first written as its Pass 2.5 seat); and #328 is live, not stale |
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
| 3 | #358's review, before 28 Jan 2027 | 3 | Claude (built) | P0, P1, P1.5, P2.5: Codex · P2: Claude Code Opus 5.5 (since #380) · P3: Beni | yes, one file on `main` |
| 4 | #379's tier 1 read and merge | 1 | Claude (wrote it) | one cold read by Codex · Beni merges | yes; touches `docs/README.md` |
| 5 | PR 7's pre-brief look (plan review ruling 6) | none | Beni | none | yes, no repo file |

### 1. PR 5's six-pass 360

- **What, and done.** Pass 0's brief, written by a PM seat from a fresh read of #377 at its head,
  then Passes 1 to 3 as the README's Codex column gives them. Done is #377 merged into
  `overhaul/second-edition` on Beni's word, with the cycle archived as
  `docs/design-overhaul-pr5-review-prompt.md` and a row in `docs/README.md`.
- **Why.** It is the critical path. PRs 6, 7, 7b, 8 and 9 all wait on it, and no other overhaul
  build can start. Work that is not a build can go ahead beside it, such as workstream 5's look.
- **Waits on:** a PM seat. Track A's closed its thread this morning. **Waits on it:** PR 6's
  brief, and everything after.
- **What the brief must carry** (from this read, not from the build's claims): the `main` merge
  inside #377 (`9720754`, through #376, 1.2), with both comparisons, `45b7bc6...81101fe` and
  `9720754..81101fe`, and the merge's conflict resolutions to inspect separately; the Tier 3
  tests it touches; the full matrix; the builder's open product questions, so the review
  collects evidence for each (the close-out's "Handed on" list, and #377's "Decisions for Beni":
  the mixed set/unset day's FIRST, the all-hidden shelf line and four more); and, while item 2 is
  open, the line that the README's tiers outrank the skill where they differ.
- **Beside:** yes for the review: it is a branch PR, and items 2 to 5 touch other files. Its
  archive is another matter: it owes a row in `docs/README.md`, which items 2, 3 and 4 may also
  edit. Rows added at the same place may conflict, and whichever lands second then resolves it.
  Today #381 and #379 merge cleanly
  (`git merge-tree --write-tree --name-only origin/claude/overall-planner-checkpoint 8e198de`).
- **Decision for Beni:** who opens the PM seat for Pass 0.

### 2. The review skill catches up with #369

- **What, and done.** One PR to `main` that brings `.claude/skills/kickoff-pr-review/SKILL.md`
  and `CLAUDE.md:32-33` into line with the README's tiers and seats. That covers the summary
  table and gate (lines 26, 38 to 42 and 56 to 62) and the operative steps that still tell a
  reviewer to commit, push and merge: section 5's fix policy (lines 230-245) and the landing
  steps (lines 266-281). Pass 1 is report-only and the builder fixes. Pass 2.5 is a fresh seat
  that writes nothing, in both README columns. A Tier 2 reviewer keeps its authority to merge on
  "Mergeable now" with `verify` green; a Tier 3 merge takes Beni's word. No Fable 5.1. Done is
  the skill, its operative steps included, and the README saying one thing.
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
- **Beside:** yes. #379, #328 and this checkpoint's branch all add rows to `docs/README.md`, so
  rows may conflict, and whichever merges second then resolves it. At #379's tip it merges with
  this branch cleanly (the command under workstream 1); #328 conflicts with `main` there.
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
- **PR 7's brief and build, PR 7b, PR 8, PR 9.** Three gates are explicit. PR 7's brief waits
  for Beni's full-size look (plan review ruling 6, `docs/design-overhaul-plan-review.md:52`). PR
  7b's brief waits for PR 7 to merge (`docs/design-overhaul-plan.md:399`), and the trim must land
  before v0.6.0 (`:393`), so it also gates PR 9. The rest is this seat's recommendation to keep
  the plan's sequence: PR 7 is the still page PR 8 must match with
  motion off ("pixel for pixel", section 3's table), and a build before PR 6 would measure a
  layout about to change. PR 8's seat question stays Beni's, read now as Codex by default under
  #369 unless he routes it, with the plan's second opinion on the builder and PR 0's benchmark
  harness kept.
- **A `main` refresh of the integration branch.** #377 already carries `main` through #376; a
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
3. **Fork 3, #358: "Yes, now"** (Tue 24 Nov 2026, 11:49 AM EST). #358's six-pass 360 starts now
   under the README's "When Claude builds" column: Codex holds Passes 0, 1, 1.5 and 2.5, Claude
   Code on Fable 5.2 holds Pass 2, and Beni holds Pass 3. Pass 1 checks that the split into two
   cases weakens no assertion, and may recommend a refresh onto `main` (12 behind, merging
   cleanly); the refresh is Beni's word. The deadline is the first sync after Wed 27 Jan 2027.
   *Amended about 12:05 PM EST:* the question put to Beni named Fable 5.2 for Pass 2. #380,
   merged at 12:01 PM, moved that seat to Opus 5.5, so Pass 2 is Claude Code on Opus 5.5. The
   ruling, "Yes, now", is unchanged.

All three forks are ruled. Workstreams 4 and 5 needed no ruling.

---

## #381's cold read, and what changed

Codex (`gpt-6.2-astra`, high) read #381 cold at `b42e404` and posted "Not yet" on Tue 24 Nov
2026 at 12:05 PM EST (issue comment 7138659216). It found the Tier 1 tier correct and the
rulings recorded at the right minutes. This seat re-ran each finding before changing anything,
and every one reproduced. This section is the change record; each fix also carries a
"corrected" or "added" marker where it falls:

- PR 5's merge of `main` reaches through #376, #365 included, and Pass 1 needs both
  comparisons (1.2, L1, workstream 1, "Deliberately not started").
- #328's superseded routing is its per-PR builder table, not its Pass 2.5 seat (1.7 item 5, L3).
- The tier column is today's paths, retrospective or forecast; PR 1b reads Tier 2 (1.3).
- Workstream 2's done criterion covers the skill's fix policy and landing steps, both README
  columns and the Tier 2 reviewer's merge authority.
- Workstream 1's archive row can conflict with the other workstreams' `docs/README.md` rows.
- A second, conditional risk in `tests/moments.test.ts:6`, and the standings risk reworded to
  publishing runs that still receive the degraded table (1.5).
- Workstream 1's brief carries #377's open product questions for Beni.
- The README count and the stale PR counts corrected; the `roadmap-pointers.md:35` claim
  withdrawn (1.7 items 8 and 9).
- The unreleased lines may ship as a patch; N6a and N6b are already on `main` (1.1, 1.6).
- The printed commands now produce the figures they stand beside (1.1, 1.2, 1.5).
- The index conflict #380 caused was resolved by merging `main` at `171daee`.

### Round 2

Codex re-read `bd18228` and posted "Not yet" at 12:21 PM EST (issue comment 7139067907). Of
round 1's eleven findings it closed eight and found three partly closed. It also corrected its
own round-1 call: #328 is Tier 2, not Tier 1. This seat re-ran each point, and all reproduced.
The fixes, each marked in place:

- #328's tier is 2, for its non-Markdown file under `docs/` (1.4).
- The moments risk's first date is Sat 27 Feb 2027, because the window is inclusive, and its
  explanation now follows the normaliser rather than the schema (1.5).
- The plan's explicit gates: Beni's look before PR 7's brief, and PR 7b both after PR 7 and
  before v0.6.0 ("Deliberately not started").
- #359's fast-track read set apart from the numbered PRs' 360s (1.3).
- The `docs/README.md` conflicts described as possible, not certain, and workstream 1's "why"
  limited to builds (workstreams 1 and 4).
- The badge grep and the squash log print commands that work; the patch-policy and tier-column
  passages now carry their correction markers; this record is called the change record.

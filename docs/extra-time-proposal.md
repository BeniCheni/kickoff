# Extra time and penalties: a proposal for `docs/v0.2.6-ideas.md` row 107

Written Wed 11 Nov 2026 (America/New_York) by the PM seat (Claude Code, Opus 5.5) at
`250c5c0`, from a fresh read of the repo and of ESPN's public scoreboard. This is rung 1 of
the ladder: an audit and, since Beni ruled on §4 the same day, the spec of record. Beni ruled
the fix a patch, v0.5.4.

## 1. The problem, verified at `250c5c0`

- ESPN gives a match decided after 90 minutes its own final status.
  `scripts/providers/espn.ts:44` leaves `STATUS_FINAL_AET`, `STATUS_FINAL_PEN` and
  `STATUS_SHOOTOUT` unmapped on purpose:
  storing ESPN's score as `full_time` would show a score the books do not settle a Match Result
  on as though it were the 90-minute result.
- Each of those three names throws in `normalizeEvent` (`espn.ts:150–152`). `fetchWindow`
  collects every such event and then refuses the whole fetch (`espn.ts:268–271`), so no
  league's fixtures or table update. That is how one La Liga abandonment froze the snapshot on
  10–12 Oct 2026. (A string that resolves through the map object's prototype, such as
  `constructor`, passes that lookup; the schema check in `scripts/sync.ts:128–134` refuses it
  before any write.)
- The scheduled run passes no `--from` or `--to` (`.github/workflows/sync.yml:111–113`), so it
  fetches every day from 30 days before today, in Brooklyn, to 150 days after
  (`scripts/sync.ts:110–111`, `src/lib/time.ts:106`). The snapshot on `main` records that window
  as 2026-10-12 to 2027-04-10 (`src/data/meta.json`). A finished match stays in the window for
  30 days, and an unmapped final refuses every run that fetches it while ESPN keeps returning
  that status.
- Today's snapshot holds three one-off knockouts: Supercoppa Italiana, Inter v Lazio, Tue 22 Dec
  2026; Supercopa de España, Barcelona v Atlético Madrid, Tue 2 Feb 2027, and Real Sociedad v
  Real Madrid, Wed 3 Feb 2027. If Inter v Lazio is level after 90 minutes and ESPN keeps
  reporting its final as `STATUS_FINAL_PEN` or `STATUS_FINAL_AET`, every run from the final
  whistle through Thu 21 Jan 2027 refuses to write, for every league.
- The European competitions are listed only to the end of their league phase: the last
  Champions League kickoff in the snapshot is 27 Jan 2027, and no European fixture is on or
  after 31 Jan. Once ESPN lists the February knockout ties, a second leg can end the same way.

```bash
git show origin/main:src/data/fixtures.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const f=JSON.parse(s);for(const x of f.filter(x=>/^super/.test(x.competition)))console.log(x.id,x.kickoffUtc,x.home.name,"v",x.away.name,x.status);console.log("European on or after 31 Jan:",f.filter(x=>["ucl","uel","uecl"].includes(x.competition)&&x.kickoffUtc>="2027-01-31").length)})'
git show origin/main:src/data/meta.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).window))'
```

## 2. What ESPN sends, observed 11 Nov 2026

Read with single-day scoreboard requests, the shape the sync makes (`espn.ts:219`). Range
requests (`dates=YYYYMMDD-YYYYMMDD`) answered HTTP 400 today, including the Champions League
range that `tests/fixtures/espn/README.md` records. Nothing here is committed; S1 in §5
records receipts.

The counts below cover ten match days: the Supercoppa on 19 Dec 2025, Coppa Italia on 15–17
Aug 2026, Copa del Rey on 27 and 29 Oct 2026, and the FA Cup on 6–9 Nov 2026. They hold 93
events: 70 `STATUS_FULL_TIME`, 13 `STATUS_FINAL_AET`, 10 `STATUS_FINAL_PEN` and no
`STATUS_SHOOTOUT`.

| Event | Status | `period`, `displayClock` | `score` | `shootoutScore` | At 90′, from `details` |
|---|---|---|---|---|---|
| Supercoppa `758976`, Bologna v Internazionale, 19 Dec 2025 | `STATUS_FINAL_PEN` | 5, 96′ | 1–1 | 3–2 | 1–1 |
| Copa del Rey `401928495`, Sestao v Espanyol, 27 Oct 2026 | `STATUS_FINAL_AET` | 4, 120′+3′ | 4–3 | none | 2–2 |
| Copa del Rey `401928509`, Atlético Tordesillas v Mirandés, 27 Oct 2026 | `STATUS_FINAL_PEN` | 5, 120′ | 3–3 | 2–4 | 3–3 |

```bash
curl -s --compressed 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.copa_del_rey/scoreboard?dates=20261027' | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{for(const e of JSON.parse(s).events){const c=e.competitions[0];console.log(e.id,e.status.type.name,e.status.period,e.status.displayClock,c.competitors.map(t=>t.homeAway+" "+t.team.displayName+" "+t.score+(t.shootoutScore!=null?" ("+t.shootoutScore+")":"")).join(" | "))}})'
```

The Supercoppa row uses `ita.super_cup` and `dates=20251219`. What the reads show:

1. `score` is the score when play ended, extra time included and the shootout never included.
2. After extra time, `score` is not the 90-minute score: Sestao 4–3 Espanyol was 2–2 at 90′.
3. A penalties finish can follow 90 minutes (the Supercoppa went straight to penalties: period
   5 at 96′) or 120 (period 5 at 120′). The status name alone does not say which.
4. In nine of the ten penalties finishes, `details` lists each scored shootout kick as a
   scoring play ("Penalty - Scored", `scoringPlay: true`) marked `shootout: true`, and the
   marked kicks add up to `shootoutScore`. Adding up scoring plays without checking that flag
   counts the kicks as goals. The Supercoppa read lists no kicks at all.
5. None of the 93 events carries `linescores`, so there is no per-period score.
6. Every one-off tie above that went past 90 minutes was level at 90′, as a knockout must be.
   A two-legged tie can go to extra time after a second leg that was not level, so "level at
   90′" comes from the format, not from the status.

## 3. Where a result is read as a 90-minute result today

- The mapper stores `result` only for `full_time` (`espn.ts:182`).
- The Table's form guide turns a `full_time` result into W, D or L (`src/lib/standings.ts:96`).
- The Broadcast ticker prints today's `full_time` results as FT segments
  (`src/lib/lensSelectors.ts:246`).
- A row prints any `result` beside the status pill (`src/components/FixtureRow.tsx:66`), and
  the pill text comes from `STATUS_LABEL` (`:6`), a `Record` over the status enum.
- The diff reports `RESULT_CHANGED` when a stored result moves (`scripts/diff.ts:146–153`).

The unreleased Next app renders the same pages (`web/app/shell.tsx:11–13`), and its own test
renders the same row (`web/test/fixture-edges.test.tsx:3`), so a change lands in both apps.

**Option A: new statuses.** Two stored statuses, named in Q1 (for example `after_extra_time`
and `after_penalties`). `result` holds ESPN's `score`, and `after_penalties` also holds the
shootout score. The form guide and the ticker key on `full_time`, so they leave the new
statuses out until each is handled on purpose. The row prints the score beside the new pill,
and TypeScript requires a label for each. A missed consumer omits a result; it never shows a
120-minute score as a 90-minute one.

**Option B: `full_time` plus a field** such as `decidedAfter: 'extra_time' | 'penalties'`. The
schema change is smaller, but the form guide, the ticker and the `FT` pill keep treating the
row as a 90-minute result until each is changed. A missed one shows the wrong score as
settled.

**Option C: either, plus a 90-minute score** derived from `details`: the scoring plays that are
not shootout kicks and fall in the first two periods, stored only when all non-shootout
scoring plays add up to ESPN's `score`. It gives what over/under and correct-score settlement
need, at the cost of parsing ESPN's clock strings: "90'+5'" is second-half stoppage time, and
"96'" and "120'+1'" are extra time. The Supercoppa read shows `details` can be incomplete for
the shootout. It is not needed before 22 Dec.

## 4. Questions for Beni

Each is answerable in one word. The PM seat's recommendation comes first, with its reason.

**Beni's rulings, Wed 11 Nov 2026,** given in the PM seat's Claude Code session through its
question dialog: Q1 **A**, with the names `after_extra_time` and `after_penalties`; Q2 **No**;
Q3 **Patch, v0.5.4**; Q4 **Yes, as proposed**; Q5 **Cursor**, not the recommended Codex. The
questions and recommendations stay below as they were asked.

**Annotation after Codex's cold read of 11 Nov (its finding 6).** Q3's premise stretched
README.md. Its cutover sentence (`README.md:422–423`) explains why the full-stack work lands as
non-releases, and the public demo already redeploys on every merge (`:45–46`). The patch ruling
and its number stand on `CLAUDE.md`'s patch rule (a fix, no new capability), as v0.5.3 did for
a reader-visible fix.

- **Q1. Stored shape: A or B?** A, because a missed consumer fails closed. If A, confirm the
  names `after_extra_time` and `after_penalties`, or give others.
- **Q2. Contain an unknown status to its own competition in this slice? Yes or No.** No. It
  reopens the one-snapshot boundary Beni adjudicated for v0.2.5 (`CLAUDE.md`, "Scheduled
  sync") and would still leave these results unshown; it gets its own ideas row.
- **Q3. Numbering: patch or none?** Patch. The public app changes, and README.md says the
  public site does not change until the cutover, so a non-release would make that sentence
  false. Against it: `CLAUDE.md`'s roadmap pointers say the version string does not move
  after v0.5.3 until the cutover. The number itself is Beni's.
- **Q4. Display: AET and PENS?** Yes: the pill reads `AET` or `PENS`, the score is ESPN's, a
  shootout follows it in brackets (`3–3 (2–4)`), the Broadcast ticker prints them under their
  own label rather than FT, and the form guide leaves them out.
- **Q5. Builder: Codex or Cursor?** Codex (GPT-6.1 Sol High): it built the snapshot boundary
  this touches (v0.2.5, per `docs/v0.2.6-ideas.md`'s header). Quota decides as usual. Pass 1
  stays Claude Code (Fable 5.1, Extra), per the README's seats.

## 5. Scope, as ruled

**Seats.** Cursor builds (Grok 4.7, Extra High): one PR for the whole slice. Pass 1 is Claude
Code (Fable 5.2, Extra), the vendor that did not build it. Fable 5.2 replaces the 5.1 that Q5
and the README's seats name, by Beni's standing ruling of Wed 11 Nov 2026 at 17:39 EST, given
in another PM session: "Fable 5.2 is the current latest version from Claude. We're using that
for the Pass 1 prompt and future prompts when Fable is desired." He confirmed the same evening,
in this PM seat's session, that it covers this slice. As a release, it escalates at the Pass
2.5 gate, and Beni merges and tags it.

**S1. Receipts.** Record single-day scoreboard responses with at least one `STATUS_FINAL_AET`,
one penalties finish after extra time and one straight after 90 minutes, under
`tests/fixtures/espn/`, each URL named in its README, trimmed to the consumed fields as
`uel-401915586.json` is. Note in that README that the range requests tried on 11 Nov answered
400. If ESPN serves `STATUS_SHOOTOUT`, its `status.type.state` decides: `in` maps to `in_play`
like the other live names, and a completed `post` maps as `STATUS_FINAL_PEN` does, with the
receipt named in the PR. Without a receipt it stays unmapped, and the PR says so.

**S1b. Live statuses, before the build merges.** A run that lands during extra time or a
shootout sees whatever in-progress name ESPN uses then, and an unmapped name refuses that run.
Capture single-day scoreboard responses during the extra time or shootout of a cup match. By
ESPN's calendars read on 11 Nov, the Copa del Rey's second round (16 Nov–15 Dec) and the FA
Cup's (5 Dec) fall before 18 Dec; both competitions played extra time in their first rounds
(§2). Each in-progress name a capture
shows with `state` `in` maps to `in_play`, citing that receipt. The builder captures, or the PM
seat if the builder cannot be online for a match. If no capture succeeds, those names stay
unmapped, the PR says so, and the match-day check below carries the risk.

**S2. Schema.** Add the two statuses to the enum (`src/lib/schema.ts:48`) and an optional
`shootout: { home, away }`. A fixture with `after_extra_time` or `after_penalties` must carry
`result`; `after_penalties` must also carry `shootout`; no other status may carry `shootout`.
Each goal count in either field, for these two statuses, is a nonnegative whole number. Today's
snapshot still parses.

**S3. Mapper.** `STATUS_FINAL_AET` maps to `after_extra_time`, and `STATUS_FINAL_PEN` to
`after_penalties`. In the §2 reads, `score` came as a numeric string ("4") on both sides of all
23 extra-time and penalty finals. `shootoutScore` came as a number (3) on both sides of the 10
penalty finals and was absent from the 13 extra-time finals. `result` comes from `score` on
both new statuses, and `shootout` from `shootoutScore` on `after_penalties` only; an extra-time
final does not read `shootoutScore`. A required value on either side that is missing, or is
not a nonnegative whole number in that shape, refuses the event. `Number` turns `null`, `""`,
`" "`, `false` and `[]` into 0 (row 2's trap, `espn.ts:183–184`), so the check reads the raw
value, not `Number`'s result. A refused event refuses the whole fetch, as an unmapped status
does, so the snapshot boundary is unchanged. The `full_time` path keeps its current parse on
purpose; row 2 stays its own row. `tests/espn.test.ts:158–175` drops the two names from its
rejection list, and receipt tests cover them instead.

**S4. Consumers.** The row shows the `AET` or `PENS` pill and the bracketed shootout; the
ticker prints these results under that label; the form guide is unchanged. In the diff, a first
final (`scheduled` or `in_play` to a new status) is a `STATUS_CHANGED` line whose detail names
both statuses (`scripts/diff.ts:173–178`), as now. `RESULT_CHANGED` also fires, urgent, when
only the shootout changes. It compares the shootout the way it compares the score, home and
away inversion included (`diff.ts:146–149`), and its detail prints the old and new shootout
beside the score, for example `1-1 (3-2) -> 1-1 (2-3)`. Those details reach readers through
the sync PR's log and the digest. The digest copies a bounded excerpt of that log, the first
400 lines up to 32,000 characters, and links the full log (`scripts/sync-digest.ts:24–29`). The
PR summary keeps kinds and counts only (`scripts/sync-pr-body.ts:36`). The digest generator
changes only if the log cannot carry that text. Both apps' edge tests cover both statuses.

**S5. Docs and release.** The `espn.ts:44` comment; `CLAUDE.md`'s list of stored statuses, and
its roadmap sentence that the version does not move after v0.5.3; a `CHANGELOG.md` `[0.5.4]`
section; every other version place that `CLAUDE.md`'s "Release management" lists, moved
together; README's "Shipped, and public" line; row 107 moved to the completed rows; and new
rows for option C and per-competition containment, carrying the reasons in §3 and Q2. Three
tests compare against the version read from `package.json`:
`tests/dom/momentsGallery.test.tsx:37`, `web/test/scaffold.test.tsx:17` and
`web/test/snapshot.test.ts:35`. They move to 0.5.4 and still fail on a mismatch. The
current-release copy at `README.md:51` and `:138` and at `studio/README.md:7` moves too. The
v0.5.3 Lineage entry at `README.md:482` calls it the last patch before the cutover, which
v0.5.4 makes false, so that entry changes as well. `README.md:144` captions v0.5.3
screenshots and stays.

**Acceptance.** Each item names its command, and each can fail.

- `npm run typecheck` and `npm test` green at every commit, plus the `web/` and `studio/`
  steps in `.github/workflows/ci.yml`.
- `npm test -- tests/espn.test.ts tests/validate.test.ts tests/standings.test.ts
  tests/lensSelectors.test.ts tests/diff.test.ts tests/syncPrBody.test.ts
  tests/syncDigest.test.ts tests/dom/fixtureEdges.test.tsx` and
  `npm --prefix web test -- test/fixture-edges.test.tsx` cover at least these cases:
  - each S1 and S1b receipt maps to its status, `result` and `shootout`;
  - an extra-time receipt with no `shootoutScore` is accepted;
  - each malformed required value S3 names, on each side, is refused, not stored;
  - the form guide does not count an `after_extra_time` 4–3;
  - a same-day `after_extra_time` or `after_penalties` result appears in the ticker under
    `AET` or `PENS`, and no FT segment carries it;
  - a first final's `STATUS_CHANGED` detail, and a shootout-only correction's urgent
    `RESULT_CHANGED` detail with the old and new shootout, inversion included, appear in the
    PR log and the digest;
  - the row shows the `AET` and `PENS` pills and the bracketed shootout, in both apps.
- The snapshot on `main` parses under the new schema, printing its count:
  `git show origin/main:src/data/fixtures.json | npx tsx -e 'import { fixturesFileSchema } from "./src/lib/schema.ts"; let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => console.log("parsed", fixturesFileSchema.parse(JSON.parse(s)).length))'`
- The browser matrix, since `src/` changes. Run `npm run dev -- --host 127.0.0.1 --port 5173`
  with one uncommitted stub row per new status in `src/data/fixtures.json`, as PR #183 did.
  Check every lens × theme × tab at 360, 375, 390 and about 1000 px, with
  `document.documentElement.scrollWidth === window.innerWidth` holding before each capture.
  On the Fixtures tab, where rows render (`src/App.tsx:86`), each stub row shows its pill,
  score and any shootout. Revert the stub after, and `git status --porcelain` prints nothing.

**Deadline.** The sync runs the code on `main`. On 22 Dec the scheduled slots after the 20:00
UTC kickoff are 21:23, 22:23 and 23:23 UTC (`sync.yml:39`), 83, 143 and 203 minutes in.
21:23 falls in play, 22:23 can still fall in a shootout or a delayed finish, and 23:23 is the
first slot likely to see the final. GitHub has delivered runs here up to about four hours late
and skipped some slots (`sync.yml:29–30`), so no slot is certain. The PM seat proposes merging
by Fri 18 Dec 2026, which leaves Mon 21 Dec and the day itself spare. That is a target, not a
promise.

**Match-day check.** After the final, the PM seat confirms three things and tells Beni that
day if any fails:
`gh run list --repo BeniCheni/kickoff --workflow sync.yml --branch main --limit 6` shows a
green run that started after ESPN posted the final; `supercoppa:401928184` on `main` carries
a new status and its result; and any red run between kickoff and that green run names only an
in-progress status.

## 6. Deliberately not done

- No 90-minute score (option C). It gets its own row.
- No per-competition containment (Q2: No). It gets its own row.
- No mapping for `STATUS_DELAYED`, `STATUS_FORFEIT`, `STATUS_RAIN_DELAY` or any other status
  that no S1 or S1b receipt shows.
- No "level at 90′" inference for any tie, and no aggregate or `advance` field.

## 7. Not verified

- What ESPN sends while a match is in extra time or a shootout. Unless S1b maps it, every run
  that lands then and sees a name outside the in-play map (`espn.ts:60–63`) refuses to write.
  Recovery waits for the first run after ESPN posts the final, which the match-day check
  confirms.
- `STATUS_SHOOTOUT`: not seen in any of the 93 events.
- ESPN's statuses and fields for two-legged European ties, which are not listed yet.
- Whether ESPN ever moves a final status after publishing it, for example `STATUS_FULL_TIME` to
  `STATUS_FINAL_AET`.

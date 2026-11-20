# PR #349 — the PM seat's briefs for the overhaul's PR 3, the Ledger, rows, states and the week: Pass 1's cold review (archived Fri 20 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5) in the Track A planning session, after Codex opened
PR #349 from
[design-overhaul-pr3-implementation-prompt.md](design-overhaul-pr3-implementation-prompt.md).
Pass 0 of the 360 cycle in `/kickoff-pr-review`. Codex built the PR, so it takes the "When Codex
builds" column of PR #328's two-vendor amendment:
- Passes 0 and 1.5: the PM seat;
- Pass 1: a fresh Claude Code session on `claude-fable-5-2` at `xhigh`;
- Pass 2 and every fix round: Codex on `gpt-6.2-astra` at `xhigh`, PR 3 being an L PR;
- Pass 2.5, every sitting: a fresh Claude Code session on `claude-opus-5-5` at `xhigh`, writing
  nothing;
- Pass 3: Beni.

The PM seat read the PR at about 1:15 PM EST:
- head `7c6e230`: ten Codex commits. Eight are feature commits in the order the build brief set.
  Two merge `main`: `f4bba81` for the snapshot and `7c6e230` for #348's briefs.
- 51 files and +16,261/−11,533 against `overhaul/second-edition` at `d9b97d4`, as GitHub counts
  them. Since the integration branch last merged `main` at `2aea6c8`, `main` has moved only
  `docs/` and `src/data/`, and the head's copies of both equal `main`'s at `1851196`. So the PR's
  own change is everything outside those two folders: 40 files, +977/−509.
- `verify`, the Vercel deployment and `vercel-smoke` green, mergeable, auto-merge off. The only
  comment is Vercel's; no review.
- PR 4 building beside it, by Beni's "Beside PR 3", in `kickoff-pr4` at `38998bc`, unpushed.

It read the PR body and, at the head:
- `FixtureRow.tsx`, `StatusPill.tsx`, `WeekRow.tsx`, `FilterBar.tsx`, `FilterToggle.tsx` and
  `NextUpStrip.tsx`;
- the `time.ts` and `lensSelectors.ts` diffs;
- the new row, week-row and filter-panel rules in `src/shell.css`;
- `tests/fixtureHonesty.test.ts`;
- the runner's `captureWeeks`.

It did not read `LedgerWeek.tsx`, `PosterWeek.tsx`, `MatchdayLines.tsx`, the other test diffs or
the rest of the runner's changes. It ran no test, build or browser.

Two leads closed on the read, and the brief does not carry them. The closed filter panel is
`inert` and `aria-hidden`, and the app runs React 19.2, which renders `inert`. `hasKickedOff`
already requires a league-set time, so a placeholder kickoff can never read KICKED OFF.

Pass 1 is report-only: the amendment gives every fix round to the builder, and a pushed commit
would move the branch under Pass 2. Beni's default output style is Learning, so the brief turns it
off for the pass.

Delivered in chat in a four-backtick fenced block, one line per paragraph, after these two
commands, which Beni runs. This copy is the archive.

```bash
git -C /Users/benicheni/code/kickoff fetch origin && git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr349-review 7c6e230
```

```bash
cd /Users/benicheni/code/kickoff-pr349-review && claude --model claude-fable-5-2 --effort xhigh
```

---

````text
Kickoff design overhaul — PR #349 (overhaul PR 3, the Ledger, rows, states and the week): Pass 1, cold review

You are Pass 1 of the 360 cycle for PR #349 in github.com/BeniCheni/kickoff: a fresh Claude Code session that built none of this, started by Beni in /Users/benicheni/code/kickoff-pr349-review, a detached worktree at the PR's head. Run /kickoff-pr-review on #349 with --no-merge. The skill outranks this brief on process, except where FIX SCOPE below says otherwise, and this brief adds the PR's particulars. Run on claude-fable-5-2 with --effort xhigh, and name the model and effort that actually ran at the top of your comment; Claude Code records both in its session file. Read CLAUDE.md and AGENTS.md first. The PM seat (Claude Code, Opus 5.5) wrote this on Fri 20 Nov 2026 at about 1:15 PM EST, from #349 at 7c6e230, with verify, the Vercel deployment and vercel-smoke green and no review yet. It read the PR body, FixtureRow.tsx, StatusPill.tsx, WeekRow.tsx, FilterBar.tsx, FilterToggle.tsx and NextUpStrip.tsx, the time.ts and lensSelectors.ts diffs, the new rules in src/shell.css, tests/fixtureHonesty.test.ts and the runner's captureWeeks. It did not read LedgerWeek.tsx, PosterWeek.tsx, MatchdayLines.tsx, the other test diffs or the rest of the runner's changes, and it ran no test, build or browser. Treat the repository as ground truth and this brief as a map of it. Run TZ=America/New_York date before writing any date.

OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment.

BEFORE YOU START. Any of these stops you, and you tell Beni.
- A Pass 1 comment already exists on #349, or another session is reviewing it.
- The head is not 7c6e230. If commits landed since, review them too and list them.
- origin/overhaul/second-edition has moved off d9b97d4. If PR 4 merged first, review #349 against the new base, and say so.

WHO BUILT IT, AND THE ROUTING. Codex built #349 on gpt-6.2-astra at xhigh from docs/design-overhaul-pr3-implementation-prompt.md, which is on main since #348 and in the head through its merge of main. The review follows the "When Codex builds" column of PR #328's two-vendor amendment, approved by Beni and not yet on main; read it with git show origin/docs/review-loop-plan:docs/design-overhaul-plan.md, under "Amended Tue 17 Nov 2026". Pass 1 is yours, report-only. Pass 2 and every fix round are Codex's. Pass 2.5 is a fresh Claude Code session on claude-opus-5-5 that writes nothing. Beni's word merges. PR 4, the Table's skin, is building beside this PR by Beni's "Beside PR 3" (Fri 20 Nov 2026, about 12:10 PM EST), in Claude Code, in /Users/benicheni/code/kickoff-pr4 on claude/overhaul-pr4-table, unpushed. Do not review it, and do not treat what it will change as a finding here.

WHERE TO WORK.
- Your head worktree is the one you started in. Make the base's: git -C /Users/benicheni/code/kickoff worktree add --detach /Users/benicheni/code/kickoff-pr349-review-base d9b97d4. Git commands that write the repository's .git may need your sandbox off; ask Beni for each.
- Match the snapshot. The base carries an older src/data than the head, which took main's at 1851196. In the base worktree only, run git checkout 1851196 -- src/data, so both trees render the same fixtures, and say so in the comment. Never commit it.
- Run npm ci at the root and in web/ of each worktree.
- Never use Beni's checkout at /Users/benicheni/code/kickoff, which holds untracked files of his, and never the builders' worktrees: kickoff-pr3, kickoff-pr3-base, kickoff-pr4 and kickoff-pr4-base.
- Put the head's three servers (Vite preview, Next production, the states harness) on 7573, 7574 and 7575 and the base's on 7673, 7674 and 7675. Port 5173 is Beni's; 7173 to 7275 are PR 3's builder's and 7373 to 7475 PR 4's. preview_start serves the main checkout, not a worktree: start every server from your own worktree, set KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN explicitly, confirm each listener's cwd with lsof, and do not stop a process you did not start.
- Keep receipts under /Users/benicheni/code/kickoff-receipts/pr349-pass1/, where a restart cannot empty them (Beni, Thu 19 Nov 2026).

WHAT BENI RULED, named as his. The build brief's section "RULINGS THAT BIND IT" lists them with their sources. In short:
- Sat 14 Nov 2026, in docs/design-overhaul-plan-review.md: 1 Branch and 2 Ten; 11 Fold; 12 Six (no version, tag or CHANGELOG section); 13 Keep (a stale LIVE row keeps its last score under KICKED OFF); 15 Drop (every row carries both clocks); 17 Approve (strings 22 to 30; string 33 waits for his approval).
- Fri 13 Nov 2026, in the handoff's section 11: 5, 7 (amber's eight uses), 8, 9 (the week row's year rule), 10, 11 ("20:30 local", 24-hour, never an abbreviation or offset), 13.
- Tue 17 Nov 2026, in the gap-18 addendum: 24 and 25 (the filter panel), 27 (the kept score under KICKED OFF is amber), 28 (the clockless row), 29 (a scheduled match past its kickoff reads KICKED OFF with no score and both clocks kept).
- From PR 0's cycle: R1 (an unsettled row prints no kickoff clock anywhere), R2 (--enforce fails on the 16 Table loss-pip samples until PR 4) and R3 (the Previous chevron stays a button named exactly "Previous", in the server HTML of "/").
- Fri 20 Nov 2026: "Beside PR 3".
- Standing, in CLAUDE.md: never render a kickoff time the league has not set; nothing invented; both clocks from one UTC instant; no data-honesty assertion is weakened.
Beni's word merges every overhaul PR. Do not approve, merge, enable auto-merge, bump or tag.

SPEC OF RECORD. The build brief, docs/design-overhaul-pr3-implementation-prompt.md. docs/design-overhaul-plan.md: sections 1.3, 1.4, 1.7, 3 (PR 3's row and evidence entry), 6.1, 6.2, 8.1 to 8.3 and 10.4 (strings 22 to 30 and 33). docs/design/5-handoff/second-edition-handoff.md, section 5 ("Rows and states", "Page controls") and section 6. docs/design/5-handoff/gap-18-addendum.md: "Section 5 · Page controls, after 'Hidden by filters'", "Later the same day: the rows pass" with both replies of "The handoff's changed lines", and "Section 11, as it reads after the rows pass". Precedence: Beni's rulings first; the addendum is the later word on every section it names; where the plan and the handoff disagree, plan section 10.5 says which it followed; then the build brief. Judge each departure you find against that order, and note the resolution.

FACTS FROM THE PM SEAT'S READ that are easy to miss.
- The PR's own change is 40 files, +977/−509. GitHub shows 51 files because the branch merged main twice. Since the integration branch last merged main at 2aea6c8, main has moved only docs/ and src/data/, and the head's copies of both equal main's at 1851196. Check it with git diff --stat 2aea6c8 1851196 -- . ':!docs' ':!src/data', which prints nothing, and git diff --quiet 1851196 7c6e230 -- src/data docs.
- clock24 is one line in ZonedParts and one in zonedParts, between meridiem and isoDate, formatted through the module's formatter() cache with hourCycle 'h23'. PR 4 adds the same field by the same contract, and whichever PR merges second keeps the first's time.ts. A textual conflict there is expected, not a finding.
- tests/fixtureHonesty.test.ts pins the amber inventory with regular expressions over TablePage.tsx as it stands at d9b97d4, by the build brief's rule. PR 4 repaints those sites, so the second merge updates the patterns. That is the brief's coordination, not a finding here.
- The runner's week picker, chooseWeeks in scripts/evidence-weeks.mjs, is PR 0's and unchanged here. The body's question 3 asks Beni to keep it as written.
- The snapshot runs from 2026-10-20 to 2027-04-18. It spans Europe's clock changes on 25 Oct 2026 and 28 Mar 2027, the US's on 1 Nov 2026 and 14 Mar 2027, and the week of 28 Dec 2026 to 3 Jan 2027, which crosses New Year.
- CompetitionChip.tsx, chipInk.ts and the chip cases in tests/europeanContrast.test.ts are untouched, by the brief's rule. After this PR only the Table's league picker uses CompetitionChip.

QUESTIONS THIS PASS SHOULD ANSWER, beyond redoing each receipt yourself.
- (a) Green at every commit. At 7c6e230, run root typecheck, npm test, build, build:single, build:offline and the offline-bundle scan, then web typecheck, test, build, check:client and check:css. At each of the eight feature commits and the first merge, checked out by its SHA, run at least root typecheck and npm test.
- (b) The rows, against R1 and rulings 13, 27, 28 and 29, in both lenses and all three shells. Use the harness's states and the synthetic fixtures. For every state the build brief lists (NEXT, LIVE, both KICKED OFF cases, FT, AET, PENS, the four unsettled statuses, a time not set, local time not known, both day notes, a note present): which clocks print, which score, which word, which voice? Then break three rules of your own choosing, ones the body's 57 mutation receipts do not name, and show whether a test catches each: a zone abbreviation on a row, a 12-hour stadium clock, and a clock in a suspended row's Ledger slot would be good choices.
- (c) Both clocks from one instant. For the eighteen recorded events in tests/venueTz.test.ts, and for one fixture in each zone on each side of the four clock changes in the window, does clock24 name the same minute as the 12-hour clock? Does the day note follow the Brooklyn date? Is there any path from a row to a clock that does not go through fixtureTimes?
- (d) The week row. Measure every control at 360, 375, 390 and 1000 in both lenses and both apps, against H1 to H4. Is "Previous" a button by that name in the Next server HTML of "/", muted and inert at the window's start? Does the range show the year only by ruling 9, at the week of 28 Dec 2026 and at a week entirely in 2026 and one in 2027 (pin today with the rig's clock)? Does ?only= and &date= survive a lens change and Back?
- (e) The filter panel, against rulings 24 and 25. Closed, does it hold no tab stop? Opened, is every control reachable in order, with the right spoken name and state: each toggle named by its competition alone with aria-pressed; each group control named by its action and without aria-pressed; the top "Show all" disabled when all fourteen show and still announced as unavailable? On and off differ by more than colour? Does reduced motion give 0 ms, and the motion control's off state too?
- (f) The week's lines. Do the listed and hidden counts reconcile with the snapshot on the heavy week under a filter set that hides fixtures on more than one day, and on a week that holds a Domestic Supercup fixture with the Supercups hidden? Do merged empty days keep their hidden counts? Is the end-of-week count what the Ledger lists? Do the UEFA matchday lines carry ink for the computed form and amber for the other two, above the first row each governs?
- (g) NEXT UP. Its four cards and "+N more today" line; TBC in amber italic with no time anywhere for an unset card; no unsettled match; both empty states, reached by the app's own data path, not only in jsdom.
- (h) Readability, not only scrollWidth. At 360 and 1000 in both lenses and themes, look for a club name broken mid-word, a meta line that overflows or is clipped, and a Ledger clock column that does not hold. Measure what a reader sees; give the rows and widths.
- (i) Contrast and hit areas. On both trees, re-run the runner in report mode and with --enforce. Is the only failure R2's 16 loss-pip samples? Are the row, week-row and panel pairs read on the rendered page, in both themes?
- (j) The honesty tests' reach. What does the amber inventory scan, and what would pass it unseen? What does the source scan for new Date(…kickoffUtc…) miss? Give a concrete example of each that passes today, and the smallest change that would catch it.
- (k) The re-pointed probes. The matrix's row measurement now reads data-fixture-id, and the band-reveal probe focuses Previous, or Next at the window's start. Does the band probe still prove a control can scroll out from under the pinned band? Show it by breaking the band's scroll clearance on purpose and seeing whether the probe fails.
- (l) The offline and single files. Opened from disk with the network off, in both lenses: does each render the new rows and the week row with the six faces they carry, and fetch nothing? Is the body's scan scope (its question 4) sound?
- (m) The Next app. Is every new component under src/components/ in web/app/globals.css's @source list and web/scripts/check-css.mjs's expected list? Do the Next server HTML and the Vite page render the same rows for the same week?
- (n) The body's five questions for Beni: NEXT UP's two messages (string 33's half), the fixture-note rule, the evidence-week selector, the standalone scan scope, and Filters ending at x=374 on a 390 px page. For each, give the evidence and a recommendation. The calls are Beni's.

FIX SCOPE. None. This pass is report-only, and on this point it overrides the skill, which would push fixes. Push no commit, and edit no file in the PR. The approved routing amendment gives every fix round to the builder (PR #328, "The rule"), and a commit of yours would move the branch under Pass 2. Put each fix in the comment as a finding, with the file and line, the command or interaction that shows it, expected and observed, and the smallest change you would make.

THE COMMENT. Follow pr-comment.md. The first line gives the verdict and the model and effort that ran. Give the reviewed SHA, the base and the matched-snapshot comparison you used. Say which checks and questions above you ran and which you could not, under "Not verified" with reasons. Add a short "For Beni" list: the body's five questions with your recommendation on each, and anything you found that only a person can judge on a phone.

SEALED APPENDIX — claims to re-derive independently, never conclusions. Reach your own result for each, and say when one does not reproduce.
- B1 (builder): both main merges and all eight feature commits passed the root and web suites, checked out by SHA; the head passed 1,251 root tests and 158 web tests; every next build passed on its first try.
- B2 (builder): at the head, the entire src/data tree equals 1851196's, tree db4e8a9; the generated-file conflicts were resolved by taking main's snapshot whole.
- B3 (builder): all 96 matrix cells had scrollWidth === innerWidth; 72 more week cells passed, with the heavy week from 2026-10-26 (55 fixtures), the quiet week from 2026-11-09 (none) and the UEFA week from 2026-11-02 (107).
- B4 (builder): the open panel, measured 24 times across both apps, lenses and themes: all 22 controls at least 44 × 44 with no overlap; toggle frames 28 px; the range outside every hit area; 180 ms, and 0 ms under reduced motion.
- B5 (builder): at 390 on Poster, Previous 16.0–60.0, range 60.0–116.6, Next 116.6–160.6, Today 160.6–205.2 and Filters 205.2–374.0 px from the viewport's left edge.
- B6 (builder): at 360, a PENS row's "3–3 (2–4)" measured 64.8 px, its pill 16 px high and the leader 141.3 px, with both clocks fitting; Poster keeps the leader on line one and the score and pill on line two.
- B7 (builder): on the heavy week both apps listed and hid the same fixtures, by ID, under all fourteen (55 / 0), the Premier League, Champions League and La Liga (19 / 36) and everything but the Domestic Supercups (55 / 0), and each day's sum equals the snapshot's total.
- B8 (builder): report mode exited 0 and --enforce exited 1, both reading 1,791 samples with none unread, the only pair below its floor the white L on the light Table's loss pip at 3.87:1.
- B9 (builder): the offline file is 1,455,892 bytes and passes its 22-marker scan; the single file is 1,506,546 bytes, and the same scan fails on it only on the five Moments player markers the base's single file also holds; both carry twelve font subsets for six faces and no remote asset tag, and opened from disk in both lenses with no HTTP request.
- B10 (builder): 57 mutation receipts, each run alone in a detached checkout of the head, each turning its named test red, the worktree left clean; a ninth amber text use introduced on purpose failed the audit.
- B11 (builder): the band-reveal probe focuses Previous, falling back to Next at the window's start, and the matrix's row measurement reads data-fixture-id.
- P1 (PM seat): .fixture-names sets overflow-wrap: anywhere with min-width: 0 in a flex row, so at 360 a long club name may break mid-word where a break at a space would fit.
- P2 (PM seat): the Ledger's day note sits inside the 62 px clock slot, which is flex: none and nowrap, so a row with a day note may push its names right and the clock column may not hold.
- P3 (PM seat): every span in .fixture-meta is nowrap, and the Ledger sets the line in caps, so the longest venue with its stadium clock may overflow or be clipped at 360 while scrollWidth still passes.
- P4 (PM seat): the amber inventory reads only src/components/ and src/shell.css, so amber in src/index.css, src/App.tsx, src/offline.tsx or web/app/ is not counted. It also allows two first-edition sites outside the eight uses, the Table's sort ground and the Moments rights notice.
- P5 (PM seat): the source scan matches only new Date(…kickoffUtc…) in src/components/, so Date.parse(f.kickoffUtc), or a Date built from a variable that holds kickoffUtc, passes it.
- P6 (PM seat): the third filter set hid nothing on the heavy week (55 / 0, the same as all fourteen), so B7's reconciliation did not exercise the hidden counts under that set.
- P7 (PM seat): captureWeeks skips a week kind silently when the picker returns no Monday, so a missing week would pass the run with fewer cells.
- P8 (PM seat): the band-reveal probe now focuses a control near the top of the page, which may never sit under the pinned band, so it may pass without testing the clearance it was written for.
- P9 (PM seat, added Fri 20 Nov 2026 after the brief was delivered, from PR 4's builder's base receipt): the contrast runner at d9b97d4, on d9b97d4's own snapshot, measured 1,946 rows, where one row is one ink at one size in one cell. B8 reports 1,791 at the head on 1851196's snapshot. PR 3 changes no line of collectText, measureContrast or contrastSummary, and it passes the week run's contrast list to two more captures, so the head measures 155 fewer rows with a runner that samples at least as much. On your matched snapshot, account for the difference: name the rows that disappear, and show that each belongs to an element the PR removed, such as a Fixtures competition chip, not to text the sampler stopped reaching.
````

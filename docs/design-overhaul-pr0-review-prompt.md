# PR #327 — the PM seat's briefs for the overhaul's PR 0: Pass 1's cold review, Cursor's Pass 2, Codex's Pass 2.5 in three sittings, and Cursor's two fix rounds (archived Sun 15 Nov 2026, TZ=America/New_York)

Written by the PM seat (Claude Code, Opus 5.5), a side session started from the review-loop
planning session, after Cursor opened PR #327 from
[design-overhaul-pr0-implementation-prompt.md](design-overhaul-pr0-implementation-prompt.md).
Pass 0 of the 360 cycle in `/kickoff-pr-review`. The PM seat read the PR at about 3:40 PM EST:
head `98aff91`, five Cursor commits, 25 files, +1600/−107, `verify`, the Vercel deployment and
`vercel-smoke` green, no review yet. It read every hunk against `origin/main` at `ad4c5f3` and
ran no test, build or browser.

Routing and timing. Pass 1 runs in a fresh Claude Code session on `claude-fable-5-2` at `xhigh`,
the review tier `CLAUDE.md` names. Beni's Cursor tier changes on Thu 19 Nov 2026, so Cursor's
Pass 2 on `grok-4.7-xhigh` has to land by Wed 18 Nov, and this pass should post on Mon 16 Nov if
it can. That schedule is a proposed amendment to the plan's section 3 (branch
`docs/review-loop-plan`, commit `b1f9714`), not yet ruled, and the brief says so. Beni's default
output style is Learning, so the brief turns it off for the pass, as the PR #320 synthesis
opener did.

A session titled "PR #327 honesty rules and evidence runner" was running in Beni's main
checkout while this was written, beside two worktrees the PM seat did not make: `pr327-base`
(detached at `ad4c5f3`) and `pr327-review` (branch `claude/pr327-review`, with uncommitted edits
to two of the PR's tests). The PM seat flagged it on delivery, and at about 3:47 PM Beni
confirmed that session *was* Pass 1, started before this brief existed. So the fresh-session
brief below was **not used** as Pass 1's opener; it is kept as written, because its checks and
its sealed appendix are the PM seat's record of what it asked for. The supplement at the end
was delivered instead, for pasting into the running Pass 1. It drops the instructions that only
fit a new session (make your own worktrees, leave `pr327-review` alone, stop if a Pass 1
exists) and keeps the rest. At that point #327 was still at `98aff91` with no review comment,
and Pass 1 had pushed nothing. Both blocks were delivered in chat, one line per paragraph; this
copy is the archive.

Corrected at about 9:30 PM the same day: Pass 1 did not start without a brief. Another PM-seat
session, the "Cosmic Horror Kickoff Planner", wrote the brief the review started from at about
3:27 PM, with appendix A1–A12 and the build brief's addendum in full. That copy is untracked in
Beni's main checkout at this same path. The lineage docs PR should merge both into this file,
with that brief first, since Pass 1 ran from it. Until then, checking this branch out in the
main checkout fails on that untracked file. The Pass 1.5 brief for Cursor's Pass 2 is the last
section below.

---

````text
/kickoff-pr-review 327 --no-merge

PR #327 — Pass 1 (cold review): overhaul PR 0, pin the honesty rules and build the evidence runner

You are Pass 1 of the 360 cycle for PR #327 in github.com/BeniCheni/kickoff, running in Claude Code on Fable 5.2 (claude-fable-5-2) at xhigh effort, in a fresh session. Cursor built the PR on Grok 4.7 at Extra High from a build brief the PM seat wrote; you built none of it, and you wrote neither that brief nor the plan behind it. The method is /kickoff-pr-review, which the line above invokes, and it outranks this brief on process. Your deliverables are fix commits for what you reproduce, inside the scope below, and one PR comment in pr-comment.md's table shape. Stop at the comment. Read nothing here as a conclusion: every number in the PR body and in this brief is a claim to re-run. The PM seat (Claude Code, Opus 5.5) wrote this on Sun 15 Nov 2026 at about 3:40 PM EST.

OUTPUT STYLE. This session may have started in the Learning output style, which is Beni's default. Ignore it for this pass: make no Learn-by-Doing request, add no TODO(human), and put no insight box in your messages or the PR comment.

THE DEADLINE. Beni's Cursor access moves from the "Super" tier to a lower one on Thu 19 Nov 2026, so Cursor's Pass 2 rebuttal on grok-4.7-xhigh has to land by Wed 18 Nov, and it can start only after your comment and a Pass 1.5 brief built from it. Post your comment on Mon 16 Nov if you can. That schedule is a proposed amendment to section 3 of docs/design-overhaul-plan.md, on branch docs/review-loop-plan at b1f9714 and not on main; Beni has not ruled on it, so it is context for your pacing, not a rule. Do not buy the date with depth: anything you could not run goes in the comment's "Not verified" list, never in a claim. Write each finding so Cursor can reproduce it cold: file and line, the command, what you expected and what you saw.

WHAT THIS PR IS. The first of ten PRs that build Fergie Time's second edition into Fixtures and Table, and the only one besides the release that merges to main. It is tests and tooling that must change no byte a reader receives: tests for four honesty rules that had none plus the header stamp, a new Fixtures landmark for the preview smoke, a general evidence runner that every later overhaul PR extends, and a dev-only states harness. It is not a release: no version, no tag, one line under CHANGELOG.md's [Unreleased]. Its value is in being on main before the repaint starts, so later reviews can show no assertion was weakened against tests that were there first. The risks are therefore unusual: a test that cannot fail the rule it names; a "no rendered byte" proof that misses a build output or a dev-only hook that leaks; a smoke landmark that main will demand of every later preview; and a runner whose baseline every later PR inherits, so a wrong sampler or week rule makes every later PR's evidence wrong.

STATE AT PASS 0, as the PM seat read it on Sun 15 Nov 2026 at about 3:40 PM EST (re-check all of it).
- PR #327 is open, not a draft, branch cursor/overhaul-pr0-pin into main, head 98aff911201f5ab0e9374828bd4ef49c5ba9c455, mergeable (CLEAN). Five commits, all Cursor <cursoragent@cursor.com>, in the brief's order: d123d30 rule tests, 2b683e4 smoke landmark, 0f7a8f2 runner, 1923a6c harness, 98aff91 changelog. The merge-base is origin/main at ad4c5f3 (a data sync, "npm run sync 11/15/2026 2:23 PM ET"); the body says the branch was cut from 0fd5b98 and rebased onto it. 25 files, +1600/−107.
- Checks at the head: verify (CI run 43757003603) green, the Vercel deployment ready, vercel-smoke green. No studio check is listed. One comment, the Vercel bot's; no review.
- Untouched: src/, index.html, offline.html, public/, web/app/, src/data/, .github/, studio/, both package files and lockfiles. Touched outside tests/ and scripts/: vite.config.ts (a serve-only plugin and optimizeDeps.entries), scripts/vercel-smoke.mjs, CHANGELOG.md, and web/scripts/clearing.mjs, which becomes a thin call into the new web/scripts/evidence.mjs.
- Beni's main checkout, /Users/benicheni/code/kickoff-pm, is on cursor/overhaul-pr0-pin at 98aff91. Two worktrees the PM seat did not make already exist: .claude/worktrees/pr327-base (detached at ad4c5f3, with built dist folders) and .claude/worktrees/pr327-review (branch claude/pr327-review at 98aff91, with uncommitted edits to tests/displayOrder.test.ts and tests/dom/tableUnsetKickoff.test.tsx made at about 3:36 PM). A session titled "PR #327 honesty rules and evidence runner" was running in the main checkout. Use neither worktree, change nothing in them, remove neither, and do not treat their uncommitted edits as anyone's findings. If you find a Pass 1 comment already on #327, or a commit on the branch by anyone but Cursor, stop and tell Beni before doing anything else.

WHAT BENI RULED, named as his, and what binds you.
- Sat 14 Nov 2026, the plan's questions (docs/design-overhaul-plan-review.md, "Beni's rulings"): route Branch, so PR 0 lands on main first and PRs 1 to 8 go into an integration branch that PR 1 creates; Ten PRs in section 3's order; Six, so the overhaul is v0.6.0, numbered at its release and not here; Release, so Step 0 moves to &lens=ledger at the release and nothing here touches it; Keep, so a stale LIVE row keeps its last score and tests/dom/designCycle.test.tsx:47 and :66 stand; Fold, so ideas rows 126 and 129 belong to PRs 3 and 5.
- Sat 14 Nov 2026, the dead-CSS ruling, fixed on its own in PR #323 (merged): the public app's Tailwind scans only src/**/*.{ts,tsx}. That is why the harness styles itself inline.
- Standing, in CLAUDE.md: never render a kickoff time the league has not set, never invent a value, both clocks from one UTC instant, and no data-honesty assertion is weakened, ever.
- Seats, plan section 3: Cursor builds, Pass 1 is a fresh Claude Code session, Pass 2 is Cursor's rebuttal, Pass 2.5 is Codex's synthesis, and Beni's word merges.
- Not ruled: the 19 Nov schedule above.

SPEC OF RECORD. docs/design-overhaul-plan.md: section 3 (PR 0's row and its evidence line), the "PR 0" cells of section 6.1's table, section 6.2, and section 8 (8.1 to 8.3, row 0). Then the build brief, docs/design-overhaul-pr0-implementation-prompt.md. Precedence: Beni's rulings, then the plan, then the build brief; there is no design brief for this PR and the template draws no tests. The PR body cites an "addendum" that moved the base to 0fd5b98; no such file is archived in docs/, so judge against the brief and the head, and say so. Out-of-scope findings you judge real go to docs/v0.2.6-ideas.md, the current ranked list, per the skill's §6.

WHERE TO WORK.
- git fetch origin, then git rev-parse origin/cursor/overhaul-pr0-pin and git log --oneline origin/main..origin/cursor/overhaul-pr0-pin. Expect the five commits above. If the head differs, name each extra commit, review the head anyway, and treat the surprise as a finding candidate. Every number you report names the SHA it came from.
- Make your own two worktrees, not the existing ones: one on a new branch (claude/pr327-pass1) from origin/cursor/overhaul-pr0-pin, and one detached at the merge-base for the parity build. Push any fix with HEAD:cursor/overhaul-pr0-pin. Node 24; npm ci at the root, then npm ci --no-audit --no-fund --prefix web. Never run npm run sync.
- In this app's Bash sandbox, git fetch, git worktree add, gh, tsx (so every build and the offline scan), web/'s tests, loopback servers and headless Chrome need the sandbox off; the root npm test usually runs inside it. Say in the comment which steps ran outside it.
- In zsh write "${R}:path" when you git show a ref and a path; $R:t is a history modifier.
- Ports. The runner's defaults put the built Vite preview (KICKOFF_VITE_ORIGIN) and the dev server the harness needs (KICKOFF_HARNESS_ORIGIN) both on 127.0.0.1:5173, and Beni's checkout and other worktrees share that port. Choose free ports, set KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN explicitly, and confirm which checkout serves each (lsof -iTCP:<port> -sTCP:LISTEN, then that process's cwd) before any browser claim. Write the exact commands that reproduce your run into the comment; the PR body does not give them.
- The session scratchpad has been emptied overnight mid-review before. Finish the builds and the browser run in one sitting.

WHAT YOUR PASS MUST SHOW, each by a command you ran. For each, say whether it matched the builder.

1. Green, at base and head and at every commit. At the merge-base and at the head: root npm run typecheck, npm test (both vitest projects), npm run build, npm run build:offline and the offline-bundle scan; in web/ npm run typecheck, npm test, npm run build, npm run check:client, npm run check:css. Then typecheck and npm test at each of the five commits, since CLAUDE.md wants green at every commit. Report your own counts.

2. Each new test can fail the rule it names. Redo every mutation receipt yourself rather than reading the body's: break the rule in src/ in your working tree, run the named test in each app that has a twin, see it red, restore with git checkout, commit none of it. Then, rule by rule:
(a) Row order (tests/displayOrder.test.ts, tests/dom/displayOrder.test.tsx). The build brief said ties keep their input order and are never re-sorted by name, league or venue; the body's receipt broke the sort by home name only. Which tie-breaks does the node test actually catch? Try each the brief named, and any others you think a later builder might plausibly reach for. For the DOM test: it picks its day from the live snapshot (the first day spanning two competition groups) and renders with today="2026-01-01"; will it keep finding a day as the rolling window moves, and does it compare order or only presence in both lenses?
(b) The Table's unset-kickoff cell (tests/dom/tableUnsetKickoff.test.tsx). The body says its break failed on the desktop half and the mobile assertion "was not reached". Break the mobile cell alone, including a clock placed beside the not-set words rather than inside their element, and see whether the test fails. Say whether the desktop half's parentElement.parentElement is the whole cell. There is no web/ twin; the brief's twin rule covered rules already twinned, and this one had no test in either app, so judge the body's reason rather than the rule.
(c) CANCELLED. The new rows pin the word in both apps. Ask the house question too: does a cancelled row anywhere still print its dead kickoff time, and is that pinned? Do not change src/ to answer it.
(d) "local". Both twins compute the expected time with fixtureTimes, the function the row itself calls. Would a regression inside fixtureTimes pass them, and does tests/time.test.ts or tests/venueTz.test.ts catch that instead? Say whether a literal expected value would be worth adding.
(e) The header. Both twins take the expected count and stamp from META and SYNC_STAMP, the module the header reads, matched case-insensitively. Say what that does and does not prove.

3. No rendered byte. Build the merge-base in its own worktree, preserve its dist/ and dist-single/, build the head, and run node web/scripts/check-reader-parity.mjs <preserved> yourself. That script compares dist/ and dist-single/ only, so also hash dist-offline/ at both SHAs, and say whether the Next app's built client output is unchanged in any sense that matters (build IDs differ by design; judge what does). Then vite.config.ts: the new kickoff-harness-specimen plugin is apply: 'serve'. Confirm it is absent from every build mode. Vitest runs Vite with this config in serve mode, so say whether the plugin loads there and whether it can touch any test's import. The optimizeDeps.entries list exists, per the body, because a git-ignored nested checkout in Beni's main checkout (clearing.local/checkpoints/) confused the dependency scan: is a repo-wide dev-config change the right fix for one machine's untracked folder, and does it change what the dev server pre-bundles for the app?

4. The smoke landmark. .github/workflows/preview-smoke.yml runs main's copy of scripts/vercel-smoke.mjs against every deployment, so the green vercel-smoke on #327 is main's old "Jump to today" check passing against this PR's deployment, not the new landmark. The plan asks for the smoke green on the PR's own preview. Run the PR's '/' check against the PR's deployment (the Vercel bot's Preview link on the PR) if it is reachable without a secret; the automation-bypass secret is not yours to seek. Otherwise run it against a local Next production build's server HTML of '/', and say which you did. Confirm aria-label="Previous" (src/components/FixturesPage.tsx:87) is in that server HTML and absent from '/?tab=table'. Moments has its own "Previous" label (src/components/MomentsPage.tsx:177); say whether that weakens what the landmark proves. Judge its survival: the handoff's week row (docs/design/5-handoff/second-edition-handoff.md:234) keeps a previous chevron but names no accessible name, and says a chevron with no week beyond it is "muted and inert". An exact aria-label is copy too; is it sturdier than the visible label it replaces, and what must PR 3's brief carry so main's smoke does not go red on the integration branch? Does the new test in tests/vercelSmoke.test.ts prove anything a negative case would not? Do not touch the workflow or its trust boundary.

5. The runner, run by you at the head against both apps: the 96 cells, the three weeks, contrast, requests, the offline file and the harness. Then:
- The weeks. Count each candidate week's fixtures from src/data/fixtures.json yourself and confirm the heavy, quiet and UEFA picks. scripts/evidence-weeks.mjs re-implements brooklynDate and copies MATCHDAY_WINDOWS.ucl in plain JS; say whether tests/evidenceWeeks.test.ts pins that duplication well enough.
- The contrast sampler. This is the baseline every later PR's --enforce inherits, so its false readings matter as much as its true ones. The body's worst sample is white "Show all" on white at ratio 1. That button is white on bg-pitch inside the filter panel's <details> (src/components/FilterBar.tsx:13, :28-32). Was that text visible in the capture it was measured on? Read collectText in web/scripts/evidence.mjs and decide what it treats as visible text and what it misses. Read parseColor in scripts/rendered-contrast.mjs and decide which computed colour forms it can read and what happens to the rest. Estimate how many of the 528 sub-floor samples are real, and hand-check two or three samples against a known pair in tests/contrast.ts.
- The request report and its hosts and bytes; the offline file opened from disk with the network off, and whether openPage's NETWORK_NOISE filter could hide a real error there.
- The harness. Its Table specimen is a Vite-rewritten second copy of TablePage, keyed to the exact text "tableFor(league, today, nowUtcIso)," at src/components/TablePage.tsx:149, and tests/harnessSpecimen.test.ts pins that text. Is that the "today's real components" the build brief asked for? What does it cost PR 4, which reskins the Table? tableFor already accepts rows and fixtures (src/lib/standings.ts:79-85); is there a simpler honest route that changes no src/ byte? Is every specimen captioned ILLUSTRATIVE, and is it honest that NextUpStrip and TonightSlate read the real snapshot with every filter off?
- web/scripts/clearing.mjs still reproduces the clearing's 96 cells and receipt. openPage now waits at most 3 s for document.fonts.ready where the clearing waited for it outright; can a capture now land before the fonts?

6. Scope and words. CHANGELOG.md: one ### Changed line under [Unreleased] beside #323's Fixed line, with no version, date or subject line; is it true? Commit authorship as the build brief set it. The body's "Changes no rendered byte; not a release." is a claim your step 3 settles.

FIX SCOPE. Fix what you reproduce on the PR branch, in small commits authored as Claude through per-commit git -c flags, inside PR 0's scope: its tests, the runner, the harness and their scripts. Nothing under src/, index.html, offline.html, public/, web/app/, src/data/, .github/ or studio/; no package or lockfile change; no version, tag or CHANGELOG release section. A fix that would move a byte a reader receives is out of scope: say so instead. Never weaken an assertion. A contested design choice (the landmark, the harness's rewrite, optimizeDeps) goes in your comment, not a commit. If you push, the branch moves under Cursor's Pass 2: list your commits by SHA at the top of the comment.

THE MERGE. Run with --no-merge and stop at the comment. The PR is not a release, but Beni's word merges every overhaul PR (plan section 3), after Cursor's Pass 2 and Codex's Pass 2.5. Do not approve, enable auto-merge, bump or tag.

THE COMMENT. Exactly one, in pr-comment.md's shape: the verdict line, the tip and post-fix SHAs, the baseline, the findings table, killed leads, precedence resolutions, deliberately not done, the matrix as actually run with your origins and commands, and a "Not verified" list. Then end your turn with the comment's link and the verdict.

SEALED APPENDIX — suspicions to re-derive independently, never conclusions. If one does not reproduce, say so.
- B1 (builder): each of (a) to (e) failed on a deliberate break and passed once restored, as the body's receipts describe.
- B2 (builder): the mobile half of (b) was not reached in its receipt, and the one DOM test still covers both layouts.
- B3 (builder): no web/ twin for (b) is possible, because web/'s vitest is node and the mobile cell is not in the server HTML until its row opens.
- B4 (builder): aria-label="Previous" is in today's Next server render of '/', is Fixtures-only, and survives PRs 3 and 5.
- B5 (builder): check-reader-parity.mjs printed identical: true over 12 files against a preserved build of ad4c5f3, favicons included.
- B6 (builder): at the tip, root npm test ran 76 files and 998 tests; web/ ran 25 files and 124 tests; both typechecks, check:client and check:css were green; build:offline and the offline scan passed (20 markers).
- B7 (builder): 96 cells passed; ?lens=broadcast and ?view=month land on '/' in Poster; the first expanded row sits at 689 px (Poster) and 585 px (Ledger) at 390 in both apps.
- B8 (builder): the window is 2026-10-16 to 2027-04-14; heavy is the week of 26 Oct (55 fixtures), quiet 9 Nov (none), UEFA 19 Oct (105); 72 week cells passed; the rule chose the brief's three weeks by itself.
- B9 (builder): 1,904 contrast samples, 528 under the floors, the worst white "Show all" on white at ratio 1 in vite-poster-light-fixtures-360, and the muted ink near 2.4 to 3.4.
- B10 (builder): the hosts are the app, fonts.googleapis.com (1,575 bytes) and fonts.gstatic.com; images 0; fonts 90,123 bytes on Fixtures and Table and 69,905 on Moments; Vite script 176,696 and style 9,575; Next script 253,231 and style 4,228.
- B11 (builder): dist-offline/index.html is 1,001,779 bytes and dist-single/index.html 1,052,317; opened from disk offline, Fixtures and Table in both themes at 390 had scrollWidth 390, and the only network errors were the Google font stylesheet.
- B12 (builder): four harness captures matched their viewport and reached statesReady with every needle, both Table cells included.
- B13 (builder): the serve-only transform and optimizeDeps.entries never reach a reader, and the parity result shows it.
- B14 (builder): the header receipts were taken before the rebase (1446 fixtures, stamp 2026-11-15 07:57 UTC), and the tip was re-verified after it.
- P1 (PM seat): both ties in the node row-order test happen to sit in alphabetical key order, in COMPETITIONS' declaration order and in id order, so a tie-break on any of those may pass it; only the name and venue tie-breaks are reversed in its fixture.
- P2 (PM seat): the mobile half of (b) checks only the element that holds the words, so a clock in a sibling element may pass.
- P3 (PM seat): "Show all" at ratio 1 may be text inside the closed filter <details>, measured against the page behind it; if so the sampler counts invisible text, and the 528 are inflated.
- P4 (PM seat): parseColor returns null for oklch, oklab and color() values and the sample is dropped without being counted, so the receipt cannot say how much text went unmeasured.
````

---

## The supplement delivered instead, for the running Pass 1 (Sun 15 Nov 2026, about 3:50 PM EST)

````text
PR #327 — Pass 0 supplement for the Pass 1 already under way

You are Pass 1 for PR #327 and you started before the PM seat's Pass 0 brief existed. This supplement carries what that brief would have given you. It does not change your method, your worktree or anything you have already decided: /kickoff-pr-review still outranks it on process. Skip any check you have already covered, and say in your comment which of these you ran. The PM seat (Claude Code, Opus 5.5) wrote it on Sun 15 Nov 2026 at about 3:50 PM EST, when #327 was still at 98aff91 with no review comment and you had pushed nothing.

OUTPUT STYLE. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), and no insight box in the PR comment or in any commit.

THE DEADLINE. Beni's Cursor access moves from the "Super" tier to a lower one on Thu 19 Nov 2026, so Cursor's Pass 2 on grok-4.7-xhigh has to land by Wed 18 Nov, after your comment and a Pass 1.5 brief built from it. Post on Mon 16 Nov if you can. The schedule is a proposed amendment (branch docs/review-loop-plan, b1f9714, not on main) that Beni has not ruled on, so pace by it but do not buy the date with depth: what you could not run goes in "Not verified". Write each finding so Cursor can reproduce it cold: file and line, the command, expected and observed.

WHAT BENI RULED, named as his. Sat 14 Nov 2026 (docs/design-overhaul-plan-review.md): Branch (PR 0 on main first; PRs 1 to 8 into an integration branch PR 1 creates); Ten PRs; Six (v0.6.0 at the release, so no version here); Release (Step 0 moves to &lens=ledger at the release, not here); Keep (tests/dom/designCycle.test.tsx:47 and :66 stand); Fold (ideas rows 126 and 129 go to PRs 3 and 5). The dead-CSS ruling, fixed in #323: the public app's Tailwind scans only src/**/*.{ts,tsx}. Standing in CLAUDE.md: no clock for an unset kickoff, nothing invented, both clocks from one instant, no honesty assertion weakened. Plan section 3: Beni's word merges every overhaul PR, after Cursor's Pass 2 and Codex's Pass 2.5, so run --no-merge and do not approve, auto-merge, bump or tag. Not ruled: the 19 Nov schedule.

SPEC OF RECORD. docs/design-overhaul-plan.md section 3 (PR 0's row and evidence line), the "PR 0" cells of 6.1, 6.2, and 8.1 to 8.3 row 0; then docs/design-overhaul-pr0-implementation-prompt.md. Precedence: Beni's rulings, the plan, the build brief. The PR body cites an "addendum" that moved the base to 0fd5b98; none is archived in docs/, so judge against the brief and the head, and say so.

FACTS FROM THE PM SEAT'S READ that are easy to miss.
- vercel-smoke on #327 is green, but .github/workflows/preview-smoke.yml checks out main and runs main's scripts/vercel-smoke.mjs, so that status is the old "Jump to today" landmark passing against this PR's deployment. The plan wants the smoke green on the PR's own preview: run the PR's '/' check against the PR's deployment if reachable without a secret (the bypass secret is not yours to seek), else against a local Next production build's '/' server HTML, and say which.
- web/scripts/check-reader-parity.mjs compares dist/ and dist-single/ only. The PR body gives dist-offline/ only a size. Hash dist-offline/ at the merge-base and the head too, and say whether the Next app's built client output is unchanged in any sense that matters.
- The runner's defaults put KICKOFF_VITE_ORIGIN (the built preview) and KICKOFF_HARNESS_ORIGIN (the dev server) both on 127.0.0.1:5173, which Beni's checkout and other worktrees share. Set all three origins explicitly, confirm which checkout serves each port, and put the exact commands that reproduce your run in the comment; the PR body gives none.
- CLAUDE.md wants typecheck and npm test green at every commit; there are five.

QUESTIONS THE BRIEF ASKED, beyond redoing each mutation receipt yourself.
- (a) Row order: which tie-breaks does the node test actually catch, among those the build brief named (name, league, venue) and any a later builder might reach for? Does the DOM test keep finding a day as the rolling window moves, and does it compare order in both lenses?
- (b) The Table cell: the body says the mobile assertion "was not reached". Break the mobile cell alone, with a clock beside the words rather than inside their element. Is the desktop half's parentElement.parentElement the whole cell?
- (c) CANCELLED: does a cancelled row anywhere still print its dead kickoff time, and is that pinned? Do not change src/ to answer it.
- (d) "local": the expected time comes from fixtureTimes, the function the row calls; would a regression inside it pass, and what catches it instead?
- (e) The header: expected values come from META and SYNC_STAMP, the module the header reads; say what that proves.
- vite.config.ts: the kickoff-harness-specimen plugin is apply: 'serve'. Is it absent from every build mode, and does Vitest (serve mode, same config) load it? optimizeDeps.entries exists because a git-ignored nested checkout in Beni's main checkout (clearing.local/checkpoints/) confused the dep scan: is a repo-wide dev-config change the right fix, and does it change what the dev server pre-bundles for the app?
- The landmark: aria-label="Previous" (src/components/FixturesPage.tsx:87) in the Next server HTML of '/' and not '/?tab=table'; Moments has its own "Previous" label (src/components/MomentsPage.tsx:177). The handoff's week row (docs/design/5-handoff/second-edition-handoff.md:234) keeps a previous chevron but names no accessible name and makes a chevron with no week beyond it "muted and inert". Is an exact aria-label sturdier than the visible label it replaces, and what must PR 3's brief carry? Do not touch the workflow or its trust boundary.
- The contrast sampler sets the baseline every later --enforce inherits. Was the worst sample, white "Show all" at ratio 1, visible when it was measured? It is white on bg-pitch inside the filter panel's <details> (src/components/FilterBar.tsx:13, :28-32). What does collectText in web/scripts/evidence.mjs count as visible, and what does parseColor in scripts/rendered-contrast.mjs do with colour forms it cannot read? How many of the 528 are real? Hand-check two or three against tests/contrast.ts.
- The weeks: count each candidate week from src/data/fixtures.json yourself; is the plain-JS copy of brooklynDate and MATCHDAY_WINDOWS.ucl pinned well enough?
- The harness: its Table specimen is a Vite-rewritten second copy of TablePage keyed to the exact text at src/components/TablePage.tsx:149, pinned by tests/harnessSpecimen.test.ts. Is that "today's real components"? What does it cost PR 4? tableFor already takes rows and fixtures (src/lib/standings.ts:79-85); is there a simpler route that changes no src/ byte? Is it honest that NextUpStrip and TonightSlate read the real snapshot with every filter off?
- web/scripts/clearing.mjs: openPage now waits at most 3 s for document.fonts.ready, where the clearing waited for it outright. Can a capture land before the fonts?

FIX SCOPE. Inside PR 0's scope only: its tests, the runner, the harness and their scripts. Nothing under src/, index.html, offline.html, public/, web/app/, src/data/, .github/ or studio/; no package, lockfile, version, tag or CHANGELOG release section; never weaken an assertion. Contested design choices (the landmark, the harness's rewrite, optimizeDeps) go in the comment, not a commit. If you push, list your commit SHAs at the top of the comment: the branch moves under Cursor's Pass 2.

SEALED APPENDIX — suspicions to re-derive independently, never conclusions. Some may overlap with what you have already found; reach your own result either way, and say so if one does not reproduce.
- B1 (builder): each of (a) to (e) failed on a deliberate break and passed once restored, as the body's receipts describe.
- B2 (builder): the mobile half of (b) was not reached in its receipt, and the one DOM test still covers both layouts.
- B3 (builder): no web/ twin for (b) is possible, because web/'s vitest is node and the mobile cell is not in the server HTML until its row opens.
- B4 (builder): aria-label="Previous" is in today's Next server render of '/', is Fixtures-only, and survives PRs 3 and 5.
- B5 (builder): check-reader-parity.mjs printed identical: true over 12 files against a preserved build of ad4c5f3, favicons included.
- B6 (builder): at the tip, root npm test ran 76 files and 998 tests; web/ ran 25 files and 124 tests; both typechecks, check:client and check:css were green; build:offline and the offline scan passed (20 markers).
- B7 (builder): 96 cells passed; ?lens=broadcast and ?view=month land on '/' in Poster; the first expanded row sits at 689 px (Poster) and 585 px (Ledger) at 390 in both apps.
- B8 (builder): the window is 2026-10-16 to 2027-04-14; heavy is the week of 26 Oct (55 fixtures), quiet 9 Nov (none), UEFA 19 Oct (105); 72 week cells passed; the rule chose the brief's three weeks by itself.
- B9 (builder): 1,904 contrast samples, 528 under the floors, the worst white "Show all" on white at ratio 1 in vite-poster-light-fixtures-360, and the muted ink near 2.4 to 3.4.
- B10 (builder): the hosts are the app, fonts.googleapis.com (1,575 bytes) and fonts.gstatic.com; images 0; fonts 90,123 bytes on Fixtures and Table and 69,905 on Moments; Vite script 176,696 and style 9,575; Next script 253,231 and style 4,228.
- B11 (builder): dist-offline/index.html is 1,001,779 bytes and dist-single/index.html 1,052,317; opened from disk offline, Fixtures and Table in both themes at 390 had scrollWidth 390, and the only network errors were the Google font stylesheet.
- B12 (builder): four harness captures matched their viewport and reached statesReady with every needle, both Table cells included.
- B13 (builder): the serve-only transform and optimizeDeps.entries never reach a reader, and the parity result shows it.
- B14 (builder): the header receipts were taken before the rebase (1446 fixtures, stamp 2026-11-15 07:57 UTC), and the tip was re-verified after it.
- P1 (PM seat): both ties in the node row-order test happen to sit in alphabetical key order, in COMPETITIONS' declaration order and in id order, so a tie-break on any of those may pass it; only the name and venue tie-breaks are reversed in its fixture.
- P2 (PM seat): the mobile half of (b) checks only the element that holds the words, so a clock in a sibling element may pass.
- P3 (PM seat): "Show all" at ratio 1 may be text inside the closed filter <details>, measured against the page behind it; if so the sampler counts invisible text, and the 528 are inflated.
- P4 (PM seat): parseColor returns null for oklch, oklab and color() values and the sample is dropped without being counted, so the receipt cannot say how much text went unmeasured.
````

---

## Pass 1.5: the rebuttal brief for Cursor's Pass 2 (Sun 15 Nov 2026, about 9:30 PM EST)

Written by the same PM seat. Beni chose this seat for it ("Pass 0 session", as relayed by the
Cosmic Horror Kickoff Planner session), and the review-loop planning session relayed the request.
The seat read everything fresh at about 9:20 PM:
- Pass 1's comment, whole, from GitHub;
- each of Pass 1's eight commits on its own;
- the PR at `5c53710`;
- the routing amendment Beni approved, on `docs/review-loop-plan` (PR #328, not merged);
- the seat facts in `docs/review-loop-proposal.md` on that branch.

It read code and ran no test, build or browser. It did run one contrast calculation: white on
`#D85A30` gives 3.871:1, which agrees with Pass 1's finding 13. Pass 1's findings and fixes go
to Cursor only as claims in the sealed appendix. P5 to P10 are the PM seat's new suspicions
from reading the eight commits. Delivered in chat in a four-backtick fenced block, one line per
paragraph; this copy is the archive.

````text
PR #327 — Pass 1.5: the rebuttal brief for Cursor (Pass 2), overhaul PR 0

You are Pass 2 of the 360 cycle for PR #327 in github.com/BeniCheni/kickoff, running in Cursor on This Mac on Grok 4.7 at Extra High (grok-4.7-xhigh), not in Plan mode. Cursor built this PR: five commits ending at 98aff91. Claude Code's Pass 1 cold review then posted its comment (https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6901527617, verdict "mergeable after fixes", thirteen findings) and pushed eight commits of its own, so cursor/overhaul-pr0-pin is now at 5c53710. This brief is Pass 1.5, written by the PM seat (Claude Code, Opus 5.5) on Sun 15 Nov 2026 at about 9:30 PM EST. Your Pass 2 has two jobs: answer every Pass 1 finding, and review Pass 1's eight commits cold, because nobody has reviewed them. Your deliverables are fix commits for what you accept and one PR comment. Stop at the comment.

WHO YOU ARE IN THIS CYCLE. Pass 2 is the builder's seat, and Cursor built PR 0, but you are a fresh session and hold none of the build session's reasons. Its account is the PR body and its five commit messages: treat that as evidence to test, not a position to defend. Where a finding turns on what the build meant and the record is silent, say so and do not supply a reason. Pass 1's commits are on your branch now, and you answer for them too.

THE MODEL AND THE TIER. Start on grok-4.7-xhigh by name. In the app, pick Grok 4.7 at Extra High. In the CLI, pass --model grok-4.7-xhigh explicitly, because the CLI reuses the last --model it ran, stored in ~/.cursor/cli-config.json (the review-loop spikes left it at grok-4.7 with low effort). Run `agent about` first and note the tier; it should read Super. The first line of your comment names the model that actually ran, as the model picker or the stream-json init event reports it, not the model you asked for. If usage stops you partway, push what is green, say so in a comment and stop. Never finish the pass on another model.

THE DEADLINE. Beni's Cursor access moves from the Super tier to a lower one on Thu 19 Nov 2026, so this pass must land by Wed 18 Nov. Beni approved that schedule on Sun 15 Nov 2026 ("Approve as proposed"). It is the amendment to section 3 of docs/design-overhaul-plan.md, on branch docs/review-loop-plan in PR #328, approved but not yet on main. Pace by it, but do not trade depth for the date: anything you could not run goes in "Not verified".

STATE AT PASS 1.5 (re-check all of it).
- PR #327 is open, not a draft, mergeable (CLEAN), auto-merge off. Head 5c537100c09726e602199ee9bb12fde351a25fad. Against origin/main (ad4c5f3, still the merge-base) it is 25 files, +1855/−107.
- Commits, oldest first. Cursor's: d123d30 rule tests, 2b683e4 smoke landmark, 0f7a8f2 runner, 1923a6c harness, 98aff91 changelog. Pass 1's, all authored Claude <noreply@anthropic.com> and pushed fast-forward: fe114c2, b80e1af, 1a0c963, 491771f, e9d2d72, 0490bc0, e8a3330, 5c53710.
- At 5c53710, verify (run 43762778411), the Vercel deployment and vercel-smoke are green. That vercel-smoke is main's checker: .github/workflows/preview-smoke.yml checks out main and runs main's scripts/vercel-smoke.mjs, so the PR's new landmark has never run against a Vercel deployment. The deployment answers 302 without a bypass secret, and that secret is not yours to seek.
- Pass 1's eight commits touch nothing under src/, index.html, offline.html, public/, web/app/, src/data/, .github/ or studio/, and no package file (PM seat: git diff --name-only 98aff91 5c53710).
- There is no review or approval, and nothing is merged or tagged. Pass 1's comment is posted under Beni's GitHub account, and yours will be too, because every seat's gh is Beni.

WHERE TO WORK. Beni's main checkout, /Users/benicheni/code/kickoff-pm, has a local cursor/overhaul-pr0-pin at 98aff91, eight commits behind the PR, plus untracked files and a git-ignored nested checkout in clearing.local/. Do not work, build or push there.
- Make your own worktree. From the main checkout, run git fetch origin, then git worktree add -b cursor/pr327-pass2 /Users/benicheni/code/kickoff-pr327-pass2 origin/cursor/overhaul-pr0-pin.
- Before you edit anything, confirm that git rev-parse HEAD prints 5c53710.
- Run npm ci at the root and again in web/.
- Push with git push origin HEAD:cursor/overhaul-pr0-pin, fast-forward only.
- Leave the other worktrees alone, especially .claude/worktrees/pr327-review (Pass 1's) and pr327-base.
- Treat Cursor's permission modes as seatbelts, not walls: in the review-loop spike, --mode ask wrote one file inside its worktree and one outside it. Edit nothing outside your worktree, whatever the mode allows.
- Never run npm run sync.

THE METHOD. Read AGENTS.md and CLAUDE.md first; they outrank everything below on process. Then read the tracked review skill at the head, .claude/skills/kickoff-pr-review/: SKILL.md's 360 table, its Pass 2 row and its rules, and pr-comment.md for the comment's shape. Run TZ=America/New_York date before you write any date.

WHAT BENI RULED, named as his.
- Sat 14 Nov 2026, in docs/design-overhaul-plan-review.md:
  - an integration branch, with this one PR on main first;
  - ten PRs, in the order of the plan's section 3;
  - the overhaul is numbered v0.6.0 at its release, not here;
  - Step 0 moves to &lens=ledger at the release, not here;
  - tests/dom/designCycle.test.tsx:47 and :66 stand;
  - ideas rows 126 and 129 fold into PRs 3 and 5.
- The dead-CSS ruling, carried out in #323: the public app's Tailwind scans only src/**/*.{ts,tsx}.
- Sun 15 Nov 2026: the routing amendment above, as proposed.
- Standing, in CLAUDE.md: no clock for a kickoff the league has not set; nothing invented; both clocks from one UTC instant; no data-honesty assertion ever weakened.
- Plan section 3: Beni's word merges every overhaul PR, after your Pass 2 and Codex's Pass 2.5.
He has ruled on nothing else in this PR. Findings 12 and 13 are his to rule on for later PRs, and so is anything still contested after your pass.

SPEC OF RECORD. First, docs/design-overhaul-plan.md: section 3's PR 0 row ("A general matrix runner … with a contrast sampler, a weight report and a same-origin check"), and the "PR 0" cells of 6.1, 6.2 and 8.1 to 8.3 row 0. Then docs/design-overhaul-pr0-implementation-prompt.md, with the addendum the PM seat sent beside it. The addendum is not in docs/, as Pass 1 noted, so here are its three points in full.
- (1) Branch off origin/main at 0fd5b98 or later, and add the ### Changed line beside the ### Fixed line #323 left in [Unreleased].
- (2) Since #323, the reader's Tailwind reads only src/**/*.{ts,tsx}, pinned by tests/tailwind-scan.test.ts and studio/test/admin-tokens.test.ts. So a utility class written in tests/harness/states.tsx gets no CSS, and widening the scan to reach it fails both guards and changes src/. The harness therefore styles itself with inline styles or a plain stylesheet that does not import tailwindcss.
- (3) The snapshot window moves forward a day with each sync, so the runner chooses its weeks by rule, names them in the receipt, and hard-codes none of the brief's dates.
Precedence: Beni's rulings, then the plan, then the build brief with its addendum. Note every precedence resolution in your comment.

HOW TO ANSWER. Give each of Pass 1's thirteen findings one disposition:
- Accept: name your commit, or say no change is needed.
- Contest: give a probe someone else can run (the command, the file and line, what you expected and what you saw) or a primary source.
- Accept the observation but contest how it is characterised or its severity: give the same kind of evidence.
For findings 1 to 11, Pass 1's fix commit is part of the finding, so accept or contest the fix as well as the defect. A contest without a probe or a source goes to Beni as unresolved. Write each answer so Codex's Pass 2.5 can reproduce it cold. Pass 1's claims are in its comment, and the sealed appendix below restates them as claims, not conclusions. Reach your own result on each.

PASS 1'S COMMITS, REVIEWED COLD. Read fe114c2, b80e1af, 1a0c963, 491771f, e9d2d72, 0490bc0, e8a3330 and 5c53710 each on its own. For each new or changed test, break the rule it claims to pin, show the test red, then restore; a test you have not seen fail is not verified. For each runner gate, break the gate on purpose against the head and show the run fail. Report any defect as a new finding with a probe. Report any defect in Cursor's own five commits that Pass 1 missed the same way.

THE THREE DESIGN CHOICES PASS 1 LEFT TO YOU. Decide each on the merits in your comment. Commit a change only if you judge the current form wrong, and keep it inside the fix scope.
- The harness's Table specimen. vite.config.ts rewrites the source text tableFor(league, today, nowUtcIso), in a ?kickoff-specimen copy of TablePage, and tests/harnessSpecimen.test.ts pins that text at src/components/TablePage.tsx:149. Pass 1 suggested a serve-only resolveId that hands that copy a harness shim for ../lib/standings, which pins a module boundary instead of a line, and committed nothing. Choose one, and say what PR 4 pays either way.
- The smoke landmark: <button … aria-label="Previous"> (src/components/FixturesPage.tsx:87), now named in the contract comment above ROUTES in scripts/vercel-smoke.mjs. An exact accessible name is no sturdier than the exact visible label it replaced. The handoff's week row (docs/design/5-handoff/second-edition-handoff.md:234) keeps a previous chevron but names no accessible name, and makes a chevron with no week beyond it "muted and inert". Say what the briefs for PR 3 and PR 5 must carry for the landmark to survive, or propose a sturdier one. Do not touch the workflow or its trust boundary.
- optimizeDeps.entries in vite.config.ts. It is a repo-wide dev-config change, made because a git-ignored nested checkout in Beni's main checkout (clearing.local/checkpoints/lens) confused the dependency scan. In a checkout without the nested one, Pass 1 found the same six dependencies pre-bundled with and without it. Keep it, narrow it or drop it, and say what it costs to add a new HTML entry.

OTHER OPEN ITEMS.
- Same-origin. For online loads, Pass 1 resolved the plan's "same-origin check" to the build brief's request report, and added a host gate to the offline file only. The plan outranks the brief. Say whether the runner now meets the plan. If it does not, say whether an online check that allows exactly today's two font hosts, and fails on any third, would meet it without failing today's look.
- Pass 1 named two items and did not do them: a test that meta.json's total equals the fixture count, and the CHANGELOG's ### Changed line sitting after ### Fixed, where released sections put Changed first. Do or decline each, with a reason.
- Findings 12 and 13 are defects in the shipped app: an unsettled row prints its retired kickoff time (src/components/FixtureRow.tsx:61), and the Table's loss pip is 3.87:1 (src/components/TablePage.tsx:96). Nothing under src/ changes here, so accept or contest only the observation and its severity. Their ideas rows land later in a docs PR, and finding 12 needs Beni's ruling before PR 3.

VERIFICATION.
- Keep every commit you add green. At the root: typecheck, npm test (both vitest projects), build, build:single, build:offline and the offline-bundle scan. In web/: typecheck, test, build, check:client and check:css.
- Reader parity. Build ad4c5f3 in a separate detached worktree and keep its dist/ and dist-single/. Build your tip, then run web/scripts/check-reader-parity.mjs (usage in web/verification/README.md:27); it must print identical: true. The script does not cover dist-offline/index.html, so hash it at both builds too.
- The runner, run whole at your tip, with all three origins set explicitly. Port 5173 is shared with Beni's checkout and other worktrees, so before you trust any server, confirm it serves your worktree (lsof -iTCP:<port> -sTCP:LISTEN, then that process's cwd). Start three servers: npx vite preview --host 127.0.0.1 --port 5173 --strictPort; npm --prefix web run start -- --hostname 127.0.0.1 --port 5174; and npx vite --host 127.0.0.1 --port 5175 --strictPort. Then run KICKOFF_VITE_ORIGIN=http://127.0.0.1:5173 KICKOFF_NEXT_ORIGIN=http://127.0.0.1:5174 KICKOFF_HARNESS_ORIGIN=http://127.0.0.1:5175 node web/scripts/evidence.mjs <an outDir outside the repo>, adding CHROME_PATH only if Chrome is not at the runner's default. Put the commands and the summary in your comment.
- The diff touches no src/, so the runner's 96 cells stand as the browser pass. Set the viewport before any capture you attach. If you cannot drive a browser, say so plainly and claim no matrix.
- Without the bypass secret, the new smoke checker cannot run against a real Vercel preview. Run it against a local Next production server, and say that is what you did.

FIX SCOPE. Change only PR 0's own files:
- its tests, and tests/harness/;
- the runner and its scripts: web/scripts/evidence.mjs, web/scripts/clearing.mjs, scripts/rendered-contrast.mjs, scripts/decode-png.mjs, scripts/evidence-weeks.mjs and their .d.mts files;
- the comments and checks in scripts/vercel-smoke.mjs;
- the two dev-only changes in vite.config.ts;
- the one CHANGELOG line.
Do not change anything under src/, index.html, offline.html, public/, web/app/, src/data/, .github/ or studio/, and touch no package file, lockfile, version, tag or CHANGELOG release section. Never weaken an assertion. To undo a Pass 1 commit you contest, add a revert commit and say why; never rewrite history. Commit as Cursor <cursoragent@cursor.com>, in small commits that each stay green.

WHAT YOU MUST NOT DO. Your gh is Beni's account, an Admin who can bypass the verify gate. Nothing technical stops these actions; this brief does.
- No gh pr merge in any form, no approval and no --auto.
- No npm version and no tag.
- No force-push and no --force-with-lease.
- No change to rulesets, repo settings or workflows.
- Leave the bot's sync/scheduled PR and every other PR alone.

YOUR COMMENT. Post one PR comment with gh pr comment 327 --body-file <file>, in pr-comment.md's table shape.
- Its first line names the pass, the seat and the model that ran: "Pass 2, Cursor, <observed model>".
- If you pushed, put your commit SHAs and the new head at the top, because the branch then moves under Codex's Pass 2.5.
- For each finding, give Pass 1's number and severity, your disposition, the evidence (the command and its result, with file and line) and the commit.
Then cover, in this order:
- what you found in Pass 1's eight commits;
- any new findings;
- the three design choices and the other open items;
- your precedence resolutions;
- what you did not verify;
- anything still contested between you and Pass 1;
- any question only Beni can answer, one line each, for Pass 2.5 to carry to him.

THE MERGE. Stop at your comment. Codex's Pass 2.5 re-runs your claims against the head, and Beni's word merges, per plan section 3.

SEALED APPENDIX — claims and suspicions to re-derive independently, never conclusions. If one does not reproduce, say so. Pass 1's comment also cites items from two earlier appendices: A1 to A12, from the brief it started from, which another PM session wrote and which is not yet in docs/; and B1 to B14 and P1 to P4, from the PM seat's supplement, archived on a branch not yet pushed. You need neither file: the items that still bear on this pass are restated below.

Pass 1's claims, at 98aff91 unless a commit is named:
- F1 (high): tests/dom/displayOrder.test.tsx took its day from the committed snapshot and failed when no such day was left. The snapshot held two such days, which leave the window on 21 Nov and 9 Jan, so a data-only sync would turn verify red. b80e1af mocks the data module with one synthetic Saturday.
- F2: the mobile half of the Table pin read only the element holding "kickoff time not yet set", so a clock beside it passed. 1a0c963 reads the club's whole row or card.
- F3: the node row-order test could not fail a tie-break by competition key, by id or by name descending. fe114c2 feeds three tied rows in all six orders.
- F4: 528 of 1,904 contrast samples were under the floors, and all but 16 of them were text nobody sees. The causes: a closed <details>, a line box reaching past its pill, clipped text, an ancestor's opacity ignored, and an oklch ink left unread. 491771f's baseline:
  - 1,224 samples, 16 under, all one ink-and-ground pair (F13);
  - 0 colours unread;
  - 16,032 pictograph-only text nodes set aside;
  - the muted ink lowest at 4.52:1 in light and 4.68:1 in dark.
- F5: a console warning passed the empty-console gate, because puppeteer names it 'warn'. Fixed in 0490bc0.
- F6: an offline file that asked for another host passed. 0490bc0 fails any host but the two font hosts.
- F7: the documented harness default (5173) could not pass, and a failed run lost its receipt. Fixed in 0490bc0 and 491771f.
- F8: the harness never showed the Table's unset cell on a phone, and a fixture row's sentence satisfied its needle. Fixed in e9d2d72 and 0490bc0.
- F9: the harness's clubs printed "matchday 3 of 2", and a club with one win and two defeats had seven points. Fixed in e9d2d72.
- F10: the decoder test had no Average row and only one Paeth byte, and the weeks' "no Champions League fixture" clause was held only by the snapshot. Fixed in e8a3330.
- F11: two comments overclaimed ("Dev server only", and "and no other copy on the page"). Fixed in 5c53710, comments only.
- F12: an unsettled row prints its retired kickoff, and nothing pins the time either way. Not fixed.
- F13: the Table's loss pip, white on bg-accent, is 3.87:1 in light. Not fixed.
- Further claims:
  - each of the five pins failed on a break in src/ and passed once restored;
  - reader parity printed identical: true at 98aff91 and at 5c53710;
  - dist-offline/ is byte-identical;
  - the Next client output is identical once the build id is normalised;
  - typecheck and npm test are green at each of the thirteen commits;
  - the plugin is absent from every build mode, and present but inert under vitest;
  - the landmark is in the Next server HTML of "/" only;
  - the weeks are 26 Oct (55), 9 Nov (0) and 19 Oct (105), and from Thu 19 Nov the UEFA week becomes 2 Nov (107).

Earlier items still open at 5c53710:
- A7 and B4 (builder): the landmark survives PRs 3 and 5. Pass 1 could not verify it.
- B10 (builder): the request report's hosts and weights: fonts 90,123 bytes on Fixtures and Table, Vite script 176,696, Next script 253,231.
- P4 (PM seat): a colour parseColor cannot read is dropped unmeasured. Pass 1 says it is now converted through one canvas pixel, and anything still unread is named and fails --enforce.

New, from the PM seat's reading of the eight commits (code read only, nothing run):
- P5: the second capture differs from the first by more than the text. The hide stylesheet also stops every animation and transition and turns every currentColor border, fill and background transparent. sampleContrast then counts every changed pixel inside a text's box as painted by that text (the paintedOnly scan in scripts/rendered-contrast.mjs, and measureContrast in web/scripts/evidence.mjs).
- P6: text covered by another element paints the same pixels in both captures, so the sampler falls back to its whole box and measures it against whatever covers it. checkVisibility does not see occlusion.
- P7: the pictograph rule (\p{Extended_Pictographic}, in collectText in evidence.mjs) also matches glyphs drawn in the element's own colour. Today that is ↗ (U+2197) at src/components/MomentsPlayback.tsx:25. If a later PR prints ©, ®, ™, ▶ or the arrows as text, those would go unmeasured too.
- P8: the escape gate listens only to the page's http(s) requests. A WebSocket, or a request from a worker or service worker, may not appear as one.
- P9: b80e1af's synthetic Saturday is 2026-11-21, six days after it was written, and WeekView reads the real clock (useNow, then staleLiveIds and hotFixtureIds), so from that date its scheduled rows render as kicked off. The order is probably unaffected; run the test with the system time set past that date.
- P10: at 5c53710, src/components/FixtureRow.tsx:61 reads {placeholder ? '—' : t.brooklyn.time}, with no status check. This bears on F12.
````

---

## Pass 2.5: the synthesis opener for Codex, with Beni's three rulings (Sun 15 Nov 2026, about 10:35 PM EST)

Cursor's Pass 2 posted at 03:20 UTC on 16 Nov (10:20 PM EST on 15 Nov):
https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6906350168. It reached the PM seat as
Beni's paste. Its verdict was "mergeable", and it moved the branch to `9226140` with four
Cursor commits. It left Beni three questions. The PM seat checked the comment and the commits
against GitHub and recommended an answer to each. At about 10:28 PM EST Beni answered "As
recommended". His rulings, recorded here first:

- **R1 (finding 12).** A postponed, cancelled, suspended or abandoned row prints no kickoff
  clock, neither in the row's leading slot nor when the row is opened. This is the app's
  `unsettledStatus` set in `src/lib/schema.ts`. PR 3 does it, pinned by a test, and readers
  see it at the release.
- **R2 (finding 13).** PR 4 repaints the Table's loss pip; its scope already holds the form
  pips. Until then, the PR 2 and PR 3 briefs either scope `--enforce` to the surfaces they
  change or carry the 16 loss-pip samples as the one known failure.
- **R3 (the smoke landmark).** The landmark stays a `<button>` whose accessible name is exactly
  "Previous", in the server HTML of `/` only. It stays a button when the chevron is muted and
  inert. The PR 3 and PR 5 briefs carry this.

The lineage docs PR should add R1 to R3 to `docs/design-overhaul-plan-review.md` beside the
14 Nov rulings. With these rulings, findings 12 and 13 are plan work, not ideas rows.

One question Beni has not answered: what model and effort Pass 2 ran on. Its comment names
"Grok 4.7" without an effort, and `agent about` read the CLI's stored "Grok 4.7 256K Low".
The opener has Codex put it to him rather than infer it.

The seat is Codex on GPT-6.1 Sol at xhigh. That follows plan section 3 and `README.md:359`
(Codex built nothing here), and the seat defaults the review-loop spikes recorded. Codex reads
the tracked skill rather than invoking it. The opener asks Codex to post on Mon 16 Nov if it
can, so Beni can merge by Tue 17 Nov. Under the approved amendment, that date keeps PR 1's
Cursor build on `grok-4.7-xhigh` possible. Delivered in chat in a four-backtick fenced block,
one line per paragraph; this copy is the archive.

````text
PR #327 — Pass 2.5 (synthesis): overhaul PR 0, pin the honesty rules and build the evidence runner

You are Pass 2.5 of the 360 cycle for PR #327 in github.com/BeniCheni/kickoff, running in Codex on GPT-6.1 Sol at xhigh. The method is /kickoff-pr-review with --pass 2.5 and --no-merge. Read .claude/skills/kickoff-pr-review/SKILL.md, executive-brief.md and pr-comment.md at the PR's head and follow them as written; they outrank this note on process. Ignore the untracked .agents/skills/kickoff-pr-review/ copy in Beni's main checkout. This note gives you the state, where the record lives, Beni's rulings and what is unusual about this cycle; it holds no conclusions. The PM seat (Claude Code, Opus 5.5) wrote it on Sun 15 Nov 2026 at about 10:35 PM EST. Your deliverables are the Executive Summary Brief, in your reply to Beni and ending with the handoff block, and one short PR comment. Push nothing.

YOUR SEAT. Codex built nothing in this PR and reviewed none of it: Cursor built it, Claude Code's Pass 1 reviewed it, and Cursor's Pass 2 rebutted. So where the merge gate asks whether anything is still contested between the vendors, it means Cursor and Claude Code. Pass 2.5 is a re-run, not a read. Every number in your brief comes from a command you ran, and anything you could not re-run is listed as not verified. Name the model and effort that ran in your comment's first line, from Codex's own session file (turn_context.model), not from --json output. Every seat's gh is Beni's account, an Admin who can bypass the verify gate, so this note is the only thing that stops a merge:
- no gh pr merge in any form, no approval and no --auto;
- no push of any kind, no tag and no npm version;
- no change to rulesets, repo settings, workflows or any other PR.

TIMING. Your pass needs no Cursor, so it may fall after Cursor's tier changes on Thu 19 Nov 2026. But Beni approved a routing amendment on Sun 15 Nov 2026: section 3 of docs/design-overhaul-plan.md, on branch docs/review-loop-plan in PR #328, approved but not yet on main. Under it, Cursor builds PR 1 on grok-4.7-xhigh only if PR 0 has merged and the integration branch exists by Tue 17 Nov. Post on Mon 16 Nov if you can, so Beni can merge by Tue 17 Nov. Do not trade depth for the date.

THE CYCLE SO FAR (re-check all of it).
- Cursor built the PR: five commits, d123d30 to 98aff91, authored Cursor <cursoragent@cursor.com>.
- Pass 1, Claude Code on Fable 5.2, posted https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6901527617, verdict "mergeable after fixes", with thirteen findings. It pushed eight commits, fe114c2 to 5c53710, authored Claude <noreply@anthropic.com>.
- Pass 2, Cursor, posted https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6906350168, verdict "mergeable". It accepts findings 1 to 11 and their fixes, accepts 12 and 13 as observations, and adds four new findings, N1 to N4. It pushed four commits, d8d85ba, f361122, 188e518 and 9226140, authored Cursor.
- At the PM seat's last read (10:30 PM EST), the head was 9226140eae9f4a447d7d61cb1691d048071b7a10: open, not a draft, CLEAN, auto-merge off, no review. verify (run 43797582721), the Vercel deployment and vercel-smoke were green there. origin/main and the merge-base are both ad4c5f3. Against it the PR is 28 files, +1947/−107.
- The green vercel-smoke status is main's checker: .github/workflows/preview-smoke.yml checks out main and runs main's scripts/vercel-smoke.mjs. The PR's new Previous landmark has run only against local Next servers, never against a Vercel preview. A preview deployment answers 302 without a bypass secret, and no seat is to seek one.

WHAT IS UNUSUAL.
- Nobody has confirmed what model Pass 2 ran on. The routing ruling asks for grok-4.7-xhigh. Pass 2's comment opens "Pass 2, Cursor, Grok 4.7" and says `agent about` reported the CLI's stored model as "Grok 4.7 256K Low". It saw no stream-json init event, so it names no effort. Only Beni knows what the session ran. If he has not told you, ask him in one word; do not infer it.
- Pass 2 ran npm test once, on the tree of its first three commits (1,010 tests in 79 files), not at each commit, and did not re-run it after 9226140. CLAUDE.md wants typecheck and npm test green at every commit.
- Merging this PR changes no rendered byte, but it changes two things every later PR meets. Main's preview smoke will demand the Previous button of every deployment, open PRs included (#114 and #328 are open). And verify gains tests/metaTotal.test.ts (f361122), which reads src/data on every sync PR. Judge both against the skill's merge-gate clauses, including the clause on sync.yml's gates.
- Beni's main checkout, /Users/benicheni/code/kickoff-pm, holds a local cursor/overhaul-pr0-pin at 98aff91 and some untracked files. Other seats' worktrees also exist: .claude/worktrees/pr327-review (Pass 1's), .claude/worktrees/pr327-base, /Users/benicheni/code/kickoff-pr327-pass2 (Pass 2's, at 9226140) and /Users/benicheni/code/kickoff-pr327-base (Pass 2's build of ad4c5f3). Do not edit, build in or remove any of them, and do not reuse their builds as evidence.

WHERE TO WORK.
- From the main checkout, run git fetch origin, then git worktree add --detach /Users/benicheni/code/kickoff-pr327-pass25 9226140 and git worktree add --detach /Users/benicheni/code/kickoff-pr327-pass25-base ad4c5f3. Confirm each HEAD before you build, and run npm ci at the root and in web/ in both.
- gh, git fetch and git worktree add may need your approval to run outside Codex's sandbox. Approve them one command at a time; do not switch the session to a mode that skips approvals.
- Pass 2's servers may still hold ports 5173 to 5175 from kickoff-pr327-pass2. Do not stop a process you did not start. Run your three servers on 5273, 5274 and 5275 and set the runner's three origins to match. Before you trust a server, confirm its cwd with lsof.
- Never run npm run sync.

WHERE THE RECORD LIVES.
- docs/design-overhaul-plan.md, section 3: PR 0's row and its evidence line. The evidence line asks for typecheck and npm test green in root and web/, each new test failing when its rule is broken and passing once restored, the bundle manifest identical, and the smoke green on the PR's own preview. Also read the "PR 0" cells of 6.1, 6.2 and 8.1 to 8.3 row 0.
- Then docs/design-overhaul-plan-review.md, for Beni's 14 Nov rulings, and docs/design-overhaul-pr0-implementation-prompt.md, the build brief.
- The build brief's addendum, the Pass 0 briefs and the Pass 1.5 brief are not on main. Pass 2 was given the addendum's three points in full:
  - branch off 0fd5b98 or later, and add the ### Changed line beside #323's ### Fixed line in [Unreleased];
  - the harness takes no Tailwind class, because the reader's Tailwind reads only src/**/*.{ts,tsx};
  - the runner chooses its weeks by rule and hard-codes none of the brief's dates.
- Precedence: Beni's rulings, then the plan, then the build brief with its addendum.

WHAT BENI RULED, named as his.
- Sat 14 Nov 2026, in docs/design-overhaul-plan-review.md: an integration branch, with this one PR on main first; ten PRs in section 3's order; v0.6.0 at the release, not here; Step 0 moves to &lens=ledger at the release; tests/dom/designCycle.test.tsx:47 and :66 stand; ideas rows 126 and 129 fold into PRs 3 and 5.
- The dead-CSS ruling, carried out in #323: the public app's Tailwind scans only src/**/*.{ts,tsx}.
- Sun 15 Nov 2026: the routing amendment, as proposed.
- Sun 15 Nov 2026, to the PM seat ("As recommended"), on the three questions Pass 2 left him:
  - R1, finding 12: a postponed, cancelled, suspended or abandoned row prints no kickoff clock, neither in the row's leading slot nor when the row is opened. These four statuses are the app's unsettledStatus set in src/lib/schema.ts. PR 3 does it, pinned by a test; readers see it at the release.
  - R2, finding 13: PR 4 repaints the loss pip, since its scope already holds the form pips. Until then, the PR 2 and PR 3 briefs either scope --enforce to the surfaces they change or carry the 16 loss-pip samples as the one known failure.
  - R3, the smoke landmark: it stays a <button> whose accessible name is exactly "Previous", in the server HTML of "/" only, and stays a button when the chevron is muted and inert. The PR 3 and PR 5 briefs carry it.
- Plan section 3: Beni's word merges every overhaul PR, after Cursor's Pass 2 and your Pass 2.5.
He has ruled on nothing else in this PR. R1 to R3 reached you through the PM seat, so ask Beni to confirm them in one word among your brief's questions.

WHAT YOUR PASS MUST SHOW.
1. Green, and the reader unchanged.
  - At 9226140, at the root: typecheck, npm test (both vitest projects), build, build:single, build:offline and the offline-bundle scan. In web/: typecheck, test, build, check:client and check:css.
  - Typecheck and npm test at each of d8d85ba, f361122, 188e518 and 9226140.
  - Reader parity: build ad4c5f3 yourself and keep its dist/ and dist-single/. Run web/scripts/check-reader-parity.mjs against that copy from the head's build (usage in web/verification/README.md:27); it must print identical: true.
  - Hash dist-offline/index.html at both builds.
  - Say whether the Next app's built client output, and the server HTML of /, /?tab=table and /?tab=moments, are unchanged.
2. Every fixed finding, red then green. This covers findings 1 to 11, Pass 2's N1 and N2, and f361122's test. For each, break the rule or gate the fix claims to hold, show it fail at the head, restore it, and show it pass. Where Pass 1 and Pass 2 broke the same thing, break something different where you can. Findings 12 and 13 are accepted observations, now ruled (R1, R2): confirm both observations at the head and change nothing.
3. Pass 2's four commits, each on its own.
  - d8d85ba: the online host gate (the page's own host plus fonts.googleapis.com and fonts.gstatic.com), and isBitmapGlyph.
  - f361122: tests/metaTotal.test.ts, and whether any path in scripts/sync.ts could write a total that differs from the fixtures it writes.
  - 188e518: Changed now comes before Fixed in [Unreleased], with the text unchanged.
  - 9226140: comments only.
4. The runner, run whole at the head on your own servers and origins, in report mode and with --enforce.
  - Compare it with both vendors' summaries: 96 matrix cells, 72 week cells, six harness cells, four offline cells, the three weeks it chose, 1,224 contrast samples with 16 under the floor (all the loss pip) and 0 unread, 16,032 pictograph nodes, and the hosts. Pass 2 reports that --enforce exits 1 on those 16.
  - Pass 2 also saw font bytes change between two runs (N4). Say whether that makes the weight report unfit as a baseline.
  - Break three gates on purpose and show each fail: overflow at 360, a console warning, and a third host on an online load.
5. The smoke. Run the head's scripts/vercel-smoke.mjs checker against a local Next production server, and say that is what you ran. Say whether merging would turn red the next preview of any open PR, once main's checker demands the Previous button.
6. The three design choices Pass 2 decided: keep the harness's source-line rewrite, with its pin in tests/harnessSpecimen.test.ts; keep the exact aria-label landmark, now R3; keep optimizeDeps.entries. Say whether anything is still contested between the two vendors on each of these. Do the same for P5 and P6, which Pass 2 recorded as limits, not defects.
7. The merge gate, clause by clause, in your brief. It ends in escalation whatever it finds, because plan section 3 gives the merge to Beni's word.

THE COMMENT AND THE BRIEF.
- Post one short PR comment with gh pr comment 327 --body-file <file>. Its first line names the pass, the seat, and the model and effort that ran. Then give the corroboration, one line per finding; what you could not re-run; and the escalation.
- The Executive Summary Brief follows executive-brief.md. Every question for Beni must be answerable in one word, and they must include the effort Pass 2 ran at and confirmation of R1 to R3.
- Its handoff block is the squash merge of #327. The squash message is in the repo's voice, names who ran which pass, and carries Co-authored-by trailers for Cursor <cursoragent@cursor.com> and Claude <noreply@anthropic.com>. Then git pull, and the three commands that must come back green: npm run typecheck, npm test and npm run build. No tag and no version: this is not a release.

IF YOU FIND A BLOCKER. Do not fix it. Give the minimal reproduction, its severity and the follow-up for the builder, and escalate. A synthesis that finds nothing in a real diff is itself a finding about the synthesis.

SEALED APPENDIX — the PM seat's checks and the vendors' claims. Re-derive each one independently and never cite it. If one does not reproduce, say so.
- S1 (PM seat): scripts/sync.ts writes meta.total as valid.length (:213), and writes fixtures.json from the same valid array (:220).
- S2 (PM seat): white on #D85A30 computes to 3.871:1.
- S3 (PM seat): plan section 8.3 assigns contrast to PR 2 (band, banner, feet), PR 3 (rows on pulp and typescript), PR 4 (Table) and PR 5 (covers), and section 3's PR 4 row names the form pips.
- S4 (PM seat): src/components/FixtureRow.tsx:36 sets placeholder from timeConfidence alone, and :61 prints {placeholder ? '—' : t.brooklyn.time} with no status check. src/lib/schema.ts calls the four unsettled statuses "a stored kickoff that is no longer a promise".
- C1 (Pass 2): with an <img> pointing at escape.invalid added to dist/index.html, d8d85ba's gate threw "asked for a host other than this page and the two font hosts". tests/requestHosts.test.ts failed when the function returned null for every URL.
- C2 (Pass 2): a WebSocket the page creates never reaches page.on('request'). A failed socket still fails the console gate; a connected one would not.
- C3 (Pass 2): with Date frozen at 2026-11-22 and at 2027-06-01, tests/dom/displayOrder.test.tsx stays green (the PM seat's P9, killed).
- C4 (Pass 2): setting meta.json's total to 1447 fails tests/metaTotal.test.ts.
- C5 (Pass 2): in a checkout with no nested checkout, npx vite optimize --force pre-bundles the same six dependencies with and without optimizeDeps.entries.
- C6 (Pass 2): P5 was measured on one cell, Ledger fixtures, light, 390: 131,381 changed pixels with both the full and a fill-only hide stylesheet, 462 of them outside the text boxes. P6: 20 of 124 in-viewport sample points hit another element, and none of them lies behind a reported ratio.
- C7 (Pass 1): the Next client output (.next/static, 19 files) is byte-identical once the build id is normalised, and the server HTML of the three routes is byte-identical.
````

---

## The fix round after Pass 2.5: the brief for Cursor (Sun 15 Nov 2026, about 11:10 PM EST)

Codex's Pass 2.5 posted at 10:53 PM EST:
https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6906796843. It ran on GPT-6.1 Sol at
`xhigh` and escalated with four new findings. It recommended Hold, and confirmed again the
reader parity, the 96 cells and the `--enforce` result on the 16 loss-pip samples. Beni answered
Codex's questions:
- Pass 2 ran at `xhigh`;
- R1–R3 stand as relayed ("Yes").

The PM seat then confirmed three findings in the code:
- the smoke's `\baria-label` pattern matches `data-aria-label` (run with node);
- `captureRequests` keys requests by CDP `requestId`, which a redirect chain shares (read);
- `collectText` reads only `style.color` (read).

It also found that the other three contract patterns in `ROUTES` accept the same kind of
prefixed attribute. It recommended Hold, so that the smoke fix lands on `main` in PR 0 rather
than waiting on the integration branch until the release. **Beni ruled "Hold, brief Cursor"**
at about 11:05 PM EST.

Still open, and Beni's to settle before the merge: the plan's "smoke green on the PR's own
preview". No seat can do that, because `preview-smoke.yml` always runs `main`'s script and the
bypass secret is Beni's. The PM seat recommended accepting the smoke that `preview-smoke.yml`
runs on `main`'s production deployment after the merge, with a revert if it fails. The other
choice is for Beni to run the head's checker against #327's preview with his own secret.

Delivered in chat in a four-backtick fenced block, one line per paragraph; this copy is the
archive.

````text
PR #327 — fix round after Codex's Pass 2.5 (Cursor, grok-4.7-xhigh): make the new gates able to fail

You are Cursor, on This Mac, on Grok 4.7 at Extra High. Start the session on grok-4.7-xhigh by name: pick it in the app, or pass --model grok-4.7-xhigh to the CLI, because the CLI reuses the last model it ran. The first line of your PR comment names the model and effort that actually ran.

Cursor built PR #327 in github.com/BeniCheni/kickoff ("Overhaul PR 0: pin the honesty rules and build the evidence runner", branch cursor/overhaul-pr0-pin, head 9226140) and ran its Pass 2. Codex's Pass 2.5 then re-ran the cycle and escalated it to Beni with four new findings: https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6906796843. Read that comment whole first. Then read CLAUDE.md and AGENTS.md; they bind you. Run TZ=America/New_York date before writing any date. If the head is no longer 9226140 when you start, stop and say so. The PM seat (Claude Code, Opus 5.5) wrote this brief on Sun 15 Nov 2026 at about 11:10 PM EST.

RULED BY BENI (Sun 15 Nov 2026), not open to contest.
- He held #327 at 9226140 for this fix round ("Hold, brief Cursor"), on Codex's recommendation.
- He answered Codex: Pass 2 ran at xhigh, and R1 to R3 stand as relayed.
  - R1: PR 3 removes both clocks from postponed, cancelled, suspended and abandoned rows, pinned by a test.
  - R2: PR 4 repaints the loss pip. Until then, --enforce exits 1 on exactly the pip's 16 samples, and that stays true after this round.
  - R3: the smoke landmark is a <button> whose accessible name is exactly "Previous". It appears in the server HTML of "/" only, and stays a button when muted and inert.
- Plan section 3: his word merges every overhaul PR.
- The routing amendment he approved (PR #328, not yet on main): Cursor builds PR 1 at grok-4.7-xhigh only if PR 0 has merged and the integration branch exists by Tue 17 Nov.

THE DEADLINE. Push and comment on Mon 16 Nov 2026, so Codex can re-check your commits and Beni can merge on Tue 17 Nov. Cursor's tier changes on Thu 19 Nov. If usage stops you partway, push what is green, say so in a comment and stop. Never finish on another model.

WHAT TO FIX. All five are inside PR 0's own files. For each one:
- reproduce the defect at 9226140 first, and show the command and what it printed;
- fix it;
- show the probe failing without the fix and passing with it.
A fix that was never shown red is not verified.

1. Medium: the smoke accepts an attribute that is not the real one.
  - The landmark pattern in scripts/vercel-smoke.mjs ROUTES is /<button\b[^>]*\baria-label="Previous"/. \b matches after a hyphen, so <button data-aria-label="Previous"> passes. So does a button whose aria-labelledby overrides its name. Codex made that edit to a real local production response, and all four routes still passed.
  - Every other contract pattern there has the same hole. The PM seat tested three edits: x-data-moments-background="route" matched data-moments-background="route", x-data-table-picker matched \bdata-table-picker, and <main data-aria-label="Moments"> matched <main\b[^>]*aria-label="Moments">. All three matched.
  - The fix: pin each of the five contract attributes as a real attribute of the right element, preceded by whitespace inside the tag. For the Previous button, also reject any aria-labelledby that would override its name.
  - Add regressions to tests/vercelSmoke.test.ts: a prefixed attribute for each landmark, and the aria-labelledby case.
  - Run the checker against a local Next production server on every route, and show it still passes on today's real HTML. Keep the contract comment above ROUTES true.

2. Medium: the cold-load report can miss a host it contacted.
  - captureRequests in web/scripts/evidence.mjs keys a Map by CDP requestId. Chrome reuses one requestId across a redirect chain (Network.requestWillBeSent fires again with redirectResponse), so each hop overwrites the one before. A stylesheet on a third host that redirects back to the page's origin is reported as the origin alone, and passes.
  - The fix: record every hop, check each hop's host with unexpectedHost, and count the transfer bytes once.
  - Prove it with Codex's probe: a stylesheet on a third host that redirects to the origin must fail the cold load and name that host. If the hop handling factors out cleanly, also pin it in a unit test fed a synthetic event sequence.

3. Medium: the contrast sampler measures the CSS color, not the colour actually painted.
  - collectText reads style.color only. Black color with -webkit-text-fill-color: #aaa on white therefore reads 21:1, where the painted pair is 2.323:1.
  - The fix: read the computed -webkit-text-fill-color, and measure it when it is a visible colour.
  - One rule binds this fix. docs/design-overhaul-plan.md, the foil row near line 354, measures foil text (drawn with background-clip: text) by the fallback colour under it. So when the fill is transparent, keep measuring color, as today.
  - Pin both cases, in tests/renderedContrast.test.ts or a page test: the #aaa fill reads about 2.32, and a transparent fill over a black color on white reads 21.
  - Show the 1,224-sample baseline unchanged, or explain every sample that moved.

4. Low: a run that fails late loses the cells that already passed.
  - runMatrix and captureWeeks fill a result object the caller owns. captureRequests, captureOffline and captureHarness instead build local arrays and return them only on success (web/scripts/evidence.mjs, roughly lines 313–452 and 512–560).
  - So when a dark harness cell fails, the light cells' PNGs are on disk but have no record in receipt.json.
  - The fix: give all three the same caller-owned pattern. Show it by forcing an overflow in a later harness cell and reading the earlier cells in the failed receipt.

5. Low: the two-club specimen describes a table that cannot exist.
  - tests/harness/states.tsx (roughly lines 65–76) gives Specimen Unset two wins and Specimen Kicked one win and one loss. That is three wins against one loss, in a table where the two clubs play only each other.
  - The fix: give them complementary records, so one club's wins are the other's losses, with matching goals. Keep "matchday 2 of 2", and keep both Table cells drawn.

ONE LOOK, NOT A FIX. tests/evidenceWeeks.test.ts reads the committed snapshot, and it runs inside npm test on every sync PR. Codex saw it time out once at the 5-second default while other jobs were competing for the machine; it passed on re-run. Time it alone and inside a full npm test.
- If it runs near the limit, make it cheaper or give that one test an explicit timeout, and say which you did.
- If it runs in well under a second, leave it alone and report the time.

SCOPE.
- Change only the files these five fixes touch: scripts/vercel-smoke.mjs, tests/vercelSmoke.test.ts, web/scripts/evidence.mjs, scripts/rendered-contrast.mjs and its .d.mts, tests/renderedContrast.test.ts, tests/harness/states.tsx, tests/evidenceWeeks.test.ts, and any new test file a fix needs.
- Touch nothing under src/, index.html, offline.html, public/, web/app/, src/data/, .github/ or studio/.
- No package file, lockfile, version, tag or CHANGELOG release section.
- Never weaken an assertion.
- Not in this round: R1 and R2, which belong to PRs 3 and 4, and the hosted-preview evidence, which is Beni's to settle before the merge.

WHERE AND HOW.
- Work in your Pass 2 worktree, /Users/benicheni/code/kickoff-pr327-pass2, on its local branch cursor/pr327-pass2.
- Run git fetch origin, then confirm that git rev-parse HEAD and git rev-parse origin/cursor/overhaul-pr0-pin both print 9226140 before you edit.
- Leave every other worktree alone, and edit nothing outside yours, whatever a permission mode allows.
- Make one commit per finding. Each message says what broke, how you proved it and how you verified the fix. Author each as Cursor <cursoragent@cursor.com>, and keep each green on typecheck and npm test.
- Push fast-forward with git push origin HEAD:cursor/overhaul-pr0-pin. Never force.
- Never run npm run sync.

VERIFICATION AT YOUR TIP.
- Root: typecheck, npm test (both projects), build, build:single, build:offline and the offline-bundle scan.
- web/: typecheck, test, build, check:client and check:css.
- Reader parity against your preserved ad4c5f3 build in /Users/benicheni/code/kickoff-pr327-base: identical: true, and the same dist-offline/index.html hash.
- The runner, whole, with the three origins set and each server's cwd confirmed with lsof. Report mode exits 0, and --enforce exits 1 on exactly the 16 loss-pip samples and nothing else.
- The smoke checker against a local Next production server. Say plainly that none of this ran against a Vercel preview.

WHAT YOU MUST NOT DO. Your gh is Beni's account, an Admin who can bypass the verify gate, so nothing technical stops these actions; this brief does.
- No gh pr merge in any form, no approval and no --auto.
- No npm version and no tag.
- No force-push and no --force-with-lease.
- No change to rulesets, repo settings or workflows.
- Touch no other PR.

REPLY. Post one PR comment on #327, headed "Fix round — Cursor — <model and effort that ran> — <new head SHA>". Put it in this order:
- your commit SHAs, at the top;
- for each finding, its commit and its red-then-green evidence;
- the week test's timing and what you did about it;
- the runner's summary in both modes;
- parity;
- anything you could not do.
Then reply in this chat with the comment's link. Codex re-checks your commits, and Beni merges.
````

---

## Pass 2.5, second sitting: Codex re-checks the fix round (Mon 16 Nov 2026, about 8:55 AM EST)

Cursor's fix round finished overnight. Comment:
https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6907572956, posted at 11:45 PM EST on
15 Nov and headed `grok-4.7-xhigh`.
- The head is `ff815e9`: five Cursor commits past `9226140`, fast-forward only.
- `verify` is green at `ff815e9` (run 43805954859).

At about 8:50 AM the PM seat read the comment and the five diffs:
- the smoke patterns now require whitespace inside the tag, and reject `aria-labelledby` on the
  Previous button;
- a `createColdLoad` log keeps every redirect hop;
- `paintedColor` measures a visible fill and falls back to `color` when the fill is transparent
  (the foil rule);
- the three remaining capture steps fill a result the caller owns;
- the specimen's records are complementary.

One gap: Cursor checked the landmark patterns by hand against local Next HTML. It did not run
the smoke checker end to end through `scripts/n6b-proof.mjs`, as Passes 1 and 2 did. The opener
asks Codex to run it.

The hosted-preview evidence is still Beni's to settle. The opener has Codex record his answer if
he has given it, and otherwise ask for it in one word. If he accepts the smoke on `main`'s
production deployment, the handoff block watches that run and gives the revert. Delivered in chat
in a four-backtick fenced block, one line per paragraph; this copy is the archive.

````text
PR #327 — Pass 2.5, second sitting (Codex): re-check Cursor's fix round, then hand the merge to Beni

You are Codex, on GPT-6.1 Sol at xhigh, continuing your Pass 2.5 of PR #327 in github.com/BeniCheni/kickoff. Your first sitting escalated at 9226140 with four new findings (https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6906796843), and Beni held the PR for a Cursor fix round. That round is done: https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6907572956. Read it whole. The method is still /kickoff-pr-review --pass 2.5 --no-merge; read .claude/skills/kickoff-pr-review/ at the head. This sitting re-runs the delta and the whole-tree checks, then updates your Executive Summary Brief. Push nothing. The PM seat (Claude Code, Opus 5.5) wrote this note on Mon 16 Nov 2026 at about 8:55 AM EST. Run TZ=America/New_York date before writing any date. If the head is no longer ff815e9 when you start, stop and say so.

STATE (re-check all of it).
- Head ff815e9c5f97535d444ca86f508eced62f3d08c4 on cursor/overhaul-pr0-pin: open, CLEAN, auto-merge off, no review.
- It is five Cursor commits past 9226140, fast-forward only:
  - 3dc3f23: the smoke's contract attributes;
  - 63080e4: redirect hops on a cold load;
  - c47e35b: the painted text fill;
  - ad37449: receipts that keep cells which already passed;
  - ff815e9: complementary specimen records.
- verify is green at ff815e9 (run 43805954859), and so are the Vercel deployment and vercel-smoke. vercel-smoke is still main's checker.
- Against ad4c5f3 the PR is now 30 files, +2161/−110. main is still ad4c5f3.

RULED BY BENI, named as his: everything in your first sitting's brief stands, together with three later rulings.
- Sun 15 Nov 2026: Pass 2 ran at xhigh, and R1 to R3 stand as relayed.
- Sun 15 Nov 2026: "Hold, brief Cursor", which held the PR at 9226140 for this round.
- Mon 16 Nov 2026 target: merge on Tue 17 Nov, so that PR 1 can still be built by Cursor at grok-4.7-xhigh under the routing amendment (PR #328, approved, not yet on main).
Not yet ruled: the hosted-preview evidence. The plan asks for the smoke green on the PR's own preview. No seat can produce that, because .github/workflows/preview-smoke.yml always runs main's script and the bypass secret is Beni's. The PM seat recommended accepting the smoke that preview-smoke.yml runs on main's production deployment after the merge, with a revert if it fails. The other choice is for Beni to run the head's checker against #327's preview with his own secret. If he has answered by the time you post, record his answer; otherwise ask for it in one word.

WHERE TO WORK. Your worktree /Users/benicheni/code/kickoff-pr327-pass25 is detached at 9226140. Run git fetch origin, then git checkout --detach ff815e9, and confirm HEAD. Your ad4c5f3 build in /Users/benicheni/code/kickoff-pr327-pass25-base is yours, so it stands as the parity baseline. Cursor's servers may hold 5173 to 5175: keep using 5273 to 5275, confirm each cwd with lsof, and do not stop a process you did not start. Never run npm run sync.

WHAT THIS SITTING MUST SHOW.
1. Each of your four findings, re-run against the fix, plus the PM seat's widening of the first:
  - Smoke (3dc3f23). Re-run your data-aria-label and aria-labelledby edits on a real local production response; both must now fail. Then try a prefixed stand-in for each of the other three contract attributes; each must fail too. Read PREVIOUS_BUTTON's lookahead and say whether any spelling of a conflicting name still gets through.
  - Hops (63080e4). Re-run your third-host stylesheet that redirects back to the origin; the cold load must now fail and name that host. Check tests/coldLoad.test.ts against what Chrome actually sends.
  - Fill (c47e35b). Re-run your black color with a #aaa fill (2.323:1), plus a transparent-fill foil case. Say whether the foil fallback matches the plan's foil row (docs/design-overhaul-plan.md, near line 354).
  - Receipts and specimen (ad37449, ff815e9). Force a late failure in each of the three capture steps, and read the cells that passed in the failed receipt. Check that the two clubs' records sum to a table that could exist.
2. The smoke checker end to end. Cursor applied the patterns by hand to local Next HTML and did not run smoke() through scripts/n6b-proof.mjs. Run n6b-proof at ff815e9 against a local Next production build, and report every route.
3. Whole-tree checks at ff815e9:
  - root typecheck and npm test, plus typecheck and npm test at each of the five commits;
  - build, build:single, build:offline and the offline-bundle scan;
  - in web/: typecheck, test, build, check:client and check:css;
  - reader parity against your preserved ad4c5f3 build, including the dist-offline/index.html hash;
  - the runner in report mode (exit 0) and with --enforce (exit 1, on the 16 loss-pip samples and nothing else), with the 1,224-sample baseline unchanged.
4. Cursor left tests/evidenceWeeks.test.ts alone, reporting 1,181 ms alone and 2,199 to 3,214 ms inside npm test against the 5-second default. Time it once yourself, and say whether it still belongs on the sync path's effective gate as it stands.
5. Anything new in the five commits. Read each on its own. Placement matters: createColdLoad and paintedColor now live in scripts/rendered-contrast.mjs beside the contrast code. Say whether that is a defect or a note.

THE BRIEF AND THE COMMENT. Post one short PR comment with gh pr comment 327 --body-file <file>. Its first line names the pass, the sitting, the model and effort that ran, and ff815e9. Then update your Executive Summary Brief, in executive-brief.md's shape:
- Decision: still escalated, because plan section 3 gives the merge to Beni's word. Give your recommendation, Merge or Hold, in one word.
- What the 360 found: your four findings with their fix commits and your re-run result.
- Verification as re-run: numbers from this sitting only.
- Questions for Beni, each answerable in one word: the hosted-preview evidence (unless he has answered), and Merge or Hold at ff815e9.
- The handoff block, for ff815e9:
  - gh pr merge 327 --repo BeniCheni/kickoff --squash --match-head-commit ff815e9c5f97535d444ca86f508eced62f3d08c4, with a subject and body in the repo's voice that name who ran which pass (Cursor built PR 0 and ran Pass 2 and the fix round at grok-4.7-xhigh; Claude Code ran Pass 1 on Fable 5.2; Codex ran Pass 2.5 on GPT-6.1 Sol at xhigh) and carry Co-authored-by trailers for Cursor <cursoragent@cursor.com> and Claude <noreply@anthropic.com>;
  - then git pull --ff-only, npm run typecheck, npm test and npm run build;
  - then, if Beni accepted the production smoke as the hosted proof: the gh commands that show preview-smoke.yml's run and the vercel-smoke status for the merge commit on main, and the git revert of that merge commit, with its push, to use if that smoke is red.
  No tag and no version: this is not a release.

WHAT YOU MUST NOT DO. Your gh is Beni's account, an Admin who can bypass the verify gate; this note is what stops you.
- No gh pr merge in any form, no approval and no --auto.
- No push of any kind, no tag and no npm version.
- No change to rulesets, repo settings, workflows or any other PR.
If you find a blocker, do not fix it: give the minimal reproduction, its severity and the follow-up for the builder, and recommend Hold.
````

**Ruled at about 9:45 AM EST on Mon 16 Nov 2026 (Beni): "Yes, with revert."** The plan's "smoke
green on the PR's own preview" is met by the smoke that `preview-smoke.yml` runs on `main`'s
production deployment after the merge. If that run is red, the merge is reverted. As this was
recorded, Codex had not yet posted its second sitting (#327 was still at `ff815e9`, with no
comment after Cursor's fix round). The line below went to Codex in chat, so that the handoff
block carries the production-smoke check and the revert.

```text
Beni ruled the hosted-preview evidence on Mon 16 Nov 2026 at about 9:45 AM EST: "Yes, with revert". The smoke that preview-smoke.yml runs on main's production deployment after the merge is the hosted proof. Record it as his ruling, drop that question from your brief, and end the handoff block with the gh commands that show that run and the merge commit's vercel-smoke status, followed by the git revert of the merge commit, and its push, to use if that smoke is red.
```

---

## The second fix round: the brief for Cursor, after Codex's second sitting (Mon 16 Nov 2026, about 10:20 AM EST)

Codex's second sitting posted at 9:58 AM EST:
https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6920004701. It recommended Hold at
`ff815e9` on one medium finding: the smoke's Previous-button pattern reads attribute names case
by case, and HTML does not.

The PM seat tested Codex's four bypasses with the repo's React 19.2.8 `renderToString` and the
head's `PREVIOUS_BUTTON` pattern:
- **A quoted `>` in an attribute, and a fake button in attribute text:** React escapes both
  (`&gt;`, `&lt;`), so neither can come from React's server HTML.
- **`ARIA-LABELLEDBY`:** React renders it as written, with only a development warning, and the
  pattern passes it. A browser reads attribute names without regard to case, so the name
  really is overridden.
- **`ariaLabelledby`:** harmless, because a browser lowercases it to `arialabelledby`.

The PM seat recommended one narrow round, time-boxed so that PR 1's window survives either way,
and **Beni ruled "Yes, one round"** at about 10:18 AM EST.

The time box: Cursor's commit and Codex's re-check must both land by Tue 17 Nov at 6 PM EST.
If they do not, he merges at `ff815e9` and the smoke fix moves to PR 1's brief.

Codex's two low findings are assigned as follows:
- **The redirect response's own bytes** (156 of 343 in its probe) go in this round only if
  small.
- **The foil ground capture** (black foil measured at 1:1 where the plan's fallback should
  read 21:1) goes to the brief of the first PR that renders foil text, which must fix it before
  `--enforce` counts foil.

Delivered in chat in a four-backtick fenced block, one line per paragraph; this copy is the
archive.

````text
PR #327 — second fix round (Cursor, grok-4.7-xhigh): the Previous landmark checks real start tags

You are Cursor, on This Mac, on Grok 4.7 at Extra High. Start on grok-4.7-xhigh by name, and name the model and effort that actually ran in your comment's first line. Codex's second Pass 2.5 sitting held PR #327 at ff815e9 on one medium finding: https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6920004701. Read it whole, then CLAUDE.md and AGENTS.md. Run TZ=America/New_York date before writing any date. If the head is no longer ff815e9, stop and say so. The PM seat (Claude Code, Opus 5.5) wrote this on Mon 16 Nov 2026 at about 10:20 AM EST.

RULED BY BENI. Everything in the last fix brief stands: R1 to R3, and the hosted proof ("Yes, with revert", Mon 16 Nov 2026), which is main's production smoke after the merge, reverted if it is red. He held #327 at ff815e9 for this one round, time-boxed. Your commit and Codex's re-check must both land by Tue 17 Nov at 6 PM EST. If they do not, he merges at ff815e9 and this work moves to PR 1's brief.

THE FIX. scripts/vercel-smoke.mjs matches its landmarks with regexes over raw HTML, but HTML attribute names are case-insensitive.
- Codex's evidence: a Previous button carrying ARIA-LABELLEDBY="other" passed all four routes, although Chrome named it "Wrong week". A <button-probe> element also counts as a button.
- The PM seat rendered the cases with the repo's React 19.2.8 renderToString. React escapes > and < inside attribute values, so the quoted-> and attribute-text bypasses cannot come from React's server HTML. It does render ARIA-LABELLEDBY exactly as written, with only a development warning, and the current pattern passes it.
- Replace the five landmark regexes with one small start-tag scan, with no new dependency. Find each start tag by its exact name (button, nav or main; any element for the two data attributes). Read its attributes with the names lowercased and quoted values honoured.
- Then check the contract on those attributes:
  - the button's aria-label is exactly "Previous" (the value stays case-sensitive), and the button has no aria-labelledby in any casing;
  - nav has aria-label="Primary";
  - main has aria-label="Moments";
  - some element has data-moments-background="route";
  - some element has data-table-picker.
- Keep the contract comment above ROUTES true.

PIN. In tests/vercelSmoke.test.ts, add each of these, and show each one red at ff815e9 and green after your fix:
- ARIA-LABELLEDBY and Aria-LabelledBy on the Previous button: fail.
- <button-probe aria-label="Previous">: fail.
- A quoted > in an earlier attribute, with a lowercase aria-labelledby after it: fail.
- "Previous week" and "previous" as the button's name: fail.
- Today's real server HTML of all three routes: pass.

ALSO, IF IT IS SMALL. Codex found that an allowed same-origin redirect drops the redirect response's own bytes from the cold-load receipt (156 of 343 bytes in its probe). If counting requestWillBeSent's redirectResponse.encodedDataLength per hop fits in one function and tests/coldLoad.test.ts, do it in its own commit. Otherwise leave it and say so.

NOT IN THIS ROUND.
- The foil ground capture, where black foil reads 1:1 but its fallback should read 21:1. That goes to the brief of the first PR that renders foil text, which must fix it before the strict contrast check counts foil.
- R1 and R2.

VERIFY.
- Make one commit per fix, each green on typecheck and npm test, authored Cursor <cursoragent@cursor.com>.
- Push fast-forward from /Users/benicheni/code/kickoff-pr327-pass2 with git push origin HEAD:cursor/overhaul-pr0-pin.
- At the tip: root typecheck, npm test, build, build:offline and the offline-bundle scan; web/ typecheck and test; node scripts/n6b-proof.mjs against a local Next production build, every route; and reader parity, which must print identical.

SCOPE.
- Change only scripts/vercel-smoke.mjs and tests/vercelSmoke.test.ts, plus scripts/rendered-contrast.mjs and tests/coldLoad.test.ts for the bytes.
- Touch nothing under src/, web/app/, .github/ or src/data/. No package, version or tag. Never weaken an assertion.
- No gh pr merge, no approval, no --auto and no force-push. No change to rulesets, repo settings, workflows or any other PR.

REPLY. Post one PR comment headed "Fix round 2 — Cursor — <model and effort> — <new head SHA>". Give your SHAs, each fix's red-then-green evidence, n6b-proof's routes, and anything you could not do. Then reply in this chat with the comment's link. Codex re-checks only these commits, and Beni merges.
````

---

## Pass 2.5, third sitting: Codex re-checks the second fix round (Mon 16 Nov 2026, about 11:20 AM EST)

Cursor's second fix round posted at 11:04 AM EST:
https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6921724097. It moved the head to
`ae927d7` with two Cursor commits:
- `b6d66bd` replaces the five landmark regexes with a start-tag scan;
- `ae927d7` counts each redirect hop's own bytes, and adds the `encodedDataLength` field to
  `scripts/rendered-contrast.d.mts` so that it typechecks.

`verify` is green at `ae927d7` (run 43903296055).

The PM seat read the scan. Three edge cases go to Codex as suspicions to re-derive:
- it reads a button inside `<template>` or `<noscript>`, which a browser with scripting on
  does not render;
- its tag name stops at the first character outside `[A-Za-z0-9:_-]`, so `<button.x …>` reads
  as a button;
- it compares attribute values without decoding entities, which can only fail safe.
None of them can come from today's React output.

The time box still runs to Tue 17 Nov at 6 PM EST. Delivered in chat in a four-backtick fenced
block, one line per paragraph; this copy is the archive.

````text
PR #327 — Pass 2.5, third sitting (Codex): re-check the second fix round, then hand the merge to Beni

You are Codex, on GPT-6.1 Sol at xhigh, continuing your Pass 2.5 of PR #327 in github.com/BeniCheni/kickoff. Your second sitting (https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6920004701) recommended Hold at ff815e9 on the smoke's case-sensitive attribute matching. Beni allowed one round, time-boxed: Cursor's fix and your re-check must both land by Tue 17 Nov 2026 at 6 PM EST, or he merges at ff815e9 and the smoke fix moves to PR 1's brief. Cursor's round is done: https://github.com/BeniCheni/kickoff/pull/327#issuecomment-6921724097. Read it whole. The method is still /kickoff-pr-review --pass 2.5 --no-merge. Push nothing. The PM seat (Claude Code, Opus 5.5) wrote this note on Mon 16 Nov 2026 at about 11:20 AM EST. Run TZ=America/New_York date before writing any date. If the head is no longer ae927d7, stop and say so. Post today if you can.

STATE (re-check all of it).
- Head ae927d76ad35f5fc0ce36cf40f3b1e1a0a980ce2 on cursor/overhaul-pr0-pin: open, CLEAN, auto-merge off, no review.
- It is two Cursor commits past ff815e9, fast-forward:
  - b6d66bd: a start-tag scan replaces the five landmark regexes in scripts/vercel-smoke.mjs, pinned in tests/vercelSmoke.test.ts;
  - ae927d7: each redirect hop's own bytes, in scripts/rendered-contrast.mjs and tests/coldLoad.test.ts, plus encodedDataLength on redirectResponse in scripts/rendered-contrast.d.mts so that it typechecks.
- verify is green at ae927d7 (run 43903296055). Against ad4c5f3 the PR is 30 files, +2440/−110. main is still ad4c5f3.

RULED BY BENI, unchanged since your second sitting.
- Everything in your earlier briefs stands: R1 to R3; Pass 2 at xhigh; the hosted proof, which is main's production smoke after the merge, reverted if it is red ("Yes, with revert").
- The one-round hold above, with its time box.
- The foil ground capture goes to the brief of the first PR that renders foil text, so it is not a finding here.

WHERE TO WORK. Run git fetch origin in /Users/benicheni/code/kickoff-pr327-pass25, then git checkout --detach ae927d7, and confirm HEAD. Keep your ports at 5273 to 5275 and confirm each cwd with lsof. Never run npm run sync.

WHAT THIS SITTING MUST SHOW.
1. The landmark scan (b6d66bd).
  - Re-run your own probe on a real local production response of "/": add ARIA-LABELLEDBY="other" to the Previous button and <span id="other">Wrong week</span> to the body. smoke() must now fail.
  - Do the same for Aria-LabelledBy, for a quoted > before a lowercase aria-labelledby, for <button-probe aria-label="Previous">, and for each prefixed stand-in from your second sitting.
  - Run scripts/n6b-proof.mjs at ae927d7 against a local Next production build, and report every route.
  - Read startTags and pageLandmarks, and say whether any spelling that a browser would name differently still passes, or whether any real button would now be missed. Then say whether the contract comment above ROUTES describes the scan.
2. The hop bytes (ae927d7). Re-run your same-origin redirect probe (156 + 187 bytes): the receipt must now hold 343. Check tests/coldLoad.test.ts against what Chrome actually sends, and confirm that the foreign-host check from 63080e4 still fails a third-host hop. Say whether the .d.mts change is only the type it claims to be.
3. Whole-tree checks at ae927d7:
  - root typecheck and npm test, plus typecheck and npm test at b6d66bd;
  - build, build:single, build:offline and the offline-bundle scan;
  - in web/: typecheck, test and build;
  - reader parity against your preserved ad4c5f3 build, including the dist-offline/index.html hash;
  - the runner once in report mode (exit 0), with the cold-load weights compared to your second sitting's, and --enforce once (exit 1, on the 16 loss-pip samples only).

THE BRIEF AND THE COMMENT. Post one short PR comment with gh pr comment 327 --body-file <file>. Its first line names the pass, the sitting, the model and effort that ran, and ae927d7. Then update your Executive Summary Brief:
- Decision: escalated under plan section 3, with your one-word recommendation, Merge or Hold.
- The two commits, each with your re-run result.
- Verification: numbers from this sitting only.
- One question for Beni: Merge or Hold at ae927d7.
- The handoff block for ae927d7, in the shape of your second sitting's:
  - gh pr merge 327 --squash --match-head-commit ae927d76ad35f5fc0ce36cf40f3b1e1a0a980ce2, with the same subject and body, the follow-up fixes now counting two rounds, and both trailers;
  - then git pull --ff-only, npm run typecheck, npm test and npm run build;
  - then the production-smoke check, matched by the deployed SHA;
  - then the revert, with its push, to use if that smoke is red.
  No tag and no version.

WHAT YOU MUST NOT DO. Your gh is Beni's account, an Admin who can bypass the verify gate; this note is what stops you.
- No gh pr merge in any form, no approval and no --auto.
- No push of any kind, no tag and no npm version.
- No change to rulesets, repo settings, workflows or any other PR.
If you find a blocker, do not fix it: give the minimal reproduction and its severity, and recommend Hold. Beni's time box then decides.

SEALED APPENDIX — the PM seat's reading of b6d66bd. Re-derive each one independently and never cite it. If one does not reproduce, say so.
- S5: startTags skips the contents of script, style, textarea and title. It does not skip <template> or <noscript>, so a Previous button inside either would count, although a browser with scripting on renders neither.
- S6: a tag name stops at the first character outside [A-Za-z0-9:_-], where a browser's tag name runs to whitespace, / or >. So <button.x aria-label="Previous"> reads as a button.
- S7: attribute values are compared without decoding entities. aria-label="Previ&#111;us" is named "Previous" by a browser but fails the scan. That can only fail safe.
- S8: the PM seat found nothing in today's React 19.2.8 server output that reaches S5 or S6.
````

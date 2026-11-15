# PR #327 — Pass 1: the cold-review brief for the overhaul's PR 0 (archived Sun 15 Nov 2026, TZ=America/New_York)

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

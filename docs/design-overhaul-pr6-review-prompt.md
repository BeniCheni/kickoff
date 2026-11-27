# Kickoff design overhaul, PR 6 (#393) — the review cycle, Pass 0 to the merge (25–27 Nov 2026, TZ=America/New_York)

## Pass 0: the cold-review opener for Pass 1

Written by the Kickoff Overall Planner, in the PM seat (Claude Code, `claude-opus-5-5` at `high`),
on Wed 25 Nov 2026 at about 9:15 PM EST, from a fresh read of PR #393 at `1cc5b90` and its base
`overhaul/second-edition` at `1f947af`. Codex built #393 on `gpt-6.2-astra` at `xhigh` from the
build brief archived beside this file (`design-overhaul-pr6-implementation-prompt.md`). The PR is
Tier 3, so this cycle is the six-pass 360 under `README.md`'s "When Codex builds" column: the PM
seat writes Passes 0 and 1.5, a fresh Claude Code session on `claude-fable-5-2` sits Pass 1
report-only, Codex answers Pass 2 and every fix, a fresh Claude Code session on `claude-opus-5-5`
sits Pass 2.5 and writes nothing, and Beni's word merges.

The main checkout `/Users/benicheni/code/kickoff` was deleted at about 8:02 PM, mid-build, and with
it every unpushed local branch. Codex rebuilt the branch in a clone and says it reproduced the
merge and six commits at their original object IDs. The opener therefore has Pass 1 make its own
clone, names the design template's real location, and puts the recovery claims in the sealed
appendix as claims.

This seat wrote the build brief, so it is not neutral about the spec; it states no opinion of the
code. Its own observations are in the appendix with the command and time each ran.

````text
You are Pass 1, the cold reviewer of Kickoff PR #393, a fresh Claude Code session on claude-fable-5-2 at xhigh, report-only. If you are not, stop and say so.
FIRST: read this whole brief from its archive with git -C /Users/benicheni/code/kickoff-pr393-pm show claude/overhaul-pr6-review-archive:docs/design-overhaul-pr6-review-prompt.md (or, once pushed, git show origin/claude/overhaul-pr6-review-archive:docs/design-overhaul-pr6-review-prompt.md from your clone). A long paste can drop lines without telling you, and the archive is the copy of record. If what you see here differs from it, follow the archive and say so.
Kickoff PR #393 (overhaul PR 6: the Rack turns): Pass 1, cold review
You are Pass 1 of the 360 cycle for PR #393 in github.com/BeniCheni/kickoff, branch codex/overhaul-pr6-rack into the integration branch overhaul/second-edition, not main. You wrote none of this PR. The head is 1cc5b9000cf2f1e4367ac48f2439415908391612 and the base is overhaul/second-edition at 1f947af5728fdaaad619322c9d6f6e8e32b63549. Name the model and effort that actually ran at the top of your comment. The PM seat (Claude Code, Opus 5.5) wrote this at about 9:15 PM EST on Wed 25 Nov 2026. Treat the repository as ground truth and this brief, the PR body and the build brief as maps of it. Run TZ=America/New_York date before you write any date.
THE METHOD. Run under the repo skill: /kickoff-pr-review 393 --pass 1. #388 brought it up to date with the tiers on main, and #393's merge of main carries that version. CLAUDE.md, AGENTS.md ("Review tiers", "Tier 3 paths") and README.md's "How it gets built" outrank it. If this session runs in the Learning output style, keep it out of the deliverable: no Learn-by-Doing request, no TODO(human), no insight box.
WHERE TO WORK. Beni's main checkout /Users/benicheni/code/kickoff no longer exists: it was deleted at about 8:02 PM tonight, so git worktree add from it is impossible. Make your own clone: git clone https://github.com/BeniCheni/kickoff.git /Users/benicheni/code/kickoff-pr393-pass1, then git -C /Users/benicheni/code/kickoff-pr393-pass1 fetch origin codex/overhaul-pr6-rack overhaul/second-edition claude/track-a-archive-8, then check out the head detached and confirm the full SHA. For the base, git -C /Users/benicheni/code/kickoff-pr393-pass1 worktree add --detach /Users/benicheni/code/kickoff-pr393-pass1-base 1f947af. Run npm ci at the root and in web/ of each. Never touch /Users/benicheni/code/kickoff if it reappears, or any other session's folder: kickoff-pr6, kickoff-pr6-base, kickoff-pr6-verify and the kickoff-pr6-recovery folders are the builder's evidence. Codex's servers listen on 7576 to 7578 and 7676 to 7678; leave them alone. Put your head's servers on 7591 (Vite preview), 7592 (Next) and 7593 (harness) and the base's on 7691 to 7693, and confirm each listener's cwd with lsof before any browser claim. Keep receipts under /Users/benicheni/code/kickoff-receipts/pr393/pass1/. The skill's design template, Fergie Time Design System/, is not beside the main checkout any more; it is at /Users/benicheni/Documents/Claude/Projects/Fergie Time Design System/. gh, tsx and listening on ports need the Bash sandbox off; ask through the harness and say what needed it.
WHO BUILT IT AND FROM WHAT. Codex built #393 on gpt-6.2-astra at xhigh, from the build brief archived beside this file: git -C /Users/benicheni/code/kickoff-pr393-pm show claude/overhaul-pr6-review-archive:docs/design-overhaul-pr6-implementation-prompt.md. That copy is a re-archive: the first, local commit 1507939, was lost with the checkout, and its header says so. Beni's rulings O1 to O5 in it bind the build: O1 the opened book follows board 06 read through rulings 15 and 33; O2 the Rack keeps its resting book while a book is open and only the shelf's reading spine follows it; O3 an opened volume shows every row; O4 nothing about an opened book enters the URL; O5 the line back closes the book and returns focus. The spec lineage, highest first: the design template, then the handoff (docs/design/5-handoff/second-edition-handoff.md, boards 03, 06, 09, 17 and 19) with the Poster-pass addendum (git show origin/claude/track-a-archive-8:docs/design/5-handoff/poster-pass-addendum.md), then docs/design-overhaul-plan.md (sections 1.2, 1.7 rows 9 and 10, 3's PR 6 row and evidence, 5.1 to 5.3, 8, 10.4 strings 4, 17, 32 and 33) and the plan review's rulings, then the build brief. Note every precedence resolution you make. PR 5's review record on #377 (Pass 1's findings 2 and 6, the Pass 2.5 synthesis's N1, N2, N4 and N5, Beni's rulings 7 to 10) is the background the brief carried forward.
THE SHAPE OF THE DIFF. The merge f74c4ec brings main 2bdf996 into the branch: the review skill and its records, the daily snapshot and the sync digest. Review it as a merge, not as authored code. The authored change is f74c4ec..1cc5b90, nine Codex commits. Its Tier 3 paths are tests/dom/poster.test.tsx (two assertions replaced, both disclosed in the body) and web/scripts/check-css.mjs (a verification gate, one line). The snapshot files make the Pass 2.5 gate escalate however this pass reads.
WHAT TO CHECK. Reproduce each item before you report it, and say how.
1. The house. npm run typecheck, npm test with the real counts (the body claims 1,639 root tests and 174 web), npm run build, build:single, build:offline and the offline-bundle scan; in web/, typecheck, test, build, check:client and check:css. Read verify and tier at the tip. Run at least one middle commit by its SHA too (95519ee, the opening commit), since the history was rebuilt.
2. The merge. Confirm f74c4ec's tree is the clean merge of 1f947af and 2bdf996, that src/data/*.json and docs/sync-digest.md equal 2bdf996's, and that no authored commit touches a file the merge brought.
3. The brief's fences. The build brief named files that were not Codex's: src/lib/lensSelectors.ts, urlCodecs.ts, useUrlState.ts, useMotionController.ts, motion.ts, time.ts, schema.ts, src/components/MotionControl.tsx, and tests/dom/posterClock.test.tsx (kept green, unweakened). Confirm none changed. The three shells (src/App.tsx, src/offline.tsx, web/app/shell.tsx) did change, to pass the motion state and an onRegister callback into FixturesPage: judge whether that keeps "one switch, one state" and the Next shell's paint-both-names rule, and whether web/app/shell.tsx now differs in behaviour from the other two.
4. Rulings O1 to O5, by behaviour in production builds of both apps at 390 and 1000. O2: with a book open, the Rack's centre face and current marker stay on the resting book, and only the shelf's reading spine and NOW READING move. O3: every row of the day, with both clocks, the hidden-by-filters line where it applies, no fold, no cycle or time-of-day group, no aside. O4: opening and closing changes neither location.search nor history.length, and ?only= and &date= survive. O5: the line back closes the book in each of its three forms (names the resting book; names the first other book when the resting book is the one open; the sole-book case) and focus returns to the control that opened it, whether a face or a spine.
5. What the build chose that the brief did not say. Judge each against the handoff and the plan, and say whether it belongs to Beni as a question: (a) while a book is open, Rack controls that would move it off the resting book are disabled; (b) the shelf switches between open volumes; (c) The Register's face is a button that opens the Table tab, with the league; (d) a transparent native button laid over each face beside its live text, named "Open {slide name}" at the centre and "Show {slide name}" on a neighbour, so check the reading order, the double announcement, and that no control nests in another; (e) Stop's accessible name in the AX tree is "STOP ROTATION" / "START ROTATION" in capitals, while string 4 and the brief give "Stop rotation" / "Start rotation"; (f) Start after a reader's pause begins a fresh pass instead of resuming (src/lib/useRackRotation.ts, restart and the effect keyed on motion); (g) the swipe's 48 px / 12 px at 0.5 px/ms thresholds after a 6 px direction check.
6. The rotation contract (handoff section 8; plan 5.3; src/lib/rackRotation.ts and useRackRotation.ts). The first crossing at 9 s of visible time, 7 s holds, 1.8 s crossings, one pass that visits every other slide, The Register included, and ends on the resting book; no rotation with The Register alone; a resting book that moves mid-pass. Gap 19 by your own frame-stepped script: never two title blocks visible, no box moves, outgoing gone by 1.56 s, incoming settled by 1.67 s, the marker and aria-current at 1.45 s within a frame, the live region off during automatic crossings and polite after a reader's move. Every stop: touch, keyboard focus, hover, a hidden tab, the Rack scrolled out of view, motion off, reduced motion with no stored choice. Resume only on an explicit Start; a hidden tab or an off-screen Rack resumes with no catch-up. With motion off, ruling 10's clock still moves the resting book at a day's last kickoff.
7. The mirror. The band's motion control and the Rack's Stop flip together in Vite, Next and the offline file; the stored kickoff-motion key and the rule that a Start under reduced motion lasts for the visit only both hold; with scripts blocked, Next paints the right names before hydration for stored-off and reduced motion.
8. Opening a book. The growth at 220 ms on cubic-bezier(.22,1,.36,1), the live type unwarped, the page below changing only when it ends, focus on the opened heading; instant with motion off. The watch harness (tests/harness/states.*) offers 220, 320, 450 and 600 at 390 and 1000, and none of it ships: check dist/, the single file, the offline file and the Next build for any harness string.
9. Data honesty. In an opened volume and on every Rack face: no kickoff time the league has not set, both clocks from one UTC instant, counts that follow the filters (ruling 39), the unset-kickoff words. Read every changed test assertion in f74c4ec..1cc5b90 and confirm none is weakened beyond the two the body discloses at tests/dom/poster.test.tsx.
10. The browser matrix. All 96 cells on your head at 360, 375, 390 and 1000, Vite and Next, both lenses and themes, all three tabs, with scrollWidth === innerWidth and the viewport set before every capture; the runner (web/scripts/evidence.mjs) in report and --enforce mode; one cell with a 15 px classic scrollbar (PR 5's finding 2); the Rack's neighbours at 900 and 921 px and the reading spine's footer at 360 (PR 5's N1). Compare the motion-off Rack at load with the base, pixel for pixel, outside the new control row.
11. Keyboard and assistive tech. The Tab order (Stop, the markers, the centre face's control), focus visible with the measured ring, no trap, the opened heading's focus and the line back's return. Take Chromium's accessibility snapshot yourself before and after a marker press. VoiceOver on macOS and iOS is Beni's, before Pass 3, with the "Markers / Buttons" call; do not attempt it.
12. Copy. The body proposes six strings for Beni's approval (The Rack; Open/Show {slide name}; "‹ Back to the week"; the two string-33 lines) and lists the harness-only labels. Grep the authored diff for every user-facing literal and report any that is neither in plan 10.4 nor in that list.
13. The offline and single files. Built, scanned, opened from disk with the network off; Stop, markers and opening work there. The offline file rotates through the shared FixturesPage, which the body puts to Beni as "Shared / Still"; collect the evidence he needs to answer.
FIX SCOPE. None. This pass is report-only. Push no commit, edit no file in the PR or its body, and do not mark it ready. Write each fix as a finding: file and line, the command that shows it, expected against observed, and the smallest change you would make. Keep probes outside the repo, with absolute paths.
THE COMMENT. One PR comment on #393, verdict first ("Mergeable now", "Mergeable after fixes" or "Not mergeable"), then: the model and effort that ran and the head you read; the test counts; the matrix as run; a findings table (severity, finding with file and line, how verified, smallest change); findings killed as unreproducible; your item 5 judgements; a "Not verified" list; and calls for Beni, each answerable in one word. Keep local paths and anything private out of it. Then stop, and reply in this chat with the comment's link and the verdict.
SEALED APPENDIX. These are claims, not conclusions. Verify each independently and report any that does not hold. The first group is the builder's, from the PR body. The second is the PM seat's, with the command and the time it ran.
- Builder: the merge and the six implementation commits that existed before the checkout was lost reproduced their original full object IDs after the rebuild; 112bc0f had no earlier SHA; unpublished cuts 3902348 and c9f9280 failed gates and were replaced. (Only the builder's session record can show the original IDs; say what the repository can and cannot confirm.)
- Builder: every published SHA passed root typecheck, both vitest projects, the three Vite builds and the offline scan, and web typecheck, tests, Next build, check:client, check:css and the local smoke proof, with the counts in the body's table.
- Builder: report and --enforce each passed 96/96 cells, 72 week cells and 144 Table cells, with 3,387 contrast samples, none below threshold or unread; the lowest was 5.73:1.
- Builder: gap 19 sampled 109 frames per crossing at 390 and 1000; aria-current moved at 1,450 ms; the last outgoing title sample was at 1,550 ms; the incoming title was first fully opaque at 1,683.33 ms.
- Builder: the first enforcement at 6b22b44 found 40 marker-title samples at 1:1, fixed in 1cc5b90 by moving the hold line 4 px below the marker drawing; the four-marker row's minimum is now 16.68:1.
- Builder: motion off at load matched PR 5 pixel for pixel across the face strip in 12 head/base pairs; seven stop cases held two captures 2 s apart byte for byte.
- Builder: the swipe commits at 48 px, or 12 px at 0.5 px/ms, after a 6 px direction check; a vertical touch scrolled 297 px over the faces.
- Builder: the offline file passed all 22 exclusion markers and made a full eight-book pass from disk with zero requests; the single file carries the same five Moments scanner strings as PR 5.
- PM seat, 9:05 PM EST: gh pr view 393 shows head 1cc5b90, base 1f947af, a draft, MERGEABLE and CLEAN, label tier-3, 37 files, +3,424/−1,943; verify, tier, vercel-smoke, Vercel and Vercel Preview Comments pass. git ls-remote shows main at 2bdf996.
- PM seat, 9:06 PM EST: git merge-tree --write-tree 1f947af 2bdf996 and git rev-parse f74c4ec^{tree} both print bce64087; f74c4ec's parents are 1f947af and 2bdf996; git diff --quiet 2bdf996 1cc5b90 -- src/data docs/sync-digest.md exits 0.
- PM seat, 9:06 PM EST: git diff --stat f74c4ec 1cc5b90 over the brief's "not yours" files and tests/dom/posterClock.test.tsx prints nothing; git diff --shortstat f74c4ec 1cc5b90 gives 22 files, +898/−61; exactly two removed lines in tests/ and web/test/ contain expect, the poster test's Rack and shelf "no controls" assertions; the authored diff's Tier 3 paths are tests/dom/poster.test.tsx and web/scripts/check-css.mjs.
````

## Pass 1.5: the rebuttal brief, the Pass 2 opener for the builder (Thu 26 Nov 2026, TZ=America/New_York)

Written by the Kickoff Overall Planner, in the PM seat (Claude Code, `claude-opus-5-5` at `high`),
on Thu 26 Nov 2026 at about 10:50 AM EST. It is based on the
[Pass 1 comment](https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7181608117), posted at
10:19 PM EST on 25 Nov ("Mergeable after fixes", eleven findings, four calls). At the time of
writing, `gh pr view 393` showed the head still at `1cc5b90`, a draft and CLEAN.

**The PM seat's spot-check.** Before writing this brief, the seat read the code at `1cc5b90` that
each finding names. Every cited line says what Pass 1 says it says:

| Findings | Where it reads |
|---|---|
| 1 | `PosterRack.tsx:102` (the hint mounts only while not paused) and `shell.css:1641` (the centred row) |
| 2 | `PosterRack.tsx:84` (the pause on `onPointerEnter`, `onTouchStart` and `onFocusCapture`) and `:40-44` (`toggle()` skips `toggleMotion` when paused) |
| 3 | `shell.css:1621` against `:1630-1631` (two placement models, a transition on one) |
| 4 | `shell.css:1611` (`overflow: clip`) |
| 5 | `FixturesPage.tsx:92` (`opened` is undefined while `opening`) |
| 6 | `FixturesPage.tsx:104-105` (the bounds come from the centre face) |
| 7 | `FixturesPage.tsx:48-52` (`prevToday` is set before the early return) |
| 8b | `FixturesPage.tsx:107-109` (`isConnected` is no test of focusability) |

The seat re-ran none of Pass 1's browser probes. The builder's reproduction is Pass 2's job.

**Beni's rulings on Pass 1's calls.** Beni ruled three of Pass 1's four calls in the PM seat's
session at about 10:42 AM EST:

- Call 1: "APG".
- Call 2: "Resume".
- Call 3: "Still, both".

Call 4 belongs to his VoiceOver sitting and stays open. This follows the #388 precedent: Beni rules
Pass 1's calls before Pass 1.5 is written.

Delivered in chat. This copy is the archive.

````text
You are PR 6's builder, Codex on gpt-6.2-astra at xhigh, in /Users/benicheni/code/kickoff-pr6-recovery on codex/overhaul-pr6-rack, the session that built #393 or a fresh one there on the same model and effort. If you are not, stop and say so. Confirm the model and effort from your own session record and put them on the first line of your Pass 2 comment.
FIRST: read this brief from its archive with git -C /Users/benicheni/code/kickoff-pr393-pm show claude/overhaul-pr6-review-archive:docs/design-overhaul-pr6-review-prompt.md (section "Pass 1.5"), or, once pushed, git show origin/claude/overhaul-pr6-review-archive:docs/design-overhaul-pr6-review-prompt.md from your clone. If the two differ, the archive wins.
Kickoff PR #393 (overhaul PR 6: the Rack turns): Pass 2, the builder's rebuttal and fix round
SEATS. You own Pass 2 and every fix round. Under README.md's "When Codex builds" column, the PM seat (Claude Code, claude-opus-5-5) wrote Pass 0 and this brief. A fresh Claude Code session on claude-fable-5-2 at xhigh ran Pass 1 report-only. A fresh Claude Code session on claude-opus-5-5 takes Pass 2.5 and writes nothing. Beni holds Pass 3 and the word to merge.
READ. AGENTS.md, CLAUDE.md, .claude/skills/kickoff-pr-review/SKILL.md (Pass 2 and the fix policy) and its pr-comment.md. Then the live #393 body and diff, and the whole Pass 1 comment: https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7181608117. Your build contract is the brief archived beside this file, design-overhaul-pr6-implementation-prompt.md, with handoff sections 5, 7 and 8 and plan 5.3 and 10.4. Spec precedence is template > design brief > implementation prompt, and Beni's rulings below are newer than all three. Run TZ=America/New_York date before dating anything.
PIN THE START. Pass 1 reported "Mergeable after fixes" at H = 1cc5b9000cf2f1e4367ac48f2439415908391612 against B = overhaul/second-edition at 1f947af. At 10:43 AM EST on Thu 26 Nov the PR was still a draft, CLEAN, with no formal review. Before you edit, check your worktree, branch, HEAD, the remote head and base, and git status. Reconcile any movement out loud.
WHAT EACH FINDING NEEDS. Record one of "accept", "contest", or "accept, contest the characterisation". Give your own reproduction or contrary evidence. Give your view of the severity where it differs, and a fix SHA or an explicit disposition. Pass 1's retro says the skill's severity scale has no line for a control that does something other than its name. It rated findings 1 and 2 high on that ground and asks you to contest the class apart from the reproduction. For findings 1 to 3, a scripted el.click() or fireEvent.click is neither a reproduction nor a proof of the fix. Use real pointer, touch and key events in production builds, and read the control's box before and after the press.
WORKTREE, PORTS AND RECEIPTS. Pass 1's evidence is in /Users/benicheni/code/kickoff-receipts/pr393/pass1/: comment.md, probes/*.mjs with lib.mjs, and probe-out/. The probes import from Pass 1's clone paths, so read them there and adapt copies; edit none of theirs. The probes that bear on each finding: 1, p2-control-row-shift. 2, p1-stop-real-input and p3-stop-preempted. 3, p4-first-pause-jump, p4b-jump-shot and p8-tap-to-open. 4, p12-ring and p11-keyboard-ax. 5 and 6, p6-opened-book and p7-growth-mirror. 7, 8 and 9, p13-small-checks. 10, p10-matrix-pixels. Write fresh evidence to a new round directory, /Users/benicheni/code/kickoff-receipts/pr6-build/pass2/, and keep your build receipts as they are. Head servers run on 7576 (Vite preview), 7577 (Next) and 7578 (harness) from kickoff-pr6-recovery. Base servers run on 7676, 7677 and 7678 from kickoff-pr6-recovery-base at 1f947af. Set KICKOFF_VITE_ORIGIN, KICKOFF_NEXT_ORIGIN and KICKOFF_HARNESS_ORIGIN explicitly. Check each listener with lsof -nP -iTCP:<port> -sTCP:LISTEN and its cwd with lsof -a -p <pid> -d cwd. Stop only your own processes. Leave alone Pass 1's clones (kickoff-pr393-pass1, -base, -mid) and their ports 7591-7593 and 7691-7693, the PM seat's clone kickoff-pr393-pm, and every other folder.
BENI'S RULINGS IN FORCE. From 25 Nov: O1 Board 06, O2 Rest, O3 All, O4 No (no URL state for an open book), O5 Close (the line back closes the book). These are as the build brief records them, and Pass 1 found all five hold. New this morning, Beni ruled three of Pass 1's calls in the PM seat's session at about 10:42 AM EST, Thu 26 Nov.
Call 1, Beni's "APG": the Rack's button keeps the name "Stop rotation" through a soft pause (hover, touch or focus), so one press on it turns motion off for the whole page, as the band's control does. This replaces build brief line 102's "the Rack's button then reads Start rotation" and board 09 frame 6 on that point only. The pause itself, the hint going during it, and "a pause is not a stop" still stand. "Start rotation" now shows only when motion is off.
Call 2, Beni's "Resume": a pass interrupted by a reader's pause continues from the slide it was on, with the time left in that hold, and does not start a new pass from the resting book with a fresh 9 s hold. This is handoff section 8's "resumes", and it replaces item 5(f) as built. Brief line 110, "a stopped Rack shows its resting book's still", still governs motion off.
Call 3, Beni's "Still, both": both disk files, the single file and the offline file, ship handoff section 7's motion-off state. They load with data-motion off, and neither rotates from disk. This answers the body's ruling 4, "Shared / Still"; record it as Beni's and take it off the open list. In the body, say whether a reader's Start can turn motion on in a disk file, and prove it either way. The offline scan, the 22 markers, the five Moments strings in the single file only, and the zero-request open from disk all stay green.
TWO CONSEQUENCES BENI HAS NOT RULED. Calls 1 and 2 meet in two places. Propose one behaviour for each, with your recommendation and its reason, and put each to Beni as a one-word question in your comment. Do not pick one silently, and keep your build reversible either way. (A) How does a soft pause end? The button no longer offers Start during one, and the brief's "hover ending does not resume it" would leave a frozen Rack under a label that says it is turning. Options: it ends when the pointer leaves and focus leaves the Rack, after a touch ends plus a hold, or never. (B) After a pause, Stop then Start: does the pass resume from where the pause left it, or begin again from the resting book, given that line 110 shows the resting still while motion is off?
THE ELEVEN FINDINGS, in Pass 1's order. Each was observed at H in Chrome 158 headless, in production builds of both apps.
1. High. The control row shifts under the reader's finger when the Rack pauses, so the first tap on a marker selects its neighbour. The hint unmounts on pause (PosterRack.tsx:102) and Stop's name changes, and the row is centred (shell.css:1641). Pass 1 measured Stop moving 42.75 px at 360 and 52.77 px at 390 and 1000, and four-slide markers moving 46.96 to 56.98 px. On week 16 Nov, the first tap selected the intended marker 0 times in 4, on both apps, at 360 and 390. A mouse gave the same off-by-one at 390 and 1000. Pass 1's smallest change: keep the hint's box when it hides (visibility: hidden) and give .rack-stop-label one width for both names. Under Beni's APG the name no longer changes on a pause, but motion off still swaps it, so check the hint and the motion-off swap separately. Add a runner cell that reads a marker's box before and after a real tap.
2. High. A press on "Stop rotation" never turns motion off by touch or mouse. The root pauses on pointerenter, touchstart and focus (PosterRack.tsx:84) before the click, so toggle() (PosterRack.tsx:40-44) sees a paused Rack, skips toggleMotion and calls restart(). Pass 1 saw data-motion stay on, kickoff-motion stay unset, the band still read Stop, and a crossing 10.5 s later. Repeated taps only alternated. By keyboard the first Enter restarts and the second stops. The dom test's fireEvent.click and the runner's el.click() cover none of this, so the body's "exercised Stop" evidence is overstated. Under APG, toggle() turns motion off whenever motion is on, paused or not. Add a dom test that fires pointerEnter or touchStart before the click and expects motion off. Add a real-input cell for touch, mouse and a single Enter in both apps and both disk files. Correct the body's evidence line.
3. Medium. On the first pause the neighbours jump to the centre and slide back over about 180 ms, and a quick tap on the centre lands on a neighbour. At rest they are placed with left (shell.css:1630-1631); under [data-reader] they are placed by a transform with a transition (shell.css:1621). Pass 1 saw about 150 ms off-place, by up to 338 px at 390 and 326 px at 1000. 8 of 26 presses on the centre face at 390 opened Friday's neighbour instead of Thursday: every 0 ms press, and 60 ms presses on the right of the cover. Smallest change: one placement model in both states, or add the transition one frame after data-reader is set. Pass 1 rated it medium because it needs a real thumb to say how often it bites.
4. Medium. The focus ring on Stop and on each marker is painted on two sides only. The ring sits 2 px outside a 44 px control, and the Rack clips it (shell.css:1611). With one control row, the top and bottom edges are 0 % painted, in both themes at 360, 390 and 1000. The body's "visible 2 px ring" is half right. Smallest change: .rack-stop:focus-visible, .rack-marker:focus-visible { outline-offset: -2px; }, as for the face and the heading.
5. Medium. Switching volumes on the shelf flashes the whole week for about 250 ms, because opened is undefined while the next growth runs (FixturesPage.tsx:92). From 37 to 291 ms the page was 4,728 px tall instead of 1,731, NOW READING went back to Thursday, seven markers re-enabled, and the scroll moved. Smallest change: skip the growth when a book is already open, or keep the old volume mounted until finish.
6. Low. A spine far below the Rack opens with a growth nobody sees, because it is drawn from the centre face's bounds (FixturesPage.tsx:104-105). At 390 the layer ran at y = -3,738 in an 844 px viewport. Smallest change: open at once when the face is off screen. This bears on the duration ruling, which is still open.
7. Low. After the week rolls over with a book open, closing it leaves last week on screen. prevToday is recorded before the early return (FixturesPage.tsx:48-52). Smallest change: set prevToday.current only when the anchor is updated.
8. Low. Focus drops to body in two places. (a) Enter on The Register's face: the face unmounts with the Fixtures tab. (b) Closing a book opened from a non-resting face after motion was toggled while it was open: the opener is a hidden slide, which isConnected does not catch (FixturesPage.tsx:107-111). Smallest change: (a) focus the Table tab or its heading in onRegister; (b) in close(), fall back to the centre face or the spine when the opener cannot take focus.
9. Low. In a Rack of two or three slides, a card crosses the centre during every automatic crossing (lane rule, PosterRack.tsx:110-115). With three slides (week 15 Feb 2027) a stock is dead centre at 0.9 s. With two, the cards pass through each other. Smallest change: hide that card's stock for the crossing when slides.length <= 3. It bears on the body's ruling 3, "one event".
10. Low. Eight markers are 352 px wide, and the row clips them below that. With a real 15 px scrollbar at 360 (client width 345), each end loses 3.5 px of hit area. Smallest change: let the eight share the row (flex: 1 1 0; max-width: 44px), and prove 44 px targets wherever they fit.
11. Low. openingMs is a prop on the shipped FixturesPage (FixturesPage.tsx:28) that only the watch harness sets, and it is in dist, both disk files and the Next build. No harness string ships. Drop it once the duration is ruled. Until then, say how you keep it out of the shipped surface or why it may stay.
12. Not a finding, a claim. Pass 1 could not confirm from the repository that the rebuilt commits reproduced their original object IDs: 3902348 and c9f9280 are not in it. Either give evidence a reader can re-run, or soften the claim in the body.
FIX SCOPE AND FENCES. Fix what you reproduce, within PR 6's files. The brief's fences still hold: src/lib/lensSelectors.ts, urlCodecs.ts, useUrlState.ts, useMotionController.ts, motion.ts, time.ts, schema.ts, src/components/MotionControl.tsx, and tests/dom/posterClock.test.tsx kept green and unweakened. If a fix needs a fenced file, stop and ask Beni. Every behavioural fix gets a test. Where logic is pure, put it in src/lib/rackRotation.ts and test it there. Never weaken a data-honesty assertion. Add no dependency and no new user-facing copy. The APG ruling needs none, since "Stop rotation" and "Start rotation" are string 4.
OPEN FOR BENI, keep open unless he answers. Pass 1's call 4, Keep / Trim: the title is spoken three times in a slide's linear read. That belongs to his VoiceOver sitting. The body's ruling 1 (Markers / Buttons), 2 (220 / 320 / 450 / 600), 3 (Yes / No) and 5 (Wrap / Edit), and the six copy items (Approve / Edit). Then your (A) and (B) above. For each, give your recommendation beside Pass 1's where it made one.
VERIFICATION, GREEN AT EVERY COMMIT. At the root: npm run typecheck, npm test with real counts, build, build:single, build:offline and the offline scan. In web/: typecheck, test, build, check:client and check:css. Run the runner in report and --enforce mode. Repeat the browser matrix cell for cell on every surface a fix touches: 360, 375, 390 and 1000, both apps, both lenses and themes, and scrollWidth === innerWidth, with the viewport set before every capture. Keep a real 15 px scrollbar cell at 360. Open both disk files from disk with the network off, under Beni's "Still, both". Show each high and medium fix red at H and green at your tip with real input.
COMMITS AND THE RECORD. Commit per commit as git -c user.name=Codex -c user.email=noreply@openai.com commit, with small commits that say what broke, how you proved it and how you verified the fix. Stage explicit paths only. Push the fix commits to codex/overhaul-pr6-rack. Do not mark the PR ready, approve, merge, tag, bump a version or deploy. Never run npm run sync, and leave sync/scheduled alone. Update the PR body: Beni's three rulings attributed to him, the body's ruling 4 marked answered, the corrected Stop and focus-ring evidence, the recovery claim per item 12, and the open list as above. Keep local paths and private material out of the public body and comments.
HANDOFF. Post one Pass 2 comment on #393 per pr-comment.md. Its first line gives your model and effort. Then a disposition for each of the twelve items with its fix SHA, the red-then-green evidence, the matrix as run, what you could not verify, and the open questions for Beni as one-word answers. End in chat with the comment's link, your tip SHA, and the live folders and ports you leave running and until when. The PM seat writes the Pass 2.5 opener from your comment.
````

## Pass 2.5: the synthesis opener (Thu 26 Nov 2026, TZ=America/New_York)

Written by the Kickoff Overall Planner, in the PM seat (Claude Code, `claude-opus-5-5` at `high`),
on Thu 26 Nov 2026 at about 12:05 PM EST. It is based on Codex's
[Pass 2 comment](https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7197918336), posted at
11:38 AM EST ("Mergeable now on the verified code"). Pass 2 accepted all twelve items, contested
finding 1's severity (high to medium), and pushed four commits: `e8fcc26`, `0e590be`, `fcb729d`
and `75ee995`.

At 12:01 PM EST, `gh pr view 393` showed the head at `75ee995`, still a draft and CLEAN, with all
five hosted checks passing.

**Beni's rulings since Pass 1.5.** In answer to Codex's question, Beni allowed a scope extension
to two files, `src/themeBoot.ts` and `src/components/ImprintBand.tsx`. They carry the pre-paint
lock on the disk editions and the natively disabled band control. The PM seat put his choice to
Codex with four conditions:

1. The apps are unchanged.
2. The disk files never write the stored choice and ignore a stored "on".
3. The change adds no new words.
4. The fences hold.

**Questions left open.** Pass 2 built (A) as **Leave** and (B) as **Fresh**, and both are
provisional. These two, the VoiceOver, phone and copy questions, and the severity contest go to
Pass 3.

The seat's own observations on the fix range are in the opener's sealed appendix, with the
command each came from. This seat wrote the build brief and Passes 0 and 1.5, so it states no
verdict on the code.

Delivered in chat. This copy is the archive.

````text
You are Pass 2.5, the synthesis seat for Kickoff PR #393: a fresh Claude Code session on claude-opus-5-5 at high that wrote neither the build nor any fix, and writes nothing to the repo. If you are not, stop and say so.
FIRST: read this brief from its archive with git -C /Users/benicheni/code/kickoff-pr393-pm show origin/claude/overhaul-pr6-review-archive:docs/design-overhaul-pr6-review-prompt.md (section "Pass 2.5"). If the two differ, the archive wins.
Kickoff PR #393 (overhaul PR 6: the Rack turns): Pass 2.5, synthesis and the Executive Summary Brief
THE METHOD. Run under the repo skill: /kickoff-pr-review 393 --pass 2.5. CLAUDE.md, AGENTS.md ("Review tiers", "Tier 3 paths") and README.md's "How it gets built" outrank it. If the slash command is unknown because this session started before your clone existed, read .claude/skills/kickoff-pr-review/SKILL.md and its executive-brief.md and pr-comment.md from your clone, and follow them as the method. Keep any Learning output style out of the deliverables.
SEATS. Codex (gpt-6.2-astra, xhigh) built #393 and ran Pass 2 with four fix commits. The PM seat (Claude Code, claude-opus-5-5) wrote the build brief and Passes 0 and 1.5. A fresh Claude Code session on claude-fable-5-2 at xhigh ran Pass 1. You wrote none of it. Beni holds Pass 3 and the word to merge.
READ, in this order. Pass 1's comment: https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7181608117. Pass 2's comment: https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7197918336. The live #393 body. Then the build brief, git show origin/claude/overhaul-pr6-review-archive:docs/design-overhaul-pr6-implementation-prompt.md, and this file's Pass 0 and Pass 1.5 sections, which hold Beni's rulings. Run TZ=America/New_York date before dating anything.
WHERE TO WORK. Beni's main checkout is gone. Make your own clone: git clone https://github.com/BeniCheni/kickoff.git /Users/benicheni/code/kickoff-pr393-pass25, then fetch codex/overhaul-pr6-rack and overhaul/second-edition, check out 75ee995c0f489c40be67a5a0a238321b839f1e2e detached and confirm the full SHA. For the base, git -C /Users/benicheni/code/kickoff-pr393-pass25 worktree add --detach /Users/benicheni/code/kickoff-pr393-pass25-base 1f947af5728fdaaad619322c9d6f6e8e32b63549, and for the pre-fix head, add /Users/benicheni/code/kickoff-pr393-pass25-h1 at 1cc5b90. Run npm ci at the root and in web/ of each you build. Put the tip's servers on 7594 (Vite preview), 7595 (Next) and 7596 (harness), and the base's or H's on 7694 to 7696. Confirm each listener's cwd with lsof before any browser claim. Leave alone Codex's folders (kickoff-pr6*, all of them) and its servers on 7576-7578 and 7676-7678, which it keeps running for Beni's phone sitting. Leave Pass 1's clones (kickoff-pr393-pass1*), the PM seat's clone kickoff-pr393-pm, and every other folder. Keep receipts under /Users/benicheni/code/kickoff-receipts/pr393/pass25/. The design template is at /Users/benicheni/Documents/Claude/Projects/Fergie Time Design System/. gh, tsx and listening on ports need the Bash sandbox off; ask through the harness and say what needed it.
PIN THE TIP. At 12:01 PM EST on Thu 26 Nov, #393 was a draft and CLEAN at 75ee995 on base 1f947af. verify, tier (Tier 3), vercel-smoke, Vercel and Vercel Preview Comments all passed. If the head or base has moved, re-pin and say so before scoring anything.
BENI'S RULINGS TO HOLD THE TIP TO. From 25 Nov: O1 Board 06, O2 Rest, O3 All, O4 No, O5 Close. From Thu 26 Nov, on Pass 1's calls: "APG" (the Rack's button keeps "Stop rotation" through a soft pause, and one press turns motion off for the page); "Resume" (a reader's pause continues from its slide and the unspent hold); "Still, both" (the single file and the offline file ship motion-off and do not rotate from disk). Later that morning, on Codex's question, he allowed a scope extension to src/themeBoot.ts and src/components/ImprintBand.tsx for the pre-paint disk lock and a natively disabled band control. The PM seat passed that on with four conditions: the Vite and Next apps behave as at 1cc5b90 for every stored and reduced-motion state; a disk file never writes kickoff-motion and ignores a stored "on" at load and after hydration; no new words; the fenced files (src/lib/lensSelectors.ts, urlCodecs.ts, useUrlState.ts, useMotionController.ts, motion.ts, time.ts, schema.ts, src/components/MotionControl.tsx, tests/dom/posterClock.test.tsx) untouched. Score each ruling and each condition as met, unmet or not verified.
WHAT TO RE-RUN. Every number in your brief comes from a command you ran in this session. At the tip: npm run typecheck, npm test with real counts (Pass 2 claims 1,648 root tests in 123 files and 174 web tests in 28), build, build:single, build:offline and the offline scan with its 22 markers. In web/: typecheck, test, build, check:client and check:css. Run the runner in report and --enforce mode (Pass 2 claims 3,387 contrast samples each, none below threshold or unread, lowest 5.73:1). Run each rebuttal commit's gates on its own SHA where the skill asks. Read verify and tier for the tip. Then verify every "fixed" row against the code and reproduce each high and medium fix red at 1cc5b90 and green at 75ee995, with real pointer, touch and key events in production builds, reading the control's box before and after the press. Scripted el.click() or fireEvent.click proves none of findings 1 to 3. Re-run the browser matrix cell for cell on every surface the rebuttal touched, at 360, 375, 390 and 1000, both apps, both lenses and themes, with scrollWidth === innerWidth and the viewport set before every capture, plus one cell with a real 15 px scrollbar at 360. Open both disk files from disk with the network off, with no stored choice and with kickoff-motion=on seeded before load, and confirm they stay still through hydration, a band press, a Rack press, an 11 s hold and a reload, with zero writes and zero requests.
THE QUESTIONS PASS 3 WILL ASK BENI. Pass 2 built two consequences of APG and Resume that Beni has not ruled, and marked both provisional: (A) a soft pause ends when the pointer and focus have both left, or 7 s after the last touch ends ("Leave"); (B) a deliberate Stop then Start begins again from the resting book with a full 9 s hold ("Fresh"). Confirm each behaves as described, is reversible as claimed, and does not contradict "Resume" or build brief line 110, then put each to Beni as a one-word question. Still open from the body and Pass 1: Markers / Buttons, 220 / 320 / 450 / 600, Yes / No (one event), Wrap / Edit, Keep / Trim, and Approve / Edit for each of the six copy items. These belong to Beni's VoiceOver and phone sitting. Pass 2 also contests finding 1's severity (high to medium). Give your own reading with its reason, and leave the class to Beni if you and Pass 2 differ.
THE LANDING. This is not a release: no version bump, CHANGELOG section or tag, and the PR goes into overhaul/second-edition, not main. Feature PRs into the integration branch are squashed; see git show -s bf7b82b for PR 5's squash message and its trailers as the house precedent. The PR is a draft, so the handoff block starts with gh pr ready 393, then the head-pinned squash (gh pr merge 393 --squash --match-head-commit <tip>) with its subject, body and both trailers, the tree check from the skill's §7 step 4, and the commands that must come back green after git pull on the integration branch. Mark nothing ready, merge nothing and approve nothing yourself.
DELIVERABLES. Two only. One short PR comment on #393 per pr-comment.md, recording the corroboration and the escalation, first line your model and effort. Then the Executive Summary Brief in chat per executive-brief.md, with the scored gate, what you could not verify (VoiceOver on macOS and iOS, a real phone, Safari, WebKit and Firefox, at least), the one-word questions for Beni, and the handoff block last as one fenced, paste-ready block. Push nothing and edit nothing in the PR or its body. Keep local paths and private material out of the public comment. End with the folders and ports you leave running and until when.
SEALED APPENDIX. These are the PM seat's observations from reading the fix range at 12:00 to 12:03 PM EST, not conclusions. Verify each independently, and say so where one does not hold. (1) git log 1cc5b90..75ee995 shows four commits, all authored Codex <noreply@openai.com>: e8fcc26, 0e590be, fcb729d, 75ee995. git diff --stat over the same range gives 14 files, +399/−109, including src/App.tsx, src/offline.tsx, src/themeBoot.ts and src/components/ImprintBand.tsx. git diff --stat over the fenced files, src/data and docs/sync-digest.md prints nothing. (2) Three expect lines are removed in tests/ over the range: the rack-hint toBeNull, a marker's aria-current toBe(false), and activeElement toBe(spine). Check each is replaced by an equal or stronger assertion and none touches data honesty. (3) src/themeBoot.ts now picks the disk lock by ['single', 'offline'].includes('%MODE%'), relying on Vite's HTML %MODE% substitution after the bootstrap is inlined, and on Next embedding the unexpanded string. Confirm what each of the four outputs (dist, the single file, the offline file, the Next build) actually carries in that position, and that the Vite dev server and Next keep the stored preference. (4) App.tsx and offline.tsx choose useStillMotion by import.meta.env.MODE; useStillMotion lives in ImprintBand.tsx. Confirm the Vite app is not locked and that Moments in the single file still works under a constant motion-off. (5) The disabled band control is wrapped in <fieldset disabled className="contents">. Confirm the built disk CSS gives .contents display: contents, so the band's layout matches 1cc5b90's motion-off band, and record what Chromium's tree names the disabled controls. (6) Pass 2's figures to re-derive: first marker taps 0/16 to 16/16; centre-cover presses 18/26 to 26/26 per app at 390 and 90/90 across variants; the 4,729 px flash for 237 ms (Vite) and 251 ms (Next) gone; eight markers at 43.125 × 44 px under a 15 px gutter; the four-edge focus ring 100 % on 96 controls; motion-off face strips matching the base pixel for pixel in 20 of 24 pairs, with the other four put down to the newer snapshot.
````

## Between the passes: the builder's seat check and the restart (Thu 26 and Fri 27 Nov 2026)

At about 10:55 AM EST on 26 Nov, the fresh Codex session that Beni opened for Pass 2 stopped
before any edit. Its session record confirmed `gpt-6.2-astra` at `xhigh`, but the session had
started in `/Users/benicheni/code` rather than in the builder's checkout. The PM seat checked the
checkout at 10:56 AM: clean, on `codex/overhaul-pr6-rack` at `1cc5b90`, with no listener on
7576–7578 or 7676–7678. It told Codex to proceed: a session's start folder does not change the
seat. The same note corrected one line of the Pass 1.5 brief, which had said the head servers
"run" on those ports when Codex had to start them. The Pass 2.5 section above records Codex's
scope question and Beni's ruling on it.

On the morning of 27 Nov, every review server was down. At the PM seat's request, Codex
restarted the tip's three production servers from `kickoff-pr6-recovery` on 7576–7578 for
Beni's sitting. It first confirmed the checkout was clean at `75ee995`. The PM seat fetched each
of the three links at 10:35 AM EST and got 200.

## Pass 2.5's Executive Summary Brief, as delivered (Thu 26 Nov 2026, 12:49 PM EST)

A fresh Claude Code session on `claude-opus-5-5` sat Pass 2.5 from its own clone. It posted the
[Pass 2.5 comment](https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7199726061) at
12:49 PM EST and delivered the brief below in its chat. The model is confirmed by the session
file's assistant records. The effort, `high`, is as briefed; the seat said it could not read its
own effort setting.

The PM seat extracted the brief word for word from that session file on Fri 27 Nov 2026. The
brief is the last assistant text block, which starts at its heading. Its handoff block `cd`s
into the seat's clone. The PM seat ran the same steps from its own clone (Pass 3 below).

`````markdown
## Executive Summary Brief: PR #393 · Pass 2.5 · Thu 26 Nov 2026, 12:49 PM EST

**Decision: escalated.** The merge is yours to give. At `75ee995c0f489c40be67a5a0a238321b839f1e2e` all eleven gates pass, on the tip and on each fix commit. Every high and medium fix fails at 1cc5b90 and passes at the tip with real touch, mouse and key presses. All four conditions on your scope extension are met. Two behaviours are still provisional, and your VoiceOver and phone questions are still open.

I'm a fresh Claude Code session on `claude-opus-5-5`. I wrote neither the build nor any fix. My effort setting is `high` as briefed; I can't read it from inside the session. The archived brief and your paste match.

### Merge gate
| # | Clause | Score | Evidence at the tip |
|---|---|---|---|
| 1 | Not a release | **Met** | No change to `package.json`, the lockfile or `CHANGELOG.md` against the base; no tag. |
| 2 | No numbering fork | **Met** | No version moves. |
| 3 | Every standing high has a verified fix | **Met** | Finding 2 fixed in `e8fcc26` (and `fcb729d` for the disk files); finding 1 fixed in `e8fcc26`. Both fail at 1cc5b90 and pass at the tip. |
| 4 | No unresolved dispute between vendors | **Met** | Finding 1's severity: Pass 1 said high, Pass 2 says medium. I read medium (reason below), so nothing is left open. |
| 5 | `verify` green at the tip | **Met** | Run 45858866524 succeeded; `tier` computed Tier 3 from main `2931dde`. |
| 6 | `?only=` / `&date=` contract unchanged | **Met** | The codec and selector files are untouched across the whole PR. Opening and closing a book leaves `location.search` and `history.length` unchanged (8 of 8 cells). |
| 7 | `sync.yml` gates unchanged | **Met** | Nothing under `.github/` or `scripts/` changed. |
| 8 | `src/data/*.json` unchanged | **Unmet as written, by design** | Merge `f74c4ec` brings in main's snapshot. It is byte-identical to main at `2bdf996`, and no authored commit touches it. You own this call; it is already disclosed in the PR body. |

### Your rulings at the tip
- **O1–O5:** O2, O4 and O5 re-checked by touch and mouse at 390 and 1000 in both apps, 8 of 8. O1 and O3 weren't re-run; the rebuttal only removed the opening duration from that code.
- **"APG": met.** The button reads STOP ROTATION through hover, focus and touch pauses, and one press stops the page in 6 of 6 cells.
- **"Resume": met.** A pause 4.6 s into the first hold carried on 4.47 s after release (hover and focus, both apps). After a touch it carried on 11.47 s after the touch ended (7 s plus the unspent hold).
- **"Still, both": met.** Both disk files were opened from disk with the network off, once with no stored choice and once with `kickoff-motion=on` set before load. Each stayed `off` from its first paint through hydration, band and Rack presses, an 11 s hold and a reload. There were zero crossings, storage writes, requests and console errors.
- **Scope conditions:**
  - (1) Met. Boot, band press, reload and the stored value match 1cc5b90 in all four stored and reduced-motion states, on Vite preview, Next and the Vite dev server. The only difference is the stored-off row's first Rack press, which now stops, as you ruled.
  - (2) Met.
  - (3) Met: no new words.
  - (4) Met: the fenced files are untouched.
  - Appendix (3) holds: the boot string reads `production` in `dist`, `single` and `offline` in the two disk files, `development` on the dev server, and the unexpanded `%MODE%` in Next's served HTML.

### What ships
- The Rack makes one pass through the week's books and The Register: a 9 s first hold, 7 s holds, 1.8 s crossings, then it rests on the resting book.
- Hover, touch and focus pause it in place, and it carries on with the hold it had left. "Stop rotation" turns motion off for the whole page in one press.
- Markers, a swipe and the faces move it. A centre tap opens the day's volume with every filtered fixture and both clocks, and the line back closes it.
- The shelf's spines open volumes and switch between them; The Register opens the Table.
- Both disk files ship still and can't start motion.

### Where it sits
This is overhaul PR 6 into `overhaul/second-edition`, not `main`, and it isn't a release. Main has moved on since the merge (a newer snapshot, `6862ee7`, and `2931dde`), so the integration branch carries the `2bdf996` data until its next merge from main.

### What the 360 found
- **1** (high → accept, contest severity): first marker press by touch 0/16 → 16/16 and by mouse 0/16 → 16/16. The shift was up to 56.98 px at 1cc5b90 and is 0 px at the tip.
  - **Severity: medium.** The rubric's high line is a confident lie, a data write, a red build, a crash, an AA failure or the Step 0 contract. A tap that lands one marker over shows a correctly named book that the reader can see is wrong, and the rubric calls a layout defect medium. Pass 2 and I agree, so I haven't put it to you.
- **2** (high → accept): at 1cc5b90 Stop left motion on and nothing stored, 6 of 6 presses. At the tip it turns motion off and stores it, 6 of 6. No crossing followed in 10.8 s.
  - My run at 1cc5b90 left the Rack paused under "Start rotation". Pass 1 saw "Stop rotation" return and a crossing. Either way motion was never turned off.
- **3** (medium → accept): neighbours displaced 10 of 37 frames, by up to 338 px, at 1cc5b90; 0 frames at the tip. Centre-cover first touch went 18/24 → 24/24 per app.
- **4** (medium → accept): focus ring painted on all four edges for 0/60 controls at 1cc5b90 and 60/60 at the tip.
- **5** (medium → accept): the shelf switch flashed to 4,729 px for 227 ms (Vite) and 233 ms (Next); 0 frames at the tip.
- **10** (low → accept): eight markers at 43.125 × 44 px cover 0…345 under a real 15 px gutter, both ends hittable.
- **6–9 and 11** (low → accept): checked against the code and the new tests. None of the four outputs contains `openingMs` or the watch-harness labels.
- **Sealed appendix:**
  - (1) and (2) hold. Each removed `expect` is replaced by an equal or stronger assertion, and none touches data honesty.
  - (3), (4) and (5) hold. Moments in the single file shows its empty local gallery, the same as at 1cc5b90. The disk fieldset computes to `display: contents`, and the band matches pixel for pixel.
  - (6) holds in kind, on my own matrices: 18/24 → 24/24 cover presses and 227/233 ms flashes rather than Pass 2's 18/26 and 237/251 ms.

### Verification as re-run
- **Tip gates:** typecheck clean; 1,648 tests in 123 files; three Vite builds; offline scan with 22 markers. In `web/`: typecheck, 174 tests in 28 files, Next build, `check:client` and `check:css`. All exit 0.
- **Per fix SHA:** `e8fcc26` 1,644, `0e590be` 1,647, `fcb729d` 1,647, with web at 174 throughout.
- **Runner:** report and `--enforce` both exit 0. Each measured 3,387 contrast samples, none below the floor or unread, lowest 5.73:1 for POSTPONED in `harness-light-360`.
- **Browser matrix:** 96 of 96 cells pass with `scrollWidth === innerWidth`. Poster states 80 of 80 are overflow-free. Motion-off face strips are identical to 1cc5b90 in 12 of 12 pairs.
- **Not verified:**
  - VoiceOver on macOS and iOS
  - a real phone
  - Safari, WebKit and Firefox
  - the Vercel preview itself and the local production smoke proof
  - Pass 2's 90/90 cover-press variants and 42 Table-state cells as separate figures
  - findings 6–9 in a browser
  - face strips against the base

### Risks and accepted costs
- **Leave, in Chromium:** a mouse click on a marker focuses it, so the Rack stays paused until the reader clicks elsewhere (12 s held, then it resumed). Safari doesn't focus buttons on click, so check this in the sitting.
- **Motion-off control row:** with motion off, the hidden hint keeps its box. Stop and the markers sit about 56 px left of where 1cc5b90 centred them, with 111 px of empty row on the right. That keeps Stop under the finger across Stop and Start. In the disk files, where nothing can toggle, the row is always drawn this way.
- **Disk files:** a reader can't start motion in them.
- **No new exposure for the betting track's Step 0.**

### For the PM seat
- Skill note: an `evaluateOnNewDocument` recorder must observe `document`, because `documentElement` is null when the document is created. Mine failed this way on its first run, and the empty log looked like a pass.
- Pair every motion-off face strip with a strip of the control row.

### Questions for you
1. **Leave / Hold / Never?** How does a soft pause end? Leave is built as described and reversible.
2. **Fresh / Resume?** What happens after Stop then Start? Fresh is built: Start shows the resting book and gives a full 9 s hold.
3. **Keep / Centre?** Should the motion-off control row stay where it is, or centre?
4. **Yes / No?** Do you confirm APG, Resume, Still-both and the two-file scope extension as yours? They reached me through the PM seat.
5. **Markers / Buttons?**
6. **220 / 320 / 450 / 600?**
7. **Yes / No?** Does the crossing read as one event?
8. **Wrap / Edit?**
9. **Keep / Trim?**
10. **Approve / Edit?** One answer for each of the six copy items:
    - "The Rack"
    - "Open {slide name}"
    - "Show {slide name}"
    - "‹ Back to the week"
    - "Filters hide every matchday book this week."
    - "No further kickoffs in the snapshot through {window end}."
11. **Merge / Hold?** After the sitting.

### Handoff block
This runs from my clone. Both co-author trailers are included as the skill asks. bf7b82b, PR 5's squash, carried only Codex's.
````bash
cd /Users/benicheni/code/kickoff-pr393-pass25
gh pr ready 393
gh pr merge 393 --squash --match-head-commit 75ee995c0f489c40be67a5a0a238321b839f1e2e --subject "Overhaul PR 6: the Rack turns (#393)" --body "$(cat <<'EOF'
On Poster Fixtures the Rack makes one pass through the week's dated
books and The Register: a 9 s first hold, 7 s holds and 1.8 s
crossings in transform and opacity, ending on the resting book.
Hover, touch and focus pause it in place and it resumes with the hold
it had left; "Stop rotation" stays on the button, and one press turns
motion off for the page. Markers, a swipe and the faces move it; a
centre tap opens the day's volume with every filtered fixture and both
clocks, and the line back closes it. The shelf's spines open and
switch volumes, and The Register opens the Table. Both disk files ship
still and cannot start motion.

Take main through 2bdf996, its review records and snapshot.

Codex built the change and its fixes and ran Pass 2. Claude Code ran
Pass 1 on Fable 5.2 and Pass 2.5 on Opus 5.5. At 75ee995 every root
and web gate passed, 1,648 tests in 123 files and 174 in 28, with
hosted verify green. The enforced browser run measured 3,387 contrast
samples in 388 cells, none below the floor or unread.

Co-authored-by: Codex <noreply@openai.com>
Co-authored-by: Claude <noreply@anthropic.com>
EOF
)"
git fetch origin overhaul/second-edition
SQUASH=$(git rev-parse origin/overhaul/second-edition)
git rev-parse "$SQUASH^1"        # expect 1f947af5728fdaaad619322c9d6f6e8e32b63549
git rev-parse "$SQUASH^{tree}"   # expect 4b09558fd46ab79ed9f96040f1fcc5d8961dd289
git merge-tree --write-tree "$SQUASH^1" 75ee995c0f489c40be67a5a0a238321b839f1e2e   # must equal the line above if the base moved
git checkout overhaul/second-edition && git pull --ff-only
npm ci && npm run typecheck && npm test && npm run build && npm run build:single && npm run build:offline && node node_modules/tsx/dist/cli.mjs scripts/scan-offline-bundle.ts
cd web && npm ci && npm run typecheck && npm test && npm run build && npm run check:client && npm run check:css
````

### Left running
- **Folders:**
  - `kickoff-pr393-pass25`: the tip
  - `kickoff-pr393-pass25-h1`: 1cc5b90
  - `kickoff-pr393-pass25-mid`: a fourth worktree I added for the per-commit gates, now back at the tip
  - `kickoff-pr393-pass25-base`: 1f947af, never installed or used
  - Receipts in `kickoff-receipts/pr393/pass25/`
- **Servers:** the tip on 7594 (Vite preview), 7595 (Next) and 7596 (dev harness), and 1cc5b90 on 7694–7696.
- **Until when:** your phone and VoiceOver sitting, or 9:00 PM EST tonight, whichever comes first.
- Codex's folders and its servers on 7576–7578 and 7676–7678 are untouched.
- To stop mine:
```bash
for p in 7594 7595 7596 7694 7695 7696; do lsof -tiTCP:$p -sTCP:LISTEN | xargs kill; done
```
`````

## Pass 3: Beni's rulings and the merge (Fri 27 Nov 2026, 9:57 to 10:39 AM EST)

**The desk questions.** At 9:57 AM EST, Beni answered the four questions from the brief that need
no device, all as the PM seat recommended:

| # | Question | Beni |
|---|---|---|
| 1 | Leave / Hold / Never | **Leave** |
| 2 | Fresh / Resume | **Fresh** |
| 3 | Keep / Centre | **Keep** |
| 4 | Confirm APG, Resume, "Still, both" and the two-file scope extension as his own | **Yes** |

Each matches the build, so Leave and Fresh stop being provisional. The PM seat posted these as
[Pass 3, part 1](https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7221455119), on
Beni's "Yes, post".

**The sitting.** Beni sat on the phone and with VoiceOver against the restarted servers and both
disk files. At about 10:36 AM EST he answered "220, Yes, Wrap, Markers, Keep, all Approve,
Merge":

| Question | Beni |
|---|---|
| 220 / 320 / 450 / 600 | **220** |
| Yes / No (one event) | **Yes** |
| Wrap / Edit | **Wrap** |
| Markers / Buttons | **Markers** |
| Keep / Trim | **Keep** |
| Approve / Edit for each of the six copy items | **Approve**, all six |
| Merge / Hold | **Merge** |

He reported no concern with how the disabled band and Rack controls announce in the disk files.
Every answer matches the build at `75ee995`, so no code change followed. The PM seat posted these
as [Pass 3, part 2](https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7222272353).

**The merge.** On Beni's "Yes, merge it", the PM seat ran the handoff block's steps from its own
clone, `kickoff-pr393-pm`. It did not use the Pass 2.5 seat's clone, which belongs to another
session. At 10:38 AM EST, with the head still `75ee995` and CLEAN and all five hosted checks
green:
- `gh pr ready 393`;
- `gh pr merge 393 --squash --match-head-commit 75ee995c0f489c40be67a5a0a238321b839f1e2e`, with
  the brief's subject and body and both co-author trailers.

#393 squash-merged into `overhaul/second-edition` as `0b924ff`:
- `git rev-parse 0b924ff^1` prints `1f947af`;
- `git rev-parse 0b924ff^{tree}` and `git rev-parse 75ee995^{tree}` both print `4b09558f`, the
  tree the brief expected, so the integration branch holds the reviewed bytes;
- no tag, version or CHANGELOG entry was made;
- `main` and Pages are unchanged.

In a clean worktree at `0b924ff` (`~/code/kickoff-pr393-landing`), after `npm ci`, every gate
exited 0:
- at the root: typecheck; `npm test`, 1,648 tests in 123 files; `build`, `build:single` and
  `build:offline`; the offline scan, 22 markers;
- in `web/`: typecheck; `npm test`, 174 tests in 28 files; `build`, `check:client` and
  `check:css`.

The logs are in `kickoff-receipts/overall-planner/pr393-pass3/landing/`. The PM seat recorded
the landing on the PR at 10:39 AM EST:
https://github.com/BeniCheni/kickoff/pull/393#issuecomment-7222328634.

**Lessons for the skill**, from the three retros. These are to be filed in the ideas file's
`## Process notes` once #396, which edits that file, has landed:
- **Real input for a new control's first press.** Make it the matrix's own cell, with the
  control's box read before and after. Scripted `el.click()` and `fireEvent.click` skip the
  hover, touch and focus that ran first, and findings 1 to 3 lived in that gap (Pass 1, Pass 2
  and Pass 2.5).
- **Compare pixels against the merge commit when the branch merged a newer snapshot.** Pass 1
  lost a cell to Wednesday's cover changing words.
- **The classic-scrollbar cell needs `--hide-scrollbars` removed.** The runner does this; the
  skill's matrix note does not say so.
- **The severity scale has no line for a control that does something other than its name.**
  Pass 1 rated finding 1 high on that ground. Pass 2 and Pass 2.5 read medium, as a layout
  defect.
- **Observe `document`, not `document.documentElement`, from `evaluateOnNewDocument`.** The
  element is null when the document is created, and an empty log looks like a pass. Fail a probe
  on its own console error (Pass 2.5).
- **Pair every motion-off face strip with a strip of the control row** (Pass 2.5).

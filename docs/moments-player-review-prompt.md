# PR #128 — Pass 0: the cold-review brief for Moments slice 3 (archived by the PM seat, Tue 29 Sep 2026, TZ=America/New_York)

Pass 0 of the six-pass 360 for "Moments slice 3: the player, inert until curated" (PR #128, built
by Cursor, Grok 4.7 at Extra High). The PM seat re-read the PR fresh at 11:04 EDT:
- open, not draft, MERGEABLE/CLEAN, `verify` green at the head (run `36575582340`);
- head `159444428dec250264da9120914cc88d8657db8b`, three commits: `a5896d3` (Claude, the archived
  build prompt), `f979195` (Cursor, the player), `1594444` (Cursor, receipts);
- 40 files, +3078/−40, on merge base `8cb9d87c531ffce3c609f98e0da557c26027d432`, with `main` two
  sync commits ahead (`97476bc`, `src/data` only);
- the builder's worktree `~/kickoff-cursor-build-slice3` holds one **uncommitted** change on top
  of that head: the row 61 sentence, in three files (`MomentsSessionProvider.tsx`,
  `tests/dom/momentsPlayerHost.test.tsx`, `docs/moments-architecture.md`).

**The gate, and Beni's answer.** The handoff required a one-word ruling on that uncommitted
change before this brief could name a tip. Beni answered on 29 Sep 2026: land it first. Cursor
commits and pushes the three files to #128, and Pass 1 reviews the head that results. This
brief therefore names no tip SHA. It tells Pass 1 how to recognise the right one, and to stop
if the commit is not there. The row 61 ruling is first-hand: Beni confirmed to the PM seat, in
chat, that he ruled yes on 29 Sep 2026. No pushed document records it until the commit lands.

**Update, later on 29 Sep 2026.** Cursor landed the row 61 commit as
`d93c551f4d50f3ed0a4f22781fb00d18dedc58f0`. The PM seat verified it against the remote: one
commit over `1594444`, exactly the three files, `verify` run `36589526281` green at that SHA,
the PR mergeable and clean. One oddity: the commit is authored and committed as Benjamin Chen,
where Cursor's two earlier commits carry `Cursor <cursoragent@cursor.com>` as author and
committer. Beni asked for it to be aligned with `git rebase -i`. Claude Code cannot drive an
interactive editor, so this version of the prompt scripts the rebase todo list with
`GIT_SEQUENCE_EDITOR`, makes the rewrite the Pass 1 seat's first act (step T0), and publishes it
with one `--force-with-lease` push pinned to the old SHA. The PM seat ran the same commands on a
scratch copy: same parent, same tree (`9668d7f8…`), same message, Cursor as author and
committer. The rewritten SHA depends on the clock, so the prompt still names no final tip.

The prompt below was delivered in chat for a fresh Claude Code session; this file is the
archive.

## Plan status at Pass 0

| Slice | State |
|---|---|
| 1: contracts, queue, saved | Merged `ad9586b`, no release |
| 2: gallery, inert until curated | Merged `1045db0` (#118), no release |
| 3: player host, YouTube adapter, Cinema | Builder-complete at `1594444`, PR #128. Row 61 landed as `d93c551` under Beni's identity; Pass 1 aligns it to Cursor's, then reviews. **Awaiting Pass 1** (Claude Code, Fable 5.1 Extra) |
| 4: integration, authorised real-provider test, first-edition proposal | Unscoped. Provider authorisation and publication are Beni's |

The Moments release number is unassigned and the app stays v0.5.2. The 27 and 28 Sep rulings
stand, with the 29 Sep row 61 ruling added.

---

/kickoff-pr-review 128 --no-merge

PR #128 — Pass 1 (cold review): Moments slice 3, the player, inert until curated

You are Pass 1 of the six-pass 360 for PR #128 in github.com/BeniCheni/kickoff, running in Claude Code on Fable 5.1 Extra. Cursor (Grok 4.7, Extra High) built it, and you have built none of it. The method is /kickoff-pr-review, which this line invokes; follow its §1–§4 and stop at one PR comment. Pass 1.5 (the PM seat) writes Cursor's rebuttal brief from your comment. Beni or his delegate adjudicates and clicks every merge.

WHAT BENI RULED, as the PM seat holds it

27 Sep 2026: the live site stays unchanged while src/curated/moments.json is []; the shared header stays 780px on every tab; the stage and the list stack through 887px and sit side by side from 888px.

28 Sep 2026, on the plan: (1) slice 3 lands inert, as a non-release, with no version bump, no CHANGELOG version section and no tag, and with an empty edition the player boundary renders nothing and makes no request; (2) one PR; (3) Cinema pushes no history entry; (4) one Next control, the transport's, fed only by queueNeighbours; (5) embeds use the youtube-nocookie.com host, built as an iframe element handed to YT.Player, with the API script at https://www.youtube.com/iframe_api; (6) playsinline=1; (7) no invented loading timeout, so a hung load stays loading until the user leaves or a provider event arrives; (8) the phone box grows, it does not clip: height = max(width × 9/16, 200px), 320 × 200 at 360, and the list is pushed down, never covered.

29 Sep 2026, ideas row 61 (docs/v0.2.6-ideas.md): after readSavedReferences returns read-refused or invalid-data, the first successful Cinema write says it replaces the unreadable stored set. Beni confirmed this to the PM seat first-hand and chose to land it before this review.

29 Sep 2026, commit identity: the row 61 commit landed authored and committed as Benjamin Chen, where Cursor's two earlier commits use Cursor. Beni asked for it to be aligned with `git rebase -i`. You do that first, in step T0 below. Publishing it takes one force-push, which is part of his request and is pinned to the old SHA.

Judge the builder's code against these; do not re-open them. If you think a ruling produced a defect, say so as a question for Beni, not as a finding against Cursor.

GROUND TRUTH — read it fresh, and settle the tip first

- Your tip is the head of origin/cursor/moments-player once step T0 is done. Its SHA depends on the clock, so this brief cannot name it. Before T0 the head should be d93c551f4d50f3ed0a4f22781fb00d18dedc58f0, the row 61 commit Cursor landed on top of 159444428dec250264da9120914cc88d8657db8b. The PM seat verified that against the remote later on 29 Sep: one commit, three files, `verify` run 36589526281 green at that SHA, the PR mergeable and clean.
- Run `git fetch origin`, `git rev-parse origin/cursor/moments-player`, and `git log --oneline 159444428dec250264da9120914cc88d8657db8b..origin/cursor/moments-player`.
- If that range is empty, the row 61 commit has not landed. Stop, tell Beni in one line, and do not review; a review of a head Beni ruled stale is wasted.
- If the range is one commit touching exactly src/components/MomentsSessionProvider.tsx, tests/dom/momentsPlayerHost.test.tsx and docs/moments-architecture.md, that is the row 61 commit. Go to step T0.
- If the range holds any other commit or file, name each in your comment, review the head anyway, skip T0 (the rewrite is authorised only for a head that is exactly d93c551f4d50f3ed0a4f22781fb00d18dedc58f0), and treat the surprise as a finding candidate.
- Every number you report says which SHA it came from. The builder's numbers are claims about 1594444 or d93c551; none is a claim about your tip until you have run it.
- Work in a fresh worktree of cursor/moments-player at the head you found, on a different local branch name such as claude/pr128-review; Cursor's own checkout holds cursor/moments-player, so git would refuse that name anyway. Start or restart the session after the checkout so the skill is watched; the skill explains why.
- T0 — align the row 61 commit's identity with Cursor's, before anything else. Beni asked for this on 29 Sep 2026. It is the one rewrite of the builder's history you are allowed, and nothing else may be rewritten.
- T0 precondition. The remote head is d93c551f4d50f3ed0a4f22781fb00d18dedc58f0 and `git show -s --format='%an <%ae> | %cn <%ce>' d93c551f4d50f3ed0a4f22781fb00d18dedc58f0` prints `Benjamin Chen <benjaminlchen@gmail.com> | Benjamin Chen <benjaminlchen@gmail.com>`. If the row 61 commit already has Cursor as author and committer, skip T0 and take that head as your tip. If the head is any other SHA with the wrong identity, stop and tell Beni in one line.
- T0 start. In the review worktree, run `GIT_SEQUENCE_EDITOR="sed -i '' '1s/^pick /edit /'" GIT_EDITOR=true git rebase -i 159444428dec250264da9120914cc88d8657db8b`. That is `git rebase -i` with its todo list scripted, because Claude Code cannot drive an interactive editor. The upstream is the commit's parent, never origin/main; nothing moves onto main. It stops at the row 61 commit.
- T0 amend. Run `GIT_COMMITTER_NAME=Cursor GIT_COMMITTER_EMAIL=cursoragent@cursor.com git commit --amend --no-edit --author='Cursor <cursoragent@cursor.com>'`, then `GIT_EDITOR=true git rebase --continue`. If the harness refuses the scripted rebase or it fails, run `git rebase --abort` and run only the amend command on the branch tip; for a tip commit the result is identical. Say in your comment which path you used.
- T0 verify, before pushing. `git rev-parse HEAD^` prints 159444428dec250264da9120914cc88d8657db8b; `git rev-parse 'HEAD^{tree}'` prints 9668d7f8d3bebaff9acb6ac449a647c959fb9ded; `git show -s --format='%an <%ae> | %cn <%ce>' HEAD` prints Cursor <cursoragent@cursor.com> twice; `git diff d93c551f4d50f3ed0a4f22781fb00d18dedc58f0 HEAD` prints nothing; and the message is byte-identical to the old one, Co-authored-by trailer included. Any mismatch: stop and do not push.
- T0 publish. One pinned push: `git push --force-with-lease=cursor/moments-player:d93c551f4d50f3ed0a4f22781fb00d18dedc58f0 origin HEAD:cursor/moments-player`. If the lease is refused, someone moved the branch: stop and tell Beni. Never fall back to a plain `--force`. `git push` and `gh` may need the sandbox off; say so if you bypass it.
- T0 confirm. `gh pr view 128 --json headRefOid` must equal `git rev-parse HEAD`. Start the static work while `gh pr checks 128` runs the new head's `verify`, and record its run id and conclusion. The tree is unchanged, so run 36589526281 is evidence for the same tree, not for the new SHA. The new HEAD is your tip.
- T0 consequences, to report and not to fix. The PR body's Head line still names d93c551; do not edit the body. Cursor's checkout at ~/kickoff-cursor-build-slice3 holds d93c551, which is no longer an ancestor of the branch, so Pass 2 must start there with `git fetch origin && git reset --hard origin/cursor/moments-player`, after confirming that checkout has no uncommitted work. Put both in your comment for Pass 1.5.
- Never use /Users/benicheni/Documents/Claude/Projects/Kickoff itself; it is Beni's checkout. Leave the local branch wip/main-checkout-2026-09-27 alone: never check it out, commit to it or push it. Never run `npm run sync`, and never hand-edit src/data/*.json or src/curated/moments.json.
- Do not rebase the PR onto newer main (T0 rewrites one commit on its own parent and moves nothing onto main). Main has moved only by sync commits, which change src/data and with it the inert receipt's body text. The receipt's base is the merge base 8cb9d87c531ffce3c609f98e0da557c26027d432; build that and the tip from one data snapshot.
- The spec lineage, in precedence order (template > design brief > implementation prompt): the sealed R3 package; the 25 Sep implementation handoff as amended by Claude's R3 cold review §12 and the rulings above; then docs/moments-player-plan.md as amended by docs/moments-player-plan-review.md, and docs/moments-player-implementation-prompt.md (on the PR branch since a5896d3).
- Also read: docs/moments-architecture.md in full, with Decision 1, Decision 2, the Pass 2 clarification and the new "Slice 3 implementation decisions"; docs/moments-gallery-pass-2.5-executive-brief.md; docs/v0.2.6-ideas.md rows 56–61 and its Process notes tail; docs/verification/moments-gallery/README.md and pass2.md; docs/verification/moments-player/README.md.
- The three design inputs are not on main. Extract them read-only into a scratch directory outside your worktree: `git archive wip/main-checkout-2026-09-27 docs/design/moments-r3 docs/design/moments-r3-cold-review.md docs/moments-implementation-handoff-2026-09-25.md | tar -x -C "$SCRATCH"`. Then check the seal in $SCRATCH/docs/design/moments-r3: `shasum -a 256 -c REVISION.sha256` reports 56 OK; index.html hashes to c5eb8a4bb5bcffcf8fe3f29ad06831e76f1a92413a31ac2e0dfce666ec80117c; REVISION.sha256 hashes to f6e2cf704f35c8cf4bfe700276a97312f4f60eefe58f50ceb44f7e1853e9a349. Never run the package's scripts in place, and never commit the inputs.
- Provider hosts. You may read the official YouTube IFrame Player API reference as documentation. Nothing you run, the app, the harness, a probe or the pane, may request youtube.com, youtube-nocookie.com, ytimg.com or googlevideo.com; abort those hosts in every browser context you drive and count zero as a result.
- Two dev-server hazards from the ideas file bind you: the server from .claude/launch.json listens on localhost (::1) only, so use http://localhost:<port> and confirm which process owns the port with `lsof -iTCP:<port> -sTCP:LISTEN`; and never edit src/ while a headless run is in flight, because Vite's reload aborts it.

WHERE THE PM SEAT WANTS YOUR ATTENTION — questions, not findings

1. Row 61, the landing. Read the commit itself, at your tip. It appends "This write replaces the unreadable stored set." to the save notice only when the target is cinema, the write persisted locally, and the prior read reason was read-refused or invalid-data. Does the ruling hold at every edge? Probe read-refused then a successful Cinema save; invalid-data then success; a refused write followed later by a success (does prior.saved.reason still name the read failure when that success lands, and should the sentence show?); the sentence shown once and not again; an unsave; the same first write made from the stage or a gallery card (Beni's ruling names Cinema, so say what those surfaces show and whether that is coherent); doubled punctuation (D-18); the live region. Then say whether ideas row 61 is closed, partly closed or still open, and what remains.

2. Fixtures and Table are the betting pipeline's Step 0 source. The diff wraps the non-Moments ViewBoundary in a new `div data-moments-background="route"`, and adds attributes to the header and to TabNav, which Fixtures and Table share. The inert receipt compares body text, so it cannot see markup. Diff the whole-shell markup against main for Fixtures and Table across 3 lenses × 2 themes, and for their error paths, with the slice-2 harness (docs/verification/moments-gallery/pass2-reproduce.mjs and pass2-probes.tsx): name every difference. Then measure layout, not markup: does the wrapper change spacing, the ticker, the staleness banner, or the sticky Table header and zone dividers (TablePage.tsx has sticky rows whose containing block may have moved)? Check 390 and 1000, and ?only= and &date= untouched.

3. Cinema's per-subtree inert. The contract is that background subtrees go inert individually and never the shell, #root, body or any ancestor of the dialog. The implementation collects data-moments-background nodes once, when the surface becomes cinema, and removes the attribute on cleanup. Enumerate every focusable and every screen-reader-reachable element outside the dialog while Cinema is open at 390 and 1000 in all three lenses (lens switcher, theme control, version and sync stamp, the staleness banner, any fallback) and prove each is inert or absent. Then drive every way out: Exit, Escape, the in-Cinema Gallery button, browser Back (Cinema pushes no history entry, so Back leaves the page state, not Cinema), a popstate that changes tab or lens while Cinema is open, a player-boundary failure, a route throw, and owner failure. After each, is inert gone from every node, including a node that was replaced while it was inert, and where does focus land?

4. Where the picture lives. One dialog and one iframe stay for the visit, never reparented; the stage box is position: absolute in document coordinates; parked is a fixed 0×0 inert box. Trace the states where a stale box could show or cover something: leave the Moments tab while a video plays, return, switch lens, toggle spoiler-light (titles change length, so the anchor can move), resize across 887/888, a late web font, the mobile address bar, Cinema entered from a scrolled page and left again. In each, is the frame where the anchor is, paused when it should be, invisible and unreachable when parked, and never over Fixtures, Table or the queue? Measure with rects, not screenshots, and say what the builder's cells did and did not include.

5. Focus order and keys. Resolution 1 answers WCAG 2.4.3 with a chain: an in-anchor "Player" sentinel, "Back to selection", the frame, "Continue past the player". The helper code in seedPlayerHost reaches its targets with global `document.querySelector` calls (`.moments-stage-main [data-primary-action]`, `.moments-stage-top button`). Walk the chain forward and backward with the real keyboard in Chrome at 390 and 1440 in all six lens/theme cells. What happens when the stage has no primary action with a videoId, when Cinema is open (the selectors still match the hidden stage), when a source link is the primary action, or when two matches exist? Say what a keyboard user can and cannot do, and what Escape does when focus is inside a cross-origin frame (the parent never sees that keydown; is Exit Cinema reachable and is the limit written down?). Screen-reader speech is not verifiable here; say so.

6. The real adapter against the provider reference. The builder's whole browser run drove the mock, so createYouTubePlayer has never run in a real DOM. Read src/lib/momentsPlayer.ts line by line against the plan and the reference, then run it once yourself with no network: inject a stub window.YT before load (a constructor that receives the iframe, getIframe() returning it, the documented methods and callbacks) and abort the provider hosts. Prove one script element only after the first Play and none before; one iframe; getIframe().parentNode === host; slot.replaceWith(iframe) leaves the host's children sensible; StrictMode's double mount yields one instance; destroy only on unmount. Then decide these, each as verified, finding, or not verifiable before slice 4:
   (a) Reload-and-seek. The seek after a different-ID loadVideoById is applied by settleSeek, which runs from onReady or from state 5 (cued). As the PM seat reads the reference (check it), on a player that already exists onReady does not fire again, and loadVideoById plays (states -1, 3, 1) rather than cues. Which real event applies the pending seek on a reused player? Does the mock emit a state 5 the provider does not? The build prompt (the PM seat's own text) said "on ready or cued"; if the defect is the spec's, say so and route it to Beni.
   (b) The iframe is created with allowfullscreen and no `allow` attribute. Does playVideo() after onReady, or the provider's fullscreen control, need autoplay or fullscreen delegation? Say whether the reference or the plan decides it.
   (c) origin: window.location.origin is the string "null" when the single-file build is opened from a file: URL. What does dist-single do there, and is that written down?
   (d) A failed API script load is mapped to a failure of kind unknown, which the reducer turns into the timeout status ("Playback not confirmed"). Ruling 7 forbids an invented timeout. Is an onerror event an invented timeout, or a real signal? If it is ambiguous, ask Beni.
   (e) The error-code map, the finite-time rule (zero kept, negative and NaN dropped), one failure per attempt, and the stale-callback checks: read the tests and red-then-green at least two of them by mutating the adapter, then restore it.

7. Recovery and Cinema copy. nextSelectionSentence in src/lib/momentsRecovery.ts returns `Next opens “Title”` with no terminal mark, and blockedRecovery and unavailableRecovery follow it directly with " The official source is also available." Read the rendered strings at 390 as a user and as text: is there a missing sentence boundary? D-18 forbids doubled punctuation; does its remedy leave none? Compare every new user-visible string (Cinema bar, recovery headings and bodies, the autoplay-blocked and resuming lines, the player fallback) with the sealed R3 package and the handoff, and list the strings the builder invented.

8. The proofs the receipts rest on. The inert receipt proves body text and zero provider requests for an empty edition; it says nothing about markup (question 2). The 1260-cell matrix proves geometry against a mock whose iframe is about:blank. Re-run check-browser.mjs (base 8cb9d87, then the tip, one snapshot) and docs/verification/moments-player/check-player.mjs against the tip yourself. Then prove the matrix can fail: mutate three claims it makes (remove `min-height: 200px` from .moments-stage-anchor; remove the `inert` attribute step; move the host over the queue) and show each cell class goes red, then restore. A green receipt whose checker cannot go red is a claim.

9. Geometry and accessibility, measured and not read:
   - Phone grow at 360/375/390: anchor and host full width, at least 200px tall, list below; and no horizontal overflow (`scrollWidth === innerWidth`).
   - D-04 is a vertical claim in slice 2 (the lead action's bottom sat 64.89px above 844 at 360 Broadcast). The builder reports 35, which is `innerWidth - leadTitle.right`, a horizontal margin. They are different quantities. Re-measure the vertical margin at 360, 375 and 390 in both themes and compare it with slice 2's 779.11.
   - D-16 at 761, 768, 800, 855, 887 and 888; H-B at 1160–1250; D-17 rects after save and unsave on success and refusal in Cinema and on the stage; D-19 names and live regions (one role=status in the dialog while Cinema is open; a stable Save name); D-20 font floors on every new surface; D-15 at 390 in six lens/theme cells with mouse and keyboard.
   - Contrast for every new colour pair in both themes (Cinema surface, recovery text, small print). A failing token is flagged for the design system, not repainted here.

10. Data honesty and tests. Only tests/dom/momentsGallery.test.tsx among the pre-existing test files changed, by one added line. Confirm no removed or weakened assertion in the whole test diff (`git diff origin/main...HEAD -- tests | grep '^-'`), that the D-01 completion step now runs on the mock's ended event, and that a test named for a claim can fail that claim. The Moments tab still renders main's banner and "No moments curated yet." exactly, and the header still reads V0.5.2.

11. Seams, bundle and dependencies. App gains momentsPlayer and momentsPlayerFault props; the fault prop makes the host throw, and both ship in the bundle. Confirm main.tsx passes neither, that the harness, the mock and the three archival video ids are absent from dist and dist-single (run the builder's `rg` yourself, and search for `player fault` and the mock's markers), that package.json and the lockfile are untouched, that nothing under src/ imports tests/, and that index.html carries no provider hint. The strings youtube.com/iframe_api and youtube-nocookie.com will appear; that is the real adapter, not a request.

12. Changelog and ideas. The PR touches no CHANGELOG. The #118 cycle settled that a latent behavioural change in a non-release PR is recorded under [Unreleased] without a visible claim (skill §5). Decide whether a line is owed here, and if so add it in a fix commit. Everything real and out of scope goes into docs/v0.2.6-ideas.md as new rows after row 61, with a dated Process-notes entry; do not renumber existing rows.

BOUNDARIES

- Fix commits are allowed only for findings you reproduced, authored as Claude (`git -c user.name=Claude -c user.email=noreply@anthropic.com commit`), with typecheck and test green at each. List every one in your comment, because the branch then moves under Pass 2. Apart from T0's single pinned push, push only fast-forwards with `git push origin HEAD:cursor/moments-player`, after re-checking the remote tip, and never force.
- A finding about the spec (mine included) is routed as a question for Beni, not fixed by editing the spec silently.
- No merge, version bump, CHANGELOG version section, tag or rebase, except the T0 rewrite. Leave PR #114 and every other branch alone.
- Your first added commit, after T0, is this brief's archive, docs/moments-player-review-prompt.md, with its docs/README.md index row. It is the tip of the local branch claude/moments-player-review-brief; cherry-pick it. If you cannot reach it, say so and skip it.
- Run the full matrix the skill's §4 requires, at 360, 375, 390 and about 1000, every lens × theme × tab, viewport set before every capture. 390 is the judge, 360 the jury.
- Name what you did not verify: physical devices, Safari and Firefox, screen-reader speech, the real provider's behaviour, rights and playback, iframe continuity across park and return, browser zoom beyond the widths you ran. Name anything else you skipped too.
- The comment follows pr-comment.md's table shape and ends with a verdict on mergeability at the tip, a list of the questions only Beni can answer (one word each), the exact tip SHA and its verify run, and the T0 record: old SHA, new SHA, the path you used, and the verification output.

SEALED APPENDIX — the builder's claims. Verify each independently; none of them is a conclusion.

- typecheck clean; npm test 50 files / 660 tests at 1594444; the builder reports 50 files / 662 tests, typecheck clean and both builds green at d93c551, whose tree your tip shares; CI verify green at d93c551 (run 36589526281; the PM seat confirmed its conclusion and head SHA, the counts are the builder's). The PR body's acceptance table still says 660 tests in one place, and its test plan says 662.
- Inert receipt against merge base 8cb9d87: 72/72 identical body-text hashes, 72/72 identical first-capture PNGs (advisory), 144/144 loads with scrollWidth === innerWidth, zero iframe/video/audio, zero page errors, zero provider requests, 634 Google Fonts requests. Chrome 154.0.8037.58, Playwright 1.62.1, clock fixed.
- Player matrix against the dev-server mock: 1260 cells (15 widths × 6 lens/theme × stage and Cinema × 7 playback states) and 290 journey checks (scroll 12, gallery lead 2, lens switch 30, gallery return 30, tab away 30, playing at position 0 then Cinema and back 6, keyboard 12, D-15 12, D-17 120, H-B 36). Zero provider requests, zero page errors, 6,450 Google Fonts requests.
- After scrollTo(0, 280), every 360 and 390 stage-playing cell shows a host-versus-anchor delta of 0, 0, 0, 0.
- Phone grow: 360 ledger light playing measures 320 × 200; the list is below the box. D-16: 761–887 stacked; 888 and above at least 480 × 270. D-04: the lead's horizontal margin is 35 at 360 Broadcast (a different quantity from slice 2's vertical 64.89px).
- The mock's iframe is about:blank and paints nothing, so the typographic cover shows inside the measured box. The DOM test sees one about:blank frame after Play and none before.
- Escape is a capture-phase document keydown; Cinema also sets closedby="closerequest", handles cancel with preventDefault, and re-calls show() if a user agent closes the dialog while a frame exists.
- The stage dialog is role="region" named Player with no aria-modal; Cinema removes the override, sets aria-modal="true" and names it Cinema; parked is inert and aria-hidden.
- A player render failure shows "The player could not be shown." and leaves the shell, tabs, Fixtures and Table intact; a route throw pauses through leave; the owner's fallback copy is unchanged.
- Harness, mock, "Fictional selection" and the three archival video ids are absent from dist and dist-single; youtube.com/iframe_api and youtube-nocookie.com each appear once in each.
- Not verified, by the builder's own list: physical devices, Safari and Firefox, screen-reader speech, any real provider behaviour, whether the provider letterboxes a 16:10 box, iframe continuity across park and return, browser zoom beyond the listed widths, Android and iOS back, CloseWatcher.

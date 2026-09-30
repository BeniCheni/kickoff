# PR #128 — Pass 1.5: the rebuttal brief for Codex (archived by the PM seat, Tue 29 Sep 2026, TZ=America/New_York)

This is Pass 1.5 of the six-pass 360 for "Moments slice 3: the player, inert until curated"
(PR #128). It was written by the PM seat, a Claude Code session on Sonnet 5.5 with the pipeline
skill loaded, from a fresh read that began at 21:14 EDT:
- the tip `76a0421a2240f159b689ad6d672c8c61b3d8a549`, with `verify` green (run `36650584669`),
  the PR open, MERGEABLE and CLEAN, one comment;
- the Pass 1 comment (issuecomment-5901683835) and the eight commits it added, in full;
- `git diff origin/main...76a0421`: 44 files, +3774 −46;
- `docs/moments-architecture.md` to its end, ideas rows 56–69 and the Process notes tail, and the
  receipt README's Pass 1 addendum;
- the provider documentation, re-fetched through a summarising tool and marked in the prompt as
  a lead, not evidence;
- Pass 1's receipts folder, `~/kickoff-pr128-review/`: every script syntax-checked with
  `node --check` (14 of 14 pass) and none executed, because the probes write their output back
  into that folder.

**Routing.** Beni routed Pass 2 to Codex on 29 Sep 2026. Every earlier document (the Pass 0 brief,
the Pass 1 comment, the PM seat's notes) assumed Cursor would rebut its own PR. The prompt says
so out loud and draws the three consequences: Codex did not build this code, so it defends
nothing; it works in its own fresh worktree and never in `~/kickoff-cursor-build-slice3`, which
holds `d93c551`, no longer an ancestor; and it is the first seat other than the reviewer to read
Pass 1's eight commits. The target seat is Codex on GPT-6 at Extra High.

**What the fresh read changed against the handoff it started from.**
- Ruling 1 supersedes more passages than the handoff listed: the plan's "Seeking" bullet and its
  §7 unit-test line, the build prompt's verification bullet, one test name and Pass 1's own
  "Open" bullet, on top of the architecture sentence, the plan's Reload-and-seek bullet and the
  build prompt's scope item 1.
- Pass 1 added steps to one of Cursor's tests and removed nothing: `git diff f632e10..76a0421 --
  tests` has no removed line.
- The seven-item `allow` string in ideas row 63 was written from memory. The provider's own Help
  page shows a two-item list for the privacy-enhanced embed; the prompt defaulted to that one, and
  Beni then ruled it.
- The empty Moments tab carries the same three markup differences as Fixtures and Table (6 of 6
  cells, `final/markup-moments.json`), which Pass 1's comment does not say.

**Update, later on 29 Sep 2026.** The first version of the prompt ended with two one-word
questions for Beni. He answered both the same evening: the `allow` list is the two-item one, and
the frame gets a `referrerpolicy` before slice 4. The prompt was revised before Codex saw it, and
this file holds the revised text: ruling 4 is settled, and ruling 5 replaces the paragraph that
forbade the attribute. The PM seat re-checked the referrer question through a summarising
fetch: the API Services terms page recommends `strict-origin-when-cross-origin`, the Help page's
sample iframes carry no `referrerpolicy`, and the app sets no page-level referrer policy
(`index.html`, `vite.config.ts` and the workflows hold none). Those are leads for Codex to
re-read, not evidence.

The prompt below was delivered in chat; this file is the archive.

---

PR #128 — Pass 2 (rebuttal): Moments slice 3, the player, inert until curated

You are Pass 2 of the six-pass 360 for PR #128 in github.com/BeniCheni/kickoff, running in Codex on GPT-6 · Extra High. You did not build this code. Cursor (Grok 4.7, Extra High) built it, and Claude Code (Fable 5.1 Extra) cold-reviewed it in Pass 1 and added eight commits to the branch. Your job is to answer every Pass 1 position with accept, contest, or accept-but-contest-the-characterisation, to reproduce or disprove each one in code, to carry out Beni's five rulings, and to review Pass 1's eight commits as anyone's code. A rebuttal that agrees with everything has not been run, and a contest with no command and no SHA behind it is not a contest. Pass 2.5 (the PM seat) re-runs your evidence at the tip. Beni or his delegate adjudicates and clicks any merge; this PR is a non-release and stays --no-merge until he says otherwise.

ROUTING, SAID PLAINLY

Beni routed Pass 2 to you on 29 Sep 2026. Every earlier document assumed Cursor would rebut its own PR: the Pass 0 brief, the Pass 1 comment and the PM seat's notes all say Pass 1.5 writes Cursor's brief. Three things follow.

(1) You did not build this code, so your rebuttal is not a defence of your own work. Contest a finding only with a command and a SHA, never out of loyalty to the design, and accept without ceremony what you cannot disprove.

(2) You work in your own fresh worktree of origin/cursor/moments-player and never in ~/kickoff-cursor-build-slice3, which still holds d93c551, no longer an ancestor of the branch. If Cursor ever resumes there it must confirm that checkout is clean, then run `git fetch origin && git reset --hard origin/cursor/moments-player`.

(3) You are the first seat other than the reviewer to read the eight commits Pass 1 added, so reviewing them adversarially is part of your job.

THE BRANCH MOVED UNDER YOU — do this first

- The remote tip is 76a0421a2240f159b689ad6d672c8c61b3d8a549: `verify` run 36650584669 green, the PR open, MERGEABLE and CLEAN, one comment (Pass 1's, https://github.com/BeniCheni/kickoff/pull/128#issuecomment-5901683835). Run `git fetch origin` and `git rev-parse origin/cursor/moments-player`. If it is anything else, run `git log --oneline 76a0421..origin/cursor/moments-player`, name each new commit and file, and tell Beni before you do anything else.
- The branch's history, oldest first: a5896d3 (the PM seat's archive of the build prompt, authored Claude, committed by Beni); f979195 and 1594444 (Cursor); f632e10 (Cursor, the row 61 commit, after Beni's identity rewrite: it was d93c551 before, tree 9668d7f8d3bebaff9acb6ac449a647c959fb9ded); then Pass 1's eight, all authored and committed as Claude <noreply@anthropic.com>: c563145 (the archive of the Pass 0 brief), 81e7804, 3350318, 34221e4, cc20686, f19c1ec and 878a958 (the six fixes), and 76a0421 (docs). Read them with `git log --reverse f632e10..76a0421` and `git show`, each in full.
- Work in a fresh worktree: `git worktree add <path> -b codex/pr128-pass-2 origin/cursor/moments-player`. Your pushes must fast-forward origin/cursor/moments-player with `git push origin HEAD:cursor/moments-player`, after re-checking the remote tip. Never force-push.
- Your first commit is the archive of this brief, docs/moments-player-pass-2-brief.md, with its docs/README.md index row. It is the tip of the local branch claude/moments-player-pass-2-brief, whose parent is 76a0421, so `git cherry-pick claude/moments-player-pass-2-brief` applies cleanly. If you cannot reach it, say so and skip it.
- Never work in /Users/benicheni/Documents/Claude/Projects/Kickoff itself. Never check out, commit to or push the local branch wip/main-checkout-2026-09-27. If you need the design inputs, extract them read-only with `git archive` into a scratch directory outside your worktree, as in the build.
- Do not merge or rebase main. origin/main is 088e1e8, four commits ahead of the merge base 8cb9d87c531ffce3c609f98e0da557c26027d432, all bot data syncs; src outside src/data, tests, index.html and the package files are unchanged there. Every receipt compares the base 8cb9d87 with your tip on one data snapshot, so a sync commit would change the inert receipt's body text and pass for an application change.
- Pass 1 reports that an untracked .agents/skills/kickoff-pr-review/ appeared in its worktree, a machine-made copy of the skill with vendor names swapped ("Codex" where the tracked skill says "Claude Code", `.Codex/skills/` where it says `.claude/skills/`). Pass 1 did not make it and did not commit it. Do not commit it either: `git add` by path, never -A. Say in your comment whether your own tooling made it. The tracked .agents/skills/ holds kickoff-design-review and kickoff-design-studio only.

BENI'S RULINGS — first-hand to the PM seat, 29 Sep 2026

Pass 1's comment ended with four questions. Beni answered each in one word, and every answer was Yes. The PM seat then asked him two follow-ups, and he answered those first-hand as well; they are folded into rulings 4 and 5.

1. "Reload-and-seek: amend the specification so the seek travels with the load (`startSeconds`)?" Yes.

2. "Row 61: should a first write from the stage or a gallery card say it replaces the unreadable set too?" Yes.

3. "Inert markup: accept one wrapper and two data attributes on Fixtures and Table while the edition is empty?" Yes.

4. "`allow`: give the frame the provider's permission list before slice 4 runs?" Yes. Asked which of the two lists that means, he ruled: the official two-item list, `autoplay; encrypted-media`.

5. "`referrerpolicy`: should the frame get one before slice 4, given that a missing Referer gives error 153, a `file:` page sends none, and the deployed Pages origin is untested?" Yes.

Standing rulings, all Beni's. 27 Sep 2026: the live site stays unchanged while src/curated/moments.json is []; the shared header stays 780px on every tab; the stage and the list stack through 887px and sit side by side from 888px. 28 Sep 2026, on the plan: (1) slice 3 lands inert as a non-release, with no version bump, no CHANGELOG version section and no tag; (2) one PR; (3) Cinema pushes no history entry; (4) one Next control, the transport's, fed only by queueNeighbours; (5) embeds use the youtube-nocookie.com host, an iframe element handed to YT.Player, with the API script at https://www.youtube.com/iframe_api; (6) playsinline=1; (7) no invented loading timeout; (8) the phone box grows, height = max(width × 9/16, 200px). 29 Sep 2026: ideas row 61 (the first successful Cinema write says it replaces the unreadable stored set), which ruling 2 above now widens, and the commit identity rewrite, which is done.

No release number is in play, so this pass prepares no release. If you think a ruling produced a defect, say so as a question for Beni, not as a finding against anyone.

WHAT EACH YES CHANGES — do this work, and check every line against the repo first

This section is a map, not evidence. Where it disagrees with the repo, the repo wins and your comment says so.

Ruling 1 amends the specification. On a player that already exists, the resume position travels with the load: `loadVideoById({ videoId, startSeconds })`, the object syntax. Read the IFrame Player API reference yourself, https://developers.google.com/youtube/iframe_api_reference. The PM seat's fetch of it on 29 Sep went through a summarising tool, so treat what follows as a lead. It says: `loadVideoById` has an object form with videoId, startSeconds and endSeconds; startSeconds starts playback at the keyframe nearest that time; the call "loads and plays" the video; state `5` (cued) is what `cueVideoById` produces, and that call fetches a thumbnail; `onReady` is the point at which a player takes API calls; and the reference gives no seek-complete event.

Ruling 1 supersedes every passage that says the opposite. Find them with `git grep -n startSeconds -- docs src tests`: docs/moments-architecture.md (the adapter paragraph: a different loaded id uses `loadVideoById` without `startSeconds`, then `seekTo(position, true)` on ready or cued); docs/moments-player-plan.md (the Reload-and-seek bullet, the Seeking bullet that says the plan does not use `startSeconds`, and the unit-test line in §7); docs/moments-player-implementation-prompt.md (scope item 1 and the unit-test bullet under Verification); tests/dom/momentsPlayer.test.ts (the test named "loads a different video without startSeconds and labels resume only after a finite sample"); and Pass 1's own "Open" bullet on reload-and-seek in the architecture doc, with ideas row 62, both of which you close. Record the amendment in docs/moments-architecture.md as Beni's ruling of 29 Sep 2026. Leave the plan and the build prompt as archives with at most one dated pointer line each. Note the precedence resolution in the PR: a ruling of Beni's outranks the sealed package, the handoff and the plan.

What Pass 1 measured, which ruling 1 must not lose. Against a stub that follows the reference, a selection paused at 42 s and returned to restarted at 0, the -1 and 3 samples the adapter takes during the load overwrote its cached 42 with 0, and "Resuming from the last known position." never showed. So the new rule must: (a) never lower a cached position with a sample taken before that load's seek could have applied; (b) keep the label tied to a finite, non-negative sample taken after the load, not to the requested target; (c) cover the first-construction path, where `onReady` on a fresh player seeks and returns without calling `playVideo()` (Pass 1's probe recorded only seekTo(42)); (d) retire the state 5 the test fake fires after a load, which the provider sends only for `cueVideoById`. `LatePlayer` in tests/dom/momentsPlayer.test.ts is a reference-faithful start. Nothing here is provider-verified, so slice 4 observes. Ruling 7 (no invented timeout) stands. Ideas row 67 (the resume label can show at zero after nothing played) folds into this rewrite: a position above zero, or a prior playing, is the honest condition.

Ruling 2 widens the 29 Sep row 61 ruling from Cinema to every surface. The first successful write after `read-refused` or `invalid-data` says "This write replaces the unreadable stored set." whether the stage, a gallery card or Cinema made it, once, and the ordinary sentence afterwards. In code it is the `target === 'cinema'` clause in `toggleSave` (src/components/MomentsSessionProvider.tsx, line 130 at the tip). The save targets are `selected` (the stage), `card-<id>` (a gallery card) and `cinema`. The `unread` mark Pass 1 added in 878a958 already clears on the first write that persists from any surface, and neither a refused write nor a write refused for an invalid reference uses it up; both edges are pinned by tests. Amend the Cinema-only sentence in docs/moments-architecture.md (the paragraph beginning "Cinema’s save notice", added in f632e10), close ideas row 61 completely, and widen the tests: the builder's row 61 test and Pass 1's two are Cinema-only.

What the wider sentence can break, which no existing journey exercises. It lengthens the feedback line on a gallery card, a narrow column at 360, and on the stage. D-17 requires the pressed control's and the primary action's rects to stay put (within 1px) at 360, 390, 768, 1000 and 1440 on the gallery lead, the stage and Cinema. D-18 forbids doubled terminal punctuation. D-19 wants one live region per message context. D-04 is measured before any write, so it cannot see this. The harness has a `read-refused` scenario; add the journey there across the six lens/theme cells. Check that the lead card's warning ("Saved references could not be read. Changes are visit-only until a browser write succeeds.") is replaced, not stacked, by the new sentence.

Ruling 3 needs no code. Beni accepts, while the edition is empty, the three markup differences Pass 1 named: `data-moments-background="header"` on the header, `data-moments-background="tabs"` on the primary nav, and one `<div data-moments-background="route">` around the route content of Fixtures and Table. Pass 1 has since measured the empty Moments tab too: 6 cells, exactly the same three (receipts, final/markup-moments.json). That is not in the posted comment. Beni's yes named Fixtures and Table, so say so plainly and record the Moments tab as the same three. Pass 1 measured body text, pixels, URL state and every element box equal to main's. Record "accepted by Beni, 29 Sep 2026" in docs/moments-architecture.md (Pass 1 wrote "whether it is accepted is Beni's") and in the receipt README. The ruling covers exactly those three, so a fourth difference in Fixtures or Table markup is not covered, and if you touch App.tsx or TabNav.tsx you re-run the markup comparison.

Ruling 4 carries a correction of Pass 1's own. Pass 1 asked it on the premise that the provider's embed code carries `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`, and wrote that string into ideas row 63 as if sourced. It was written from memory. The PM seat's fetch on 29 Sep, again through a summarising tool, found: YouTube Help, "Embed videos & playlists" (https://support.google.com/youtube/answer/171780), shows `allow="autoplay; encrypted-media"` plus `allowfullscreen` for the privacy-enhanced youtube-nocookie.com embed; the IFrame Player API reference page carries no `allow` at all; and Pass 1 reports that the player-parameters page (https://developers.google.com/youtube/player_parameters) carries none either, which the PM seat did not re-read. The seven-item list appears only in secondary sources describing the Share > Embed output. Re-read all three pages yourself. So "the provider's permission list" is two lists, and Beni has ruled the first: the official two-item list, `autoplay; encrypted-media`, because it is the one on an official page and the smaller delegation to a third party. Say in your comment that you did not use the seven-item list, and why. The frame must still not exist before an explicit Play (the intent gate), so `allow` is never on anything before Play: set it on the iframe in `construct` (src/lib/momentsPlayer.ts, where `allowfullscreen` is set, line 266 at the tip), with one unit assertion on its exact value, and replace the sentence in docs/moments-architecture.md that says the frame carries `allowfullscreen` and no `allow`. Rewrite ideas row 63 with the verified wording, since it currently overstates. Whether the real API keeps an attribute it did not set is a slice 4 observation.

Ruling 5 gives the frame a referrer policy before slice 4. Beni named no value, so the default is the one an official page names. Read https://developers.google.com/youtube/terms/required-minimum-functionality yourself. The PM seat's fetch, through a summarising tool, found that clients of the embedded player must identify themselves with the HTTP Referer header, that the page recommends the policy value `strict-origin-when-cross-origin`, and that it notes many browsers already default to it. The same fetch found that the Help page (above) says a missing Referer gives an error screen, 153, and that its sample iframes carry no `referrerpolicy` at all. Treat both as leads. Default: `referrerpolicy="strict-origin-when-cross-origin"`.

Set it on the iframe in `construct`, beside `allow`, with one unit assertion on its exact value, and record the value, its source and the alternatives you weighed in docs/moments-architecture.md. Record ruling 5 in ideas row 63's rewrite; add no new row for it. The edges, each of which you check and report. (a) The intent gate is unchanged: nothing before an explicit Play. (b) The app sets no page-level referrer policy today; the PM seat found none in index.html, vite.config.ts or the workflows. So an unset iframe already gets the browser default, and the attribute makes the choice explicit and survives a later page-level policy. Say, from the referrer-policy specification and not from memory, whether the attribute wins over a stricter page-level policy for the frame's requests. (c) A page opened from a `file:` URL sends no Referer whatever the attribute says, so ruling 5 does not make the single-file build's player work; ideas row 68 stays open (decide whether dist-single offers Play at all), and you say so. (d) Whether the deployed Pages origin sends the Referer the provider wants, and whether one press of Play then starts playback, is a slice 4 observation. Nothing in this pass may request the provider. (e) Leave the `rel="noopener noreferrer"` on the source links alone; they are not the embed. (f) Add no other attribute to the frame: not `sandbox`, not `loading`, nothing else. The neutral "Playback has not started…" line is the fallback until slice 4 observes.

WHAT PASS 1 FOUND — answer each

Pass 1's verdict: mergeable after fixes, non-release, --no-merge, nothing merged. It reviewed f632e10 and verified after fixes at 76a0421. Pass 1 reports, at f632e10: typecheck clean, 662 tests in 50 files, both builds green; at the tip: typecheck clean, 688 tests in 51 files, both builds green. The PM seat measured the diff itself: 44 files, +3774 −46 against origin/main, and the tips of src and tests at 76a0421 and 878a958 are identical, with 76a0421 adding only docs. On Pass 1's account it inserted steps into one of Cursor's tests, "H-C/D-15: Escape and cancel leave Cinema, and a lower queue row focuses its primary action", because after fix 2 the clipped first frame is no longer a Tab stop, so the test presses Play first and its two wrap assertions run unchanged. The PM seat confirmed that git shows no removed line anywhere in tests since f632e10.

What reproduced exactly on builds Pass 1 made, at f632e10: 662 tests; the inert comparison against 8cb9d87 with 72 of 72 identical body text and zero provider requests; the player matrix, 1260 cells and 290 journeys, zero provider requests, zero page errors, host against anchor 0, 0, 0, 0 after scroll. Pass 1 found the builder's numbers honest. What the builder's proof could not see: the matrix cannot fail on inert (with that step removed it stayed green through every journey); the mock's frame is about:blank and paints nothing, so a frame over the wrong selection was invisible and every ready cell is a fresh load; the test fake carries every method from construction, so the window before the provider's `onReady` was never exercised; and the builder's whole run drove the mock, so createYouTubePlayer had never run in a real DOM. Pass 1 ran it in Chrome against a stub that follows the reference (methods attached at ready, loadVideoById plays -1, 3, 1, state 5 only from cueVideoById, onReady once per player), with the provider's hosts unresolvable and aborted. That stub is Pass 1's reading of the reference, not the provider. Challenge it.

Two things were found after the comment was posted, so they are not on the PR yet: the empty Moments tab carries the same three markup differences (above), and the row 63 allow-list string is wrong (above). Pass 1 also says findings 1, 2 and 5 would be high once an edition is curated and calls them medium because src/curated/moments.json is [] and none can reach a reader today. You may contest that characterisation in either direction, against the severity table in .claude/skills/kickoff-pr-review/pr-comment.md.

Answer every row below. Where I name an attack surface, the finding stands or falls on your command, not on my map. Scope is the PM seat's: what I say to fix in this PR, fix; what I say to defer, defer only with your reason, and say so in your comment.

- F1 · medium · fixed in 81e7804. Between `new YT.Player()` and `onReady`, every provider command threw; `retire()` threw inside the owner's dispatch, so Next, Previous, a queue row, ← Gallery and a second Play did nothing, and leaving the tab threw inside the owner's effect and the owner boundary replaced the visit. Reproduce: pre-ready.mjs, tab-away.mjs and real-adapter.mjs from the receipts folder (below). Red and green: the four new adapter tests in tests/dom/momentsPlayer.test.ts fail against `git show f632e10:src/lib/momentsPlayer.ts` and pass at 81e7804. Attack: `sent()` swallows every exception a provider command throws, not only "not ready", so a command the provider refuses for another reason is dropped without a failure (the architecture calls that a cost); `command()` arms `pendingSeek` and `pendingTicket` before `sent()` reports, so a dropped `loadVideoById` leaves a seek armed; `pause()` returns early when `pauseVideo` throws, so no paused position is dispatched; the `onReady` reconcile (`loadedId() !== ticket.videoId`) depends on what `getVideoUrl()` returns before ready, which the reference does not say; a replay ticket sent before ready; the stub's fidelity to the reference.

- F2 · medium · fixed in 3350318. The frame of the selection that played sat over the next selection, under its heading, on the stage and in Cinema. Reproduce: cinema-probe.mjs (the hit test at the anchor's centre returned IFRAME at f632e10 and the cover, a SPAN, at the tip). Red and green: the new DOM test in tests/dom/momentsPlayerHost.test.tsx. Attack: the `owner` state (set in `play()`, never cleared) and the `shown` derivation; StrictMode; Retry player; `setPlayerLive(shown)`; the Cinema 0 × 0 clip, where whether a clipped iframe keeps decoding is unverified. Say so; do not try to measure it against the real provider.

- F3 · medium · not fixed by Pass 1: ruling 1 above. F7 · medium · ruling 4 above. F11 · low · ruling 3 above. F5 · medium · fixed in 878a958, widened by ruling 2.

- F4 · medium · fixed in f19c1ec. `nextSelectionSentence` returned `Next opens “Title”` with no mark, so the next sentence had no boundary after any title that does not end in one (every spoiler-light neutral title). Reproduce: Chrome at 390, owner-block recovery, Spoiler-light on, stage and Cinema. Red and green: six new tests in tests/momentsRecovery.test.ts. Attack: the ENDS_ITS_SENTENCE regex in src/lib/momentsRecovery.ts (a title ending in a closing quote, a bracket, an ellipsis); and grep every other user-visible template literal that interpolates a title.

- F6 · medium · fixed in 34221e4. Four ways out of Cinema left focus on `<body>`: a lens change through history then Exit; Back or any popstate that changes the tab; a route failure; a player failure. Reproduce: focus-exits.mjs. Attack: the order inside `survivingControl()` (Enter Cinema, the gallery heading, the current tab, the first tab); the cleanup ordering, since the host's unmount cleanup now removes `[data-moments-background][inert]` from nodes outside its own component before it focuses; the Tab-wrap filter that now excludes inert controls.

- F8 · low · fixed in cc20686. The tab watcher became a layout effect; one painted frame with the player's box over Fixtures or Table is gone. Reproduce: tab-frames.mjs (a requestAnimationFrame sampler). Attack: the commit says "never painted", an absolute, measured in 8 cells (stage and Cinema × click and Back × 390 and 1000); a lens popstate and a route throw were not sampled; a provider command now runs inside a layout effect (`dispatch({ type: 'leave' })` calls `retire()`).

- F9 · low · fixed in 81e7804. A failed API script is removed, so Retry leaves one script, not 1, 2, 3. F14 · low · a stale-state-change test added in 81e7804: before it, removing the retired-attempt check from `accept` left 21 of 21 green.

- F10 · low · not fixed. The player receipt cannot fail on inert. (Ideas row 64 also carries F16: five of the committed Cinema captures show the dialog at scroll 0, where the script had scrolled it before capturing.) FIX IN THIS PR. Add to check-player.mjs, per Cinema cell: every focusable outside the dialog has an inert ancestor; no ancestor of the dialog is inert; the accessibility tree exposes none of the tab, lens or theme controls. Add a journey that plays a selection, presses Next and hit-tests the anchor's centre. Capture before the row hit-tests scroll. Then prove each new assertion goes red by mutation, and restore. Pass 1's three mutations are in the receipts folder (mutations/).

- F12 · low · not fixed, ideas row 65. SPLIT IT. Fix the XS defect in this PR: Shift+Tab from "Back to selection" skips Enter Cinema because `.moments-stage-top button` matches two controls and the first wins; `[data-cinema-enter]`, added in 34221e4, is the natural target. Leave Cinema's reading order to the row, and say why.

- F13 · low · written down in 76a0421. Escape with focus inside the frame never reaches the parent, and one Tab reaches Exit Cinema. Pass 1 measured it only with the mock's same-origin about:blank frame, so what a real provider frame does with Escape is not verifiable before slice 4. Take a position on "a limit, not a defect the parent can fix".

- F15 · low · addendum. D-04 is a vertical claim: at 360 Broadcast, both themes, the lead's action ends at 779.11, a margin of 64.89 below 844. The builder's 35 is `innerWidth − leadTitle.right`, horizontal. F16 · low · six of the 17 committed captures differ from a re-run (ideas row 64); PNGs were advisory. F17 · low · Pass 1 added a CHANGELOG [Unreleased] entry: attack whether it makes any reader-visible claim.

- F18 · low · the PR body still names d93c551 as Head, its acceptance table says 660 tests in one place and its test plan 662. Edit the body once, at the end, and say so in your comment.

- F19 · low · copy the builder wrote and the sealed package does not contain (listed in Pass 1's comment). Row 66 (provider codes 2 and 5 reported as "unavailable") stays a row: it needs a copy call. Row 67 folds into ruling 1. Row 69 goes with F20. The rest is the designer's.

- F20 · NEW, medium because it states a falsehood. After a player failure and "Retry player" the visit still says the active item is `playing` (position kept), the primary action reads "Pause", there is no frame (iframes 0, playerLive false) and pressing Pause does nothing. Reproduced at 76a0421 by probes/retryplayer.probe.tsx, output retryplayer.out.json. The plan chose it: the player boundary's failure "does not dispatch leave, so the visit ... stay[s]", so the reducer never pauses. It is unreachable with [] and reachable only if the host throws; the `momentsPlayerFault` prop is the only known trigger. FIX IN THIS PR, with row 69 (return the surface to `stage` on a player failure, a plainer sentence than "mount", and Retry player must not reopen Cinema with no frame). You design it: the plan's reason for not dispatching leave is a constraint to weigh. Record it as ideas row 70; do not renumber rows 56–69. Take a position on the medium.

Pass 1 also killed, as unreproducible or as not defects; contest any you can reproduce: a stale box after a lens switch, Spoiler-light, a resize across 887/888, a late layout shift or Cinema from a scrolled page (host against anchor 0, 0, 0, 0 in every one); the wrapper moving the sticky Table header or the zone dividers (boxes equal at every offset); `location.origin` being the string "null" from a `file:` URL (it is `file://` in Chrome 154; ideas row 68); a script `onerror` being an invented timeout (a real event, not a timer, and the plan §3 names it as one of three sources of `unknown`); the tab row being dead while a frame is on the page (a Playwright artefact); Entering Cinema resetting page scroll (also Playwright); a failing contrast pair or a font under 10px on the new surfaces (72 cells, minimum 5.44:1, smallest type 10px).

Pass 1's precedence resolutions, for you to check: the template prints `”.` after every quoted title and the cold review's D-18 forbids the doubled mark, resolved so the mark stays inside the quotes when the title has one and follows them when it does not; the architecture's Pass 2 clarification (restore focus to a surviving appropriate control) outranks the implementation; and the build prompt's "on ready or cued" against the reference, which is ruling 1. One is left: the template's timeout title is "Your place is safe." where the builder's recovery heading is "Playback not confirmed." That one and the strings Pass 1 lists as the builder's own are the designer's. Accept or contest; neither is a merge condition.

Which characterisations you are expected to test hardest: the severity of F1, F2 and F5; F12's split; F13's reach; and F20's medium.

REVIEW PASS 1'S EIGHT COMMITS AS ANYONE'S CODE

No one else has reviewed them. Say which you would have written differently, and why, with a command where you can. Attack surfaces.

- 81e7804: `sent()` as above; `script.remove()` in `loadApi`'s onerror and the `window.onYouTubeIframeAPIReady` chain it sits beside; `onReady`'s reconcile for a Play that arrived before ready.
- 3350318: the `owner` and `shown` state, `host.toggleAttribute('inert', placement === 'cinema' && !shown)`, `host.removeAttribute('inert')` in `play()`, StrictMode's double mount, what "the frame stays alive" means for a parked instance.
- 34221e4: `survivingControl()`'s global `document.querySelector` calls; the cross-component inert removal in the unmount cleanup; the new `!element.closest('[hidden], [inert]')` filter in both Tab-wrap lists.
- cc20686: a layout effect that dispatches a reducer action and a provider command; the "never painted" claim.
- f19c1ec: the regex, and the strings it feeds.
- 878a958: the `unread` mark: set once by the opening read, cleared only by a write that persists, and what a tab leave and return does to it.
- 76a0421: every number and absolute word in the architecture doc's "Slice 3 review resolutions", the CHANGELOG [Unreleased] entry, ideas rows 62–69 and the receipt README addendum. Each is a falsifiable assertion.
- c563145: the Pass 0 brief's archive; read it for anything that overstates.
- Challenge Pass 1's stub against the reference: where is it stricter than the reference, where looser? `LatePlayer` in tests/dom/momentsPlayer.test.ts and the stub in probes/adapter.probe.ts and real-adapter.mjs are the three copies.

THE WORK, AND WHAT YOU MAY DEFER

Do: rulings 1, 2, 4 and 5 in code, tests and docs; ruling 3 in the docs; F10 hardened, each new assertion proved red by mutation; F12's XS defect; F20 with row 69; the PR body edit; ideas rows 61, 62 and 63 closed with the verified wording and row 70 added; CHANGELOG [Unreleased] only, no version section, no bump, no tag. You may defer, with your reason in the comment: Cinema's reading order (row 65's remainder), rows 66 and 68 (copy and a slice-4 decision), and F16's PNG differences (advisory). Do not build anything else.

RECEIPTS — ~/kickoff-pr128-review/, readable on this machine. Your numbers must come from your own runs; these are for reproducing Pass 1's positions

- Copy the folder to your own scratch directory and work there; never run in place. The probes write their .out.json back into the folder they were read from, and the paths below are hardcoded to Pass 1's worktree. I ran `node --check` on all 14 .mjs scripts, and all pass; I did not execute any of them.
- Paths you must change in your copy: probes/vitest.config.mjs sets `W` to Pass 1's worktree (/Users/benicheni/Documents/Claude/Projects/Kickoff/.claude/worktrees/silly-faraday-fd0812, which still sits at 76a0421; do not edit it) and its `root` to the folder; each of probes/row61.probe.tsx, adapter.probe.ts, owner.probe.tsx and retryplayer.probe.tsx has a `writeFileSync` to an absolute path in that folder; pr128-reproduce.mjs copies pr128-probes.tsx from an absolute path in that folder.
- Chrome is /Applications/Google Chrome.app (154.0.8037.58 when Pass 1 ran). Playwright 1.62.1 is at ~/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs. Arguments are `<playwright-module> <chrome> <origin> [out.json]` unless a script says otherwise; read each file's first lines.
- Needs the untracked probe entry (copy probe-entry/_probe_real.html and _probe_real.tsx into tests/harness/ of the worktree the dev server serves, and delete them before any commit): real-adapter.mjs (F1, F9, the `file:` origin, a player failure in Cinema; takes a fifth argument, the path of dist-single/index.html), pre-ready.mjs (the F1 window, with a ready control group), tab-away.mjs (F1 on tab departure), focus-exits.mjs (F6), geometry.mjs (phone grow, D-04, D-16, contrast, fonts, copy; the fallback part).
- Uses the ordinary harness (tests/harness/moments.html): cinema-back.mjs (Shift+Tab out of the frame, Escape inside it), cinema-probe.mjs (the inert enumeration, every exit, placement and the stage keyboard chain; F2, F6, F8, F10, F12), tab-frames.mjs (F8), layout-probe.mjs (`<rt> <chrome> <base-origin> <tip-origin> <out.json>`, every element box at six scroll offsets), recapture.mjs and recapture-2.mjs (`<rt> <chrome> <base> <tip>`, PNG settling), and pr128-reproduce.mjs with pr128-probes.tsx, the markup comparison against main's shell: `node pr128-reproduce.mjs <head> 8cb9d87 <new-scratch-dir>` from the repo root with PR128_OUT set. Pass 1 reports it stops at its own typecheck on the `export { MomentCard };` line it appends to Pass2MainMomentsPage.tsx and on node typings; delete that line in the scratch copy and run `npx vitest run --project dom tests/dom/pass2.test.tsx` there directly. final/markup.json and final/markup-moments.json are the results.
- Scratch vitest project, probes/: row61.probe.tsx (F5), adapter.probe.ts (the reference-faithful stub against the adapter), owner.probe.tsx (an owner failure while Cinema is open), retryplayer.probe.tsx (F20). mutations/ holds the three checker mutations; redgreen/ holds the fixed versions used for red and green. pr-comment.md is the comment as posted.
- The builder's own checkers are in the repo: `node docs/verification/moments-foundation/check-browser.mjs <playwright-module> <chrome> <base-origin> <tip-origin> <output-dir>` (72 cells) and `node docs/verification/moments-player/check-player.mjs <playwright-module> <chrome> <dev-origin> <output-dir>` (`SMOKE=1` runs 18 cells). The dev server binds localhost (::1) only, so pass http://localhost:<port>, and start it with `npm run dev -- --port 5174 --strictPort` from the worktree whose code you are testing. Static servers for base and tip builds were plain `python3 -m http.server` on 127.0.0.1.

TRAPS ALREADY HIT

- Playwright's `locator.click()` after its own auto-scroll landed inside the cross-origin frame and no event reached the top document; scroll, let a frame pass, then click by coordinates. Log pointerdown in a capture listener before calling a control dead.
- A dispatch made from `page.evaluate` re-renders later, so a snapshot in the next evaluate reads the state before it; use `waitForFunction`. Three apparent findings were that lag.
- Never edit src/ while a headless matrix runs against the dev server; Vite's reload aborts it.
- PNG first-capture identity is noise (the base build against itself read 70 of 72); the text hash is the comparator, and a mismatch is a flake until re-captured.
- `window.location.origin` on a `file:` URL is `file://` in Chrome 154, not the string "null".
- Write a number into a commit message only after the run that produced it.

VERIFY, AND SAY WHICH SHA EACH NUMBER CAME FROM

- `npm run typecheck` and `npm test` at 76a0421 first (Pass 1 reports 688 tests in 51 files), then at every commit you add. `npm run build` and `npm run build:single` at your final tip.
- The bundle proof at your final tip, run yourself: `rg -n 'moments-player-mock|Moments gallery verification harness|Fictional selection|pkEpLtePJm0|iBuTEywEQ6U|sXAkBsEcXSo|tests/harness' dist dist-single` prints nothing; "player fault" ships once in each (the prop seam); the provider strings youtube.com/iframe_api and youtube-nocookie.com appear once each; no ytimg or googlevideo; package.json, the lockfile and index.html untouched; nothing under src/ imports tests/; main.tsx passes neither App prop. Your `allow` and `referrerpolicy` values will now appear in the bundle, and that is expected.
- The inert receipt (docs/verification/moments-foundation/check-browser.mjs, base 8cb9d87 against your tip, 72 cells, identical body text, `scrollWidth === innerWidth` on all 144 loads, zero media elements, zero provider requests). The full player matrix (docs/verification/moments-player/check-player.mjs, 1260 cells and 290 journeys, with your F10 additions). The markup comparison for ruling 3 and the layout comparison (layout-probe.mjs), because your changes touch src/ and index.css may move.
- Red then green for each fix you make, by swapping the parent version of the file under the new tests: `git show <sha>^:<path>`.
- If your changes touch src/ or index.css: the full browser matrix the skill's §4 requires, at 360, 375, 390 and about 1000, every lens × theme × tab, viewport set before every capture. 390 is the judge, 360 the jury.
- `verify` green at your final tip. Name the run.
- Nothing you run may request youtube.com, youtube-nocookie.com, ytimg.com or googlevideo.com: abort those hosts in every browser context, and count zero. Reading the documentation pages is fine. Slice 4 is where the real provider is run, and it needs Beni's narrow authorisation.

BOUNDARIES

- Fix commits only for what you reproduced or what a ruling requires, authored as Codex (`git -c user.name="Codex" -c user.email="noreply@openai.com" commit`), with typecheck and test green at each, and no test count typed into a message before the run finishes. If you revert or reshape any of Pass 1's changes, say so in your comment and give the evidence.
- No merge, no version bump, no CHANGELOG version section, no tag, no force-push, no workflow change, no write to src/data or src/curated/moments.json, no `npm run sync`, no attribute on the frame beyond `allow` and `referrerpolicy`.
- Leave PR #114, every other PR and branch, Beni's main checkout and the wip branch alone.
- Do not edit Pass 1's comment. Edit the PR body once, at the end.

YOUR PR COMMENT — one comment, the same table shape as Pass 1's (.claude/skills/kickoff-pr-review/pr-comment.md)

- A decision line: your overall position, whether you recommend any merge blocker and why, and the exact final head SHA.
- A findings table with one row per Pass 1 position (F1–F20, each killed lead, ideas rows 61–69). Columns: # · Pass 1 position · your position (accept, contest, or accept-but-contest-the-characterisation) · evidence (command and SHA) · fix commit, if any.
- Anything new you found, with severity and evidence. Answers to any attack surface above you took up.
- What you did for each ruling, the precedence resolutions you made, what you deferred and why, and the commits you added, all authored as Codex.
- Verification as run, with SHAs, and a Not verified list. Keep Pass 1's: physical devices, Safari and Firefox, screen-reader speech, anything about the real provider (playback, rights, ads, the ready window's length, error 153, letterboxing a 16:10 box, whether a parked or clipped instance keeps decoding), Android and iOS back, CloseWatcher, browser zoom and widths beyond those run. Add what you skipped.
- Questions only Beni can answer, each answerable in one word. Whether your tooling made the untracked .agents copy.

Then stop. Pass 2.5 re-runs your evidence at the tip and writes Beni's brief. What could still fail the merge gate is anything you leave contested with Pass 1: the gate needs a non-release, no numbering fork, no high finding, `verify` green at the tip, and no change to ?only=, &date=, sync.yml's gates or src/data. The merge is his.

SEALED APPENDIX — Pass 1's numbers. Re-derive any you rely on or contest; none is a conclusion

- At f632e10: typecheck clean; 662 tests in 50 files; both builds green; `verify` run 36640807461 green. Inert receipt: 72 of 72 text, 72 of 72 PNG, 144 of 144 scrollWidth === innerWidth, zero media elements, zero page errors, zero provider requests, 634 font requests. Player matrix: 1260 cells, 290 journeys (scroll 12, D-04 2, lens switch 30, gallery return 30, tab away 30, playing at zero 6, keyboard 12, D-15 12, D-17 120, H-B 36), zero provider requests, zero page errors, 6,450 font requests, scroll delta 0, 0, 0, 0.
- At the tip's src (878a958, and 76a0421 which adds docs only): typecheck clean; 688 tests in 51 files; both builds green. Inert receipt: 72 of 72 text on two runs; PNG 68 of 72 on both, a different four each time, all eight identical across both builds on two recaptures each. Player matrix: the same counts and zeros. Layout: 180 of 180 element-box comparisons equal at f632e10; at the tip 3 of 30 cells differ by 0.03px in one container's width, and the base build against itself differs by 0.03px in 1 cell.
- Markup against main's shell at 8cb9d87: Fixtures and Table 29 of 29 identical once exactly the three named differences are removed (12 shell, 12 route-error, 5 ?only= and &date= cells), URL state equal in all 29, and the empty Moments tab 6 of 6. Bundles: the builder's rg prints nothing in dist and dist-single; "player fault" once in each; youtube.com/iframe_api and youtube-nocookie.com once in each; no ytimg or googlevideo; package.json, the lockfile and index.html untouched; nothing under src/ imports tests/; main.tsx passes neither App prop.
- Mutations against the builder's checker: min-height removed from .moments-stage-anchor went red ("phone height 180"); the inert step removed stayed green through 18 smoke cells and 277 journeys; the host moved over the queue went red ("intersects queue"). Against the adapter tests: six mutations, five red and one (the retired-attempt check in `accept`) green until Pass 1 added the test.
- Geometry: phone grow 320, 335 and 350 by 200 at 360, 375 and 390, stage and Cinema, the list below. D-16 stacked at 761, 768, 800, 855 and 887; 520 × 292.5 beside the list at 888. D-04 vertical margins below 844: 360 ledger 101.73, poster 72.89, broadcast 64.89; 375 and 390 ledger 151.45, poster 122.61, broadcast 114.61 (the PM seat re-read these from geometry.json). Contrast: 72 cells, minimum 5.44:1, no failing pair; smallest text 10px; the player fallback minimum 6.54:1.
- The Escape-inside-the-frame, focus, placement and frame-sampler numbers are in cinema-probe.json, the focus-exits.mjs output, the tab-frames.mjs output and real-adapter.json in the receipts folder.
- The PM seat's own checks this session: the tip, `verify` run 36650584669 and the PR's state; the eight commits and their authors; the diff stat; that `git diff f632e10..76a0421 -- tests` has no removed line; the passages ruling 1 supersedes (`git grep`); the retryplayer probe's output (status playing, position 7, iframes 0, primary Pause after Retry player); the D-04 margins; the empty Moments tab's six cells; `node --check` on the 14 scripts.

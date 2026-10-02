# PR #138 — Pass 1.5: the rebuttal brief for Codex (archived by the PM seat, Thu 1 Oct 2026, TZ=America/New_York)

This is Pass 1.5 of the six-pass 360 for "Moments slice 4 S2–S3: the permission gate and the
acceptance build" (PR #138). It was written by the PM seat, a Claude Code session on Sonnet 5.5
with the pipeline skill loaded, from a fresh read that began at 22:54 EDT:
- the PR head `0a9a3c2b83a1daba8adaa1544f425746fb470f93`, open, a draft, MERGEABLE, `verify`
  green, one comment;
- Pass 1's comment (issuecomment-5938190900), read whole, and the two docs-only commits it added
  (`09d0dea`, `0a9a3c2`);
- every source line the comment cites (`MomentsPlayerHost.tsx`, `MomentsSessionProvider.tsx`,
  `momentsQueue.ts`, `moments.ts`, `momentsPlayerMock.ts`, `momentsPermission.test.tsx`);
- the acceptance receipt README, `docs/moments-player-pass-2-brief.md` and
  `docs/moments-gallery-pass-2-brief.md` for the shape of a rebuttal brief.

**Routing.** The builder rebuts: Codex on GPT-6 Astra at Extra High, as Beni routed it. Claude Code
reviewed and built nothing. Pass 2.5 is the PM seat again.

**Beni's four one-word answers, 1 Oct 2026, taken in this session:** row 73 **yes**, row 74
**open**, row 72 **nowrap**, squash message **yes**. The first three travel in the prompt as his
rulings. The fourth is for Pass 2.5's Executive Summary Brief and his merge; the prompt tells
Codex only that it is not Codex's.

**What the fresh read changed against the handoff it started from.**
- `origin/main` moved after Pass 1: `4ac9f3d`, four commits past the merge base `7636b08` (two
  bot syncs, #137's spec docs, #139's `.agents` skill copy). `src/data/fixtures.json` differs by
  about 2,990 lines, so the prompt forbids merging or rebasing main: a data change would alter
  the inert receipt's body text and pass for an application change.
- Pass 1 cites the lapse test at `tests/dom/momentsPermission.test.tsx:318–340`. The file is 99
  lines long; the lapse cases are at lines 72–94. The prompt gives the real lines and tells
  Codex to check every other citation.
- `.moments-primary` is not only the playback button. `MomentsPlayback.tsx` also gives it to the
  source link when that is the primary action, and `MomentsPage.tsx:46` gives it to the gallery's
  "Open selection →" button. A blanket `white-space: nowrap` on the class could overflow a
  long source name at 360, so the prompt scopes the nowrap ruling to the playback buttons and
  demands the proof.
- Row 74's suggested signal, `playerLive`, is set by the host from `shown`, which flips in the
  same commit as the lapse; the prompt names the hazard and leaves the design to Codex.
- Pass 1's scratch directory was in a temporary path, so no receipts folder travels with the
  brief; Codex reproduces from the comment's descriptions.

The prompt below was delivered in chat; this file is the archive.

---

PR #138 — Pass 2 (rebuttal): Moments slice 4 S2–S3, the permission gate and the acceptance build

You are Pass 2 of the six-pass 360 for PR #138 in github.com/BeniCheni/kickoff, running in Codex on GPT-6 Astra · Extra High. You built this code: 75dcb94 (the gate, the test seam, the fixtures, the acceptance build script) and 134f1e3 (the probes and the S3 receipts), on top of 070a625, the cherry-pick of the PM seat's spec docs. Claude Code (Fable 5.1 Extra) cold-reviewed it in Pass 1 and added two docs-only commits. Your job is to answer every Pass 1 position with accept, contest, or accept-but-contest-the-characterisation, to reproduce or disprove each one in code, to carry out Beni's rulings, and to re-run the receipts your changes touch. A rebuttal that agrees with everything has not been run, and a contest with no command and no SHA behind it is not a contest. Pass 2.5 (the PM seat, `/kickoff-pr-review 138 --no-merge --pass 2.5`) re-runs your evidence at the tip. Beni adjudicates and clicks any merge; this PR is a non-release and stays a draft and --no-merge until he says otherwise.

ROUTING, SAID PLAINLY

Pass 1 was Claude Code, which reviewed this PR and built nothing. You built it, so a finding against it is a finding against your work: you may contest it with a command and a SHA, never out of attachment to the design, and you accept without ceremony what you cannot disprove. Pass 1 wrote two docs-only commits, so the branch moved under you: you start from 0a9a3c2, never from 134f1e3.

THE BRANCH MOVED UNDER YOU — do this first

- The remote tip is 0a9a3c2b83a1daba8adaa1544f425746fb470f93: `verify` run 36908612511 green (it was green at 134f1e3, run 36889856761), the PR open, a draft, MERGEABLE, one comment (Pass 1's, https://github.com/BeniCheni/kickoff/pull/138#issuecomment-5938190900). Run `git fetch origin` and `git rev-parse origin/codex/moments-slice-4-acceptance`. If it is anything else, run `git log --oneline 0a9a3c2..origin/codex/moments-slice-4-acceptance`, name each new commit and file, and tell Beni before you do anything else.
- Pass 1's two commits, both authored Claude <noreply@anthropic.com> and both docs-only: 09d0dea (the Pass 0 brief archived as docs/moments-slice-4-review-prompt.md, plus three docs/README.md index rows) and 0a9a3c2 (docs/v0.2.6-ideas.md: new rows 73–75, amendments appended to rows 71 and 72, a dated Process-notes block). Read both with `git show`. Pass 1 made no fix commit, so every finding below is open for you.
- Work in a Codex worktree, never in /Users/benicheni/Documents/Claude/Projects/Kickoff (Beni's checkout) and never in a Claude review worktree. `git fetch origin`, then branch from `origin/codex/moments-slice-4-acceptance`. Your pushes must fast-forward that branch with `git push origin HEAD:codex/moments-slice-4-acceptance`, after re-checking the remote tip. Never force-push.
- Your first commit is the archive of this brief, docs/moments-slice-4-pass-2-brief.md, with its docs/README.md index row. It is the tip of the local branch claude/moments-slice-4-pass-2-brief, whose parent is 0a9a3c2, so `git cherry-pick claude/moments-slice-4-pass-2-brief` applies cleanly. If you cannot reach that branch, say so and skip it.
- Do not merge or rebase main. origin/main is 4ac9f3d, four commits ahead of the merge base 7636b0871c9a10db53e9a00ad3811cc7093efa6c: two bot syncs, #137's spec docs and #139's .agents skill copy. src/data differs there (about 2,990 lines in fixtures.json). Every receipt compares the base 7636b08 with your tip on one data snapshot, so a sync commit would change the inert receipt's body text and pass for an application change. Re-run `git diff --exit-code "$BASE" "$TIP" -- src/data` before every receipt, as the README's reproduce block does.
- Author every commit as `git -c user.name="Codex" -c user.email="noreply@openai.com" commit`. `git add` by path, never -A. In zsh write `"${B}:path"` for `git show`.
- Never run `npm run sync`. Never hand-edit src/data/*.json or src/curated/moments.json. Never edit docs/moments-slice-4-spec.md (the PR carries an identical copy of #137's, and an edit would turn the squash into an add/add conflict). Do not use or rely on .agents/skills/kickoff-pr-review: it is a machine copy of the review skill with vendor names swapped, it names the wrong seat for this pass, and its fate is Beni's pending call. Do not commit it.
- No merge, no ready-for-review, no label, no version bump, no new CHANGELOG version section, no root README.md edit, no tag, no rebase, no workflow dispatch, no workflow change, and no request to any provider host.

BENI'S RULINGS — first-hand to the PM seat, Thu 1 Oct 2026

Pass 1's comment ended with four one-word questions. He answered all four in this session. Three change what "accept" means for you; the fourth is not yours.

1. Row 73, the focus hand-off: **yes**. Add the stage → parked focus hand-off in this PR, with a DOM test, and re-run the player matrix, the inert comparison, the layout probe and the real-adapter run. Finding 1 below is therefore accept-and-fix; you may still contest its characterisation or its reproduction, with evidence.

2. Row 74, a lapse with no live frame: **open**. A lapse that finds no live frame leaves Cinema open and bumps no attempt. Dispatch `player-lost` only while a frame is live, with a test; a lapse with a live frame still returns Cinema to the stage, as the existing test asserts. Finding 2 is accept-and-fix on the same terms.

3. Row 72, the primary button: **nowrap**. The primary playback button stays on one line and the long source link wraps instead: `flex-shrink: 0; white-space: nowrap` or an equivalent, scoped as finding 3 says. Not the flex-wrap alternative, and not deferred to S7's design pass.

4. Should the squash message name 070a625, 75dcb94 and 134f1e3 for the receipts: **yes**. This one is for Pass 2.5's Executive Summary Brief and Beni's merge, not for you. The only consequence for you is that your own comment lists every commit SHA you add, because those stop resolving on main after the squash too.

Standing rulings, all Beni's, which you must not re-open. 28–29 Sep 2026: loadVideoById takes the object form with startSeconds; the stage and Cinema boxes are at least 200px tall; the iframe is built on youtube-nocookie.com with allow="autoplay; encrypted-media"; reload-and-seek is labelled last-known recovery, not continuity. 30 Sep 2026: referrerpolicy stays strict-origin-when-cross-origin; "Resuming from the last known position." is accepted, a provider sample of exactly zero must not show it, and a later sample above zero still may; ideas rows 65, 66 and 68 stay deferred. 1 Oct 2026: the first real provider request is loopback-only; a demo edition is in the plan behind its own publication yes; Beni names any video ids in writing; slice 4 stays a non-release until a reader can use Moments; asks 5 and 6 (a one-page first-edition source policy, S5.5; the S4 test ids kept separate from the edition ids) are answered yes and govern S4 to S6, not this PR. docs/moments-slice-4-spec.md still lists them as open and you leave it so. If you think a ruling produced a defect, say so as a question for Beni, not as a finding against anyone. No release number is in play, so this pass prepares no release.

WHAT PASS 1 FOUND — answer each

Pass 1's verdict: mergeable at the tip, no high finding, `--no-merge` honoured. One medium and four lows, each reproduced, all routed to Pass 2 and to ideas rows 73–75 (and row 72's amendment). Pass 1 reviewed your code at 134f1e3. Where this brief gives a file and line, the PM seat read it at 0a9a3c2 and it matched, except the one noted in finding 4. Check every other citation too, and say in your comment where one is wrong.

1. Finding 1 · medium (latent player path; production inert) · ideas row 73 · Beni's ruling 1: yes. A permission lapse while keyboard focus is inside the live stage player drops focus to `<body>`. MomentsPlayerHost moves the dialog to `parked` (inert, aria-hidden, 0×0, the return stop hidden) with no focus hand-off: the placement derivation is at src/components/MomentsPlayerHost.tsx:177–181 and the placement effect at 266–288. The Cinema lapse lands on Enter Cinema through the `wasCinema` effect (lines 339–347), and the fault path's unmount uses `survivingControl()` (line 67; used at 253 and 345); the stage → parked transition has neither.
   - Reproduction, real Chrome 154: build a replacement edition whose first item has `expiresAt` 30 minutes after the pinned clock (`npm run build:acceptance -- /abs/path/edition.json`), serve `dist-acceptance` on a loopback port. A Playwright context fulfils https://www.youtube.com/iframe_api from docs/verification/moments-acceptance/youtube-stub.js and the two https://www.youtube-nocookie.com/embed/S4Accept001 and S4Accept002 URLs with an empty document, aborts every other provider match, and maps the provider domains to ~NOTFOUND with `--host-resolver-rules`. Open the lead card, click Play with a settled click (`scrollIntoViewIfNeeded`, two animation frames, an `elementFromPoint` hit check: an unsettled click right after Play gets swallowed by the frame), call `window.__players.at(-1).__ready()`, wait for Pause, then `document.querySelector('iframe').focus()`, then in the page `const real = Date.now.bind(Date); Date.now = () => real() + 3_600_000; window.dispatchEvent(new Event('focus'))`. Pass 1 saw, at 360, 390 and 1000: placement `parked`, no Play, Pause, Retry or Replay, the source link primary, `document.activeElement` is BODY, and a following Tab starts from the document top.
   - jsdom cannot see it as the rig stands: there is no focus fixup, so focus stays on the hidden return stop. Your DOM test therefore asserts where focus is, not merely that it is not the body: after `tick(60_050)` from a playing stage with focus on the return stop (and, separately, on the iframe), `document.activeElement` is a visible, non-inert control outside the parked host. It must be red at 0a9a3c2's src and green at your fix.
   - Pass 1's suggested fix: in the host's placement effect, when placement becomes `parked` and `host.contains(document.activeElement)`, focus `survivingControl()`. You design it. Check what `survivingControl()` returns in this state (its order is Enter Cinema, the gallery heading, the current tab, the first tab) and say which control focus lands on at 360, 390 and 1000; check that the hand-off does not fire when focus is elsewhere (a reader typing in a filter must not lose focus to a lapse) and does not fire for a parked instance whose owner is not the active selection.
   - Commit the Chrome reproduction as a rerunnable probe beside real-adapter.mjs, with its output as a receipt: red at 0a9a3c2, green at your tip, at 360, 390 and 1000.
   - Three responses: accept and fix (the expected one), contest with evidence that reproduces the opposite, or accept the defect and contest the characterisation (say what the right severity is: Pass 1 calls it medium because the production edition is empty; Beni's 30 Sep ruling classed PR #128's latent player-path findings as high once an edition exists, and you may argue this one belongs with them).

2. Finding 2 · low · ideas row 74 · Beni's ruling 2: open. A lapse with no live frame still closes Cinema and bumps the item's attempt: the lapse effect in src/components/MomentsSessionProvider.tsx:126–134 dispatches `player-lost` unconditionally, and the reducer (src/lib/momentsQueue.ts:136–143) returns Cinema to the stage and runs `suspend`. A reader looking at a cover in Cinema is ejected when the permission expires, while a legacy link-only item can stay in Cinema. The architecture note's "Lapse parks" bullet records "Cinema returns to stage" but not this no-frame cost.
   - Reproduction on the rig: mount a permitted item with `expiresAt` one minute ahead, open it, Enter Cinema without Play, `tick(60_050)`. Pass 1 saw surface `cinema` → `stage`, placement `idle`, media attempt 0 → 1, focus on Enter Cinema; the same in Chrome at 360, 390 and 1000.
   - The ruling: dispatch `player-lost` only while a frame is live. A hazard to check, not trust: row 74 suggests `playerLive`, but the host sets it from `shown` (MomentsPlayerHost.tsx:291, `setPlayerLive(shown)`), and `shown` includes `canPlay`, which flips false in the same commit as the lapse. The provider's lapse effect reads `playerLive` from its render closure, so which value it sees depends on effect order across the two components. Prove which signal is right (the previous commit's value, the adapter's own state through the bridge, or something else) with a test for each of: a frame live on the stage, a frame live in Cinema, a frame parked under another active selection, and no frame at all in the stage and in Cinema.
   - After the lapse with no frame, Cinema stays open on the cover with the source link as its primary action, no Play, and no attempt bump. Check focus and `inert` in that state (the host is inert in Cinema while no frame is shown) and say what you found. The with-frame lapse test at tests/dom/momentsPermission.test.tsx:72–94 keeps asserting Cinema → stage, unchanged.
   - Record the new behaviour in docs/moments-architecture.md's "Slice 4 implementation decisions (S2)": the "Lapse parks" bullet's cost changes. Close row 74.

3. Finding 3 · low · ideas row 72, wider than the builder wrote it · Beni's ruling 3: nowrap. Pause wraps "Paus / e" at 375 as well as 360, and in every lens and theme at 360 (the button font is Inter in all three). With the acceptance edition's longer source name the pre-Play **Play** wraps "Pla / y" at 375 and at 390, on the stage and in Cinema (the button is 43.2 px beside a 190.2 px link). `.moments-primary` (src/index.css:268) is a flex item with `flex-shrink: 1`, `white-space: normal` and `min-width: auto`; `.moments-action-row` is at line 261 and `.moments-save` has `flex: none`.
   - Reproduction: the tip harness at http://127.0.0.1:<port>/tests/harness/moments.html?tab=moments&scenario=player&lens=ledger&theme=light&surface=stage&playback=playing at 360 and 375, and the acceptance build's stage and Cinema before Play at 375 and 390. `const r = document.createRange(); r.selectNodeContents(primary); r.getClientRects().length` is 2 where it wraps, 1 at 390 (archival) and 1000; `scrollWidth === innerWidth` everywhere. The committed base and tip PNGs, docs/verification/moments-acceptance/receipts/{base,tip}-360-ledger-light-stage-playing.png, reproduce the 360 case.
   - Scope the fix. The class `.moments-primary` is not only the playback button: src/components/MomentsPlayback.tsx gives it to the source link when that is the primary action (line 23, a link whose text is a long source name), and src/components/MomentsPage.tsx:46 gives it to the gallery's "Open selection →" button. A blanket `white-space: nowrap` could push a link-only primary or a gallery card past the viewport at 360. Apply the rule to the playback buttons (Play, Pause, Retry, Replay) and prove the other two uses still wrap and do not overflow. The ruling is the playback button on one line and the link wrapping, with `.moments-save` and the link both fitting; the longest label in every state at 360, 375 and 390 is the test, not Pause alone.
   - It is a src/index.css change, so the player matrix re-runs with D-17's geometry (the pressed control's and the primary's rects stay within 1px) and a 360 Ledger-light stage-playing capture replaces the committed tip PNG in the acceptance receipts. Keep the base PNG as the "before" evidence and rewrite the README paragraph that describes the wrap as a remaining limitation. docs/verification/moments-player/360-ledger-light-stage-playing.png belongs to PR #128's archived receipt and stays as it is. No token repaint. Close row 72.

4. Finding 4 · low · ideas row 75. The lapse test asserts the reducer, not the adapter. The cited location is wrong: the lapse cases are at tests/dom/momentsPermission.test.tsx:72–94, not 318–340 (the file is 99 lines). They check surface, placement, the missing buttons and a no-op `play()`, but neither that `retire()` reached the adapter (`currentMockPlayer().reads.retires`) nor that the media status became `paused`; the late `playing` emission is dropped by the mock itself once retired (tests/harness/momentsPlayerMock.ts:45–49 and the `emit` guard at line 59), so the assertion at line 92–93 passes whether or not `player-lost` ran. Pass 1 measured what the test should pin: retires 0 → 1 and status `playing` → `paused` at the tick, position 12 kept, history kept. Accept-and-fix unless you show the test already does it. Make the new assertions fail by mutation (remove the `player-lost` dispatch; remove the `retire()` call), prove each red, restore.

5. Finding 5 · low · a README precision, no ideas row. "Validated with `parseMoments` against `git show HEAD:src/data/fixtures.json`" is literally true and vacuous for the fixture facts: `parseMoments` skips the cross-check when a fixture is absent from the snapshot (src/lib/moments.ts:130–131, `if (!live) continue`), and all six acceptance fixtures are absent by design; only tests/momentsAcceptance.test.ts's comparison with fixture-provenance.json checks the archived facts, and nothing in the repo checks the provenance file against 1fad342 itself (Pass 1 did, by hand: all six rows byte-identical to that snapshot, absent from the current one). The isolation run's bad-fixture case proves the cross-check fires when a fixture is present, and this is the same strength a real edition gets for fixtures outside the window (spec finding 4), so it is not weaker than S6: it just is not said. Accept-and-fix with one sentence in docs/verification/moments-acceptance/README.md (and the S2 section if you prefer) unless you show the README already says it. Do not add a provenance-against-1fad342 check unless you can do it without a network fetch or a change to how the build validates; if you can, say so and propose it as a row, not a change.

KILLED BY PASS 1 — do not re-litigate; contest only with evidence that reproduces the opposite

- Row 71 as a reader-visible defect. Pass 1 reproduced the diagnostic twice with `UNSETTLED=1` (Next after the second Exit Cinema at 360 reaches no parent pointerdown or click; the first selection stays active), then sampled the page after Exit Cinema at 0, 1 and 2 frames, 50 ms and 250 ms without scrolling: scrollY 0, Next at y 886–945 below the fold, the player dialog at 354–554, `elementFromPoint` on Next's centre none every time. Playwright then scrolls to 494 and dispatches at Next's new centre (about 422) before the compositor has moved the frame off 354–554, so the pointer lands in the cross-origin iframe. The same loss hit an Enter Cinema click straight after Play. Automation or compositor timing, the mechanism the 29 Sep process notes already recorded; nothing shows a reader can hit it. Row 71 is amended in 0a9a3c2: you may accept the amendment or contest it with evidence.
- A time bomb in the acceptance edition: the permitted items carry checkedAt 2026-09-01 and no expiresAt, the expired item expires 2026-09-02, and `hasEmbedPermission` over the six reads [true, true, false, false, false, false] at 2026-10-01, 2027-10-01 and 2036-10-01.
- A path to the adapter that skips the rule: the rule is routed through exactly three decision sites (`MomentsPlayback.identity`, `MomentsSessionProvider.play`'s `videoId`, `MomentsPlayerHost.shown`), and bypassing each alone turns tests/dom/momentsPermission.test.tsx red (15, 14 and 4 failures).
- A difference between the tip production bundle and main's beyond the rule: the unminified diff is `hasEmbedPermission`, `mayPlayMoment`, the provider's `useNow`, `canPlay`, lapse effect and `play` guard, the Playback `identity` and `PlaybackStatus` guard, the host's `shown` and the App prop; minified JS +802 bytes, CSS hash identical, `index.html` differing by the script hash only.
- An extra timer on the production path: subscriber count App 3 against provider-alone 2, `vi.getTimerCount()` 1 — one clock subscription, no timer.
- Every S3 receipt Pass 1 re-ran on base 7636b08 and tip 134f1e3 equalled yours (below); you need not re-run any of them unless your changes touch what it measures, and the work below touches the first six.

THE WORK — and what you may defer

Do: findings 1, 2 and 3 in code, tests and docs, each with a DOM or probe test proved red against the parent and green at the fix; finding 4's assertions and finding 5's sentence; the receipts your changes touch; the docs below. Do not build anything else: no S4 work, no edition, no provider request, no change to the permission rule itself, no change to the acceptance edition's data. You may defer nothing Pass 1 raised; if you defer anything else you touched, say why in the comment. Rows 65, 66 and 68 stay as written, and row 71 stays open whichever way you read Pass 1's amendment.

The hard rule for any change under src/, scripts/ or tests/. `npm run typecheck` and `npm test` green at every commit. tests/moments.test.ts's empty-edition assertion unchanged. No data-honesty or inert assertion weakened, and no existing assertion removed: if you must change one, say which and why in your comment. Red then green for each fix by swapping the parent version of the file under the new tests: `git show <sha>^:<path>`. Write a test count into a commit message only after the run that produced it.

Receipts to re-run. A src/ change means the following, each with its numbers from your run and not from a document; same ports as the README or new ones, stated; the base is 7636b08 and the tip is your final tip, on one data snapshot.

- The tip player matrix and tip mutations: docs/verification/moments-player/check-player.mjs and check-mutations.mjs against the tip harness. Pass 1 and you read 1,260 cells, 404 journeys, 17 captures, 6,906 font-only requests and 0 errors at both base and tip, and six mutations red at both. The journeys that touch your changes are D-17 and the action-row cells; say whether a journey count moves and why.
- The 72-cell inert comparison (docs/verification/moments-foundation/check-browser.mjs, base against tip) and the 180-box layout probe (docs/verification/moments-acceptance/layout-probe.mjs). Production CSS now changes, so say what moved; the empty production Moments tab renders no primary button, so equal body text and equal boxes are what you should see, and a difference is a finding.
- The real-adapter run on a rebuilt acceptance bundle (docs/verification/moments-acceptance/real-adapter.mjs; 72 runs, 324 checkpoints and 138 locally fulfilled provider-shaped requests at 134f1e3, 0 aborted, 0 escaped), plus your new lapse-focus probe.
- The isolation check (check-build-isolation.mjs; 7 rows). The permission red/green receipt (reproduce-permission.mjs 070a625 75dcb94) is a historical comparison of two commits and stays as it is.
- The browser matrix the review skill's §4 requires for a diff that touches src/ or index.css: every lens × theme × tab at 360, 375, 390 and about 1000, the viewport set before every capture, `document.documentElement.scrollWidth === window.innerWidth` on every cell. 390 is the judge, 360 the jury. The player matrix covers the player surfaces; do the rest in the pane.
- Refresh receipts/provenance.json, receipts/integrity.json (its `applicationTip` and `applicationSourceUnchangedAfter` name 75dcb94 and become false the moment src/ changes), receipts/build-isolation.json's `sha`, and the README's SHAs and counts. The README's "Sources and runtime" and "Results" tables are the places that name them. Frozen archives go in a fresh scratch directory; nothing served is edited during a run.

The reproduce commands, from docs/verification/moments-acceptance/README.md (read it at your tip: it is the owning list and wins over this copy). Run from an isolated checkout at the tip.

```sh
RT=/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs
CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
BASE=$(git merge-base HEAD origin/main)
TIP=$(git rev-parse HEAD)
REPO=$PWD
RUN=$(mktemp -d /tmp/kickoff-s4-XXXXXX)
mkdir "$RUN/base" "$RUN/tip" "$RUN/evidence"
git diff --exit-code "$BASE" "$TIP" -- src/data
git archive "$BASE" | tar -x -C "$RUN/base"
git archive "$TIP" | tar -x -C "$RUN/tip"
ln -s "$REPO/node_modules" "$RUN/base/node_modules"
ln -s "$REPO/node_modules" "$RUN/tip/node_modules"
npm run typecheck
npm test
(cd "$RUN/base" && npm run build)
(cd "$RUN/tip" && npm run build && npm run build:single)
npm run build:acceptance
cp -R dist-acceptance "$RUN/tip/dist-acceptance"
```

Careful: `git merge-base HEAD origin/main` is only 7636b08 while origin/main has not been merged into your branch, which is the state you must keep; if it prints anything else, stop and say so.

```sh
python3 -m http.server 8871 --bind 127.0.0.1 --directory "$RUN/base/dist"
python3 -m http.server 8872 --bind 127.0.0.1 --directory "$RUN/tip/dist"
python3 -m http.server 8873 --bind 127.0.0.1 --directory "$RUN/tip/dist-acceptance"
(cd "$RUN/base" && npm run dev -- --host 127.0.0.1 --port 5191 --strictPort)
(cd "$RUN/tip" && npm run dev -- --host 127.0.0.1 --port 5192 --strictPort)
```

```sh
P=docs/verification/moments-player
A=docs/verification/moments-acceptance
node "$RUN/base/$P/check-player.mjs" "$RT" "$CHROME" http://127.0.0.1:5191 "$RUN/evidence/base-player"
node "$P/check-player.mjs" "$RT" "$CHROME" http://127.0.0.1:5192 "$RUN/evidence/tip-player"
node "$RUN/base/$P/check-mutations.mjs" "$RT" "$CHROME" http://127.0.0.1:5191 "$RUN/evidence/base-mutations"
node "$P/check-mutations.mjs" "$RT" "$CHROME" http://127.0.0.1:5192 "$RUN/evidence/tip-mutations"
node docs/verification/moments-foundation/check-browser.mjs "$RT" "$CHROME" http://127.0.0.1:8871 http://127.0.0.1:8872 "$RUN/evidence/inert"
node "$A/layout-probe.mjs" "$RT" "$CHROME" http://127.0.0.1:8871 http://127.0.0.1:8872 "$RUN/evidence/layout.json"
node "$A/real-adapter.mjs" "$RT" "$CHROME" http://127.0.0.1:8873 "$RUN/evidence/real-adapter.json"
node "$A/reproduce-permission.mjs" 070a625 75dcb94 "$RUN/evidence/permission"
node "$A/check-build-isolation.mjs" "$RUN/evidence/isolation"
```

Nothing you run may request youtube.com, youtu.be, youtube-nocookie.com, ytimg.com, googlevideo.com or ggpht.com (or a subdomain): every browser context aborts them, DNS is blocked, only the stub fulfils the API URL and the two fictional frame URLs locally, and you count zero provider requests. The pane never presses Play without the stub. Reading documentation pages is fine. A vite dev server binds IPv6 (localhost) only by default on this machine: pass --host 127.0.0.1 as above, and never edit src/ while a headless matrix runs against a dev server (Vite's reload aborts it).

Docs, all in the repo's wrapped style for files.
- docs/moments-architecture.md, "Slice 4 implementation decisions (S2)": record each accepted fix and each accepted cost. The "Lapse parks" bullet changes (finding 2's no-frame behaviour, finding 1's hand-off); add a bullet for the nowrap scope; keep the closing "There is no disagreement with the slice-4 spec" paragraph true or amend it.
- CHANGELOG.md `[Unreleased]`, under the existing `### Changed` or `### Fixed` slice entries, in their voice: inactive, empty production edition, interface unchanged. Add no version section.
- docs/v0.2.6-ideas.md: close or amend rows 72, 73, 74 and 75 in place with "Closed in PR #138 Pass 2" wording, as rows 61, 62, 69 and 70 do (a struck-through title, then what was reproduced and fixed). Never renumber. Row 71 stays open, amended or not, as your reading of Pass 1's amendment decides. Add a dated Process-notes line for what this pass learned about verifying (for example, the hand-off test that jsdom cannot fail on its own).
- docs/verification/moments-acceptance/README.md: finding 5's sentence; the Results and Sources tables; the reproduce block if a command changes; the wrapped-label paragraph; the Not verified list.

TRAPS ALREADY HIT

- Playwright's `locator.click()` after its own auto-scroll can land inside the cross-origin frame and no event reaches the top document: scroll, let two frames pass, check `elementFromPoint`, then click by coordinates. Log pointerdown in a capture listener before calling a control dead.
- A dispatch made from `page.evaluate` re-renders later, so a snapshot in the next evaluate reads the state before it; use `waitForFunction`.
- A jumped `Date.now` only shows up at the clock store's next tick or a `focus` event: dispatch `window.dispatchEvent(new Event('focus'))` as the repro does, then wait for the placement to change.
- PNG first-capture identity is run-dependent (Pass 1 saw 69, 64 and 72 of 72 on different runs); the body-text hash is the comparator, and a PNG mismatch is a flake until re-captured on both builds.
- vitest swallows console.log from a probe; write probe output to a file. macOS has no `timeout`.
- The base and tip checkers are byte-identical, so "base's copy against base, tip's against tip" is one checker version; keep it that way unless you change the checker, and say so if you do.

YOUR PR COMMENT — one comment, `pr-comment.md`'s shape (.claude/skills/kickoff-pr-review/pr-comment.md)

- A verdict line: your overall position, whether you recommend any merge blocker and why, and the exact final head SHA.
- A table with one row per Pass 1 finding (1–5), plus rows for the killed leads and for ideas rows 71–75. Columns: # · Pass 1 position · your position (accept, contest, or accept-but-contest-the-characterisation) · how you reproduced it, with the command and the SHA · fix commit, or "not fixed — why".
- Killed items you accepted; anything new you found, with severity and evidence; the hazards you were told to check (finding 2's signal, finding 3's scope, finding 1's non-firing cases) and what you found.
- Deliberately not done.
- The receipts as you re-ran them, each with its numbers and the SHA it came from, and the base and tip it compared.
- The exact tip SHA and its `verify` run id (name the run); the list of every commit you added, authored Codex, which stops resolving on main after the squash; a note on whether your own tooling made the untracked .agents/skills/kickoff-pr-review copy.
- Questions only Beni can answer, each answerable in one word, if any.
- The line: "Non-release. Next: Pass 2.5 by the PM seat via /kickoff-pr-review 138 --no-merge --pass 2.5."
- Not verified, repeated verbatim unless you verified one: real provider playback, content and rights, ads, readiness duration, nearest-keyframe seeking, one-press autoplay, real iframe attribute retention, parked decoding, the Pages Referer and error 153, physical devices, Safari and Firefox, screen-reader speech, browser zoom, Android and iOS Back, CloseWatcher. Add what you skipped.

Then stop. Pass 2.5 re-runs your evidence at the tip and writes Beni's brief. What could still fail the merge gate is anything you leave contested with Pass 1: the gate needs a non-release, no numbering fork, no high finding with no fix commit, `verify` green at the tip, nothing still contested between the two vendors, and no change to ?only=, &date=, sync.yml's gates or src/data. The merge is his.

SEALED APPENDIX — Pass 1's numbers. Re-derive any you rely on or contest; none is a conclusion

- Baseline at 0a9a3c2: typecheck clean; `npm test` 738 tests in 53 files (base 7636b08: 720 in 51). Diff against the merge base: 67 files, +2210 / −34.
- Runtime Pass 1 used: Google Chrome 154.0.8037.58, Playwright 1.62.1 from the codex-primary-runtime path, Node 24.15.0, npm 11.12.1, headless, DPR 1, reduced motion; base and tip from `git archive`, loopback ports 8871/8872/8873 (python) and 5191/5192 (vite, `--host 127.0.0.1`).
- Receipts at base 7636b08 and tip 134f1e3, equal to yours: player matrix 1,260 cells, 404 journeys, 17 captures, 6,906 font-only requests, 0 errors at both; six checker mutations red at both; inert 72/72 text and 72/72 PNG with the tip's checker and again with main's unmodified checker (external requests 634 against 630, the 1280×720 first load); layout 30 cells, 180 offsets, same boxes and URLs, overflow-free; real adapter 72 runs, 324 checkpoints, 138 locally fulfilled provider-shaped requests, 0 aborted, 0 escaped; permission 16 fail and 1 pass at 070a625, 17 pass at 75dcb94; isolation passed (7 rows).
- The clock: `play()` reads the render-closure `nowUtcIso`, the clock store's last snapshot, minute-floored (src/lib/clock.ts:42–49), never `Date.now()`. With an expiry inside a minute, Play, Retry, Replay and direct `play()` stay available for up to 60 s plus 50 ms; after the tick a direct `play()` creates no attempt.
- Lapse path as Pass 1 measured it, with a live frame: no Play, Retry, Replay or Pause, no `[data-player-status]`, no recovery copy, no sentinel, the source link primary and the only link, Save reference stays; the dialog is inert and aria-hidden and parked; media `playing` → `paused`, position kept, history and queue kept, attempt bumped; the mock's retires 0 → 1 and the stub's calls `[playVideo, pauseVideo]`. Cinema returns to the stage with focus on Enter Cinema. Parked variant (owner A, active B): the lapse of A fires no second retire; Next then Play on B plays `[A, B]` on one iframe, the same node, never reparented.
- Pass 1's own mutation: the adapter's `ready` guard removed from `sent()` and `command()` stayed green through all 36 ready-time real-adapter runs and went red at the first construction-time run, which is why the control variant exists; `startSeconds` forced to 0 went red at the first full journey.
- Pass 1's pane cells: production 390 Ledger-light Moments (empty shelf, 0 iframes), 390 Broadcast-dark Fixtures with `?only=pl,ucl&date=2026-09-26`, 360 Poster Table `?only=ucl`, 1000 Ledger Moments; acceptance 390 Ledger-light stage permitted and Cinema pre-Play, 390 stage denied, 360 Poster stage expired, 1000 Broadcast-dark stage permitted; harness 360/375/390 Ledger-light and 360 Poster-light, Broadcast-dark and Ledger-dark stage playing for row 72. `scrollWidth === innerWidth` on every cell.
- The PM seat's own checks this session: the tip, `verify` run 36908612511 and the PR's state (draft, MERGEABLE, one comment); the two Claude commits' authors; every source line cited in findings 1, 2 and 5 (matched) and in finding 4 (the test lines did not: 72–94, not 318–340); that `.moments-primary` is also on the source-link primary and on "Open selection →"; `origin/main` at 4ac9f3d against the merge base 7636b08.

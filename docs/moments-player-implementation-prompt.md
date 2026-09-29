# Moments slice 3 — the build prompt for Cursor on Grok 4.7 (archived by the PM seat, Mon 28 Sep 2026, TZ=America/New_York)

The third rung for slice 3: the player host, the YouTube adapter and Cinema. It was written from a
fresh read of `origin/main` at `1045db0` (the #118 squash; re-verified at `8cb9d87`, two docs-only commits later, with `src/` and `tests/` byte-identical): `src/App.tsx`, the provider, the page,
the merged stage CSS, `docs/moments-architecture.md` with its Pass 2 Cinema contract, the ideas
rows, and the checkers under `docs/verification/`. Its other inputs are the Cursor/Grok plan
(`docs/moments-player-plan.md`, SHA-256 `9e194e5e…`), the PM seat's scoring and Beni's rulings
(`docs/moments-player-plan-review.md`), the sealed R3 package, the 25 Sep handoff and the R3
cold review. The last five are not on `main`; they were staged for the builder as untracked files.

## What changed since the plan was written

The plan was written against `704581c`, before #118's review. Two things moved:

- The visit owner now sits **inside** the 780px shell, wrapping only the Moments route
  (`34e0b82`). The plan's "make the 780 shell inert during Cinema" would inert the player too.
  `docs/moments-architecture.md`'s Pass 2 clarification now states the contract: inert the
  background subtrees individually, never the shell, `#root`, `body` or any ancestor of the
  dialog. The prompt makes this a hard rule.
- The inert receipt's base is now `main` at or after `1045db0`, not `704581c`.

## Seats, workspace and rulings

- Builder: Cursor, Grok 4.7 at Extra High, in `~/kickoff-cursor-build-slice3` on branch
  `cursor/moments-player`. Pass 1: Claude Code, Fable 5.1 Extra. Pass 2: Cursor/Grok. Beni or
  his delegate adjudicates.
- Beni's 28 Sep rulings on the plan travel in the prompt: grow the phone box to 200px tall, and
  the seven accepted defaults. The five engineering questions the review carried are put to the
  builder as resolutions to record.
- The stale planning worktree pinned to `704581c` was removed, so nothing builds on pre-review
  code.

Delivered in chat; this file is the archive.

---

Kickoff Moments slice 3 — build the player host, the YouTube adapter and Cinema (Cursor · Grok 4.7 · Extra High)

You are the builder for Moments slice 3 in the Kickoff repo (github.com/BeniCheni/kickoff), running in Cursor on Grok 4.7 at Extra High. You wrote the implementation plan for this slice in Plan mode on 28 Sep 2026; the PM seat scored it, Beni ruled on its open decisions, and slice 2 has since merged with one structural change that affects you. Build from the plan as amended below, in code, to an open pull request. Claude Code (Fable 5.1 Extra) cold-reviews your PR in Pass 1, you answer that review in Pass 2, and the merge is Beni's or his delegate's. You review nothing you built, and you stop at the open PR.

WORKSPACE — already prepared

- Open the folder /Users/benicheni/kickoff-cursor-build-slice3. It is a git worktree on the branch cursor/moments-player, created from origin/main at 8cb9d87 (docs-only commits #124 and #125 on top of 1045db0e8158729f4010bcf9756f2fa69f430f0c, the squash of PR #118 "Moments slice 2: the gallery, inert until curated"). Run `git status` and `git log -1` first and confirm the branch is cursor/moments-player and the tree is clean. Then run `git diff --stat 1045db0 HEAD -- src ':!src/data' tests index.html package.json vite.config.ts`: it must print nothing, proving the code you build on is exactly what slice 2 merged. If either check fails, stop and report. Do not rebase onto newer main commits while you build: scheduled data syncs keep landing on main and would change src/data, and with it the inert receipt's body text.
- Never open, edit, check out or commit in /Users/benicheni/Documents/Claude/Projects/Kickoff. It is Beni's own checkout. Never touch the local branch wip/main-checkout-2026-09-27.
- `.plan-inputs/` in the workspace is untracked and locally excluded from git. It holds your reference inputs; read them, never modify or commit them (the three plan documents now also exist on main under docs/, byte-identical; the design inputs exist only here):
  - docs/moments-player-plan.md — your plan, verbatim.
  - docs/moments-player-plan-review.md — the PM seat's scoring and Beni's rulings.
  - docs/moments-player-plan-prompt.md — the plan-only prompt you answered.
  - docs/moments-implementation-handoff-2026-09-25.md — the design brief; its opening skill line and seat routing are superseded.
  - docs/design/moments-r3/ — the sealed R3 package. Run `shasum -a 256 -c REVISION.sha256` inside it and expect 56 OK before relying on it; never run its scripts.
  - docs/design/moments-r3-cold-review.md — Claude's R3 review; §4 D-16–D-20, §7 H-A–H-G, §12.
- Cursor writes `.cursor/` inside the workspace on its own; it is locally excluded. Do not add it to a commit.
- Do not read src/data/*.json. Slice 3 needs none of it.

GROUND TRUTH — read fresh; nothing in this prompt is evidence

Read in this order: AGENTS.md; CLAUDE.md ("Verification discipline", "Release management", "Fergie Time"); docs/moments-architecture.md, all of it, with special care for Decision 1, Decision 2 and the paragraph headed "Slice-2 placement clarification (PR #118 Pass 2)"; docs/moments-gallery-pass-2.5-executive-brief.md; docs/v0.2.6-ideas.md rows 56–61 and its Process notes tail; docs/verification/moments-gallery/README.md and pass2.md; src/App.tsx; src/components/MomentsSessionProvider.tsx, MomentsPage.tsx, ViewBoundary.tsx, MomentCover.tsx; src/lib/moments.ts, momentsQueue.ts, momentsSaved.ts, momentsReferences.ts, momentsGallery.ts; the Moments section of src/index.css; index.html; tests/dom/rig.ts, tests/dom/momentsGallery.test.tsx, tests/fixtures/moments/, tests/harness/; docs/verification/moments-foundation/check-browser.mjs and docs/verification/moments-gallery/check-gallery.mjs.

Precedence is template > design brief > implementation prompt: the sealed R3 package; then the 25 Sep handoff as amended by the cold review's §12 and Beni's rulings; then the architecture document and this prompt. Where your plan made precedence calls (888 over the template's 760; a true 16:9 box over the template's `aspect-ratio: auto`; recovery below the iframe rather than painted over it; one Next control; no history entry), they stand. Record every precedence resolution in the PR body.

WHAT MOVED SINCE YOUR PLAN — read this before designing anything

1. The visit owner is now inside the 780px shell. At 1045db0, src/App.tsx mounts `MomentsSessionBoundary active={tab === 'moments'}` and `MomentsSessionProvider` inside `div.max-w-[780px]`, after the header and TabNav, wrapping only `MomentsRouteBoundary`. Fixtures and Table render in a sibling `ViewBoundary` outside the owner. Your plan's §3 and §5 assumed the owner wrapped the shell and that Cinema could make the shell inert. That is now wrong: an inert shell would inert your player. The architecture's Pass 2 clarification is the binding contract: mount MomentsPlayerBoundary and MomentsPlayerHost under the owner as a sibling of MomentsRouteBoundary, outside the `tab === 'moments'` condition; during Cinema apply `inert` to the background subtrees individually (the header, the TabNav, the Moments route content, and any other active route content), never to the shell, `#root`, `body` or any ancestor of the dialog; restore interactivity and focus on close, tab departure, and owner or player failure or unmount.
2. The inert receipt's base is your merge base on main, not 704581c. Build that commit and your tip from the same data snapshot: never rebase between the two builds, or sync drift in src/data will masquerade as an application change.
3. Two docs-only commits landed after 1045db0: #124 (your plan, its scoring and the plan-only prompt, now under docs/) and #125 (README.md rewritten as the public welcome page, whose "Where we are" section already describes this slice). Leave README.md, CHANGELOG.md and package.json alone; the only docs/README.md edit you make is index rows for docs you add.
4. Your plan's line references into MomentsPage.tsx and index.css may be off by the Pass 1 and Pass 2 edits. Re-derive them; do not trust the plan's line numbers.

BENI'S RULINGS — fixed, not to be reopened

From 27 Sep 2026: the live site stays unchanged while src/curated/moments.json is []; the shared header stays 780px; the stage and list stack through 887px and sit side by side from 888px.

From 28 Sep 2026, on your plan:
1. Slice 3 lands inert, as a non-release: `moments.json` stays [], no version bump, no CHANGELOG version section, no tag. With an empty edition the player boundary renders nothing and makes no request.
2. One PR.
3. H-C: Cinema pushes no history entry.
4. H-G: one Next control, the transport's, fed only by queueNeighbours; recovery copy names that item and does not grow a second button.
5. Embeds use the youtube-nocookie.com host, built as an iframe element you create and pass to YT.Player. The API script stays https://www.youtube.com/iframe_api.
6. playsinline=1.
7. No invented loading timeout. A hung load stays `loading` until the user leaves or a provider event arrives.
8. Phone box: GROW, not clip. Your plan recommended clipping the stage box to 16:9 even below 200px tall; Beni rejected that because YouTube's stated minimum is 200 × 200. The stage anchor and the player host keep full width and grow in normal flow to at least 200px tall: height = max(width × 9/16, 200px). At 360px that is 320 × 200; the rule stops mattering around a 396px viewport. The list is pushed down, never covered. This amends, for phone widths only, the slice-2 architecture line "No minimum-height workaround defeats the aspect ratio"; record it in docs/moments-architecture.md as Beni's ruling. Whether the provider letterboxes a 16:10 iframe as expected is unverified until slice 4.

Routing for the review is also his: Claude Code reviews, you rebut.

SCOPE — build exactly this

1. src/lib/momentsPlayer.ts, the adapter, with no React and no new dependency. It defines the port that both the real YouTube adapter and the test mock implement. It captures (item ID, attempt, instance ID) per attempt and rejects stale callbacks at its own boundary before the reducer's checks. It verifies the event's target is the current player, that the loaded video ID matches the attempt for `playing` and `ended`, and that `data` is a documented state or error integer. It dispatches at most one terminal failure per attempt. Codes map exactly as the plan states from the official reference: 101 and 150 → owner-blocked; 2, 5 and 100 → unavailable; 153 and any other integer → unknown. It samples `getCurrentTime()` on pause, on ended and before retire, and dispatches `position` only for a finite number ≥ 0, zero included. It never awaits a cross-origin reply before navigation. Reload-and-seek: when the loaded ID differs, `loadVideoById` without `startSeconds`, then `seekTo(position, true)` on ready or cued, then a `getCurrentTime()` sample; the "Resuming from the last known position" label appears only after a finite, nonnegative sample. Never call `cueVideoById` (it fetches a thumbnail). Use `pauseVideo` for park and leave, never `stopVideo`; `destroy()` only on host unmount. Pass `origin: window.location.origin` and `enablejsapi=1`, leave `controls` at its default, and do not set `modestbranding`. On `onAutoplayBlocked`, stay in `loading`, dispatch no failure, and show neutral copy that the control inside the player can start playback.
2. The intent gate. Before an explicit Play there is no provider request of any kind: no API script, no iframe, no preconnect, no thumbnail. index.html keeps only its Google Fonts preconnects. The script element is created on the first Play, never in index.html. After intent, at most one provider instance exists for the whole visit.
3. src/components/MomentsPlayerHost.tsx, with its own error boundary. Mount it in src/App.tsx exactly where the architecture's Pass 2 clarification says. One stable host element owns the only iframe; the replaceable node the API swaps is a child slot; after construction assert `getIframe().parentNode === host`, and treat a mismatch as one terminal `unknown` with no second constructor. Stage and Cinema share the host by CSS placement measured from the in-flow `data-moments-stage-anchor` versus the Cinema viewport. Never render the iframe inside the keyed route boundary; never portal or reparent it. At gallery-only or on another tab, pause and park the host without `display: none` on any ancestor of the iframe (a closed `<dialog>` is `display: none`, so never `close()` a dialog that parents the iframe); `destroy()` only on unmount. With an empty edition the boundary renders null. App takes an optional `momentsPlayer` factory prop defaulting to the real adapter; src/main.tsx passes nothing.
4. The page. Play becomes the primary action once an item is selected and has a `source.identity`; the source link stays beside it and still never sets `completed`. Replay after `ended`. Enter Cinema. Recovery: a 150 owner block is a labelled entry with Retry as the primary action and the source link beside it; a timeout is neutral copy; recovery names the real next item from queueNeighbours, and there is one Next control (ruling 4). Retry issues a new attempt in the same turn.
5. Cinema. An accessible modal that shares its subtree with the host. The rest of the application becomes inert per the contract above, subtree by subtree, never an ancestor of the dialog. Focus: on entry store the opener and move focus to Exit; Escape and Exit return to stage and restore focus to the opener; Gallery from Cinema runs the existing gallery path and focuses the gallery heading; Tab wraps within the dialog with the iframe as one stop, and the parent never pulls focus back from inside the frame on a timer. Provider controls and attribution stay unobscured: no overlay on the iframe after intent. Cinema content is at most 1440px wide inside a full-viewport dialog; the shared header stays 780px. D-15: activating a lower queue row in Cinema scrolls the dialog until the player and the primary action are visible, then focuses that action with `preventScroll: true`.
6. Deterministic validation only. A mock adapter behind the same port lives under tests/ and drives the unit tests, the DOM tests and the unshipped harness (tests/harness/moments.tsx gains player scenarios and simulation controls). Zero media-provider requests in every deterministic run. The mock, the simulation controls and the harness must be absent from both production bundles, and you prove it.

Out of scope, and refused if you find yourself doing it: any real provider request (slice 4, needing Beni's narrow authorisation); curation or a first edition; src/data, src/curated, workflows, the meaning of any URL parameter, the Fixtures or Table behaviour; a version bump or CHANGELOG version section; a new production or development dependency; a `ledger:` CSS variant or a new colour token; vendoring R3's Oswald file (the app already loads Oswald 500/600/700).

RESOLUTIONS YOU OWE — decide each in code and record it in the PR body under "Resolutions"

1. Stage semantics and focus order. Your plan hosts the iframe in a non-modal `<dialog>` positioned over the in-page anchor. Two consequences need an answer: assistive technology announcing a dialog around an inline player, and the iframe sitting after the Moments route in DOM order so Tab from Play must cross the rest of the route (WCAG 2.4.3). State how you handle both. Options include managing focus into the host after Play with a labelled region and a return control, or a different stage host element that is not a dialog. Whatever you choose must still never reparent the iframe.
2. Escape without `closedby`. Option `no` relied on `closedby="closerequest"` for Escape and Android back. Escape needs an explicit `keydown` path that works where `closedby` is absent. Keep the `cancel` handling as a second path where the attribute exists.
3. Scroll tracking. Your plan syncs a `position: fixed` box to the anchor's viewport rect on every scroll. A document-coordinate position would move with the page and need re-measuring only on layout change. Choose, and record scroll behaviour at 360 and 390 in the receipt.
4. The inert receipt's base is your merge base on origin/main. Name the SHA.
5. Record in docs/moments-architecture.md, in a "Slice 3 implementation decisions" section in the style of slice 2's: the host placement under the moved owner, the per-subtree inert list, the grow ruling, the adapter lifecycle, and each resolution above.

ACCEPTANCE — every ID maps to a test or a receipt cell

- Inert: the empty-edition DOM test renders no dialog, no host, no iframe and no script; the inert receipt reads identical body text on 72 of 72 cells against the merge base; the header still reads V0.5.2; zero media elements.
- D-06: in every stage and Cinema cell the host rect stays inside its column and never intersects the queue; every queue row hit-tests at 5, 50 and 95 percent of its width. A ready cell has no iframe.
- D-07: existing refusal tests stay; Cinema adds an in-modal live region and a visible Retry whose status clears on selection change.
- D-08: recovery strings use queueNeighbours titles only; when `next` is null, no title.
- D-09: code mapping and one failure per attempt in the node tests; item A's 150 preserved across item B's unknown outcome; a second code on A's same attempt is never dispatched.
- D-14: ready, loading, playing (including position 0), paused, ended, blocked and timeout survive the surfaces the reducer says they survive; only playing becomes paused on gallery return; Cinema in and out changes neither status nor position; tab away and back dispatches `leave` once and never autoplays; a lens switch during play dispatches no `leave`.
- D-15: at 390 in all six lens/theme cells, mouse and keyboard, a lower queue row brings the player and the primary action into the dialog's visible box and focuses that action.
- D-16: cells at 761, 768, 800, 855 and 887 are stacked; at 888 and above the side-by-side host measures at least 480 × 270. Both the anchor and the host are measured.
- Phone grow (ruling 8): at 360, 375 and 390 the anchor and host measure full width and at least 200px tall, in normal flow, with the list below.
- D-17: Cinema Save and Unsave, success and refusal, rects unchanged within 1px at 360, 390, 768, 1000 and 1440; the stage coverage slice 2 already has stays green.
- D-18: no doubled terminal punctuation in any Cinema or recovery string, tested with titles ending in ".", "?", "!" and a closing quote.
- D-19: one live region in the dialog while Cinema is open; the Save name is stable and state is in aria-pressed.
- D-20: no design-content text under 10px at 360–390 on any new surface; the 9.5px empty banner is the inert exception.
- D-04: the lead still fits the first 844px on the gallery cells; report the 360 Broadcast margin as a number.
- H-A, H-B, H-D, H-E, H-F, H-G as your plan's acceptance map states.
- Owner and boundaries: a player throw shows the player fallback and leaves the shell, the tabs, Fixtures and Table intact; a route throw still pauses through `leave`; the owner's own fallback copy is unchanged.
- Intent gate: zero provider requests before Play in the DOM tests and in every deterministic browser cell.
- D-01, D-02, D-03, D-05, D-10, D-11, D-12 and D-13 stay on slice 2's tests, unweakened. D-01's completion half becomes real when the mock emits `ended`: add that step to the existing history/Undo case.

VERIFICATION

- `npm run typecheck` and `npm test` green before every commit; `npm run build` and `npm run build:single` at the commit that adds the host and at the final tip.
- Extend tests/dom/rig.ts (primeClock, installMatchMedia, popTo, installSelectionScroll, referenceStorageRig, throwingStorage); add a rig helper only when several tests share a fake rect or ResizeObserver; never start a second harness.
- Unit tests of the real adapter against a fake `window.YT.Player` as your plan §7 lists them, including: no script before Play; one script after; stale attempt and stale target do not dispatch; two errors on one attempt dispatch once; the code map; negative and NaN times dropped, zero kept; `loadVideoById` without `startSeconds` on a different ID; the resume label only after a finite sample; `destroy` on dispose and not on retire; StrictMode double mount yields one instance.
- Bundle proof: after both builds, `rg -n 'moments-player-mock|Moments gallery verification harness|Fictional selection|pkEpLtePJm0|iBuTEywEQ6U|sXAkBsEcXSo|tests/harness' dist dist-single` returns nothing, and a node test walks src/ and fails if any file imports from tests/. `youtube.com/iframe_api` and `youtube-nocookie.com` WILL appear in the production bundle because the real adapter is the default; that string is not a request, and the inert receipt's network log is the request proof. Do not remove the URL to make the grep quiet.
- Inert receipt: docs/verification/moments-foundation/check-browser.mjs, a fresh build of your merge base against a fresh build of your tip, served with `vite preview`. 72 cells, identical body text, `scrollWidth === innerWidth` on all 144 loads, zero media, zero provider requests, Google Fonts counted separately, PNG identity advisory only.
- Slice-3 browser matrix, run against the dev server with the mock: stage and Cinema × ready, loading, playing, paused, ended, blocked, timeout, plus gallery return, tab away and back, and a lens switch during play; 3 lenses × 2 themes; widths 360, 375, 390, 761, 768, 800, 855, 887, 888, 1000, 1100, 1160, 1250, 1440, 1920; heights 844 for phones, 1024 for 761–888, 900 above. Every cell: viewport set before load; `scrollWidth === innerWidth`; at most one iframe; zero provider requests; host inside its column and disjoint from the queue; every queue row hit-tested at three points. Keyboard journeys at 390 and 1440 in all six lens/theme cells: Tab from the page to Play, Enter, Tab through Cinema including the wrap, Shift+Tab, Escape, Exit, Gallery back to the active card. Write the checker under docs/verification/moments-player/ in the style of check-gallery.mjs, reusing the Playwright runtime already on the machine; add no dependency.
- The two dev-server hazards from the ideas file's process notes bind you: the server from .claude/launch.json listens on `localhost` (::1) only, so pass `http://localhost:<port>`; and never edit src/ while a headless matrix runs against it, since Vite's reload aborts the run.
- Visually inspect every capture you cite and name each one in the receipt README. Say which browser and which runtime you used.
- Not verified, stated in the PR: physical devices; Safari and Firefox; screen-reader speech; any real provider behaviour, rights or playback; iframe continuity across park and return; browser zoom beyond the listed widths.

COMMITS AND THE PR

- Author every commit as Cursor's default identity (`Cursor <cursoragent@cursor.com>`), typecheck and test green at each. Suggested sequence, adjust with reasons: adapter and node tests; host, boundary, intent gate and stage placement; stage recovery; Cinema; harness and bundle proof; receipts and the architecture section.
- Your first commit archives this prompt as docs/moments-player-implementation-prompt.md. It is the tip of the local branch claude/moments-player-build-prompt, whose parent is 8cb9d87, so `git cherry-pick claude/moments-player-build-prompt` applies cleanly (verify with `git merge-base --is-ancestor 8cb9d87 HEAD`; if it does not apply, say so and skip it rather than resolving conflicts in docs/README.md by hand); keep its Claude authorship. If you cannot reach it, say so and skip it.
- Push cursor/moments-player and open one PR against main titled "Moments slice 3: the player, inert until curated". The body carries: what a reader sees on the live site (nothing new, with the empty edition) and what the harness shows; Beni's rulings quoted as his; Resolutions (every precedence call and the five above); an acceptance table with evidence per row; the exact head SHA; both receipts; a Not verified list. Keep it a draft until both receipts are complete, then mark it ready and stop.
- No merge, no version bump, no CHANGELOG version section, no tag, no force-push, no workflow change. Leave PR #114 and every other branch alone. Do not run any real-provider request, even once, even to check.

REPORT — your final message

Worktree, base and head; the commits; files changed; test counts; both receipt summaries; the images you inspected; the PR link; any questions for Beni, each answerable in one word; Not verified.

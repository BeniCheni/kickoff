# Moments slice 2 — scope, Beni's rulings and the Codex build prompt (archived by the PM seat, Sun 27 Sep 2026, TZ=America/New_York)

This is the next rung after PR #113 (slice 1, squash `ad9586b`, no release). It was written from
a fresh read of `origin/main` at `9a91a45`: `docs/moments-architecture.md`, the Pass 2.5 brief,
`docs/v0.2.6-ideas.md` rows 56–58, `src/App.tsx`, `src/components/MomentsPage.tsx`, and the Moments
modules. It also read the 25 Sep implementation handoff, the sealed R3 package and Claude's R3 cold
review. They were untracked in the main checkout; since 27 Sep 16:31 they sit in `e26e7e9`,
pinned as the local branch `wip/main-checkout-2026-09-27`. The prompt was
delivered in chat for Beni to paste into Codex; this file is the archive.

## Scope decisions (PM seat)

- **No design brief rung.** The 25 Sep handoff adopted R3 as built ("no R4 design exercise").
  The two open layout questions were one-word rulings, not a design round. The design inputs are
  the sealed R3 package, amended by the cold review's §12 and the rulings below.
- **No proposal rung either.** `docs/moments-architecture.md` is the spec of record for slice
  ownership and Decisions 1–2. Slice 2 extends it and does not replace it.
- **Row 58 goes into slice 2 as its first commit.** It is the exact seam the session owner lands
  on, since the owner sits above the keyed boundary. The mechanism is delegated to the builder.
- **Selection is in slice 2; the player is not.** The architecture gives slice 3 a dependency on
  "slice 2 owner and selection UI". Slice 2 therefore opens items into history and reserves an
  in-flow 16:9 stage anchor for the player host. No player, iframe, provider request or
  playback wording ships.
- **Routing** follows README's "Two builders" row 2 (deep, ambiguous implementation):
  - **Codex, GPT-6 Astra · High** builds and later rebuts.
  - **Claude Code, Fable 5.1 Extra** runs Pass 1 through `/kickoff-pr-review <N> --no-merge`.
  - The seats are the same as slice 1's.

## Beni's rulings (27 Sep 2026, one word each, answering the PM seat)

1. **Landing: inert until curated.** While `src/curated/moments.json` is `[]`, the Moments tab
   renders what main renders today. Slice 2 merges as a non-release foundation landing, and the
   minor release waits for slices 3–4 and a first-edition decision.
2. **Header width (H-B): keep 780.** The shared header, tabs and lens switcher stay 780px on
   every tab, and the 1160px gallery widens below them.
3. **D-16: remedy (a).** The stage and the list stack up to 887px and sit side by side from
   888px.
4. **Routing:** Codex builds, Claude reviews.

## What stays open

- Beni's five SDLC rulings asked at PR #113 Round 3 are not assumed here. The prompt runs the
  seats as slice 1 ran them.
- Slice 3 (player/Cinema: D-06, D-15, D-16's player half, H-C back behaviour) and slice 4
  (integration, narrowly authorised real-provider validation, initial-edition proposal) are
  unscoped. Publication stays Beni's decision.
- The release number for the Moments minor is unassigned. It is Beni's call when a candidate
  exists.

---

Kickoff Moments slice 2 — the gallery, inert until curated (Codex build)

You are the builder for Moments slice 2 in the Kickoff repo (github.com/BeniCheni/kickoff), running in Codex on GPT-6 Astra · High. Seats, the same as slice 1: Codex builds and later answers the review (Pass 2); Claude Code, Fable 5.1 Extra, cold-reviews in Pass 1 via /kickoff-pr-review <N> --no-merge; Beni adjudicates and clicks every merge. You do not review or approve your own work, and you stop at an open PR.

BENI'S RULINGS (27 Sep 2026)

1. Landing — inert until curated. While src/curated/moments.json is [], the Moments tab's visible output stays exactly what main renders today: the floodlight banner and "No moments curated yet.". The new gallery renders only for a non-empty edition. Slice 2 merges as a non-release foundation landing, as slice 1 did. No version bump, no CHANGELOG version section, no tag. The minor release waits for slices 3–4 and his first-edition decision.
2. Header width (the R3 cold review's H-B) — keep 780. The shared header, tab row and lens switcher stay in the 780px container on every tab; the scoped 1160px gallery widens below them. The header never moves between tabs.
3. D-16 — remedy (a). Wherever the selected stage and the list/queue could sit side by side, they stack up to 887px, and side-by-side starts at 888px. The player itself is slice 3, but slice 2's shell and stage anchor use this breakpoint now.
4. Routing — as above.
He delegated the row-58 mechanism and the pre-player selected state to you (sections 1 and 6 below).

GROUND TRUTH — read it fresh; this prompt's summary is not evidence

Work in your own git worktree, never in Codex's Local mode on /Users/benicheni/Documents/Claude/Projects/Kickoff. That main checkout is Beni's. On 27 Sep 2026 at 16:31 a Local-mode branch switch there committed his uncommitted and untracked files into e26e7e9 and moved the checkout to main. The PM seat pinned that commit as the local branch wip/main-checkout-2026-09-27. Never check out, reset, stash, clean, commit in, or push anything from that checkout or that branch. Record your worktree, HEAD and dirty state, fetch, and create codex/moments-gallery from current origin/main. When this prompt was written, main was 9a91a45: one scheduled sync on top of the slice-1 squash ad9586b.

The tip of branch claude/moments-slice-2-prompt archives this prompt as docs/moments-gallery-implementation-prompt.md. It is a local branch in the shared object store. Cherry-pick that one commit as your branch's first commit. If you cannot reach it, do not recreate it; say so in the PR. PR #114 (cursor/verification-matrix) is unrelated browser tooling. It carries none of your inputs and blocks nothing; leave it alone.

Read in your worktree:
- AGENTS.md
- CLAUDE.md: "Verification discipline", "Release management", "Fergie Time"
- README.md: "Two builders, one repo"
- docs/moments-architecture.md. This is the spec of record for slice ownership, Decision 1 (visit owner above the keyed boundary) and Decision 2 (one unmoving player host). Extend it; never contradict it silently.
- docs/moments-foundation-pass-2.5-executive-brief.md
- docs/v0.2.6-ideas.md rows 56–58 and its "Process notes" tail
- src/App.tsx
- src/components/: MomentsPage.tsx, ViewBoundary.tsx, TabNav.tsx, LensSwitcher.tsx
- src/lib/: moments.ts, momentsQueue.ts, momentsSaved.ts, lens.ts, theme.ts, competitions.ts, time.ts
- src/index.css and index.html
- tests/dom/rig.ts and tests/dom/moments.test.tsx
- tests/moments*.test.ts and tests/fixtures/moments/
- docs/verification/moments-foundation/, the 72-cell checker
- vite.config.ts and the package.json scripts

The three design inputs are not on main and must not enter your branch. Extract them read-only from the local branch wip/main-checkout-2026-09-27 into a scratch directory outside your worktree, for example:
`git archive wip/main-checkout-2026-09-27 docs/design/moments-r3 docs/design/moments-r3-cold-review.md docs/moments-implementation-handoff-2026-09-25.md | tar -x -C "$SCRATCH"`
Never commit them, copy them into your worktree, or push that branch. The PM seat verified the seal from this ref: 56 of 56 OK. The inputs, relative to $SCRATCH:
- docs/moments-implementation-handoff-2026-09-25.md. Its product contract governs. Its opening skill line and its seat routing are superseded.
- docs/design/moments-r3/. Verify it before relying on it:
  - `shasum -a 256 -c REVISION.sha256` reports 56 OK and 0 failed.
  - index.html SHA-256 is c5eb8a4bb5bcffcf8fe3f29ad06831e76f1a92413a31ac2e0dfce666ec80117c.
  - REVISION.sha256 SHA-256 is f6e2cf704f35c8cf4bfe700276a97312f4f60eefe58f50ceb44f7e1853e9a349.
  - Stop on any mismatch.
  - Read review.html, decision-brief.md and evidence-index.md.
  - Never modify the package. Never run its qa.mjs, extra-qa.mjs or seal.py in place.
- docs/design/moments-r3-cold-review.md. This is Claude's independent R3 review. Its §4 findings D-16–D-20, §7 hazards H-A–H-G, §8 improvements and §12 slice-2 acceptance amendments are build inputs.

Precedence is template > design brief > implementation prompt:
- the template is the sealed R3 package;
- the design brief is the 25 Sep handoff as amended by the cold review's §12 and Beni's rulings above;
- the implementation prompt is this prompt.
Record every resolution in the PR body under "Resolutions".

WHAT SLICE 2 IS

This is the architecture's slice 2 row: a stable visit owner, the Matchnight gallery, the three original typographic covers, filters/sort/save, spoiler-light, and empty/no-results states, with scoped lens treatments. Selection is in scope: opening an item makes it active and enters first-open history. The player host, iframe, YouTube adapter, Cinema dialog and playback controls are slice 3.

1. Row 58 first, as its own commit. The session owner sits above the keyed ViewBoundary, so nothing it calls may throw on caller input. Today momentsQueueReducer's `saved` accepts any string, while writeSavedReferences throws on empty or padded IDs. Make the reducer and the persistence layer agree on one shared predicate. An invalid reference must become a reported refusal, not an exception. The mechanism is yours. Add a test that is red against main's code and green after. Record the resolution in place in row 58, the way rows 56–57 carry theirs.

2. MomentsSessionProvider (Decision 1).
- Mount it once in App, above `ViewBoundary key={tab + ':' + lens}`. It is not keyed and not conditionally mounted with Moments. There is no module-level singleton: a StrictMode double mount and two separate app mounts each get an independent visit.
- It owns the momentsQueueReducer state and the saved references. It reads them once, lazily, through readSavedReferences. Every write goes through writeSavedReferences and consumes the returned ids, persistence and reason.
- Leaving the Moments tab dispatches `leave`. A lens change does not.
- A throw inside the Moments route is caught by the existing keyed boundary. Its Retry re-renders the route with the visit intact: history, active item and saved.
- A failure in the owner itself surfaces a safe fallback that says the visit may be lost, and never claims state it does not hold.
- URL semantics are unchanged: ?tab=, ?lens=, back/forward, ?only= and &date=.

3. Edition input.
- The gallery takes its edition from an injected input (a prop or the provider), defaulting to the production MOMENTS.
- Tests and an unshipped development harness feed isolated fixtures under tests/fixtures/moments/. Fictional records carry no real competition or cover identity (D-12). R3's archival samples may appear only as isolated test data.
- Nothing from R3, its fictional lab or the old 18-candidate inventory enters src/curated/moments.json or the production bundle.
- The harness must be absent from `npm run build` and `npm run build:single` output. How you exclude it is yours; state the method and prove it with a grep of both bundles for harness and fixture strings.

4. Inert production path (ruling 1).
- With the production edition empty, the Moments tab's rendered text and structure equal main's: banner copy, "No moments curated yet.", no gallery shell, no Save/filter/sort controls, no new live regions.
- The provider changes nothing visible on any tab.
- Prove this with a DOM test against the empty edition and with receipt 1 below.

5. Matchnight gallery, for a non-empty edition. Build from R3, not from memory.
- Include the lead cover and edition header, the cards and short notes, and the VOICES / SEVEN / TOGETHER original typographic covers with their honesty label.
- Filters.
- Sort: "Beni's order", or Newest by verified fixture chronology with stable editorial ties. Unknown times stay unknown. Never infer order from curation or upload time.
- Shuffle / Undo / "Restore Beni's order" over the reducer.
- Save/unsave and Saved-only.
- Spoiler-light.
- The gallery's empty-edition and no-results states. Their production copy is yours to write (H-E). It must be honest and must not mention Studio, samples or simulation.
- Every fact comes from the authored record and the existing time helpers. Both clocks derive from one UTC instant. The "local time not known" and "Kickoff time not confirmed at curation" fallbacks behave exactly as today. Source attribution stays.
- Opening an item or its source never marks it watched.

6. The selected item before a player exists (delegated).
- Opening an item sets the active item and first-open history and shows the selection. How it shows is yours.
- Slice 3 will measure an in-flow stage anchor element to place MomentsPlayerHost (Decision 2). Build that anchor now:
  - size it by a 16:9 ratio (H-D);
  - stack it with the list up to 887px, and put it beside the list only from 888px;
  - wherever it sits beside the list, it must measure at least 480 × 270.
- Until slice 3 the anchor contains no iframe, no video, no simulated player and no playback wording. The item's action is its source link ("Open at <source> ↗", new tab). No Play button, no progress, no media status.

7. Shell and lenses.
- The header, tabs and lens switcher stay in the 780px container (ruling 2). The Moments gallery region takes its scoped 1160px width only when a non-empty edition renders.
- H-A: express Ledger as the unstyled base with poster: and broadcast: variants, as src/index.css already does. Do not copy R3's Poster-as-base cascade.
- For the 31–47px lead, use the existing tokens and the Oswald the app already loads (Google Fonts, weights 500/600/700, index.html).
- Do not vendor R3's Oswald-Variable.ttf. Add no font request, no colour token and no fourth lens.
- Facts, source lines, capability labels and status messages are string-identical across lenses. Only header scale, density, atmosphere and the lead cover vary, per the 25 Sep lens clarification.
- Take the cold review's §8 on the lead's action row at 360 and the stage-top pill into account.

8. Docs.
- Extend docs/moments-architecture.md with what slice 2 decided: the owner lifecycle, the edition input and harness exclusion, the inert path, the stage anchor and its 888 breakpoint, and the row-58 resolution.
- Rewrite the one [Unreleased] Fixed line so it describes the authored-record contract once (Pass 2.5 finding 8). It must still make no reader-visible claim.
- Add a docs/README.md index row for any new verification receipt you commit.

ACCEPTANCE

IDs are stable: D-01–D-15 come from the 25 Sep handoff, and D-16–D-20 and H-B from the cold review's §12.

- Inert: the empty-edition DOM test passes; receipt 1 reads identical body text on 72 of 72 cells; zero media elements; the header still reads V0.5.2.
- D-02 (UI): Save/unsave never resets order or Undo while Saved-only is off.
- D-03, D-05 and D-10 through the UI:
  - newest sixth → Restore gives 6,1,2,3,4,5 with the editorial label;
  - repeat Shuffle gives an identical order;
  - newest third → Shuffle → Restore gives 4,1,2,3,5,6;
  - a jump from 1 to 5 leaves 2–4 unvisited and reorderable.
- D-04 (amended): measure inside the real app shell. Content started near y = 202.5 at 360/375/390 in the cold review; re-measure it. At 360/375/390 × 844, in all six lens/theme cells, the bottoms of the lead title, source line and primary action are ≤ 844. Report the 360 Broadcast margin as a number (it was 16px in the prototype).
- D-07 (UI):
  - Storage read refusal, write refusal and failed unsave each show visit-only feedback adjacent to the affected control.
  - A selection change clears stale status, and a later successful write clears the warning.
  - The in-modal live region belongs to slice 3.
- D-08: any Previous/Next the gallery exposes comes only from queueNeighbours. Disabled means no named target.
- D-11:
  - Spoiler-light neutralises revealing titles, scope, notes, evidence text and cover motifs.
  - Fixture identity stays visible.
  - The disclosure states precisely what is hidden and what is not, including that the external source page is outside its control.
- D-12: empty and no-results framing is truthful with and without an active item, including an active item excluded by the filter (still reachable).
- D-13: the lens treatments are visibly distinct, and facts and messages are string-equal across lenses. Assert it.
- D-16 (recorded now): the stage anchor stacks at ≤ 887 and sits beside the list only at ≥ 888, where it measures ≥ 480 × 270.
- D-17: after Save/Unsave, on success and on refusal, the pressed control's rect and the primary action's rect are unchanged within ±1px at 360/390/768/1000/1440. Put the feedback in reserved space or on its own row.
- D-18: no doubled terminal punctuation in any status, recovery or queue string for any title. Test titles ending in ".", "?", "!" and a closing quote. Counts use one numeral style.
- D-19: the visible Save label text is contained in its accessible name. The name is stable and state is carried by aria-pressed. Exactly one live region receives each message.
- D-20: no design-content text is under 10px at 360–390, and the cover's "not a match still" disclosure is ≥ 10px.
- H-B: scrollWidth === innerWidth at 1160–1250, and the active tab underline still meets the nav hairline on every tab.
- Owner lifecycle:
  - Tabbing away and back keeps history, active item and saved; so does a lens switch.
  - A thrown error in the Moments route followed by Retry keeps them.
  - StrictMode's double subscribe duplicates nothing.
  - Two mounts are independent.
- The original data-honesty assertions stay unchanged. Change an existing link-only UI assertion only where the empty-edition path does not already keep it true, and name each one you changed.

VERIFICATION

- Run npm run typecheck and npm test green before every commit, and npm run build plus npm run build:single at the end.
- Extend tests/dom/rig.ts; do not reinvent it. It already provides:
  - the app's clock store under fake timers;
  - URL state via replaceState plus a synthetic popstate;
  - StrictMode's double subscribe;
  - a stubbed matchMedia;
  - a localStorage that throws;
  - a contained throw under a boundary.
- Use real keyboard events for the Tab path to the lead action and through the filter, sort and save controls.
- Receipt 1, the inert proof: rerun the docs/verification/moments-foundation/ checker, base (origin/main) against head, at 72 cells (3 lenses × 2 themes × 3 tabs × 360/375/390/1000). Require identical body text, scrollWidth === innerWidth, zero media elements, zero page errors and zero media-provider requests. Report Google Fonts requests separately. PNG identity is advisory; PR #113 proved it run-dependent.
- Receipt 2, the gallery, harness only:
  - Cells: 3 lenses × 2 themes × {gallery, selected, empty edition, no results, spoiler-light, save refused, failed unsave, fictional queue}.
  - Widths: 360/375/390/761/768/800/855/887/888/1000/1100/1160/1250/1440/1920.
  - Per cell:
    - scrollWidth === innerWidth, naming the first overflowing element on a failure;
    - stage-anchor geometry against the list;
    - a hit-test of every card, row and named control;
    - the font-size floor;
    - zero media elements and zero media-provider requests.
- Set the viewport before every capture. Visually inspect every image you cite, and name each one in the PR.
- Say which browser you used and how you drove it. If you use a Playwright copy outside the repo, name it. Add no dependency.
- List what is not verified: physical phones and tablets, Safari and Firefox, screen-reader speech, zoom/reflow beyond what you ran, and all provider behaviour.

HARD LIMITS

- No player, iframe, video or audio element, YouTube adapter, SDK, thumbnail fetch, preconnect or any other media-provider request. No Cinema dialog and no autoplay. Those are slice 3.
- Do not edit src/curated/moments.json, src/data/*.json, .github/, the sync scripts, the meaning of any URL parameter, the Fixtures or Table behaviour, package.json's version, or dependencies. Add no production or development dependency.
- No version bump, CHANGELOG version section, tag, force-push, workflow dispatch, merge or self-review.
- Author every commit as Codex: `git -c user.name="Codex" -c user.email="noreply@openai.com" commit`. typecheck and test must be green at each commit.
- Leave PR #114 and every other PR, branch and worktree alone.
- Do not reopen R3, Beni's 21 Sep rulings 1–8, the 25 Sep adoption or today's four rulings. If an implementation conflict genuinely needs a new ruling, stop only that piece and put it in the PR as a one-word question for Beni. Continue the rest.

PR

Push codex/moments-gallery and open one PR against main titled "Moments slice 2: the gallery, inert until curated". The body carries:
- what a reader sees on the live site (nothing new, with the empty edition) and what the harness shows;
- Beni's four rulings, quoted as his;
- Resolutions: every precedence call, the row-58 mechanism, the pre-player selected state and the harness exclusion;
- an acceptance table (inert, D-02…D-20, H-B, owner lifecycle) with the evidence for each row;
- the exact head SHA;
- both receipts;
- a Not verified list.
Keep it a draft until both receipts are complete, then mark it ready and stop. Pass 1 comes next, and the PM seat writes its brief.

REPORT (your final message)

Give:
- worktree, base and head;
- the commits;
- the files changed;
- test counts;
- both receipt summaries;
- the images you inspected;
- the PR link;
- any questions for Beni;
- Not verified.

# Moments slice 2 — builder verification receipt

The original slice-2 receipt below is preserved at its historical revisions. See
[PR #118 Pass 2 evidence](pass2.md) for the later rebuttal, exact-main DOM probes and
measured classic-scrollbar check; the Pass 2 PR comment records its final head and CI run.

This is implementation evidence for the independent Pass 1 review, not approval or release proof.
Production curation remains `[]`; the live-site reader would see the existing floodlight banner
and “No moments curated yet.” after this foundation lands. The isolated development harness
shows the non-empty gallery, original covers, selected reference, filters, ordering, saved
references, spoiler-light, and refusal/no-results states. There is no player.

## Identity and inputs

- Working checkout: `/Users/benicheni/.codex/worktrees/moments-gallery/Kickoff`, branch `codex/moments-gallery`.
- Fresh fetched base: `9a91a4543e97c692ae239b2c98df3f73fc77eef3` (`origin/main`).
- Tested implementation: `721fb3104b1070aa231bac66337d0fb2474c46da`. The subsequent receipt commit changes documentation/evidence only; the PR body records the final head.
- Initial calling checkout: `/Users/benicheni/.codex/worktrees/f3ab/Kickoff`, detached at that base, with untracked `.codex/`; left intact.
- Archive prompt `f47b888` cherry-picked first with Codex authorship as `4e8d2ad`; row 58 is separate commit `52f8e51`.
- Design inputs extracted read-only from `wip/main-checkout-2026-09-27` into `/tmp/kickoff-moments-inputs.qxAdt8`. No main-checkout operations or copied sealed inputs in this worktree.
- R3 seal: **56 OK, 0 failed**. `index.html` SHA-256 `c5eb8a4bb5bcffcf8fe3f29ad06831e76f1a92413a31ac2e0dfce666ec80117c`; `REVISION.sha256` SHA-256 `f6e2cf704f35c8cf4bfe700276a97312f4f60eefe58f50ceb44f7e1853e9a349`.

## Unit/DOM/build checks

Typecheck and the entire suite passed before each commit: 598 tests / 45 files at the prompt
archive, 599 / 45 at row 58, and **620 / 47** at the gallery implementation and receipt commit.
Row 58's focused suite was run before the fix: **2 failed, 9 passed**; the new no-throw refusal
assertion was red against main. The shared predicate now rejects empty/padded references in
both reducer and persistence. Persistence reports `visit-only / invalid-data` with the valid
subset and makes no storage write, instead of throwing.

`npm run build` and `npm run build:single` passed. Vite's large-chunk warning remains; this is
not a bundle-size optimization. [Build SHA-256 identities](build-sha256.json) identify the
served standard build and the standalone output.

Harness exclusion is structural: `tests/harness/moments.html` is a separate Vite **development**
entry, importing test-only fixture records; neither production entry imports it. Both production
builds contain only their ordinary entry/assets/favicons. This command returned no matches
in either build:

```sh
rg -n 'Moments gallery verification harness|Fictional selection|pkEpLtePJm0|iBuTEywEQ6U|sXAkBsEcXSo|tests/harness|Contained Moments harness|Fictional queue example' dist dist-single
```

Existing data-honesty assertions were not weakened. Exactly two old populated UI assertions in
`tests/dom/moments.test.tsx` changed with the new non-empty view:

1. `renders only populated categories in their fixed order and uses the curation stamp` now checks authored edition order, category filtering and the selected record's curation stamp.
2. `keeps the credited still in its frame and the solid link outside, with no playback` now checks original labelled art, no remote images, the same external source link and unchanged clock facts.

The existing empty-edition, time, fixture, URL and pure data-honesty assertions remain intact.

## Browser and execution

Google Chrome **154.0.8037.58**, headless Chromium driver, device scale 1, reduced-motion
preference, real browser keyboard `Tab`/`Enter`/`Space`. No dependency was added. Existing runtime:

- Playwright: `/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs`
- Chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`

The in-app Browser also displayed the actual harness at 360 × 844 for an initial smoke check.
The receipts below come from the explicit Chrome runner. Each capture sets its viewport first
and waits for fonts. Only loopback and existing Google Fonts requests are allowed; provider
attempts are counted even if blocked. Network silence here means **zero media-provider requests**,
not zero Google Fonts requests.

## Receipt 1 — inert production path

The unchanged [foundation checker](../moments-foundation/check-browser.mjs) compared a fresh
base build served at `http://127.0.0.1:8853` with the head standard build at `http://127.0.0.1:8854`.
It used a fixed clock of `2026-09-27T02:40:00Z` and 72 comparisons:
3 lenses × 2 themes × 3 tabs × widths 360/375/390/1000.

[Machine receipt](inert-receipt.json): **72/72 identical body-text hashes**, 144/144 rendered
pages without overflow or media elements, zero page errors, zero media-provider requests,
V0.5.2 retained. Google Fonts: **317 base + 317 head = 634 requests**.

First-pass PNG hashes matched **68/72**. The four differing cells were
`360-ledger-light-moments`, `360-poster-light-table`, `390-poster-light-table`, and
`390-broadcast-light-fixtures`. [Two fresh-context recaptures per build](inert-recaptures.json)
matched all four hashes for the first three cells. The final cell matched base on the second
head recapture; the first head recapture still differed. Thus every cell produced a matching
base/head PNG, but PNG identity remains run-dependent. The
[inspected comparison sheet](images/inert-recapture-comparison.png) shows the first 844px of
the first recapture pairs; body text is the required gate, PNG identity advisory.

## Receipt 2 — injected gallery

[Machine receipt](gallery-receipt.json), [rerunnable checker](check-gallery.mjs): **720/720 cells**.
3 lenses × 2 themes × gallery / selected / empty / no-results / spoiler-light / save-refused /
failed-unsave / fictional queue × widths **360/375/390/761/768/800/855/887/888/1000/1100/1160/1250/1440/1920**.
Phone captures are 844px high; widths 761–888 use 1024px, larger widths use 900px.

- Zero horizontal overflow, zero media elements, zero page errors, zero media-provider or unexpected remote requests. **3,124 Google Fonts requests**, no failed requests.
- **16,830 card/row/control targets**, each hit-tested at three horizontal points. All passed after opening disclosures and scrolling each target into view.
- Stage ratio 16:9 in every selected/fictional cell. Stacked through 887px, side by side from 888px. Smallest side-by-side anchor: **520 × 292.5px**.
- Gallery content starts at **y=202.5** on 360/375/390. Lead title, source and primary action bottoms are ≤844 in all 18 phone gallery cells. At 360 Broadcast, both themes: action bottom **779.109375px**, margin **64.890625px**.
- New gallery design text, including cover disclosure, is ≥10px. The unchanged empty-edition banner deliberately retains main's 9.5px under the higher-priority inert ruling.
- **115 additional checks:** 60 D-17/D-19 combinations (5 widths × 3 lenses × 2 themes × gallery/selected, four save/unsave success/refusal presses each = **240 presses**), one real keyboard route, and 54 H-B tab/header comparisons (1160/1200/1250 × 3 × 2 × 3 tabs).
- Save and primary-action viewport rects stay within ±1px; Save's visible label is in its stable accessible name, state uses `aria-pressed`, and exactly one nonempty live region receives feedback. Header/nav geometry stays fixed between tabs; active underline meets the hairline.

The automated matrix measures the final implementation. An exploratory run stopped after the
720 cells and save/keyboard checks because its H-B probe assumed Fixtures had a `main` element.
That checker assumption was corrected; the final run linked above completed all 115 checks.
No product assertion was relaxed.

## Acceptance mapping

| ID | Evidence and scope |
|---|---|
| Inert | Exact empty DOM assertion; receipt 1 72/72 text; V0.5.2; zero media; no controls or live regions in empty main. |
| D-01 | Existing pure queue advance/backtrack/Undo tests retained; UI jump/Undo preserves first-open history. Completion/player integration stays slice 3. |
| D-02 | DOM save/unsave controls preserve remainder, history and Undo with Saved-only off. |
| D-03 | DOM Newest sixth → Restore asserts 6,1,2,3,4,5 and editorial label. |
| D-04 | All 18 phone lens/theme/width cells within first 844px; Broadcast 360 margin 64.890625px. |
| D-05 | DOM repeat Shuffle asserts identical order and Undo. Existing seeded-reducer tests retained. |
| D-06 | Anchor/list geometry and every row hit-test pass. Actual player containment is slice 3, not claimed. |
| D-07 | DOM actual storage read refusal, write refusal, failed unsave, selection-clear and later successful-write clear; browser refusal captures and 240 stable presses. Modal feedback is slice 3. |
| D-08 | DOM disabled neighbours have no named destination; UI gets neighbours solely from queueNeighbours. |
| D-09 | Selected record shows its authored source evidence; existing source evidence/reducer tests remain. Provider failure/recovery integration is slice 3. |
| D-10 | DOM newest third → Shuffle → Restore gives 4,1,2,3,5,6; jump 1→5 leaves 2–4 unvisited and reorderable. |
| D-11 | DOM title/scope/note/evidence/cover neutralization, including revealing category; fixture/source identity and precise disclosure preserved; inspected spoiler screenshot. |
| D-12 | Empty and no-results browser cells; DOM both active and no-active branches; filtered-out active stays reachable; fictional records have no real fixture/competition/source/cover identity. |
| D-13 | DOM exact main-text equality through all lenses; visibly distinct inspected Ledger/Poster/Broadcast captures. |
| D-14 | DOM tab/lens/back/forward route state, contained throw/Retry and saved state; retained pure media-state semantics. Real playback round-trip is slice 3. |
| D-15 | Phone Cinema does not exist in this slice. Lower-row/player/focus integration remains slice 3. |
| D-16 | Matrix includes 761/768/800/855/887/888; 16:9 stack/side assertions and ≥480×270; inspected 887/888 pair. |
| D-17 | 60 browser combinations, 240 success/refusal save/unsave presses; both rects within ±1px. |
| D-18 | DOM titles ending in period, question mark, exclamation mark and closing quote; no punctuation appended to titles; one decimal numeral style. |
| D-19 | Stable Save name containing visible label, `aria-pressed` state, one receiving live region in DOM/browser checks. |
| D-20 | Font floor measured on all non-empty gallery cells; cover disclosure ≥10px. Inert banner exception explained above. |
| H-B | 54 checks across 1160/1200/1250, every lens/theme/tab; no overflow, unchanged header rect, underline/hairline meets. |
| Owner lifecycle | DOM tab leave exactly once; lens does not leave; history/active/saved survive route Retry and URL navigation; StrictMode no duplicate history/write; independent mounts; honest owner-failure fallback. |

## Rerun

Use existing installed dependencies; do not add a Playwright package to the project. Build the
base from an isolated snapshot and head with ordinary `npm run build`, serve their `dist`
directories on the ports above, and serve head Vite on port 8852. Then:

```sh
node docs/verification/moments-foundation/check-browser.mjs \
  /Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs \
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  http://127.0.0.1:8853 http://127.0.0.1:8854 /tmp/moments-inert-rerun
node docs/verification/moments-gallery/check-gallery.mjs \
  /Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs \
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  http://127.0.0.1:8852 /tmp/moments-gallery-rerun
```

## Inspected images

Each linked image was visually inspected by the builder, after its viewport was explicitly set.
The full 720-cell run is automated geometry/network evidence; it is not a claim that 720
screenshots were individually inspected.

- [360-broadcast-dark-gallery.png](images/360-broadcast-dark-gallery.png)
- [390-ledger-light-gallery.png](images/390-ledger-light-gallery.png)
- [390-poster-light-gallery.png](images/390-poster-light-gallery.png)
- [390-poster-light-empty.png](images/390-poster-light-empty.png)
- [390-poster-light-no-results.png](images/390-poster-light-no-results.png)
- [390-poster-light-spoiler-light.png](images/390-poster-light-spoiler-light.png)
- [390-poster-light-save-refused.png](images/390-poster-light-save-refused.png)
- [768-broadcast-dark-selected.png](images/768-broadcast-dark-selected.png)
- [887-poster-light-selected.png](images/887-poster-light-selected.png)
- [888-poster-light-selected.png](images/888-poster-light-selected.png)
- [1000-ledger-light-fictional.png](images/1000-ledger-light-fictional.png)
- [1000-poster-light-failed-unsave.png](images/1000-poster-light-failed-unsave.png)
- [1440-broadcast-dark-selected.png](images/1440-broadcast-dark-selected.png)
- [inert-recapture-comparison.png](images/inert-recapture-comparison.png)

## Not verified

Physical phones and tablets; Safari and Firefox; screen-reader speech; browser zoom/reflow
beyond the viewport sizes above; all media-provider behaviour, current availability, rights,
embeds or playback; Cinema/modal focus and slice-3 player integration; production deployment
or a release. Automated accessibility-name/live-region assertions do not prove spoken output.
Pass 1 independent review and Beni's adjudication/merge remain outstanding. No question for
Beni arose from this implementation.

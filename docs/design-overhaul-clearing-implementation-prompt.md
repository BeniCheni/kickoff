# Kickoff — the clearing: Broadcast, Where to Watch and Monthly removed (Codex build prompt, 14 Nov 2026)

*Written 14 Nov 2026 by the session that directed the design overhaul, from a fresh read of
`origin/main` at `ddd9a37`. Ladder rung 3 for the clearing, which ships before the overhaul (D3).
Routed to Codex per this proposal's "Who fires what" table; the review is Claude Code's
`/kickoff-pr-review`. Archive copy; the delivery was the fenced block in chat, per the ladder's
rule.*

---

You are building one change in this repository, github.com/BeniCheni/kickoff. Read `CLAUDE.md`
and `AGENTS.md` first; they bind you. Treat the repository as ground truth and this prompt as a
map of it. This prompt was written from a read of `origin/main` at `ddd9a37` (13 Nov 2026),
where `package.json` is 0.5.3, the latest tag is `v0.5.3` and `CHANGELOG.md`'s `[Unreleased]`
is empty. Where the repository and this prompt disagree, the repository wins: say so in the PR
and carry on.

## What Beni ruled

- 11 Nov 2026: three removals. The Broadcast lens goes, and the lens switch reads Poster, then
  Ledger, in that order. Where to Watch is removed completely, interface and data. The Monthly
  view goes.
- 13 Nov 2026 (ruling D3): the clearing ships first and on its own, before the Next.js cutover
  (N7) and before the design overhaul. No version number is chosen. Do not change
  `package.json`, `package-lock.json`, the README's version badge or its "What it does"
  heading, and tag nothing. The number, the merge and the release are Beni's.
- The design overhaul is not this change. Add no new look, token, font, photograph or motion.
  Remove, and re-plumb only what a removal forces.

## What goes, as found at `ddd9a37`

Counts are files that contain the term. Re-derive them with your own grep before you start, and
put the inventory you found in the PR.

Broadcast. `src/lib/lens.ts` (`LENSES`, `parseLens`), `src/lib/theme.ts` and
`src/lib/useThemeController.ts` (Broadcast's own theme memory under `kickoff-theme-broadcast`,
dark by default), `src/lib/lensSelectors.ts` (`tickerSegments`, `TickerSegment`),
`src/shell.css` (`@custom-variant broadcast`, the `[data-lens='broadcast']` blocks, `--glow`),
`src/index.css` (every `@variant broadcast`), `src/App.tsx` and `src/offline.tsx` (the
`TickerStrip` mount), `src/components/TickerStrip.tsx` (delete), `LensSwitcher.tsx`, the
`broadcast:` classes in `FixtureRow.tsx` and `LedgerWeek.tsx`, and comments in `WeekView.tsx`,
`TabNav.tsx` and `FixturesPage.tsx`. In `web/`: the `TickerStrip` mount in `web/app/shell.tsx`,
`web/src-allowlist.mjs`, the `@source` lines in `web/app/globals.css`,
`web/scripts/check-css.mjs`, and the file list in `web/README.md`.

Monthly. `src/components/MonthView.tsx` (delete); in `FixturesPage.tsx` the Weekly / Monthly
pair, the month anchor and the `view` state; `CalendarView`, `encodeView` and `parseView` in
`src/lib/urlCodecs.ts`; `monthCellSummary` in `lensSelectors.ts`; `addMonths` in
`src/lib/time.ts`, which has no other user. In `web/`: the allowlist, `globals.css`,
`check-css.mjs` and `web/README.md`.

Where to Watch. `src/components/WatchPanel.tsx` (delete) and its mount in `FixturesPage.tsx`;
the dashed 📺 TV pill and its NEW badge at the foot of `FixtureRow.tsx`'s expanded row; `tv` on
all 14 competitions, `tvNew` on four, and both members of the competition type in
`src/lib/competitions.ts`. In `web/`: the allowlist, `globals.css`, `check-css.mjs` and
`web/README.md`. No generated file carries a broadcast field, so the sync and the snapshot do
not change.

Tests. 16 files under `tests/` and 2 under `web/test/` (`fixtures-table.test.tsx`,
`moments-watch.test.tsx`) name Broadcast or its ticker; 5 name the month view; none name Where
to Watch.

## Decisions already made

Keep these unless the diff proves one wrong; if it does, say which and why in the PR.

1. `LENSES` becomes `['poster', 'ledger']`, in that order: the switch reads Poster, then
   Ledger, and its arrow-key, Home and End contract follows that order. Poster stays the
   default and stays out of the URL. Rewrite `lens.ts`'s header comment, which describes three
   lenses as a loudness gradient.
2. Old links land somewhere honest. `?lens=broadcast` decodes to Poster and `canonicalSearch`
   removes it. A `view` parameter of any value is removed on load, so no address describes a
   view that is not shown.
3. One theme memory, `kickoff-theme`, for every lens. `kickoff-theme-broadcast` is never read
   or written again; do not delete it from anyone's storage. The theme bootstrap
   (`scripts/themeBootstrap.ts`, `scripts/write-theme-head.ts`) stays in step with `theme.ts`,
   so the first paint never flashes the wrong theme in either app.
4. Keep `hotFixtureIds`, `nextMatchdaySelection` and the `data-hot` attribute. Their visible
   consumer, the glow, goes, but the overhaul wants a NEXT marker in the same place. Remove
   `tickerSegments` and `TickerSegment`.
5. `FixtureRow`'s local `marquee` (the rail on European and supercup rows) is not the Broadcast
   marquee; keep it. Remove only the `broadcast:` classes and the TV pill. The row's expansion
   stays as it is, with its clock pills.
6. Leave these alone. The raw ESPN files under `tests/fixtures/`, where "broadcast" is ESPN's
   own field. `docs/` and every receipt under `web/verification/`, which are history.
   `studio/`, which has its own tokens. The proof scripts that CI does not run
   (`scripts/n6a-proof.mjs`, and in `web/scripts/` the `n3-*`, `n4*`, `shell-matrix`,
   `theme-filmstrip`, `vite-before-after` and `moments-css` scripts): do not edit them, and
   list in the PR each one that names a removed lens or view, so N7's plan can drop or update
   it.
7. Text that describes the current app changes with it. In `README.md`: "three lenses" becomes
   two; the Broadcast screenshot leaves the gallery (its file stays in `docs/`); the URL
   example `?lens=broadcast&tab=table` changes; the Lineage list stays as history. In
   `CLAUDE.md`, the verification bullet's "or the marquee" goes. The review skill under
   `.claude/skills/kickoff-pr-review/` (`SKILL.md`, `browser-matrix.md`, `pr-comment.md`) gets
   two lenses and one theme key. The Codex skills under `.agents/skills/` get the same wherever
   they describe the current lens set.
8. `CHANGELOG.md`: under `[Unreleased]`, a `### Removed` list (the heading this file has used
   twice before) and a `### Deliberately not done` list. Write no release subject line and no
   date; those come at release.

## Contracts that must not move

- The betting pipeline's Step 0 reads `http://localhost:5173/` with `?only=` and `&date=`. Both
  keep working exactly as they do, and so does `&lens=ledger`, which the overhaul will later
  make Step 0's default.
- No generated file changes: `src/data/fixtures.json`, `src/data/meta.json`,
  `src/data/standings.json`, and the sync scripts.
- Data honesty: no test assertion on a surviving surface is weakened. A test that exercises
  only a removed surface may be removed; list each removed file or case in the PR with the
  surface it covered.
- The two apps stay equivalent. The Next shell in `web/` imports `src/` through the allowlist,
  so every removal lands in both, and the parity landmarks the preview smoke checks at `/`,
  `/?tab=table` and `/?tab=moments` still hold.
- Moments is untouched, apart from removing a Broadcast reference from its tests or CSS.

## Verification

- Green at every commit, at the root: `npm run typecheck`, `npm test` (both vitest projects),
  `npm run build`, `npm run build:offline`, and the offline-bundle scan CI runs. In `web/`:
  `npm run typecheck`, `npm test`, `npm run build`, `npm run check:client`, `npm run
  check:css`.
- Tests that pin the new contracts: `?lens=broadcast` gives Poster with the parameter removed;
  `?view=month` is removed; `canonicalSearch` leaves `only` and `date` alone; the switch
  renders exactly Poster then Ledger, and its keys follow that order; neither app renders
  `data-lens='broadcast'`, the ticker, the watch panel, a 📺 or a Weekly / Monthly control;
  there is one theme key.
- A last grep, pasted into the PR: no `broadcast` in `src/`, `web/app/`, `web/test/` or
  `tests/` outside `tests/fixtures/`, and no `MonthView`, `monthCellSummary`, `addMonths`,
  `WatchPanel`, `tvNew` or 📺 anywhere in those paths.
- The browser matrix from `CLAUDE.md`: Poster and Ledger, light and dark, Fixtures, Table and
  Moments, at 360, 375, 390 and about 1000 px. Set the viewport before every capture, and check
  `document.documentElement.scrollWidth === window.innerWidth` on every one. Also open
  `?lens=broadcast` and `?view=month` cold and show where they land. `web/` already has
  `puppeteer-core` and drives the Mac's Chrome through `CHROME_PATH`. If you cannot drive a
  browser, say so plainly in the PR and do not claim the matrix.
- Measure what the clearing buys. At 390 on `?date=2026-11-21`, record the top of the first
  fixture row in Poster and in Ledger, before and after. The proposal measured 856 px and 740
  px before, with the viewport ending at 844.

## The PR

- Branch `codex/clearing` off `origin/main`; commit as `Codex <noreply@openai.com>`. Small
  commits that each stay green, in this order: Where to Watch, Monthly, Broadcast, then the
  docs.
- Title: "The clearing: Broadcast, Where to Watch and Monthly removed". The body gives the
  rulings, the inventory as you found it, each decision above and any you changed, the tests
  removed or rewritten, the proof scripts left as history, the before and after measures, the
  browser matrix result, and one line: "Version: none chosen. Beni numbers, merges and
  releases."
- Do not merge, do not enable auto-merge, do not bump and do not tag. A Claude Code session
  reviews it cross-vendor with `/kickoff-pr-review`.

## Deliberately not in this change

The second edition's look, tokens, type, photographs and motion, which follow N7. The Rack, the
covers and the NEXT pill. Any change to Moments beyond a removed reference. Step 0's move to
`&lens=ledger`, which lands with the overhaul. The Fergie Time design system's own files, which
stay local and are never committed. `docs/` history.

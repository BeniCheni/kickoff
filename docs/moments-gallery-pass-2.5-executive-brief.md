## Executive Summary Brief — PR #118 · Pass 2.5 · Mon 28 Sep 2026 (Brooklyn)

Pass 2.5 of the six-pass 360 for "Moments slice 2: the gallery, inert until curated" (PR #118).
Seat: the PM seat, a Claude Code session on Opus 5.5 Extra, working by hand from
`/kickoff-pr-review 118 --pass 2.5`. Every number below comes from a command run in this
session at the SHA named. A number lifted from a PR comment is labelled as that vendor's claim.

**Decision: merge.** Beni delegated Pass 3 to this seat on 28 Sep 2026, in chat: "Since #118
ain't a release, you can merge it autonomously once you're satisfied with the Pass 2.5
completion, and you can act on my behalf to execute Pass 3." Codex's handoff asked for "no
automatic merge"; Beni's direct instruction supersedes that. The Pass 2.5 gate is satisfied at
`d5993a0`, and it is re-checked at the tip that carries this brief:

| Gate clause | State |
|---|---|
| Not a release | Holds: `package.json` 0.5.2, `[Unreleased]` lines only, no tag |
| No numbering fork | Holds |
| No high finding | Holds: none were raised |
| Nothing left contested | Every contest below is settled by evidence |
| `verify` green | Holds: run `36491865441` at `d5993a0` |
| Step 0 surfaces untouched | Holds: no change to `?only=`/`&date=`, `sync.yml` or `src/data/` |

### What ships

- **Nothing a reader of the live site can see.** With `src/curated/moments.json` at `[]`, the
  Moments tab renders main's banner and "No moments curated yet." exactly, and Fixtures and
  Table are unchanged.
- **The Matchnight gallery, ready but dormant.** It has original typographic covers, filters,
  sort, Shuffle/Undo/Restore, a saved list, spoiler-light, and empty and no-results states. A
  16:9 stage slot for the future player stacks through 887px and sits beside the list from 888px.
- **A visit owner** that keeps Moments state across tab and lens changes. If it fails, it can
  now take down only the Moments tab, never the header, Fixtures or Table.
- **Saved references refuse bad IDs instead of throwing** (row 58).
- The authored contract gains `editorial.cover` (`voices` | `seven` | `together`).

### Where it sits

Not a release: the app stays **v0.5.2**. Moments becomes a minor release when a reader can use
it, and the number is Beni's. What's left before a candidate exists:
- **Slice 3**: the player host, the YouTube adapter and Cinema. Cursor/Grok 4.7 builds it, per
  Beni's 28 Sep ruling. Its plan is scored, and its rulings are recorded: the phone player
  grows to 200px, and seven defaults were accepted.
- **Slice 4**: integration, one narrowly authorised real-YouTube test, and a first-edition
  proposal, which needs Beni's publication decision.

### What the 360 found

| # | Pass 1 (Claude) | Pass 2 (Codex) | Pass 2.5 corroboration |
|---|---|---|---|
| 1 | Medium: the owner wrapped the whole shell, so an owner throw took the header, Fixtures and Table down. Fixed in `34e0b82`. | Accept, but contest the characterisation. Storage is guarded but the whole initializer is not; purity is no no-throw proof. | **Corroborated.** The head's test, run against `704581c`, fails 1 of 19; it passes at the tip. The initializer calls `edition.map` unguarded. Production is safe only because `MOMENTS` is validated at module import, before React mounts. Medium stands, and Codex's reasoning is the more precise one. |
| 2 | Low: `editorial.cover` was missing from the contract list. Fixed in `34e0b82`. | Accept | **Corroborated** by the schema and its test. |
| 3 | No CHANGELOG line: the fix is dormant with `[]`. | Contest; added a line in `d5993a0` | **Codex's position holds.** The skill's §5 puts a behavioural fix in a non-release PR under `[Unreleased]`. The line claims no visible feature. |
| 4a | Classic-scrollbar overflow ruled out by arithmetic, not measurement | Accept; measured 96/96 | **Corroborated**: 96/96 at the tip, a 15px native scrollbar, a minimum gutter of 12.5px, no overflow. |
| 4b | PNG 70/72 first capture, run-dependent | Accept; its run read 72/72 | **Corroborated**: 72/72 text and 72/72 PNG here. Text stays the gate. |
| 4c | App test seams ship in the bundle | Accept | **Corroborated**: `main.tsx` passes no props; harness markers are absent. |
| 59 | Dead Brooklyn date, "unreachable: historical `full_time` only" | Accept, but contest the reasoning; wording corrected | **Codex holds.** `momentFixtureSchema` picks the sync `status` enum (postponed and cancelled included), and `category` is an independent enum, so a pre-match record can carry either. Dormant only because production is `[]`. A slice-4 eligibility-checklist item. |
| 60, 61 | Constant shuffle seed; a read refusal then a write replaces the stored set | Accept, reproduced | Rows kept; neither is a defect of this PR. |

Pass 2 added no production source. Nothing remains contested.

### Verification as re-run (this pass, at `d5993a0` unless stated)

- **Unit and diff.** `npm run typecheck` is clean. `npm test` gives **621 tests in 47 files**.
  `git diff --check` is clean. The PR diff against `origin/main` is **52 files, +2501 / −83**,
  with nothing under `src/data`, `src/curated`, `.github`, `package*.json` or the URL codecs.
  Since `0e462ae`, zero files changed under `src`, `tests`, `index.html`, `vite.config.ts`,
  `package*.json` or `tsconfig*`.
- **Builds.** `dist/assets/index-BF-5Zxl7.js` hashes `b985d089…`, `dist/index.html` hashes
  `6f7d0064…` and `dist-single/index.html` hashes `4120ca10…`. These are byte-for-byte what
  Pass 1 and Pass 2 recorded, from build inputs identical to `0e462ae`.
- **Harness exclusion.** Zero hits in either bundle for the harness title, `tests/harness`,
  `data-harness-tools`, "Fictional selection", the three archival video IDs, "simulated",
  `youtube-nocookie` or `<iframe`.
- **Finding 1 red.** The head's `tests/dom/momentsGallery.test.tsx` against a `git archive`
  of `704581c` gives **1 failed / 18 passed**. It is green at the tip, inside the 621.
- **Codex's 38-probe replay** (`pass2-reproduce.mjs HEAD 9a91a45`, fresh scratch
  directory). All six shared components are byte-identical to main, the scratch typecheck is
  clean, and **38/38 pass**. The 38 are:
  - 18 whole-shell outerHTML comparisons against main;
  - 12 Fixtures/Table error-path comparisons;
  - one shared-shell throw;
  - owner-loss/Retry honesty;
  - rows 59, 60 and 61.
- **Inert receipt.** The foundation checker compared fresh builds of the merge base `9a91a45`
  (`index-BCla-JkF.js`) and the tip, on Chrome 154.0.8037.58: **72/72 identical text, 72/72
  identical first-capture PNGs**, zero provider requests, zero errors, 634 Google Fonts requests.
- **Classic scrollbars** (`pass2-scrollbars.mjs`, dev server on this worktree): **96/96**
  cells, a 15px gutter, a minimum gallery margin of 12.5px, zero errors or unexpected requests.
- **Gallery receipt** (`check-gallery.mjs`, same dev server): **720/720 cells**, 115
  interactions, 13 captures, **16,830 hit targets**, zero provider requests, zero errors,
  3,124 Google Fonts requests. The 360 Broadcast lead-action bottom is at 779.109375 (a
  **64.89px** margin). The smallest side-by-side anchor is **520px** wide.
- **Pane, with my own eyes** (viewport set first). At 390 × 844, Poster light Moments shows the
  header `V0.5.2 · 1496 FIXTURES`, the inert banner and sentence, zero media and
  `scrollWidth` 390. Broadcast Fixtures at 390, dark Table at 1000 and Ledger Moments at 1000
  each render their content with no alert and `scrollWidth === innerWidth`.
- **`verify`** is green at `d5993a0`, run `36491865441`, `headSha` confirmed.
- **Not re-run:** the Pass 1 contrast audit (no CSS or source changed since); physical devices;
  Safari and Firefox; screen-reader speech; any provider behaviour; zoom and reflow.

### Risks and accepted costs

- **The visit owner now lives inside the 780px shell.** Slice 3's Cinema must make background
  subtrees inert individually, never the shell, `#root` or any ancestor of the dialog.
  `docs/moments-architecture.md` (Decision 2, Pass 2 clarification) records this, and the
  slice-3 build prompt carries it.
- **Row 59 becomes live the day a postponed or cancelled fixture is curated.** The slice-4
  first-edition checklist should reject such records, or handle them.
- **The App test seams** (`momentsEdition`, `momentsStorage`, `momentsRoute`) ship in the
  bundle. They are React props that production never passes.
- **Step 0 exposure: none.** The Fixtures/Table DOM and error paths are byte-identical to
  main's (38 probes). `?only=`/`&date=` are untouched. The merge redeploys Pages with an
  identical visible surface.

### Handed to the next patch

- `docs/v0.2.6-ideas.md` rows 59, 60 and 61, as deferred XS items.
- For the `/kickoff-pr-review` method: Pass 1's retro notes that §4 assumes the pane, and that
  the dev-server hazards (IPv6-only, HMR aborts) are missing from `browser-matrix.md`. Also,
  the CHANGELOG rule for a fix on an unreachable path is now settled by this cycle: record it
  under `[Unreleased]` without a visible claim.

### Questions for the CEO

None block this merge. Still open from earlier: the five SDLC rulings asked at PR #113's Round
3, and whether to restore the old uncommitted work pinned on `wip/main-checkout-2026-09-27`.

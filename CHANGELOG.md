# Changelog

All notable changes to Kickoff. The format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow
[semver](https://semver.org/). The doc-cycle names in `docs/` and release versions can
diverge (the v0.1.0 release shipped from the v0.0.3 doc cycle) — this file tracks
releases.

## [Unreleased]

## [0.2.1] — 2026-09-03

The review becomes a command: the adversarial pass that hardened v0.1.0 and v0.2.0 is now a
repo skill, the sync PR's held check approves itself, and how a release gets scoped is written
down. Paper trail: `docs/v0.2.1-proposal.md`, which also plans the rest of the v0.2.x train
and the v0.3.0 minor.

### Added
- **`/beni-pr-review`** (`.claude/skills/beni-pr-review/`): prompt-ladder step 4 as a command
  instead of a prompt retyped per release. Read order and precedence, a real-numbers baseline,
  hunt classes chosen by what the diff touches, a browser pass scoped to the diff (the full
  360/375/390/~1000 matrix when `src/` or `index.css` moved, a smoke pass for docs and
  tooling), the fix policy, the one-comment shape, the sealed appendix. It forbids
  `npm run sync` during a review — a data refresh is not a release. This release's own review
  was its first live run.
- `CLAUDE.md`'s "Release management" section: the four sources that together say what has
  shipped, patch vs minor as this repo has actually used them, the CHANGELOG as a product
  surface, and the rule that numbering forks go to Beni. Written by the PM session; five of its
  claims were corrected in the same release (Changed, below).
- The release plan for the whole train — three patches, then v0.3.0 — with every open ideas
  row either in a named release or deferred with a reason, in the proposal.
- The two `docs/v0.2.x-*` prompt archives that scoped this train.

### Changed
- `CLAUDE.md`: the version string lives in seven places, not four; ideas rows are renumbered
  across files, so name the file when citing one; "Deliberately not done" is the convention
  from v0.2.0 on, not "every section so far"; the browser matrix is 360/375/390/~1000 and is
  scoped to whether `src/` changed. README's roadmap pointer now names `docs/v0.3.0-ideas.md`,
  the current list — it had gone stale in the squash that created it.
- `docs/v0.3.0-ideas.md` row 2 no longer cites the dispatched `verify` check PR #11 removed.

### Fixed
- The scheduled sync's PR could not be merged unattended: its `verify` check was held for
  approval (github-actions[bot] is not a collaborator), and the `workflow_dispatch` check the
  workflow requested never counted in the merge box. `sync.yml` now approves the held run
  itself through the Actions API after opening or updating the PR — proved hands-off on PR #9,
  and again on PR #12 from the first real scheduled run. The dispatch step is gone; `ci.yml`
  keeps `workflow_dispatch` for manual runs. This answers the v0.2.0 proposal's residual
  unknown; PR #10's ordering theory was wrong and is retracted.
- `sync.yml`'s permissions comment still explained `actions: write` by that deleted dispatch
  step; it now names the approve call the permission actually serves.

### Deliberately not done
- The inert `Default` ruleset (`docs/v0.3.0-ideas.md` row 13) is a repository setting, not a
  file, and it must be *deleted* rather than aimed at `main` — it would forbid every merge.
  Beni's click, not a PR.
- `[0.2.0]`'s "ci.yml gains `workflow_dispatch` so the bot's PR receives its required check"
  stays as written: true for what 0.2.0 shipped, superseded above.
- No app behaviour. Rows 6, 7, 8, 12, 13 and one third of 11 wait for v0.2.3, behind the jsdom
  rig (v0.2.2); rows 3, 4, 10 and the rest of 11 wait for a design cycle; row 9 for a v0.3.x
  patch. Each reason is in the proposal.

## [0.2.0] — 2026-09-02

The app's relationship to time: a clock that ticks, a source that refuses to guess, and a
refresh that runs itself but never merges itself. Paper trail: `docs/v0.2.0-proposal.md`.

### Added
- **A clock that ticks.** `useNow()` over a minute-aligned clock store (`src/lib/clock.ts`,
  `useSyncExternalStore`, no prop threading). Every "now" and "today" in the app moves on its
  own — the Today pill, the Next-up labels, the ticker's NEXT, the Broadcast glow, the
  staleness banner's 24h → 72h escalation, the Table's "next" column and freshness line — and
  a suspended tab catches up in one tick when it wakes. An unpinned fixtures view follows
  midnight into the new day (and the new week); a `?date=` pin stays where it was put.
- **A scheduled sync.** `.github/workflows/sync.yml` runs `npm run sync` twice a day (midnight
  and noon Brooklyn time),
  verifies the written snapshot, and opens or updates one rolling pull request
  (`sync/scheduled` → `main`) carrying the diff report and a reviewer checklist. It never
  pushes to `main` and never merges its own PR. `workflow_dispatch` with a `dry_run` input
  tests it without waiting for the cron; `ci.yml` gains `workflow_dispatch` so the bot's PR
  receives its required `verify` check. No secrets, no PAT.
- **A sync that fails loudly.** An ESPN status the mapper doesn't know (or a missing one), a
  chunk at ESPN's 100-event cap, and a league that comes back under half its previous
  in-window count each abort with exit 2 before anything is written — an unattended job must
  not invent scheduledness or quietly disappear a league. Extra-time and penalty finals stay
  unmapped on purpose: ESPN's score after extra time is not the 90-minute result the books
  settle on.

### Changed
- `tableFor` takes `today` as a parameter — the one pure-layer function that had been reading
  the clock itself. The ESPN cap warning is now a hard failure rather than a `console.warn`,
  and so is a fetched row the schema rejects (the review's find).
- From the review: the workflow commits only when `npm run sync`'s closing `report:` line says
  a fixture or a standings row changed — per-row `fetchedAt` stamps are not changes — so a
  quiet run leaves no commit and no PR, and the staleness banner measures time since the last
  change-bearing sync a human merged. The clock's snapshot is minute-floored, so a focus
  inside the same minute is literally a no-op.

### Deliberately not done
- Roadmap row 4 (the stale LIVE pill) needs a design brief this release didn't have; row 5
  (a jsdom component rig) is deferred, so the clock's component wiring is browser-verified,
  not unit-tested. Auto-merging sync PRs: no — argued in the proposal.

## [0.1.1] — 2026-09-01

The public-repo milestone: a security sweep of the full tree and git history
(verdict: no secrets, no PII, no PCI scope), then the housekeeping it prescribed.

### Added
- MIT `LICENSE`, this `CHANGELOG`, `AGENTS.md`, and a CI workflow (typecheck, tests,
  build) — the repo went public, so it dresses like it.
- `.gitignore` entries for `dist-single/` and `_to_delete/`, closing the sync-day
  `git add` sweep that let stray artifacts into history.

### Changed
- `README.md` rewritten for the drive-by reader: the origin story, the honesty rules,
  and the partner in crime, up front.
- `Kickoff Standings.html` (the standings design reference) moved from the repo root to
  `docs/`.
- `docs/v0.1.1-ideas.md` restaged to `docs/v0.2.0-ideas.md`: the list is feature-sized
  work, minor-bump material, and this release consumed the v0.1.1 number.

### Removed
- `_to_delete/pr2-review-fixes.bundle` — a tracked git bundle that was the only channel
  distributing two unpublished commits to every clone.
- `_to_delete/maintenance.lock.stale` (empty) and the committed v0.0.1
  `dist-single/index.html` build fossil.

## [0.1.0] — 2026-08-31

The lens system, hardened by an adversarial review (PR #2; the design cycle's paper
trail is `docs/v0.0.3-*.md`).

### Added
- Three lenses over one fixture skeleton: **Ledger** (date-spine calendar), **Poster**
  (tonight's-slate hero), **Broadcast** (dark-first, marquee ticker, glow on hot rows) —
  lens, tab, view, date and filters all live in the URL.
- Month grid with per-day counts and competition bars as navigation; favicons; version
  string sourced from `package.json`.

### Fixed
- Honesty guards: postponed/cancelled fixtures can no longer pose as upcoming; a frozen
  `in_play` stops claiming LIVE hours after kickoff; date-shaped junk in `?date=` no
  longer crashes the app; a filtered-away day no longer impersonates an empty one.
- AA contrast on amber fills in Broadcast light; truthful month-grid semantics and
  keyboard navigation on the lens switcher; theme storage that throws no longer blanks
  the app.

## [0.0.2] — 2026-08-26

- The Table: full standings synced from ESPN's standings feed (never recomputed from
  results — tie-breakers are per-competition), Fixtures ↔ Table navigation, and review
  fixes for sync resilience and date correctness.

## [0.0.1] — 2026-08-23

- The rewrite: generated-and-diffed fixture data replaces a hand-typed dashboard whose
  audit found ~20 wrong rows. Zod validation at the provider boundary, UTC-instant
  storage, snapshot diffing with urgency exit codes.

# Changelog

All notable changes to Kickoff. The format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow
[semver](https://semver.org/). The doc-cycle names in `docs/` and release versions can
diverge (the v0.1.0 release shipped from the v0.0.3 doc cycle) — this file tracks
releases.

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

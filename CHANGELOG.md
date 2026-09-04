# Changelog

All notable changes to Kickoff. The format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versions follow
[semver](https://semver.org/). The doc-cycle names in `docs/` and release versions can
diverge (the v0.1.0 release shipped from the v0.0.3 doc cycle) — this file tracks
releases.

## [Unreleased]

## [0.2.2] — 2026-09-04

The front door: everything a first-time visitor meets — the lens the app opens on, a hero that
tells the time, an address to reach it at, a README that talks you into cloning it — plus a
sync that finally stops knocking with news nobody needs to read. Paper trail:
`docs/v0.2.2-proposal.md`.

### Added
- **The app has an address.** `.github/workflows/pages.yml` deploys `dist/` to GitHub Pages
  on every push to `main`, so the demo at `https://benicheni.github.io/kickoff/` is a
  point-in-time build redeployed within minutes of a merge — a sync that merges itself is live
  before Beni has read the notification. No code change: the build was already relative. Needs
  the repo's Pages source set to GitHub Actions.
- **The sync merges its own boring news.** `mergeVerdict` in `scripts/diff.ts` decides, in
  one pure function with a test per branch, whether the PR a run opens may merge itself: held
  for a human when anything is urgent (inside −6 h..+72 h, or a postponement/cancellation at
  any horizon), when any `DISAPPEARED` or `HOME_AWAY_INVERTED` line appears at any horizon, or
  when the standings fetch failed; auto otherwise. The verdict rides the report line as
  `merge=auto|hold` — pinned verbatim in the test, matched by `sync.yml`'s regex — and the
  workflow only obeys it: `gh pr merge --squash --auto` behind the required `verify` check, or
  a sticky `hold: human` label plus a disarmed auto-merge that no later, quieter run may
  re-arm. A held PR stays held until a human merges it or removes the label. Needs the repo's
  "Allow auto-merge" setting on; until then the run warns and leaves the PR open.
- **The docs.** `CONTRIBUTING.md` (how to run it, the honesty rules as contribution rules, what
  a good PR looks like, why the commits are authored by Claude), `SECURITY.md`,
  `docs/HONESTY.md` (the house rules as a first-class page), `docs/ARCHITECTURE.md` (the data
  flow ESPN → app, where the pure layer ends), `docs/README.md` (an index of the paper trail),
  a pull-request template and three issue templates — including one for wrong fixture data,
  this repo's signature issue type. The six-combo screenshot matrix recaptured at v0.2.2 into
  `docs/screenshots/v0.2.2/`.
- A `kickoff-dev-worktree` launch configuration on port 5174, so a worktree session's dev
  server does not collide with the main checkout's.

### Changed
- **Poster is the default lens.** A URL without `?lens=` opens Poster; `?lens=ledger` is now
  the value that gets written down, with a round-trip test for exactly that. The pill order
  keeps its loudness gradient (Ledger, Poster, Broadcast) — Poster simply starts filled — and
  theme defaults do not move: Poster shares the non-Broadcast theme key with Ledger, as it
  always has. **Accepted cost:** every previously shared link without `?lens=` now means
  Poster.
- **The sync runs every three hours as scheduled** — `23 1,4,7,10,13,16,19,22 * * *`, up from
  twice a day, keeping midnight and noon ET in the set. *As scheduled* is the honest phrase:
  GitHub's cron ran three to four and a half hours late on every real run so far, so eight
  runs a day is what is asked for, not what is promised. The minute moved off the top of the
  hour on GitHub's own advice.
- **The Step 0 contract with the betting pipeline** (`CLAUDE.md`, "Scheduled sync"): every
  sync PR *left open for you* is a re-verification trigger; the ones that merged themselves
  carried nothing inside 72 hours, nothing that vanished and nothing inverted. Before this
  release every sync PR was a trigger.
- `README.md` rewritten around three moments — the hook, the try, the contribute — with the
  long honesty section, the map and the ESPN traps moved to their own pages, the emoji budget
  cut to one, and a "where to start" list that names only unclaimed work.
- `docs/v0.3.0-ideas.md`: row 3 struck through (shipped here); row 2 annotated (its urgency
  half shipped here, its `changed=false` half stays v0.3.0); row 5 carries its new number;
  row 15 added — a docsite, decided and deferred with its trigger.

### Fixed
- **Poster's hero contradicted Ledger's, live, once a minute.** `TonightSlate` never read a
  clock: it filtered by status, so a scheduled fixture sat in "N REMAINING" after its kickoff
  and a snapshot `in_play` counted as remaining from the start, while the Next-up strip
  dropped both at the kickoff minute. Now one pure gate, `stillToKickOff`, decides "not yet
  kicked off" for both heroes, and one pure planner, `planSlate`, decides what Poster shows.
  A fixture leaves the slate at its kickoff minute in the same tick Next-up drops it; the
  "nothing left today" flip fires at the last kickoff, not at the next snapshot; a placeholder
  time is still trusted only to the day. Browser-proved with the clock driven through all
  three instants.

### Deliberately not done
- **The numbering.** This release was inserted ahead of the jsdom rig, so the train slides one
  number: the rig is v0.2.3, the resilience patch v0.2.4, v0.3.0 unchanged. `[0.2.1]`'s
  sentence "wait for v0.2.3, behind the jsdom rig (v0.2.2)" stays as written — true for what
  0.2.1 planned, superseded here — and `docs/v0.2.1-proposal.md`'s train table carries a
  dated note rather than a rewrite.
- **The jsdom component rig** — v0.2.3. Consequence, named: the lens default and the hero's
  clock ship browser-verified, not unit-tested at the component seam, which is the exact class
  the rig exists for.
- **Row 4's stale-LIVE pill**, row 10's palette AA debts, row 11's marquee speed and
  reduced-motion control — the design cycle, not a build guess.
- **Row 1** (`RESULT_CHANGED` / `TEAM_RENAMED`) and **row 2's `changed=false` stamp-only
  auto-merge** — v0.3.0. Row 1 is not a prerequisite for the urgency gate shipped here (a
  result correction or a rename is invisible to the diff engine whether or not the PR merges
  itself, so this release widens no hole); it is a prerequisite for row 2. And so the
  staleness banner still goes amber through an international break — more frequent syncing
  does not change what it measures, and its thresholds were not tightened to compensate.
- **Normalize-on-load** (stripping a redundant `?lens=poster` from the address bar) — row 7's
  `canonicalSearch()`, v0.2.4 with the rest of `useUrlState`. Not half-built here.
- **A docsite** — deferred with a trigger (`docs/v0.3.0-ideas.md` row 15): VitePress, under a
  path of the Pages workflow, once the reader-facing set passes roughly six pages.
- **Aged-out urgency** is presented to a human as a non-urgent line inside a held PR, never
  merged by the bot — the label says the PR was flagged, not which line did the flagging.
  Accepted; the run history is the recourse.
- **Row 14's portable `/beni-pr-review`** — a separate deliverable. **Row 13(e)**, the inert
  `Default` ruleset — still Beni's click, still not a PR.

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
  was its first live run — on the branch, before a PR existed, which is why it now takes a
  branch name too — with one deviation on the record: three of six cold reviewers died on a
  usage limit and their classes (data honesty, theme, absolute words) were covered by the
  author, then read cold in the PR #13 review. What this is, and is not: a Claude Code
  *project* skill — it runs only with this repo checked out, a human types it
  (`disable-model-invocation`), and its hunt classes are Kickoff's. A portable, account-level
  `/beni-pr-review` for generic PR work across Claude Code, Claude Design, Cowork and Chat is
  a separate deliverable, not a later version of this file.
- `CLAUDE.md`'s "Release management" section: the four sources that together say what has
  shipped, patch vs minor as this repo has actually used them, the CHANGELOG as a product
  surface, and the rule that numbering forks go to Beni. Written by the PM session; the claims
  the audit and the review found false or unbounded were corrected in the same release
  (Changed, below).
- The release plan for the whole train — three patches, then v0.3.0 — with every open ideas
  row either in a named release or deferred with a reason, in the proposal.
- The two `docs/v0.2.x-*` prompt archives that scoped this train.

### Changed
- `CLAUDE.md`: the version string lives in seven places, not four; ideas rows are renumbered
  across files, so name the file when citing one; "Deliberately not done" is the convention
  from v0.2.0 on, not "every section so far"; `[Unreleased]` is dated to PR #11 rather than
  described as long-standing; the browser matrix is 360/375/390/~1000 and is scoped to
  whether `src/` changed; `&date=` is a week anchor, not a filter; "user-visible" in the patch
  rule means the deployed app's users, so a new command is still a patch; `git tag` as a
  ground-truth source starts at v0.2.0. README's roadmap pointer now names
  `docs/v0.3.0-ideas.md`, the current list — it had gone stale in the squash that created it —
  and its "How this repo is actually built" paragraph no longer claims every cycle archived
  all four ladder documents (v0.1.0's has no proposal, v0.2.0's no design brief or build spec).
- `docs/v0.3.0-ideas.md` row 2 no longer cites the dispatched `verify` check PR #11 removed;
  row 9 records the active-tab duplicate history entry (`TabNav.tsx:38`) this release's
  review found.

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
- No app behaviour. Rows 6, 7, 8, 12, the four code items of 13 and one third of 11 wait for
  v0.2.3, behind the jsdom rig (v0.2.2); rows 3, 4, 10 and the rest of 11 wait for a design
  cycle; row 9 for a v0.3.x patch; row 13's fifth item is the ruleset above. Each reason is in
  the proposal.

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

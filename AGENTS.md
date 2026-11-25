# Agent instructions

This repo is agent-built. The standing brief lives in **[CLAUDE.md](CLAUDE.md)** — read
it first, whatever tool you are. It covers:

- the prompt ladder every version moves through (proposal → design brief → implementation
  spec → adversarial review), and why the repo is ground truth over anyone's description
  of it;
- the verification discipline: `npm run typecheck` and `npm test` green at every commit,
  browser-verification across every lens × theme × tab before declaring done, and
  data-honesty test assertions that are never weakened to make a change pass;
- commit authorship conventions.

Since 19 Nov 2026 `CLAUDE.md` points to four topic files. Claude Code can load the three
rules files when a tool reads or edits a matching path. Read the file for your area before
starting:

- [`.claude/rules/sync.md`](.claude/rules/sync.md) — the scheduled sync, the snapshot
  boundary, the merge policy and the Step 0 contract with the betting pipeline. The Step 0
  preflight is in `CLAUDE.md`;
- [`.claude/rules/design-system.md`](.claude/rules/design-system.md) — Fergie Time and the
  public design record;
- [`.claude/rules/releases.md`](.claude/rules/releases.md) — semver, the CHANGELOG, the seven
  places a version string lives, and who decides what;
- [`docs/roadmap-pointers.md`](docs/roadmap-pointers.md) — what the next release is, and why.

`CLAUDE.md` keeps each moved section's heading with a pointer, so older citations of
`CLAUDE.md`, "Scheduled sync" and the like still resolve.

The one rule that outranks everything else: fixture data is **generated and diffed, never
typed**. `src/data/*.json` is written only by `npm run sync` — do not hand-edit it, and
never render a kickoff time the league hasn't set.

## Review tiers

Since 22 Nov 2026, Codex builds by default. Beni can route a build to Claude. See the
[README tiers and seats](README.md#-how-it-gets-built) for the review assignments.

- **Tier 0 · Generated.** A PR the scheduled sync workflow opens from `sync/scheduled`,
  containing only `src/data/**` and `docs/sync-digest.md`, takes Tier 0. The workflow merges
  after `verify` passes.
- **Tier 1 · Docs.** Prose in `docs/` or `README.md` outside Tier 3. The other vendor reads it
  cold, then Beni merges. A planned automated read will run only on same-repo branches.
- **Tier 2 · Code.** App or tooling code outside Tier 3. The other vendor runs one report-only
  cold read with `/kickoff-pr-review`. The builder fixes findings and the reviewer re-reads
  each round. The reviewer merges only on “Mergeable now” with `verify` green at the tip.
- **Tier 3 · Sensitive.** The paths below and all releases take the six-pass 360. Pass 1 is
  report-only and the builder commits every fix. The merge takes Beni's word. Beni merges
  and tags every release.

A PR takes the highest tier any of its changes reaches, with the Tier 0 exception above.
Anything no tier names is Tier 2.
Until a labeler exists, the builder names the tier and the file that sets it in the PR body.
Any reviewer can raise the tier. Only Beni can lower it.

### Tier 3 paths

Globs are gitignore-style, as in `.claude/rules/*.md`. `**` crosses folders and `*` stays
within one path segment.

- **Snapshot and workflows:** `src/data/**`, `docs/sync-digest.md`, `.github/workflows/**`.
- **Sync scripts:** `scripts/*sync*`, `scripts/diff.ts`, `scripts/publish-gate.ts`,
  `scripts/ensure-pages.sh`, `scripts/validate.ts`, `scripts/window.ts`, `scripts/providers/**`.
- **Verification gates:** `vite.config.ts`, `web/vitest.config.ts`,
  `scripts/scan-offline-bundle.ts`, `scripts/vercel-smoke.mjs`, `web/scripts/check-client.mjs`,
  `web/scripts/check-css.mjs`.
- **Fixture schema, clocks and data rules:** `docs/HONESTY.md`, `src/lib/schema.ts`,
  `src/lib/time.ts`, `src/lib/clock.ts`, `src/lib/useNow.ts`, `src/lib/RequestClock.tsx`,
  `src/lib/competitions.ts`, `src/lib/matchdays.ts`, `src/lib/fixtures.ts`,
  `src/lib/lensSelectors.ts`, `src/lib/standings.ts`.
- **Moments curation:** `src/curated/**`, `src/lib/moments.ts`, `scripts/validate-moments.ts`.
- **Step 0 URL contract (`?only=` and `&date=`):** `src/lib/urlCodecs.ts`, `src/lib/useUrlState.ts`.
- **Data-honesty and verification tests:**
  - Sync, schema and publication: `tests/competitions.test.ts`, `tests/diff.test.ts`,
    `tests/espn.test.ts`, `tests/espnStandings.test.ts`, `tests/publishGate.test.ts`,
    `tests/sync.test.ts`, `tests/syncBaseline.test.ts`, `tests/syncDigest.test.ts`,
    `tests/syncPrBody.test.ts`, `tests/syncPublication.test.ts`, `tests/uclSync.test.ts`,
    `tests/validate.test.ts`, `tests/venueTz.test.ts`, `tests/window.test.ts`.
  - Dates, status, fixture order and standings: `tests/clock.test.ts`,
    `tests/displayOrder.test.ts`, `tests/fixtures.test.ts`, `tests/lensSelectors.test.ts`,
    `tests/matchdays.test.ts`, `tests/standings.test.ts`, `tests/time.test.ts`,
    `tests/dom/clock.test.tsx`, `tests/dom/designCycle.test.tsx`,
    `tests/dom/displayOrder.test.tsx`, `tests/dom/fixtureEdges.test.tsx`,
    `tests/dom/matchdays.test.tsx`, `tests/dom/poster.test.tsx`,
    `tests/dom/requestClock.test.tsx`, `tests/dom/tableUnderway.test.tsx`,
    `tests/dom/tableUnsetKickoff.test.tsx`, `tests/dom/uclTable.test.tsx`,
    `tests/dom/venueTz.test.tsx`, `web/test/fixture-edges.test.tsx`.
  - Snapshot provenance and curation: `tests/dom/appHeader.test.tsx`,
    `tests/dom/moments.test.tsx`, `tests/dom/momentsGallery.test.tsx`, `tests/dom/offline.test.tsx`,
    `tests/evidenceWeeks.test.ts`, `tests/metaTotal.test.ts`, `tests/moments.test.ts`,
    `tests/momentsAcceptance.test.ts`, `tests/momentsContract.test.ts`, `tests/momentsGallery.test.ts`,
    `tests/vercelSmoke.test.ts`, `web/test/header-shared.test.tsx`, `web/test/snapshot.test.ts`.
  - Step 0 URL contract: `tests/urlCodecs.test.ts`, `tests/dom/urlState.test.tsx`,
    `tests/dom/clearing.test.tsx`.
  - Sync preflight and serve-only synthetic data: `tests/sessionStartHook.test.ts`,
    `tests/harnessSpecimen.test.ts`.
- **Agent instructions:** `CLAUDE.md`, `AGENTS.md`, `.claude/**`, `.agents/**`.
- **Release and numbering:** `package.json`, `package-lock.json`, `docs/roadmap-pointers.md`,
  `docs/v*-proposal.md`, and an added `## [X.Y.Z]` heading in `CHANGELOG.md`. An `[Unreleased]`
  edit keeps the PR's own tier. In `README.md`, Tier 3 covers the `badge/version-` line, the
  `What it does today (vX.Y.Z)` heading and the list under Lineage.

## Cursor Cloud specific instructions

Cloud Agent images can put an older `node` ahead of nvm on `PATH` (observed: `/exec-daemon/node` v22.14.0). That build is below `package.json` `engines` and below the Node 24 CI job. `nvm which current` follows that same `PATH` entry, so it does not select Node 24. Before `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, or `npm run dev`, prepend the nvm Node 24 bin:

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 24
export PATH="$NVM_DIR/versions/node/$(nvm version 24)/bin:$PATH"
```

`nvm install 24` is idempotent once 24 is present. Current `main` has three installs, in this order, matching CI: `npm ci` at the repo root, then `npm ci --no-audit --no-fund --prefix web`, then `npm ci --no-audit --no-fund --prefix studio`. The root Vite app is `npm run dev -- --host 127.0.0.1 --port 5173`. The unreleased Next app is `npm --prefix web run dev -- --hostname 127.0.0.1 --port 5174` (it needs the root install for `tsx`). The check commands are the root, `web/`, and `studio/` steps in `.github/workflows/ci.yml`. The committed `src/data/*.json` snapshot is enough to run and test offline. `npm run sync` writes those files and talks to ESPN's public API; do not hand-edit them. Studio contract tests use local PGlite. `npm run migrate` in `studio/` needs `DATABASE_URL` and is not part of that check.

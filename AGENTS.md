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

Since 19 Nov 2026 four topics live outside `CLAUDE.md`, unchanged. Claude Code loads the
three rules files only when a session touches their paths; every other agent reads the one
for its area before starting:

- [`.claude/rules/sync.md`](.claude/rules/sync.md) — the scheduled sync, the snapshot
  boundary, the merge policy and the Step 0 contract with the betting pipeline;
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

## Cursor Cloud specific instructions

Cloud Agent images can put an older `node` ahead of nvm on `PATH` (observed: `/exec-daemon/node` v22.14.0). That build is below `package.json` `engines` and below the Node 24 CI job. `nvm which current` follows that same `PATH` entry, so it does not select Node 24. Before `npm ci`, `npm test`, `npm run typecheck`, `npm run build`, or `npm run dev`, prepend the nvm Node 24 bin:

```bash
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
nvm install 24
export PATH="$NVM_DIR/versions/node/$(nvm version 24)/bin:$PATH"
```

`nvm install 24` is idempotent once 24 is present. Current `main` has three installs, in this order, matching CI: `npm ci` at the repo root, then `npm ci --no-audit --no-fund --prefix web`, then `npm ci --no-audit --no-fund --prefix studio`. The root Vite app is `npm run dev -- --host 127.0.0.1 --port 5173`. The unreleased Next app is `npm --prefix web run dev -- --hostname 127.0.0.1 --port 5174` (it needs the root install for `tsx`). The check commands are the root, `web/`, and `studio/` steps in `.github/workflows/ci.yml`. The committed `src/data/*.json` snapshot is enough to run and test offline. `npm run sync` writes those files and talks to ESPN's public API; do not hand-edit them. Studio contract tests use local PGlite. `npm run migrate` in `studio/` needs `DATABASE_URL` and is not part of that check.

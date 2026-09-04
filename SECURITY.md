# Security

Short, because there is little to secure — and that is by design.

## What this repo holds

- **No secrets.** The data source is ESPN's public scoreboard and standings API: no key, no
  account, no token. The GitHub workflows run on the default `GITHUB_TOKEN` with the
  permissions each one declares at the top of its file; there are no repository secrets and
  no personal access tokens. If you ever find one, that is a bug — report it.
- **No auth, no users, no PII.** The app is a static bundle. It stores two theme preferences
  in `localStorage` and nothing else; nothing is sent anywhere.
- **No payment, no PCI scope.** The betting that started this project happens elsewhere, on
  the books' own sites. This repo renders kickoff times.
- **Generated data, committed.** `src/data/*.json` is written only by `npm run sync` and
  validated by a Zod schema at the boundary, so a malformed upstream payload fails the sync
  rather than reaching the app.

## The v0.1.1 sweep

Before the repo went public (1 Sep 2026) the full tree and its git history were reviewed for
secrets, personal data and payment scope. Verdict: none of the three. The housekeeping it
prescribed shipped as v0.1.1: a tracked git bundle that was distributing two unpublished
commits to every clone was removed, and stray build artifacts were ignored and deleted. The
entry is in [CHANGELOG.md](CHANGELOG.md) under `[0.1.1]`.

## Reporting something anyway

If you find a vulnerability — a workflow that could be made to write somewhere it shouldn't,
a dependency advisory that applies here, a way the rendered ESPN text could inject markup —
please open a [GitHub security advisory](https://github.com/BeniCheni/kickoff/security/advisories/new)
rather than a public issue, so there is time to fix it before it is described. You'll get a
reply, and credit in the changelog if you want it.

Dependabot alerts are not switched on for this repo today; a dependency advisory you know
applies here can go straight in as an issue.

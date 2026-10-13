# Moments Studio

Local, offline core for Kickoff's own generated videos. The reader in `src/` does not import this folder. A green test run is not generation: every command uses the fal stub and the storage stub unless `--live` is present together with `STUDIO_LIVE=1` and the secret that command needs. This package does not call fal or Supabase in tests, and this slice never uploads a file or opens a pull request.

`studio/db/` is the schema module. It imports nothing from the rest of `studio/`. The move into a package that both the Studio and the Next.js app import is planned; it is not done in this slice. The tables live in the Postgres schema `studio`, which Supabase's Data API does not expose. The public app's names are the views `catalog.videos` and `catalog.video` (`videos` where `published_at` is not null, ordered by `position` — the view does not apply the order; the app does).

This package is not a release of Kickoff. v0.5.2 stays.

## What you run

From `studio/`, after `npm ci`:

```bash
npm run cli -- help
npm run typecheck
npm test
```

Set two directories **outside this worktree**, and keep the env file outside it too. `STUDIO_DATA_DIR` is the offline database (PGlite, the stub of record until you pass `--live`). `STUDIO_MEDIA_DIR` is where stripped photographs, the cache, and downloaded clips are written. The Studio refuses either path when it sits inside the repo.

```bash
export STUDIO_ENV_FILE=$HOME/studio.env
export STUDIO_DATA_DIR=$HOME/studio-data
export STUDIO_MEDIA_DIR=$HOME/studio-media
```

The env file is `KEY=value` lines. It is read only when `STUDIO_ENV_FILE` is set, and only when that path is outside the worktree. Nothing in it is committed.

`npm run migrate` applies `studio/db/migrations` with the `postgres` driver, `prepare: false`, and a pool of one. You run it. The connection string is `DATABASE_URL` from that env file. Use the Supabase **session pooler**, port **5432**, host containing `pooler.supabase.com`. On the Free plan a direct connection is IPv6-only; the session pooler works over IPv4, and it is the right mode for this long-lived local process. `prepare: false` is what transaction mode (port 6543) requires, and it is safe on the session pooler, so the same client covers both. A Free project pauses after a week idle. The database password stays yours.

The role `studio_reader` is created `NOLOGIN` with `SELECT` on `catalog.videos` and `catalog.video` and nothing else. You turn it into a login, choose its password, and put that credential in Vercel's environment when the Next.js app exists. It is never committed and never put in a test.

## Commands

`estimate`, `submit`, `poll`, `resume`, `download`, `list`, `keep`, `discard`, `cancel`, `publish`, `unpublish`, `record-gate`, `record-balance`, and `migrate`.

`keep` takes five answers, checklist order: extra players, text on boards, logo-like marks, subject identity, soundtrack. Each is `clear`, `present`, or `unsure`. Keep needs five `clear` answers. `record-gate` records the Article 50 answer (who answers is not named). Publish refuses until that row exists, in the database as well as in this process. Unpublish moves a clip to `withdrawn`. It is not listed again. Whether it may ever be relisted is open (Q21); there is no relist command. A new version is a new submit with `--parent` set to the withdrawn generation.

The thumbnail is keyframe K0, the still the Studio already holds (`--keyframe` on submit). No frame is taken from the video. The site's fallback copy would be written at `public/moments/thumbnails/<public id>.jpg`, from those K0 bytes. How that copy reaches the site is open (Q19). The stub records the destination and does not write the repo, commit, or open a pull request. If that last step fails, the clip is already live and marked fallback missing; publish again retries only that step.

Prices, caps, and the ten-minute timeout are in the code. The timeout is a proposal (A-05), not a settled ceiling. The prepaid balance is whatever you last entered with `record-balance`. The Studio does not read it from fal. The caps are $1.50 for one request and $6 for a session. `budget-refused` is a state. A failed ledger write is `database-unavailable` and is not retried around the failure.

`STUDIO_STUB` selects the script: `queued-then-completed` (the default), `error-payload`, `safety-refusal`, `timeout`, `expired-result`, `duplicate-delivery`, `out-of-credit`. `STUDIO_STORAGE_FAIL` is a comma list of `video`, `thumbnail`, `fallback`, `remove`.

Photographs are stripped of every metadata block, location first, and the hash stored is the hash of the bytes that would be sent.

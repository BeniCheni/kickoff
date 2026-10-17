# Moments Studio

Local, offline core for Kickoff's own generated videos. The reader in `src/` does not import this folder. A green test run is not generation: every command uses the fal stub and the storage stub unless `--live` is present together with `STUDIO_LIVE=1` and the secret that command needs. This package does not call fal or Supabase in tests, and this slice never uploads a file or opens a pull request.

`studio/db/` is the schema module. It imports nothing from the rest of `studio/`. The public row contract lives in `@kickoff/catalog` (`packages/kickoff-catalog`), installed as a copy (`studio/.npmrc`, `install-links=true`). After editing that package, run `npm install` here before `npm test` sees the edit. CI installs fresh. Drizzle stays in this package. The tables live in the Postgres schema `studio`, which Supabase's Data API does not expose. The public app's names are the views `catalog.videos` and `catalog.video` (`videos` where `published_at` is not null, ordered by `position` — the view does not apply the order; the app does).

This package is not a release of Kickoff. v0.5.2 stays.

## What you run

From `studio/`, after `npm ci`:

```bash
npm run cli -- help
npm run typecheck
npm test
npm run test:contract
```

Set two directories **outside this worktree**, and keep the env file outside it too. `STUDIO_DATA_DIR` is the offline database (PGlite, the stub of record until you pass `--live`). `STUDIO_MEDIA_DIR` is where stripped photographs, the cache, and downloaded clips are written. The Studio refuses either path when it sits inside the repo.

```bash
export STUDIO_ENV_FILE=$HOME/studio.env
export STUDIO_DATA_DIR=$HOME/studio-data
export STUDIO_MEDIA_DIR=$HOME/studio-media
```

The env file is `KEY=value` lines. It is read only when `STUDIO_ENV_FILE` is set, and only when that path is outside the worktree. Nothing in it is committed.

`npm run migrate` applies `studio/db/migrations` with the `postgres` driver, `prepare: false`, and a pool of one. You run it. The connection string is `DATABASE_URL` from that env file. Use the Supabase **session pooler**, port **5432**, host containing `pooler.supabase.com`. On the Free plan a direct connection is IPv6-only; the session pooler works over IPv4, and it is the right mode for this long-lived local process. `prepare: false` is what transaction mode (port 6543) requires, and it is safe on the session pooler, so the same client covers both. A Free project pauses after a week idle. The database password stays yours.

Migration `0002_catalog_reader.sql` is hand-written. It replaces both views, keeps every column they already had, and appends the reader columns. The list gains `generated_at`, `editorial_note`, and `subjects`. The detail gains `subjects`, `kept_at`, `thumbnail_mime`, and `thumbnail_is_keyframe`. `npm run test:contract` applies that migration on local PGlite and runs the view, permission, package, and isolation tests. It is not the whole Studio suite.

The role `studio_reader` is created `NOLOGIN` with `SELECT` on `catalog.videos` and `catalog.video` and nothing else. You turn it into a login, choose its password, and put that credential in Vercel's environment when the Next.js app exists. It is never committed and never put in a test. A `studio_reader` login through the shared pooler connects as `studio_reader.[PROJECT-REF]`. Direct connections and the dedicated pooler use the role name alone. Read 13 Oct 2026 from [Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres): a custom role through the shared pooler uses `[ROLE].[PROJECT-REF]`.

## Commands

`estimate`, `submit`, `poll`, `resume`, `download`, `list`, `keep`, `discard`, `cancel`, `publish`, `unpublish`, `retry-delete`, `retry-removal`, `close-session`, `attach-request`, `settle-unconfirmed`, `record-gate`, `record-balance`, and `migrate`.

`keep` takes five answers, checklist order: extra players, text on boards, logo-like marks, subject identity, soundtrack. Each is `clear`, `present`, or `unsure`. Keep needs five `clear` answers. `record-gate` records the Article 50 answer (who answers is not named). An empty or blank answer is refused, in this process and by the database check. Blank means every character is in one shared set: the characters JavaScript's `\s` matches, plus U+200B, U+200C, U+200D and U+2060. The check is a PostgreSQL `~` test of a standard-SQL `U&` escape string. A second answer is refused with the date already recorded. This slice has no command to amend that answer. Publish refuses until that row exists, in the database as well as in this process.

Unpublish withdraws first, in one transaction: it clears `published_at`, sets `unpublished_at`, and moves the job to `withdrawn`. The clip leaves both catalog views when that write commits. If the write fails, the clip stays published and no file is touched. `unpublish --delete` then deletes the stored video and thumbnail, each recorded on its own. Plain `unpublish` deletes nothing. A failed delete leaves the clip withdrawn, and the file that did not delete stays readable at the address on the record until `retry-delete` succeeds. The stub treats an object that is already gone as removed. Whether Supabase Storage does the same is not verified here. A removal of the site's copy always follows, through the same port as the fallback copy. Its outcomes are `pr-opened`, `checks-running`, `merged`, and `checks-failed`. `retry-removal` retries a failed removal. The clip stays withdrawn either way. A withdrawn clip is never relisted (Q21, decided 12 Oct 2026). There is no relist command. A new version is a new submit with `--parent` set to the withdrawn generation.

The thumbnail is the keyframe the clip starts from (K0), which the Studio already holds (`--keyframe` on submit). The site's copy stays at `public/moments/thumbnails/<public id>.jpg` (Q24, decided 13 Oct 2026). That copy arrives by a thumbnail-only pull request that runs `verify` and auto-merges when green. It is never pushed straight to main (Q19, decided 12 Oct 2026, with A-11 Preserve). The stub records the destination and does not write the repo, commit, or open a pull request. While the pull request is opened or its checks are running, the clip's fallback status is `pending`. When the checks fail it is `failed`, and publish again retries only that step. When they pass it is `merged`. A merged copy is not yet deployed. The watch address and the copy's file name use `public_id`. Asset and job UUIDs do not appear on the catalog views (Q25, decided 13 Oct 2026). The site reads each file's bucket and object path from the record. It does not build a path (Q23, decided 13 Oct 2026). Those keys end in `.mp4` and `.jpg`, and the storage port is told the MIME type.

Prices, caps, and the ten-minute timeout are in the code. The timeout is a proposal (A-05), not a settled ceiling. The 120-second start timeout sent to fal is a proposal too. The prepaid balance is whatever you last entered with `record-balance`. The Studio does not read it from fal. The caps are $1.50 for one request and $6 for a session. A session closes only when you run `close-session`. Nothing closes it by time. Closing resets the $6 window. It does not change the prepaid balance, which stays yours to keep at or below $9.37 by hand. `close-session` refuses while a job in that session is in flight or its submit is unconfirmed, and it names those jobs. `budget-refused` is a state. A failed ledger write is `database-unavailable` and is not retried around the failure.

A definitive refusal is an error status and no request id. A 422 whose body matches the safety words becomes `refused`; any other error status becomes `failed`. The status and fal's error type are recorded on an event. A 5xx is reconciled at $0 because [Reliability](https://fal.ai/docs/model-apis/model-endpoints/reliability) (read 13 Oct 2026) says failed requests that return 5xx are not billed. A 422 is not on that page, so its estimate stays pending. Either way a later submit of the same inputs is allowed, and `close-session` is not blocked.

An ambiguous send — a thrown network error, a timeout, or a crash after the request left — stays `submit-unconfirmed`. Nothing resubmits it. The pending estimate still counts. `settle-unconfirmed --job <id> --not-accepted --evidence "<text>"` records your evidence that fal never accepted it, moves the job to `failed`, and leaves the estimate pending unless you pass `--amount` with a figure you entered. The Studio does not write a $0 line for that case.

To attach a request you already have an id for, run `attach-request --job <id> --request-id <id>`. The Studio builds the three addresses from the queue routes on [Asynchronous Inference](https://fal.ai/docs/model-apis/model-endpoints/queue) (read 13 Oct 2026). That page's submit response lists `status_url`, `response_url` and `cancel_url` as `https://queue.fal.run/<endpoint>/requests/<request_id>/status`, `.../response` and `.../cancel`. Its example endpoint is `fal-ai/flux/schnell`. The same page's result curl omits `/response`; recovery follows the submit-response shape, which is also what a normal poll uses after the URLs were stored at submit. Find the request id in fal's dashboard or request list. The page does not show `openai/gpt-image-2/edit` or `minimax/h3-max-turbo/image-to-video`. Recovery for those two is not verified until a live run. `poll` after attach uses the stored addresses, not a second construction.

Cancel follows the same queue page. Only `202` with `{"status":"CANCELLATION_REQUESTED"}` moves the job to `cancelled`. `400` with `{"status":"ALREADY_COMPLETED"}` is `cancel-already-completed`: the job stays where it was, and polling and reconciliation continue. `404` with `{"status":"NOT_FOUND"}` is `cancel-not-found`. Any other response is `cancel-unconfirmed`, and the job is unchanged.

A response that carries a request id but no usable queue URLs stores that id in the same write. The job stays off the resubmit path until `attach-request`. `close-session` still refuses it, because fal may have accepted the request. An out-of-credit draft, reconciled at $0, can be submitted again.

`STUDIO_STUB` selects the script: `queued-then-completed` (the default), `error-payload`, `safety-refusal`, `timeout`, `expired-result`, `duplicate-delivery`, `out-of-credit`. `STUDIO_STORAGE_FAIL` is a comma list of `video`, `thumbnail`, `fallback`, `remove`.

The photograph strip takes JPEG only. HEIC and PNG are refused, so convert first. It removes every metadata block, including APP2 (ICC) and APP14, so a Display P3 photo loses its colour profile. The hash stored is the hash of the bytes that would be sent. Those bytes are a `data:image/jpeg;base64,...` URI, the form fal's file-input docs describe. The Studio does not upload the photograph to fal storage. `--live` with `STUDIO_LIVE` or `FAL_KEY` missing refuses and names the missing piece. It never prints a value. Every command that talks to fal prints `transport=stub` or `transport=live`.

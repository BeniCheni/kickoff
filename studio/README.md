# Moments Studio

Local, offline core for Kickoff's own generated videos. The reader in `src/` does not import this folder. A green test run is not generation: every command uses the fal stub and the storage stub unless `--live` is present together with `STUDIO_LIVE=1` and the secret that command needs. This package does not call fal, Cloudflare, Supabase or Vercel in tests, and it does not open a pull request. `--live` is the only path that can upload, and only when `STUDIO_LIVE=1` and the named secrets are set.

`studio/db/` is the schema module. It imports nothing from the rest of `studio/`. The public row contract lives in `@kickoff/catalog` (`packages/kickoff-catalog`), installed as a copy (`studio/.npmrc`, `install-links=true`). After editing the package, run `npm ci` in `studio/` to refresh the installed copy before `npm test` sees the edit. CI installs fresh. Drizzle stays in this package. The tables live in the Postgres schema `studio`, which Supabase's Data API does not expose. The public app's names are the views `catalog.videos` and `catalog.video` (`videos` where `published_at` is not null, ordered by `position` — the view does not apply the order; the app does).

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

`estimate`, `submit`, `poll`, `resume`, `download`, `import`, `list`, `keep`, `discard`, `cancel`, `publish`, `unpublish`, `retry-delete`, `retry-removal`, `close-session`, `attach-request`, `settle-unconfirmed`, `record-gate`, `record-balance`, and `migrate`.

`import` takes a clip made somewhere else (E5, 18 Oct 2026). The source is `grok-imagine`. The Studio reads the MP4's own boxes for the container, codec, width, height, duration, frame rate and audio, copies the clip and a stripped JPEG keyframe into `STUDIO_MEDIA_DIR`, and lands the job in `downloaded`. The seed, the prompt expansion and the request id stay null. There is no fal request and no ledger line. The finish time is `--made-on`, or the creation time in the MP4 header; if neither is there, import refuses and asks for `--made-on`. Importing the same file twice is refused by hash. `keep` and `record-gate` then work as they do for a fal clip.

`keep` takes five answers, checklist order: extra players, text on boards, logo-like marks, subject identity, soundtrack. Each is `clear`, `present`, or `unsure`. Keep needs five `clear` answers. `record-gate` records the Article 50 answer (who answers is not named). An empty or blank answer is refused, in this process and by the database check. Blank means every character is in one shared set: the characters JavaScript's `\s` matches, plus U+200B, U+200C, U+200D and U+2060. The check is a PostgreSQL `~` test of a standard-SQL `U&` escape string. A second answer is refused with the date already recorded. This slice has no command to amend that answer. Publish refuses until that row exists, in the database as well as in this process.

Publish also refuses, before it uploads or writes, when the clip lacks a positive width, a positive height, a positive duration, an approved subject (Fenway or Frankenstein), a safe public id (`[A-Za-z0-9][A-Za-z0-9_-]{0,63}`), or a finish time (N4-Q3 Card, decided 16 Oct 2026). The refusal names each missing item in plain words. The safe public id is also a database check, `videos_id_token`, added in migration `0003_card_gate.sql`. The other facts live on other tables, so a check cannot express them; the catalog views are not changed and still omit a subject that is not one of those two names.

Unpublish withdraws first, in one transaction: it clears `published_at`, sets `unpublished_at`, and moves the job to `withdrawn`. The clip leaves both catalog views when that write commits. If the write fails, the clip stays published and no file is touched. `unpublish --delete` then deletes the stored video and thumbnail, each recorded on its own. Plain `unpublish` deletes nothing. A failed delete leaves the clip withdrawn, and the file that did not delete stays readable at the address on the record until `retry-delete` succeeds. The stub treats an object that is already gone as removed. Whether Supabase Storage does the same is not verified here. A removal of the site's copy always follows, through the same port as the fallback copy. Its outcomes are `pr-opened`, `checks-running`, `merged`, and `checks-failed`. `retry-removal` retries a failed removal. The clip stays withdrawn either way. A withdrawn clip is never relisted (Q21, decided 12 Oct 2026). There is no relist command. A new version is a new submit with `--parent` set to the withdrawn generation.

The thumbnail is the keyframe the clip starts from (K0), which the Studio already holds (`--keyframe` on submit). The site's copy stays at `public/moments/thumbnails/<public id>.jpg` (Q24, decided 13 Oct 2026). That copy arrives by a thumbnail-only pull request that runs `verify` and auto-merges when green. It is never pushed straight to main (Q19, decided 12 Oct 2026, with A-11 Preserve). The stub records the destination and does not write the repo, commit, or open a pull request. While the pull request is opened or its checks are running, the clip's fallback status is `pending`. When the checks fail it is `failed`, and publish again retries only that step. When they pass it is `merged`. A merged copy is not yet deployed. The watch address and the copy's file name use `public_id`. Asset and job UUIDs do not appear on the catalog views (Q25, decided 13 Oct 2026). The site reads each file's bucket and object path from the record. It does not build a path (Q23, decided 13 Oct 2026). Those keys end in `.mp4` and `.jpg`, and the storage port is told the MIME type.

Prices, caps, and the ten-minute timeout are in the code. The timeout is a proposal (A-05), not a settled ceiling. The 120-second start timeout sent to fal is a proposal too. The prepaid balance is whatever you last entered with `record-balance`. The Studio does not read it from fal. The caps are $1.50 for one request and $6 for a session. A session closes only when you run `close-session`. Nothing closes it by time. Closing resets the $6 window. It does not change the prepaid balance, which stays yours to keep at or below $9.37 by hand. `close-session` refuses while a job in that session is in flight or its submit is unconfirmed, and it names those jobs. `budget-refused` is a state. A failed ledger write is `database-unavailable` and is not retried around the failure.

A definitive refusal is an error status and no request id. A 422 whose body matches the safety words becomes `refused`; any other error status becomes `failed`. The status and fal's error type are recorded on an event. A 5xx is reconciled at $0 because [Reliability](https://fal.ai/docs/model-apis/model-endpoints/reliability) (read 13 Oct 2026) says failed requests that return 5xx are not billed. A 422 is not on that page, so its estimate stays pending. Either way a later submit of the same inputs is allowed, and `close-session` is not blocked.

An ambiguous send — a thrown network error, a timeout, or a crash after the request left — stays `submit-unconfirmed`. Nothing resubmits it. The pending estimate still counts. `settle-unconfirmed --job <id> --not-accepted --evidence "<text>"` records your evidence that fal never accepted it, moves the job to `failed`, and leaves the estimate pending unless you pass `--amount` with a figure you entered. The Studio does not write a $0 line for that case.

To attach a request you already have an id for, run `attach-request --job <id> --request-id <id>`. The Studio builds the three addresses from the queue routes on [Asynchronous Inference](https://fal.ai/docs/model-apis/model-endpoints/queue) (read 13 Oct 2026). That page's submit response lists `status_url`, `response_url` and `cancel_url` as `https://queue.fal.run/<endpoint>/requests/<request_id>/status`, `.../response` and `.../cancel`. Its example endpoint is `fal-ai/flux/schnell`. The same page's result curl omits `/response`; recovery follows the submit-response shape, which is also what a normal poll uses after the URLs were stored at submit. Find the request id in fal's dashboard or request list. The page does not show `openai/gpt-image-2/edit` or `minimax/h3-max-turbo/image-to-video`. Recovery for those two is not verified until a live run. `poll` after attach uses the stored addresses, not a second construction.

Cancel follows the same queue page. Only `202` with `{"status":"CANCELLATION_REQUESTED"}` moves the job to `cancelled`. `400` with `{"status":"ALREADY_COMPLETED"}` is `cancel-already-completed`: the job stays where it was, and polling and reconciliation continue. `404` with `{"status":"NOT_FOUND"}` is `cancel-not-found`. Any other response is `cancel-unconfirmed`, and the job is unchanged.

A response that carries a request id but no usable queue URLs stores that id in the same write. The job stays off the resubmit path until `attach-request`. `close-session` still refuses it, because fal may have accepted the request. An out-of-credit draft, reconciled at $0, can be submitted again.

`STUDIO_STUB` selects the script: `queued-then-completed` (the default), `error-payload`, `safety-refusal`, `timeout`, `expired-result`, `duplicate-delivery`, `out-of-credit`. `STUDIO_STORAGE_FAIL` is a comma list of `video`, `thumbnail`, `fallback`, `removal`, `remove`, `video-remove`, `thumbnail-remove`.

The photograph strip takes JPEG only. HEIC and PNG are refused, so convert first. It removes every metadata block, including APP2 (ICC) and APP14, so a Display P3 photo loses its colour profile. The hash stored is the hash of the bytes that would be sent. Those bytes are a `data:image/jpeg;base64,...` URI, the form fal's file-input docs describe. The Studio does not upload the photograph to fal storage. `--live` with `STUDIO_LIVE` or `FAL_KEY` missing refuses and names the missing piece. It never prints a value. Every command that talks to fal prints `transport=stub` or `transport=live`.

## Cloudflare R2

Videos and thumbnails for a live publish go to Cloudflare R2 (E4, 18 Oct 2026). The catalog row stays in Supabase Postgres. The storage stub is still what every test uses, and what every command uses unless the command is `publish`, `unpublish --delete`, or `retry-delete` and `--live` is set. `--live` is the switch to Supabase. It refuses, and names the missing piece, unless `STUDIO_LIVE` is `1` and `DATABASE_URL` is set, and it never opens the local database instead. A missing variable is refused by name. The value is never printed.

Beni creates the bucket, the custom domain, and an API token scoped to that one bucket, and writes the four names into the env file outside the worktree: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. The record always stores bucket `moments` and an object path `<public id>/video-<sha8>.mp4` or `<public id>/thumbnail-<sha8>.jpg`. The R2 object key is `moments/` plus that object path, so the public address `STUDIO_STORAGE_ORIGIN/moments/<object path>` is the bucket's custom domain plus the key. `STUDIO_STORAGE_ORIGIN` is the address the Next app will use at N6. Upload does not read it.

The request is SigV4, region `auto`, with the file's SHA-256 in `x-amz-content-sha256` and the MIME type as Content-Type. A failed upload leaves the clip unpublished and records which object failed (`video` or `thumbnail`). The next `publish` retries only the object that has no address yet. `unpublish --delete` and `retry-delete` delete through the same adapter. Only 200 and 204 count as deleted. S3 answers 204 when the key is already absent. A 404 fails with its status and its S3 code. That was not verified against a live bucket. The site's thumbnail copy stays on the stub. Every `--live` command refuses, by name, when `STUDIO_LIVE` is not `1` or `DATABASE_URL` is missing, so a live upload cannot write the catalog only into the local database.

## Wednesday 21 Oct 2026

`--live` is what points a command at Supabase. Every command below carries it. Without `STUDIO_LIVE` set to `1` and `DATABASE_URL`, the command refuses and names the missing piece. It does not open the local database. With nothing set, `import`, `keep`, `record-gate`, `list`, `migrate` and a plain `unpublish` print `refused: --live needs STUDIO_LIVE and DATABASE_URL`. `publish`, `unpublish --delete` and `retry-delete` also name `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET`. Without `--live` the same commands print `database=pglite`, and a storage command prints `storage=stub`. `migrate` is the exception: it always uses Postgres, so without `DATABASE_URL` it refuses as well.

Beni does every account step himself. Nothing in this repo creates the bucket, the domain, the token, or the database password.

In Cloudflare he creates one R2 bucket, attaches his custom domain to that bucket, and creates an API token that can read and write only that bucket. In the env file outside the worktree he sets `STUDIO_LIVE` to `1`, and he sets `DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `STUDIO_STORAGE_ORIGIN`. The origin is the custom domain, with no path on the end, for the Next app at N6. The Studio does not read the origin when it uploads. `STUDIO_DATA_DIR` and `STUDIO_MEDIA_DIR` stay outside the worktree, as above. He does not commit the env file.

In grok.com/imagine, in his own browser, he makes the clip at 16:9 and 1080p and downloads the mp4. The still he gave Grok is the keyframe, saved as a JPEG. A PNG is refused (`refused: keyframe is not a jpeg`). Convert one with `sips -s format jpeg <still.png> --out <still.jpg>`. The prompt he typed goes in a text file. No one else opens that site.

From `studio/`, apply the migrations to his Supabase database. This prints `migrated database=postgres`.

```bash
npm run cli -- migrate --live
```

Import the clip. The subjects are `Fenway`, `Frankenstein`, or both, separated by a comma, in that spelling. `--made-on` is the day he made the clip. This prints one line: `imported`, then `job`, `sha256`, `width`, `height`, `duration`, `container`, `codec`, `audio`, `fps`, `stripped=none` or `stripped=udta,meta`, `faststart=true` or `faststart=false`, `transport=stub`, and `database=postgres`. `faststart=false` means a slower first frame on phones. Import does not call fal, so the transport stays the stub. A 1080p 16:9 clip reads as width 1920 and height 1080. If he omits `--made-on` and the file has no creation time, the line is `refused: pass --made-on YYYY-MM-DD; the clip has no creation time database=postgres`. The same file a second time is `refused: this file was already imported database=postgres`.

```bash
npm run cli -- import --file "$HOME/clips/fenway.mp4" --keyframe "$HOME/clips/fenway.jpg" --source grok-imagine --prompt-file "$HOME/clips/fenway.txt" --subjects Fenway --title "Fenway" --made-on 2026-10-21 --live
```

Keep the clip. The five answers, in order, are extra players, text on boards, logo-like marks, subject identity, and soundtrack. Each must be `clear`. This prints `kept database=postgres`.

```bash
npm run cli -- keep --job <job-id> --answers clear,clear,clear,clear,clear --live
```

Record the Article 50 answer. He writes the answer, the disclosure, and the name. This prints `gate-recorded recordedOn=<the time> database=postgres`. A second recording prints `gate-already-recorded recordedOn=<the time already stored> database=postgres`.

```bash
npm run cli -- record-gate --answer "<answer>" --disclosure "<disclosure>" --by "<name>" --source A-06 --live
```

Publish. `--public-id` is letters, digits, `_` and `-`, at most 64 characters, starting with a letter or a digit. `--position` is the next free position. A taken position prints `record-failed live=false reason=position-taken database=postgres storage=r2`. A taken public id prints `reason=public-id-taken`. `list` prints each stored job, or `none database=postgres` when there are none. Pick a position that is not already in the catalog.

```bash
npm run cli -- list --live
```

Publish prints `published live=true database=postgres storage=r2`. When `--title` is omitted, publish uses the import's `--title`. That means the row is in the catalog view. The line names where it wrote. It does not by itself prove the file landed in R2. A missing Card fact prints `card-refused: missing ...` and names the fact. A failed upload prints `upload-failed live=false object=video status=<status> code=<code> database=postgres storage=r2`, or the same line with `object=thumbnail`. A failed delete adds `status=` and `code=` to its line. `code` is the S3 `<Code>` only, passed through the log redaction, or `network` when the request threw. The body is not printed. The same publish command again sends only the object that has no address yet. There is no ledger line and the caps do not move. `pinned_on` is the Brooklyn date of the import. The finish time is midnight in Brooklyn on `--made-on`.

```bash
npm run cli -- publish --live --job <job-id> --public-id fenway-wednesday --title "Fenway" --position 1
```

In the Cloudflare dashboard, the bucket named by `R2_BUCKET` has two keys: `moments/fenway-wednesday/video-<first 8 of the sha256>.mp4` and `moments/fenway-wednesday/thumbnail-<first 8 of the stripped keyframe>.jpg`. The video's eight characters match the import line. The thumbnail's eight characters are the stripped JPEG, not the file before the strip. After the custom domain is attached, the public address is `STUDIO_STORAGE_ORIGIN/moments/fenway-wednesday/video-<those 8>.mp4`.

In the Supabase SQL editor, the detail view returns the row. The public id's column is `id`. `endpoint` is `xai/grok-imagine (grok.com, made by hand)`. `prompt_expansion` and `seed` are null. `video_bucket` is `moments`. The object paths match the keys above without the leading `moments/`.

```sql
select id, endpoint, pinned_on, prompt, prompt_expansion, seed, subjects, video_bucket, video_object_path, thumbnail_object_path
from catalog.video
where id = 'fenway-wednesday';
```

To take the row out of the catalog and leave the files in R2, withdraw it. This prints `withdrawn removal=merged filesReadable=false database=postgres storage=stub`. The files are still in the bucket. `filesReadable=false` here means a delete was not asked for. `removal=merged` is the stub for the site's copy. No pull request is opened. A second unpublish prints `already-withdrawn database=postgres storage=stub` and does not delete.

```bash
npm run cli -- unpublish --live --job <job-id>
```

To withdraw and delete in one step, pass `--delete` while the clip is still published. When both deletes succeed this prints `withdrawn removal=merged filesReadable=false database=postgres storage=r2`, and the keys are gone from the bucket. If one delete fails, the same line has `filesReadable=true`.

```bash
npm run cli -- unpublish --live --job <job-id> --delete
```

After a withdraw, or after a delete that left one object, retry the delete. It sends only the object that is still recorded. When both are already gone it prints `delete-retried filesReadable=false idempotent=true database=postgres storage=r2`. Only 200 and 204 count as deleted. A 404 prints its `status=` and `code=` and leaves `filesReadable=true`. That was not verified against a live bucket.

```bash
npm run cli -- retry-delete --live --job <job-id>
```

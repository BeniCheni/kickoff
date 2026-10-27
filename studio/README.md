# Moments Studio

Local, offline core for Kickoff's own generated videos. The reader in `src/` does not import this folder. A green test run is not generation: every command uses the fal stub and the storage stub unless `--live` is present together with `STUDIO_LIVE=1` and the secret that command needs. This package does not call fal, Cloudflare, Supabase or Vercel in tests, and it does not open a pull request. `--live` is the only path that can upload, and only when `STUDIO_LIVE=1` and the named secrets are set.

`studio/db/` is the schema module. It imports nothing from the rest of `studio/`. The public row contract lives in `@kickoff/catalog` (`packages/kickoff-catalog`), installed as a copy (`studio/.npmrc`, `install-links=true`). After editing the package, run `npm ci` in `studio/` to refresh the installed copy before `npm test` sees the edit. CI installs fresh. Drizzle stays in this package. The tables live in the Postgres schema `studio`, which Supabase's Data API does not expose. The public app's names are the views `catalog.videos` and `catalog.video` (`videos` where `published_at` is not null, ordered by `position` — the view does not apply the order; the app does).

This package is not a release of Kickoff. v0.5.3 is the latest release.

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

`estimate`, `submit`, `poll`, `resume`, `download`, `import`, `list`, `keep`, `discard`, `cancel`, `publish`, `unpublish`, `retry-delete`, `retry-removal`, `close-session`, `attach-request`, `settle-unconfirmed`, `record-gate`, `record-balance`, `migrate`, `fetch-model`, and `embed --backfill`.

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

## The web admin

The admin is a local page on this Mac. It binds to `127.0.0.1:5176` and nothing else. It does not deploy, and it has no sign-in. Set the same directories as the CLI, outside the repo.

```bash
export STUDIO_ENV_FILE=$HOME/studio.env
export STUDIO_DATA_DIR=$HOME/studio-data
export STUDIO_MEDIA_DIR=$HOME/studio-media
export STUDIO_MODEL_DIR=$HOME/studio-models
npm run studio
```

`STUDIO_MODEL_DIR` may instead be a line in that env file. A leading `~` or `$HOME` in the value is expanded. Publish uses the directory for the similarity vectors.

The process prints one URL. Open that URL. It sets an HttpOnly, SameSite=Strict cookie and does not print the token again. A request without that cookie is refused. A write from another origin is refused. A Host header that is not loopback is refused.

```bash
npm run studio
```

That start is stub mode. The shell shows `transport=stub · fal=stub · database=pglite · storage=stub`. Paid submits use the fal stub. `STUDIO_STUB` selects the script, the same names as the CLI.

```bash
STUDIO_LIVE=1 npm run studio -- --live
```

`--live` starts only when `STUDIO_LIVE=1` and `DATABASE_URL` are set. It names a missing piece and does not print a value. It never opens the local database. `FAL_KEY` is not required to start. Without it, Submit, Regenerate, poll, Download and Retry download stay disabled and say so. When `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET` are set, storage is the R2 adapter and Publish shows the confirmation that the clip is live on the next read. Live publish records the stub's `merged` fallback status, and withdrawal records its `merged` removal status; no site copy is made, and the public reader does not use these statuses. Without those four names, storage stays `refused` and Publish shows that refusal instead: a publish does not write a catalog row, and unpublish with a file delete, retry-delete, and retry-removal are refused. The browser cannot switch the transport. Without `FAL_KEY`, poll, Download and Retry download refuse with `Unavailable: a live fal action needs FAL_KEY on this Mac, and none is set.` Jobs does not poll. Cancel and attach are not on this page: those addresses answer 404. The CLI still has `cancel` and `attach-request`. The shell prints `transport=`, `database=` and `storage=stub`, `storage=r2` or `storage=refused`. With a key it prints `fal=live`; without one, `fal=refused`.

Import is on this page. A PNG still is refused, with the `sips` line from the Wednesday section below. A file over 100 MB is refused. The clip must be `video/mp4` and the still `image/jpeg`.

### Wednesday, in the admin

From the repository root, one command at a time. The env file already holds `STUDIO_LIVE`, `DATABASE_URL`, and the four R2 names. It is also a valid home for `STUDIO_MODEL_DIR`.

```bash
cd studio
```

```bash
export STUDIO_ENV_FILE=$HOME/studio.env
```

```bash
export STUDIO_DATA_DIR=$HOME/studio-data
```

```bash
export STUDIO_MEDIA_DIR=$HOME/studio-media
```

```bash
export STUDIO_MODEL_DIR=$HOME/studio-models
```

One command starts the live admin. The shell prints `transport=live`, `database=postgres` and `storage=r2`. It also prints `fal=refused`. That is expected on Wednesday: Import does not need `FAL_KEY`. Jobs shows `Unavailable: a live fal action needs FAL_KEY on this Mac, and none is set.` for the same reason.

```bash
STUDIO_LIVE=1 npm run studio -- --live
```

The process prints one URL. Open that URL. It sets the cookie and is not printed again.

On Import, choose the mp4 and the JPEG. Type the prompt, choose Fenway or Frankenstein or both, type the title and the note, and set the made-on date. Read the file. The preview shows width, height, duration, frame rate, audio, fast start, and what Strip will remove. Import. The clip is downloaded, in Jobs and in Review.

On Review, play the clip and look at all four corners for a Grok watermark before you answer the logo line. Then answer the five lines Clear and Keep.

On Publish, record the Article 50 answer. Type the public id `fenway-wednesday`, the title, and position 1. The two storage keys appear before you press Publish. The confirmation says the clip is live on the next read. Then Publish.

In the Cloudflare dashboard, the bucket named by `R2_BUCKET` has those two keys. In the Supabase SQL editor, the same row the CLI section reads:

```sql
select id, endpoint, pinned_on, prompt, prompt_expansion, seed, subjects, video_bucket, video_object_path, thumbnail_object_path
from catalog.video
where id = 'fenway-wednesday';
```

On Publish, Unpublish takes the row out of the catalog. The files stay until Retry delete.

## Wednesday 21 Oct 2026

`--live` is what points a command at Supabase. Every command below carries it. Without `STUDIO_LIVE` set to `1` and `DATABASE_URL`, the command refuses and names the missing piece. It does not open the local database. With nothing set, `import`, `keep`, `record-gate`, `list`, `migrate` and a plain `unpublish` print `refused: --live needs STUDIO_LIVE and DATABASE_URL`. `publish`, `unpublish --delete` and `retry-delete` also name `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET`. Without `--live` the same commands print `database=pglite`, and a storage command prints `storage=stub`. `migrate` is the exception: it always uses Postgres, so without `DATABASE_URL` it refuses as well.

Beni does every account step himself. Nothing in this repo creates the bucket, the domain, the token, or the database password.

In Cloudflare he creates one R2 bucket, attaches his custom domain to that bucket, and creates an API token that can read and write only that bucket. In the env file outside the worktree he sets `STUDIO_LIVE` to `1`, and he sets `DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `STUDIO_STORAGE_ORIGIN`. The origin is the custom domain, with no path on the end, for the Next app at N6. The Studio does not read the origin when it uploads. `STUDIO_DATA_DIR` and `STUDIO_MEDIA_DIR` stay outside the worktree, as above. He does not commit the env file.

In grok.com/imagine, in his own browser, he makes the clip at 16:9 and 1080p and downloads the mp4. The still he gave Grok is the keyframe, saved as a JPEG. A PNG is refused (`refused: keyframe is not a jpeg`). Convert one with `sips -s format jpeg <still.png> --out <still.jpg>`. The prompt he typed goes in a text file. No one else opens that site.

From `studio/`, apply the migrations to his Supabase database. The migration prints `migrated database=postgres applied=<tags>`, or `applied=none` when nothing new applied. This CLI command then prints its own line, `migrated database=postgres`.

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

Publish. `--public-id` is letters, digits, `_` and `-`, at most 64 characters, starting with a letter or a digit. `--position` is the next free position. A taken position prints `record-failed live=false reason=position-taken database=postgres storage=r2`. A taken public id prints `reason=public-id-taken`. `list` prints each stored job. A job that holds a public id prints `public_id=`. A job that is still in the catalog prints `position=` as well. A withdrawn clip keeps `public_id=` and drops `position=`, because the position is free again and the public id is not. When there are no jobs, list prints `none database=postgres`. Pick a `position=` that is not already printed.

```bash
npm run cli -- list --live
```

Publish prints `published live=true database=postgres storage=r2 embedding=written`. When `--title` is omitted, publish uses the import's `--title`. That means the row is in the catalog view. The line names where it wrote. It does not by itself prove the file landed in R2. A missing Card fact prints `card-refused: missing ...` and names the fact. A failed upload prints `upload-failed live=false object=video status=<status> code=<code> database=postgres storage=r2`, or the same line with `object=thumbnail`. A thrown upload prints `upload-failed live=false object=video status=none code=network database=postgres storage=r2`. A failed delete adds `status=` and `code=` to its line, and a thrown delete prints `status=none code=network`. `code` is the S3 `<Code>` only, passed through the log redaction. `status=none` means the request threw and there is no HTTP status. The body is not printed. The same publish command again sends only the object that has no address yet. There is no ledger line and the caps do not move. `pinned_on` is the Brooklyn date of the import. The finish time is midnight in Brooklyn on `--made-on`.

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

## Embeddings

Publish stores two CLIP vectors for the clip after the catalog row commits. One is the keyframe, the thumbnail the clip already holds. The other is the text: the title, then a newline and the editorial note when there is one. The tokenizer truncates what the model sees. The source hash of the text is the SHA-256 of that exact string. The source hash of the keyframe is the thumbnail asset's `sha256`. A failure at this step does not unpublish the clip. The same outcome line gains `embedding=written` when a row was written, `embedding=stored` when the vectors already match, or `embedding=missing reason=` with one of `model-absent`, `model-corrupt`, `read-failed`, `embed-failed`, or `write-failed`. `model-corrupt` means a file is the expected size and its SHA-256 does not match the manifest. The check runs once, the first time this process loads the model, and before the model itself loads.

The vectors live in `studio.clip_embeddings`. Each row is one video, one kind (`keyframe` or `text`), and one model: `Xenova/clip-vit-base-patch32` at revision `d15189d7028b43f1d3e65039190477f6af591c2a`, dtype `fp32`, 512 dimensions. fp32 is the file the library asks for on CPU, the unsuffixed `onnx/vision_model.onnx` and `onnx/text_model.onnx`. The table has row-level security and no policies. `studio_reader` cannot select it.

`catalog.similar_moments(p_id text, p_limit integer)` and `catalog.moments_like(p_ids text[], p_limit integer)` return `id` and `score` only. Both are `LANGUAGE sql STABLE SECURITY DEFINER`, with `search_path` fixed to `pg_catalog, public, extensions, catalog, studio, pg_temp`, and `EXECUTE` granted only to `studio_reader`. Published means `published_at IS NOT NULL AND unpublished_at IS NULL`, the same rule as `catalog.videos`. The score is `0.7` times the keyframe cosine similarity plus `0.3` times the text cosine similarity. When either side has no text vector, the score is the keyframe similarity alone. A clip with no keyframe vector is never a candidate. `moments_like` first keeps the distinct non-null ids, in array order, and reads only the first 50 of those. A NULL element is dropped before that window, so it does not take a slot. An unknown, unpublished, or vectorless id still takes a slot. The mean is pgvector's `avg` of each kind over the rows inside that window that are published, have a keyframe vector, and share the model chosen from the window. Every distinct input is excluded from the result, including one outside that window. Fifty unknown ids followed by a published anchor return no rows. Rows are ordered by `score` descending, then `id` ascending, at most 12. Unpublish does not delete the vectors. The published rule hides them.

The model files are not in the repo. `STUDIO_MODEL_DIR` names the directory that holds them, and it is refused when it sits inside the worktree, the same way `STUDIO_MEDIA_DIR` is. The committed manifest lists the six files, their sizes, and their SHA-256s. OpenAI's CLIP repository states the MIT licence (https://github.com/openai/CLIP/blob/main/LICENSE, read 19 Oct 2026). The Hugging Face model page does not.

### After main is pulled

From `studio/`, one command at a time, after pulling the merged main. `npm ci` is also the install at the top of this file. Run it again here so the copied `@kickoff/catalog` in `studio/node_modules` matches the merged package.

```bash
npm ci --no-audit --no-fund
```

The env file already holds `STUDIO_LIVE`, `DATABASE_URL`, and the four R2 names. It is also a valid home for `STUDIO_MODEL_DIR`. These exports name the same directories the admin uses.

```bash
export STUDIO_ENV_FILE=$HOME/studio.env
```

```bash
export STUDIO_DATA_DIR=$HOME/studio-data
```

```bash
export STUDIO_MEDIA_DIR=$HOME/studio-media
```

The model files already on this Mac can be reused. They live in `$HOME/kickoff-st4-models/Xenova/clip-vit-base-patch32`. Leave that directory where it is. `$HOME/studio-models` is the other valid home when that directory already holds the same six files. A leading `~` or `$HOME` is expanded. The admin needs this same directory, in the shell or in the env file.

```bash
export STUDIO_MODEL_DIR=$HOME/kickoff-st4-models/Xenova/clip-vit-base-patch32
```

`fetch-model` reads the manifest and downloads only a missing file, only from the pinned revision. Each missing file prints `fetching <path> <bytes> bytes` before the request and `landed <path> <bytes> bytes` after the file is in place. The body is streamed to `<path>.partial`, checked, then renamed. An intact directory prints no fetching line. The command then prints `fetched database=none downloaded=0 skipped=6`. A file that is already there and does not match the manifest is left in place, and the command refuses. Running the backfill again does not replace that file.

```bash
npm run cli -- fetch-model
```

`npm run migrate` applies `0005_clip_embeddings.sql` with the earlier migrations. It prints one line, `migrated database=postgres applied=0005_clip_embeddings`, when 0000 through 0004 are already applied, or `applied=` and the tags it actually applied on a fresh database. A second run prints `applied=none`. The CLI form in the Wednesday section prints that same applied line and then its own `migrated database=postgres`.

```bash
npm run migrate
```

`embed --backfill` writes vectors that are missing for published clips and skips a row whose model and source hash already match. Each clip prints `clip=<id> embedding=written`, `embedding=skipped`, or `embedding=missing reason=<reason>`, then `database=postgres`. The last line is `embedded database=postgres written=N skipped=M missing=K`. `--live` needs `STUDIO_LIVE=1` and `DATABASE_URL`, and it does not open the local database. Read every clip line before treating the vectors as ready.

```bash
npm run cli -- embed --backfill --live
```

If `fetch-model` refuses because a file does not match, keep those files for inspection. Move that directory aside, or point `STUDIO_MODEL_DIR` at a fresh directory outside the worktree, then run `fetch-model` again so it can write valid files. Restart the admin after that. The hash check is cached for the life of the process, so a repaired directory is not re-read by the process that already loaded the bad one. Then run the backfill. The backfill alone cannot heal a bad model file.

Then run these two as `studio_reader`. The SQL editor runs as `postgres`. On Postgres 16 and later, `postgres` cannot `SET` a role it created until that role is granted to it. This was not verified on Supabase. Run the grant once, then set the role, then reset it.

```sql
GRANT studio_reader TO postgres WITH SET TRUE;
SET ROLE studio_reader;

SELECT routine_schema, routine_name, privilege_type
FROM information_schema.routine_privileges
WHERE grantee = 'studio_reader'
  AND routine_schema = 'catalog'
ORDER BY routine_name, privilege_type;

SELECT * FROM catalog.similar_moments('<a published id>', 6);

RESET ROLE;
```

Start the live admin from `studio/` in a shell that still has the same `STUDIO_MODEL_DIR`, or with that name in the env file. Future publishes then use the files `fetch-model` just checked.

```bash
STUDIO_LIVE=1 npm run studio -- --live
```

The Publish screen uses four draft sentences. On `published`: "Published. The similarity vectors are stored." and "Published. The similarity vectors were not stored. From studio/, run npm run cli -- embed --backfill --live." On `checks-failed`: "The similarity vectors are stored." and "The similarity vectors were not stored. From studio/, run npm run cli -- embed --backfill --live."

Those four sentences stay as approved. Beni ruled Keep for this PR on Tue 20 Oct 2026: a `model-corrupt` result still uses the generic missing sentence, and this PR adds no sentence of its own for that reason. Repair, a reason-specific sentence, is a follow-up after this PR merges. Until that follow-up, the recovery above is the instruction.

An HNSW cosine index covers the keyframe rows. At a handful of clips the function call plans as a Function Scan, so that index is not what the similarity query is shown using.

## The sample audience

Migration `0004_demo_social.sql` adds schema `demo`. It does not edit `0000` through `0003`, and it does not change `catalog.videos` or `catalog.video`. `npm run migrate` applies it with the others.

Three tables hold the sample shapes from `@kickoff/demo`: `users`, `video_stats`, and `comments`. The five reaction counts are integer columns (`heart_eyes_cat`, `joy_cat`, `soccer`, `fire`, `clap`), not a JSON document on the table. `video_id` stores a published public id by value. It is not a foreign key, so withdrawing a clip does not need this schema. Every row has `synthetic boolean not null default true`, and a check rejects any other value. The three tables enable row-level security and create no policies, the same posture as the Studio tables, so they stay off the Data API.

`demo.social_users`, `demo.social_stats`, and `demo.social_comments` are the read-only projections. Each one lists the package's fields and then `synthetic`, so a reader can refuse a row that is not synthetic. `studio_reader` receives `USAGE` on `demo` and `SELECT` on those three views. It receives nothing else in this schema. Turning that role into a login stays Beni's step, as it was for the catalog views.

`npm run seed:demo` generates that audience inside Postgres. It uses the same `DATABASE_URL` as `npm run migrate`, from the env file outside the worktree, and you run it as the owner. It does not run as `studio_reader`. For every published id in `catalog.videos` it writes modest view counts, the five reaction counts, and 3–12 comments with one level of replies. The names and lines are fictional. `setseed()`, `generate_series`, and a hash of the public id make the same catalog produce the same rows. Each clip's comments are dated from that clip's `published_at`: a top-level comment is `n * 3` minutes later, and each reply is two minutes after its parent. The longest unclamped stack is 35 minutes after the clip. Anything that would fall after the seed's own `statement_timestamp()` is clamped to that instant, and a reply stays after its parent. The Moments page renders a future instant as "just now", so the clamp keeps a Wednesday-afternoon clip from showing a stack of comments dated after Thursday. Two runs are byte-identical for every clip older than that 35-minute window, which is every re-seed after a publish that has had time to settle. A clip younger than the window can move on the next run, because the clamp follows the clock. Running it again truncates the demo tables and inserts them once more, in one transaction. It does not write `studio` or `catalog`. Run it after `npm run migrate`, again after the first real publish, and again after each later publish. If a clip's publish time is not yet one second in the past on the database's clock, the command exits non-zero, prints `Not seeded: a clip's publish time is not yet in the past on the database's clock. Wait a minute, then run npm run seed:demo again. The sample rows from the last run are unchanged.`, and leaves the previous sample rows in place.

`npm run migrate` prints `migrated database=postgres applied=` and the tags it applied, or `applied=none` when they were already there. `npm run seed:demo` prints `seeded database=postgres videos=N users=12 comments=M`. `database=postgres` names the engine, not the host.

After both, these two queries are the check. Run them as the owner.

```sql
SELECT table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'studio_reader'
ORDER BY table_name, privilege_type;
```

Five rows, all `SELECT`: `demo.social_comments`, `demo.social_stats`, `demo.social_users`, `catalog.video`, `catalog.videos`.

```sql
SELECT (SELECT count(*) FROM demo.social_stats) = (SELECT count(*) FROM catalog.videos) AS seeded;
```

`seeded` is true. The two counts are the same number, one row per published clip.

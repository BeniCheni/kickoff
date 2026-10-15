# N1 contract inventory

Read on 2026-10-15 (America/New_York), after `TZ=America/New_York date`, against
main **2837b011c9830ff37260d15907ad597efcea529e**. This is an inventory and proposed
N4 work, not a migration, a connection to a database, or evidence of live grants.
Non-release; v0.5.2 stays.

## Authority and scope

- [N0 plan](nextjs-migration-plan.md), especially §§2, 5–7, and its
  [review and Beni's answers](nextjs-migration-plan-review.md). The review withdraws
  the single-view proposal: use **both** catalog.videos and catalog.video.
- [Pivot record](moments-pivot-record.md), including §2b: the 12 October pivot is
  generated-only Moments, the whole app on Next/Vercel, server Drizzle reads,
  Supabase Storage with fallback thumbnails, and Studio publication.
- [Archived D9](design-cycle-moments-d9-spec.md), accepted on 13 October, export
  fingerprint `0286a20b5732fd50fa16062c5d264f21c7e9dee5af4731bbe403ce1497ac78c0`.
  It overrides the inherited [D5 provenance rows](design-cycle-moments-d5-spec.md).
  Illustrative design values are not records to insert.
- [ST1 README](../studio/README.md), [DDL](../studio/db/migrations/0001_catalog_gate.sql),
  [schema](../studio/db/schema.ts), and [writer](../studio/engine.ts), merged as #187.
  Repository definitions below are inspected; no live database is inspected.

Beni's 13 October N0 rulings carry: assigned Vercel address at N6; keep the offline
build at N3; parallel web/; Supabase Pro before public; Vercel Hobby subject to the
real sync-bot deploy proof; production read-only login at N6; Live Step 0; forever
Pages redirect; stub catalogs in previews; minor cutover with the number reserved.
The 12–13 October design rulings carry: native player controls, theater, terms,
autoplay on with its own key, no spoiler filter, fallback PRs through verify,
query-based watch routes, no relisting, recorded aspect ratio, stored object paths,
fallbacks nested by public id, K0 thumbnail, withdraw first, and D-64's deferred
cleanup for uploads that never acquired a published record.

N1 serves one unreleased scaffold locally. GitHub Pages remains the entire reader
until N7. N2 extraction, N3 ports/offline build, N4 schema additions, N6 operational
work and N7 cutover remain separate. Rollback is reverting this PR.

## A. Public columns on main

In these tables, **P** means present in the named view, **D** means derivable from
identified facts without guessing, and **M** means missing from that view.
Presence does not imply non-nullness or a correct writer: qualifications below
are part of the contract. L = catalog.videos (list); V = catalog.video (detail).
Both views retain their distinct purpose; no proposal combines them.

Both views select published rows with `published_at IS NOT NULL AND
unpublished_at IS NULL`, joining the video and thumbnail assets. Neither promises
row order. Consumers explicitly order by position for Beni's order. Public ids are
unique; published positions are unique. Dimensions, duration, seed and Storage
coordinates can still be null under the current schema; do not substitute design
measurements or fabricate a URL when validation fails.

Every current view column is accounted for here (L: 10 columns; V: 23 columns):

| Public column | L | V | Current underlying column | Design use / qualification |
| --- | --- | --- | --- | --- |
| id | P | P | studio.videos.public_id | Watch identity, title link, saved reference, fallback filename; never the internal UUID |
| title | P | P | videos.title | Card/watch/Up next/Earlier title; accessible names, countdown and playback announcements |
| editorial_note | M | P | videos.editorial_note | Optional card/watch note; append to L in N4 (A1) |
| position | P | P | videos.position | Beni's order, next/earlier boundary, generated-date tie breaker |
| published_at | P | P | videos.published_at | Publication time; never use as the generated date |
| endpoint | M | P | videos.endpoint | Model endpoint provenance; detail-only is appropriate |
| pinned_on | M | P | videos.pinned_on | Model pin date; detail-only |
| prompt | M | P | videos.prompt | Submitted prompt; display as text, detail-only |
| prompt_expansion | M | P | videos.prompt_expansion | Nullable; current submit writer does not populate generation.prompt_expansion, so null does not prove expansion was off (A4) |
| seed | M | P | videos.seed | Nullable text; never coerce to a lossy number or invent a seed |
| parent | M | P | videos.parent_public_id | Nullable; publication writer currently omits it even when generation_parent exists (A5) |
| generated_at | M | P | videos.generated_at | Gallery/watch/Up next dates and Newest order; append to L (A1). Writer uses job.finished_at, falling back to job.created_at; N4 must validate that fallback's meaning before claiming completion time |
| attestation_summary | M | P | videos.attestation_summary | Policy version, fictional-only declaration, checklist walker/time and summary as stored; detail-only, no parsing it into new authoritative fields |
| video_bucket | M | P | video asset.bucket | Stored media address; intentionally not needed by a list card |
| video_object_path | M | P | video asset.object_path | Stored media address; set the player's source only on Play |
| sha256 | M | P | video asset.sha256 | Full file digest; displayed prefix/suffix is D from this value |
| mime | P | P | video asset.mime | Media type. It does not prove audio codec, channels, or delivery headers |
| bytes | M | P | video asset.bytes | File size; display conversion is D. Studio also needs this before publication |
| width | P | P | video asset.width | Clip geometry and current thumbnail box under Q22; validate positive value |
| height | P | P | video asset.height | Clip geometry and aspect ratio; null/zero cannot silently become 16:10 |
| duration_s | P | P | video asset.duration_s | Card/watch/Up next duration; numeric-to-display conversion is D. Playback elapsed time comes from the element |
| thumbnail_bucket | P | P | thumbnail asset.bucket | Stored primary thumbnail address |
| thumbnail_object_path | P | P | thumbnail asset.object_path | Stored primary thumbnail address; K0 per current publication pipeline |

### Gallery, watch and Up next requirements

| Design field/state | L / V availability | Derivation or N4 addition |
| --- | --- | --- |
| Generated badge, Studio label, fictional-cat introductory copy | D / D | Generated-only product contract, not a filter or an inference from a title; publication validation must continue enforcing that contract |
| Generated date, Newest sort | M / P generated_at | A1 adds L.generated_at; descending generated_at, ties by position, preserving Beni's order |
| Optional editorial note on cards | M / P editorial_note | A1 adds L.editorial_note |
| Subject filter, including both cats matching either option | M / M | A2 adds an authored public subjects array to both views; never infer subjects from title, prompt, filename or id |
| Search, filtered count, total edition count | D / D | Search the validated public card fields; count loaded/filtered list rows. Counts are list counts, never views, likes or subscriptions |
| Saved references, Saved only, refused-storage notice | D / D | Browser state keyed by public id; local/in-memory persistence outcome, no database field |
| Browse order, shuffle remainder, undo/restore, active/earlier/next item | D / D | Public id + position + generated_at after A1; client ordering state and current watch id. Up next/Earlier use the list, not private jobs |
| Thumbnail loading, primary/fallback/cover and amber notice | D / D | Image load/error events plus stored thumbnail coordinates and public id. No database claim about the reason for a failed network request |
| Thumbnail K0 frame and aspect ratio | D with qualification / D with qualification | Current writer copies the first input asset into the thumbnail. A6 records explicit provenance and thumbnail metadata; current submit path does not populate K0 dimensions |
| Watch address, Copy link and route history | D / D | Public id and existing URL codecs; route contract below, no asset UUID |
| Watch title, note, model/prompt/file provenance | L intentionally partial / V P as above | Read detail by public id; do not widen L with prompt or private metadata just to avoid a second view |
| Video ready/playing/paused/muted/ended/refused/error, elapsed time, recovery | D / D | Native media events and play promise. Only published detail supplies media coordinates; no status fabricated from database fields |
| Countdown, hidden-tab pause, cancellation, theater, focus | D / D | Browser interaction state. Autoplay preference is the fourth storage key; no database field |
| No results vs unavailable vs not-found/withdrawn | D / D | Successful empty filtered list vs failed read vs successful missing detail. Fail closed on read error; no list reconstructed from shipped thumbnails or remembered records |

### Provenance completeness and proposed additive N4 changes

The following are proposals only. Keep existing public column names/types stable,
append new columns, preserve the publication predicate and both view grants, and
explicitly test the resulting projections and refusals. Private columns are sources
for a reviewed public projection, not permission for the reader to query studio.

| ID | Missing or incomplete design fact | Proposed N4 addition and source |
| --- | --- | --- |
| A1 | List generated date and editorial note | Append generated_at and editorial_note from videos to L. Validate generated_at against actual completion evidence; the current created-at fallback is not independently measured generation completion |
| A2 | Subject membership in L and V | Append subjects as a deterministic, distinct text array by videos.generation_id → generation_subject → subject. Project only approved public labels (Fenway/Frankenstein), not private UUIDs, trigger words or descriptions. Use membership for either-cat matching. Missing authorship is not “All subjects”; validate it before publication. The relation supports many subjects, but ST1's submit input currently accepts only one subjectId; multi-subject authoring is a later writer requirement |
| A3 | Reviewed-and-kept timestamp | Append kept_at to V from the authoritative event.at for that published job's kept transition (setJob records it transactionally). Define the relevant successful review cycle if more than one exists. Do not substitute published_at or policy attested_at |
| A4 | Requested resolution and reliable expansion ran/off + mode | Append requested_resolution and explicit prompt_expansion_enabled / prompt_expansion_mode to V, from validated generation.params or an additive publication snapshot. The existing prompt_expansion projection is present but its source is not written by submit. Preserve unknown as unknown until writer evidence exists; requested resolution and measured width/height are different facts |
| A5 | Parent identity, outcome, date; reliable “first generation” | Preserve existing parent and populate its public-id snapshot in the writer from generation_parent and the parent's publication identity. Append lineage_known, parent_outcome and parent_outcome_at to V from a deliberate public lineage snapshot. Parent generation UUID/status must not leak wholesale. A never-published parent lacks a public video id, and a withdrawn parent's public detail is unavailable: N4 must settle the public lineage identity/snapshot representation without exposing private ids. Null today cannot certify no parent. No private lookup or guessed outcome by the reader |
| A6 | Auditable K0/recipe statement and actual thumbnail file metadata | Append thumbnail_source, thumbnail_recipe_version, thumbnail_mime, thumbnail_bytes, thumbnail_width and thumbnail_height to V; add thumbnail_width/height to L if Q22 validation cannot guarantee equality with the clip. Metadata comes from the actual thumbnail asset; source/recipe need an explicit validated publication snapshot. The current pipeline copies K0 bytes/hash/MIME but does not store a recipe version or prove the rendered first frame. Measure/validate K0 and clip dimensions before promising equality |
| A7 | “AAC stereo, generated with the picture” | Append audio_codec, audio_channels and soundtrack_origin to V only after storing actual media inspection and generation provenance. These fields are absent even from today's asset table; additive backing metadata is a prerequisite, not something a view expression can invent. Video MIME and the model name cannot prove them |

The remaining provenance facts are present or derivable: generated_at; endpoint;
pinned_on; nullable seed; prompt as submitted; attestation_summary; MIME, duration,
dimensions, bytes and digest; stored video/thumbnail coordinates. The summary carries
the policy declaration, walker and attested time as text today. If later components
need separate policy_version, fictional_only, attested_by or attested_at fields,
append a validated public publication snapshot; do not reverse-parse prose. The
fictional-player notice, no outside source page, and “opening does not mark watched”
are product behavior/copy, not data columns. Spoiler-light is removed by Q18.

### Stored addresses and public identity

Q23 Stored means the application receives **bucket and object_path**, never guesses
an object name from an id, digest or file extension. For video use V.video_bucket
and V.video_object_path; for a thumbnail use the corresponding thumbnail fields
from either view. Given a separately approved public Storage origin at N6, construct:

```text
approvedStorageOrigin + /storage/v1/object/public/ + encodedBucket + / + encodedObjectPath
```

Encode the bucket and each path segment as path data, preserving separators; validate
the configured HTTPS origin and stored coordinates, reject empty/traversal segments,
and never treat a stored path as an arbitrary URL. The origin is not a database login
or an API key. No origin is configured in N1. This follows the documented
[public object route](https://supabase.com/docs/guides/storage/serving/downloads),
read 2026-10-15. Public delivery/Range/MIME behavior still needs N6 live proof.
ST1's current object naming and upload content types are writer facts, not reader
path-building instructions.

Q24/Q25 make the separate fallback deterministic: the future app's public asset
root contains `moments/thumbnails/<public id>.jpg`, served at
`/moments/thumbnails/<public id>.jpg`. The current Studio port names the repository
path `public/moments/thumbnails/<public id>.jpg`; N3/N6 must align its destination
with web/'s public directory while the apps coexist. No fallback is created here.

The watch query's decoded id matches views.id = videos.public_id exactly. Validate
the public-id contract, preserve the current search via URLSearchParams, and never
replace it with videos.id, asset.id or generation.id. On load, canonicalSearch runs
once using Brooklyn today; subsequent watch changes touch tab/watch only and preserve
the date pin, filters, lens and unknown keys. Unknown/withdrawn ids keep the URL and
render not-found; failed reads render unavailable. The gallery must not resurrect a
withdrawn record from fallback files. Shared codecs, history/popstate, hash and
preserved query behavior remain later implementation obligations.

### Privacy and terms

| Required fact | View status | Source / treatment |
| --- | --- | --- |
| No accounts, analytics, beacons, tracking; no browser database access; no cookies | D outside catalog | Audit built app, dependencies, cookies and network before public release; N1 cannot certify the prospective final app |
| Four browser keys and clearing site data | D outside catalog | kickoff-theme, kickoff-theme-broadcast, kickoff-moments-saved-v1, kickoff-moments-autoplay-v1; verify real read/write code at N5/N6 |
| Vercel, Supabase and font-provider disclosures | D outside catalog | Final hosting/font choices and observed requests; no fonts or hosting configured here. Do not ship the prospective Google Fonts sentence as an N1 observation |
| Fallback conditions and no new party | D outside catalog | Image-error chain after a successful public list/detail read; no cards on database failure |
| Fictional/non-commercial terms, changes/history | D outside catalog | Approved copy and repository history, not a database field |
| Audited-on date and app version | M until final audit; no view needed | Populate from the actual later audit and Beni's release choice. No invented stamp/version and no catalog migration for these facts |

### Studio-facing states: deliberately private

Neither public view can return unpublished jobs, withdrawal history or operational
secrets. These are **missing by design in L and V**. They must remain in the local
Studio's private controller/DTO, never become public-view additions merely to fill
a screen. Where the backing data is absent, the proposed addition is private and
belongs to the corresponding Studio/integration slice, not the reader's N4 grants.

| D9 surface / fields | Existing private source | Gap / later action |
| --- | --- | --- |
| Compose subject, model, prompts, seed, resolution, length, frame inputs, expansion, parent | subject; model; generation.prompt/params/seed; generation_input; generation_parent | Validate authored inputs; persist expansion and multi-subject intent (A2/A4); no public operational DTO |
| Jobs: state, completed substate, attempt, submitted/finished times, refusal, progress/timer | job.status/completed_substate/attempt/submitted_at/finished_at/refusal_reason; event.at/type/detail | Fifteen states plus completed's two substates are present. Elapsed display derives from real timestamps; no provider queue percentage unless actually supplied |
| Billed, estimates, reconciled/unknown amounts, session cap/balance | ledger.amount_usd/estimate_usd/basis/settlement/billable_units/unit_price_usd/running_session_total; session.cap_usd; balance_entry | Null amount means unknown, not zero. D9's historical prices are not current quotes; no spend/pricing call is made here |
| Review preview/file facts and checklist answers | asset local_path/MIME/bytes/dimensions/duration; generation output; policy_check and policy_answer | Measure missing K0/audio facts (A6/A7); keep/discard controls use actual state and gate, no fabricated review result |
| Kept-not-published selection: asset, authored title/note, file, thumbnail, attestation, public id, position | job kept state, generation/input assets, policy; publish arguments; videos on success | Pre-publication title/id/order are authoring inputs until written. Compute next published position transactionally in a later controller; the current publish API accepts position |
| Article 50 unanswered/recorded gate, verbatim answer, disclosure, recorder/date/source | article50_answer.answer/disclosure/recorded_by/recorded_on/source | Present privately. Missing answer keeps Publish disabled; Beni supplies it, no legal answer inferred here |
| Upload video/thumbnail, saved addresses, record-write success/failure, elapsed step times | asset.bucket/object_path; publish outcomes; videos published_at; job/event | Per-operation UI state comes from actual operations. Persist operation start/end/failure receipts later if recovery after restart requires them; not all drawn step times exist today |
| Fallback PR pending/failed/merged; retry; PR/checks link | videos.fallback_status; Storage port outcomes pr-opened/checks-running/merged/checks-failed | Status exists; durable PR URL/number, checks URL and distinct PR phase receipts do not exist in videos. Add a private delivery receipt in integration work; never equate merged with serving |
| Deploy building/serving, serving-since, open public link | No delivery timestamp/receipt today | Private deployment/serving evidence and assigned N6 app origin needed. No public view can derive serving time from published_at |
| Withdraw first, deleted files/retry, removal PR failed/retry, stored object links | videos.unpublished_at, video_removed_at, thumbnail_removed_at, removal_status; job withdrawn; stored coordinates | These are intentionally excluded from both views. Add private removal PR/checks/deploy receipts for phases/links not stored; no relisting |
| Uploads that never wrote a publication record | Uploaded asset coordinates and publish failure outcome | D-64 Defer: retain/reuse; no invented deletion route, Unpublish or Retry delete for never-published records. Cleanup arrives with real Storage work |

## B. Grants and the later login

The checked-in migration creates studio_reader, if absent, as **NOLOGIN,
NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOINHERIT**. It grants USAGE on catalog and
SELECT on **catalog.videos and catalog.video**, no studio grants. PUBLIC loses
access to studio/schema tables and catalog. Private tables enable RLS. The views
use security_invoker=false; deployment must preserve their owner/security boundary.
The conditional creation clause does not attest the state of an already-existing
role. These are repository DDL facts, not claims about an installed database.

N6: Beni creates the app's least-privilege login, assigns access to both public
views only (with schema usage and any membership activation made explicit), and
puts its credential in Vercel production settings under the N0 ruling. Do not
assume a NOINHERIT role membership automatically grants usable reads. Test both
view reads and every studio/write refusal with the actual login. Previews remain
synthetic, credential-free catalogs. No login, grant, role, key or database URL is
created or changed in N1; N0's proposed single-view migration is withdrawn.

## C. Server-import probe (U01)

Command: `node web/scripts/probe-server-imports.mjs`. Evidence:
[server-imports.json](../web/verification/server-imports.json). Eleven modules,
two fresh Node 24.15.0 processes each, using the root's existing tsx loader.
Plain mode removes all four browser globals (including Node's optional navigator).
Trace mode supplies inert getters and records exact source frames, continuing
beyond the first absent global. No exported function/hook is invoked by the harness.

| Imported reader module | Plain Node import | Import-time traced access | N2 implication |
| --- | --- | --- | --- |
| src/lib/urlCodecs.ts | succeeds | none | Candidate to share; rendering not tested |
| src/lib/lens.ts | succeeds | none | Candidate to share |
| src/lib/theme.ts | succeeds | none | env captures globalThis; storage reads/writes are deferred until called |
| src/lib/time.ts | succeeds | none | Intl/date functions; caller must preserve Brooklyn time semantics |
| src/lib/clock.ts | succeeds | none | Creates a Date.now-based snapshot at import; window/document access deferred to subscription. Not a per-request clock guarantee |
| src/lib/useNow.ts | succeeds | none | Hook invocation not tested; current useSyncExternalStore has no getServerSnapshot. N2 must handle SSR/hydration |
| src/lib/fixtures.ts | succeeds | navigator via Zod guard below | Reads/parses committed JSON; no network, guarded dependency access |
| src/lib/standings.ts | succeeds | navigator via Zod guard below | Same guarded schema dependency; computes from committed snapshots |
| src/lib/competitions.ts | succeeds | none | Candidate to share |
| src/lib/schema.ts | succeeds | navigator via Zod guard below | Import-safe in plain Node, not free of all browser-global inspection |
| src/themeBoot.ts | fails: window is not defined | window at themeBoot.ts:6; document at :7 and :8; localStorage at theme.ts:50 twice | Browser bootstrap entry. Preserve pre-paint behavior separately; never import this entry into a server component |

Exact accessing lines:

```ts
// src/themeBoot.ts:6
const lens = parseLens(new URLSearchParams(window.location.search).get('lens'))
// src/themeBoot.ts:7
document.documentElement.dataset.lens = lens
// src/themeBoot.ts:8
document.documentElement.dataset.theme = resolveThemeFromEnvironment(lens)
// src/lib/theme.ts:50 (called twice by the bootstrap)
return parseTheme(env.localStorage?.getItem(key) ?? null)
```

For schema.ts, fixtures.ts and standings.ts, the exact dependency line is
`node_modules/zod/v4/core/util.js:152`:

```ts
if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
```

The reader call site is src/lib/schema.ts:14, `export const teamSchema = z.object({`.
The trace sees two getter reads; plain Node succeeds because the check is guarded.
This table concerns import evaluation only, not server-safe invocation, subscriptions,
shared singleton lifetime, pre-paint execution or hydration parity. No reader module
was edited for the probe, and no shared-code extraction occurred.

## D. Versions, documentation and licences

Read date for this table: **2026-10-15**. Exact patches come from npm registry
metadata and the installed lock; documentation establishes the supported line and
configuration. All direct packages are pinned exactly in web/package.json.

| Tool | Chosen | Evidence / reason |
| --- | --- | --- |
| Next.js | 16.4.1 | [Support policy](https://nextjs.org/support-policy): 16.x Active LTS; registry stable latest 16.4.1. [App Router installation](https://nextjs.org/docs/app/getting-started/installation). Default output, Cache Components disabled, no font loader |
| React / React DOM | 19.3.1 / 19.3.1 | [React versions](https://react.dev/versions); installed Next peer range accepts ^19.0.0. Also satisfies root ^19.2.8; root lock/package unchanged |
| TypeScript | 6.0.3 in web; root stays 7.0.2 | [Next TypeScript/plugin](https://nextjs.org/docs/app/api-reference/config/typescript), [TS6 API continuity](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/). TS7 builds this scaffold but does not expose the JavaScript createLanguageService API required by Next's editor plugin; latest TS6 patch passes the real plugin probe |
| Tailwind and its PostCSS plugin | 4.3.3 / 4.3.3 | [Next integration](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [explicit sources](https://tailwindcss.com/docs/detecting-classes-in-source-files); PostCSS 8.5.30 |
| Node | local 24.15.0; CI 24 | [Release lines](https://nodejs.org/en/about/previous-releases). Engines copied exactly from root: ^22.22.2 or ^24.15.0 or >=26.0.0; no independent lower floor |
| Vitest | 4.1.11 | Same runner as root; independent config and explicit test directory |

The fallback from TS7 satisfies U01's **build or type-plugin** compatibility rule.
Both the Next CLI build/typegen and the in-memory editor-plugin diagnostic were
tested. No ignored type errors. next-env.d.ts is generated/ignored as Next documents;
typecheck runs typegen first, including on a clean CI checkout. All Next scripts and
CI set NEXT_TELEMETRY_DISABLED=1 ([telemetry documentation](https://nextjs.org/telemetry)).
Production build and web tests also passed under a macOS sandbox denying outbound
network except localhost IPC. Dependency installation is separate from build/test.

| Direct dependency | Exact version | Installed package licence |
| --- | --- | --- |
| next | 16.4.1 | MIT |
| react | 19.3.1 | MIT |
| react-dom | 19.3.1 | MIT |
| @tailwindcss/postcss | 4.3.3 | MIT |
| @types/node | 24.19.2 | MIT |
| @types/react | 19.3.0 | MIT |
| @types/react-dom | 19.3.0 | MIT |
| postcss | 8.5.30 | MIT |
| tailwindcss | 4.3.3 | MIT |
| typescript | 6.0.3 | Apache-2.0 |
| vitest | 4.1.11 | MIT |

## E. Tailwind sources and isolation

The reader keeps its existing automatic source detection from the root Vite build,
including eligible source/test/config/older-doc text, with Tailwind's normal ignored
file rules. It explicitly excludes docs/design-cycle-moments-*.md, studio/, and now
web/. It does **not** blanket-exclude docs/. The only N1 reader edit is the web
exclusion and its one-line comment beside the existing exclusions.

web/app/globals.css disables automatic detection and explicitly includes only its
own app/ directory. It scans no sibling reader, Studio, docs, tests or scripts.
A later shared source requires a named opt-in. See [web README](../web/README.md).
The built CSS test proves the web probe exists, is absent from reader CSS, and
all 343 reader utility selectors plus selected archived-doc markers are absent
from web CSS. The Studio's existing reader marker remains absent.

The [verification receipts](../web/verification/README.md) record deliberate
red/green breaks, root/web discovery and TypeScript selection, all 13 client-marker
breaks, verify timing, and the [whole-tree SHA-256 manifest](../web/verification/reader-parity.json).
After this document was written, the final reader builds matched all 12 manifest
entries byte for byte, including the 39,043-byte stylesheet. No additional source
exclusion was needed. Never blanket-exclude docs to hide a future difference.

No schema/grant change, Fixtures/Table port, fonts, Vercel project, deployment,
database connection, shared-code extraction, version/tag or release is part of N1.
The public address, live operations, Article 50 answer, spend, later model/provider
proofs, release number and final merge remain Beni's.

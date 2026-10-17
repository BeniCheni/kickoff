# Kickoff N4 — the Moments data contract and the D9 reader's build plan, by Cursor (archived Fri 16 Oct 2026, TZ=America/New_York)

Written by Cursor (Grok 4.7 Extra High) on Fri 16 Oct 2026 from the brief [nextjs-migration-n4-plan-prompt.md](nextjs-migration-n4-plan-prompt.md), against main `da4d548`. It is a plan, not a build brief. The PM seat scored it and Beni answered its questions in [nextjs-migration-n4-plan-review.md](nextjs-migration-n4-plan-review.md), which also records the PM seat's one adjustment: `verify` runs the Studio's contract tests rather than its whole suite (N4-Q9). The plan's questions Q1 to Q8 are recorded as N4-Q1 to N4-Q8. The text below the rule is the plan verbatim (SHA-256 `2992a61ef7d8cac5d2fb1fa5a13b4bff0cf31ec3c64fafe1eb3bd476e1ebf5b9`), including one local working-tree path in its §11, as the N0 archive kept its own.

---

# Kickoff N4 — the Moments data contract, and the build plan for D9 in the Next app

Written Fri 16 Oct 2026, America/New_York, by the planning seat in Cursor (Grok 4.7 Extra High). `TZ=America/New_York date` printed `Fri Oct 16 17:53:49 EDT 2026` immediately before this file. The read is detached `origin/main` at `da4d5481b708845a3e0f4443381e7db2942e1e50`. This is a plan. It does not change the repo, open a branch, or call a provider.

The rulings in `docs/moments-pivot-record.md` §1–§3b and `docs/nextjs-migration-plan-review.md` stand. In particular the app reads both public views, `catalog.videos` and `catalog.video`, and nothing in `studio`. The single-view migration in the N0 plan's §6 and §7 N4 row stays withdrawn.

D9 is the design source (`docs/design-cycle-moments-d9-spec.md`). Its provenance sentences are the D6 §3 sentences, which first appear in D5. Values D9 marks ILLUSTRATIVE are not records. Nothing below is inferred from a title, a prompt, a file name, or an id.

A value's status is one of:

- **Present now** — a column of `catalog.videos` (list) or `catalog.video` (detail) at `da4d548`.
- **Addable now** — not on that view, but already stored, so migration 0002 can project it. The table and column are named.
- **Needs a Studio writer change first** — the public fact is not recorded. The view must not grow a column that would invent it.
- **Not recordable honestly** — today's files and tables do not contain the fact, and a writer cannot store it by copying a value it already has.

**Copy** is a fixed D9 sentence with no interpolated fact. It is not one of the four data statuses.

Nullable columns that are present are still present. The reader treats null as unknown. Section 4 says what it shows.

---

## 1. The field contract

List columns today (`studio/db/public-columns.ts:7-18`, `studio/db/migrations/0001_catalog_gate.sql:110-128`): `id`, `title`, `position`, `published_at`, `thumbnail_bucket`, `thumbnail_object_path`, `mime`, `width`, `height`, `duration_s`.

Detail adds (`studio/db/public-columns.ts:20-44`, `0001_catalog_gate.sql:129-159`): `editorial_note`, `endpoint`, `pinned_on`, `prompt`, `prompt_expansion`, `seed`, `parent`, `generated_at`, `attestation_summary`, `video_bucket`, `video_object_path`, `sha256`, `bytes`. The shared columns are the same names and the same sources.

Both views keep `published_at IS NOT NULL AND unpublished_at IS NULL`. Neither view orders rows. `id` is `videos.public_id`. Asset and job UUIDs are not selected.

The download writer stores a video asset as sha256, `video/mp4`, byte length, and local path. It does not set width, height, or duration (`studio/engine.ts:860-867`). The keyframe insert stores sha256, `image/jpeg`, byte length, and local path, and does not set width or height (`studio/engine.ts:439-446`). Publish copies those null dimensions onto the thumbnail (`studio/engine.ts:979-988`). So `width`, `height`, and `duration_s` are present and, on the engine's own path, null. Test fixtures that fill them (`studio/test/fixture.ts:38-64`) are not the writer.

`generated_at` is written as `job.finished_at`, or `job.created_at` when the finish time is null (`studio/engine.ts:1050`). A normal poll sets `finished_at` when the provider result is mapped (`studio/engine.ts:690-694`). The created-at fallback is not a measured completion time. The column is still the stored instant. The reader shows that instant and does not re-derive it.

### Gallery and cards

| Value | Source | Status |
| --- | --- | --- |
| Eyebrow `Kickoff Studio · generated video` | D9 copy (`docs/design-cycle-moments-d9-spec.md:114`) | Copy |
| Heading `Fenway and Frankenstein.` | D9 copy, same line | Copy |
| `n of m videos` | Count of loaded list rows, and of rows that pass the current filters. `m` is the loaded list, not a stored edition size | Derivation from list rows. **Present now** once `id` is on the list |
| `Generated in the Studio · never a match still` | D9 copy, same line. The edition-head paragraph hides at `max-width: 760px` in the Vite sheet (`src/index.css:141-148`). The Next sheet has to restate that rule; N4 does not edit `src/index.css` | Copy |
| Badge `Generated` | D9 copy (`d9-spec.md:115`). There is no kind column. The badge is the generated-only contract, not a guess from the title | Copy |
| Title, the card's accessible name | List `title` ← `videos.title` (`0001_catalog_gate.sql:114`) | **Present now** |
| Duration `m:ss` | List `duration_s` ← video `asset.duration_s` numeric(12,3) (`0000_studio_tables.sql:23`, `0001_catalog_gate.sql:122`) | **Present now**, nullable. Omit when null. Do not fill 15.084 or `0:15` |
| `Generated <date>` | Detail `generated_at` ← `videos.generated_at` timestamptz (`schema.ts:296`, `0001_catalog_gate.sql:143`). Not on the list | **Addable now** on the list, from `studio.videos.generated_at`. Format is the Brooklyn calendar date of that one instant (`src/lib/time.ts:99-107` is the existing zone helper). `published_at` is a different instant and is not this date |
| Editorial note | Detail `editorial_note` ← `videos.editorial_note` (`0001_catalog_gate.sql:134`). Not on the list. Publish stores the optional note (`engine.ts:1038`) | **Addable now** on the list, from `studio.videos.editorial_note`. Omit when null |
| Thumbnail box `aspect-ratio` | List `width` and `height` ← video asset (`0001_catalog_gate.sql:120-121`). Q22 uses the clip's frame for the card, not a fixed 16:10 | **Present now**, nullable. Use them only when both are integers greater than zero. Otherwise set no ratio. Do not use 16/9 or 16/10 as a stand-in, and do not use the thumbnail asset's dimensions, which are not on the list |
| Thumbnail address | List `thumbnail_bucket` and `thumbnail_object_path` (`0001_catalog_gate.sql:117-118`) | **Present now**, nullable. The reader does not build a storage path |
| Public id, for the watch query and the site-copy file name | List `id` | **Present now** |
| `Thumbnail loading` | The img has not fired load or error | Browser |
| Amber fallback and cover lines | The img's error event, after a successful list read. The sentences are D9 copy (`d9-spec.md:116`). The words do not diagnose HTTP status | Browser, plus copy. Amber only here: it says where the picture came from |
| Cover word `STUDIO` and `Original typographic art · no thumbnail could be loaded` | D9 copy, same line. Last step of the chain. Not a stored image | Copy |
| Save label, pressed state, `visit only`, and the refusal notice | Browser storage under `kickoff-moments-saved-v1` (`src/lib/momentsSaved.ts:4-40`). The notice is D9 copy (`d9-spec.md:117`) | Browser. No database column |

The card does not show a view count, a like count, a comment count, a subject chip, a file size, or a prompt.

### Subject filter, counts, and order

D9's `Find a video` control is the filter summary, one tab stop (`d9-spec.md:118`, focus list at `d9-spec.md:240`). The deck does not add a free-text field. N1's inventory line about searching card fields (`docs/nextjs-migration-n1-inventory.md:89`) is not a D9 control. N4 does not add one.

| Value | Source | Status |
| --- | --- | --- |
| Summary `Find a video` and `filtered / total` | Copy, plus the same two counts as the edition head | Copy and derivation |
| Options `All subjects`, `Fenway`, `Frankenstein` | D9 copy (`d9-spec.md:118`). The two names are the approved public labels, not a scan of titles | Copy |
| Whether a video matches Fenway, Frankenstein, or both | `studio.subject.name` through `studio.generation_subject` (`schema.ts:72-80`, `schema.ts:138-145`, `0000_studio_tables.sql:91-96` and `192-200`). The engine inserts at most one `subjectId` (`engine.ts:454-456`). The CLI has no subject flag (`studio/cli.ts:35`). `seedClip` inserts a subject and does not link it (`studio/test/fixture.ts:18-19`, `74-85`) | **Addable now** as `subjects text[]` on both views, names only, and only the two labels. Empty array when nothing approved is linked. A title `Fenway` with an empty array matches neither subject filter. `All subjects` is the absence of a filter and shows every loaded row, including an empty array (`d9-spec.md:118`) |
| Sentence `A video with both cats matches either subject…` | D9 copy | Copy |
| `Beni’s order` and `Newest generated` | Copy. The sort keys are below | Copy |
| Beni's order | `position` ascending (`videos.position`, already on both views). Live positions are unique (`0001_catalog_gate.sql:5-6`) | **Present now** |
| Tie-break | Public `id` ascending, after position. Stated so a tie cannot depend on heap order. The unique index makes it defensive | Derivation. **Present now** |
| Newest | `generated_at` descending, then position ascending, then id ascending. D9: newest uses the date on the record, and ties follow Beni's order (`d9-spec.md:119`) | Needs list `generated_at`, **addable now** as above |
| Newest help sentence | D9 copy (`d9-spec.md:119`) | Copy |
| `Saved only` | The saved-id set intersected with loaded ids. An id in storage that is not in the successful list draws no card | Browser |
| `Shuffle remaining`, `Undo shuffle`, `Restore Beni’s order`, `Beni’s order for the remainder` | Memory for the visit. Not one of the four storage keys. Undo is disabled when there is no shuffle to undo (`d9-spec.md:65`, `d9-spec.md:120`) | Browser |
| What "remaining" is | The current filtered list, in the current browse order. Opening a video is not stored. D9's watched line says opening does not mark it watched (`d9-spec.md:137`). A visited-prefix would be a new record | Browser. This reading is in §7. It is not a new key |
| No-results heading and body | D9 copy (`d9-spec.md:121`). Used only when the list read succeeded and the filters match nothing | Copy, after a successful read |
| Unavailable heading and body | D9 copy (`d9-spec.md:122`). Used only when the list read failed. No cards, including no cards from memory or from files under `public/moments/thumbnails/` | Copy, after a failed read |

`0 of 0 videos` after a successful empty list is the count derivation, not the unavailable copy and not the no-results copy. No extra empty-catalog heading is invented here. The product heading stays the D9 heading.

### Saved references

| Value | Source | Status |
| --- | --- | --- |
| Which ids are saved | `kickoff-moments-saved-v1`, a JSON array of strings (`momentsSaved.ts:4-16`). An id is kept only if it is a non-empty untrimmed-equal string (`src/lib/momentsReferences.ts:2-3`) | Browser |
| `Saved reference` / `Not saved` | Whether the current public id is in that set | Browser |
| ` · visit only` and `Saved for this visit only…` | The write or read threw, or the stored value was not an array of ids (`momentsSaved.ts:17-40`, D9 copy at `d9-spec.md:117`) | Browser |
| A saved id that is not in the loaded list | Still in the browser if the write succeeded. No card | Browser plus the list. Withdrawal is not undone by the saved set |

The other two keys already exist and are not Moments data: `kickoff-theme` and `kickoff-theme-broadcast` (`src/lib/theme.ts:16-17`). The fourth key is in the watch section.

### Watch page, player, Up next, countdown

The player box is one 16:9 frame with bars for every clip. That is layout, not a claim that the clip is 16:9 (`d9-spec.md:212`). The card uses the record's frame. `poster` stays unset so the thumbnail chain, not the element, owns the picture before Play (`d9-spec.md:215`).

`preload="none"` is required (`d9-spec.md:76`). MDN, read 2026-10-16, says that value means the video should not be preloaded, and that the attribute is a hint the browser need not obey ([video element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video), DOCUMENTED). The binding control is stronger: the element has no `src` until Play, or until an automatic start that follows a Play the reader already pressed in this visit. Entry and re-entry do not set `src`. The element does not carry the `autoplay` attribute. MDN says that attribute would outrank `preload` (same page, DOCUMENTED).

| Value | Source | Status |
| --- | --- | --- |
| `← Gallery`, label `Watch` | D9 copy (`d9-spec.md:125`) | Copy |
| `Theater` / `Exit theater`, pressed state | View state. Not a URL parameter and not a storage key (`d9-spec.md:83`) | Browser |
| Escape leaves theater | D9 (`d9-spec.md:74`). One listener, only while theater is on. It is not a player shortcut map. It does not handle any other key | Browser |
| Video address | Detail `video_bucket` and `video_object_path` (`0001_catalog_gate.sql:145-146`) | **Present now**, nullable. No `src` until Play. If either value is missing or fails the URL checks in §7, Play does not invent an address; the watch page uses the not-playable recovery (code 4's sentence) without a request |
| `aria-label="Generated clip: <title>"` | Detail `title` | **Present now** |
| Before-Play picture | The card's thumbnail chain, for this id | Same as the card |
| Ready, sound on, muted, paused, ended, ended-last, returned, refused, now playing | The element's events and `play()`'s promise. Sentences are D9 copy (`d9-spec.md:126-127`). Paused time is `currentTime` and `duration` on the element. If the element has no finite duration, the numbers are omitted. They are not replaced with `duration_s` | Browser. The soundtrack clause in these status lines is the approved sentence, not an AAC measurement |
| Keyboard help, while the element is focused | D9 copy (`d9-spec.md:128`). No page-level key map (Q13) | Copy |
| Play, Pause, Replay, Retry, Next, Copy link | D9 copy (`d9-spec.md:130`). Next exists only in recovery | Browser |
| `Link copied.` / `Copy failed. The address is in the address bar.` | Clipboard result. The address is the current URL | Browser |
| Recovery headings and bodies | `MediaError.code` 2, 3, and 4 (`d9-spec.md:131`). MDN, read 2026-10-16: 1 aborted, 2 network, 3 decode, 4 source not supported ([MediaError.code](https://developer.mozilla.org/en-US/docs/Web/API/MediaError/code), DOCUMENTED). Code 1 returns to ready and has no panel (`d9-spec.md` inherits D5's aborted rule at `docs/design-cycle-moments-d5-spec.md:154`) | Browser |
| `Next opens "<title>".` or `There is no next video in Beni’s order.` | The next list row's title, or the end of Beni's order | Derivation. Title is **present now** |
| `Autoplay next stopped here…` | Shown in recovery when the switch is on | Copy plus the switch |
| Meta `Generated <date> · <duration> · <w> × <h>` | `generated_at`, `duration_s`, `width`, `height` on the detail view | **Present now**. Each clause is omitted when its value is null. The design's `3 Oct 2026 · 0:15 · 768 × 480` is illustrative (`d9-spec.md:11`, `d9-spec.md:132`) |
| Switch `Autoplay next`, On/Off, help sentence | Default on when the key is absent (Q16). Key `kickoff-moments-autoplay-v1` (Q17). Help is D9 copy (`d9-spec.md:133`). Stored values are the words `on` and `off`. Anything else reads as absent, so the default stays on. A refused write keeps the visit's choice in memory and does not add a fifth key or a new sentence | Browser |
| Up next and Earlier | The loaded list in Beni's order (`position`, then `id`), split by the current id. Not the private job list. Newest and shuffle change the gallery only. The designed sentences say Beni's order (`d9-spec.md:126`, `d9-spec.md:134`) | Derivation from list `id`, `title`, `position`, `duration_s`, and list `generated_at` once added |
| Row small line `duration · Generated <date>` | Those two fields. Duration omitted when null; date omitted when `generated_at` is null, which the column's source does not allow, but the reader still checks | Same |
| `Nothing after this one in Beni’s order.` | No later position | Derivation |
| Countdown `Up next in <n> s · "<title>"`, from 5 down to 1 | Timer plus the next title. Visible counter is aria-hidden and is not animated (`d9-spec.md:129`, `d9-spec.md:176`) | Browser |
| Announcement once at start, and once at Cancel | D9 copy (`d9-spec.md:129`). The live region is not rewritten every second | Browser |
| Pause while hidden | `document.hidden` and `visibilitychange`. MDN, read 2026-10-16 ([Document.hidden](https://developer.mozilla.org/en-US/docs/Web/API/Document/hidden), DOCUMENTED). A running countdown resumes from its number. An `ended` that fired while hidden starts its five seconds on return. Leaving the route or pausing stops it (`d9-spec.md:222-223`) | Browser |
| Automatic start | After that countdown, on the same element, only following a Play the reader pressed. A rejected `play()` leaves the next file loaded and Play as the primary control (`d9-spec.md:224`) | Browser |
| Focus on entry | The watch h1. Play then moves focus to the video element. The countdown does not take focus (`d9-spec.md:74`, `d9-spec.md:78`, `d9-spec.md:242`) | Browser |

### Source and curation

The block is one `<details>` summary, `Source & curation`. Every illustrative number in the canvas stays out. The row is omitted, or a clause is omitted, when its fact is missing. Section 4 is the policy; the recommendation below is omit.

| Clause | Source | Status |
| --- | --- | --- |
| `Kickoff Studio` | Copy | Copy |
| `generated <when>` | Detail `generated_at` | **Present now**. Brooklyn calendar date of that instant |
| `reviewed and kept <when>` | `studio.event.at` for `event.job_id = videos.job_id` and `event.type = 'kept'` (`schema.ts:211-218`, `engine.ts:187-218`). `keep` goes through `setJob`, which inserts that event in the same transaction (`engine.ts:913`). `policy_check.attested_at` is a different write, a moment earlier (`engine.ts:891-897`), and is not this time. `published_at` is not this time | **Addable now** as `kept_at`. Project the timestamp only when that job has exactly one `kept` event; otherwise null. Omit the clause when null |
| `published <when>` | Detail `published_at` | **Present now** |
| `Beni’s order <n> of <m>` | 1-based place in the position-ordered loaded list, and the length of that list. Not the raw `position` integer: a withdrawal does not renumber the others (`engine.ts:1075-1078` clears publication and does not rewrite `position`) | Derivation |
| `Model <endpoint>` | Detail `endpoint` ← `videos.endpoint` ← `model.endpoint` (`engine.ts:1045`) | **Present now** |
| `pinned <date>` | Detail `pinned_on` ← `videos.pinned_on` ← `model.pinned_on` (`schema.ts:91`, `engine.ts:1046`). It is already a calendar date string | **Present now** |
| `<resolution>` such as `480P` | The submit params may contain `resolution` inside `generation.params` jsonb (`schema.ts:106`, `engine.ts:433`, `studio/cli.ts:107-115`). Publish does not copy it onto `videos`. Measured width and height are a different fact | **Needs a Studio writer change first.** Do not project the JSON blob. Omit the clause |
| `seed <seed>` | Detail `seed` ← `videos.seed` ← `generation.seed` (`engine.ts:1049`). Nullable text | **Present now**. Omit the clause when null. Do not coerce it to a number |
| `Prompt expansion ran · <mode>` or `did not run` | Detail `prompt_expansion` exists (`0001_catalog_gate.sql:140`) and publish copies `generation.prompt_expansion` (`engine.ts:1048`). Submit never sets that column (`engine.ts:428-436`). The registry allows a `prompt_expansion` param (`studio/registry.ts:26-34`); the CLI does not send one (`cli.ts:107-115`). Null is not "off" | Column **present now** and unusable. The fact **needs a Studio writer change first.** Omit the clause. Do not treat null as off |
| Fictional-players sentence | D9 / D6 copy (`d9-spec.md:137`, `docs/design-cycle-moments-d6-spec.md:146`) | Copy |
| Policy version, fictional-only, walker, and attested time as separate fields | They are glued into `videos.attestation_summary` by the writer (`engine.ts:1051`). The summary is on the detail view (`0001_catalog_gate.sql:144`) | **Present now** as one string. Show that string. Do not parse it into new fields. The private columns `policy_check.policy_version`, `fictional_only`, `attested_by`, and `attested_at` stay in `studio` |
| `Regeneration of <parent id> (<outcome> <date>).` or `First generation; no parent.` | Detail `parent` ← `videos.parent_public_id` (`0001_catalog_gate.sql:142`). Publish does not write it (`engine.ts:1035-1053` has no `parentPublicId`). Submit can store `generation_parent` (`engine.ts:457-458`, `cli.ts:35`). A null public parent is therefore not evidence of no parent. A parent that was never published has no public id. A withdrawn parent's detail row is absent from the view | **Needs a Studio writer change first.** Omit the whole sentence. Do not look up a private generation id, and do not guess an outcome |
| `File <mime> · <duration> s · <w> × <h> · SHA-256 <8>…<4>` | Detail `mime`, `duration_s`, `width`, `height`, `sha256` (`0001_catalog_gate.sql:147-152`) | **Present now**. Mime is the stored string, not a forced `video/mp4`. Duration, width, and height are omitted when null. The digest clause is shown only when `sha256` matches 64 hex characters; the reader then takes the first 8 and the last 4. Otherwise the digest clause is omitted. `bytes` is on the detail view and is not in this sentence, so it is not displayed |
| `Thumbnail K0, the keyframe the clip starts from` | Publish copies the keyframe asset's hash onto the thumbnail (`engine.ts:979-988`). The keyframe is the `generation_input` row with role `first` (`engine.ts:439-451`). Equality of `asset.sha256` is stored on both rows when that path ran | **Addable now** as `thumbnail_is_keyframe boolean`: true only when the thumbnail hash equals that keyframe hash. Null when there is no `first` input. The row is shown only when the boolean is true |
| `recipe v0 makes it the clip’s first frame` | Recipe v0 is a registry comment (`studio/registry.ts:37-41`), not a column on the video. The pipeline does not store a recipe version and does not prove the keyframe is the rendered first frame of the mp4 | **Not recordable honestly.** Omit this clause. Do not copy the comment into the page |
| `Soundtrack AAC stereo, generated with the picture.` | `studio.asset` has no audio codec, channel count, or soundtrack origin (`0000_studio_tables.sql:15-29`). `video/mp4` does not say what the audio is. The model name does not either | Codec and channel count **need a Studio writer change** that inspects the file and stores the inspector's result. The words "generated with the picture" are **not recordable honestly**: no stored field says the soundtrack was produced with the picture. Omit the row |
| Hosted-clip sentence | D9 copy (`d9-spec.md:137`). It names Supabase and the Privacy page. It does not print the object path. The mime words are facts only when the stored mime strings are `video/mp4` and `image/jpeg` | Copy, plus detail `mime` **present now**, plus thumbnail mime **addable now** from the thumbnail `asset.mime` (`schema.ts:124`). If a stored mime differs, that clause uses the stored string. It is not rewritten to the design's example |
| `Opening a video does not mark it watched.` | D9 copy | Copy. No watched key, no watched column |
| Eyebrow `Prompt, as submitted` and the quoted prompt | Detail `prompt` ← `videos.prompt`, not null on the table (`schema.ts:292`, `0001_catalog_gate.sql:139`) | **Present now** |

Spoiler-light is removed (Q18). Its D5 sentence is not shown.

### Not found, withdrawn, and unavailable

| State | How the reader tells | What it shows |
| --- | --- | --- |
| List read failed | The list query threw or returned no validated payload | D9 gallery unavailable copy (`d9-spec.md:122`). No cards. Try again repeats the read |
| Detail read failed | The detail query threw | D9 watch unavailable copy (`d9-spec.md:136`). The URL is unchanged |
| Id not in a successful detail read | Includes an id that was never published and an id whose row is withdrawn. Both fail the view predicate (`0001_catalog_gate.sql:126-127` and `158-159`). Unpublish clears `published_at` and sets `unpublished_at` (`engine.ts:1075-1078`). The database refuses a later relist (`0001_catalog_gate.sql:38-40` and `92-94`) | D9 not-found copy (`d9-spec.md:135`). The URL is unchanged. The two cases are not distinguished, because the view does not say why the id is absent |
| Filters match nothing | Successful list, zero rows after filters | No-results copy |
| Successful list of zero | Successful list, no filters applied, zero rows | Count `0 of 0 videos` and no cards. Not the unavailable copy |
| Withdrawn id in the saved set or in history | The id is not in the successful list, so no card and no autoplay target | Not found if the URL still has it. Back returns to the previous entry. The reader does not substitute another video |

The cause of a failed read is not written into the page. D9's sentence is "The cause is unknown from here."

### Fallback thumbnail chain

Used only after a successful list or detail read (A-09). The chain is the img `error` event (`d9-spec.md:62`):

1. The URL built from the stored thumbnail bucket and object path, plus an origin supplied by configuration. N4's stub origin is the stub route in §6. N6's origin is the public Storage origin Beni records then. The shape Supabase documents, read 2026-10-16, is `https://[project_id].supabase.co/storage/v1/object/public/[bucket]/[asset-name]` ([Serving assets](https://supabase.com/docs/guides/storage/serving/downloads), DOCUMENTED). No project id is chosen in this plan.
2. On error, `/moments/thumbnails/<public id>.jpg`. The id is the view's `id`. The path is the Q24 path, not a storage key (`studio/storage/port.ts:25-26`).
3. On error, the typographic cover and the amber line `No thumbnail: Supabase and the site’s copy both failed.`

Step 1 is skipped, with no request, when the bucket or path is null or fails the checks in §7. The amber line for step 2 is `Thumbnail from the site’s copy · Supabase did not answer.` That sentence is the design's words for the error event. It is not a claim about a particular HTTP status.

A paused or unread database does not fall through to step 2. There are no cards (`d9-spec.md:213-214`).

### What this does not treat as data

Studio screens in D9 §1 (publish, jobs, unpublish, balance, Article 50, fallback PR phases) stay in the Studio. Their private columns — `fallback_status`, `removal_status`, removal timestamps, ledger amounts, the Article 50 answer — are not added to either view (`schema.ts:298-301`, inventory `docs/nextjs-migration-n1-inventory.md:178-198`).

N1's proposals, against this contract: A1 (list `generated_at` and `editorial_note`) and A2 (subjects on both views) and A3 (`kept_at` from the kept event) are the view change. A4, A5, and A7 wait for writers. A6 is split: thumbnail mime and the keyframe-hash boolean are addable; thumbnail dimensions, recipe, and a proof that K0 is the rendered first frame are not.

---

## 2. The additive view change

Migration `studio/db/migrations/0002_catalog_reader.sql` is new. `0000_studio_tables.sql` and `0001_catalog_gate.sql` are not edited. The journal `studio/db/migrations/meta/_journal.json` gains one entry so `drizzle-orm`'s migrator, which `studio/db/migrate.ts` calls, will apply the file. `drizzle-kit generate` is not run: it would rewrite the historical snapshots. A test in the same change asserts the bytes of 0000 and 0001 are unchanged.

PostgreSQL, read 2026-10-16, allows `CREATE OR REPLACE VIEW` to add columns at the end and forbids reordering or retyping the existing ones. Replacing a view changes its `SELECT` and its `WITH` options; ownership and grants remain ([CREATE VIEW](https://www.postgresql.org/docs/current/sql-createview.html), DOCUMENTED). The migration therefore uses `CREATE OR REPLACE`, restates `security_invoker = false` because the `WITH` clause is what gets replaced, and restates both grants so the file shows them. It does not `DROP` either view.

The publication predicate is unchanged. Every current column keeps its name, position, and type.

`studio/db/public-columns.ts` appends the same names, in the same order. Its header comment today names only `catalog.videos` (`public-columns.ts:1-5`). The same change names both views, so the comment matches the contract. That is a comment, not a return to one view.

### Columns

List, appended after `duration_s`:

- `generated_at` — `timestamp with time zone`, from `v.generated_at`. The table column is `NOT NULL` (`0000_studio_tables.sql:221`).
- `editorial_note` — `text`, from `v.editorial_note`, null allowed.
- `subjects` — `text[]`, the approved names, possibly empty, never null.

Detail, appended after `thumbnail_object_path`:

- `subjects` — the same expression.
- `kept_at` — `timestamp with time zone`, null unless the job has exactly one `studio.event` row with `type = 'kept'`.
- `thumbnail_mime` — `text`, from the thumbnail asset's `mime`.
- `thumbnail_is_keyframe` — `boolean`, null when the generation has no `generation_input` of role `first`; otherwise whether that asset's `sha256` equals the thumbnail's `sha256`.

Sketch, not applied:

```sql
CREATE OR REPLACE VIEW catalog.videos
WITH (security_invoker = false) AS
SELECT
  v.public_id AS id,
  v.title,
  v.position,
  v.published_at,
  thumb.bucket AS thumbnail_bucket,
  thumb.object_path AS thumbnail_object_path,
  vid.mime,
  vid.width,
  vid.height,
  vid.duration_s,
  v.generated_at,
  v.editorial_note,
  ARRAY(
    SELECT DISTINCT s.name
    FROM studio.generation_subject gs
    JOIN studio.subject s ON s.id = gs.subject_id
    WHERE gs.generation_id = v.generation_id
      AND s.name IN ('Fenway', 'Frankenstein')
    ORDER BY s.name
  ) AS subjects
FROM studio.videos v
JOIN studio.asset vid ON vid.id = v.video_asset_id
JOIN studio.asset thumb ON thumb.id = v.thumbnail_asset_id
WHERE v.published_at IS NOT NULL
  AND v.unpublished_at IS NULL;

CREATE OR REPLACE VIEW catalog.video
WITH (security_invoker = false) AS
SELECT
  v.public_id AS id,
  v.title,
  v.editorial_note,
  v.position,
  v.published_at,
  v.endpoint,
  v.pinned_on,
  v.prompt,
  v.prompt_expansion,
  v.seed,
  v.parent_public_id AS parent,
  v.generated_at,
  v.attestation_summary,
  vid.bucket AS video_bucket,
  vid.object_path AS video_object_path,
  vid.sha256,
  vid.mime,
  vid.bytes,
  vid.width,
  vid.height,
  vid.duration_s,
  thumb.bucket AS thumbnail_bucket,
  thumb.object_path AS thumbnail_object_path,
  ARRAY(
    SELECT DISTINCT s.name
    FROM studio.generation_subject gs
    JOIN studio.subject s ON s.id = gs.subject_id
    WHERE gs.generation_id = v.generation_id
      AND s.name IN ('Fenway', 'Frankenstein')
    ORDER BY s.name
  ) AS subjects,
  (
    SELECT e.at
    FROM studio.event e
    WHERE e.job_id = v.job_id
      AND e.type = 'kept'
      AND (
        SELECT count(*)
        FROM studio.event e2
        WHERE e2.job_id = v.job_id
          AND e2.type = 'kept'
      ) = 1
  ) AS kept_at,
  thumb.mime AS thumbnail_mime,
  (
    SELECT (thumb.sha256 = k0.sha256)
    FROM studio.generation_input gi
    JOIN studio.asset k0 ON k0.id = gi.asset_id
    WHERE gi.generation_id = v.generation_id
      AND gi.role = 'first'
  ) AS thumbnail_is_keyframe
FROM studio.videos v
JOIN studio.asset vid ON vid.id = v.video_asset_id
JOIN studio.asset thumb ON thumb.id = v.thumbnail_asset_id
WHERE v.published_at IS NOT NULL
  AND v.unpublished_at IS NULL;

GRANT SELECT ON catalog.videos TO studio_reader;
GRANT SELECT ON catalog.video TO studio_reader;
```

`ARRAY (SELECT …)` yields an empty array when no name matches, not null. `DISTINCT` plus `ORDER BY s.name` keeps one copy of each label. `subject.description` and `subject.trigger_word` are not selected. A linked subject named anything else is dropped, not published under a private name. The role `first` is unique per generation (`schema.ts:163`, unique index `generation_input_role`).

Not appended, because the fact is not recorded: requested resolution, an expansion on/off flag, a parent id, a parent outcome, a recipe version, thumbnail width and height, audio codec, audio channels, soundtrack origin. `prompt_expansion` and `parent` stay as they are, still nullable, and the reader still omits them when null.

### Order

The views do not sort. Beni's order, in the application, is:

```sql
ORDER BY position ASC, id ASC
```

Newest is:

```sql
ORDER BY generated_at DESC, position ASC, id ASC
```

`id` is the public id. Live `position` is unique under `videos_live_position`, so the id tie-break is defensive. The stub sorter uses the same keys. Public ids in the stub are ASCII, so the JavaScript sort and the database sort agree on those fixtures. A test with two live rows that share a position cannot be inserted through the partial unique index; the tie-break test uses the `ORDER BY` expression on a query of the view and does not require a duplicate position.

### How it lands

The file lands in the repo in N4a. Beni applies it to the hosted database at N6, with the reader login. N4 does not connect, does not call Supabase, and does not put a credential in Vercel. Until that application, the hosted views are the 0001 views. The Next reader in N4b does not read them. It reads the stub, shaped like the 0002 columns, so the DTO does not change again when the migration is applied.

`verify` today does not run the Studio suite (`/.github/workflows/ci.yml:27-44` has no `studio` step). `studio.yml` is path-filtered and is not a required check, because a skipped required check would block the sync bot (`/.github/workflows/studio.yml:1-6`). N4a adds the Studio typecheck and `npm test` to the `verify` job. It does not make `studio.yml` required.

### Permission tests

They extend `studio/test/schema.test.ts`, on the same local PGlite the suite already uses (`schema.test.ts:153-180`). No new dependency. No hosted database.

- As `studio_reader`: `SELECT` from `catalog.videos` and from `catalog.video` returns the published fixture and the new columns, in order, matching `publishedListColumns` and `publishedDetailColumns`.
- The same role: `SELECT` from `studio.videos`, `studio.asset`, `studio.generation`, `studio.subject`, `studio.generation_subject`, `studio.event`, `studio.job`, and `studio.ledger` is denied.
- `INSERT`, `UPDATE`, and `DELETE` on both views are denied. `CREATE`, `ALTER`, `DROP`, and `TRUNCATE` in `studio` and in `catalog` are denied.
- A row with `published_at` null and `unpublished_at` set is absent from both views. Its public id, prompt, and job id do not appear in either result.
- A linked subject named `Fenway` whose `trigger_word` is a private token projects `['Fenway']` and not the token. A linked subject named `Other` projects an empty array. A video titled `Fenway` with no link projects an empty array.
- One `kept` event projects `kept_at`. Two `kept` events project null. Zero `kept` events project null. `policy_check.attested_at` is not copied into `kept_at` when no kept event exists.
- `thumbnail_is_keyframe` is true when the hashes match, false when they differ, and null when there is no `first` input.
- The view options still say the invoker flag is false. The exact `reloptions` spelling is asserted by reading it in this test; this plan does not guess the catalog string. If the test sees invoker true, the migration is wrong.
- `0000` and `0001` file hashes match the hashes recorded at `da4d548`.

### The live application

Beni runs it at N6, on the hosted database, after Supabase Pro (N0-Q4) and as part of creating the app's read-only login (N0-Q6). The app does not migrate. Rollback of the repo change does not drop the columns if they have already been applied: they are additive, and a down-migration is not part of this plan.

---

## 3. The Studio writer changes

These are Studio slices, in Studio's lane. N4 does not build them. None of them is required before the Next reader can draw the gallery from the stub. The ones marked **before N6** should land before a real publish is what readers see. The ones marked **later** can follow the first real publish only if Beni accepts the omissions in §4 for those clauses.

Each slice records a fact the engine already has evidence for, or it refuses to publish when the evidence is missing. None of them infers a subject, a resolution, or a parent from a title or a file name.

### Before N6, not before N4b

**Geometry and duration.** On download, measure the mp4 at `local_path` and store `width`, `height`, and `duration_s` on that video asset. On keyframe insert, measure the JPEG and store `width` and `height` on that asset. Publish refuses when the video's width, height, or duration is null or not positive. Evidence is the file already on disk (`engine.ts:857-867`), not D5's 768 × 480 or 15.084. Tests use a fixture file whose headers the inspector agrees with, a publish that is refused when the measurement is skipped, and a view row whose numbers equal the fixture. The inspector is chosen in that slice. This plan does not name a library. If the slice needs a dependency, that dependency is part of its brief. Today's package has no media inspector (`studio/package.json:16-28`).

**One approved subject.** The CLI gains a way to link an existing subject by the public label `Fenway` or `Frankenstein`, resolving the label inside Studio. The command does not take a subject UUID. Publish refuses when the approved-label count is not at least one, and when any linked subject name is outside those two labels. The view can already return many names; this slice writes one. Tests: a title that contains `Fenway` and no link is refused; a link to `Fenway` projects `['Fenway']`; a `trigger_word` does not appear on the view.

**Generated time.** Publish refuses when `job.finished_at` is null. The writer stops substituting `job.created_at` (`engine.ts:1050`). Tests: a kept job with a finish time publishes that instant; a kept job without one is refused and writes no catalog row.

**Public id shape.** Publish refuses an id that is empty, longer than 64 characters, or outside `[A-Za-z0-9][A-Za-z0-9_-]*`. The watch page can still look up whatever the view returns. The refusal is so the Q24 file name and the query id stay the same safe token. Tests cover a slash, `..`, a space, and a leading hyphen.

### Later

**More than one subject.** `SubmitInput.subjectId` becomes a list. The CLI accepts both labels. The unique pair index already allows two rows (`schema.ts:144`). This is the slice Q-subjects is about. It is not required for the view, and not required for N4b, whose stub can carry both labels in the DTO.

**Requested resolution.** At publish, copy a validated resolution onto a new `videos` column only when `generation.params` has a `resolution` string that the registry row for that endpoint accepts. Today that is the string the price row matched (`registry.ts:87-96`). If the key is absent, store null. Do not copy the rest of `params`. A following additive migration, 0003 or later, can then append `requested_resolution` to `catalog.video`. Tests: `480P` in params becomes that column; a missing key stays null; width and height are not written into it.

**Prompt expansion.** At submit, store an explicit value only when the request sends the param or the provider response says what ran. `generation.prompt_expansion` stays null when the caller did not send it. The public column already exists. The reader keeps omitting null. Tests: omitted param stays null and is not the word `off`; a sent value is the value that was sent.

**Lineage snapshot.** At publish, write a snapshot, not a live join. If `generation_parent` has no row, the snapshot says the parent was checked and there is none, and the reader may then show `First generation; no parent.` If a parent row exists and that parent generation has a `videos.public_id`, copy that public id. If the parent was never published, the snapshot has no public id and the reader omits the id rather than printing a generation UUID. Outcome and outcome time are copied from the parent's then-current public facts: published, or withdrawn, or not published. Private statuses (`refused`, `failed`, `budget-refused`) are not copied as words. A later change to the parent does not rewrite the snapshot. Tests: null `parent_public_id` with no snapshot row is still omitted; a snapshot of "no parent" is the only way the first-generation sentence appears; a withdrawn parent's public id in the snapshot does not require the parent to remain on `catalog.video`.

**Thumbnail recipe.** Store `thumbnail_source` and `thumbnail_recipe_version` only from an explicit check. The hash boolean in 0002 remains the K0 claim. This slice does not start until something measures that the keyframe is the rendered first frame, or until Beni accepts a recorded recipe version that does not claim the frame extraction. Until then the recipe clause stays omitted.

**Audio.** Inspect the downloaded mp4 and store codec and channel count from the inspector's output. Store `soundtrack_origin` only if the provider response or the inspector supplies that fact. Do not store "generated with the picture" because the endpoint is an image-to-video model. Tests: a fixture with a known audio header projects codec and channels; a fixture the inspector cannot read leaves the columns null; the origin column stays null when the inspector did not say it.

### What N4 needs before a reader can see the gallery

The stub is enough. N4b does not wait for any slice in this section. A real catalog, at N6, should wait for the four **before N6** slices if Beni chooses the Card gate in §10. If he chooses None, a real card can be published with null geometry and no subject, and the reader omits those clauses. The later slices never gate N4b.

---

## 4. What the reader shows meanwhile

The general rule this plan recommends is **omit**: a missing fact is not given a sentence, and it is not given a "not recorded" line. D9's provenance values are illustrative. A line that says "not recorded" would be new copy, for Claude Design or Beni. Blocking publication is a Studio rule, not a sentence on the page. §10 asks Beni to pick the general display rule: Omit, Label, or Block. The table below is the recommendation if he picks Omit, with a publish block only where a card cannot be drawn honestly without the fact. Those blocks are the Card gate, also in §10. They are writer work before N6. They do not apply to the stub, whose records are complete on purpose, plus the one record that is missing a thumbnail address so the chain can be tested.

| Field | When it is missing | Recommendation |
| --- | --- | --- |
| Title, id, endpoint, pinned date, prompt, published time | Required on `videos`. A row that fails validation is a failed read, not a blank card | Unavailable for that read. Do not render a partial detail |
| Generated date | Should not be null on the table. If the DTO fails validation, the read fails | Same. The created-at fallback, while it exists, is still the stored instant and is shown. The writer slice stops the fallback; the reader does not detect it |
| Editorial note | Null | Omit the note. The card and the watch page lose that line only |
| Duration | Null | Omit `m:ss` on the card, the meta line, the file clause, and the Up next small line |
| Width or height, or either not positive | Null or unusable | Omit the frame clause. Set no `aspect-ratio`. Do not use 16:10. **Publish block** under the Card gate, so a live card is not in this state |
| Subjects empty | No approved link | The video appears under All subjects and under neither name. **Publish block** under the Card gate: at least one of the two labels |
| Saved state | Storage refused or empty | The existing visit-only copy, which D9 already has. Not a new sentence |
| Autoplay memory | Key absent, invalid, or write refused | On. No new sentence. The switch shows the visit's choice |
| Shuffle | Always memory | No persistence claim |
| Kept time | Null, or more than one kept event | Omit `reviewed and kept <when>`. The rest of that row remains |
| Seed | Null | Omit the seed clause |
| Requested resolution | Not on the view | Omit the resolution clause |
| Prompt expansion | Null | Omit the expansion clause. Do not say it did not run |
| Parent / first generation | No lineage snapshot | Omit the sentence. Do not say "first generation" |
| Digest | Missing or not 64 hex characters | Omit the SHA clause |
| Mime | Present by the asset constraint. If it is not `video/mp4` | Show the stored mime in the file clause. Do not replace it |
| Thumbnail mime | If it is not `image/jpeg` | Show the stored mime in the hosted sentence's thumbnail clause |
| Keyframe boolean | Null or false | Omit the K0 row |
| Recipe / first frame | Not stored | Omit that clause, including when the K0 row is shown |
| Soundtrack | Not stored | Omit the row, including AAC, stereo, and "generated with the picture" |
| Attestation summary | Required on the table | Show the stored string whole. If a future row failed validation, the read fails rather than a parsed substitute |
| Thumbnail bucket or path | Null or rejected by the URL checks | Skip the Storage request. Try the site copy, then the cover |
| Site copy | The second img errors | Cover and the amber line D9 already wrote |
| Video bucket or path | Null or rejected | Do not set `src`. Recovery uses the code-4 sentence. No invented URL |
| List read failed | — | Unavailable copy. No cards. No thumbnail chain |
| Detail read failed | — | Watch unavailable copy. URL unchanged |
| Id absent after a successful detail read | Never published, withdrawn, or unknown | Not-found copy. URL unchanged. Same sentence for all three |
| Successful empty list | Zero published rows | `0 of 0 videos`, the product heading, no cards. Not unavailable, and not "No videos match." |
| Filters empty the list | Read succeeded | No-results copy, including `0 of m videos` |
| Element has no finite duration while paused | — | Omit the numbers in the paused sentence. Do not fill them from `duration_s` |
| Clipboard refused | — | `Copy failed. The address is in the address bar.` That sentence is already in D9 |
| `play()` rejected | — | The refused sentence, with the title. The element keeps `src`. Play is the primary control |
| Next title missing | End of Beni's order | `There is no next video in Beni’s order.` Already in D9 |

Label, if Beni picks it, adds one line of new copy wherever this table says omit, and nowhere else. The words are not written here. Block, if he picks it as the display rule, would mean the Studio refuses to publish until resolution, expansion, lineage, recipe, and audio exist. That holds the first real video on facts §3 marks not recordable or later. This plan does not recommend that.

The Card gate, if he picks it, is only: positive width, positive height, positive duration, one approved subject, a safe public id, and a non-null `finished_at`. The page still omits every other missing clause.

---

## 5. The shared public contract

`web/` does not import `studio/` (`web/src-allowlist.mjs:5-8`; `tests/web-isolation.test.ts:36`; the disposable probe at `web/scripts/prove-isolation.mjs:36` imports `studio/db/schema` and must fail). `src/` does not import `studio/` (`studio/test/isolation.test.ts:40-50`). `studio/db/` imports nothing from the rest of `studio/` (`studio/test/schema-boundary.test.ts:20-37`). No test at `da4d548` forbids `studio/` from importing `src/`. N4a adds that assertion. The public DTO has to sit where both can import it without either graph crossing the other.

The DTO is the 0002 shape: the list object and the detail object, with nulls where §1 allows them, `subjects` always an array, and no Studio field. Zod is already the Studio's validator (`studio/package.json:19`, zod `4.4.3`) and the root app's (`package.json:25`). `web/package.json` does not depend on zod or on Drizzle (`web/package.json:18-32`).

A URL helper in the same public entry takes a bucket, an object path, and an origin. It encodes each path segment, rejects an empty bucket, an empty segment, `.`, `..`, a slash inside the bucket, and a path that is not a relative object key. It does not read the environment and it does not default the bucket to `moments`. The site-copy helper takes a public id and returns `/moments/thumbnails/<id>.jpg` only when the id matches the safe pattern; otherwise it returns null and the chain skips to the cover.

### Package — recommended

`packages/kickoff-catalog/`, name `@kickoff/catalog`, the package the N0 plan describes (`docs/nextjs-migration-plan.md:248-250`), narrowed for this slice.

N4 ships one entry, `/public` (the package root export): zod schemas, the column-name lists, the two URL helpers, and plain types. Dependencies: zod `4.4.3` only. No Drizzle, no `postgres`, no filesystem, no env, no fal.

The writer-only subpath stays out of N4. `studio/db/schema.ts` stays the table source. Moving it now would put Drizzle in the shared package. npm installs a package's dependencies for every importer, so `web/` would gain `drizzle-orm` even if it only imported `/public`. The client leak scan already flags the substring `drizzle` (`web/scripts/check-client.mjs:15-18`). Keeping Drizzle out of this package keeps that risk out of N4. At N6, a `/db` subpath can declare the views with Drizzle's `.existing()`, which is not emitted as `CREATE VIEW` ([Drizzle views](https://orm.drizzle.team/docs/views), read 2026-10-16, DOCUMENTED). That subpath's peer is the Studio's `drizzle-orm` `0.45.4`. It is a later package change, still with a zero-DDL proof.

Lockfile. There is no npm workspace (`package.json` has no `workspaces` field). Do not add one in N4: it would fold the root, `web/`, and `studio/` locks together and change `verify`'s cache paths (`ci.yml:23-26`). Studio and, when the reader imports the schema, `web/` depend on the package with a `file:../packages/kickoff-catalog` dependency. Each of those two lockfiles updates. The root lockfile does not. The offline bundle scan already fails if `studio/` or a database URL appears (`web/README.md:146-149`); N4a adds `@kickoff/catalog` to that denylist so the one-file build cannot carry the catalog schema. The root Vite app does not depend on the package.

Zero-DDL. The package contains no SQL. 0000 and 0001 are untouched. 0002 is the only DDL, and it is the column append in §2, not a side effect of moving files. A test imports the package's column lists and `studio/db/public-columns.ts` and asserts they are equal. Another asserts the migration hashes.

Isolation. `web/` may import `@kickoff/catalog` and still may not import `studio/`. `studio/` may import `@kickoff/catalog` and still may not import `src/` or `web/`. The package imports neither. The existing red probe stays: a disposable `web/` file that imports `studio/db/schema` (`prove-isolation.mjs:36`). N4a adds the same shape for a `studio/` file that imports `src/`, and for a package file that imports `studio/db/schema`. The public module has no `server-only` import, so a client component may validate a DTO. The module that loads records is a different file, in `web/`, and that file imports `server-only`.

N6 packaging. Vercel’s root is `web/` (N0-Q3, until N8). Turbopack’s root is already the repo root (`web/next.config.ts:21-23`), so the package is inside it. `transpilePackages` takes package names, not paths, and Turbopack auto-transpiles workspace packages only ([transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages), read 2026-10-16, DOCUMENTED). This repo is not a workspace, so N6 lists `@kickoff/catalog` in `transpilePackages` if the package is still TypeScript, or the package builds to JavaScript before publish. `outputFileTracingIncludes` for files outside `web/` is already an N6 item (`web/README.md:31-33`). The catalog credential and Drizzle client are created then, in a server-only module, not in this package.

Studio validates a publication by running the detail schema against the projection it is about to expose: the same object the view would return. The test builds that object from the engine's publish result and parses it. A private field in the object fails the parse.

### Generated module

A script would read the view SQL and emit zod. That adds a generator and a second source that can drift. Zero-DDL is possible if the generator emits only TypeScript. The isolation story is the same only if the output lives outside `studio/`. N6 would still have to package the output. The generator is another tool to pin, and a hand edit of either side can pass until someone regenerates. Not recommended. The column-list equality test in the package option is the cheaper drift check.

### Leave it in `studio/` behind a narrow entry

`studio/db/public-columns.ts` already has no imports. A new `studio/public.ts` could export zod. `web/` would depend on `@kickoff/studio`. That package depends on `drizzle-orm`, `postgres`, and `zod` (`studio/package.json:16-19`), and npm installs those for the dependent. The isolation test would have to allow one Studio path and keep forbidding the rest, which is a weaker gate than a package that cannot see `engine.ts`. Not recommended.

Recommendation: the package, public entry only, in N4a. The writer subpath waits for N6.

---

## 6. The stub catalog

N0-Q9: previews and CI read synthetic catalog records, never the database. N4b is that reader. There is no credential in N4.

The loader is one server-only function. It returns either a validated list plus a way to load one detail, or a failed read. It does not return a mixture.

### Records

The fixtures are JSON that parse as the public DTO and fail the schema if a field is added or dropped. They live in `web/fixtures/catalog/`, which is not a `public/` directory. The loader reads them only when `KICKOFF_CATALOG=stub`, and only from the path in `KICKOFF_STUB_CATALOG_FILE`. There is no string-literal fallback path. If the variable is unset, stub mode throws rather than opening a baked-in file.

The set, selected by that file, covers:

| Fixture | What it is |
| --- | --- |
| Empty | A successful list of zero. Count `0 of 0 videos`. No cards. Not the unavailable copy |
| One | A single detail and its list row. 16:10 frame, both thumbnail addresses set, one subject `Fenway`, note present, seed present, `kept_at` set, `thumbnail_is_keyframe` true, mime `video/mp4`, thumbnail mime `image/jpeg` |
| Several | At least four list rows: `Fenway` only, `Frankenstein` only, both labels, and an empty `subjects` array whose title is the word Fenway so a test can prove the filter does not read the title. One row is 16:9 (`width` 768, `height` 432). One is 16:10 (`768` by `480`). One omits the editorial note. One has null seed, null `kept_at`, and `thumbnail_is_keyframe` false, so the omitted clauses can be tested. Positions are 1…n so Beni's order is visible, and two `generated_at` instants are equal so Newest's tie-break is position |
| Missing thumbnail | One row whose thumbnail bucket and path are null. The chain starts at the site copy. A second step, in the browser test, points the site copy at a missing URL so the cover appears. The record does not include a guessed Storage URL |
| Withdrawn | The id `withdrawn-clip` is documented in the fixture's README and is not a row. `?tab=moments&watch=withdrawn-clip` is not-found. The URL stays. The same page is used for an id that never existed |
| Unavailable | A separate file the loader is pointed at that makes the function throw after the schema check is skipped on purpose, by a `mode` field outside the video objects. Both subject filters are irrelevant because there are no cards. The several-fixture covers both subjects and either subject |

Every video object includes the list fields and, in the detail file, the detail fields. `prompt_expansion` and `parent` are null. There is no resolution, no audio object, and no recipe string. Illustrative titles from the canvas are not reused as if they were real clips. The titles are plainly synthetic (`Stub Fenway one`, and so on) and the preview indicator is still required, because a realistic title is not the signal.

`subjects` on the both-labels row is `['Fenway', 'Frankenstein']` in that order, which is the view's `ORDER BY s.name`.

### Dummy media

No fal call. No frame from the design export. No course file. The N4b change commits bytes written by a script in that change, and records the measured byte sizes in the PR receipt. This plan does not invent those sizes.

The script may reuse the technique in `studio/test/jpeg.ts` (a synthetic JPEG built at run time, not a photograph) only as a pattern. The output is new bytes in `web/fixtures/catalog/media/`. It does not import `studio/`. A 16:9 record and a 16:10 record describe the card's CSS ratio. The image file's pixel size is whatever the script writes, and the receipt says so. The screenshot is not claimed to match the canvas.

The video file is a small valid MP4 so the element can fire `loadeddata`, `error`, and a rejected `play()`. It is not a generated clip and the page does not label it as one beyond the stub indicator. Object paths in the records look like the stored shape `<public id>/thumbnail-<8 hex>.jpg` and `<public id>/video-<8 hex>.mp4`, and the stub route resolves them through a map in the fixture, not by joining the path onto the disk. A path of `../` fails the URL helper and is not opened.

Those files are not under `public/moments/thumbnails/`. That directory is the real site-copy path. One stub id that is meant to exercise step 2 of the chain is served at `/moments/thumbnails/<that id>.jpg` by the stub route, not by a file committed where a later production deploy would treat it as a real thumbnail. The route returns 404 unless `KICKOFF_CATALOG=stub`.

Production reach. A production process does not set `KICKOFF_CATALOG=stub` and does not set `KICKOFF_STUB_CATALOG_FILE`. The fixture directory can still be in the git checkout. The route and the loader refuse to read it. A build of `web/` with those variables unset must not contain the sentinel string `KICKOFF-STUB-CATALOG`, which the fixture JSON includes, in `.next/server` or `.next/static`. If a bundler inlines the JSON anyway, that test fails and the import has to stay a runtime read of the env path. This is the cheapest leak check, and it is part of N4b's `verify` evidence.

### Telling stub from real

Every stub response carries `preview: true`. The Moments region renders a visible line, `Preview catalog`, in ordinary ink, not amber. Amber stays the thumbnail-trust line. The line is in the accessibility tree. It is present on the empty catalog, the gallery, the watch page, not-found, and unavailable. `data-catalog="stub"` is additional, not the only signal.

The production loader never sets `preview: true`. A component that sees `preview: true` while `KICKOFF_CATALOG` is not `stub` throws, and the page shows the unavailable state rather than the fixture.

Fail closed. If `KICKOFF_CATALOG` is unset or is `production`, a missing `KICKOFF_DATABASE_URL` makes the catalog function throw. Moments shows unavailable. Fixtures and Table do not call the function (`web/app/shell.tsx:50-55` is the branch; the fixture and table branches stay without it). The function does not catch the throw and substitute the stub. CI's `next build` does not set the stub variable (`ci.yml:34-41`). Tests that want the stub set it themselves.

`VERCEL_ENV`, read 2026-10-16, is `production`, `preview`, or `development` when system environment variables are enabled for the project ([system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), DOCUMENTED). The same page says that exposure is a project checkbox. A missing `VERCEL_ENV` is therefore not proof that the process is local. The fail-closed rule does not depend on it. An extra refusal, when the variable is present and equals `production` while `KICKOFF_CATALOG=stub`, is worth having. It is not the only gate.

N6 is the first time a real URL and a real credential exist. Until then every `web/` dev server and every preview is stub or, if the stub flag is off, unavailable. Neither is the live catalog.

---

## 7. The reader build

The Next app is `web/`. GitHub Pages stays the whole public app until N7 (`docs/moments-pivot-record.md:96`, N0-Q3). N4 changes the Moments branch inside `web/` only. `src/App.tsx` keeps rendering `MomentsPage` for the Vite app (`src/App.tsx:74-76`). The YouTube modules (`src/lib/momentsPlayer.ts`, `src/components/MomentsPlayerHost.tsx`, `src/components/MomentsSessionProvider.tsx`, `src/components/MomentsPage.tsx`) stay on disk for that app until N8. The Next app does not import them. `web/src-allowlist.mjs` already excludes them.

`web/app/shell.tsx` today renders `MomentsEmpty` when the tab is moments (`shell.tsx:50`). That empty state is the approved N2/N3 placeholder (`src/components/MomentsEmpty.tsx:1-9`). Replacing it on the Next tab is the approved N4 delta. Fixtures and Table stay the same components, the same URL codecs, and the same clock. `PrivacyFoot` stays a function that returns null (`shell.tsx:19-22`, called at `shell.tsx:57`). The `/privacy` page and the link in that seam are N5, as #206's synthesis carried forward.

The header keeps reading the root `package.json` version (`shell.tsx:1`, `web/README.md:4-5`). `web/package.json`'s `0.0.0` is not displayed.

### Routes and `watch`

One page, `/`, as N2 built it (`web/app/page.tsx`). `watch` is an opaque query parameter. There is no `/moments/<id>` path.

`canonicalSearch` normalizes the six owned keys and leaves every other key, including `watch` (`src/lib/urlCodecs.ts:49-65`). It runs once per load (`src/lib/useUrlState.ts:81-91`, called from `src/App.tsx:53` and from `web/app/shell.tsx:31`). D9's citation of `App.tsx:60` is the older file. At `da4d548` the call is line 53. A watch change does not call `canonicalSearch` again, so a date pin that has become today survives.

Merge rules, one function used by every watch change:

- Card title, card thumbnail (pointer; the thumbnail link stays `aria-hidden` and `tabindex="-1"`), Up next, and Earlier each set `tab=moments` through `encodeTab` and set `watch` to the row's public id. Each pushes one history entry.
- Automatic advance uses that same function. It also pushes one entry. It is not a replace.
- `← Gallery` deletes `watch` and pushes one entry. It leaves `tab=moments` and every other parameter.
- Fixtures and Table delete `watch` and set the tab. Fixtures omits `tab`, as `encodeTab` already does (`urlCodecs.ts:36`). Lens, date, `only`, `league`, `view`, unknown keys, and the hash are untouched.
- A hand-written `watch` while the tab is not moments does not render the watch page. The next navigation the app performs that is not "select Moments" deletes `watch`. Selecting Moments while `watch` is already present opens that id. That is N0's reading of an ignored parameter (`docs/nextjs-migration-plan.md:142`).
- Unknown, malformed, and withdrawn ids stay in the URL and render not-found.
- Theater is `useState`. It is not written to the URL.

The server page reads `watch` from the request and loads one detail. The gallery load is the list. Prompts are not sent with the gallery payload. A click is a real navigation to the merged query, so the server reads the new id. Autoplay calls the same navigation helper, not a second history stack. N0 left the exact Next adapter unverified (`docs/nextjs-migration-plan.md:138`). N4b's history tests are the check: one entry per enter, per Up next, and per automatic advance; Back returns to the previous id and then to the gallery; Forward retraces; `popstate` updates the screen.

Client merges read `window.location.search`, not a copy taken at render, so a parameter another control added is kept.

### Components

New modules live under `web/`, not under `src/`, so the Vite sheet and the Vite bundle do not gain them. `src/index.css` is not edited. The Next Moments rules are scoped under `.moments-gallery` and imported from the Moments client module. Tailwind's web scan already includes `web/app/` (`web/README.md:39-40`). Selectors that exist only to draw D9 do not land on Fixtures or Table. The parity script is the proof.

The gallery uses the list DTO. The watch page uses one detail DTO plus the list for Up next (titles, ids, positions, durations, generated dates — list fields, not prompts).

| Piece | Where |
| --- | --- |
| Edition head, filters, cards, no-results, unavailable | Moments gallery in `web/` |
| Watch route, stage top, player, status, countdown, actions, recovery, provenance, Up next | Moments watch in `web/` |
| `PrivacyFoot` | Unchanged null seam. N5 fills it |
| `/privacy` | Not created. N5 |

Saved references: add `src/lib/momentsReferences.ts` and `src/lib/momentsSaved.ts` to `web/src-allowlist.mjs`. They are pure and they do not import the player. Re-implementing the key would risk a second spelling. The Vite page keeps calling them. Autoplay storage is a new module in `web/`, because that key does not exist in `src/` yet. Putting it in `src/` would make the Vite bundle able to import a key the Vite page does not use; leaving it in `web/` keeps the Vite app unchanged.

The four keys:

| Key | N4 |
| --- | --- |
| `kickoff-theme` | Unchanged |
| `kickoff-theme-broadcast` | Unchanged |
| `kickoff-moments-saved-v1` | Used by the new cards, through the existing module |
| `kickoff-moments-autoplay-v1` | New. `on` / `off`. Absent means on |

The privacy page that lists the fourth key is N5. Between N4 and N5 the key exists only on the unreleased Next app. That is acceptable because Pages is still the public app, and N5 comes before the public cutover.

### The video element

One `<video controls playsinline preload="none">` on the watch page. Zero on the gallery. `src` is set in the Play handler, or in the automatic-start handler after a countdown that itself followed a reader Play. `preload` stays `none` as a hint; the test asserts `src` is absent and that no media request was issued, because the hint alone is not a guarantee (MDN, §1). Native controls and the browser's shortcuts only. The help sentence is shown while the element is focused. No `keydown` handler for Space, arrows, or `f`.

The same element loads the next id. The previous `src` is replaced. The node is not recreated, so a test can hold the element identity across Next.

Retry calls `load()` on that element, or sets `src` again if it was cleared. It does not open a second element. Next, in recovery, navigates with the merge function. It does not skip a failed id.

### Theater, copy link, countdown

Theater is a class on the watch layout: one column, Up next below, the player using the gallery's outdent. Escape exits when theater is on and the document is not in fullscreen. If `document.fullscreenElement` is set, the page does not steal Escape; the browser leaves fullscreen first. That interaction is checked in the browser, not assumed.

Copy link writes `location.href` after the current query. Success and failure use the D9 status line. The failure line does not print a reconstructed URL of its own.

The countdown interval writes the visible aria-hidden counter once a second. The visually hidden `role="status"` `aria-atomic="true"` region is written once at start (`Up next in five seconds: "<title>". Cancel stops it.`) and once at Cancel. While `document.hidden` is true the interval is cleared. On return it continues from the remaining second, unless `ended` fired during the hide, in which case the five seconds start then. Route leave and Pause clear it. Focus is not moved to Cancel. Cancel is in the tab order because it sits between the status line and the actions (`d9-spec.md:242`).

### Focus and history

Watch entry focuses the h1 (`tabIndex={-1}`). Play focuses the video element. Gallery return focuses the gallery h1. Unavailable and not-found focus their own h1. Filter changes do not push history. They are memory, as the current filters are (`src/components/MomentsPage.tsx:62-87` keeps them out of the URL). N4 does not add a filter parameter to the six codecs.

Shuffle permutes the filtered list in memory. Undo restores the previous permutation. Restore clears it and returns to position order. Newest replaces the base order and clears a permutation. Up next ignores all of that and uses position order, so the sentences that say "Beni's order" stay true.

### What stays identical

Fixtures, Table, the ticker, the staleness banner, the lens switcher, the theme bootstrap, the snapshot route, and the offline file. The offline file already turns `?tab=moments` into Fixtures and leaves the URL (`web/README.md:143-145`). N4 does not put a gallery in that file. The offline scan keeps failing if a catalog module or a video URL builder appears in `dist-offline/index.html`.

Motion stays the existing budget. The countdown is text replacement, not a transition (`d9-spec.md:172-176`). No new animation.

---

## 8. The split into PRs

Two Next PRs, in order, and a separate Studio lane. The public Pages site does not change in either Next PR: `src/App.tsx`, `src/index.css`, and the Vite build's Moments page stay as they are. Nothing is deployed.

### N4a — the shared contract and the additive views

Changes: `packages/kickoff-catalog` with the public zod schemas, column lists, and URL helpers; `studio/db/migrations/0002_catalog_reader.sql` and the journal entry; `studio/db/public-columns.ts` and its comment; Studio imports the schema and a test that a publish projection parses; the permission tests in §2; `verify` runs `npm ci` and `npm test` in `studio/` and typechecks the package. `web/` gains the `file:` dependency only if a test imports the schema. The reader UI does not.

Inert for readers. The Vite app still shows the YouTube-era Moments page. The Next app still shows `MomentsEmpty`. The hosted database is not migrated. No credential, no Storage call, no Pages change.

Evidence: `npm test` in `studio/` green, including the new grants and the unchanged-hash assertions for 0000 and 0001; package tests for the URL helper (reject `..`, encode a space, refuse to invent a bucket); isolation tests; `npm run typecheck` and `npm test` at the root and in `web/` still green. A short receipt says the views were not applied to a host.

Rollback: revert the PR. The hosted database has no 0002, so there is nothing to down-migrate. If someone had applied 0002 by hand, the extra columns can stay; the previous view SQL is not restored by the revert.

Seats: the builder the PM brief names; a fresh Claude Code session for Pass 1; the builder's Pass 2; synthesis by another vendor; Beni merges. This is the full frame (`docs/moments-pivot-record.md:103`). It is not a fast track: it changes the public schema.

### N4b — the reader on the stub catalog

After N4a has merged. Changes: the Moments gallery and watch page in `web/`; the stub fixtures and the stub media route; the fail-closed loader; the preview line; `shell.tsx` swaps `MomentsEmpty` for the gallery when the tab is moments; the allowlist adds the two saved modules; the autoplay key module; the `widthOnly` fix in `web/scripts/n3-next-vite.mjs`; the leak sentinel over `.next/server` and `.next/static`; the parity matrix in §9.

Inert for the public. Pages still serves the Vite app. The Next dev server and CI's `next build` are the only readers. With the stub flag off, Moments is unavailable and Fixtures and Table still render. `PrivacyFoot` still returns null.

Evidence: the matrix, the media tests, the history tests, the leak scan, root and web `verify`, and a browser pass of the Moments states. The receipt lists the dummy files' measured byte sizes.

Rollback: revert the PR. `shell.tsx` returns to `MomentsEmpty`. The stub files leave with the revert. Pages is untouched either way.

Seats: the same frame as N4a. A different builder may take N4b; the brief names them. Pass 1 is a fresh Claude Code session that did not write the diff. The builder writes Pass 2. Another vendor writes the synthesis. Beni merges.

### Studio writer slices

Not N4. Each is its own PR against `studio/`, after or alongside N4, and none blocks N4b. The order before a live publish, if Beni picks the Card gate: geometry and duration; one approved subject; refuse a null `finished_at`; safe public id. Later, in any order: multi-subject; resolution snapshot; expansion tri-state; lineage snapshot; thumbnail recipe; audio inspection. Each later slice that adds a public column is its own additive migration, 0003 onward, with the same grant and predicate rules.

Inert for readers until N6 applies the migrations and the Next loader reads the database. The stub does not grow a field when a later slice lands unless the DTO changes, and a DTO change is a catalog-package PR of its own, reviewed before the reader starts requiring the field.

Evidence, per slice: Studio tests on PGlite, the publish refusal cases in §3, and no change to `web/` unless the package's schema gains an optional field. Rollback is revert. A slice that has not been applied to the host has no data to undo.

Seats: the same frame. Studio's owner is the natural builder. The review is still a fresh Claude Code Pass 1, the builder's Pass 2, another vendor's synthesis, and Beni's merge.

### What is not a PR in this plan

No privacy page. No thumbnail-only fallback PR (that is Q19's publication path, a Studio action, not an app change). No cache revalidation (N5). No deletion of the YouTube modules (N8). No version bump. No deploy.

---

## 9. Evidence per PR

### N4a

Contract tests parse a list row and a detail row, reject an extra key, reject a missing key, reject a subject that is not one of the two labels, and reject a subject inferred by a title-only fixture (the schema has no title-to-subject rule; the test is that a title of `Fenway` with `subjects: []` parses, and that there is no helper that fills the array from the title).

Privilege tests are the list in §2, on PGlite.

The `verify` job runs them on every PR, including a sync PR, because a catalog change that only `studio.yml` sees can be skipped (`studio.yml:1-6`). Root `npm test` and `web` `npm test` stay in the same job.

No browser matrix. The UI has not changed. A smoke note says so.

### N4b

**Parity.** Fixtures and Table, against the Vite app, at three lenses, two themes, and widths 360, 375, 390, and about 1000. The viewport is set before the capture. `document.documentElement.scrollWidth === window.innerWidth` is recorded. A cell that differs only inside `.moments-gallery` is the approved Moments delta and is not a Fixtures or Table failure. Moments itself is shot across the same lenses, themes, and widths, for: gallery with several cards, empty catalog, no-results, unavailable, watch ready, playing, paused, ended, recovery, not-found, theater, countdown, and the typographic cover. Those shots are compared to D9's states, not to the Vite empty page.

**The comparison bug.** `widthOnly` in `web/scripts/n3-next-vite.mjs:158-171` treats a difference as a failure when `Math.abs(a.w - b.w) > 0.1`. In IEEE-754, `Math.abs(61.4 - 61.5)` is greater than `0.1`, so a one-tenth pixel gap is reported as a failure. The fix compares integer tenths of `w`: `Math.round(n * 10)` on each side, and a difference of 1 is the allowed boundary. Height stays an exact compare. `widthOnly` already returns false for every key other than `w` (`n3-next-vite.mjs:167`). N4b lands the width fix before the matrix runs, and adds a unit check that 61.4 against 61.5 is within the boundary and 61.4 against 61.6 is not.

**Contract and privilege.** The reader tests import the package schema and parse the stub files. Privilege tests stay in N4a; N4b does not reopen them except to confirm `verify` still runs them.

**Media.** A request log around the watch page before Play is empty. The gallery has no `video` element. The watch page has one, and Next keeps the same node. `src` is absent until Play. A network error shows the code-2 sentence and Retry, which does not add an element. A code-4 address shows the unsupported sentence and no Retry. A rejected `play()` shows the refused sentence and keeps `src`. `preload` is `none`. The `autoplay` attribute is absent. Automatic start sets `src` only after a countdown that followed a Play in the visit.

**History and focus.** Enter, Up next, and automatic advance each add one entry. Gallery removes `watch` only. Switching to Fixtures or Table removes `watch`. Back and Forward retrace. `only=epl` and an unknown key survive. `canonicalSearch` does not run a second time when `watch` changes. Watch entry focuses the h1. Play focuses the video. Escape leaves theater and does not run when fullscreen is active. Space is not handled by the page. The countdown announcement is the two writes in §7, and the interval stops while the document is hidden.

**Leak.** `web/scripts/check-client.mjs` stays the client-JavaScript scan. N4b adds a scan of the prerendered HTML and the RSC output under `.next/server`, plus `.next/static`, for the existing markers (`studio/`, `drizzle`, `DATABASE_URL`, `FAL_KEY`, `STUDIO_`) and for `KICKOFF-STUB-CATALOG` when the build was not in stub mode. `web/README.md:187-192` names this gap and assigns it to N4. The scan is the assignment, not a new product behavior.

**Fail closed.** A build and a server test with `KICKOFF_CATALOG` unset and no database URL render the unavailable copy on Moments and render Fixtures. They do not render a stub card. A test with `VERCEL_ENV=production` and `KICKOFF_CATALOG=stub` also refuses.

### Studio slices

Each slice's PR includes the tests named in §3 and a note that `web/` was not required to change. When a slice adds a column, it includes the same permission shape as §2: reader can select, cannot read `studio`, cannot write, and a withdrawn row is absent.

---

## 10. Questions for Beni

Each answer is one word. The recommendation is first.

**Q1. Split.** `Two` or `One`.
Recommend `Two`. N4a is the contract and migration 0002, with no reader. N4b is the gallery and watch page on the stub, including the `widthOnly` fix. `Two` means two reviews and a merge between them. `One` means the schema and the UI land together, so a revert takes both, and the matrix waits on the migration tests. Studio slices are outside either answer.

**Q2. Provenance.** `Omit` or `Label` or `Block`.
Recommend `Omit`. A missing clause disappears. `Label` needs new copy from Claude Design or from you for every omitted line in §4. `Block` refuses a live publish until resolution, expansion, lineage, recipe, and audio exist, which holds the first real video on facts that are not recorded today.

**Q3. Gate.** `Card` or `None`.
Recommend `Card`. Before N6, the Studio refuses a publish without positive width, height, and duration, one approved subject, a safe public id, and a finish time. `None` lets a live card through with those facts missing, and the page omits them. The gate is not a reader change and does not block N4b.

**Q4. Subjects.** `After` or `Before`.
Recommend `After`. The multi-subject writer lands after N4b. The view already returns an array, and the stub includes a both-labels row so the filter is tested. `Before` delays N4b until the CLI can attach both cats. A single subject on a real publish is still the before-N6 slice, whichever word you pick.

**Q5. Contract.** `Package` or `Generated` or `Studio`.
Recommend `Package`. `packages/kickoff-catalog`, public zod entry only, no Drizzle until N6. `Generated` adds a script that can drift. `Studio` makes `web/` depend on the Studio package and its Drizzle dependency.

**Q6. Media.** `Synthetic` or `Design` or `Course`.
Recommend `Synthetic`. N4b commits small generated bytes and records their measured sizes. `Design` would copy the canvas export into the repo. `Course` would copy the ByteByteGo material. Both of those are ruled out as sources.

**Q7. Wait.** `No` or `Yes`.
Recommend `No`. N4b does not wait for a Studio writer slice. `Yes` means the gallery waits for at least the geometry slice, and the stub is not enough to start the reader.

**Q8. Remainder.** `Filtered` or `Unopened`.
Recommend `Filtered`. Shuffle permutes the current filtered list, in the current browse order, in memory. `Unopened` would shuffle only the clips the reader has not opened, which the YouTube page did and D9's deck does not describe. Up next stays Beni's order either way.

---

## 11. Risks, unknowns, and not verified

**`security_invoker` catalog spelling.** The migration restates `WITH (security_invoker = false)`. PostgreSQL replaces the view's options on `CREATE OR REPLACE` ([CREATE VIEW](https://www.postgresql.org/docs/current/sql-createview.html), read 2026-10-16, DOCUMENTED). The exact `pg_class.reloptions` text was not read from a database in this session. Cheapest test: the N4a permission test selects the option and fails if the invoker flag is true.

**`id` collation.** Beni's order is `position ASC, id ASC`. JavaScript's default sort and PostgreSQL's default collation can disagree on non-ASCII ids. Cheapest test: the stub uses ASCII ids, and a PGlite query of two ASCII ids matches the JavaScript order. A non-ASCII id is refused by the before-N6 writer slice if Beni picks the Card gate.

**`preload="none"` is a hint.** MDN says the browser may still fetch, and that the `autoplay` attribute overrides the hint ([video](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video), read 2026-10-16, DOCUMENTED). Cheapest test: the media test asserts no `src` and no request before Play, and asserts the `autoplay` attribute is absent. A browser that prefetches after `src` is set is inside the Play contract.

**Escape versus fullscreen.** The plan says the page does not handle Escape while `document.fullscreenElement` is set. That interaction was not run. Cheapest test: one browser pass, enter theater, enter fullscreen, press Escape, confirm fullscreen exits and theater stays, then Escape exits theater.

**`VERCEL_ENV` absence.** The variable exists when the project exposes system environment variables ([system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), read 2026-10-16, DOCUMENTED). A missing value does not prove a local process. The fail-closed rule keys off the catalog flag and the database URL. Cheapest test: unset both catalog and database URL and confirm Moments is unavailable.

**File tracing of `packages/kickoff-catalog`.** Turbopack's root is the repo root (`web/next.config.ts:21-23`). Auto-transpile of a package applies to workspaces, and this repo is not one ([transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages), read 2026-10-16, DOCUMENTED). Cheapest test: N4b's `next build` imports the package and typechecks. If the build cannot see the package, add the package name to `transpilePackages` in that PR. N6 repeats the check on Vercel.

**PGlite versus hosted Postgres.** The permission tests run on PGlite, as `schema.test.ts` already does. A difference in view options or array ordering would show up at N6's first apply. Cheapest test before that apply: run 0002 on a local Postgres of the version Supabase documents for the project, once Beni has the project. Not in N4.

**`generated_at` fallback.** Until the writer slice, a publish can store `job.created_at` (`engine.ts:1050`). The reader will show it. Cheapest test: the writer slice's refusal test. Until that slice merges, no live publish is the mitigation, and N4 does not publish.

**`seedClip` does not link a subject or insert a kept event.** `studio/test/fixture.ts` is the existing helper. A test that only calls it will see `subjects: []` and `kept_at` null, which is correct and easy to misread as a view bug. Cheapest test: the N4a cases insert the link and the event themselves and assert the values.

**Float comparison.** Confirmed in this session with Node: `Math.abs(61.4 - 61.5)` is greater than `0.1`, so `widthOnly` (`web/scripts/n3-next-vite.mjs:168`) does not treat a tenth of a pixel as equal. Cheapest test: the unit check in N4b, then the matrix.

**Prerender leak.** `check-client.mjs` reads `.next/static/**/*.js` only (`web/scripts/check-client.mjs`, and the gap named at `web/README.md:187-192`). A secret in an RSC payload would pass today's scan. Cheapest test: the N4b scan of `.next/server` for the marker list and the stub sentinel.

**Supabase public object URL.** The documented form is `https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>` ([serving downloads](https://supabase.com/docs/guides/storage/serving/downloads), read 2026-10-16, DOCUMENTED). No project id is chosen here. The URL helper takes the origin as an argument. Cheapest test at N6: one HEAD of a real public object after Beni creates the bucket. Not in N4.

**Drizzle `.existing()` does not emit DDL.** Documented ([views](https://orm.drizzle.team/docs/views), read 2026-10-16, DOCUMENTED). N4 does not use it. The N6 subpath, if built, keeps a test that the migrator emits no `CREATE VIEW` from the package.

**Tests not run in this planning session.** The worktree at `/Users/benicheni/kickoff-n4-plan-tree` has no `node_modules`, and this plan installs nothing. Root, `web/`, and Studio tests were not re-run. The citations are from the tree at `da4d548`.

**Not verified, and left that way.** Hosted view grants after 0002. A real fal response's audio and resolution fields. Whether the browser pauses a `video` element on `visibilitychange` by itself (the countdown pause is the page's interval, not a claim about the element). The design export's pixel values, which D9 marks illustrative.

### Deliberately not done

No code, branch, commit, PR, account, or deploy. No edit under the Kickoff repo. No connection to Supabase, Vercel, or fal. No single public view. No text search. No likes, comments, or view counts. No fifth storage key. No relist of a withdrawn id. No invented kickoff time, duration, or frame. No 16:10 default. No use of thumbnail dimensions as the clip frame. No privacy page and no Privacy link (N5). No catalog cache tag (N5). No deletion of the YouTube modules (N8). No change to `src/index.css` or to the Vite Moments page. No version bump. No Pages publish. No course code and no design-export bytes in the repo. No Drizzle dependency in the shared package. No application of 0002 to a hosted database.

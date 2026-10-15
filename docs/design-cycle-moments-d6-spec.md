# Moments D6 — the design spec (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by Claude Design (Fable 5.1 Extra) on Mon 12 Oct 2026 against main `f523b52`. The D6 export's fingerprint is `c3812bf334aeb68832d9c3e1821a163440cda0446c8b92044a6142d7f2c77478` (the SHA-256 of its manifest), the fingerprint Codex reviewed in [design-cycle-moments-d6-review.md](design-cycle-moments-d6-review.md). The text below the rule is byte-identical to the export's `Kickoff Moments - D6 spec.md`, SHA-256 `9f9f2ecf661c2122578d69beb5095fd7f46f936f431ec4a28f0f7233054637a3`, as its manifest lists. It is archived because [design-cycle-moments-d9-spec.md](design-cycle-moments-d9-spec.md), the design source, carries the watch page's provenance rows "as D6 §3", and [nextjs-migration-n1-inventory.md](nextjs-migration-n1-inventory.md) maps those rows to the catalog views. Where the two differ, D9 wins; Beni's answers to D6's questions (Q13–Q22, A-09–A-11) are in [moments-pivot-record.md](moments-pivot-record.md) §2. The canvas and its `d6/` runtime stay in the export; nothing else from it is copied.

---

# Kickoff Moments — D6 spec

Written by Claude Design, Mon 12 Oct 2026 (TZ=America/New_York), against `main@f523b52`, beside the canvas `Kickoff Moments - D6 design canvas.dc.html` and the `d6/` folder (`data.js` — records, copy, cascade helper; `spec.md` — this text; `image-slot.js` and `support.js` — canvas runtime). Precedence: the Fergie Time design system › the D6 brief › any implementation prompt written from this. Nothing here claims a release number.

D6 redraws only what Beni’s 12 Oct pivot changes: Moments becomes a gallery of Kickoff’s own generated videos (Fenway and Frankenstein, made in the Studio through fal); the app moves to Next.js on Vercel and reads published videos from the Studio’s Supabase Postgres through Drizzle on the server; videos and thumbnails live in Supabase Storage, with a site-shipped copy of each thumbnail as a fail-safe; Publish is a Studio action, not a pull request; the watch page gains autoplay-next and omits likes, comments and view counts. D5 (`docs/design-cycle-moments-d5-spec.md`) stays the base for everything it still covers.

A frame on the canvas is a static receipt. It proves geometry, copy, contrast and accessible names; it does not prove playback, a browser’s autoplay policy, Supabase’s behaviour or a state machine, and nothing below says it does. Values marked **measured** come from a file or a receipt named here; values marked **ILLUSTRATIVE** are invented for illustration and must not be copied into a record as fact. On the canvas every title, date, note, seed, hash, prompt, sync stamp and thumbnail is ILLUSTRATIVE; measured are the clips’ 15.084 s, 768 × 480 and 10.0 / 10.4 MB (D5 Appendix S), every geometry printed under a frame, and every ratio in H1.

## 0 · Changelog, keyed to D5’s IDs

| ID | Disposition in D6 | Where |
| --- | --- | --- |
| A-01 Play-as-agreement (accepted 11 Oct) | **Superseded by the pivot, not overturned for cause.** There is no YouTube player, so there is no notice, no `aria-describedby` slot and no agreement-at-Play. The PM15 invariant (Developer Policies III.C) no longer binds anything on the site. | §3 (no notice copy); canvas section 4 |
| A-02 Terms of use (Define) | Kept as `#terms` on the privacy page, rewritten without the two YouTube sentences; whether it stays at all is **Q15 (recommend Keep)**. | §3 Privacy; frames 9a–d |
| A-03 GitHub Releases as host (Retain) | **Superseded by the pivot, not overturned for cause.** The host is Supabase Storage; D5 §10’s premises, proposals (`media-` tags, `make_latest`, non-overwrite, `verify-media`) and the release-address rule are withdrawn with it. | §9; frames 10-* |
| A-04 Upload publishes before merge (Disclose) | The spirit stays; the wording changes: Publish writes the record and the video is live at once; there is no merge. The screen states what Cancel, a failed upload, a failed record write and a failed fallback commit each leave. | §3 Studio; frames 10-publishing, 10-partial-* |
| A-05 10-minute ceiling (Propose) | Unchanged. | — |
| A-06 Article 50 gate (Clarify) | Unchanged in substance; it now gates **Publish** instead of Export. Both states drawn: no answer on file (Publish disabled, reason line `role="status"`) and an answer recorded (Publish enabled; the answer shown, never summarised). Nobody is named as the answerer. | §3 Studio gate; frames 10-publish-gate-none / gate-yes |
| A-07 Global Privacy & terms link | Unchanged mechanism (`ShellFoot`, last child of the 780 px wrapper, last tab stop). The tail text loses “the YouTube terms”: `Privacy & terms · what Kickoff stores, who sees a visit`. Drawn on every gallery and watch frame. | §3 Shell; every 1-*, 3-*, 4-* to 7-* frame |
| A-08 Q12 validator scope (Curated) | **Superseded by the pivot, not overturned for cause.** There is no `provider: youtube` record; the `/ YouTube` rule has nothing to validate. `validate-moments` keeps the schema check on whatever edition file remains and gains nothing from D6. | §9 |
| Q1 Generated badge (ink inverse) | Unchanged; present on every card and on the watch page’s meta line, rendered from the record’s kind, never hidden. | frames 1-*, 2-*, 4-* |
| Q2 native controls · Q5 sound on at Play | Unchanged. The watch page’s element is `<video controls playsinline preload="none">`, `src` set at Play, sound on. | §1 PlayerBox |
| Q3 poster: none | The attribute stays unset; **D6 shows the thumbnail in the box before Play** through the same `<img>` fallback chain as the card, swapped for the element at Play. The premise of Q3 (no fetched match still) no longer applies to Kickoff’s own thumbnails; the attribute stays off so that the before-Play picture obeys the three-step fallback instead of the browser’s single `poster` fetch. | frame 4-390-ready, 4-1000-ready |
| Q4 cover family STUDIO | Kept as the **last resort** of the thumbnail chain (both Supabase and the site’s copy failed), with a new label. | frame 2-last-L/D |
| Q6 frame ratio (bars in the reader) | Unchanged for the player box (16:9, 200 px floor, `object-fit: contain`, bars in `--media`). New: the card’s thumbnail box follows the record’s own frame (16:10 today) — **Q22 (recommend Record)**. | §6; frames 1-*, G |
| Q7 Cinema fade | Unchanged: no. | §4 |
| Q8 notice memory | Withdrawn with the notice (see A-01). | — |
| Q9 job state `exported` | Renamed **`published`**, same ink voice; a clip is published once and Publish never lists it again. New fifteenth state **`withdrawn`** (neutral outline) after Unpublish — **Q21 (recommend No relisting)**. | frames 12-jobs, 11-withdrawn |
| Q10 Present or Unsure blocks Keep | Unchanged. | — |
| Q11 privacy page home | The page becomes a route of the Next.js app (`/privacy`), statically rendered; the delivery contract of D5 §9 carries over where it can (token block copied from the app’s stylesheet with an equality test; theme from `prefers-color-scheme` without JavaScript; the stored `kickoff-theme` with it). | §9 |
| Q12 `/ YouTube` rule | Withdrawn with the YouTube records (see A-08). | — |
| D-23 source line DOM | The generated source line (`Kickoff Studio · Generated · fictional players · no fixture`) is folded into the watch page’s meta line and the Source & curation rows; the card no longer carries a source line (the badge, duration and date generated are the card’s facts). | §3 |
| D-25 one link from every Moments state | Satisfied by the shell foot alone once the Cinema overlay goes (Q14 Theater); if Q14 is answered Overlay, the Cinema keeps its own `.moments-foot` line as in D5. | §6 Q14 |
| D-29 picture rect | Re-measured for D6’s boxes: see §5. | G rigs |
| D-30 to D-35, D-38 (release hosting, export sentence) | **Withdrawn with the host.** | — |
| D-42 before-Play sentence · D-43 artefact names | Withdrawn with the YouTube section of the privacy page; the slice-4 test visit is no longer cited. | — |
| D-44 no keyboard shortcut | Reopened at Beni’s request as **Q13 (recommend Native)**. | §6; frame 8-shortcuts |
| D-45 geometry matrix | Kept and extended: 24 rigs, each rendering the skeleton at its width and measuring itself. | section 14 |
| D5 per-state Moments foot lines | **Withdrawn**; the shell foot covers every state the shell renders. | — |
| D5 B1 YouTube notice · the YouTube privacy section · the GitHub Releases export rows (§10, verify-media, the PR wording of A-04) | **Withdrawn** by the pivot. | — |
| D5 lead card (`.moments-lead`) | **Withdrawn**: a gallery of videos is a uniform grid; the magazine lead was the curated shelf’s. | §6 |
| D5 Filters: Competition, Category, Spoiler-light | Competition and Category go (no fixture, one kind); a **Subject** filter (Fenway · Frankenstein) replaces them; Spoiler-light is **Q18 (recommend Remove)**. Saved only and Browse order stay. | §3 Filters |
| D5 `Previous` / `Next` neighbour buttons | Replaced by the Up next list (and Earlier); `Next` survives in the recovery panel only, where the copy promises it. | frames 4-*-error-* |

## 1 · Component inventory, with states, by slice

**Slice: gallery**

| Component | States | Notes |
| --- | --- | --- |
| `VideoCard` — `<article data-kind="generated">`: thumbnail link (aria-hidden, `tabindex="-1"`), title link (the card’s name), meta row (badge · duration · date generated), optional data-trust line, note, Save reference | thumbnail: loading · from Supabase · from the site’s copy (amber line) · last resort (STUDIO cover + amber line); save: not saved · saved · save-refused (existing) | No count of any kind. Duration and date in Plex Mono. The whole thumbnail is clickable for pointer users; keyboard users get one stop, the title. |
| `Thumb` — `<img alt="" decoding="async" loading="lazy">` in a box `aspect-ratio: <w>/<h>` (the record’s frame; 16:10 today), `object-fit: contain`, ground `--media` | loading (box only, mono label) · loaded · fallback (src swapped to the site copy on `error`) · last resort (cover) | The chain is `storage → /thumbs/<id>.jpg → cover`, driven by the element’s `error` event; each step is reported in the card’s amber line. |
| `KindBadge` (D5) | one | unchanged |
| `EditionHead` — eyebrow, h1, count line | one | lens variants as `src/index.css`; the count line hides at ≤ 760 as today |
| `Filters` — Subject · Browse order · Saved only; order controls | existing | Spoiler-light removed if Q18 = Remove |
| `Unavailable` — the `.moments-empty` block with `role="status"` | one | drawn at 390 and 1000 |
| `NoResults` (filters) | existing, reworded | §3 |
| `ShellFoot` (A-07) | one | tail reworded |

**Slice: watch page**

| Component | States | Notes |
| --- | --- | --- |
| `WatchRoute` — `?tab=moments&watch=<id>` under the shell; `main.moments-gallery` | ok · not found / unpublished · server unavailable | one h1 per state; focus lands on it as the stage did |
| `StageTop` — `← Gallery` · label `Watch` · `Theater` / `Exit theater` | normal · theater | Escape exits theater |
| `PlayerBox` — one host, one `<video controls playsinline preload="none">`; thumbnail before Play; `src` set at Play; next video loads into the same element | ready · playing · paused · ended · countdown · cancelled · refused (browser declined the automatic play) · error 2 · 3 · 4 · aborted (→ ready) | native controls give play/pause, seek, time, volume, fullscreen, PiP where offered; nothing drawn over the picture |
| `StatusLine` (`role="status"`) | ready · sound on · muted · paused at t of d · ended · ended-last · refused | reads the element |
| `Countdown` (`role="status" aria-live="polite"`) below the player | running (text once a second, 5 → 1) · cancelled | never over the picture; focus unchanged; Cancel button beside |
| `PlaybackActions` — primary Play / Pause / Replay / Retry; `Next` (errors only); `Copy link` | per state | Copy link’s result in a `role="status"` line |
| `Recovery` (D5) + one sentence when autoplay is on | network · decode · not supported | never skips silently past a failure |
| `Heading` — h1 title; meta row (badge · generated date · duration · frame) | one | Broadcast left rail as the stage |
| `Note` (editorial), rail in `--accent-lead-strong` | one | |
| `Provenance` — `Source & curation` details | closed · open | rows §3 |
| `UpNext` aside — h2 `Up next`; `Autoplay next` switch (`role="switch"`); list of the videos after this one in Beni’s order; `Earlier` list of the ones before; empty sentence at the end of the list | autoplay on · off; list · empty | each row a link with a 96 px thumbnail (aria-hidden), title, `duration · Generated <date>` |
| Theater mode | on · off | one column; the player takes the gallery’s outdent (960 at 1000); Up next below |

**Slice: privacy**

| Component | States | Notes |
| --- | --- | --- |
| `/privacy` route — eyebrow, h1, intro, Stored in your browser, Who sees a visit (Vercel · Supabase · Google Fonts), Fallback thumbnails, Terms of use (`#terms`), Changes, stamp | one page, both themes, 390 and 1000 | copy §3; four keys if Q17 = Key, three if Visit |

**Slice: studio publish**

| Component | States | Notes |
| --- | --- | --- |
| `StudioShell` — TabNav Compose · Jobs · Review · **Publish** | as D5 | Export renamed |
| `Publish` — intro; Kept, not yet published (table); Where it goes (Storage · Record · Fallback copy); Publication gate · Article 50; Confirm | gate none (Publish disabled + reason) · gate recorded · publishing (four steps: upload video · upload thumbnail · write record · commit fallback copy) · published · partial: commit failed (live, fallback copy missing, Retry commit) · partial: upload failed (nothing live, listed again) | the record write is the publication |
| `Unpublish` — statement; `Unpublish` · `Unpublish and delete the files` · `Cancel` | confirm · withdrawn (three steps done) | |
| `Jobs` table + `spill` pills | fifteen states: D5’s fourteen with `exported` → `published`, plus `withdrawn` | billed `pending` amber italic unchanged |

## 2 · Tokens reused or added

Reused, no change: `--bg --surface --surface-alt --media --text --text-secondary --text-muted --pitch --pitch-deep --floodlight --floodlight-strong --floodlight-bg --accent --accent-strong --border --border-strong --accent-lead --lens-accent --on-accent-lead --accent-lead-strong --font-display --font-sans --font-mono`, radii 4 / 3 (thumbnail top corners, as the cover) / 9999, hairlines 1 / 1.5 / 3 px, the 44 px control height, `.label-caps`, the StatusPill geometry (9 px, 700, .05em, 1px 6px, 4 px corners), `.moments-kind` (D5), `.kickoff-foot` (D5), `.spill[data-voice]` (D5, gains the `withdrawn` neutral outline — an existing voice).

Added, each a design-system change:

- **Thumbnail box** — `aspect-ratio: <w> / <h>` from the record (16:10 today), `background: var(--media)`, `object-fit: contain`, `border-radius: 3px 3px 0 0`. Replaces the fixed 160 / 180 px cover heights.
- **Gallery grid** — `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` above 760; one column at ≤ 760 as today. Gives 1 · 2 · 2 · 3 columns at 390 · 761 · 888 · 1000 (G).
- **Data-trust line on a card** — `.moments-trust`: 11 px Plex Mono, `color: var(--floodlight-strong)` on `--surface`. New use of an existing pair (5.65 / 9.71). Amber because it is a statement about where a picture came from and why — provenance, not decoration.
- **Switch** — `role="switch"` button: label in Inter 12 px, state word in a pill (`--pitch` fill with `--bg` text when on, 4.82 / 7.75; `--surface` with `--text-secondary` and a 1.5 px `--border-strong` outline when off, 6.54 / 7.40). No new colour.
- **Countdown slot** — `--surface-alt` block, 10px 12px, 4 px corners, Plex Mono 12 px 500; the StalenessBanner idiom without the rail.
- **Native-controls band** — canvas only: the browser’s own control strip, drawn as a 36 px band so a frame shows where it sits. Not a product element.

Nothing changes in the design system’s type scale: the card title keeps the app’s 28 px h3, the watch h1 keeps 32 px (Poster clamp as the stage), Up next keeps the queue’s 27 px h2.

Design-system drift (D5 §2) stands: the DS mirror’s `--ink-muted` differs from the app’s; the canvas uses the app’s values from `src/index.css`.

## 3 · Copy deck — every sentence, verbatim

Shell (A-07), the foot: `Privacy & terms` (the link) ` · what Kickoff stores, who sees a visit`.

Gallery:

- Eyebrow `Kickoff Studio · generated video` · h1 `Fenway and Frankenstein.` · count `4 of 4 videos` / `Generated in the Studio · never a match still`
- Card meta: `Generated` (badge) · `0:15` · `Generated 3 Oct 2026`
- Thumbnail loading (in the box): `Thumbnail loading`
- Fallback line (amber): `Thumbnail from the site’s copy · Supabase did not answer.`
- Last resort: cover word `STUDIO`; cover label `Original typographic art · no thumbnail could be loaded`; amber line `No thumbnail: Supabase and the site’s copy both failed.`
- `Save reference` · `Not saved` · `Saved reference` (existing)
- Filters summary `Find a video` + `4 / 4`; `Subject` — `All subjects` · `Fenway` · `Frankenstein`; `Browse order` — `Beni’s order` · `Newest generated`; `Saved only`
- `Newest uses the date generated, read from the record. Ties follow Beni’s order. Every video here is generated; the Generated label is never filtered away.`
- Order controls (existing): `Shuffle remaining` · `Undo shuffle` · `Restore Beni’s order` · `Beni’s order for the remainder`
- No results: h2 `No videos match.` · `No video is active. Clear filters to browse the gallery.` · `Clear filters`
- List unavailable: h2 `The gallery is unavailable.` · `The server could not read the list of published videos. The cause is unknown from here.` · `Nothing is shown from memory. The site’s fallback thumbnails are keyed to that list, and a video withdrawn since the last deploy must not reappear, so no card is drawn without its record.` · button `Try again`

Watch page:

- `← Gallery` · label `Watch` · `Theater` / `Exit theater`
- Status lines (D5, unchanged): `Nothing is fetched until Play.` · `Sound on · the soundtrack is generated. Mute in the player.` · `Muted · the soundtrack is generated. Unmute in the player.` · `Paused at 0:07 of 0:15.` · `Ended. Replay starts from the beginning.`
- New status lines: `Ended. That was the last video in Beni’s order; nothing loops. Replay starts from the beginning.` · `“<title>” is loaded. This browser needs a press to start it.`
- Countdown: `Up next in <n> s · “<title>”` (n from 5 to 1, text replaced once a second) · button `Cancel` · after Cancel: `Autoplay cancelled. Up next waits for a click.`
- Actions: `Play` · `Pause` · `Replay` · `Retry` · `Next` (recovery only) · `Copy link` · after: `Link copied.` / `Copy failed. The address is in the address bar.`
- Recovery (D5, unchanged), keyed to `MediaError.code`, with `Next opens “<title>”.` or `There is no next video in Beni’s order.`; when autoplay-next is on, one sentence follows: `Autoplay next stopped here. Nothing is skipped past a failure.`
- Meta line: `Generated 3 Oct 2026 · 0:15 · 768 × 480`
- Switch: `Autoplay next` · `On` / `Off`; help: `When a video ends, the next one in Up next starts after a five-second countdown with Cancel. Nothing starts on arrival; the first Play is always yours.`
- `Up next` · `Earlier` · `Nothing after this one in Beni’s order.`; row small line `0:15 · Generated 5 Oct 2026`
- Not found / unpublished: h1 `No published video has this address.` · `The id in the address is not published, or never was. Nothing more is known from here.` · `← Gallery`
- Server unavailable: h1 `The watch page is unavailable.` · `The server could not read this video’s record. The cause is unknown from here.` · `Try again` · `← Gallery`
- Provenance rows under `Source & curation`: `Kickoff Studio · generated <when> · reviewed and kept <when> · published <when> · Beni’s order <n> of <m>` · `Model <endpoint> · pinned <date> · <resolution> · seed <seed> · Prompt expansion ran · <mode>` · `Fictional players. Fenway and Frankenstein are cats. No real club, player, kit, crest, sponsor or competition is depicted or intended. Policy v<n> · fictionalOnly true · checklist walked by <who> <when>.` · `Regeneration of <parent id> (<outcome> <date>).` or `First generation; no parent.` · `File video/mp4 · <duration> s · <w> × <h> · SHA-256 <8 hex>…<4 hex>` · `Soundtrack AAC stereo, generated with the picture.` · **`Hosted clip. Supabase Storage serves the file and sees each play; it is named on the Privacy page. There is no outside page for a generated clip.`** · `Opening a video does not mark it watched.` · eyebrow `Prompt, as submitted` then the prompt in quotation marks.

Privacy & terms (`/privacy`):

- Eyebrow `Kickoff · Privacy` · h1 `What this site stores, and who sees a visit.`
- `Kickoff has no accounts, no analytics, no beacons and no tracking code. Its pages come from a server that reads the Moments gallery from a database; your browser never talks to that database. This page lists everything the site stores in your browser and every third party a visit reaches. Read from the code on 2026-10-12.`
- `Stored in your browser` — `Four browser-storage keys. No cookies.` — `kickoff-theme — Your light or dark choice.` — `kickoff-theme-broadcast — The theme choice kept for the Broadcast lens.` — `kickoff-moments-saved-v1 — The Moment references you saved.` — `kickoff-moments-autoplay-v1 — Your Autoplay next choice on the watch page.` (only if Q17 = Key; otherwise `Three browser-storage keys.` and no fourth line) — `Clearing site data in your browser removes all of it. Nothing is stored anywhere else.`
- `Who sees a visit` — `Vercel serves the site and sees each request, as any web host does. Its server reads the gallery and each watch page from the database on your behalf; your browser never connects to the database.` — `Supabase stores the published videos and their thumbnails and serves them to your browser directly, so it sees each thumbnail load and each play: the address requested and your IP address, as any file host does. The gallery’s list reaches you through this site’s server, not from Supabase.` — `Google Fonts (fonts.googleapis.com, fonts.gstatic.com) serves the typefaces unless your browser already has them cached, so Google can see visits.`
- `Fallback thumbnails` — `A copy of each thumbnail is shipped with the site and served by Vercel when Supabase does not answer. No new party.`
- `Terms of use` (`#terms`, Q15) — `Kickoff is a personal, non-commercial reference site, offered as it is, without warranty. Its videos are generated in Kickoff Studio and depict fictional players; no real club, player, kit, crest, sponsor or competition is depicted or intended.`
- `Changes` — `This page is dated and lives in the repository. Changes are visible in its history.`
- Stamp `Read from the code on 2026-10-12 · kickoff v0.5.2` (the version then current in `package.json`; ILLUSTRATIVE until the PR that ships the page sets it) · `← Back to Kickoff`

Studio — Publish (replaces Export):

- Tabs `Compose · Jobs · Review · Publish`
- `Publish uploads the clip and its thumbnail to Supabase Storage and marks the record published. The video is live on Kickoff the moment the record is written: no pull request, no merge, no deploy to wait for. The fallback copy of the thumbnail follows by a commit to main, which Vercel deploys.`
- `Kept, not yet published` — columns Asset · Title · File · Thumbnail · Attestation
- `Where it goes` — `Storage` `moments/videos/<assetId>.mp4 · moments/thumbs/<assetId>.jpg — a public bucket, read by address. The addresses are written into the record.` · `Record` `videos.published_at set now · videos.position = last + 1 (Beni’s order). Kickoff’s server reads it through Drizzle; no browser ever does.` · `Fallback copy` `public/thumbs/<assetId>.jpg committed to main from this Mac with Beni’s token; Vercel deploys in about a minute. Until that deploy finishes, a reader whose browser cannot reach Supabase sees the typographic cover, not the thumbnail.`
- `Publication gate · Article 50` — no answer: `Before any generated clip is published, an explicit answer is recorded on whether EU AI Act Article 50 applies to Kickoff, and what disclosure it would need (A-06; source: spec §6 A1). Answer on file: none. Publish stays unavailable until one is recorded.` · reason line (`role="status"`): `Unavailable: the Article 50 answer is not recorded (A-06).` · answer recorded: `Answer on file: recorded <date> · “<the recorded answer, one line, as Beni wrote it>”. Publish is available. The answer is shown, never summarised.`
- `Confirm` — `Uploads the video and the thumbnail first, then writes the record, then commits the fallback copy. The video is live on Kickoff when the record is written. Cancel before the upload leaves nothing behind. If an upload fails, nothing is live: the files that arrived stay in Storage and Publish lists the clip again, reusing them. If the record write fails after the uploads, the same. If the commit fails after the record is written, the video is live without its site copy and is listed under Live · fallback copy missing, with Retry commit.` · buttons `Publish 2 clips` (disabled while the gate has no answer) · `Cancel`
- Steps: `Upload video · 10.0 MB` · `Upload thumbnail · 48 KB` · `Write record` · `Commit fallback copy`; words `done` (pitch) · `running` (ink) · `waiting` (outline) · `failed` (alarm)
- Publishing: `Publishing fen-0007 · 0:41 elapsed · the timer is text, once a second`
- Published: `Live on Kickoff since 13:41 ET · open on Kickoff ↗` — `The job moves from kept to published in the ledger. A clip is published once; Publish never lists it again.`
- Partial, commit failed: `Published; the fallback commit failed. The video is live on Kickoff without its site copy. Retry commit pushes public/thumbs/fen-0007.jpg again; nothing else is repeated.` · pill `Live · fallback copy missing` · button `Retry commit`
- Partial, upload failed: `Not published. The video uploaded; the thumbnail did not. Nothing is live. Publish lists this clip again and reuses the uploaded video.`
- Unpublish: `Unpublish clears published_at on the record. The video leaves the gallery, and its watch page answers “No published video has this address.” the moment the record is written. The files stay in Storage until you delete them below; the fallback copy is removed from the site by a commit, which Vercel deploys. A reader who has the file open keeps it until they leave, and a copy already cached by a browser or an edge may stay readable for a while; Kickoff cannot recall it.` · buttons `Unpublish` · `Unpublish and delete the files` · `Cancel` · after: `Withdrawn 13:52 ET · the job moves from published to withdrawn. Publish does not list a withdrawn clip again (Q21); regenerate with it as parent if a new version is wanted.`

Keyboard (Q13, if Native): one sentence under the player once the element has focus — `Keyboard: the player’s own shortcuts apply while it has focus.`

## 4 · Motion table — no new motion

The budget stays 150 ms ease · 180 ms cubic-bezier(.2,.7,.2,1) · 220 ms ease · the marquee. Receipt H4 reads the computed style of every element on every frame: zero named animations; the only non-zero transitions are the lens segments’ 180 ms token (the app’s `LensSwitcher`), 3 per frame that draws the switcher; everything else 0.

| Candidate | Trigger | If animated | Decision |
| --- | --- | --- | --- |
| Thumbnail appearing | `load` event | none · the `<img>` paints when it arrives | No new motion |
| Thumbnail → fallback → cover | `error` events | none · src swap, then a display swap | No new motion |
| Thumbnail → video at Play | Play | none · display swap (D5) | No new motion |
| Countdown 5 → 1 | `ended`, once a second | none · text replaced; `aria-live="polite"` | No new motion; a timer is text, as the Studio’s elapsed timer is |
| Countdown cancelled | Cancel | none · text swap | No new motion |
| Switch on / off | press | none · fill swap | No new motion |
| Theater enter / exit | press, Escape | none · layout swap (the Cinema’s 220 ms fade was declined in Q7 and is not revived) | No new motion |
| Up next → next video | countdown end | none · the same element gets a new `src`; the h1 and meta re-render | No new motion |
| Publish steps | status | none · word swap; elapsed timer text | No new motion |
| Unpublish steps | status | none | No new motion |
| Hover | pointer | colour shifts only | as the system |

## 5 · Artboards, geometry and measured contrast

Artboards rendered (every frame prints `scrollWidth ≤ width` after measurement): **1** gallery 18 frames `1-<360|390|1000>-<lens>-<L|D>` · **2** card states 8 frames `2-<loading|slot|fallback|last>-<L|D>` (the slot takes a real 768 × 480 frame by drag and drop) · **3** unavailable `3-390-ledger-L`, `3-1000-ledger-D` · **4** watch 18 frames `4-<390|1000>-<ready|playing|paused|ended|error-network|notfound|unavailable>` plus `4-1000-poster-playing`, `4-390-broadcast-paused`, `4-1000-error-decode`, `4-390-error-notsupported` · **5** `5-1000-theater` · **6** autoplay-next 7 frames `6-1000-countdown`, `6-390-countdown` (3 s), `6-1000-cancelled`, `6-1000-refused`, `6-390-refused`, `6-1000-last`, `6-1000-ended-off` · **7** `7-1000-details`, `7-390-details` · **8** `8-shortcuts` · **9** privacy `9-<390|1000>-<L|D>` · **10** `10-publish-gate-none`, `10-publish-gate-yes`, `10-publishing`, `10-published` (dark), `10-partial-commit`, `10-partial-upload` · **11** `11-unpublish`, `11-withdrawn` · **12** `12-jobs` · **13** H1 contrast · H3 accessible names · H4 motion · **14** G, 24 rigs `G-<360|375|390|760|761|887|888|1000>-<lens>`.

Geometry (the app’s cascade from `src/index.css` with D6’s grid; expected is computed by `d6/data.js geo()`, measured is read from each rig’s DOM — the two agree in every rig):

| Width | Gallery | Columns | Card | Thumb (16:10, inside the 1 px borders) | Player box | Picture of a 768 × 480 clip | Theater box |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 360 | 320 | 1 | 320 | 198.8 | 320 × 200 | 320 × 200, bars 0 | 320 × 200 |
| 375 | 335 | 1 | 335 | 208.1 | 335 × 200 | 320 × 200, bars 7.5 each side | 335 × 200 |
| 390 | 350 | 1 | 350 | 217.5 | 350 × 200 | 320 × 200, bars 15 each side | 350 × 200 |
| 760 | 720 | 1 | 720 | 448.8 | 720 × 405 | 648 × 405, bars 36 | 720 × 405 |
| 761 | 721 | 2 | 352.5 | 219.1 | 721 × 405.6 | 648.9 × 405.6, bars 36 | 721 × 405.6 |
| 887 | 847 | 2 | 415.5 | 258.4 | 847 × 476.4 | 762.3 × 476.4, bars 42.4 | 847 × 476.4 |
| 888 | 848 | 2 | 416 | 258.8 | 520 × 292.5 | 468 × 292.5, bars 26 | 848 × 477 |
| 1000 | 960 | 3 | 309.3 | 192.1 | 632 × 355.5 | 568.8 × 355.5, bars 31.6 | 960 × 540 |

The shell foot (A-07) keeps D5’s rects. The watch page’s two-column layout holds from 888 (`minmax(480px, 1fr) 300px`, gap 28), as the stage’s did; the 480 px minimum keeps the player above the 353 px iPad column the R3 review flagged.

Contrast, WCAG relative luminance, light / dark (H1 computes these live from the hex tokens; alpha tokens composited over the theme ground):

| Pair | Light | Dark | Note |
| --- | --- | --- | --- |
| Generated badge · bg text on ink fill | 15.19 | 14.99 | reused (D5); also the `published` pill |
| Ink on surface (card title) | 16.57 | 12.98 | reused |
| Ink-secondary on surface (date, duration, switch Off, withdrawn pill) | 6.54 | 7.40 | reused |
| Ink-secondary on bg (status, countdown, foot) | 6.00 | 8.55 | reused |
| **Floodlight-strong on surface — the card’s fallback line** | 5.65 | 9.71 | NEW use: a data-trust note on a card |
| Floodlight-strong on bg | 5.18 | 11.21 | NEW use |
| Pitch link on bg (foot link, Copy link status) | 4.82 | 7.75 | reused |
| **Switch On · bg text on pitch fill** | 4.82 | 7.75 | NEW use |
| Ink-muted (app value) on surface-alt | 4.52 | 4.68 | app value; the DS mirror’s value would fail — re-sync (D5 §2) |
| Ink on surface-alt (unavailable block, countdown slot) | 13.76 | 11.61 | reused |
| Failed step · bg on accent-strong | 5.12 | 8.98 | reused (cream, not white, as text in light) |
| Floodlight-strong on floodlight-bg (gate banner) | 4.95 | 8.23 | reused |
| Media box vs bg (non-text) | 1.21 | 1.07 | no requirement |

Every text pair clears 4.5 in both themes. No new colour was invented.

## 6 · Recommendations, with reasons

- **Thumbnails lead the card; nothing is counted.** The record’s own frame sets the box (Q22 Record), so a 16:10 clip has no bars on its own card; the player box stays 16:9 with bars because it is one box for every clip and the lens system sizes it. If the 16:9 verification run passes, both become 16:9 and nothing here changes.
- **The fallback chain is said out loud.** Supabase first, the site’s copy second, the typographic cover last; the card says which step it reached, in amber, because that is a statement about data provenance — exactly amber’s one job. The last-resort cover is D5’s STUDIO family with a label that admits the failure.
- **No cards without the list.** When the server cannot read the database, the gallery shows the unavailable block and no fallback cards: the site’s copies are keyed to the list, and after an Unpublish a stale copy could still be on disk until the next deploy. Showing it would publish a withdrawn video. Accepting a stale gallery for a prettier failure is the wrong trade.
- **Uniform grid.** The curated shelf’s magazine lead card goes; a gallery of equal clips is an equal grid, `auto-fill minmax(280px, 1fr)`, one column at ≤ 760.
- **One element, one host; the thumbnail before Play.** The box shows the thumbnail through the same `<img>` chain as the card, swapped for the `<video>` at Play. `poster` stays unset so the three-step fallback governs the before-Play picture.
- **The watch URL — Q20 Query:** `?tab=moments&watch=<id>`, the record’s id, never a title slug. It sits beside `?only=`, `&date=`, `tab` and `lens` and changes none of them; `canonicalSearch` leaves it alone. Opening a watch page pushes history, as a tab change does, so Back returns to the gallery. A path (`/moments/<id>`) would be more YouTube-like but would split the one-URL contract the app already keeps.
- **Autoplay-next — Q16 On, Q17 Key.** Default On because the clips are fifteen seconds, a Cancel sits on every countdown, and nothing ever starts without the reader’s first Play. Remembered under `kickoff-moments-autoplay-v1` because a default-On that forgets Off re-imposes itself on every visit, which is the one nagging combination; the key is listed on the privacy page. If Beni answers Q16 Off, Q17 falls to Visit (in memory, no key) and the privacy page keeps three keys. The countdown is five seconds, text once a second, below the player, `aria-live="polite"`, focus untouched; the toggle sits at the head of Up next because that is the list it acts on.
- **At the end of the list: stop.** No loop. After a media error: stop and show the recovery copy with the extra sentence; a failure is never skipped past. When the reader pauses or leaves, nothing starts; if the tab is hidden at `ended`, the countdown still runs and the browser decides whether the automatic `play()` is allowed. In theater mode the countdown stays below the player, never over it.
- **If the browser refuses the automatic play** (Safari and iOS are the ones to test), the next video is already loaded into the element; the page is on that video, its status line says so, and the primary button is Play. No retry loop.
- **Keyboard — Q13 Native.** Focus moves into the element at Play (the existing sentinel), so the browser’s own shortcuts apply. Zero code, no conflicts, nothing over the picture. Coverage differs by browser and is UNVERIFIED where the table says so.
- **Theater — Q14 Theater.** The Cinema overlay becomes the watch page’s theater mode: one page, one element, a one-column layout at the gallery’s outdent. This also removes the Cinema’s duplicate privacy line and its fixed-position dialog. Escape exits.
- **Terms — Q15 Keep,** two sentences: what the site is, and that its videos are generated and fictional. The YouTube sentences go with the API client. The Article 50 answer, once recorded, may add a sentence here.
- **Spoiler-light — Q18 Remove.** With one kind of record there is nothing for it to hide; a control with no effect is a confident lie about what it does.
- **The fallback copy ships by a commit — Q19 Commit.** Publish commits `public/thumbs/<id>.jpg` to main with Beni’s token and Vercel deploys. The alternative — fetching thumbnails from Supabase at build — would make the build depend on the service the copy exists to survive. The one-minute window is said plainly on the Publish screen.
- **Withdrawn clips are not relisted — Q21 No.** A clip is published once; a withdrawn one is history, like a discarded one. Regenerate with it as parent if a new version is wanted.
- **Likes, comments, subscriptions, view counts:** none, and no placeholder. Kickoff has no accounts and no analytics; a counter would be an invented number.

## 7 · Questions for Beni — one word each, recommendation first

| # | Question | Recommendation | Other answers |
| --- | --- | --- | --- |
| Q13 | Keyboard shortcuts | **Native** — the browser’s controls answer the keys once the element has focus | Page — Kickoff listens at page level (Space/K, J/L, arrows, M, F) with a disclosure listing them |
| Q14 | Floodlights Cinema | **Theater** — becomes the watch page’s theater mode | Overlay — stays the fixed dialog of D5, with its own privacy line |
| Q15 | Terms of use section | **Keep** — two sentences | Drop |
| Q16 | Autoplay-next default | **On** | Off |
| Q17 | Is the toggle remembered | **Key** — `kickoff-moments-autoplay-v1`, listed on the privacy page | Visit — in memory only; three keys stay |
| Q18 | Spoiler-light control | **Remove** | Keep |
| Q19 | How the fallback thumbnail reaches the site | **Commit** — Publish commits it to main | Build — the deploy fetches thumbnails from Storage |
| Q20 | Watch page URL | **Query** — `?tab=moments&watch=<id>` | Path — `/moments/<id>` |
| Q21 | Can a withdrawn clip be relisted by Publish | **No** | Yes |
| Q22 | The card’s thumbnail box | **Record** — the record’s own w × h | Fixed — 16:9 for every card, bars for 16:10 |

## 8 · Accessibility — names and keyboard order

Rules in the markup: the thumbnail link is `aria-hidden="true" tabindex="-1"` so a card has one stop, the title link, whose name is the title; the Save reference button is named `Save reference: <title>` as today; the Saved only checkbox is named by its wrapping label; the switch is `role="switch" aria-checked` with the visible label `Autoplay next` inside it; the countdown slot and every status line are `role="status"` (the recovery panel `role="alert"`); the player box carries `aria-label="Generated clip: <title>"` on the element as in D5; Up next rows are links named by their title; no `tabindex` anywhere else, so keyboard order is DOM order. Receipt H3 counts every button, link, input, select and switch in every frame and the unnamed ones: 0.

Keyboard order on the watch page at 1000, ready state: Fixtures · Table · Moments · the lens radiogroup (one stop) · theme button · ← Gallery · Theater · Play · Copy link · Source & curation (summary) · Autoplay next · each Up next row · each Earlier row · Privacy & terms (last). Play moves focus to the video element (the sentinel pattern); Cancel, when the countdown shows, enters after Copy link in DOM order but focus is never moved to it.

Not verified here: a screen-reader walkthrough; the autoplay policy of each browser; the `aria-live` announcement cadence of a once-a-second text change (polite regions coalesce; the build should confirm one announcement, not five).

## 9 · Server, storage and URL contract

- **Reads.** Next.js on Vercel; the gallery and watch routes read `videos` where `published_at is not null`, ordered by `position`, through Drizzle on the server. No browser connects to Postgres. A read failure renders the unavailable states (§3); the cause is not guessed at.
- **Files.** Supabase Storage, a public bucket: `moments/videos/<assetId>.mp4`, `moments/thumbs/<assetId>.jpg`; the addresses are written into the record at Publish. The `<video>` and `<img>` load them directly, so Supabase sees each play and each thumbnail load (privacy page).
- **Fallback copies.** `public/thumbs/<assetId>.jpg`, committed by Publish (Q19), served by Vercel; used only when the Storage `<img>` fires `error`. No list is derived from them.
- **URL.** `?tab=moments&watch=<id>`; `?only=` and `&date=` untouched; theater is a view state, not a URL state; the lens stays `?lens=`.
- **Storage keys.** Three unchanged; a fourth `kickoff-moments-autoplay-v1` if Q17 = Key.
- **Studio.** Publish: upload video → upload thumbnail → write record (publication) → commit fallback copy. Unpublish: clear `published_at` (withdrawal) → delete files (optional) → commit the removal. Both run from Beni’s Mac with his tokens; both show each step’s word and keep nothing hidden.
- **Validation.** `validate-moments` keeps the schema check at build, offline; the `/ YouTube` rule and `verify-media` are withdrawn.
- **Not verified here:** Supabase’s pause behaviour on the Free plan beyond what its documentation states; whether every browser plays a Storage-served MP4 with Range requests; whether `play()` after `ended` on the same element is allowed without a fresh gesture in Safari and iOS — the build tests these first.

## 10 · Facts refreshed 12 Oct 2026

- Main `f523b52` (the brief’s pin). `src/index.css`, `App.tsx`, `TabNav.tsx`, `LensSwitcher.tsx`, `MomentsPage.tsx`, `MomentCover.tsx`, `StalenessBanner.tsx`, `theme.ts` and `index.html` read at that pin; the shell and the Moments cascade on the canvas are translated from them (inline, per frame, with the lens × theme token derivations as declared).
- `package.json` version 0.5.2; README: 1,490 fixtures.
- D5 spec, check, prompts and build plan copied into `docs/` of this project for reference; they are not D6 outputs and are outside the manifest.
- Manifest: `Kickoff Moments - D6 manifest.sha256` — SHA-256 per file, sorted by path, excluding itself and `github.md`, covering the canvas, this spec and `d6/`. The fingerprint is that file’s own SHA-256; the PM seat pins it.

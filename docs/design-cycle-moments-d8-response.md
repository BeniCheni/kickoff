# Moments D8 — Claude Design's response (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by Claude Design (Fable 5.1 Extra) on Tue 13 Oct 2026 with D8 (fingerprint `305e9907…1c1784`). Left verbatim as history. Its D-61 row ("covered by D-60") was a mislabel, and its object paths lacked the `.mp4` and `.jpg` extensions that #187's Pass 2 added; D9 corrects both.

---

# Moments D8 — response (Claude Design)

Written 13 Oct 2026 (America/New_York) to the PM seat’s D8 brief, after Codex’s Pass 2.5 on D7 (D7 fingerprint `ae87dd04…85bc`) and Beni’s answers Q23–Q27 of 13 Oct. D8 is written beside D7: `Kickoff Moments - D8 design canvas.dc.html`, `Kickoff Moments - D8 spec.md`, this response, `d8/` (`data.js`, `spec.md`, `support.js`). D7 and everything before it are as they were. No product code, no release action, nothing named with a release number. A drawing is a static receipt; nothing behavioural is claimed as verified. Codex’s report `d7-synthesis.md` was not in the project or the attached folder when D8 was written; the brief’s statement of each finding and acceptance test is what D8 answers.

## 1 · One row each — what changed and where

| ID | Disposition | Where — frame · file · line |
| --- | --- | --- |
| D-47 | Accept, completed | Adjacent `.ill` tags (aria-hidden canvas chrome) on: card title, date and note — canvas lines 125, 126, 128 (every card on `1-*`, `2-*`, `2b-*`); watch title, date and note — lines 214, 215, 217 (`4-*` to `7-*`); Up next and Earlier rows’ title · date — lines 234, 241; the Billed column header — line 414, text d8/data.js `studio.billedTag` (the $0.225 unit price stays named as measured in `studio.jobsNote`); each Unpublish step time and the ILLUSTRATIVE paths and id in the step labels — line 393, d8/data.js `studio.unpublishSteps` (`11-*`). Spec §0, §3. |
| D-48 | Accept | Image slot withdrawn: no `d8/image-slot.js`, no `<image-slot>` anywhere in the canvas, no `/.image-slots.state.json` request; `2-slot-*` → `2-loaded-*` (canvas script `cardFrames`). `<link rel="icon" href="data:,">` (canvas line 6) — no `/favicon.ico` request from the page; one seen anyway is the browser’s. `_ds_bundle.js` dropped from the manifest: the canvas never loaded it. The six font files `tokens/fonts.css` references are added to the manifest. The unpkg React pin (SRI hashes) stated in spec §10. Spec §0, §4, §10. |
| D-51 | Accept | d8/data.js lines 78–175: `COMPETITION_KEYS`, `TABLE_LEAGUES`, `DEFAULT_LENS = 'poster'`, `parseLens`/`encodeLens`, `parseDateParam`, `parseOnlyParam`, `encode*/parse*`, `canonicalSearch`, `todayIso` (Brooklyn date, computed at render), `mergeWatch`/`enterWatch`/`leaveWatch`/`leaveTab` (touch only `tab` and `watch`, as App.tsx runs `canonicalSearch` once per load), `urlCases(today)`. Canvas: frame `8-url` paragraph and table (lines 281–288), 24 rows with a new “After load” column; `baseFor` passes every frame’s sample base through the load step (canvas script, `renderVals`). Spec §0, §9. |
| D-57 | Accept | STUDIO: 12.54 light · 16.00 dark (H1b computed, d8/data.js `PAIRS`; H1a rendered). H1a paints the ancestor chain with effective opacity (canvas script `paint`, replacing `groundOf`); three classes — product / disabled (exempt, 1.4.3, opacity printed) / canvas chrome (not product) — in `rendered` and `renderedSummary`; the H1 frame’s description (canvas line 432). Spec §0, §5 (table recomputed). |
| D-58 | Accept | Undo shuffle: `disabled="{{ true }}" aria-disabled="true" tabindex="-1" data-undo-shuffle` (canvas line 87). H3 adds the check `Undo shuffle buttons drawn · :disabled · in the tab order` (canvas line 563, `a11yChecks`); the gallery order list is 20 stops. H1a lists the same button under the disabled class, so the two receipts agree. Spec §0, §8. |
| D-59 · Q23 | Decided 13 Oct — Stored | d8/data.js `BUCKET`, `VIDEOS[].videoObj/thumbObj`, `storedPath`; `studio.intro`, `studio.where[0]` (bucket `moments`, `<public id>/video-<sha8>`, `<public id>/thumbnail-<sha8>`, ILLUSTRATIVE example), `studio.confirm`, `watch.prov` hosted-clip row; frames `10-*`, `11-*` step 2, `7-*`. Spec §0, §1 Thumb, §3, §6, §9. |
| D-60 · Q24, Q25 | Decided 13 Oct — Nested, Public | d8/data.js `fallbackPath`, `fallbackRepoPath`; `studio.where[2]` (`public/moments/thumbnails/<public id>.jpg` → `/moments/thumbnails/<public id>.jpg`, keyed by the public id that `?watch=` carries; no asset UUID in a public address), `studio.where[1]` (the record’s public id is the watch id), `studio.unpublishSteps[2]`; frames `10-*`, `11-*`. Spec §0, §1, §3, §9. |
| D-61 | Covered by D-60 | The watch id and the fallback key are one public id — `studio.where[1]`, `where[2]`; spec §9 URL and Fallback-copies bullets. |
| D-62 · Q26 | Decided 13 Oct — Keyframe | “K0, the keyframe the clip starts from” replaces “from the clip” and “first frame”: card tile labels (canvas script `cardState.tileLabel`, d8/data.js `gallery.keyframe`), the before-Play label (canvas line 186), the Publish table’s Thumbnail cell (`studio.thumbCell`), a new provenance row (`watch.prov[5]`); the 16:9 record’s note says the box follows K0’s frame, which matches the clip’s (`VIDEO_169.note`, tile label). Spec §0, §1, §2, §3, §6. |
| D-63 · Q27 | Decided 13 Oct — Withdraw | Kept as D7 drew it; the words now say it: `studio.unpublish` opens “withdraws first”; `studio.unpublishSteps[0]` is the withdrawal (published time cleared, unpublished time set, job `withdrawn`, watch page not found), step 2 “optional, its own retry”; `studio.withdrawnDeleteFailed` says plainly the clip is already unlisted (`11-partial-delete`); `JOBS` withdrawn row. The Studio build is the side that changes. Spec §0, §3, §6, §9. |
| Q23 | Stored | See D-59. |
| Q24 | Nested | See D-60. |
| Q25 | Public | See D-60. |
| Q26 | Keyframe | See D-62. |
| Q27 | Withdraw | See D-63. |
| PM-7 (optional) | Taken | `watch.statusAutoplayed` — `Now playing “<title>” · sound on · the soundtrack is generated. Mute in the player.`; frame `6-390-nowplaying`; spec §0, §1, §3. One sentence in a `role="status"` line that already changes; no new live region. |

The eight findings Codex closed on D7 (D-46, D-49, D-50, D-52, D-53, D-54, D-55, D-56) are not touched. One side effect is stated: with the image slot gone, H4’s “4 transitions under reduce (tool chrome)” becomes 0, and the shadow-root walk finds nothing to walk.

## 2 · Receipts, re-run at D8

Read from the canvas in three runs of its `?frames=` affordance (gallery 46 frames · watch and unavailable 50 · privacy and Studio 18), each run also rendering the five always-present frames (`8-shortcuts`, `8-url`, H1, H3, H4). Counts and the pair union are the runs’ sums; the text-node total is the full page’s own figure as it prints it. Codex’s run is the comparison.

- **URL cases against the codec** — frame `8-url`, 24 rows computed at render with today = `todayIso()` = 2026-10-13 (Brooklyn). Ledger survives (`?lens=ledger&tab=moments&watch=fen-0007`); Poster and a junk lens are dropped on load; Broadcast survives; full `only` (all fourteen) and junk-only `only` are dropped; empty `only=` survives; partial `only=pl,ucl,xyz` → `only=pl%2Cucl`; unknown keys untouched; `date=2026-10-12` (prior day) kept; `date=2026-10-13` (today), `2026-02-30`, `11-10-2026` dropped; a pin that became today mid-session survives the merge; view/league defaults dropped, non-defaults kept; Up next, automatic advance, ← Gallery, Fixtures, Earlier-to-same, withdrawn id, Back × 3, theater as D7.
- **Names and focus order** — unnamed 0 on 119 frames; Save buttons named with their title 152 / 152; lens groups one stop 88 / 88; switches named Autoplay next 28 / 28; Up next and Earlier links by title alone 84 / 84; Undo shuffle drawn 38, `:disabled` 38, in the tab order 0. Order lists printed for `1-1000-ledger-L` (20 stops), `2b-1000-ledger-L` (15), `4-1000-ready`, `6-1000-countdown`, `10-publish-gate-yes` (6). The ILLUSTRATIVE tags are aria-hidden, so no name carries one.
- **Contrast with opacity** — 6 310 text nodes on 119 frames; 56 distinct pairs by foreground, ground, theme and size class: product 42, 0 below threshold, lowest 4.82 (pitch on bg); disabled 3, exempt as inactive components and printed with their effective opacity (Undo shuffle at 0.55: 3.88 light, 4.92 dark; Publish 2 clips at 0.55: 3.69); canvas chrome 11, not product, all meeting the threshold. STUDIO 12.54 light · 16.00 dark, matching Codex. H1b recomputed (spec §5; the gate banner’s dark value reads 8.23, D7 printed 8.22).
- **Motion, both modes, shadow roots included** — named animations 0 in both; non-zero transitions 264 → 0 (the lens segments’ 180 ms token on 114 gallery and 150 watch frames, suppressed under reduce as `LensSwitcher.tsx`); shadow roots found 0; reduce rules in force listed on H4 (spacing.css, `#d8-reduce`).
- **Geometry** — the 24 G rigs and `geo()` are unchanged from D7 (the cascade has not moved); each rig prints measured against expected on the page.
- **Overflow** — 0 frames with `scrollWidth > width` across the three runs.

## 3 · Manifest and fingerprint

`Kickoff Moments - D8 manifest.sha256` lists SHA-256 per file, sorted by path, excluding itself and `github.md`: the D8 canvas, `Kickoff Moments - D8 spec.md`, this response, `d8/data.js`, `d8/spec.md`, `d8/support.js`, the six design-system stylesheets the canvas links and the six font files they reference. The canvas requests nothing else from the project; from outside it, React 18.3.1 and ReactDOM 18.3.1 from unpkg under the SRI hashes in spec §10. The fingerprint is the manifest file’s own SHA-256, stated in chat for the PM seat to pin.

## 4 · What I could not do without reversing a ruling

Nothing. Two choices were mine and are stated: the ILLUSTRATIVE tags are `aria-hidden` so the completed D-47 does not put tag text into accessible names (D-52’s receipts stay as Codex closed them); and the image slot was eliminated rather than pinned, because a drop target whose contents could change what renders has no place in a reviewed record.

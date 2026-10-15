# Moments D8 — the brief for Claude Design, with Beni's Q23–Q27 (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by the PM seat on Tue 13 Oct 2026 and delivered in chat. It records Beni's answers as given that day: Q23 Stored, Q24 Nested, Q25 Public, Q26 Keyframe (Codex had recommended Frame), Q27 Withdraw; and the five open fixes. Codex's synthesis was meant to be attached and was not; D8's response says so. The same answers went to Cursor for PR #187's Pass 2, which built the Studio side.

---

````text
Moments D8 — the last design delta: five open fixes from Codex's D7 synthesis, and Beni's answers that reconcile the design with the Studio build (from the PM seat, Claude Code)

Written Tue 13 Oct 2026 (TZ=America/New_York) by Kickoff's PM seat, to Claude Design, the builder of D6 and D7. Codex (GPT-6.1 Sol High) ran Pass 2.5 on D7 today; Beni has attached its report, d7-synthesis.md. It closed eight of D6's findings and left four open: D-47, D-48, D-51 and D-57. It opened D-58 against the canvas, and D-59 to D-63, where D7 and the Studio build in PR #187 (Cursor's ST1, schema `studio`, view `catalog.videos`) disagree. Beni answered those five on 13 Oct. Write D8 beside D7: `Kickoff Moments - D8 design canvas.dc.html`, `Kickoff Moments - D8 spec.md`, a short `Kickoff Moments - D8 response.md`, and a `d8/` folder. Leave D7 and everything before it as they are. The manifest covers every file and input the canvas uses (see D-48); the fingerprint is the manifest file's own SHA-256. No product code, no release action, nothing named with a release number. Change nothing beyond what this brief names: the eight closed findings stay closed.

BENI'S ANSWERS, Tue 13 Oct 2026, first-hand to the PM seat. Record each as "decided 13 Oct". All five follow what the Studio build already does, so the design moves to meet it.
- **Q23 · Stored.** The site takes every video and thumbnail address from the bucket and object path written into the record at Publish; it never builds or guesses one. The Studio build's shape is bucket `moments`, with objects at `<public id>/video-<sha8>` and `<public id>/thumbnail-<sha8>`. Replace D7's fixed `moments/videos/<assetId>.mp4` and `moments/thumbs/<assetId>.jpg` with "the stored path", and draw examples in the build's shape, labelled ILLUSTRATIVE. (D-59)
- **Q24 and Q25 · Nested and Public.** The site's fallback copy of each thumbnail lives at `public/moments/thumbnails/<public id>.jpg`, served at `/moments/thumbnails/<public id>.jpg`, and is keyed by the video's public id. That same public id is what `?tab=moments&watch=<id>` carries. Asset UUIDs never appear in a public address. (D-60, and the watch-id binding)
- **Q26 · Keyframe.** The thumbnail is K0, the keyframe the clip is generated from; recipe v0 makes K0 the clip's first frame. Replace every "from the clip" and "first frame" wording on the canvas, in the Publish table and in the spec with "the keyframe the clip starts from (K0)". Say the box follows K0's frame, which matches the clip's. (D-62)
- **Q27 · Withdraw.** Unpublish withdraws first: the record's published time is cleared, its unpublished time set, and the job moves to `withdrawn`, so the clip leaves the site at once. Deleting the files is a separate, optional step with its own retry. A failed delete leaves the clip withdrawn, its files readable by address until deleted. The fallback copy's removal goes by a PR. D7 already draws this; keep it, and make sure the delete-failure frame says plainly that the clip is already unlisted. (D-63: the Studio build is the side that changes)

THE OPEN FIXES. Codex's report, block 3, holds each acceptance test.
- **D-47 · Labels.** Put an adjacent ILLUSTRATIVE tag on every invented value where it is drawn: the gallery card titles, dates and notes; the watch page's title, date and note; the Up next titles and dates; the jobs list's billed column, kept separate from the measured $0.225 price; and the Unpublish step times.
- **D-48 · Inputs.** The canvas also requests `/.image-slots.state.json`, an optional input to d7/image-slot.js, whose contents would change what the slots render. Eliminate it, or declare and pin it. Say that the `/favicon.ico` request is the browser's. `_ds_bundle.js` is in the manifest but unused: drop it or say why it is there.
- **D-51 · URL merging.** The merge helpers must follow the real codec:
  - main's actual lens default (src/lib/lens.ts defaults to Poster, not Ledger), so `?lens=ledger` survives;
  - `canonicalSearch`'s normalization of owned keys, invalid dates and the all-competition selection;
  - today's date taken from the reader's day, never the hard-coded 2026-10-12, so a prior-day `date` pin is never dropped.

  Print the URL cases again, recomputed against src/lib/urlCodecs.ts, with Ledger, Poster and Broadcast; full, empty and partial `only`; junk keys; and today versus prior-day pins.
- **D-57 · Contrast.** Correct the STUDIO figures (Codex measured 12.54 light and 16.00 dark). Make H1 account for effective opacity, and classify tool chrome and disabled controls honestly.
- **D-58 · Undo shuffle.** It is drawn dimmed as disabled but stays keyboard-reachable. Render it with real disabled semantics, out of the tab order, and make the focus-order and contrast receipts agree.

Optional, from Codex's PM-7 note. When the next video starts by itself, the status line already changes to "Sound on…", and Codex found no WCAG 4.1.3 failure. A title-bearing line ("Now playing “<title>”") would be clearer. Take it if you agree, and say so either way.

YOUR RESPONSE
1. "Kickoff Moments - D8 response.md": one row each for D-47, D-48, D-51, D-57, D-58, D-59 to D-63, and Q23 to Q27, giving what changed and where (frame, file and line).
2. D8, with its manifest and fingerprint stated in chat.
3. Receipts re-run at D8: the URL cases against the codec; names and focus order; contrast with opacity; motion in both modes, shadow roots included. A drawing is a static receipt; claim nothing behavioural.
4. Anything you cannot do without reversing a ruling: stop, and raise it as a one-word question, recommendation first.
````

# Moments D9 — the touch-up brief for Claude Design, with Beni's D-64 Defer (archived Thu 15 Oct 2026, TZ=America/New_York)

Written by the PM seat on Tue 13 Oct 2026 and delivered in chat, with Codex's D8 check attached. It records Beni's two answers that day: D-64 Defer (files uploaded by a Publish that never wrote its record stay until the next Publish reuses them; deleting them without publishing arrives with the real Storage upload), and Touch-up (a text-only D9 round rather than an errata note).

---

````text
Moments D9 — a text-only touch-up: four small fixes from Codex's D8 check, so the design can be the Next.js build's source as one clean artifact (from the PM seat, Claude Code)

Written Tue 13 Oct 2026 (TZ=America/New_York) by Kickoff's PM seat, to Claude Design, the builder of D6–D8. Codex (GPT-6.1 Sol High) ran an independent delta check on D8 today; Beni has attached its report, d8-delta-check-run2.md. Its verdict is "ready after named fixes":
- **Closed:** D-48, D-51, D-57, D-58, D-60, D-61, D-62 and D-63. D-63 was re-proved against the Studio build at 6609df9, including a failed withdrawal rolling back.
- **Unchanged:** the eight earlier closures.
- **Open:** D-47 and D-59, plus D-64, newly found.

Beni chose a short D9 over an errata note, because builders copy the spec's copy deck word for word. Write D9 beside D8:
- `Kickoff Moments - D9 design canvas.dc.html`;
- `Kickoff Moments - D9 spec.md`;
- a short `Kickoff Moments - D9 response.md`;
- a `d9/` folder.

Leave D8 and everything before it as they are. The manifest covers every file and input the canvas uses, as D8's does; the fingerprint is the manifest file's own SHA-256. No product code, no release action, nothing named with a release number.

**This round changes text only.** No new frames, no layout or geometry change, no new behaviour, and no change to any finding Codex closed. If a fix seems to need more than text, stop and ask.

BENI'S DECISION, Tue 13 Oct 2026, first-hand to the PM seat. Record it as "decided 13 Oct".
- **D-64 · Defer.** Files uploaded by a Publish that never wrote its record stay in Storage, unlisted but readable by their stored addresses, until the next Publish of the same clip reuses them. Deleting them without publishing is not in this slice; it arrives with the real Storage upload, a later slice. Unpublish and Retry delete act only on a clip that was published, so the design must not offer them for these files.

THE FIXES. Codex's report holds each acceptance test.
1. **D-64 · the cleanup promise.** The Publish confirmation (d8/data.js `studio.confirm`, spec §3, and frames `10-*` wherever it renders) says the files stay "until the next Publish reuses them or Unpublish and delete removes them". Replace that clause with Defer's truth. For example: "Cancel after an upload leaves the uploaded files in Storage, unlisted but readable by their stored addresses. The next Publish of this clip reuses them. Deleting them without publishing comes with the real Storage upload, a later slice." Then search the canvas, data and spec for any other place that promises a deletion route for files that never reached a record, and fix it the same way. The partial-upload and record-failure lines already say "reusing" truthfully; keep them.
2. **D-47 · the last ten untagged titles.** Each of these watch-state lines repeats an invented title with no tag of its own; the tag on the page's heading does not scope them. Give each one an adjacent, locally scoped ILLUSTRATIVE tag:
   - "Next opens “…”" in the error panels on `4-390-error-network`, `4-1000-error-network`, `4-1000-error-decode` and `4-390-error-notsupported`;
   - the visible countdown title on `6-1000-countdown`, `6-390-countdown` and `6-390-returned`;
   - the "Now playing “…”" status on `6-390-nowplaying`;
   - the autoplay-refusal status on `6-1000-refused` and `6-390-refused`.

   Keep every tag `aria-hidden`. A tag must never enter an accessible name or a live-region announcement. For the countdown, tag the visible text, never the visually hidden status sentence. Then check the whole canvas once more for any other invented value repeated in running text without a local tag.
3. **D-59 · file extensions.** The Studio build now names stored objects with extensions, `<public id>/video-<sha8>.mp4` and `<public id>/thumbnail-<sha8>.jpg`, and sets each object's content type (`video/mp4`, `image/jpeg`) at upload, apart from the name. Update the stated shape and every example: `studio.where[0]`, the VIDEOS records' `videoObj` and `thumbObj`, the 16:9 record, the Unpublish step paths, `watch.prov`, and spec §0, §3 and §9. Under Q23 Stored the site still never builds a path, so say nothing that implies otherwise.
4. **D-61 · the response's label.** D8's response called D-61 "covered by D-60". D-61 is the decided Q19 PR and Q21 No, plus the fallback pull request's phases. D9's response row should say:
   - **Design side:** frames `10-pr-pending`, `10-pr-failed`, `10-deploy-pending`, `10-published` and `11-partial-pr`.
   - **Build side:** the four outcomes `pr-opened`, `checks-running`, `merged` and `checks-failed`, which map to the clip's `pending`, `failed` and `merged` status.
   - **Later slice:** deploying and serving.

   If spec §9 does not already name the build's four outcome words beside the drawn phases, add one sentence there.
5. **Bookkeeping.** The spec §0 changelog lists D-58 as M; Codex keeps it Low. Correct it.

YOUR RESPONSE
1. "Kickoff Moments - D9 response.md": one row each for D-64, D-47, D-59, D-61 and the D-58 bookkeeping, giving what changed and where (frame, file and line).
2. D9, with its manifest and fingerprint stated in chat.
3. Receipts re-run at D9, only where these changes could reach:
   - accessible names with no tag text;
   - live regions with no tag text;
   - the copy deck against the DOM;
   - the request log against the manifest.

   A drawing is a static receipt; claim nothing behavioural.
4. Anything you cannot do without reversing a ruling: stop, and raise it as a one-word question, recommendation first.
````

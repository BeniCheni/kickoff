# Moments slice 3 — builder verification receipt

This is implementation evidence for the independent Pass 1 review, not approval or release
proof. Production curation remains `[]`. A reader of the live site sees the existing
floodlight banner and “No moments curated yet.” The header still reads V0.5.2. The isolated
development harness shows the player and Cinema against the archival examples. Those examples
are not a production edition, and the mock makes no media-provider request.

## Browser and execution

Google Chrome **154.0.8037.58**, driven by Playwright 1.62.1 (`playwright-core`), headless,
device scale 1, reduced-motion preference. No dependency was added. Runtime:

- Playwright: `/Users/benicheni/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs`
- Chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`

The player matrix used the dev server at `http://localhost:5174` (loopback only). Each cell
set its viewport before `goto`. The mock iframe is `about:blank` and does not paint a picture,
so the typographic cover remains visible inside the measured box. Provider hosts were aborted.
The request log is Google Fonts only.

## Receipt 1 — inert production path

[check-browser.mjs](../moments-foundation/check-browser.mjs) compared a fresh build of the
merge base `8cb9d87c531ffce3c609f98e0da557c26027d432` (served at `http://127.0.0.1:8853`) with
a fresh build of this tip (`http://127.0.0.1:8854`). The two builds share one data snapshot.
Clock fixed at `2026-09-27T02:40:00Z`. 3 lenses × 2 themes × 3 tabs × widths 360/375/390/1000.

[Machine receipt](inert-receipt.json): **72/72 identical body text**, **72/72 identical PNGs**
(advisory), 144/144 loads with `scrollWidth === innerWidth` and zero `iframe`/`video`/`audio`,
zero page errors, zero media-provider requests. Google Fonts: **317 base + 317 tip = 634**
(146 `fonts.googleapis.com`, 488 `fonts.gstatic.com`).

## Receipt 2 — player matrix

[check-player.mjs](check-player.mjs) against the harness mock. 15 widths × 6 lens/theme cells
× stage and Cinema × 7 playback states = **1260 cells**, then 290 journey checks.
[Machine receipt](player-receipt.json). Per-cell boxes are in [cells.json](cells.json).

Every cell: `scrollWidth === innerWidth`, at most one iframe, zero provider requests, the
host (or the anchor, when ready) inside its column and disjoint from the queue, and every
queue row hit at 5, 50 and 95 percent of its width. Ready cells have no iframe. Widths through
887px are stacked. From 888px the stage and Cinema columns sit side by side and the measured
box is at least 480 × 270. At 360, 375 and 390 the anchor and host are full content width and
at least 200px tall (360 ledger light playing: **320 × 200**), and the list is below the box.
Cinema’s frame stays within 1440px. The 780px shell stays within 780px.

Journey counts: scroll 12, gallery lead 2, lens switch 30, gallery return 30, tab away 30,
playing at position 0 then Cinema and back 6, keyboard 12, D-15 12, D-17 120, H-B 36.
Google Fonts on this run: **6450** (1602 `fonts.googleapis.com`, 4848 `fonts.gstatic.com`).
Media-provider requests: 0. Page errors: 0.

Scroll, after `scrollTo(0, 280)`, host against anchor. Every 360 and 390 lens/theme cell,
stage playing: delta **0, 0, 0, 0** (x, y, width, height).

D-04, gallery, 360 Broadcast, both themes: the lead title’s right edge is 325, so
`innerWidth - leadTitle.right` is **35**. The title’s left edge is also 35. The title, source
line and primary action all end above 844.

## Captures inspected

Chrome, the runtime above. Stage captures are full-page. Cinema captures are the viewport,
because a full-page shot of a fixed dialog also includes the inert document behind it.

- `360-ledger-light-stage-ready.png` — ready stage, no frame, cover in the box, list below.
- `360-ledger-light-stage-playing.png` — playing, Pause, list below the 200px box.
- `360-broadcast-dark-stage-playing.png` — same stack in Broadcast dark.
- `360-broadcast-light-gallery.png` — gallery lead; the 35px margin above.
- `375-poster-light-stage-playing.png` — Poster light, phone stack.
- `390-broadcast-light-stage-timeout.png` — “Playback not confirmed.”, one Next, Retry.
- `390-ledger-light-cinema-blocked.png` — Cinema, owner-block recovery, Retry beside the source.
- `390-poster-dark-cinema-playing.png` — Cinema viewport, Poster dark.
- `390-poster-light-cinema-playing.png` — Cinema viewport, Poster light.
- `390-ledger-dark-cinema-playing.png` — Cinema viewport, Ledger dark.
- `390-broadcast-dark-cinema-playing.png` — Cinema viewport, Broadcast dark.
- `390-poster-light-cinema-playing-d15.png` — after the lower row, “Stay for the celebration.” and Play are in view.
- `887-poster-light-stage-playing.png` — still stacked.
- `888-poster-light-stage-playing.png` — queue beside the picture.
- `888-broadcast-dark-cinema-playing.png` — Cinema, queue beside the picture.
- `1000-poster-dark-stage-paused.png` — side by side, paused, Play offered again.
- `1440-ledger-light-cinema-ended.png` — Replay, queue beside the picture, content inside 1440.

## Bundle

`npm run build` and `npm run build:single` both succeeded. This command printed nothing:

```sh
rg -n 'moments-player-mock|Moments gallery verification harness|Fictional selection|pkEpLtePJm0|iBuTEywEQ6U|sXAkBsEcXSo|tests/harness' dist dist-single
```

`youtube.com/iframe_api` and `youtube-nocookie.com` each appear once in `dist` and once in
`dist-single`. That string is the real adapter’s default. It is not a request. The inert
network log is the request proof.

## Not verified

Physical devices. Safari and Firefox. Screen-reader speech. Any real provider behaviour,
rights, or playback. Whether the provider letterboxes a 16:10 box. Iframe continuity across
park and return. Browser zoom beyond the listed widths. Android and iOS back. `CloseWatcher`.

## Pass 1 addendum (Claude Code, 29 September 2026)

Everything above is the builder's receipt, left as written. This section is the cold review's,
and it is about what the receipt can and cannot show. The findings, the fixes and the numbers
are in the PR conversation and in `docs/moments-architecture.md`, "Slice 3 review
resolutions".

- Both receipts were re-run on builds made by the review, at the builder's head and again at
  the review's tip. The player matrix reproduced both times: 1260 cells, 290 journeys, zero
  provider requests, zero page errors, 6450 font requests. The inert comparison against
  `8cb9d87` reproduced its text both times, 72 of 72, with 634 font requests. Its first-capture
  PNGs read 72 of 72 at the builder's head and 68 of 72 twice at the review's tip, a different
  four each time; all eight were identical across both builds on two recaptures each, and the
  base build compared with itself read 70 of 72.
- The checker can fail on the 200px floor and on a host moved over the queue. It cannot fail
  on inert: with that step removed it stayed green through every journey.
- "Ready cells have no iframe" is true of the cells, which are fresh loads. It was not true of
  a `ready` selection reached by Next after another had played, until the review's fix.
- The mock carries no ready window and its frame paints nothing. The real adapter was run in
  Chrome against a stub that follows the provider reference, with the provider's hosts
  unresolvable and aborted; nothing reached the provider.
- D-04 above reports 35, which is `innerWidth - leadTitle.right`, a horizontal margin. The
  vertical margin slice 2 reported is unchanged: at 360 Broadcast, both themes, the lead's
  action ends at 779.11, 64.89px above 844.
- Six of the 17 captures differ from a re-run of the script as committed. Five are the Cinema
  captures at 390, which show the dialog at scroll 0 where the script has scrolled it by the
  time it captures. One is glyph rasterisation. PNG hashes were advisory and remain so.


## Pass 2 addendum (Codex, 29 September 2026)

The fresh results and reproducible commands are in [pass2.md](pass2.md), with the compact
[machine summary](pass2.json). Application source `5d68da3`: 719 tests / 51 files;
1260 player cells and 404 journeys, six checker mutations red, restored checker green;
72/72 inert text and advisory PNG comparisons; 35/35 normalized markup/URL comparisons;
180/180 layout comparisons. Mock/inert runs made no provider request. The real adapter's
stub run attempted nine requests, all aborted; zero reached the provider.

Exactly one route wrapper and the header/tab background attributes on Fixtures and Table
were **accepted by Beni, 29 Sep 2026**. Empty Moments independently has the same three
markup differences; his ruling named Fixtures/Table. No fourth difference is covered.
D-04 is vertical: the 360 Broadcast action ends at 779.11, 64.89px above 844, in both themes.
Cinema capture now precedes row scrolling. PNG identity remains advisory. The older sections
above retain the builder's and Pass 1's historical claims; the new checker now proves inert,
AX exclusion, Play→Next cover placement, and capture ordering by failing mutations.

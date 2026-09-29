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

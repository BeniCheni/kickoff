# Browser matrix

A dependency-free check of the running app: every lens, theme and tab, at the widths a review has to cover. It drives the Mac's installed Google Chrome, headless, over the Chrome DevTools Protocol. Node's global `WebSocket` and `child_process` are the whole transport. There is no Playwright, no Puppeteer, and no new package.

`npm test` does not launch Chrome. The unit tests cover the pure parts. The fixture proof is a separate command.

## Serve a build first

The matrix does not start the app. Other worktrees run servers too, so pick a port and check it is free before binding it. `5173` is often the main checkout.

```sh
PORT=4187
lsof -nP -iTCP:$PORT -sTCP:LISTEN && echo "$PORT is taken" && exit 1
npm run build
npx vite preview --port $PORT --strictPort
```

`vite preview` serves `dist/`. Leave it running.

## Run

`--out` is required. It must resolve outside this repo, so screenshots and `report.json` never land in git.

```sh
npm run matrix -- --url http://127.0.0.1:4187 --out "$HOME/kickoff-matrix" --screenshots
```

A narrower pass:

```sh
npm run matrix -- --url http://127.0.0.1:4187 --out "$HOME/kickoff-matrix" --only 390,poster,dark
```

`--only` is a comma-separated AND. Each token must equal a width, lens, theme, tab, state, or the whole cell id (`390-poster-dark-fixtures`).

Chrome is `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` unless you pass `--chrome` or set `CHROME_PATH`. The process gets a temporary user-data directory and is killed on the way out, including when a cell throws.

Exit `0` when every cell passes, `1` when any cell fails, `2` when the command itself is wrong (missing `--out`, Chrome missing, the output directory resolves inside the repo). The last lines are the summary: cells run, passed, and each failure with its reasons. The full receipt is `$OUT/report.json`. Screenshots, when requested, are `$OUT/screenshots/{width}-{lens}-{theme}-{tab}[-{state}].png`.

The default config is 72 cells: ledger, poster and broadcast × light and dark × fixtures, table and moments × 360, 375, 390 and 1000. Phone widths are 844px tall. 1000 is 900px tall. That 1000 is the review's "about 1000".

## What each check means

The viewport is set with `Emulation.setDeviceMetricsOverride` before navigation, and set again immediately before anything is measured or captured.

- **Viewport.** `innerWidth` and `innerHeight` equal the cell. If they do not, later numbers are not about the width you asked for.
- **Page width.** `document.documentElement.scrollWidth === window.innerWidth`. This is the check the review already required. It is not enough on its own: a player can cover a queue and still leave the page no wider than the window.
- **Page errors and console errors.** Uncaught exceptions and `console.error`. A failed font from `fonts.googleapis.com` or `fonts.gstatic.com` is recorded under `ignored` and does not fail the cell, because `index.html` asks for those. The same goes for the console line Chrome emits when this runner blocks a media-provider request: the classification is the failure.
- **Network.** Every request is classified by host.
  - **app** — the page's own host, or loopback.
  - **fonts** — `fonts.googleapis.com` and `fonts.gstatic.com`. Reported, not a failure.
  - **media-provider** — `youtube.com` (and subdomains), `youtube-nocookie.com`, `ytimg.com`, `googlevideo.com`. A failure unless the cell sets `playIntent`. Those requests are failed in Chrome before they are sent, and a failed request still counts.
  - **other-external** — anything else. Reported, not a failure.
- **Embeds.** The count of `iframe` plus `video` elements. The default ceiling is 1 (`maxEmbeds` on the config or the slice).
- **Theme.** Before the document loads, the runner writes the same `localStorage` key a visitor's toggle writes: `kickoff-theme`, or `kickoff-theme-broadcast` when the lens is Broadcast. Broadcast defaults to dark when that key is empty; the cell always writes the theme it is testing so a previous cell cannot leak. If the page sets `data-theme` or `data-lens`, those have to match the cell.
- **Media queries.** `prefers-color-scheme` follows the cell theme unless the slice sets `colorScheme`. `prefers-reduced-motion` is `reduce` in the default config so the lens cross-fade is not mid-way through a shot. A slice can set `reducedMotion: 'no-preference'`.
- **Geometry.** Only when the cell lists it. `inside` means every match of `a` has its border box within some match of `b`. `disjoint` means `a` does not overlap any match of `b`. A missing selector fails closed. One CSS pixel of slack absorbs subpixel edges; an overhang of tens of pixels does not.
- **Hit-test.** Only when the cell lists a selector. Each match is scrolled into view. `elementFromPoint` is checked at the centre and at two inset points, and the hit has to be that element or something inside it. This is the check that catches a player painted over a queue of buttons.
- **Screenshot.** Optional, `--screenshots`. Taken after the checks, with the viewport set again first.

The report's `identity` is written once: git HEAD, the SHA-256 of the served `index.html`, the base URL, the Chrome version, the Node version, and the ISO time.

## Positive control

Page width once passed while a player 91px wider than its column covered a queue (D-06). `tests/fixtures/matrix/` is a pair of static pages, plus a page that requests `i.ytimg.com`. The bad page sizes a player with `min-height` and `aspect-ratio: 16/9` so it overruns its grid column at 768 and 1000 and covers the buttons, without making the document wider than the window. The good page keeps the same minimum and ratio and constrains the width to the column.

```sh
npm run matrix:prove -- --out "$HOME/kickoff-matrix-prove"
```

This serves the fixtures itself. It does not use `vite preview` and it does not load the app. It must fail the bad page at 768 and 1000 on both geometry and hit-test, pass the good page, and flag the media host. If a check cannot catch that, the command exits non-zero. It is not part of `npm test`.

## Adding Moments cells

`momentsStateExample` in `scripts/matrix/defaultConfig.ts` is not part of the 72. Cinema is not in the app yet, and the selectors in that object match nothing today. When a later slice has a real state, append a slice (or that example, with the real selectors) and give it a `state` slug so the file name stays distinct:

```ts
import { defaultConfig, momentsStateExample } from './defaultConfig'

export const config = {
  maxEmbeds: 1,
  slices: [
    ...defaultConfig.slices,
    {
      ...momentsStateExample,
      // Replace the placeholder selectors with the controls that slice actually renders.
      actions: [
        { click: '[data-open-cinema]' },
        { waitFor: '[data-cinema]' },
      ],
    },
  ],
}
```

Actions are `{click: selector}`, `{key: 'Escape' | 'Tab' | 'Enter' | 'Space' | arrows | 'Home' | 'End' | 'Backspace'}`, `{waitFor: selector}` and `{waitMs: n}` (at most 30 seconds). Widths on the example are the ones Moments adds: 768, 1100, 1250, 1440 and 1920.

Run it with `--config path/to/config.ts` (a module that exports `config` or a default) or a JSON file of the same shape. Set `playIntent: true` only on a cell that is supposed to contact a media host. Leave it false and a YouTube or ytimg request fails the cell.

## What this cannot prove

It does not prove real screen-reader output, Safari, physical phones, visual quality, or provider rights. A green cell means the measured checks passed in this Chrome, at these CSS pixels, against the build you served.
